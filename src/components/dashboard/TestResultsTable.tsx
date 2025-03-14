import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Import icon dari lucide-react
import { Gauge, Building2, CalendarArrowDown } from "lucide-react";

const TestResultsTable = ({
  category,
  userId,
  test_name,
  onViewDetail
}: {
  category: string;
  userId: string;
  test_name: string;
  onViewDetail: (id: string) => void;
}) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Menyimpan nama & tanggal lahir dari tabel profiles
  const [userNames, setUserNames] = useState<{ [key: string]: string | null }>({});
  const [userBirthDates, setUserBirthDates] = useState<{ [key: string]: string | null }>({});

  const { user } = useAuth();
  const isAdmin = user?.is_admin === true;
  const isProfessional = user?.account_type === "professional";

  // State untuk pencarian dan filter
  const [searchTerm, setSearchTerm] = useState("");
  const [resultFilter, setResultFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("all");

  // Filter tanggal periode
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [dateStartFilter, setDateStartFilter] = useState("");
  const [dateEndFilter, setDateEndFilter] = useState("");
  const [isSingleDay, setIsSingleDay] = useState(false);

  // State untuk bulk delete (khusus admin allData)
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [paginatedResults, setPaginatedResults] = useState<any[]>([]);

  useEffect(() => {
    if (!test_name) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("test_results")
          .select(
            "id, user_id, test_id, result_summary, created_at, anonymous_name, for_other, other_person_name, notes, anonymous_birthdate, city"
          )
          .eq("test_id", test_name)
          .order("created_at", { ascending: false });

        // Kondisi untuk tab "tes diri"
        if (category === "self") {
          query = query.eq("user_id", userId).is("other_person_name", null);
        }
        // Kondisi untuk tab "tes orang lain" (jika akun professional)
        if (category === "others" && isProfessional) {
          query = query.eq("user_id", userId).not("other_person_name", "is", null);
        }

        const { data, error } = await query;
        if (error) throw error;

        setTestResults(data || []);
        setFilteredResults(data || []);

        // Ambil data user dari tabel profiles
        const userIds = [...new Set(data?.map((row) => row.user_id).filter(Boolean))];
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("profiles")
            .select("id, full_name, birth_date")
            .in("id", userIds);

          if (usersError) throw usersError;

          const namesMap = Object.fromEntries(usersData.map((u) => [u.id, u.full_name]));
          const birthDatesMap = Object.fromEntries(usersData.map((u) => [u.id, u.birth_date]));

          setUserNames(namesMap);
          setUserBirthDates(birthDatesMap);
        }
      } catch (err) {
        console.error("Error fetching test results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, test_name, userId, isProfessional]);

  // Filtering logic
  useEffect(() => {
    let results = [...testResults];

    // Filter pencarian (nama, catatan, kota)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter((row) => {
        const name = getNameTextOnly(row).toLowerCase();
        const notes = (row.notes || "").toLowerCase();
        const cityMatch = (row.city || "").toLowerCase();
        return name.includes(term) || notes.includes(term) || cityMatch.includes(term);
      });
    }

    // Filter hasil tes (srq, sas-sv, sdq) jika != "all"
    if (resultFilter !== "all") {
      if (test_name === "srq" || test_name === "sas-sv") {
        results = results.filter((row) => {
          const { level } = parseResultSummary(row.result_summary);
          return level.toLowerCase().includes(resultFilter.toLowerCase());
        });
      } else if (test_name === "sdq") {
        results = results.filter((row) => {
          const { difficultyLevel } = parseSDQResult(row.result_summary);
          return difficultyLevel.toLowerCase().includes(resultFilter.toLowerCase());
        });
      }
    }

    // Filter kota hanya untuk tab "allData" (admin)
    if (category === "allData" && cityFilter !== "all") {
      results = results.filter((row) => (row.city || "").toLowerCase() === cityFilter.toLowerCase());
    }

    // Filter tanggal (periode)
    if (dateStartFilter || dateEndFilter) {
      results = results.filter((row) => {
        if (!row.created_at) return false;
        const rowDate = new Date(row.created_at.slice(0, 10));
        let valid = true;
        if (dateStartFilter) {
          const startDate = new Date(dateStartFilter);
          valid = valid && rowDate >= startDate;
        }
        if (dateEndFilter) {
          const endDate = new Date(dateEndFilter);
          valid = valid && rowDate <= endDate;
        }
        return valid;
      });
    }

    setFilteredResults(results);
    setCurrentPage(1);
  }, [
    searchTerm,
    resultFilter,
    cityFilter,
    dateStartFilter,
    dateEndFilter,
    testResults,
    test_name,
    category
  ]);

  // Pagination logic
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedResults(filteredResults.slice(startIndex, endIndex));
  }, [filteredResults, currentPage, itemsPerPage]);

  // Bulk delete
  const handleDeleteSelected = async () => {
    if (!selectedItems.length) {
      toast.error("Pilih minimal satu item untuk dihapus");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedItems.length} hasil tes?`)) {
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("test_results")
        .delete()
        .in("id", selectedItems);
      if (error) throw error;
      toast.success(`${selectedItems.length} hasil tes berhasil dihapus`);

      setTestResults((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
      setFilteredResults((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    } catch (err) {
      console.error("Error deleting test results:", err);
      toast.error("Gagal menghapus hasil tes");
    } finally {
      setLoading(false);
    }
  };

  // Helpers
  const parseResultSummary = (summary: string) => {
    if (!summary) return { level: "-", interpretation: "-" };
    const match = summary.match(/Level[:\s]*(.*?)\s*-\s*(.*)/i);
    return {
      level: match ? match[1] : "-",
      interpretation: match ? match[2] : "-"
    };
  };

  const parseSDQResult = (summary: string) => {
    try {
      if (typeof summary !== "string") {
        return { age: "-", difficultyLevel: "-", strengthLevel: "-" };
      }
      const result = JSON.parse(summary);
      return {
        age: result.age || "-",
        difficultyLevel: result.difficultyLevel || "-",
        strengthLevel: result.strengthLevel || "-"
      };
    } catch {
      return { age: "-", difficultyLevel: "-", strengthLevel: "-" };
    }
  };

  const getNameTextOnly = (row: any) => {
    if (row.for_other && row.other_person_name) {
      return row.other_person_name;
    }
    if (row.anonymous_name) {
      return row.anonymous_name;
    }
    if (userNames[row.user_id] && !row.for_other) {
      return userNames[row.user_id] as string;
    }
    return "-";
  };

  const getBirthDate = (row: any) => {
    // Jika anonymous_birthdate ada, gunakan itu, jika tidak, fallback ke birth_date dari profiles
    const date = row.anonymous_birthdate || userBirthDates[row.user_id];
    return date ? date.slice(0, 10) : "-";
  };

  const getNameDisplay = (row: any) => {
    return row.for_other && row.other_person_name ? (
      <span className="text-blue-500 font-semibold">{row.other_person_name}</span>
    ) : row.anonymous_name ? (
      <span className="text-gray-500 font-semibold">{row.anonymous_name}</span>
    ) : userNames[row.user_id] ? (
      <span className="text-green-500 font-semibold">{userNames[row.user_id]}</span>
    ) : (
      <span className="text-gray-400">-</span>
    );
  };

  const getNameTextColor = (row: any): [number, number, number] => {
    if (row.for_other && row.other_person_name) {
      return [0, 0, 255]; // Biru
    }
    if (row.anonymous_name) {
      return [128, 128, 128]; // Abu-abu
    }
    if (userNames[row.user_id]) {
      return [0, 128, 0]; // Hijau
    }
    return [128, 128, 128];
  };

  // Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Hasil Tes: ${test_name || "Hasil Tes"}`, 10, 10);

    const isSpecialTest = ["srq", "sas-sv"].includes(test_name);
    const isSDQTest = test_name === "sdq";

    let tableHead: any[] = [];
    let tableBody: any[] = [];

    // Header & Body menyesuaikan apakah menampilkan kolom Tanggal Lahir
    if (isSpecialTest) {
      tableHead = [
        [
          "No",
          "Nama",
          "Hasil",
          "Interpretasi",
          "Catatan",
          ...(category !== "self" ? ["Tanggal Lahir"] : []),
          "Tanggal"
        ]
      ];
      tableBody = filteredResults.map((row, index) => {
        const { level, interpretation } = parseResultSummary(row.result_summary);
        return [
          index + 1,
          getNameTextOnly(row),
          level,
          interpretation,
          row.notes || "-",
          ...(category !== "self" ? [getBirthDate(row)] : []),
          row.created_at?.slice(0, 10) || "-"
        ];
      });
    } else if (isSDQTest) {
      tableHead = [
        [
          "No",
          "Nama",
          "Age",
          "Difficulty Level",
          "Strength Level",
          "Catatan",
          ...(category !== "self" ? ["Tanggal Lahir"] : []),
          "Tanggal"
        ]
      ];
      tableBody = filteredResults.map((row, index) => {
        const { age, difficultyLevel, strengthLevel } = parseSDQResult(row.result_summary);
        return [
          index + 1,
          getNameTextOnly(row),
          age,
          difficultyLevel,
          strengthLevel,
          row.notes || "-",
          ...(category !== "self" ? [getBirthDate(row)] : []),
          row.created_at?.slice(0, 10) || "-"
        ];
      });
    } else {
      tableHead = [
        [
          "No",
          "Nama",
          "Hasil",
          "Catatan",
          ...(category !== "self" ? ["Tanggal Lahir"] : []),
          "Tanggal"
        ]
      ];
      tableBody = filteredResults.map((row, index) => [
        index + 1,
        getNameTextOnly(row),
        row.result_summary || "-",
        row.notes || "-",
        ...(category !== "self" ? [getBirthDate(row)] : []),
        row.created_at?.slice(0, 10) || "-"
      ]);
    }

    autoTable(doc, {
      startY: 20,
      head: tableHead,
      body: tableBody,
      didParseCell: (data) => {
        if (data.column.index === 1 && data.row.index !== undefined) {
          const row = filteredResults[data.row.index];
          const textColor = getNameTextColor(row);
          doc.setTextColor(...textColor);
        } else {
          doc.setTextColor(0, 0, 0);
        }
      }
    });

    doc.save(`Hasil_Tes_${test_name || "Hasil_Tes"}.pdf`);
  };

  // Dropdown Options
  const getUniqueFilterOptions = (field: "city" | "result") => {
    if (field === "city") {
      return [...new Set(testResults.map((r) => r.city).filter(Boolean))];
    }
    if (field === "result") {
      if (test_name === "srq" || test_name === "sas-sv") {
        return [...new Set(
          testResults.map((r) => {
            const { level } = parseResultSummary(r.result_summary);
            return level;
          }).filter(Boolean)
        )];
      }
      if (test_name === "sdq") {
        return [...new Set(
          testResults.map((r) => {
            const { difficultyLevel } = parseSDQResult(r.result_summary);
            return difficultyLevel;
          }).filter(Boolean)
        )];
      }
    }
    return [];
  };

  // Checkbox logic
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredResults.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, id]);
    } else {
      setSelectedItems((prev) => prev.filter((item) => item !== id));
    }
  };

  const isSpecialTest = ["srq", "sas-sv"].includes(test_name);
  const isSDQTest = test_name === "sdq";

  const testAliases: Record<string, { name: string }> = {
    srq: { name: "Self-Reporting Questionnaire" },
    sdq: { name: "Strengths and Difficulties Questionnaire" },
    bfi: { name: "Big Five Inventory" },
    "sas-sv": { name: "Smartphone Addiction Scale - Short Version" },
  };

  const cityOptions = getUniqueFilterOptions("city");
  const resultOptions = getUniqueFilterOptions("result");
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      items.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = Math.min(maxVisiblePages - 1, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - (maxVisiblePages - 2));
      }

      if (startPage > 2) {
        items.push("ellipsis-start");
      }

      for (let i = startPage; i <= endPage; i++) {
        items.push(i);
      }

      if (endPage < totalPages - 1) {
        items.push("ellipsis-end");
      }
      if (totalPages > 1) {
        items.push(totalPages);
      }
    }
    return items;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const itemsPerPageOptions = [25, 50, 100, 250];

  return (
    <div className="p-6 bg-card shadow-soft rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex-grow text-center">
          {testAliases[test_name]?.name || "Hasil Tes"}
        </h2>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {/* Pencarian */}
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Cari berdasarkan nama, catatan, atau kota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filter hasil (hanya untuk srq, sas-sv, sdq) */}
          {(isSpecialTest || isSDQTest) && (
            <div className="sm:w-[200px] w-auto">
              <Select value={resultFilter} onValueChange={setResultFilter}>
                <SelectTrigger
                  className="
                    inline-flex h-10 w-full items-center justify-between 
                    rounded-md border border-gray-300 bg-white 
                    px-3 py-2 text-sm 
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  "
                >
                  <div className="flex items-center justify-center">
                    <span className="hidden sm:block">Filter hasil</span>
                    <span className="block sm:hidden">
                      <Gauge size={16} />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua hasil</SelectItem>
                  {resultOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filter kota (hanya admin allData) */}
          {isAdmin && category === "allData" && (
            <div className="sm:w-[200px] w-auto">
              <Select value={cityFilter} onValueChange={setCityFilter}>
                <SelectTrigger
                  className="
                    inline-flex h-10 w-full items-center justify-between 
                    rounded-md border border-gray-300 bg-white 
                    px-3 py-2 text-sm 
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                  "
                >
                  <div className="flex items-center justify-center">
                    <span className="hidden sm:block">Filter kota</span>
                    <span className="block sm:hidden">
                      <Building2 size={16} />
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua kota</SelectItem>
                  {cityOptions.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Filter tanggal (periode) dengan dropdown custom */}
          <div className="relative sm:w-[200px] w-auto">
            <button
              onClick={() => setShowDateFilter(!showDateFilter)}
              className="
                inline-flex h-10 w-full items-center justify-between 
                rounded-md border border-gray-300 bg-white 
                px-3 py-2 text-sm 
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              "
            >
              <div className="flex items-center justify-center">
                <span className="hidden sm:block">Filter tanggal</span>
                <span className="block sm:hidden">
                  <CalendarArrowDown size={16} />
                </span>
              </div>
            </button>
            {showDateFilter && (
              <div className="absolute z-10 mt-1 p-4 bg-white border border-gray-300 rounded shadow">
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Dari Tanggal</label>
                  <Input
                    type="date"
                    value={dateStartFilter}
                    onChange={(e) => {
                      setDateStartFilter(e.target.value);
                      if (isSingleDay) {
                        setDateEndFilter(e.target.value);
                      }
                    }}
                    className="w-full"
                  />
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Sampai Tanggal</label>
                  <Input
                    type="date"
                    value={isSingleDay ? dateStartFilter : dateEndFilter}
                    onChange={(e) => setDateEndFilter(e.target.value)}
                    className="w-full"
                    disabled={isSingleDay}
                  />
                </div>
                <div className="flex items-center">
                  <Checkbox
                    checked={isSingleDay}
                    onCheckedChange={(checked) => {
                      setIsSingleDay(checked as boolean);
                      if (checked && dateStartFilter) {
                        setDateEndFilter(dateStartFilter);
                      }
                    }}
                  />
                  <span className="ml-2 text-sm">Satu hari saja</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items per page */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Tampilkan:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => setItemsPerPage(Number(value))}
          >
            <SelectTrigger
              className="
                inline-flex h-10 w-[80px] items-center justify-between 
                rounded-md border border-gray-300 bg-white 
                px-3 py-2 text-sm
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
              "
            >
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk delete (khusus admin allData) */}
      {isAdmin && category === "allData" && selectedItems.length > 0 && (
        <div className="my-2 flex justify-between items-center p-2 bg-gray-100 rounded">
          <span className="text-sm">{selectedItems.length} item terpilih</span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Hapus ({selectedItems.length})
          </Button>
        </div>
      )}

      {/* Tabel */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredResults.length > 0 ? (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 rounded-lg shadow-md">
              <thead>
                <tr className="bg-blue-300 text-white text-center text-sm uppercase">
                  {isAdmin && category === "allData" && (
                    <th className="border border-gray-300 px-4 py-2 w-10">
                      <Checkbox
                        checked={
                          selectedItems.length === paginatedResults.length &&
                          paginatedResults.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedItems(paginatedResults.map((item) => item.id));
                          } else {
                            setSelectedItems([]);
                          }
                        }}
                      />
                    </th>
                  )}
                  <th className="border border-gray-300 px-4 py-2">No</th>
                  <th className="border border-gray-300 px-4 py-2">Nama</th>

                  {/* Jika srq/sas-sv => hasil & interpretasi (kecuali admin), jika sdq => age, difficulty, strength */}
                  {isSDQTest ? (
                    <>
                      <th className="border border-gray-300 px-4 py-2">Age</th>
                      <th className="border border-gray-300 px-4 py-2">Difficulty Level</th>
                      <th className="border border-gray-300 px-4 py-2">Strength Level</th>
                    </>
                  ) : isSpecialTest ? (
                    <>
                      <th className="border border-gray-300 px-4 py-2">Hasil</th>
                      {!isAdmin && (
                        <th className="border border-gray-300 px-4 py-2">Interpretasi</th>
                      )}
                    </>
                  ) : (
                    <th className="border border-gray-300 px-4 py-2">Hasil</th>
                  )}

                  <th className="border border-gray-300 px-4 py-2">Catatan</th>

                  {/* Kolom Tanggal Lahir hanya jika kategori != self */}
                  {category !== "self" && (
                    <th className="border border-gray-300 px-4 py-2">Tanggal Lahir</th>
                  )}
                  <th className="border border-gray-300 px-4 py-2">Kota</th>
                  <th className="border border-gray-300 px-4 py-2">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {paginatedResults.map((row, index) => {
                  let level = "-", interpretation = "-";
                  let age = "-", difficultyLevel = "-", strengthLevel = "-";

                  if (isSpecialTest) {
                    ({ level, interpretation } = parseResultSummary(row.result_summary));
                  }
                  if (isSDQTest) {
                    ({ age, difficultyLevel, strengthLevel } = parseSDQResult(row.result_summary));
                  }

                  const itemNumber = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={row.id}
                      onClick={(e) => {
                        // Jika klik checkbox, jangan memicu onViewDetail
                        if ((e.target as HTMLElement).closest('[type="checkbox"]')) return;
                        onViewDetail(row.id);
                      }}
                      className="cursor-pointer hover:bg-blue-50 transition duration-200"
                    >
                      {isAdmin && category === "allData" && (
                        <td
                          className="border border-gray-300 px-4 py-2 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedItems.includes(row.id)}
                            onCheckedChange={(checked) => handleSelectItem(row.id, checked as boolean)}
                          />
                        </td>
                      )}
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        {itemNumber}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {getNameDisplay(row)}
                      </td>

                      {isSDQTest ? (
                        <>
                          <td className="border border-gray-300 px-4 py-2">{age}</td>
                          <td className="border border-gray-300 px-4 py-2">{difficultyLevel}</td>
                          <td className="border border-gray-300 px-4 py-2">{strengthLevel}</td>
                        </>
                      ) : isSpecialTest ? (
                        <>
                          <td className="border border-gray-300 px-4 py-2">{level}</td>
                          {!isAdmin && (
                            <td className="border border-gray-300 px-4 py-2">{interpretation}</td>
                          )}
                        </>
                      ) : (
                        <td className="border border-gray-300 px-4 py-2">
                          {row.result_summary || "-"}
                        </td>
                      )}

                      <td className="border border-gray-300 px-4 py-2">
                        {row.notes?.slice(0, 10) || "-"}
                      </td>

                      {category !== "self" && (
                        <td className="border border-gray-300 px-4 py-2">
                          {getBirthDate(row)}
                        </td>
                      )}
                      <td className="border border-gray-300 px-4 py-2">
                        {row.city || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {row.created_at?.slice(0, 10) || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {generatePaginationItems().map((item, index) => {
                    if (item === "ellipsis-start" || item === "ellipsis-end") {
                      return (
                        <PaginationItem key={`ellipsis-${index}`}>
                          <PaginationEllipsis />
                        </PaginationItem>
                      );
                    }
                    return (
                      <PaginationItem key={`page-${item}`}>
                        <PaginationLink
                          isActive={currentPage === item}
                          onClick={() => handlePageChange(item as number)}
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <div className="mt-2 text-center text-sm text-muted-foreground">
            Menampilkan {paginatedResults.length} dari {filteredResults.length} hasil
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">Tidak ada data tes.</p>
      )}
    </div>
  );
};

export default TestResultsTable;

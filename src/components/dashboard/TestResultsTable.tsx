import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Button from "@/components/Button";

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
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<{ [key: string]: string | null }>(
    {}
  );

  useEffect(() => {
    if (!test_name) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("test_results")
          .select(
            "id, user_id, test_id, result_summary, created_at, anonymous_name, other_person_name, notes,anonymous_birthdate"
          )
          .eq("test_id", test_name)
          .order("created_at", { ascending: false });

        if (category === "self") {
          query = query.eq("user_id", userId);
        }
        const { data, error } = await query;
        if (error) throw error;

        setTestResults(data || []);

        // Ambil full_name untuk setiap user_id yang tersedia
        const userIds = [
          ...new Set(data?.map((row) => row.user_id).filter(Boolean))
        ];
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);

          if (usersError) throw usersError;

          const namesMap = Object.fromEntries(
            usersData.map((user) => [user.id, user.full_name])
          );

          setUserNames(namesMap);
        }
      } catch (err) {
        console.error("Error fetching test results:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [category, test_name, userId]);

  const getNameDisplay = (row) => {
    return row.for_other && row.other_person_name ? (
      <span className="text-blue-500 font-semibold">
        {row.other_person_name}
      </span>
    ) : row.anonymous_name ? (
      <span className="text-gray-500 font-semibold">{row.anonymous_name}</span>
    ) : userNames[row.user_id] ? (
      <span className="text-green-500 font-semibold">
        {userNames[row.user_id]}
      </span>
    ) : (
      <span className="text-gray-400">-</span>
    );
  };

  const parseResultSummary = (summary) => {
    if (!summary) return { level: "-", interpretation: "-" };

    const match = summary.match(/Level[:\s]*(.*?)\s*-\s*(.*)/i);
    return {
      level: match ? match[1] : "-",
      interpretation: match ? match[2] : "-"
    };
  };
  const parseSDQResult = (summary) => {
    try {
      if (typeof summary !== "string")
        return { age: "-", difficultyLevel: "-", strengthLevel: "-" };
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
  const getNameTextOnly = (row) => {
    if (row.for_other && row.other_person_name) {
      return row.other_person_name;
    }
    if (row.anonymous_name) {
      return row.anonymous_name;
    }
    if (userNames[row.user_id]) {
      return userNames[row.user_id];
    }
    return "-";
  };

  const getNameTextColor = (row): [number, number, number] => {
    if (row.for_other && row.other_person_name) {
      return [0, 0, 255]; // Biru (RGB)
    }
    if (row.anonymous_name) {
      return [128, 128, 128]; // Abu-abu
    }
    if (userNames[row.user_id]) {
      return [0, 128, 0]; // Hijau
    }
    return [128, 128, 128]; // Default abu-abu
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`Hasil Tes: ${test_name || "Hasil Tes"}`, 10, 10);

    const isSpecialTest = ["srq", "sas-sv"].includes(test_name);
    const isSDQTest = test_name === "sdq";

    let tableHead = [];
    let tableBody = [];

    if (isSpecialTest) {
      tableHead = [
        [
          "No",
          "Nama",
          "Hasil",
          "Interpretasi",
          "Catatan",
          "Tanggal Lahir",
          "Tanggal"
        ]
      ];
      tableBody = testResults.map((row, index) => {
        const { level, interpretation } = parseResultSummary(
          row.result_summary
        );
        return [
          index + 1,
          getNameTextOnly(row),
          level,
          interpretation,
          row.notes || "-",
          row.anonymous_birthdate || "-",
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
          "Tanggal Lahir",
          "Tanggal"
        ]
      ];
      tableBody = testResults.map((row, index) => {
        const { age, difficultyLevel, strengthLevel } = parseSDQResult(
          row.result_summary
        );
        return [
          index + 1,
          getNameTextOnly(row),
          age,
          difficultyLevel,
          strengthLevel,
          row.notes || "-",
          row.anonymous_birthdate || "-",
          row.created_at?.slice(0, 10) || "-"
        ];
      });
    } else {
      tableHead = [
        ["No", "Nama", "Hasil", "Catatan", "Tanggal Lahir", "Tanggal"]
      ];
      tableBody = testResults.map((row, index) => [
        index + 1,
        getNameTextOnly(row),
        row.result_summary || "-",
        row.notes || "-",
        row.anonymous_birthdate || "-",
        row.created_at?.slice(0, 10) || "-"
      ]);
    }

    autoTable(doc, {
      startY: 20,
      head: tableHead,
      body: tableBody,
      didParseCell: function (data) {
        if (data.column.index === 1 && data.row.index !== undefined) {
          // Kolom "Nama" diatur warnanya
          const row = testResults[data.row.index];
          const textColor = getNameTextColor(row);
          doc.setTextColor(...textColor);
        } else {
          doc.setTextColor(0, 0, 0); // Warna default hitam
        }
      }
    });

    doc.save(`Hasil_Tes_${test_name || "Hasil_Tes"}.pdf`);
  };

  const isSpecialTest = ["srq", "sas-sv"].includes(test_name);
  const isSDQTest = test_name === "sdq";
  const testAliases: Record<string, { name: string }> = {
    srq: {
      name: "Self-Reporting Questionnaire"
    },
    sdq: {
      name: "Strengths and Difficulties Questionnaire"
    },
    bfi: {
      name: "Big Five Inventory"
    },
    "sas-sv": {
      name: "Social Anxiety Scale - Short Version"
    }
  };
  return (
    <div className="p-6 bg-card shadow-soft rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium flex-grow text-center">
          {testAliases[test_name]?.name || "Hasil Tes"}
        </h2>
        <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : testResults.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg shadow-md">
            <thead>
              <tr className="bg-blue-300 text-white text-center text-sm uppercase">
                <th className="border border-gray-300 px-4 py-2">No</th>
                <th className="border border-gray-300 px-4 py-2">Nama</th>
                {isSpecialTest && (
                  <>
                    <th className="border border-gray-300 px-4 py-2">Hasil</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Interpretasi
                    </th>
                  </>
                )}
                {isSDQTest && (
                  <>
                    <th className="border border-gray-300 px-4 py-2">Age</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Difficulty Level
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Strength Level
                    </th>
                  </>
                )}
                {!isSpecialTest && !isSDQTest && (
                  <th className="border border-gray-300 px-4 py-2">Hasil</th>
                )}
                <th className="border border-gray-300 px-4 py-2">Catatan</th>
                <th className="border border-gray-300 px-4 py-2">
                  Tanggal Lahir
                </th>
                <th className="border border-gray-300 px-4 py-2">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((row, index) => {
                let level = "-",
                  interpretation = "-";
                let age = "-",
                  difficultyLevel = "-",
                  strengthLevel = "-";

                if (isSpecialTest) {
                  ({ level, interpretation } = parseResultSummary(
                    row.result_summary
                  ));
                }

                if (isSDQTest) {
                  ({ age, difficultyLevel, strengthLevel } = parseSDQResult(
                    row.result_summary
                  ));
                }

                return (
                  <tr
                    key={row.id}
                    onClick={() => onViewDetail(row.id)}
                    className="cursor-pointer hover:bg-blue-50 transition duration-200"
                  >
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {getNameDisplay(row)}
                    </td>

                    {isSDQTest ? (
                      <>
                        <td className="border border-gray-300 px-4 py-2">
                          {age}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {difficultyLevel}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {strengthLevel}
                        </td>
                      </>
                    ) : isSpecialTest ? (
                      <>
                        <td className="border border-gray-300 px-4 py-2">
                          {level}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {interpretation}
                        </td>
                      </>
                    ) : (
                      <td className="border border-gray-300 px-4 py-2">
                        {row.result_summary || "-"}
                      </td>
                    )}

                    <td className="border border-gray-300 px-4 py-2">
                      {row.notes?.slice(0, 10) || "-"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {row.anonymous_birthdate?.slice(0, 10) || "-"}
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
      ) : (
        <p className="text-center text-gray-500">Tidak ada data tes.</p>
      )}
    </div>
  );
};

export default TestResultsTable;

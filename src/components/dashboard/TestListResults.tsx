import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Button from "@/components/Button";
import TestResultsTable from "@/components/dashboard/TestResultsTable";
import TestResultsDetail from "@/components/dashboard/TestResultsDetail";
import { User, Users, Globe } from "lucide-react"; // Import ikon dari Lucide

const TestListResults = ({
  isProfessional,
  userId,
  isAdmin
}: {
  isProfessional: boolean;
  userId: string;
  isAdmin: boolean;
}) => {
  const [category, setCategory] = useState("self"); // 'self' atau 'others'
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [isTableView, setIsTableView] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null); // Tambahkan state untuk menyimpan ID hasil tes

  // ✅ Fungsi untuk melihat hasil tes dalam tabel
  const handleViewTable = (test_name: string) => {
    setSelectedTest(test_name);
    setIsTableView(true);
    setSelectedTestId(null); // Reset testId saat beralih ke tabel
  };

  // ✅ Fungsi untuk melihat detail hasil tes
  const handleViewDetail = (testId: string) => {
    setSelectedTestId(testId);
    setIsTableView(false);
  };

  // ✅ Fungsi untuk kembali ke daftar tes
  const handleBack = () => {
    setIsTableView(false);
    setSelectedTest(null);
    setSelectedTestId(null);
  };

  const testAliases: Record<string, { name: string; description: string }> = {
    srq: {
      name: "Self-Reporting Questionnaire",
      description:
        "Kuesioner SRQ-20 adalah alat skrining untuk mendeteksi gejala gangguan mental umum yang dikembangkan oleh World Health Organization (WHO)."
    },
    sdq: {
      name: "Strengths and Difficulties Questionnaire",
      description:
        "Tes Kekuatan dan Kelemahan (SDQ) adalah instrumen skrining untuk menilai kesejahteraan emosional dan perilaku anak dan remaja."
    },
    bfi: {
      name: "Big Five Inventory",
      description:
        "Big Five Inventory (BFI) adalah alat ukur yang dirancang untuk menilai kepribadian individu berusia 18 tahun ke atas. BFI-10 merupakan versi singkat dari versi aslinya yang terdiri dari 44 item."
    },
    "sas-sv": {
      name: "Smartphone Addiction Scale - Short Version",
      description:
        "Tes Kecanduan Smartphone adalah alat ukur untuk mengukur tingkat ketergantungan seseorang terhadap penggunaan smartphone dalam kehidupan sehari-hari."
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Hasil Tes</h1>

      <Tabs
        defaultValue={category}
        onValueChange={setCategory}
        className="mb-6"
      >
        {/* ✅ Sembunyikan TabsList jika tabel atau detail sedang ditampilkan */}
        {!isTableView && !selectedTestId && (
          <div className="flex justify-between items-center mb-6">
            {isProfessional && (
              <TabsList className="w-full max-w-none sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl grid grid-cols-3">
                <TabsTrigger
                  value="self"
                  className="flex flex-col items-center gap-1"
                >
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block text-xs">
                    Hasil Tes Diri
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="others"
                  className="flex flex-col items-center gap-1"
                >
                  <Users className="h-5 w-5" />
                  <span className="hidden sm:block text-xs">
                    Hasil Tes Orang Lain
                  </span>
                </TabsTrigger>

                {isProfessional && isAdmin && (
                  <TabsTrigger
                    value="allData"
                    className="flex flex-col items-center gap-1"
                  >
                    <Globe className="h-5 w-5" />
                    <span className="hidden sm:block text-xs">
                      Hasil Seluruh Tes
                    </span>
                  </TabsTrigger>
                )}
              </TabsList>
            )}
          </div>
        )}

        {/* ✅ Tombol kembali hanya muncul jika sedang melihat tabel/detail */}
        {(isTableView || selectedTestId) && (
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" size="sm" onClick={handleBack}>
              ⬅ Kembali
            </Button>
          </div>
        )}

        {/* ✅ Tampilkan halaman detail jika ada test yang dipilih */}
        {selectedTestId ? (
          <TestResultsDetail testId={selectedTestId} />
        ) : isTableView && selectedTest ? (
          <TestResultsTable
            category={category}
            userId={userId}
            test_name={selectedTest}
            onViewDetail={handleViewDetail} // Kirim fungsi ke tabel
          />
        ) : (
          <TabsContent value={category} className="mt-6">
            <div className="bg-card shadow-soft rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">
                {category === "self"
                  ? "Hasil Tes Anda"
                  : category === "others"
                  ? "Hasil Tes Orang Lain"
                  : "Hasil Seluruh Tes"}
              </h2>
              <div className="space-y-4">
                {["srq", "sdq", "bfi", "sas-sv"].map((test, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <h3 className="font-medium">
                      {testAliases[test]?.name || test}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {testAliases[test]?.description ||
                        "Deskripsi tidak tersedia."}
                    </p>
                    <div className="flex justify-end mt-3 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTable(test)}
                      >
                        Lihat Detail
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default TestListResults;

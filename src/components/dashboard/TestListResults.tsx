import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Button from "@/components/Button";
import TestResultsTable from "@/components/dashboard/TestResultsTable";
import TestResultsDetail from "@/components/dashboard/TestResultsDetail";

const TestListResults = ({
  isProfessional,
  userId
}: {
  isProfessional: boolean;
  userId: string;
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

  const testAliases: Record<string, string> = {
    srq: "Self-Reporting Questionnaire",
    sdq: "Strengths and Difficulties Questionnaire",
    bfi: "Big Five Inventory",
    "sas-sv": "Social Anxiety Scale - Short Version"
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
              <TabsList className="w-full max-w-md">
                <TabsTrigger value="self" className="flex-1">
                  Hasil Tes Diri
                </TabsTrigger>
                <TabsTrigger value="others" className="flex-1">
                  Hasil Tes Orang Lain
                </TabsTrigger>
              </TabsList>
            )}
          </div>
        )}

        {/* ✅ Tombol kembali hanya muncul jika sedang melihat tabel/detail */}
        {(isTableView || selectedTestId) && (
          <Button variant="outline" size="sm" onClick={handleBack}>
            ⬅ Kembali
          </Button>
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
                  : "Hasil Tes Orang Lain"}
              </h2>
              <div className="space-y-4">
                {["srq", "sdq", "bfi", "sas-sv"].map((test, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <h3 className="font-medium">{testAliases[test] || test}</h3>
                    <div className="flex justify-end mt-3 space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTable(test)}
                      >
                        Lihat Detail
                      </Button>
                      <Button variant="outline" size="sm">
                        Unduh PDF
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

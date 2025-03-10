import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Button from "@/components/Button";
import TestResultsTable from "@/components/dashboard/TestResultsTable";

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

  // ✅ Fungsi untuk melihat hasil tes
  const handleViewResults = (testName: string) => {
    setSelectedTest(testName);
    setIsTableView(true);
  };

  // ✅ Fungsi untuk kembali ke daftar tes
  const handleBack = () => {
    setIsTableView(false);
    setSelectedTest(null);
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
        {/* ✅ Gunakan flex agar sejajar */}
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

          {/* ✅ Pindahkan Tombol Kembali ke dalam flex ini */}
          {isTableView && selectedTest && (
            <Button variant="outline" size="sm" onClick={handleBack}>
              ⬅ Kembali
            </Button>
          )}
        </div>

        {isTableView && selectedTest ? (
          <TestResultsTable
            category={category}
            testName={selectedTest}
            userId={userId}
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
                        onClick={() => handleViewResults(test)}
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

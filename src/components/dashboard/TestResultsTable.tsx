import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import { supabase } from "@/integrations/supabase/client";

const TestResultsTable = ({
  category,
  testName,
  userId
}: {
  category: string;
  testName: string;
  userId: string;
}) => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // ✅ Gunakan useNavigate untuk kembali

  useEffect(() => {
    if (!testName) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("test_results")
          .select("*")
          .eq("test_id", testName)
          .order("created_at", { ascending: false });

        if (category === "self") {
          query = query.eq("user_id", userId);
        }
        const { data, error } = await query;
        if (error) {
          throw error;
        }

        setTestResults(data || []);
      } catch (err) {
        console.error("Error fetching test results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category, testName, userId]);

  return (
    <div className="p-6 bg-card shadow-soft rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Hasil Tes: {testName}</h2>
        {/* ✅ Tombol Kembali */}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : testResults.length > 0 ? (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">No</th>
              <th className="border border-gray-300 p-2">Nama</th>
              <th className="border border-gray-300 p-2">Hasil</th>
              <th className="border border-gray-300 p-2">Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {testResults.map((row, index) => {
              let formattedResult = row.result_summary || "N/A";

              if (
                testName === "sdq" &&
                typeof row.result_summary === "string"
              ) {
                try {
                  const parsedResult = JSON.parse(row.result_summary);
                  formattedResult = `Difficulty Level: ${
                    parsedResult.difficultyLevel || "N/A"
                  }, Strength Level: ${parsedResult.strengthLevel || "N/A"}`;
                } catch (error) {
                  console.error("Error parsing result_summary:", error);
                  formattedResult = "Invalid JSON Data";
                }
              }

              return (
                <tr key={row.id} className="text-center">
                  <td className="border border-gray-300 p-2">{index + 1}</td>
                  <td className="border border-gray-300 p-2">
                    {row.anonymous_name || "N/A"}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {formattedResult}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {row.created_at ? row.created_at.slice(0, 10) : "N/A"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500">Tidak ada data tes.</p>
      )}
    </div>
  );
};

export default TestResultsTable;

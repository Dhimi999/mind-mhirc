import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
          .select("*")
          .eq("test_id", test_name)
          .order("created_at", { ascending: false });

        if (category === "self") {
          query = query.eq("user_id", userId);
        }
        const { data, error } = await query;
        if (error) throw error;

        setTestResults(data || []);

        // Ambil full_name untuk setiap user_id yang tersedia
        const userIds = data.map((row) => row.user_id).filter(Boolean);
        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", userIds);

          if (usersError) throw usersError;

          const namesMap = usersData.reduce((acc, user) => {
            acc[user.id] = user.full_name;
            return acc;
          }, {});
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
    if (row.for_other && row.other_person_name) {
      return (
        <span className="text-blue-500 font-semibold">
          {row.other_person_name}
        </span>
      );
    }
    if (!row.for_other && userNames[row.user_id]) {
      return (
        <span className="text-green-500 font-semibold">
          {userNames[row.user_id]}
        </span>
      );
    }
    if (row.anonymous_name) {
      return (
        <span className="text-gray-500 font-semibold">
          {row.anonymous_name}
        </span>
      );
    }
    return <span className="text-gray-400">N/A</span>;
  };

  return (
    <div className="p-6 bg-card shadow-soft rounded-xl">
      <h2 className="text-lg font-medium mb-4">Hasil Tes: {test_name}</h2>
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
            {testResults.map((row, index) => (
              <tr
                key={row.id}
                onClick={() => onViewDetail(row.id)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <td className="border border-gray-300 p-2">{index + 1}</td>
                <td className="border border-gray-300 p-2">
                  {getNameDisplay(row)}
                </td>
                <td className="border border-gray-300 p-2">
                  {row.result_summary || "N/A"}
                </td>
                <td className="border border-gray-300 p-2">
                  {row.created_at?.slice(0, 10) || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center text-gray-500">Tidak ada data tes.</p>
      )}
    </div>
  );
};

export default TestResultsTable;


import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import SrqTestResult from "./test-results/SrqTestResult";
import SasSvTestResult from "./test-results/SasSvTestResult";
import SdqTestResult from "./test-results/SdqTestResult";
import BfiTestResult from "./test-results/BfiTestResult";

interface ProfileData {
  full_name: string | null;
}

const getTestType = (testId: string) => {
  if (!testId) return "unknown";
  
  const lowerTestId = testId.toLowerCase();
  if (lowerTestId.includes("srq")) return "srq";
  if (lowerTestId.includes("sas")) return "sas-sv";
  if (lowerTestId.includes("sdq")) return "sdq";
  if (lowerTestId.includes("bfi")) return "bfi-10";
  
  return "unknown";
};

const TestResultsDetail = ({ testId }: { testId: string }) => {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [testType, setTestType] = useState<string>("unknown");

  useEffect(() => {
    if (!testId) return;

    const fetchResult = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("test_results")
          .select("*")
          .eq("id", testId)
          .single();

        if (error) throw error;
        setTestResult(data);
        setTestType(getTestType(data.test_id));

        if (!data.for_other && data.user_id) {
          const { data: userData, error: userError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", data.user_id)
            .maybeSingle<ProfileData>();

          if (userError) throw userError;
          setUserName(userData?.full_name || "Pengguna");
        }
      } catch (err) {
        console.error("Error fetching test result:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [testId]);

  if (loading) return <p className="text-center">Loading...</p>;
  if (!testResult)
    return (
      <p className="text-center text-red-500">Hasil tes tidak ditemukan.</p>
    );

  // Render the appropriate test result component based on test type
  const renderTestResult = () => {
    switch (testType) {
      case "srq":
        return <SrqTestResult testResult={testResult} userName={userName} />;
      case "sas-sv":
        return <SasSvTestResult testResult={testResult} userName={userName} />;
      case "sdq":
        return <SdqTestResult testResult={testResult} userName={userName} />;
      case "bfi-10":
        return <BfiTestResult testResult={testResult} userName={userName} />;
      default:
        return (
          <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold text-center mb-4">
              Detail Hasil Tes: {testResult.test_id.toUpperCase()}
            </h2>

            {/* Ringkasan Hasil */}
            <div className="text-center p-4 bg-gray-100 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Ringkasan Hasil</h3>
              <p className="text-gray-700">{testResult.result_summary || "N/A"}</p>
            </div>

            {/* Informasi Pengguna */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Informasi Pengguna</h3>
              <ul className="text-gray-700">
                {testResult.anonymous_name && (
                  <li>
                    <strong>Nama Anonim:</strong> {testResult.anonymous_name}
                  </li>
                )}
                {testResult.anonymous_birthdate && (
                  <li>
                    <strong>Usia Anonim:</strong> {testResult.anonymous_birthdate}
                  </li>
                )}
                {testResult.anonymous_email && (
                  <li>
                    <strong>Email Anonim:</strong> {testResult.anonymous_email}
                  </li>
                )}
                {testResult.for_other && testResult.other_person_name && (
                  <li>
                    <strong>Nama Orang Lain:</strong> {testResult.other_person_name}
                  </li>
                )}
                {!testResult.for_other && userName && (
                  <li>
                    <strong>Nama Pengguna:</strong> {userName}
                  </li>
                )}
              </ul>
            </div>

            {/* Detail Tambahan */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Detail Tes</h3>
              <ul className="text-gray-700">
                <li>
                  <strong>Judul Tes:</strong> {testResult.test_title}
                </li>
                <li>
                  <strong>Dibuat Pada:</strong>{" "}
                  {new Date(testResult.created_at).toLocaleString()}
                </li>
                <li>
                  <strong>ID Tes:</strong> {testResult.id}
                </li>
              </ul>
            </div>
          </div>
        );
    }
  };

  return renderTestResult();
};

export default TestResultsDetail;

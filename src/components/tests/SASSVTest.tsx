import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface TestQuestionType {
  id: number;
  text: string;
  options?: string[];
}
export interface LocalTestData {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: TestQuestionType[];
}
interface SASSVTestProps {
  test: LocalTestData;
}

const SASSVTest: React.FC<SASSVTestProps> = ({ test }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(test.questions.length).fill(""));
  const [isSaving, setIsSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState<React.ReactNode | null>(null);

  // Opsi Likert yang digunakan untuk SAS‑SV
  const options = ["Sangat Setuju", "Setuju", "Netral", "Tidak Setuju", "Sangat Tidak Setuju"];

  const selectAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const finishTest = async () => {
    // Contoh sederhana: gunakan jumlah jawaban sebagai skor
    const score = userAnswers.length;
    const module = await import("@/data/testsData");
    const result = module.getTestResultSAS(score);

    const resultContent = (
      <div className="result-content text-center">
        <h3 className={`text-xl font-bold mb-4 ${result.color}`}>{result.level}</h3>
        <p className="mb-6">{result.message}</p>
        <img
          src={result.image}
          alt="Result illustration"
          className="mx-auto mb-6 rounded-lg max-w-sm"
        />
        <div className="recommendations mt-6">
          <h4 className="font-semibold mb-2">Rekomendasi:</h4>
          <ul className="space-y-2 text-left max-w-md mx-auto">
            {result.recommendations.map((rec: string, index: number) => (
              <li key={index} className="flex items-start">
                <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
    setResultMessage(resultContent);
    await saveTestResults(result.level, score);
  };

  const saveTestResults = async (resultSummary: string, score: number) => {
    setIsSaving(true);
    try {
      const testResultData = {
        test_id: test.id,
        test_title: test.title,
        answers: userAnswers,
        result_summary: `Level: ${resultSummary} (Skor: ${score})`
      };
      const { error } = await supabase.from("test_results").insert([testResultData]);
      if (error) {
        toast({
          title: "Gagal menyimpan hasil",
          description: "Terjadi kesalahan saat menyimpan hasil tes.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Hasil tes disimpan",
          description: "Hasil tes Anda telah berhasil disimpan."
        });
      }
    } catch (error) {
      console.error("Error saving test results:", error);
      toast({
        title: "Terjadi kesalahan",
        description: "Mohon coba lagi nanti.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (resultMessage) {
    return (
      <div className="test-completed bg-white rounded-xl shadow-soft p-8 max-w-4xl mx-auto">
        {resultMessage}
        <Button onClick={() => window.location.reload()} className="mt-4">
          Kembali ke Daftar Tes
        </Button>
      </div>
    );
  }

  return (
    <div className="test-in-progress bg-white rounded-xl shadow-soft p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold">
          Soal {currentQuestionIndex + 1} dari {test.questions.length}
        </h2>
      </div>
      <div className="mb-8">
        <p className="text-lg font-medium mb-6">
          {test.questions[currentQuestionIndex].text}
        </p>
      </div>
      <div className="options-container space-y-3">
        {options.map((option, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              userAnswers[currentQuestionIndex] === option
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground"
            }`}
            onClick={() => selectAnswer(option)}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                  userAnswers[currentQuestionIndex] === option
                    ? "border-primary"
                    : "border-muted-foreground"
                }`}
              >
                {userAnswers[currentQuestionIndex] === option && (
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                )}
              </div>
              <span className="font-medium">{option}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="navigation-buttons mt-8 flex justify-between">
        <Button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0} variant="outline">
          Sebelumnya
        </Button>
        {currentQuestionIndex < test.questions.length - 1 ? (
          <Button onClick={goToNextQuestion} disabled={!userAnswers[currentQuestionIndex]}>
            Selanjutnya
          </Button>
        ) : (
          <Button onClick={finishTest} disabled={!userAnswers[currentQuestionIndex] || isSaving}>
            {isSaving ? "Menyimpan..." : "Selesai"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SASSVTest;

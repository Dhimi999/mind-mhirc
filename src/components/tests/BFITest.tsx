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
interface BFITestProps {
  test: LocalTestData;
}

const BFITest: React.FC<BFITestProps> = ({ test }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(test.questions.length).fill(""));
  const [isSaving, setIsSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState<React.ReactNode | null>(null);

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

  // Fungsi khusus untuk menghitung hasil BFI
  const calculateBFIResults = (answers: string[]) => {
    // Konversi jawaban ke nilai numerik dengan aturan terbalik untuk indeks tertentu
    const numericValues = answers.map((answer, index) => {
      const specialIndices = [0, 2, 3, 4, 6];
      if (specialIndices.includes(index)) {
        switch (answer) {
          case "Sangat Setuju": return 1;
          case "Setuju": return 2;
          case "Netral": return 3;
          case "Tidak Setuju": return 4;
          case "Sangat Tidak Setuju": return 5;
          default: return 0;
        }
      } else {
        switch (answer) {
          case "Sangat Setuju": return 5;
          case "Setuju": return 4;
          case "Netral": return 3;
          case "Tidak Setuju": return 2;
          case "Sangat Tidak Setuju": return 1;
          default: return 0;
        }
      }
    });
    const reversedScore = (index: number) => 6 - numericValues[index];
    const dimensions = {
      extraversion: reversedScore(0) + numericValues[5],
      agreeableness: reversedScore(6) + numericValues[1],
      conscientiousness: reversedScore(2) + numericValues[7],
      neuroticism: reversedScore(3) + numericValues[8],
      openness: reversedScore(4) + numericValues[9]
    };
    const totalScore = Object.values(dimensions).reduce((sum, score) => sum + score, 0);
    const percentages = {
      extraversion: Math.round((dimensions.extraversion / totalScore) * 100),
      agreeableness: Math.round((dimensions.agreeableness / totalScore) * 100),
      conscientiousness: Math.round((dimensions.conscientiousness / totalScore) * 100),
      neuroticism: Math.round((dimensions.neuroticism / totalScore) * 100),
      openness: Math.round((dimensions.openness / totalScore) * 100)
    };
    let dominantTrait = "";
    let highestPercentage = 0;
    for (const [trait, percentage] of Object.entries(percentages)) {
      if (percentage > highestPercentage) {
        highestPercentage = percentage;
        dominantTrait = trait;
      }
    }
    return { dominantTrait, percentages, dimensions };
  };

  const finishTest = async () => {
    const bfiResults = calculateBFIResults(userAnswers);
    const traitNames: Record<string, string> = {
      extraversion: "Extraversion",
      agreeableness: "Agreeableness",
      conscientiousness: "Conscientiousness",
      neuroticism: "Neuroticism",
      openness: "Openness"
    };
    const traitColors: Record<string, string> = {
      extraversion: "bg-yellow-500",
      agreeableness: "bg-green-500",
      conscientiousness: "bg-blue-500",
      neuroticism: "bg-purple-500",
      openness: "bg-red-500"
    };
    const { dominantTrait, percentages } = bfiResults;
    const recommendations = [
      "Kepribadian ini hanya indikasi umum dan bukan diagnosis profesional",
      "Kenali kekuatan kepribadian Anda dan manfaatkan dalam kehidupan sehari-hari"
    ];
    // Tambahan rekomendasi spesifik berdasarkan dominantTrait
    if (dominantTrait === "extraversion") {
      recommendations.push("Manfaatkan energi positif Anda untuk menginspirasi orang di sekitar");
    }
    const resultContent = (
      <div className="result-content text-center">
        <h3 className={`text-xl font-bold mb-4 text-${traitColors[dominantTrait].replace("bg-", "")}`}>
          {traitNames[dominantTrait]}
        </h3>
        <p className="mb-6">
          Anda memiliki dominasi kepribadian <strong>{traitNames[dominantTrait]} ({percentages[dominantTrait]}%)</strong>.
        </p>
        <div className="recommendations mt-6">
          <h4 className="font-semibold mb-2">Rekomendasi:</h4>
          <ul className="space-y-2 text-left max-w-xl mx-auto">
            {recommendations.map((rec, index) => (
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
    await saveTestResults(traitNames[dominantTrait], percentages[dominantTrait]);
  };

  const saveTestResults = async (resultSummary: string, score: number) => {
    setIsSaving(true);
    try {
      const testResultData = {
        test_id: test.id,
        test_title: test.title,
        answers: userAnswers,
        result_summary: `Dominan: ${resultSummary} (Skor: ${score})`
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

export default BFITest;

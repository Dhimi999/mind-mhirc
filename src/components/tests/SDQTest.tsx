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
interface SDQTestProps {
  test: LocalTestData;
}

const SDQTest: React.FC<SDQTestProps> = ({ test }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(test.questions.length).fill(""));
  const [ageGroup, setAgeGroup] = useState<"younger" | "older">("older");
  const [isSaving, setIsSaving] = useState(false);
  const [resultMessage, setResultMessage] = useState<React.ReactNode | null>(null);

  const options = ["Tidak Benar", "Agak Benar", "Selalu Benar"];

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

  // Fungsi khusus menghitung hasil SDQ
  const calculateSDQResults = (answers: string[]) => {
    const numericValues = answers.map((answer, index) => {
      const specialIndices = [6, 10, 13, 20, 24];
      if (specialIndices.includes(index)) {
        switch (answer) {
          case "Selalu Benar": return 0;
          case "Agak Benar": return 1;
          case "Tidak Benar": return 2;
          default: return 0;
        }
      } else {
        switch (answer) {
          case "Selalu Benar": return 2;
          case "Agak Benar": return 1;
          case "Tidak Benar": return 0;
          default: return 0;
        }
      }
    });
    const strengthItems = [0, 3, 8, 16, 19];
    const strengthScore = strengthItems.reduce((sum, i) => sum + numericValues[i], 0);
    const difficultyItems = Array.from({ length: 25 }, (_, i) => i).filter(i => !strengthItems.includes(i));
    const difficultyScore = difficultyItems.reduce((sum, i) => sum + numericValues[i], 0);
    let difficultyLevel = "";
    if (ageGroup === "younger") {
      if (difficultyScore <= 13) difficultyLevel = "Normal";
      else if (difficultyScore <= 15) difficultyLevel = "Borderline";
      else difficultyLevel = "Abnormal";
    } else {
      if (difficultyScore <= 15) difficultyLevel = "Normal";
      else if (difficultyScore <= 19) difficultyLevel = "Borderline";
      else difficultyLevel = "Abnormal";
    }
    let strengthLevel = "";
    if (ageGroup === "younger") {
      if (strengthScore >= 6) strengthLevel = "Normal";
      else if (strengthScore === 5) strengthLevel = "Borderline";
      else strengthLevel = "Abnormal";
    } else {
      if (strengthScore >= 7) strengthLevel = "Normal";
      else if (strengthScore >= 5) strengthLevel = "Borderline";
      else strengthLevel = "Abnormal";
    }
    return { difficultyScore, strengthScore, difficultyLevel, strengthLevel, age: ageGroup === "younger" ? "< 11 tahun" : "11-18 tahun" };
  };

  const finishTest = async () => {
    const sdqResults = calculateSDQResults(userAnswers);
    const getOverallResult = () => {
      if (sdqResults.difficultyLevel === "Normal" && sdqResults.strengthLevel === "Normal") {
        return {
          level: "Normal",
          message: "Perkembangan mental dan sosial Anda tampak dalam kondisi baik.",
          color: "text-green-500",
          image: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?q=80&w=1470&auto=format&fit=crop",
          recommendations: [
            "Pertahankan pola interaksi sosial yang positif",
            "Terus kembangkan keterampilan sosial dan emosional",
            "Jaga keseimbangan antara aktivitas akademik dan sosial"
          ]
        };
      } else if (sdqResults.difficultyLevel === "Abnormal" || sdqResults.strengthLevel === "Abnormal") {
        return {
          level: "Perlu Perhatian",
          message: "Hasil tes menunjukkan beberapa area yang perlu perhatian khusus.",
          color: "text-red-500",
          image: "https://images.unsplash.com/photo-1474050326267-c08284ae6bbb?q=80&w=1374&auto=format&fit=crop",
          recommendations: [
            "Konsultasikan hasil ini dengan profesional kesehatan mental",
            "Diskusikan dengan orang tua atau pengasuh tentang dukungan yang diperlukan",
            "Pertimbangkan penilaian lebih lanjut dari psikolog atau konselor"
          ]
        };
      } else {
        return {
          level: "Memerlukan Perhatian",
          message: "Terdapat beberapa area yang perlu diperhatikan dalam perkembangan mental dan sosial.",
          color: "text-yellow-500",
          image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1480&auto=format&fit=crop",
          recommendations: [
            "Perhatikan area yang menunjukkan tanda borderline",
            "Tingkatkan komunikasi dengan keluarga dan teman",
            "Cari aktivitas yang memperkuat kekuatan sosial dan emosional"
          ]
        };
      }
    };
    const overallResult = getOverallResult();
    const resultContent = (
      <div className="result-content text-center">
        <h3 className={`text-xl font-bold mb-4 ${overallResult.color}`}>{overallResult.level}</h3>
        <p className="mb-6">{overallResult.message}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-lg mx-auto">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Dimensi Kesulitan</h4>
            <p className={`font-bold ${overallResult.color}`}>{sdqResults.difficultyLevel}</p>
            <p>Skor: {sdqResults.difficultyScore}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Dimensi Kekuatan</h4>
            <p className={`font-bold ${overallResult.color}`}>{sdqResults.strengthLevel}</p>
            <p>Skor: {sdqResults.strengthScore}</p>
          </div>
        </div>
        <img
          src={overallResult.image}
          alt="Result illustration"
          className="mx-auto mb-6 rounded-lg max-w-sm"
        />
        <div className="recommendations mt-6">
          <h4 className="font-semibold mb-2">Rekomendasi:</h4>
          <ul className="space-y-2 text-left max-w-md mx-auto">
            {overallResult.recommendations.map((rec, index) => (
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
    await saveTestResults(overallResult.level, sdqResults.difficultyScore);
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
      <div className="mb-6">
        <h3 className="text-base font-medium mb-3">Pilih Kelompok Usia</h3>
        <div className="flex gap-4">
          <Button variant={ageGroup === "younger" ? "default" : "outline"} onClick={() => setAgeGroup("younger")} className="flex-1">
            Anak &lt; 11 tahun
          </Button>
          <Button variant={ageGroup === "older" ? "default" : "outline"} onClick={() => setAgeGroup("older")} className="flex-1">
            Remaja 11-18 tahun
          </Button>
        </div>
      </div>
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

export default SDQTest;

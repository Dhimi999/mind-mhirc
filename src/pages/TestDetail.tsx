import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronLeft, User, CheckCircle2, ChevronRight } from 'lucide-react';
import TestPersonSelector, { OtherPersonData } from '@/components/TestPersonSelector';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import AnonymousUserForm, { AnonymousUserData } from '@/components/AnonymousUserForm';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Define local interfaces for question types to match what we're using in the component
type TestQuestionType = {
  id: number;
  text: string;
  options?: string[];
  correctAnswer?: string;
};
type TestStatus = 'not-started' | 'in-progress' | 'completed';
type TestPersonType = 'self' | 'other' | 'anonymous' | null;

// Define a local interface that extends TestData from the import for our specific needs
interface LocalTestData {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: TestQuestionType[];
  resultDescription?: string | React.ReactNode;
}

// Define the BFI results interface
interface BFIResults {
  dominantTrait: string;
  percentages: Record<string, number>;
  dimensions: Record<string, number>;
}

// Define the test result data interface
interface TestResultData {
  test_id: string;
  test_title: string;
  answers: string[];
  result_summary: string;
  user_id: string | null;
  anonymous_name?: string | null;
  anonymous_email?: string | null;
  anonymous_age?: string | null;
  for_other: boolean;
  other_person_name?: string | null;
  bfi_results?: BFIResults;
  sdq_results?: {
    difficultyScore: number;
    strengthScore: number;
    age: string;
    difficultyLevel: string;
    strengthLevel: string;
  };
}
const TestDetail = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const [test, setTest] = useState<LocalTestData | undefined>(undefined);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [testStatus, setTestStatus] = useState<TestStatus>('not-started');
  const [testPerson, setTestPerson] = useState<TestPersonType>(null);
  const [otherPersonData, setOtherPersonData] = useState<OtherPersonData | null>(null);
  const [anonymousData, setAnonymousData] = useState<AnonymousUserData | null>(null);
  const [testResult, setTestResult] = useState<string | React.ReactNode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const {
    user,
    isAuthenticated
  } = useAuth();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [ageGroup, setAgeGroup] = useState<'younger' | 'older'>('older');
  useEffect(() => {
    if (!id) return;

    // Import this way to avoid the TS error
    import('@/data/testsData').then(module => {
      const testsData = module.default;
      const foundTest = testsData[id]; // Access by key instead of using find

      if (foundTest) {
        // Adapt the imported data to our local interface
        const adaptedTest: LocalTestData = {
          id: foundTest.id,
          title: foundTest.title,
          description: foundTest.description,
          duration: parseInt(foundTest.duration.toString()),
          // Convert to number
          questions: foundTest.questions
        };
        setTest(adaptedTest);
      } else {
        navigate('/tests');
      }
    });
  }, [id, navigate]);
  const handleTestPersonSelection = (option: 'self' | 'other', data?: OtherPersonData) => {
    setTestPerson(option);
    if (option === 'other' && data) {
      setOtherPersonData(data);
    }
    if (isAuthenticated && option === 'self') {
      setIsConfirmed(true); // Only show confirmation for logged-in users
    } else {
      startTest(); // For guests or 'other' person, proceed directly
    }
  };
  const handleStartTest = () => {
    startTest();
  };
  const handleAnonymousSubmit = (data: AnonymousUserData) => {
    setAnonymousData(data);
    setTestPerson('anonymous');
    startTest();
  };
  const startTest = () => {
    if (!test) return;
    setTestStatus('in-progress');
    setUserAnswers(Array(test.questions.length).fill(''));
  };
  const selectAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };
  const goToNextQuestion = () => {
    if (currentQuestionIndex < (test?.questions.length ?? 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const calculateBFIResults = (answers: string[]) => {
    if (!test || test.id !== 'bfi') return null;

    // Convert Likert scale answers to numeric values
    const numericValues = answers.map(answer => {
      switch (answer) {
        case 'Sangat Setuju':
          return 5;
        case 'Setuju':
          return 4;
        case 'Netral':
          return 3;
        case 'Tidak Setuju':
          return 2;
        case 'Sangat Tidak Setuju':
          return 1;
        default:
          return 0;
      }
    });

    // Calculate raw scores per dimension
    const reversedScore = (index: number) => 6 - numericValues[index]; // 5->1, 4->2, etc.

    const dimensions = {
      extraversion: reversedScore(0) + numericValues[5],
      // 1R + 6
      agreeableness: reversedScore(6) + numericValues[1],
      // 7R + 2
      conscientiousness: reversedScore(2) + numericValues[7],
      // 3R + 8
      neuroticism: reversedScore(3) + numericValues[8],
      // 4R + 9
      openness: reversedScore(4) + numericValues[9] // 5R + 10
    };

    // Calculate total score
    const totalScore = Object.values(dimensions).reduce((sum, score) => sum + score, 0);

    // Calculate percentages
    const percentages = {
      extraversion: Math.round(dimensions.extraversion / totalScore * 100),
      agreeableness: Math.round(dimensions.agreeableness / totalScore * 100),
      conscientiousness: Math.round(dimensions.conscientiousness / totalScore * 100),
      neuroticism: Math.round(dimensions.neuroticism / totalScore * 100),
      openness: Math.round(dimensions.openness / totalScore * 100)
    };

    // Find dominant trait
    let dominantTrait = '';
    let highestPercentage = 0;
    for (const [trait, percentage] of Object.entries(percentages)) {
      if (percentage > highestPercentage) {
        highestPercentage = percentage;
        dominantTrait = trait;
      }
    }
    return {
      dominantTrait,
      percentages,
      dimensions
    };
  };
  const calculateSDQResults = (answers: string[]) => {
    if (!test || test.id !== 'sdq') return null;

    // Convert text answers to numeric values
    const numericValues = answers.map(answer => {
      switch (answer) {
        case 'Selalu Benar':
          return 2;
        case 'Agak Benar':
          return 1;
        case 'Tidak Benar':
          return 0;
        default:
          return 0;
      }
    });

    // Calculate strength score (items 1, 4, 9, 17, 20)
    const strengthItems = [0, 3, 8, 16, 19]; // Adjusting for 0-indexed array
    const strengthScore = strengthItems.reduce((sum, itemIndex) => sum + numericValues[itemIndex], 0);

    // Calculate difficulty score (all other items)
    const difficultyItems = Array.from({
      length: 25
    }, (_, i) => i).filter(i => !strengthItems.includes(i));
    const difficultyScore = difficultyItems.reduce((sum, itemIndex) => sum + numericValues[itemIndex], 0);

    // Determine difficulty level based on age
    let difficultyLevel = '';
    if (ageGroup === 'younger') {
      // Usia < 11 tahun
      if (difficultyScore <= 13) difficultyLevel = 'Normal';else if (difficultyScore <= 15) difficultyLevel = 'Borderline';else difficultyLevel = 'Abnormal';
    } else {
      // Usia 11-18 tahun
      if (difficultyScore <= 15) difficultyLevel = 'Normal';else if (difficultyScore <= 19) difficultyLevel = 'Borderline';else difficultyLevel = 'Abnormal';
    }

    // Determine strength level based on age
    let strengthLevel = '';
    if (ageGroup === 'younger') {
      // Usia < 11 tahun
      if (strengthScore >= 6) strengthLevel = 'Normal';else if (strengthScore === 5) strengthLevel = 'Borderline';else strengthLevel = 'Abnormal';
    } else {
      // Usia 11-18 tahun
      if (strengthScore >= 7) strengthLevel = 'Normal';else if (strengthScore >= 5) strengthLevel = 'Borderline';else strengthLevel = 'Abnormal';
    }
    return {
      difficultyScore,
      strengthScore,
      age: ageGroup === 'younger' ? '< 11 tahun' : '11-18 tahun',
      difficultyLevel,
      strengthLevel
    };
  };
  const saveTestResults = async (resultMessage: string) => {
    if (!test) return;
    setIsSaving(true);
    try {
      const testResultData: TestResultData = {
        test_id: test.id,
        test_title: test.title,
        answers: userAnswers,
        result_summary: resultMessage,
        user_id: isAuthenticated ? user?.id : null,
        anonymous_name: anonymousData?.name,
        anonymous_email: anonymousData?.email,
        anonymous_age: anonymousData?.age,
        for_other: testPerson === 'other',
        other_person_name: otherPersonData?.name
      };
      if (test?.id === 'bfi') {
        const bfiResults = calculateBFIResults(userAnswers);
        if (bfiResults) {
          testResultData.bfi_results = bfiResults;
        }
      }
      if (test?.id === 'sdq') {
        const sdqResults = calculateSDQResults(userAnswers);
        if (sdqResults) {
          testResultData.sdq_results = sdqResults;
        }
      }
      const {
        error
      } = await supabase.from('test_results').insert([testResultData]);
      if (error) {
        console.error('Error saving test results:', error);
        toast({
          title: "Gagal menyimpan hasil",
          description: "Terjadi kesalahan saat menyimpan hasil tes. Mohon coba lagi.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Hasil tes disimpan",
          description: "Hasil tes Anda telah berhasil disimpan."
        });
      }
    } catch (error) {
      console.error('Error in saveTestResults:', error);
      toast({
        title: "Terjadi kesalahan",
        description: "Mohon coba lagi nanti.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const finishTest = () => {
    if (!test) return;
    setTestStatus('completed');

    // We'll calculate a generic result since we can't rely on correctAnswer property
    import('@/data/testsData').then(module => {
      let resultMessage: string | React.ReactNode = 'Terima kasih telah menyelesaikan tes ini.';
      let resultSummary = '';
      const testId = test.id;
      // Using the test ID to determine which result function to call
      if (testId === 'srq') {
        // Count "Ya" answers as 1 point each
        const score = userAnswers.filter(answer => answer === 'Ya').length;
        const result = module.getTestResultSRQ(score);
        resultSummary = `Level: ${result.level} - ${result.message}`;
        resultMessage = <div className="result-content text-center">
            <h3 className={`text-xl font-bold mb-4 ${result.color}`}>
              {result.level}
            </h3>
            <p className="mb-6">{result.message}</p>
            <img src={result.image} alt="Result illustration" className="mx-auto mb-6 rounded-lg max-w-sm" />
            <div className="recommendations mt-6">
              <h4 className="font-semibold mb-2">Rekomendasi:</h4>
              <ul className="space-y-2 text-left max-w-md mx-auto">
                {result.recommendations.map((rec, index) => <li key={index} className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>)}
              </ul>
            </div>
          </div>;
      } else if (testId === 'sas-sv') {
        // Use a simplified scoring for SAS
        const score = userAnswers.length; // Just as an example
        const result = module.getTestResultSAS(score);
        resultSummary = `Level: ${result.level} - ${result.message}`;
        resultMessage = <div className="result-content text-center">
            <h3 className={`text-xl font-bold mb-4 ${result.color}`}>
              {result.level}
            </h3>
            <p className="mb-6">{result.message}</p>
            <img src={result.image} alt="Result illustration" className="mx-auto mb-6 rounded-lg max-w-sm" />
            <div className="recommendations mt-6">
              <h4 className="font-semibold mb-2">Rekomendasi:</h4>
              <ul className="space-y-2 text-left max-w-md mx-auto">
                {result.recommendations.map((rec, index) => <li key={index} className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>)}
              </ul>
            </div>
          </div>;
      } else if (testId === 'bfi') {
        // Calculate BFI results
        const bfiResults = calculateBFIResults(userAnswers);
        if (bfiResults) {
          const {
            dominantTrait,
            percentages
          } = bfiResults;

          // Map trait names for display
          const traitNames: Record<string, string> = {
            extraversion: 'Extraversion',
            agreeableness: 'Agreeableness',
            conscientiousness: 'Conscientiousness',
            neuroticism: 'Neuroticism',
            openness: 'Openness'
          };

          // Create descriptions for each trait
          const traitDescriptions: Record<string, string> = {
            extraversion: "cenderung menikmati interaksi sosial dan merasa terstimulasi oleh lingkungan di sekitarnya. Orang dengan Ekstraversi yang tinggi sering kali energik, antusias, dan merasa nyaman dalam keramaian. Individu yang ekstrover cenderung memiliki kepercayaan diri yang tinggi, senang mengambil inisiatif dalam situasi sosial, dan sering kali menjadi pusat perhatian. Mereka juga biasanya lebih optimis dan mampu menginspirasi orang lain dengan semangat serta energi positif yang mereka pancarkan. Di sisi lain, mereka mungkin kadang-kadang kurang menyadari kebutuhan untuk waktu sendiri guna mengisi ulang energi.",
            agreeableness: "mudah bekerjasama, bersahabat, penuh kepercayaan, dan hangat. Individu dengan tingkat agreeableness yang tinggi biasanya memiliki empati yang baik, mampu memahami perasaan orang lain, dan cenderung mengutamakan kerjasama serta keharmonisan dalam hubungan. Mereka dipercaya, penuh kepercayaan, dan selalu berusaha untuk menghindari konflik. Kelebihan ini membuat mereka mudah diajak bekerja sama dalam tim dan lingkungan sosial, meskipun terkadang sikap yang terlalu mengalah atau kompromistis bisa membuat mereka rentan terhadap manipulasi.",
            conscientiousness: "terorganisir, disiplin, dan berorientasi pada pencapaian. Orang dengan Conscientiouness yang tinggi biasanya menetapkan tujuan yang jelas, memiliki perencanaan yang baik, dan sangat bertanggung jawab dalam menyelesaikan tugas. Sifat teliti dan perhatian terhadap detail memungkinkan mereka untuk bekerja secara konsisten dan mencapai hasil yang maksimal. Sementara kelebihan ini sangat mendukung kesuksesan dalam berbagai bidang, kecenderungan untuk perfeksionis atau terlalu kaku dalam mengikuti aturan kadang bisa menghambat fleksibilitas dan spontanitas dalam situasi yang membutuhkan kreativitas.",
            neuroticism: "cenderung mengalami emosi negatif seperti kecemasan, kemarahan, atau depresi. Trait neuroticism mengacu pada kecenderungan seseorang untuk mengalami emosi negatif dengan intensitas yang lebih tinggi. Individu dengan skor neuroticism yang tinggi cenderung mudah merasa cemas, khawatir, atau marah dalam menghadapi stres atau situasi yang tidak pasti. Mereka sering kali memiliki respons emosional yang kuat terhadap tantangan, dan mungkin kesulitan mengelola perasaan negatif seperti frustrasi, depresi, atau ketidakamanan. Meskipun demikian, tingkat neuroticism yang moderat juga dapat meningkatkan kesadaran diri dan sensitivitas terhadap risiko, asalkan tidak mengganggu kesejahteraan secara keseluruhan.",
            openness: "memiliki minat intelektual, berpikiran terbuka, dan imajinatif. Openness menggambarkan tingkat keterbukaan seseorang terhadap pengalaman baru, ide-ide kreatif, dan pemikiran abstrak. Individu yang tinggi pada trait ini memiliki rasa ingin tahu yang besar dan cenderung berpikiran terbuka terhadap berbagai perspektif. Mereka menikmati eksplorasi intelektual, memiliki imajinasi yang kuat, dan seringkali menemukan solusi inovatif untuk masalah. Keingintahuan dan kecenderungan untuk bereksperimen memungkinkan mereka untuk menikmati seni, budaya, dan diskusi filosofis. Namun, mereka juga mungkin terlihat tidak konvensional atau sulit diprediksi dalam beberapa situasi, karena kecenderungan untuk mencari pengalaman yang berbeda dari norma yang ada."
          };

          // Define colors for each trait
          const traitColors: Record<string, string> = {
            extraversion: "bg-yellow-500",
            agreeableness: "bg-green-500",
            conscientiousness: "bg-blue-500",
            neuroticism: "bg-purple-500",
            openness: "bg-red-500"
          };

          // Build recommendations based on dominant trait
          const recommendations: string[] = ["Kepribadian ini hanya indikasi umum dan bukan diagnosis profesional", "Kenali kekuatan kepribadian Anda dan manfaatkan dalam kehidupan sehari-hari", "Terus kembangkan aspek kepribadian positif yang Anda miliki"];

          // Add specific recommendations based on dominant trait
          if (dominantTrait === "extraversion") {
          recommendations.push("Gunakan kekuatan sosial Anda untuk membangun jaringan yang lebih luas");
          recommendations.push("Luangkan waktu untuk merenung dan meresapi pengalaman pribadi di tengah aktivitas sosial");
          recommendations.push("Ikuti kegiatan komunitas untuk memperkuat koneksi interpersonal");
          recommendations.push("Tingkatkan kemampuan komunikasi agar hubungan Anda semakin bermakna");
          recommendations.push("Manfaatkan energi positif Anda untuk menginspirasi orang di sekitar");
        } else if (dominantTrait === "agreeableness") {
          recommendations.push("Belajar menetapkan batas agar kebutuhan pribadi tetap terpenuhi");
          recommendations.push("Manfaatkan empati Anda untuk mendukung orang lain sambil menjaga keseimbangan diri");
          recommendations.push("Luangkan waktu untuk mengeksplorasi minat pribadi secara mandiri");
          recommendations.push("Ungkapkan pendapat Anda dengan asertif tanpa mengurangi kebaikan hati");
          recommendations.push("Ciptakan ruang bagi diri sendiri agar tidak selalu mengorbankan kepentingan orang lain");
        } else if (dominantTrait === "conscientiousness") {
          recommendations.push("Jangan terlalu keras pada diri sendiri saat menghadapi kegagalan kecil");
          recommendations.push("Gunakan disiplin Anda untuk menetapkan dan mencapai tujuan jangka panjang secara bertahap");
          recommendations.push("Ambil waktu istirahat yang cukup untuk menjaga produktivitas dan kesehatan");
          recommendations.push("Eksplorasi metode kerja baru yang dapat meningkatkan efisiensi tanpa mengorbankan kualitas");
          recommendations.push("Refleksikan pencapaian Anda untuk terus belajar dari setiap pengalaman");
        } else if (dominantTrait === "neuroticism") {
          recommendations.push("Kembangkan strategi manajemen stres seperti meditasi atau olahraga secara rutin");
          recommendations.push("Luangkan waktu untuk teknik relaksasi dan mindfulness guna meredakan kecemasan");
          recommendations.push("Pertimbangkan konsultasi dengan profesional jika emosi negatif mulai mengganggu aktivitas");
          recommendations.push("Catat dan evaluasi pemicu emosi agar dapat mengidentifikasi pola reaksi diri");
          recommendations.push("Ciptakan rutinitas harian yang mendukung keseimbangan emosi dan kesehatan mental");
        } else if (dominantTrait === "openness") {
          recommendations.push("Eksplorasi minat baru yang dapat memperluas wawasan dan kreativitas Anda");
          recommendations.push("Gabungkan ide-ide inovatif dalam pemecahan masalah sehari-hari untuk hasil yang optimal");
          recommendations.push("Luangkan waktu untuk membaca dan mendalami topik-topik yang belum pernah Anda eksplorasi");
          recommendations.push("Terlibat dalam kegiatan seni atau musik untuk menyalurkan kreativitas secara bebas");
          recommendations.push("Berpartisipasilah dalam diskusi yang menantang pemikiran konvensional dan memperkaya perspektif");
        }
          resultSummary = `Dominan: ${traitNames[dominantTrait]}`;
          resultMessage = <div className="result-content text-center">
              <h3 className={`text-xl font-bold mb-4 text-${traitColors[dominantTrait].replace('bg-', '')}`}>
                {traitNames[dominantTrait]}
              </h3>
              <p className="mb-6">
                Anda memiliki dominasi kepribadian<strong> {traitNames[dominantTrait]} ({percentages[dominantTrait]}%)</strong>, yang berarti Anda {traitDescriptions[dominantTrait]}.
              </p>
              
              <div className="mt-8 mb-8">
                <h4 className="font-semibold mb-4">Distribusi Dimensi Kepribadian:</h4>
                <div className="space-y-3 max-w-md mx-auto">
                  {Object.entries(percentages).map(([trait, percentage]) => <div key={trait} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{traitNames[trait]}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div className={`${traitColors[trait]} h-2.5 rounded-full`} style={{
                      width: `${percentage}%`
                    }}></div>
                      </div>
                    </div>)}
                </div>
              </div>
              
              <div className="recommendations mt-6">
                <h4 className="font-semibold mb-2">Rekomendasi:</h4>
                <ul className="space-y-2 text-left max-w-md mx-auto">
                  {recommendations.map((rec, index) => <li key={index} className="flex items-start">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>)}
                </ul>
              </div>
            </div>;
        }
      } else if (testId === 'sdq') {
        // Calculate SDQ results
        const sdqResults = calculateSDQResults(userAnswers);
        if (sdqResults) {
          const {
            difficultyScore,
            strengthScore,
            difficultyLevel,
            strengthLevel,
            age
          } = sdqResults;

          // Define colors for each level
          const getLevelColor = (level: string) => {
            switch (level) {
              case 'Normal':
                return "text-green-500";
              case 'Borderline':
                return "text-yellow-500";
              case 'Abnormal':
                return "text-red-500";
              default:
                return "text-gray-500";
            }
          };

          // Get overall result
          const getOverallResult = () => {
            if (difficultyLevel === 'Normal' && strengthLevel === 'Normal') {
              return {
                level: "Normal",
                message: "Perkembangan mental dan sosial Anda tampak dalam kondisi baik.",
                color: "text-green-500",
                image: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?q=80&w=1470&auto=format&fit=crop",
                recommendations: ["Pertahankan pola interaksi sosial yang positif", "Terus kembangkan keterampilan sosial dan emosional", "Jaga keseimbangan antara aktivitas akademik dan sosial"]
              };
            } else if (difficultyLevel === 'Abnormal' || strengthLevel === 'Abnormal') {
              return {
                level: "Perlu Perhatian",
                message: "Hasil tes menunjukkan beberapa area yang perlu perhatian dan dukungan khusus.",
                color: "text-red-500",
                image: "https://images.unsplash.com/photo-1474050326267-c08284ae6bbb?q=80&w=1374&auto=format&fit=crop",
                recommendations: ["Konsultasikan hasil ini dengan profesional kesehatan mental", "Diskusikan dengan orang tua atau pengasuh tentang dukungan yang diperlukan", "Pertimbangkan untuk mendapatkan penilaian lebih lanjut dari psikolog atau konselor", "Kembangkan strategi untuk mengelola area yang menunjukkan kesulitan"]
              };
            } else {
              return {
                level: "Memerlukan Perhatian",
                message: "Terdapat beberapa area yang perlu diperhatikan dalam perkembangan mental dan sosial.",
                color: "text-yellow-500",
                image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1480&auto=format&fit=crop",
                recommendations: ["Perhatikan perkembangan area yang menunjukkan tanda borderline", "Tingkatkan komunikasi dengan keluarga dan teman", "Cari aktivitas yang dapat memperkuat kekuatan sosial dan emosional", "Pantau perubahan perilaku dan perasaan secara berkala"]
              };
            }
          };
          const overallResult = getOverallResult();
          resultSummary = `Level: ${overallResult.level}`;
          resultMessage = <div className="result-content text-center">
              <h3 className={`text-xl font-bold mb-4 ${overallResult.color}`}>
                {overallResult.level}
              </h3>
              <p className="mb-6">{overallResult.message}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 max-w-lg mx-auto">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Dimensi Kesulitan</h4>
                  <p className={`font-bold ${getLevelColor(difficultyLevel)}`}>{difficultyLevel}</p>
                  <p>Skor: {difficultyScore}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Dimensi Kekuatan</h4>
                  <p className={`font-bold ${getLevelColor(strengthLevel)}`}>{strengthLevel}</p>
                  <p>Skor: {strengthScore}</p>
                </div>
              </div>
              
              <img src={overallResult.image} alt="Result illustration" className="mx-auto mb-6 rounded-lg max-w-sm" />
              
              <div className="recommendations mt-6">
                <h4 className="font-semibold mb-2">Rekomendasi:</h4>
                <ul className="space-y-2 text-left max-w-md mx-auto">
                  {overallResult.recommendations.map((rec, index) => <li key={index} className="flex items-start">
                      <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>)}
                </ul>
              </div>
            </div>;
        }
      } else {
        // Default message
        resultSummary = "Tes selesai";
        resultMessage = <div className="text-center">
            <p>Terima kasih telah mengisi tes. Jawaban Anda telah disimpan.</p>
          </div>;
      }
      setTestResult(resultMessage);
      // Save test results to Supabase
      saveTestResults(resultSummary);
    });
  };
  const renderTestContent = () => {
    switch (testStatus) {
      case 'not-started':
        return <div className="test-not-started bg-white rounded-xl shadow-soft p-8 max-w-xl mx-auto mt-12 my-[24px]">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Siapa yang akan mengikuti tes ini?</h2>
              <p className="text-muted-foreground">
                Pilih untuk siapa tes ini akan diisi
              </p>
            </div>

            {isAuthenticated ? isConfirmed ? <div className="space-y-6 text-center">
                  <p className="text-center font-medium">Saya sudah siap mengikuti tes ini</p>
                  <Button onClick={handleStartTest} className="w-full">
                    Mulai Tes <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div> : <TestPersonSelector onSelectOption={handleTestPersonSelection} isProfessional={user?.account_type === 'professional'} /> : <div className="space-y-6">
                <AnonymousUserForm onSubmit={handleAnonymousSubmit} />
              </div>}
          </div>;
      case 'in-progress':
        return <div className="test-in-progress bg-white rounded-xl shadow-soft p-8 max-w-2xl mx-auto">
            {test && <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold">
                    Soal {currentQuestionIndex + 1} dari {test.questions.length}
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    {testPerson === 'self' ? 'Untuk Diri Sendiri' : testPerson === 'anonymous' ? `Untuk: ${anonymousData?.name}` : `Untuk: ${otherPersonData?.name || '-'}`}
                  </div>
                </div>
                
                <div className="mb-8">
                  <div className="w-full bg-muted rounded-full h-2 mb-6">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out" style={{
                  width: `${(currentQuestionIndex + 1) / test.questions.length * 100}%`
                }}></div>
                  </div>
                  <p className="text-lg font-medium mb-6">{test.questions[currentQuestionIndex].text}</p>
                </div>
                
                <div className="options-container space-y-3">
                  {(() => {
                // Get the question
                const question = test.questions[currentQuestionIndex];

                // Handle binary options (Yes/No)
                if (test.id === 'srq') {
                  return ['Ya', 'Tidak'].map((option, index) => <div key={index} className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${userAnswers[currentQuestionIndex] === option ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`} onClick={() => selectAnswer(option)}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${userAnswers[currentQuestionIndex] === option ? 'border-primary' : 'border-muted-foreground'}`}>
                              {userAnswers[currentQuestionIndex] === option && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                            </div>
                            <span className="font-medium">{option}</span>
                          </div>
                        </div>);
                }

                // Handle SDQ options
                if (test.id === 'sdq') {
                  return ['Tidak Benar', 'Agak Benar', 'Selalu Benar'].map((option, index) => <div key={index} className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${userAnswers[currentQuestionIndex] === option ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`} onClick={() => selectAnswer(option)}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${userAnswers[currentQuestionIndex] === option ? 'border-primary' : 'border-muted-foreground'}`}>
                              {userAnswers[currentQuestionIndex] === option && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                            </div>
                            <span className="font-medium">{option}</span>
                          </div>
                        </div>);
                }

                // If there are options in the data (from the import) use those
                return ['Sangat Setuju', 'Setuju', 'Netral', 'Tidak Setuju', 'Sangat Tidak Setuju'].map((option, index) => <div key={index} className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${userAnswers[currentQuestionIndex] === option ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'}`} onClick={() => selectAnswer(option)}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${userAnswers[currentQuestionIndex] === option ? 'border-primary' : 'border-muted-foreground'}`}>
                            {userAnswers[currentQuestionIndex] === option && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                          </div>
                          <span className="font-medium">{option}</span>
                        </div>
                      </div>);
              })()}
                </div>
                
                <div className="navigation-buttons mt-8 flex justify-between">
                  <Button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0} variant="outline">
                    Sebelumnya
                  </Button>
                  
                  {currentQuestionIndex < test.questions.length - 1 ? <Button onClick={goToNextQuestion} disabled={!userAnswers[currentQuestionIndex]}>
                      Selanjutnya
                    </Button> : <Button onClick={finishTest} disabled={!userAnswers[currentQuestionIndex] || isSaving}>
                      {isSaving ? "Menyimpan..." : "Selesai"}
                    </Button>}
                </div>
              </>}
          </div>;
      case 'completed':
        return <div className="test-completed bg-white rounded-xl shadow-soft p-8 max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">{test?.title}</h2>
            </div>
            
            {testResult && <div className="result-content mt-8 bg-card p-6 rounded-lg border">
                {testResult as React.ReactNode}
              </div>}
            
            <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center">
              {!isAuthenticated && <Link to="/login">
                  <Button variant="outline" className="w-full md:w-auto">
                    Daftar untuk Menyimpan Hasil
                  </Button>
                </Link>}
              <Link to="/tests">
                <Button className="w-full md:w-auto">
                  Kembali ke Daftar Tes
                </Button>
              </Link>
            </div>
          </div>;
      default:
        return null;
    }
  };
  const renderAgeGroupSelection = () => {
    if (test?.id === 'sdq' && testStatus === 'not-started' && (isConfirmed || !isAuthenticated)) {
      return <div className="mb-6 bg-card p-4 rounded-lg border">
          <h3 className="text-base font-medium mb-3">Pilih Kelompok Usia</h3>
          <div className="flex gap-4">
            <Button variant={ageGroup === 'younger' ? 'default' : 'outline'} onClick={() => setAgeGroup('younger')} className="flex-1">
              Anak &lt; 11 tahun
            </Button>
            <Button variant={ageGroup === 'older' ? 'default' : 'outline'} onClick={() => setAgeGroup('older')} className="flex-1">
              Remaja 11-18 tahun
            </Button>
          </div>
        </div>;
    }
    return null;
  };
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="test-detail-page container mx-auto pt-24 pb-8 px-4 flex-1">
        <Link to="/tests" className="back-button inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="mr-1" />
          Kembali ke Daftar Tes
        </Link>
        
        {test ? <div className="test-content">
            {testStatus !== 'in-progress' && testStatus !== 'completed' && <div className="mb-8 bg-white rounded-xl shadow-soft p-8 max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-3 text-center">{test.title}</h1>
                <p className="text-muted-foreground mb-6 text-xs text-center">{test.description}</p>
                
                {/* SRQ test description */}
                {test.id === 'srq' && <div className="mt-6 p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-xl font-semibold mb-3">Tentang Tes Ini</h3>
                    <p className="mb-4">Pengukuran Online SRQ20 (Self Rating Questionnaire) kuesioner yang dikembangkan oleh World Health Organization (WHO) untuk skrining gangguan psikiatri clan untuk keperluan penelitian. Riset Kesehatan Dasar (Riskesdas) 2007 menggunakan SRQ untuk menilai kesehatan jiwa penduduk Indonesia.</p>
                    <p>
                      <span className="font-medium">Petunjuk:</span> Bacalah petunjuk ini seluruhnya sebelum mulai mengisi. Pertanyaan berikut berhubungan dengan masalah yang mungkin mengganggu Anda selama 30 hari terakhir. Apabila Anda menganggap pertanyaan itu berlaku bagi Anda dan Anda mengalami masalah yang disebutkan dalam 30 hari terakhir.
                    </p>
                  </div>}
                
                {/* SAS-SV test description */}
                {test.id === 'sas-sv' && <div className="mt-6 p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-xl font-semibold mb-3">Tentang Tes Ini</h3>
                    <p className="mb-4">
                      Smartphone Addiction Scale (SAS) adalah alat untuk mengukur tingkat kecanduan seseorang terhadap smartphone. Tes ini membantu mengidentifikasi pola penggunaan smartphone yang berlebihan dan dampaknya terhadap kehidupan sehari-hari.
                    </p>
                    <p>
                      <span className="font-medium">Petunjuk:</span> Jawablah pertanyaan-pertanyaan berikut sesuai dengan pengalaman Anda dalam menggunakan smartphone selama 6 bulan terakhir. Pilih jawaban yang paling menggambarkan kondisi Anda.
                    </p>
                  </div>}
                
                {/* BFI-10 test description */}
                {test.id === 'bfi' && <div className="mt-6 p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-xl font-semibold mb-3">Tentang Tes Ini</h3>
                    <p className="mb-4">
                      Big Five Inventory (BFI) adalah alat ukur yang dirancang untuk menilai kepribadian individu berusia 18 tahun ke atas. BFI-10 adalah versi sederhana dari versi aslinya terdiri dari 44 item. BFI merepresentasikan lima faktor kepribadian: agreeableness (keramahan), neuroticism (neurotisisme), conscientiousness (ketelitian), openness (keterbukaan), dan extraversion (ekstroversi).
                    </p>
                    <p>
                      <span className="font-medium">Petunjuk:</span> Anda akan diberikan beberapa karakteristik yang mungkin menggambarkan diri Anda. Bacalah setiap pernyataan dan pilih opsi yang paling sesuai dengan Anda, mulai sangat setuju atau sangat tidak setuju dengan pernyataan tersebut.
                    </p>
                  </div>}
                
                {/* SDQ test description */}
                {test.id === 'sdq' && <div className="mt-6 p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-xl font-semibold mb-3">Tentang Tes Ini</h3>
                    <p className="mb-4">
                      Strengths and Difficulties Questionnaire (SDQ) adalah instrumen penilaian yang digunakan untuk mengukur berbagai aspek perilaku, emosi, dan hubungan sosial pada anak (usia &lt;11 tahun) dan remaja (11-18 tahun). Kuesioner ini membantu mengidentifikasi kekuatan (strengths) serta kesulitan (difficulties) yang mungkin dialami seseorang, sehingga dapat memberikan gambaran tentang kondisi psikologis dan perilaku mereka.
                    </p>
                    <p>
                      <span className="font-medium">Petunjuk:</span> Bacalah setiap pernyataan dengan saksama, lalu tentukan jawaban yang paling sesuai dengan kondisi Anda selama enam bulan terakhir, apakah "Tidak Benar", "Agak Benar", atau "Selalu Benar." Isilah kuesioner ini secara jujur berdasarkan pengalaman dan pengamatan Anda sehari-hari, termasuk bagaimana Anda berinteraksi dengan orang lain, mengelola emosi, serta menghadapi berbagai situasi. Jika Anda ragu, pilihlah opsi yang paling mendekati kenyataan.
                    </p>
                  </div>}

                {renderAgeGroupSelection()}
              </div>}
            
            {renderTestContent()}
          </div> : <div className="flex justify-center items-center py-20">
            <div className="animate-pulse flex flex-col items-center gap-4">
              <div className="h-8 bg-muted rounded w-64"></div>
              <div className="h-4 bg-muted rounded w-96"></div>
              <div className="h-64 bg-muted rounded w-full max-w-xl mt-8"></div>
            </div>
          </div>}
      </div>
    </div>;
};
export default TestDetail;

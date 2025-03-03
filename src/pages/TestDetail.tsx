import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ChevronLeft, User, CheckCircle2 } from 'lucide-react';
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
  const saveTestResults = async (resultMessage: string) => {
    if (!test) return;
    setIsSaving(true);
    try {
      const testResultData = {
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
        return <div className="test-not-started bg-white rounded-xl shadow-soft p-8 max-w-xl mx-auto mt-24 my-[24px]">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Siapa yang akan mengikuti tes ini?</h2>
              <p className="text-muted-foreground">
                Pilih untuk siapa tes ini akan diisi
              </p>
            </div>

            {isAuthenticated ? <TestPersonSelector onSelectOption={handleTestPersonSelection} isProfessional={user?.account_type === 'professional'} /> : <div className="space-y-6">
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
              <h2 className="text-2xl font-bold mb-2">Tes Selesai</h2>
              <p className="text-muted-foreground">
                Berikut adalah hasil dari tes yang Anda lakukan
              </p>
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
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="test-detail-page container mx-auto pt-24 pb-8 px-4 flex-1">
        <Link to="/tests" className="back-button inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="mr-1" />
          Kembali ke Daftar Tes
        </Link>
        
        {test ? <div className="test-content">
            {testStatus !== 'in-progress' && <div className="mb-8">
                <h1 className="text-3xl font-bold mb-3">{test.title}</h1>
                <p className="text-muted-foreground">{test.description}</p>
                
                {/* Add test description container */}
                {test.id === 'srq' && <div className="mt-6 p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-xl font-semibold mb-3">Tentang Tes Ini</h3>
                    <p className="mb-4">
                      Pengukuran Online SRQ20 (Self Rating Questionnaire) kuesioner yang dikembangkan oleh World Health Organization (WHO) untuk skrining gangguan psikiatri clan untuk keperluan penelitian. Riset Kesehatan Dasar (Riskesdas) 2007 menggunakan SRQ untuk menilai kesehatan jiwa penduduk Indonesia.
                    </p>
                    <p>
                      <span className="font-medium">Petunjuk:</span> Bacalah petunjuk ini seluruhnya sebelum mulai mengisi. Pertanyaan berikut berhubungan dengan masalah yang mungkin mengganggu Anda selama 30 hari terakhir. Apabila Anda menganggap pertanyaan itu berlaku bagi Anda dan Anda mengalami masalah yang disebutkan dalam 30 hari terakhir.
                    </p>
                  </div>}
                
                {test.id === 'sas-sv' && <div className="mt-6 p-6 bg-card rounded-xl border border-border">
                    <h3 className="text-xl font-semibold mb-3">Tentang Tes Ini</h3>
                    <p className="mb-4">
                      Smartphone Addiction Scale (SAS) adalah alat untuk mengukur tingkat kecanduan seseorang terhadap smartphone. Tes ini membantu mengidentifikasi pola penggunaan smartphone yang berlebihan dan dampaknya terhadap kehidupan sehari-hari.
                    </p>
                    <p>
                      <span className="font-medium">Petunjuk:</span> Jawablah pertanyaan-pertanyaan berikut sesuai dengan pengalaman Anda dalam menggunakan smartphone selama 6 bulan terakhir. Pilih jawaban yang paling menggambarkan kondisi Anda.
                    </p>
                  </div>}
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
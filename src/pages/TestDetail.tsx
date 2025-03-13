import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import TestPersonSelector, { OtherPersonData } from "@/components/TestPersonSelector";
import AnonymousUserForm, { AnonymousUserData } from "@/components/AnonymousUserForm";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Import komponen tes berdasarkan tipe
import SRQTest from "@/components/tests/SRQTest";
import SASSVTest from "@/components/tests/SASSVTest";
import BFITest from "@/components/tests/BFITest";
import SDQTest from "@/components/tests/SDQTest";

// Interface dan tipe lokal
export type TestStatus = "not-started" | "in-progress";
export type TestPersonType = "self" | "other" | "anonymous" | null;

export interface TestQuestionType {
  id: number;
  text: string;
  options?: string[];
  correctAnswer?: string;
}

export interface LocalTestData {
  id: string;
  title: string;
  description: string;
  duration: number;
  questions: TestQuestionType[];
  resultDescription?: string | React.ReactNode;
}

const TestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [test, setTest] = useState<LocalTestData | undefined>(undefined);
  const [testStatus, setTestStatus] = useState<TestStatus>("not-started");
  const [testPerson, setTestPerson] = useState<TestPersonType>(null);
  const [otherPersonData, setOtherPersonData] = useState<OtherPersonData | null>(null);
  const [anonymousData, setAnonymousData] = useState<AnonymousUserData | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!id) return;
    import("@/data/testsData").then((module) => {
      const testsData = module.default;
      const foundTest = testsData[id];
      if (foundTest) {
        const adaptedTest: LocalTestData = {
          id: foundTest.id,
          title: foundTest.title,
          description: foundTest.description,
          duration: parseInt(foundTest.duration.toString()),
          questions: foundTest.questions,
          resultDescription: foundTest.resultDescription
        };
        setTest(adaptedTest);
      } else {
        navigate("/tests");
      }
    });
  }, [id, navigate]);

  // Callback ketika peserta tes dipilih dan tes akan dimulai
  const handleStartTest = (person: TestPersonType, otherData?: OtherPersonData, anonData?: AnonymousUserData) => {
    setTestPerson(person);
    if (person === "other" && otherData) setOtherPersonData(otherData);
    if (person === "anonymous" && anonData) setAnonymousData(anonData);
    // Jika sudah login dan peserta self, bisa langsung konfirmasi
    if (person === "self") {
      setIsConfirmed(true);
    }
    // Ubah status tes menjadi "in-progress" untuk memulai tes
    setTestStatus("in-progress");
  };

  // Tampilan halaman pendahuluan (not-started)
  const renderNotStarted = () => {
    return (
      <div className="test-not-started bg-white rounded-xl shadow-soft p-8 max-w-xl mx-auto mt-12 my-6">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Siapa yang akan mengikuti tes ini?</h2>
          <p className="text-muted-foreground">Pilih untuk siapa tes ini akan diisi</p>
        </div>
        {/* Jika pengguna sudah login */}
        {/** Misalnya logika autentikasi di sini */}
        {isConfirmed ? (
          <div className="space-y-6 text-center">
            <p className="text-center font-medium">Saya sudah siap mengikuti tes ini</p>
            <Button onClick={() => handleStartTest("self")} className="w-full">
              Mulai Tes <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <TestPersonSelector onSelectOption={handleStartTest} />
            <div className="mt-4">
              <AnonymousUserForm onSubmit={(data) => handleStartTest("anonymous", undefined, data)} />
            </div>
          </>
        )}
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Tentang Tes Ini</h3>
          <p className="mb-4">{test?.description}</p>
        </div>
      </div>
    );
  };

  // Render komponen tes sesuai tipe tes
  const renderTestComponent = () => {
    if (!test) return null;
    switch (test.id) {
      case "srq":
        return <SRQTest test={test} />;
      case "sas-sv":
        return <SASSVTest test={test} />;
      case "bfi":
        return <BFITest test={test} />;
      case "sdq":
        return <SDQTest test={test} />;
      default:
        return <div>Tipe tes tidak dikenali.</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="test-detail-page container mx-auto pt-24 pb-8 px-4 flex-1">
        <Link
          to="/tests"
          className="back-button inline-flex items-center mb-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="mr-1" /> Kembali ke Daftar Tes
        </Link>
        {testStatus === "not-started" ? renderNotStarted() : renderTestComponent()}
      </div>
    </div>
  );
};

export default TestDetail;

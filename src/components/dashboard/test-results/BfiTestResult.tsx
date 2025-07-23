
interface TestResultProps {
  testResult: any;
  userName: string | null;
}

const BfiTestResult = ({ testResult, userName }: TestResultProps) => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">
        Detail Hasil Tes: BFI-10 (Big Five Inventory-10)
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

      {/* Interpretasi Hasil */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Interpretasi Hasil</h3>
        <p className="text-gray-700 mb-2">
          BFI-10 mengukur lima dimensi kepribadian utama (Big Five):
        </p>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <strong>Extraversion (E):</strong> Tingkat keaktifan sosial dan kecenderungan untuk mencari stimulasi dari luar
          </li>
          <li>
            <strong>Agreeableness (A):</strong> Kecenderungan untuk bersikap kooperatif dan mengutamakan harmoni sosial
          </li>
          <li>
            <strong>Conscientiousness (C):</strong> Kecenderungan untuk menunjukkan disiplin diri, ketelitian, dan keinginan untuk mencapai
          </li>
          <li>
            <strong>Neuroticism (N):</strong> Kecenderungan untuk mengalami emosi negatif seperti kecemasan, kemarahan, atau depresi
          </li>
          <li>
            <strong>Openness (O):</strong> Keterbukaan terhadap pengalaman baru, kreativitas, dan keingintahuan intelektual
          </li>
        </ul>
        <p className="mt-2 text-gray-700">
          Skor tinggi atau rendah pada setiap dimensi mencerminkan kecenderungan kepribadian yang berbeda, tidak ada yang "benar" atau "salah".
        </p>
      </div>

      {/* Tips & Saran */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Tips & Saran</h3>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Gunakan hasil untuk memahami kekuatan dan preferensi alami Anda</li>
          <li>Pertimbangkan bagaimana dimensi kepribadian memengaruhi interaksi Anda dengan orang lain</li>
          <li>Kenali situasi di mana ciri kepribadian Anda mungkin membantu atau menantang</li>
          <li>Untuk dimensi dengan skor rendah, pikirkan strategi kompensasi jika diperlukan dalam konteks tertentu</li>
          <li>Ingat bahwa kepribadian tidak bersifat tetap dan dapat berubah seiring waktu dan pengalaman</li>
        </ul>
      </div>

      {/* Sumber Belajar */}
      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Sumber Belajar</h3>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <a href="https://www.psytoolkit.org/survey-library/big-five-bfi-10.html" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              PsyToolkit: BFI-10 Resources
            </a>
          </li>
          <li>
            <a href="https://www.verywellmind.com/the-big-five-personality-dimensions-2795422" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Penjelasan Tentang Lima Dimensi Kepribadian Besar
            </a>
          </li>
          <li>
            <a href="https://www.apa.org" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              American Psychological Association
            </a>
          </li>
        </ul>
      </div>

      {/* Pendapat Ahli */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Pendapat Ahli</h3>
        <blockquote className="italic border-l-4 border-yellow-500 pl-4 py-2 mb-2">
          "Model kepribadian Big Five menawarkan kerangka yang komprehensif untuk memahami perbedaan individual. BFI-10, meskipun singkat, telah terbukti menjadi alat yang valid untuk mendapatkan gambaran umum tentang dimensi kepribadian seseorang. Hasil tes ini dapat membantu dalam pengembangan diri, pemahaman interpersonal, dan pertimbangan karir."
        </blockquote>
        <p className="text-right font-semibold">- Prof. Dr. Faturochman, MA</p>
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
};

export default BfiTestResult;

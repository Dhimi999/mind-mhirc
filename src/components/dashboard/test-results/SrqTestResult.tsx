
interface TestResultProps {
  testResult: any;
  userName: string | null;
}

const SrqTestResult = ({ testResult, userName }: TestResultProps) => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">
        Detail Hasil Tes: SRQ (Self-Reporting Questionnaire)
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
          SRQ (Self-Reporting Questionnaire) adalah alat skrining untuk mendeteksi gejala gangguan mental umum seperti depresi dan kecemasan.
        </p>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <strong>Skor {'<'} 6:</strong> Kemungkinan tidak mengalami gangguan mental yang signifikan
          </li>
          <li>
            <strong>Skor ≥ 6:</strong> Kemungkinan mengalami gejala gangguan mental yang memerlukan evaluasi lebih lanjut
          </li>
        </ul>
      </div>

      {/* Tips & Saran */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Tips & Saran</h3>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Tetap aktif secara fisik dengan berolahraga secara teratur</li>
          <li>Praktikkan teknik relaksasi seperti pernapasan dalam atau meditasi</li>
          <li>Jaga pola tidur yang teratur dan cukup</li>
          <li>Batasi konsumsi kafein dan alkohol</li>
          <li>Cari dukungan dari keluarga dan teman</li>
          <li>Konsultasikan hasil tes dengan profesional kesehatan mental jika skor Anda tinggi</li>
        </ul>
      </div>

      {/* Sumber Belajar */}
      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Sumber Belajar</h3>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <a href="https://www.who.int/tools/srq" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              WHO: Self-Reporting Questionnaire (SRQ)
            </a>
          </li>
          <li>
            <a href="https://www.kemenpppa.go.id" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Kementerian Pemberdayaan Perempuan dan Perlindungan Anak
            </a>
          </li>
          <li>
            <a href="https://www.kemkes.go.id" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Kementerian Kesehatan RI
            </a>
          </li>
        </ul>
      </div>

      {/* Pendapat Ahli */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Pendapat Ahli</h3>
        <blockquote className="italic border-l-4 border-yellow-500 pl-4 py-2 mb-2">
          "SRQ adalah alat skrining yang efektif dan efisien untuk mendeteksi gejala gangguan mental umum di layanan kesehatan primer. Hasil positif harus diikuti dengan wawancara diagnostik untuk konfirmasi diagnosis."
        </blockquote>
        <p className="text-right font-semibold">- Dr. Nova Riyanti Yusuf, SpKJ</p>
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

export default SrqTestResult;

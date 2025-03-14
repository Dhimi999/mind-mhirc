
interface TestResultProps {
  testResult: any;
  userName: string | null;
}

const SasSvTestResult = ({ testResult, userName }: TestResultProps) => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">
        Detail Hasil Tes: SAS-SV (Smartphone Addiction Scale-Short Version)
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
          SAS-SV mengukur tingkat kecanduan smartphone. Skor diinterpretasikan sebagai berikut:
        </p>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <strong>Skor {'<'} 31 (pria) atau {'<'} 33 (wanita):</strong> Penggunaan smartphone dalam batas normal
          </li>
          <li>
            <strong>Skor ≥ 31 (pria) atau ≥ 33 (wanita):</strong> Berisiko mengalami kecanduan smartphone
          </li>
        </ul>
      </div>

      {/* Tips & Saran */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Tips & Saran</h3>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Tetapkan batas waktu untuk penggunaan smartphone</li>
          <li>Nonaktifkan notifikasi yang tidak penting</li>
          <li>Hindari menggunakan smartphone sebelum tidur</li>
          <li>Tetapkan area bebas smartphone (mis. ruang makan)</li>
          <li>Gunakan aplikasi yang memantau waktu penggunaan</li>
          <li>Cari aktivitas alternatif seperti olahraga, membaca, atau bersosialisasi secara langsung</li>
        </ul>
      </div>

      {/* Sumber Belajar */}
      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Sumber Belajar</h3>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4288957/" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Studi Validasi SAS-SV (National Center for Biotechnology Information)
            </a>
          </li>
          <li>
            <a href="https://www.kemenpppa.go.id/publikasi/kategori/buku" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Publikasi Kementerian PPPA tentang Anak dan Media Digital
            </a>
          </li>
          <li>
            <a href="https://www.kominfo.go.id" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Kementerian Komunikasi dan Informatika RI
            </a>
          </li>
        </ul>
      </div>

      {/* Pendapat Ahli */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Pendapat Ahli</h3>
        <blockquote className="italic border-l-4 border-yellow-500 pl-4 py-2 mb-2">
          "Kecanduan smartphone dapat berdampak signifikan pada kesehatan mental, produktivitas, dan hubungan sosial. Penting untuk mengembangkan kebiasaan penggunaan yang sehat sejak dini, terutama pada remaja yang masih dalam tahap perkembangan."
        </blockquote>
        <p className="text-right font-semibold">- Dr. Jiemi Ardian, M.Psi</p>
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

export default SasSvTestResult;

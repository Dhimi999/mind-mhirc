
interface TestResultProps {
  testResult: any;
  userName: string | null;
}

const SdqTestResult = ({ testResult, userName }: TestResultProps) => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">
        Detail Hasil Tes: SDQ (Strengths and Difficulties Questionnaire)
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
          SDQ mengevaluasi kekuatan dan kesulitan perilaku, emosional, dan sosial pada anak dan remaja. Hasil dikelompokkan dalam lima subskala:
        </p>
        <ul className="list-disc pl-5 text-gray-700">
          <li><strong>Gejala emosional</strong></li>
          <li><strong>Masalah perilaku</strong></li>
          <li><strong>Hiperaktivitas/inatensi</strong></li>
          <li><strong>Masalah hubungan dengan teman sebaya</strong></li>
          <li><strong>Perilaku prososial</strong> (kekuatan)</li>
        </ul>
        <p className="mt-2 text-gray-700">
          Skor total kesulitan (0-40) diinterpretasikan sebagai:
        </p>
        <ul className="list-disc pl-5 text-gray-700">
          <li><strong>Normal:</strong> 0-13</li>
          <li><strong>Borderline:</strong> 14-16</li>
          <li><strong>Abnormal:</strong> 17-40</li>
        </ul>
      </div>

      {/* Tips & Saran */}
      <div className="mt-4 p-4 bg-green-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Tips & Saran</h3>
        <ul className="list-disc pl-5 text-gray-700">
          <li>Komunikasikan dengan anak/remaja tentang kekuatan dan area yang perlu dikembangkan</li>
          <li>Fokus pada penguatan perilaku positif dan keterampilan sosial</li>
          <li>Tetapkan rutinitas dan struktur yang konsisten</li>
          <li>Berikan waktu berkualitas dan dukungan emosional</li>
          <li>Jika hasil menunjukkan kategori "borderline" atau "abnormal", konsultasikan dengan psikolog anak atau profesional kesehatan mental</li>
          <li>Libatkan sekolah dalam strategi dukungan jika diperlukan</li>
        </ul>
      </div>

      {/* Sumber Belajar */}
      <div className="mt-4 p-4 bg-purple-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Sumber Belajar</h3>
        <ul className="list-disc pl-5 text-gray-700">
          <li>
            <a href="https://www.sdqinfo.org" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Website Resmi SDQ
            </a>
          </li>
          <li>
            <a href="https://www.kemenpppa.go.id" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Kementerian Pemberdayaan Perempuan dan Perlindungan Anak
            </a>
          </li>
          <li>
            <a href="https://himpsi.or.id" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Himpunan Psikologi Indonesia (HIMPSI)
            </a>
          </li>
        </ul>
      </div>

      {/* Pendapat Ahli */}
      <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Pendapat Ahli</h3>
        <blockquote className="italic border-l-4 border-yellow-500 pl-4 py-2 mb-2">
          "SDQ adalah instrumen yang sangat berguna untuk skrining awal masalah kesehatan mental pada anak dan remaja. Hasilnya perlu diinterpretasikan dalam konteks perkembangan anak secara keseluruhan dan faktor lingkungan. Intervensi dini untuk masalah yang teridentifikasi dapat mencegah kesulitan yang lebih serius di kemudian hari."
        </blockquote>
        <p className="text-right font-semibold">- Dr. Fitri Ariyanti Abidin, M.Psi, Psikolog</p>
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

export default SdqTestResult;

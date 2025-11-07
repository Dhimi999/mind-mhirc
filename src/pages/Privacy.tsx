import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/seo/SEO";
const Privacy = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <SEO
        title="Kebijakan Privasi | Mind MHIRC"
        description="Kebijakan privasi Mind MHIRC: bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda."
        canonicalPath="/privacy"
      />
  <main className="flex-1 container mx-auto px-4 py-16 md:px-6 pt-navbar">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Kebijakan Privasi</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Pendahuluan</h2>
          <p>
            Mind MHIRC ("kami", "kita", atau "milik kami") menghargai privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, mengungkapkan, dan melindungi informasi Anda ketika Anda menggunakan layanan kami.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Informasi yang Kami Kumpulkan</h2>
          <p>Kami dapat mengumpulkan jenis informasi berikut dari Anda:</p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Informasi Pribadi</strong>: Nama, alamat email, tanggal lahir, dan informasi demografis lainnya.</li>
            <li><strong>Informasi Kesehatan</strong>: Hasil tes psikologis, jawaban kuesioner, dan data terkait kesehatan mental lainnya.</li>
            <li><strong>Informasi Teknis</strong>: Alamat IP, jenis perangkat, browser, dan data penggunaan situs web.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Bagaimana Kami Menggunakan Informasi Anda</h2>
          <p>Kami menggunakan informasi Anda untuk tujuan berikut:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Menyediakan, memelihara, dan meningkatkan layanan kami</li>
            <li>Memproses dan menganalisis hasil tes</li>
            <li>Mengirimkan informasi dan pembaruan yang relevan</li>
            <li>Melakukan penelitian untuk meningkatkan pemahaman tentang kesehatan mental</li>
            <li>Mematuhi kewajiban hukum</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Berbagi dan Pengungkapan</h2>
          <p>Kami tidak akan menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya dapat membagikan informasi Anda dalam keadaan berikut:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Dengan persetujuan eksplisit dari Anda</li>
            <li>Dengan penyedia layanan pihak ketiga yang membantu kami menjalankan layanan</li>
            <li>Untuk mematuhi kewajiban hukum atau menanggapi proses hukum</li>
            <li>Dalam bentuk anonim atau teragregasi untuk tujuan penelitian</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Keamanan Data</h2>
          <p>
            Kami menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi Anda dari akses yang tidak sah, penggunaan, atau pengungkapan yang tidak sah. Namun, tidak ada metode transmisi melalui internet atau metode penyimpanan elektronik yang 100% aman. Oleh karena itu, meskipun kami berusaha untuk menggunakan cara yang dapat diterima secara komersial untuk melindungi informasi pribadi Anda, kami tidak dapat menjamin keamanan mutlaknya.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Hak-Hak Anda</h2>
          <p>Tergantung pada lokasi Anda, Anda mungkin memiliki hak tertentu terkait dengan data pribadi Anda, termasuk:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Hak untuk mengakses data pribadi Anda</li>
            <li>Hak untuk mengoreksi data yang tidak akurat</li>
            <li>Hak untuk menghapus data Anda</li>
            <li>Hak untuk membatasi pemrosesan</li>
            <li>Hak untuk meminta data Anda dalam format yang dapat dibaca mesin</li>
            <li>Hak untuk menarik persetujuan kapan saja</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Perubahan pada Kebijakan Privasi</h2>
          <p>
            Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini dan, jika perubahan tersebut signifikan, kami akan memberi tahu Anda melalui email atau pemberitahuan di situs web kami.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Menghubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan atau kekhawatiran tentang Kebijakan Privasi kami atau praktik pengumpulan data, silakan hubungi kami di:
          </p>
          <p className="mb-4">
            Email: info@mindmhirc.org<br />
            Telepon: +62 (021) 123-4567<br />
            Alamat: Jl. Mental Sehat No. 123, Jakarta, Indonesia
          </p>
        </div>
      </main>
      <Footer />
    </div>;
};
export default Privacy;
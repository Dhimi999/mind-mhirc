import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/seo/SEO";
const Terms = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      <SEO
        title="Syarat & Ketentuan | Mind MHIRC"
        description="Syarat dan ketentuan penggunaan situs dan layanan Mind MHIRC."
        canonicalPath="/terms"
      />
  <main className="flex-1 container mx-auto px-4 py-16 md:px-6 pt-navbar">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Syarat & Ketentuan</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Penerimaan Syarat</h2>
          <p>
            Dengan mengakses dan menggunakan situs web Mind MHIRC ("Situs"), Anda setuju untuk terikat oleh Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan salah satu ketentuan, Anda tidak boleh mengakses Situs.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Penggunaan Tes Mental</h2>
          <p>
            Tes mental dan alat penilaian yang disediakan di Situs ini adalah untuk tujuan informasi dan pendidikan saja. Mereka tidak dimaksudkan untuk memberikan diagnosis profesional, saran, pengobatan, atau rekomendasi medis. Hasil tes tidak menggantikan konsultasi dengan profesional kesehatan mental berlisensi.
          </p>
          <p className="mb-4">
            Anda harus selalu berkonsultasi dengan profesional kesehatan yang berkualifikasi mengenai masalah kesehatan mental spesifik, kondisi, atau perawatan. Jangan pernah mengabaikan saran medis profesional atau menunda mencari saran medis karena sesuatu yang telah Anda baca di Situs kami.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Pembatasan Penggunaan</h2>
          <p>Anda setuju untuk tidak menggunakan Situs untuk:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Melanggar hukum atau peraturan yang berlaku</li>
            <li>Melakukan aktivitas yang melanggar hak orang lain</li>
            <li>Mengumpulkan data pribadi tanpa izin</li>
            <li>Mengunggah atau mentransmisikan virus atau kode berbahaya lainnya</li>
            <li>Merusak atau mengganggu operasi Situs</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Akun Pengguna</h2>
          <p>
            Beberapa fitur Situs mungkin mengharuskan Anda untuk membuat akun. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda dan untuk semua aktivitas yang terjadi di bawah akun Anda. Anda harus segera memberi tahu kami tentang penggunaan yang tidak sah dari akun Anda.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Kekayaan Intelektual</h2>
          <p>
            Situs dan semua kontennya, termasuk tetapi tidak terbatas pada teks, grafik, logo, ikon, gambar, klip audio, unduhan digital, dan kompilasi data, adalah properti Mind MHIRC atau pemberi lisensinya dan dilindungi oleh hukum kekayaan intelektual Indonesia dan internasional.
          </p>
          <p className="mb-4">
            Anda tidak boleh mereproduksi, mendistribusikan, memodifikasi, membuat karya turunan, menampilkan, atau menggunakan konten tersebut tanpa izin tertulis dari kami.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Penafian</h2>
          <p>
            Situs dan kontennya disediakan "sebagaimana adanya" dan "sebagaimana tersedia" tanpa jaminan apa pun, baik tersurat maupun tersirat. Mind MHIRC tidak membuat jaminan apa pun tentang kelengkapan, keandalan, akurasi, atau ketersediaan Situs atau kontennya.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Batasan Tanggung Jawab</h2>
          <p>
            Dalam hal apa pun Mind MHIRC, direktur, karyawan, atau agennya tidak akan bertanggung jawab atas kerugian atau kerusakan yang timbul dari penggunaan atau ketidakmampuan untuk menggunakan Situs atau kontennya. Ini termasuk kerugian langsung, tidak langsung, insidental, konsekuensial, atau punitif.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Tautan ke Situs Lain</h2>
          <p>
            Situs kami mungkin berisi tautan ke situs web pihak ketiga yang tidak dimiliki atau dikendalikan oleh Mind MHIRC. Kami tidak memiliki kendali atas, dan tidak bertanggung jawab atas konten, kebijakan privasi, atau praktik situs web pihak ketiga mana pun.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Perubahan Syarat</h2>
          <p>
            Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Syarat ini kapan saja. Perubahan yang substansial akan efektif tiga puluh (30) hari setelah posting perubahan tersebut.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Hukum yang Berlaku</h2>
          <p>
            Syarat ini akan diatur dan ditafsirkan sesuai dengan hukum Indonesia, tanpa memperhatikan ketentuan konflik hukumnya.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Menghubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di:
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
export default Terms;
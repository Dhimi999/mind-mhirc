import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const Cookies = () => {
  return <div className="min-h-screen flex flex-col">
      <Navbar />
  <main className="flex-1 container mx-auto px-4 py-16 md:px-6 pt-navbar">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Kebijakan Cookie</h1>
        
        <div className="prose max-w-none">
          <p className="mb-4">
            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Apa Itu Cookie?</h2>
          <p>
            Cookie adalah file teks kecil yang disimpan di komputer atau perangkat seluler Anda ketika Anda mengunjungi situs web. Cookie secara luas digunakan untuk membuat situs web berfungsi, atau berfungsi lebih efisien, serta untuk memberikan informasi kepada pemilik situs web.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Bagaimana Kami Menggunakan Cookie</h2>
          <p>Mind MHIRC menggunakan cookie untuk tujuan berikut:</p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Cookie yang Diperlukan</strong>: Cookie ini diperlukan agar situs web berfungsi dan tidak dapat dimatikan dalam sistem kami. Mereka biasanya hanya diatur sebagai respons terhadap tindakan yang Anda lakukan yang merupakan permintaan layanan, seperti menetapkan preferensi privasi Anda, masuk, atau mengisi formulir.</li>
            <li><strong>Cookie Analitik/Kinerja</strong>: Cookie ini memungkinkan kami untuk menghitung kunjungan dan sumber lalu lintas sehingga kami dapat mengukur dan meningkatkan kinerja situs kami. Mereka membantu kami mengetahui halaman mana yang paling dan paling tidak populer dan melihat bagaimana pengunjung bergerak di sekitar situs.</li>
            <li><strong>Cookie Fungsional</strong>: Cookie ini memungkinkan situs web menyediakan fungsi dan personalisasi yang ditingkatkan. Mereka dapat diatur oleh kami atau oleh penyedia pihak ketiga yang layanannya telah kami tambahkan ke halaman kami.</li>
            <li><strong>Cookie Penargetan</strong>: Cookie ini dapat diatur melalui situs kami oleh mitra periklanan kami. Mereka dapat digunakan oleh perusahaan-perusahaan tersebut untuk membuat profil minat Anda dan menampilkan iklan yang relevan di situs lain.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Jenis Cookie yang Kami Gunakan</h2>
          <p>Kami menggunakan jenis cookie berikut di situs kami:</p>
          <ul className="list-disc ml-6 mb-4">
            <li><strong>Cookie Sesi</strong>: Cookie ini bersifat sementara dan hanya tetap ada di perangkat Anda hingga Anda menutup browser Anda.</li>
            <li><strong>Cookie Persisten</strong>: Cookie ini tetap di perangkat Anda untuk waktu yang ditentukan atau sampai Anda menghapusnya secara manual.</li>
            <li><strong>Cookie Pihak Pertama</strong>: Cookie ini ditetapkan oleh situs web yang sedang Anda kunjungi.</li>
            <li><strong>Cookie Pihak Ketiga</strong>: Cookie ini ditetapkan oleh domain selain situs web yang sedang Anda kunjungi.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Cookie Pihak Ketiga</h2>
          <p>
            Beberapa halaman di situs kami menyertakan konten dari penyedia layanan pihak ketiga, seperti YouTube, Google Analytics, dan jejaring sosial. Harap dicatat bahwa kami tidak memiliki kendali atas cookie yang digunakan oleh pihak ketiga ini. Kami sarankan Anda memeriksa masing-masing situs web pihak ketiga untuk mengetahui informasi lebih lanjut tentang cookie mereka dan bagaimana cara mengelolanya.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Mengelola Cookie</h2>
          <p>
            Sebagian besar browser web memungkinkan Anda mengontrol cookie melalui pengaturan preferensi mereka. Namun, jika Anda membatasi kemampuan situs web untuk menetapkan cookie, Anda mungkin memperburuk pengalaman pengguna secara keseluruhan, karena tidak akan dipersonalisasi untuk Anda. Ini juga dapat menghentikan Anda dari menyimpan pengaturan kustomisasi, seperti informasi login.
          </p>
          <p className="mb-4">
            Untuk informasi lebih lanjut tentang bagaimana mengelola cookie di browser Anda, silakan kunjungi halaman yang sesuai:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li><a href="https://support.google.com/chrome/answer/95647" className="text-primary hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" className="text-primary hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.microsoft.com/help/17442/windows-internet-explorer-delete-manage-cookies" className="text-primary hover:underline">Microsoft Edge</a></li>
            <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-primary hover:underline">Safari</a></li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Perubahan pada Kebijakan Cookie</h2>
          <p>
            Kami dapat memperbarui Kebijakan Cookie ini dari waktu ke waktu untuk mencerminkan, misalnya, perubahan pada cookie yang kami gunakan atau untuk alasan operasional, hukum, atau peraturan lainnya. Oleh karena itu, silakan kunjungi kembali kebijakan ini secara teratur untuk tetap mendapatkan informasi tentang bagaimana kami menggunakan cookie.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Menghubungi Kami</h2>
          <p>
            Jika Anda memiliki pertanyaan tentang Kebijakan Cookie kami, silakan hubungi kami di:
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
export default Cookies;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft, MessageSquare, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Sample blog posts data
  const allPosts = [
    {
      id: "mengenal-anxietas",
      title: "Mengenal Anxietas: Gejala, Penyebab, dan Cara Mengatasinya",
      content: `
        <p class="mb-4">Anxietas atau kecemasan adalah reaksi normal terhadap stres dan dapat menjadi adaptif dalam beberapa situasi. Namun, ketika kecemasan menjadi berlebihan dan mengganggu fungsi sehari-hari, hal ini dapat menjadi gangguan mental yang membutuhkan penanganan.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Gejala Anxietas</h2>
        <p class="mb-4">Gangguan kecemasan dapat memiliki berbagai gejala, baik fisik maupun psikologis:</p>
        <ul class="list-disc ml-6 mb-4 space-y-2">
          <li>Kekhawatiran berlebihan</li>
          <li>Perasaan tegang atau gelisah</li>
          <li>Iritabilitas</li>
          <li>Kesulitan berkonsentrasi</li>
          <li>Gangguan tidur</li>
          <li>Debaran jantung cepat</li>
          <li>Berkeringat</li>
          <li>Gemetar</li>
          <li>Sensasi sesak napas</li>
          <li>Nyeri dada</li>
        </ul>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Penyebab Anxietas</h2>
        <p class="mb-4">Gangguan kecemasan dapat disebabkan oleh kombinasi faktor berikut:</p>
        <ul class="list-disc ml-6 mb-4 space-y-2">
          <li>Faktor genetik dan biologis</li>
          <li>Pengalaman traumatis atau peristiwa hidup yang penuh stres</li>
          <li>Pola pikir dan kepribadian tertentu</li>
          <li>Kondisi medis tertentu atau efek samping obat</li>
          <li>Penggunaan atau penghentian zat tertentu (misalnya kafein, alkohol, atau obat-obatan)</li>
        </ul>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Cara Mengatasi Anxietas</h2>
        <p class="mb-4">Beberapa strategi yang dapat membantu mengelola kecemasan meliputi:</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">1. Terapi Psikologis</h3>
        <p class="mb-4">Cognitive Behavioral Therapy (CBT) sangat efektif untuk mengatasi gangguan kecemasan. Terapi ini membantu mengidentifikasi dan mengubah pola pikir negatif yang berkontribusi pada kecemasan, serta mengajarkan teknik untuk menghadapi situasi yang menimbulkan kecemasan.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">2. Latihan Pernapasan dan Relaksasi</h3>
        <p class="mb-4">Teknik pernapasan dalam dan relaksasi otot progresif dapat membantu menenangkan tubuh dan pikiran, serta mengurangi gejala fisik kecemasan seperti detak jantung cepat dan ketegangan otot.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">3. Mindfulness dan Meditasi</h3>
        <p class="mb-4">Praktik mindfulness dan meditasi dapat meningkatkan kesadaran akan momen sekarang dan mengurangi kekhawatiran tentang masa depan atau masa lalu. Teknik-teknik ini dapat membantu mengelola pikiran dan emosi yang memicu kecemasan.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">4. Gaya Hidup Sehat</h3>
        <p class="mb-4">Menjaga gaya hidup sehat dengan tidur yang cukup, olahraga teratur, dan pola makan seimbang dapat membantu mengelola kecemasan. Batasi konsumsi kafein dan alkohol yang dapat memperburuk gejala kecemasan.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">5. Dukungan Sosial</h3>
        <p class="mb-4">Berbicara dengan keluarga, teman, atau bergabung dengan kelompok dukungan dapat memberikan perspektif baru dan melegakan perasaan. Mengetahui bahwa Anda tidak sendirian dalam pengalaman Anda dapat sangat membantu.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">6. Pengobatan</h3>
        <p class="mb-4">Dalam beberapa kasus, dokter mungkin merekomendasikan obat-obatan untuk membantu mengelola gejala kecemasan. Obat yang umum digunakan termasuk antidepresan, obat anti-kecemasan, dan beta-blocker.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Kapan Mencari Bantuan Profesional</h2>
        <p class="mb-4">Jika kecemasan Anda mengganggu kemampuan Anda untuk bekerja, belajar, bersosialisasi, atau melakukan aktivitas sehari-hari, penting untuk mencari bantuan profesional. Psikolog, psikiater, atau dokter umum dapat membantu menilai gejala Anda dan menyarankan rencana perawatan yang tepat.</p>
        
        <div class="bg-primary/5 p-6 rounded-xl mt-8">
          <p class="font-medium">Ingat: Anxietas adalah kondisi yang dapat diobati. Dengan bantuan, dukungan, dan strategi pengelolaan yang tepat, Anda dapat mengurangi gejala kecemasan dan meningkatkan kualitas hidup Anda.</p>
        </div>
      `,
      coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80",
      date: "3 Jun 2023",
      author: {
        name: "Dr. Anita Wijaya",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg"
      },
      category: "Edukasi",
      readTime: "8 menit",
      tags: ["anxietas", "kesehatan mental", "kecemasan", "terapi"]
    },
    {
      id: "digital-wellbeing",
      title: "Digital Wellbeing: Menjaga Kesehatan Mental di Era Digital",
      content: `
        <p class="mb-4">Di era digital saat ini, kita menghabiskan sebagian besar waktu kita berinteraksi dengan perangkat digital. Meskipun teknologi membawa banyak manfaat, penggunaan yang berlebihan dapat berdampak negatif pada kesehatan mental kita. Digital wellbeing atau kesejahteraan digital mengacu pada hubungan yang sehat dan seimbang dengan teknologi.</p>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Dampak Teknologi Digital pada Kesehatan Mental</h2>
        <p class="mb-4">Beberapa cara teknologi dapat memengaruhi kesehatan mental kita meliputi:</p>
        <ul class="list-disc ml-6 mb-4 space-y-2">
          <li>Kecemasan sosial media dan FOMO (Fear of Missing Out)</li>
          <li>Gangguan tidur akibat paparan cahaya biru</li>
          <li>Penurunan fokus dan span perhatian</li>
          <li>Perasaan terisolasi meskipun "terhubung" secara digital</li>
          <li>Cyberbullying dan dampak negatifnya</li>
          <li>Kecanduan internet, game, atau media sosial</li>
        </ul>
        
        <h2 class="text-2xl font-semibold mt-8 mb-4">Tips Menjaga Keseimbangan Digital</h2>
        <p class="mb-4">Berikut adalah beberapa tips untuk menjaga kesejahteraan digital:</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">1. Tetapkan Batasan Waktu</h3>
        <p class="mb-4">Tentukan berapa lama Anda ingin menggunakan perangkat digital setiap hari dan tetapkan pengingat atau gunakan aplikasi yang dapat membantu Anda melacak dan membatasi penggunaan.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">2. Ciptakan Zona Bebas Teknologi</h3>
        <p class="mb-4">Tetapkan area di rumah Anda (seperti kamar tidur atau ruang makan) sebagai zona bebas teknologi untuk mendorong interaksi langsung dan istirahat dari layar.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">3. Praktikkan Digital Detox</h3>
        <p class="mb-4">Luangkan waktu secara teratur (misalnya akhir pekan atau liburan) untuk sepenuhnya "offline" dan fokus pada aktivitas dunia nyata yang Anda nikmati.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">4. Kelola Notifikasi</h3>
        <p class="mb-4">Matikan notifikasi yang tidak perlu untuk mengurangi gangguan dan kecemasan yang terkait dengan perasaan harus selalu merespons segera.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">5. Pilih Konten dengan Bijak</h3>
        <p class="mb-4">Ikuti akun yang menginspirasi dan memberi energi positif. Jangan ragu untuk berhenti mengikuti atau membisukan akun yang membuat Anda merasa tidak nyaman atau tidak aman.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">6. Hindari Penggunaan Sebelum Tidur</h3>
        <p class="mb-4">Hindari menggunakan perangkat digital setidaknya satu jam sebelum tidur untuk mengurangi dampak cahaya biru pada kualitas tidur Anda.</p>
        
        <h3 class="text-xl font-medium mt-6 mb-3">7. Praktikkan Mindfulness Digital</h3>
        <p class="mb-4">Sadari kapan, mengapa, dan bagaimana Anda menggunakan teknologi. Apakah itu bermanfaat atau hanya kebiasaan? Tetap hadir dan sadar saat online maupun offline.</p>
        
        <div class="bg-primary/5 p-6 rounded-xl mt-8">
          <p class="font-medium">Ingat: Teknologi diciptakan untuk melayani kita, bukan sebaliknya. Dengan menetapkan batasan yang jelas dan kebiasaan yang sehat, kita dapat memanfaatkan manfaat dunia digital sambil menjaga kesehatan mental kita.</p>
        </div>
      `,
      coverImage: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80",
      date: "15 Mei 2023",
      author: {
        name: "Budi Santoso, M.Psi",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      },
      category: "Tips",
      readTime: "6 menit",
      tags: ["digital wellbeing", "kesehatan mental", "teknologi", "keseimbangan digital"]
    }
  ];
  
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    
    setTimeout(() => {
      const foundPost = allPosts.find(post => post.id === id);
      if (foundPost) {
        setPost(foundPost);
        setLoading(false);
      } else {
        setError("Artikel tidak ditemukan");
        setLoading(false);
      }
    }, 500);
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-12"></div>
                <div className="h-64 bg-gray-200 rounded mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Error</h1>
              <p className="text-muted-foreground mb-8">{error}</p>
              <Link to="/blog">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali ke Blog
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!post) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center text-sm text-primary mb-8 hover:underline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Blog
            </Link>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                  {post.category}
                </span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <Calendar size={14} className="mr-1" />
                  {post.date}
                </span>
                <span className="flex items-center text-xs text-muted-foreground">
                  <User size={14} className="mr-1" />
                  {post.author.name}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
              
              <div className="flex items-center space-x-3 pt-2">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{post.author.name}</p>
                  <p className="text-xs text-muted-foreground">{post.readTime} waktu baca</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl overflow-hidden mb-8 aspect-[16/9]">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <article className="prose prose-lg max-w-none">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </article>
            
            <div className="border-t border-border mt-12 pt-8 flex items-center justify-between">
              <div className="flex space-x-4">
                <button className="flex items-center text-sm text-muted-foreground hover:text-primary">
                  <Heart className="mr-1.5 h-5 w-5" />
                  Suka
                </button>
                <button className="flex items-center text-sm text-muted-foreground hover:text-primary">
                  <MessageSquare className="mr-1.5 h-5 w-5" />
                  Komentar
                </button>
              </div>
              
              <div className="flex space-x-2">
                {post.tags && post.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-muted text-xs font-medium rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogPost;

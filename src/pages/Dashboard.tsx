import { useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, BoxSelect, Calendar, ChevronDown, ClipboardList, File, FileText, Home, LineChart, LogOut, Mail, Menu, MessageSquare, PieChart, Users, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import Settings icon with an alias to avoid name conflict
import { Settings as SettingsIcon } from "lucide-react";
const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Mock user data - in a real app, this would come from user context or API
  const user = {
    name: "Budi Santoso",
    email: "budi@example.com",
    role: "Admin",
    // Could be "Admin", "Teacher", or "User"
    isProfessional: true,
    // New field to identify professional accounts
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg"
  };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  return <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 pt-1">
        <div className="flex min-h-screen">
          {/* Sidebar - Mobile Overlay */}
          {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar}></div>}
          
          {/* Sidebar */}
          <aside className={`fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-30 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="pt-16 p-4 h-full flex flex-col max-h-screen">
              <div className="flex items-center justify-between lg:hidden">
                <span className="font-semibold">Menu</span>
                <button onClick={toggleSidebar} className="p-1 rounded-full hover:bg-muted">
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-5 flex-1 overflow-y-auto max-h-screen">
                <nav className="space-y-1">
                  <Link to="/dashboard" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                    <Home className="mr-3 h-5 w-5" />
                    Beranda
                  </Link>
                  
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                      Menu Utama
                    </div>
                    
                    <Link to="/dashboard/tests" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                      <ClipboardList className="mr-3 h-5 w-5" />
                      Tes Mental
                    </Link>
                    
                    <Link to="/dashboard/results" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                      <PieChart className="mr-3 h-5 w-5" />
                      Hasil Tes
                    </Link>
                    
                    <Link to="/dashboard/appointments" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                      <Calendar className="mr-3 h-5 w-5" />
                      Janji Konsultasi
                    </Link>
                    
                    <Link to="/dashboard/messages" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                      <MessageSquare className="mr-3 h-5 w-5" />
                      Pesan
                      <span className="ml-auto bg-primary text-white text-xs py-0.5 px-1.5 rounded-full">3</span>
                    </Link>
                  </div>
                  
                  {/* Admin & Teacher Menu */}
                  {(user.role === "Admin" || user.role === "Teacher") && <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                        {user.role === "Admin" ? "Admin" : "Guru"}
                      </div>
                      
                      {user.role === "Teacher" && <Link to="/dashboard/students" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                          <Users className="mr-3 h-5 w-5" />
                          Daftar Murid
                        </Link>}
                      
                      {user.role === "Admin" && <>
                          <Link to="/dashboard/users" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                            <Users className="mr-3 h-5 w-5" />
                            Manajemen Pengguna
                          </Link>
                          
                          <Link to="/dashboard/content" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                            <FileText className="mr-3 h-5 w-5" />
                            Manajemen Konten
                          </Link>
                          
                          <Link to="/dashboard/analytics" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                            <LineChart className="mr-3 h-5 w-5" />
                            Statistik & Analitik
                          </Link>
                        </>}
                    </div>}
                  
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                      Pengaturan
                    </div>
                    
                    <Link to="/dashboard/settings" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                      <SettingsIcon className="mr-3 h-5 w-5" />
                      Pengaturan Akun
                    </Link>
                    
                    <Link to="/dashboard/help" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                      <BookOpen className="mr-3 h-5 w-5" />
                      Bantuan
                    </Link>
                  </div>
                </nav>
              </div>
              
              <div className="pt-2 mt-4 border-t">
                <button onClick={() => navigate("/")} className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-muted text-muted-foreground">
                  <LogOut className="mr-3 h-5 w-5" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 overflow-x-hidden">
            {/* Top Bar */}
            <div className="bg-card border-b sticky top-16 z-30">
              <div className="flex items-center justify-between h-14 px-4">
                <div className="flex items-center">
                  <button onClick={toggleSidebar} className="p-2 mr-2 rounded-md lg:hidden hover:bg-muted">
                    <Menu size={20} />
                  </button>
                  <div className="flex items-center text-lg font-semibold">
                    Dashboard
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Link to="/dashboard/messages" className="p-2 rounded-md hover:bg-muted relative">
                    <Mail size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
                  </Link>
                  
                  <div className="relative">
                    <button className="flex items-center space-x-1">
                      <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                      <ChevronDown size={16} className="text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Page Content */}
            <div className="p-4 sm:p-6">
              {/* Dashboard Routes */}
              <Routes>
                <Route index element={<DashboardOverview user={user} />} />
                <Route path="tests/*" element={<DashboardTests user={user} />} />
                <Route path="results/*" element={<DashboardResults user={user} />} />
                <Route path="appointments/*" element={<DashboardAppointments user={user} />} />
                <Route path="messages/*" element={<DashboardMessages user={user} />} />
                
                {/* Teacher Routes */}
                {user.role === "Teacher" && <Route path="students/*" element={<DashboardStudents user={user} />} />}
                
                {/* Admin Routes */}
                {user.role === "Admin" && <>
                    <Route path="users/*" element={<DashboardUsers user={user} />} />
                    <Route path="content/*" element={<DashboardContent user={user} />} />
                    <Route path="analytics/*" element={<DashboardAnalytics user={user} />} />
                  </>}
                
                <Route path="settings/*" element={<DashboardSettings user={user} />} />
                <Route path="help/*" element={<DashboardHelp user={user} />} />
                <Route path="*" element={<DashboardNotFound />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>;
};

// Dashboard Pages

const DashboardOverview = ({
  user
}: {
  user: any;
}) => {
  return <div className="mt-16">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-semibold mb-1">Selamat Datang, {user.name}!</h1>
        <p className="text-muted-foreground">Berikut adalah ringkasan aktivitas Anda.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Tes Selesai</h3>
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <ClipboardList size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-muted-foreground">3 tes dalam 7 hari terakhir</p>
        </div>
        
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Janji Terjadwal</h3>
            <div className="bg-secondary/10 text-secondary p-2 rounded-lg">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">2</p>
          <p className="text-xs text-muted-foreground">Janji berikutnya: Kamis, 10:00</p>
        </div>
        
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Pesan Baru</h3>
            <div className="bg-accent-500/10 text-accent-500 p-2 rounded-lg">
              <MessageSquare size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-muted-foreground">1 belum dibaca dari Dr. Anita</p>
        </div>
        
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Artikel Terbaru</h3>
            <div className="bg-green-500/10 text-green-500 p-2 rounded-lg">
              <File size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">8</p>
          <p className="text-xs text-muted-foreground">4 artikel edukasi baru minggu ini</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <h3 className="font-semibold mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-4">
            {[{
            title: "Menyelesaikan Tes SRQ",
            date: "Hari ini, 14:30",
            icon: ClipboardList
          }, {
            title: "Menjadwalkan Konsultasi",
            date: "Kemarin, 09:15",
            icon: Calendar
          }, {
            title: "Membaca Artikel: Mengelola Stres",
            date: "3 hari lalu",
            icon: BookOpen
          }, {
            title: "Menyelesaikan Tes Big Five",
            date: "1 minggu lalu",
            icon: BoxSelect
          }].map((activity, index) => <div key={index} className="flex items-start">
                <div className="mr-3 p-2 bg-muted rounded-lg">
                  <activity.icon size={18} />
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
              </div>)}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              Lihat Semua Aktivitas
            </Button>
          </div>
        </div>
        
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <h3 className="font-semibold mb-4">Tes yang Direkomendasikan</h3>
          <div className="space-y-4">
            {[{
            title: "Tes Kecemasan GAD-7",
            desc: "Evaluasi tingkat kecemasan Anda saat ini",
            duration: "5-7 menit"
          }, {
            title: "Tes Kesehatan Mental Harian",
            desc: "Lacak kondisi kesehatan mental Anda sehari-hari",
            duration: "3-5 menit"
          }, {
            title: "Tes Manajemen Stres",
            desc: "Evaluasi kemampuan Anda mengelola stres",
            duration: "8-10 menit"
          }].map((test, index) => <div key={index} className="p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{test.title}</h4>
                    <p className="text-sm text-muted-foreground">{test.desc}</p>
                  </div>
                  <div className="text-xs bg-muted px-2 py-1 rounded">
                    {test.duration}
                  </div>
                </div>
                <div className="mt-3">
                  <Link to={`/dashboard/tests`}>
                    <Button variant="outline" size="sm">Mulai Tes</Button>
                  </Link>
                </div>
              </div>)}
          </div>
          <div className="mt-4 pt-4 border-t">
            <Link to="/tests">
              <Button variant="outline" size="sm" className="w-full">
                Jelajahi Semua Tes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>;
};

// Dashboard Tests page
const DashboardTests = ({
  user
}: {
  user: any;
}) => <div>
    <h1 className="text-2xl font-semibold mb-6">Tes Mental</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>Halaman ini akan berisi daftar tes mental yang tersedia, baik yang gratis maupun berbayar, beserta informasi tentang masing-masing tes.</p>
    </div>
  </div>;

// Dashboard Results page with tabs for professional users
const DashboardResults = ({
  user
}: {
  user: any;
}) => {
  const isProfessional = user.isProfessional;
  return <div>
      <h1 className="text-2xl font-semibold mb-6">Hasil Tes</h1>
      
      {isProfessional ? <Tabs defaultValue="self" className="mb-6">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="self" className="flex-1">
              Hasil Tes Diri Sendiri
            </TabsTrigger>
            <TabsTrigger value="others" className="flex-1">
              Hasil Tes Orang Lain
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="self" className="mt-6">
            <div className="bg-card shadow-soft rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Hasil Tes Anda</h2>
              <div className="space-y-4">
                {/* Mock test results */}
                {[{
              title: "Tes SRQ-20",
              date: "15 Mei 2023",
              result: "Rendah",
              resultColor: "text-green-500"
            }, {
              title: "Big Five Personality Test",
              date: "3 April 2023",
              result: "Detail",
              resultColor: "text-blue-500"
            }, {
              title: "Tes Kecemasan GAD-7",
              date: "28 Maret 2023",
              result: "Sedang",
              resultColor: "text-yellow-500"
            }].map((test, index) => <div key={index} className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{test.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Tanggal: {test.date}
                        </p>
                      </div>
                      <div className={`font-semibold ${test.resultColor}`}>
                        {test.result}
                      </div>
                    </div>
                    <div className="flex justify-end mt-3 space-x-2">
                      <Button variant="outline" size="sm">Lihat Detail</Button>
                      <Button variant="outline" size="sm">Unduh PDF</Button>
                    </div>
                  </div>)}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="others" className="mt-6">
            <div className="bg-card shadow-soft rounded-xl p-6">
              <h2 className="text-lg font-medium mb-4">Hasil Tes Orang Lain</h2>
              
              <div className="space-y-4">
                {/* Mock test results for others */}
                {[{
              name: "Ani Wijaya",
              title: "Tes SRQ-20",
              date: "18 Mei 2023",
              result: "Sedang",
              resultColor: "text-yellow-500"
            }, {
              name: "Budi Hartono",
              title: "Tes Kecemasan GAD-7",
              date: "10 Mei 2023",
              result: "Rendah",
              resultColor: "text-green-500"
            }, {
              name: "Dewi Sari",
              title: "Tes Depresi PHQ-9",
              date: "5 Mei 2023",
              result: "Sedang",
              resultColor: "text-yellow-500"
            }].map((test, index) => <div key={index} className="border rounded-lg p-4 hover:border-primary transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{test.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {test.title} • {test.date}
                        </p>
                      </div>
                      <div className={`font-semibold ${test.resultColor}`}>
                        {test.result}
                      </div>
                    </div>
                    <div className="flex justify-end mt-3 space-x-2">
                      <Button variant="outline" size="sm">Lihat Detail</Button>
                      <Button variant="outline" size="sm">Unduh PDF</Button>
                    </div>
                  </div>)}
              </div>
            </div>
          </TabsContent>
        </Tabs> : <div className="bg-card shadow-soft rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Hasil Tes Anda</h2>
          <div className="space-y-4">
            {/* Standard user view - only shows their own tests */}
            {[{
          title: "Tes SRQ-20",
          date: "15 Mei 2023",
          result: "Rendah",
          resultColor: "text-green-500"
        }, {
          title: "Big Five Personality Test",
          date: "3 April 2023",
          result: "Detail",
          resultColor: "text-blue-500"
        }, {
          title: "Tes Kecemasan GAD-7",
          date: "28 Maret 2023",
          result: "Sedang",
          resultColor: "text-yellow-500"
        }].map((test, index) => <div key={index} className="border rounded-lg p-4 hover:border-primary transition-colors">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium">{test.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Tanggal: {test.date}
                    </p>
                  </div>
                  <div className={`font-semibold ${test.resultColor}`}>
                    {test.result}
                  </div>
                </div>
                <div className="flex justify-end mt-3 space-x-2">
                  <Button variant="outline" size="sm">Lihat Detail</Button>
                  <Button variant="outline" size="sm">Unduh PDF</Button>
                </div>
              </div>)}
          </div>
        </div>}
    </div>;
};

// Keep other dashboard pages unchanged
const DashboardAppointments = ({
  user
}: {
  user: any;
}) => <div>
    <h1 className="text-2xl font-semibold mb-6">Janji Konsultasi</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>Halaman ini akan memungkinkan Anda menjadwalkan, melihat, atau membatalkan janji konsultasi dengan psikolog atau konselor.</p>
    </div>
  </div>;
const DashboardMessages = ({
  user
}: {
  user: any;
}) => <div>
    <h1 className="text-2xl font-semibold mb-6">Pesan</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>Halaman ini akan menampilkan sistem pesan untuk berkomunikasi dengan profesional kesehatan mental atau staf Mind MHIRC.</p>
    </div>
  </div>;
const DashboardStudents = ({
  user
}: {
  user: any;
}) => <div>
    <h1 className="text-2xl font-semibold mb-6">Daftar Murid</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>Halaman ini akan menampilkan daftar murid Anda, dengan opsi untuk melihat hasil tes, mengirim tes baru, atau mengelola data murid.</p>
    </div>
  </div>;
const DashboardUsers = ({
  user
}: {
  user: any;
}) => <div>
    <h1 className="text-2xl font-semibold mb-6">Manajemen Pengguna</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>Halaman ini akan memungkinkan Anda mengelola semua pengguna sistem, termasuk menambah, mengedit, atau menghapus akun pengguna.</p>
    </div>
  </div>;
const DashboardContent = ({
  user
}: {
  user: any;
}) => <div>
    <h1 className="text-2xl font-semibold mb-6">Manajemen Konten</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>Halaman ini akan memungkinkan Anda mengelola konten website, termasuk artikel blog, informasi tes, dan konten edukasi lainnya.</p>
    </div>
  </div>;
const DashboardAnalytics = ({
  user
}: {
  user: any;
}) => <div>
    <h1 className="text-2xl font-semibold mb-6">Statistik & Analitik</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>Halaman ini akan menampilkan data statistik dan analitik tentang penggunaan platform, hasil tes, dan tren kesehatan mental.</p>
    </div>
  </div>;
const DashboardSettings = ({
  user
}: {
  user: any;
}) => <div>
    <h1 className="text-2xl font-semibold mb-6">Pengaturan Akun</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>Halaman ini akan memungkinkan Anda mengelola pengaturan akun Anda, termasuk informasi profil, preferensi notifikasi, dan keamanan.</p>
    </div>
  </div>;
const DashboardHelp = ({
  user
}: {
  user: any;
}) => <div>
    <h1 className="text-2xl font-semibold mb-6">Bantuan</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>Halaman ini akan menyediakan panduan penggunaan, FAQ, dan informasi bantuan lainnya untuk membantu Anda menggunakan platform secara maksimal.</p>
    </div>
  </div>;
const DashboardNotFound = () => <div className="text-center py-12">
    <h1 className="text-2xl font-semibold mb-4">Halaman Tidak Ditemukan</h1>
    <p className="text-muted-foreground mb-8">Maaf, halaman yang Anda cari tidak tersedia.</p>
    <Link to="/dashboard">
      <Button>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Dashboard
      </Button>
    </Link>
  </div>;
export default Dashboard;
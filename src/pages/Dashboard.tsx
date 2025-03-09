import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, BookOpen, BoxSelect, Brain, Calendar, ChevronDown, ClipboardList, File, FileText, Home, LineChart, LogOut, Mail, Menu, MessageSquare, PieChart, Users, X, Megaphone, AlertCircle } from "lucide-react";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import Settings icon with an alias to avoid name conflict
import { Settings as SettingsIcon } from "lucide-react";
import ContentManagement from "@/components/dashboard/ContentManagement";
import BlogEditor from "@/components/dashboard/BlogEditor";
import UserManagement from "@/components/dashboard/UserManagement";
import HelpSection from "@/components/dashboard/HelpSection";
import Analytics from "@/components/dashboard/Analytics";
import BroadcastManagement from "@/components/dashboard/BroadcastManagement";
import AccountSettings from "@/components/dashboard/AccountSettings";
import ReportsManagement from "@/components/dashboard/ReportsManagement";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Pengguna");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  // Fetch user's full name and avatar from profiles table
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();
            
          if (error) {
            console.error('Error fetching user profile:', error);
            return;
          }
          
          if (data) {
            if (data.full_name) {
              setUserName(data.full_name);
            }
            if (data.avatar_url) {
              setUserAvatar(data.avatar_url);
            }
          }
        } catch (error) {
          console.error('Error in profile fetch:', error);
        }
      }
    };
    
    fetchUserProfile();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      toast({
        title: "Gagal Logout",
        description: "Terjadi kesalahan saat mencoba keluar",
        variant: "destructive"
      });
    }
  };

  // Handle exit dashboard
  const handleExitDashboard = () => {
    navigate("/");
  };

  // Mock user data - in a real app, this would come from user context or API
  const mockUser = {
    name: userName,
    email: user?.email || "pengguna@example.com",
    role: "Admin", // Could be "Admin", "Teacher", or "User"
    isProfessional: true, // New field to identify professional accounts
    avatarUrl: userAvatar || "https://randomuser.me/api/portraits/men/32.jpg"
  };
  
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  return <div className="min-h-screen flex flex-col">
      <div className="flex-1 pt-1">
        <div className="flex min-h-screen">
          {/* Sidebar - Mobile Overlay */}
          {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar}></div>}
          
          {/* Sidebar */}
          <aside className={`fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-30 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="p-4 h-full flex flex-col max-h-screen h-auto">
              {/* Brand Logo at the top of sidebar */}
              <div className="flex items-center space-x-2 mb-6 mt-4">
                <Brain className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl tracking-tight">Mind MHIRC</span>
              </div>
              
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
                  
                  <button onClick={handleExitDashboard} className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                    <ArrowLeft className="mr-3 h-5 w-5" />
                    Kembali ke Beranda
                  </button>
                  
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
                  {(mockUser.role === "Admin" || mockUser.role === "Teacher") && <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                        {mockUser.role === "Admin" ? "Admin" : "Guru"}
                      </div>
                      
                      {mockUser.role === "Teacher" && <Link to="/dashboard/students" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                          <Users className="mr-3 h-5 w-5" />
                          Daftar Murid
                        </Link>}
                      
                      {mockUser.role === "Admin" && <>
                          <Link to="/dashboard/users" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                            <Users className="mr-3 h-5 w-5" />
                            Manajemen Pengguna
                          </Link>
                          
                          <Link to="/dashboard/content" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                            <FileText className="mr-3 h-5 w-5" />
                            Manajemen Konten
                          </Link>
                          
                          <Link to="/dashboard/broadcast" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                            <Megaphone className="mr-3 h-5 w-5" />
                            Siaran
                          </Link>
                          
                          <Link to="/dashboard/reports" className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary">
                            <AlertCircle className="mr-3 h-5 w-5" />
                            Laporan
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
            </div>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0 overflow-x-hidden">
            {/* Top Bar */}
            <div className="bg-card border-b sticky top-0 z-30">
              <div className="flex items-center justify-between h-16 px-4">
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
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center space-x-1 focus:outline-none">
                        <img src={mockUser.avatarUrl} alt={mockUser.name} className="w-8 h-8 rounded-full object-cover" />
                        <ChevronDown size={16} className="text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <div className="px-2 py-1.5 text-sm font-medium">
                          {mockUser.name}
                        </div>
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          {mockUser.email}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard/settings">Pengaturan Akun</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExitDashboard}>
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          <span>Keluar Dashboard</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Page Content */}
            <div className="p-4 sm:p-6">
              {/* Dashboard Routes */}
              <Routes>
                <Route index element={<DashboardOverview user={mockUser} />} />
                <Route path="tests/*" element={<DashboardTests user={mockUser} />} />
                <Route path="results/*" element={<DashboardResults user={mockUser} />} />
                <Route path="appointments/*" element={<DashboardAppointments user={mockUser} />} />
                <Route path="messages/*" element={<DashboardMessages user={mockUser} />} />
                
                {/* Teacher Routes */}
                {mockUser.role === "Teacher" && <Route path="students/*" element={<DashboardStudents user={mockUser} />} />}
                
                {/* Admin Routes */}
                {mockUser.role === "Admin" && <>
                    <Route path="users/*" element={<UserManagement />} />
                    <Route path="content" element={<DashboardContent user={mockUser} />} />
                    <Route path="content/new" element={<DashboardContentNew user={mockUser} />} />
                    <Route path="content/edit/:slug" element={<DashboardContentEdit user={mockUser} />} />
                    <Route path="broadcast/*" element={<DashboardBroadcast user={mockUser} />} />
                    <Route path="reports/*" element={<DashboardReports user={mockUser} />} />
                    <Route path="analytics/*" element={<DashboardAnalytics user={mockUser} />} />
                  </>}
                
                <Route path="settings/*" element={<DashboardSettings user={mockUser} />} />
                <Route path="help/*" element={<DashboardHelp user={mockUser} />} />
                <Route path="*" element={<DashboardNotFound />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>;
};

const DashboardOverview = ({
  user
}: {
  user: any;
}) => {
  return <div className="mt-1">
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
}) => {
  return <div>
    <ContentManagement />
  </div>;
};

const DashboardContentNew = ({
  user
}: {
  user: any;
}) => {
  return <div>
    <BlogEditor />
  </div>;
};

const DashboardContentEdit = ({
  user
}: {
  user: any;
}) => {
  return <div>
    <BlogEditor />
  </div>;
};

const DashboardAnalytics = ({
  user
}: {
  user: any;
}) => <div>
    <Analytics />
  </div>;

const DashboardBroadcast = ({
  user
}: {
  user: any;
}) => <div>
    <BroadcastManagement />
  </div>;

const DashboardReports = ({
  user
}: {
  user: any;
}) => <div>
    <ReportsManagement />
  </div>;

const DashboardSettings = ({
  user
}: {
  user: any;
}) => <div>
    <AccountSettings />
  </div>;

const DashboardHelp = ({
  user
}: {
  user: any;
}) => <div>
    <HelpSection />
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

import { useState, useEffect } from "react";
import * as React from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  BoxSelect,
  Brain,
  Calendar,
  ChevronDown,
  ClipboardList,
  File,
  FileText,
  Home,
  LineChart,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  PieChart,
  Users,
  X,
  Megaphone,
  AlertCircle,
  // Import Settings dengan alias
  Settings as SettingsIcon
} from "lucide-react";
import Footer from "@/components/Footer";
import Button from "@/components/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

import ContentManagement from "@/components/dashboard/ContentManagement";
import BlogEditor from "@/components/dashboard/BlogEditor";
import UserManagement from "@/components/dashboard/UserManagement";
import HelpSection from "@/components/dashboard/HelpSection";
import Analytics from "@/components/dashboard/Analytics";
import BroadcastManagement from "@/components/dashboard/BroadcastManagement";
import AccountSettings from "@/components/dashboard/AccountSettings";
import ReportsManagement from "@/components/dashboard/ReportsManagement";
import MessageManagement from "@/components/dashboard/MessageManagement";
import TestListResults from "@/components/dashboard/TestListResults";
import TestResultsTable from "@/components/dashboard/TestResultsTable";
import SpiritualAccountManagement from "../components/dashboard/spiritual-budaya/SpiritualAccountManagement";
import SpiritualAssignmentManagement from "../components/dashboard/spiritual-budaya/SpiritualAssignmentManagement";
import SpiritualMeetingManagement from "../components/dashboard/spiritual-budaya/SpiritualMeetingManagement";
import HibridaAccountManagement from "@/components/dashboard/hibrida-cbt/HibridaAccountManagement";
import HibridaAssignmentManagement from "@/components/dashboard/hibrida-cbt/HibridaAssignmentManagement";
import HibridaMeetingManagement from "@/components/dashboard/hibrida-cbt/HibridaMeetingManagement";
import PsikoedukasiManagement from "@/components/dashboard/safe-mother/PsikoedukasiManagement";

// Variabel global untuk menentukan role user
let id = "";
let isProfessional = false;
let isAdmin = false;
let globalUnreadBroadcastsCount = 0;

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Pengguna");
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [unreadBroadcastsCount, setUnreadBroadcastsCount] = useState(0);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  // Ambil profile user
  useEffect(() => {
    const fetchUserProfile = async () => {
      id = user?.id;
      isProfessional = user?.account_type === "professional";
      isAdmin = user?.is_admin === true;
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .single();
          if (error) {
            console.error("Error fetching user profile:", error);
            return;
          }
          if (data) {
            if (data.full_name) setUserName(data.full_name);
            if (data.avatar_url) setUserAvatar(data.avatar_url);
          }
        } catch (error) {
          console.error("Error in profile fetch:", error);
        }
      }
    };
    fetchUserProfile();
    fetchUnreadBroadcastsCount();
  }, [user]);

  // Ambil unread broadcasts count (logika dari Dashboard (1))
  const fetchUnreadBroadcastsCount = async () => {
    try {
      let accountTypeFilter: string[] = [];
      if (user.account_type === "professional") {
        accountTypeFilter = ["professional", "all"];
      } else {
        accountTypeFilter = ["general", "all"];
      }

      // Ambil semua broadcast yang bisa dilihat user
      const { data: broadcasts, error: broadcastError } = await supabase
        .from("broadcasts")
        .select("id, recipients, recepient_read") // Perbaiki nama kolom jika perlu
        .overlaps("recipients", accountTypeFilter); // Pastikan user bisa melihat

      if (broadcastError) throw broadcastError;

      if (!broadcasts || broadcasts.length === 0) {
        setUnreadBroadcastsCount(0);
        globalUnreadBroadcastsCount = 0;
        return;
      }

      // Filter broadcast yang belum dibaca oleh user
      const unreadCount = broadcasts.filter((broadcast) => {
        let recipientRead: string[] = [];

        // Pastikan recepient_read ada dan dalam format array yang valid
        if (broadcast.recepient_read) {
          if (Array.isArray(broadcast.recepient_read)) {
            recipientRead = broadcast.recepient_read.filter(
              (item) => typeof item === "string"
            ) as string[];
          } else if (typeof broadcast.recepient_read === "string") {
            try {
              recipientRead = JSON.parse(broadcast.recepient_read);
            } catch (e) {
              recipientRead = [];
            }
          }
        }
        console.log(
          "Recipient read:" + recipientRead,
          "dari broadcast:" + broadcast.recepient_read
        );

        // Kembalikan true jika user belum membaca broadcast ini
        return !recipientRead.includes(user.id);
      }).length;

      // Set jumlah broadcast yang belum dibaca
      setUnreadBroadcastsCount(unreadCount);
      globalUnreadBroadcastsCount = unreadCount;
    } catch (error) {
      console.error("Error fetching unread broadcasts count:", error);
    }
  };

  // Menggunakan logika pengambilan ruang obrolan dari Dashboard (2)
  // useEffect(() => {
  //   if (!user) return;
  //   const fetchChatRooms = async () => {
  //     setIsSidebarOpen(false); // opsional, jika ingin menutup sidebar setelah navigasi
  //     try {
  //       const { data: roomsData, error: roomsError } = await supabase
  //         .from("chat_rooms")
  //         .select("*")
  //         .order("updated_at", { ascending: false });
  //       if (roomsError) throw roomsError;
  //       if (!roomsData || roomsData.length === 0) {
  //         setChatRooms([]);
  //         return;
  //       }
  //       const roomsWithParticipants: any[] = [];
  //       for (const room of roomsData) {
  //         try {
  //           const { data: participants, error: participantsError } =
  //             await supabase
  //               .from("chat_participants")
  //               .select("user_id")
  //               .eq("chat_room_id", room.id);
  //           if (participantsError) throw participantsError;
  //           const isUserParticipant = participants?.some(
  //             (p) => p.user_id === user.id
  //           );
  //           if (isUserParticipant) {
  //             const userIds = participants.map((p) => p.user_id);
  //             const { data: profilesData, error: profilesError } =
  //               await supabase
  //                 .from("profiles")
  //                 .select("id, full_name, avatar_url, is_admin, account_type")
  //                 .in("id", userIds);
  //             if (profilesError) throw profilesError;
  //             roomsWithParticipants.push({
  //               ...room,
  //               participants: profilesData || []
  //             });
  //           }
  //         } catch (error) {
  //           console.error(
  //             `Error fetching participants for room ${room.id}:`,
  //             error
  //           );
  //         }
  //       }
  //       setChatRooms(roomsWithParticipants);
  //       if (roomsWithParticipants.length > 0 && !selectedRoomId) {
  //         setSelectedRoomId(roomsWithParticipants[0].id);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching chat rooms:", error);
  //     }
  //   };
  //   fetchChatRooms();
  // }, [user, selectedRoomId]);

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

  const handleExitDashboard = () => {
    navigate("/");
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const mockUser = {
    name: userName,
    email: user?.email || "pengguna@example.com",
    role: "Admin",
    isProfessional: true,
    avatarUrl:
      userAvatar ||
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQegOUQhLi-BzZMVWRISTFzDIO47cEfvnhd9g&s"
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pt-1">
        <div className="flex min-h-screen">
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={toggleSidebar}
            ></div>
          )}
          <aside
            className={`fixed top-0 left-0 z-40 h-screen w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-30 ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-4 h-full flex flex-col max-h-screen">
              <div className="flex items-center space-x-2 mb-6 mt-4">
                <Brain className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl tracking-tight">
                  Mind MHIRC
                </span>
              </div>
              <div className="flex items-center justify-between lg:hidden">
                <span className="font-semibold">Menu</span>
                <button
                  onClick={toggleSidebar}
                  className="p-1 rounded-full hover:bg-muted"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mt-5 flex-1 overflow-y-auto max-h-screen">
                <nav className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                  >
                    <Home className="mr-3 h-5 w-5" />
                    Beranda
                  </Link>
                  <button
                    onClick={handleExitDashboard}
                    className="w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                  >
                    <ArrowLeft className="mr-3 h-5 w-5" />
                    Kembali ke Beranda
                  </button>
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                      Menu Utama
                    </div>
                    <Link
                      to="/dashboard/tests"
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                    >
                      <ClipboardList className="mr-3 h-5 w-5" />
                      Tes Mental
                    </Link>
                    <Link
                      to="/dashboard/results"
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                    >
                      <PieChart className="mr-3 h-5 w-5" />
                      Hasil Tes
                    </Link>
                    <Link
                      to="/dashboard/appointments"
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                    >
                      <Calendar className="mr-3 h-5 w-5" />
                      Janji Konsultasi
                    </Link>
                    <Link
                      to="/dashboard/diary"
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                    >
                      <BookOpen className="mr-3 h-5 w-5" />
                      Catatan Harian
                    </Link>
                    <Link
                      to="/dashboard/ai-companion"
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                    >
                      <MessageSquare className="mr-3 h-5 w-5" />
                      Teman AI
                    </Link>
                    <Link
                      to="/dashboard/mindforum"
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                    >
                      <Users className="mr-3 h-5 w-5" />
                      Forum Mind
                    </Link>
                    <Link
                      to="/dashboard/messages"
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                    >
                      <Mail className="mr-3 h-5 w-5" />
                      Pesan
                      {unreadBroadcastsCount > 0 && (
                        <span className="ml-auto bg-primary text-white text-xs py-0.5 px-1.5 rounded-full">
                          {unreadBroadcastsCount}
                        </span>
                      )}
                    </Link>
                    {/* Spiritual & Budaya submenu - hanya admin/professional */}
                    {(isAdmin || isProfessional) && (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                          Spiritual & Budaya
                        </div>
                        <Link
                          to="/dashboard/spiritual-budaya/account"
                          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                        >
                          <Users className="mr-3 h-5 w-5" />
                          Manajemen Akun
                        </Link>
                        <Link
                          to="/dashboard/spiritual-budaya/assignments"
                          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                        >
                          <ClipboardList className="mr-3 h-5 w-5" />
                          Manajemen Penugasan
                        </Link>
                        <Link
                          to="/dashboard/spiritual-budaya/meetings"
                          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                        >
                          <Calendar className="mr-3 h-5 w-5" />
                          Manajemen Pertemuan
                        </Link>
                      </>
                    )}
                    {/* Hibrida Naratif CBT submenu - hanya admin/professional */}
                    {(isAdmin || isProfessional) && (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                          Hibrida Naratif CBT
                        </div>
                        <Link
                          to="/dashboard/hibrida-cbt/account"
                          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                        >
                          <Users className="mr-3 h-5 w-5" />
                          Manajemen Akun
                        </Link>
                        <Link
                          to="/dashboard/hibrida-cbt/assignments"
                          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                        >
                          <ClipboardList className="mr-3 h-5 w-5" />
                          Manajemen Penugasan
                        </Link>
                        <Link
                          to="/dashboard/hibrida-cbt/meetings"
                          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                        >
                          <Calendar className="mr-3 h-5 w-5" />
                          Manajemen Pertemuan
                        </Link>
                      </>
                    )}
                    {/* Safe Mother submenu - hanya admin */}
                    {(isAdmin) && (
                      <>
                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                          Safe Mother
                        </div>
                        <Link
                          to="/dashboard/safe-mother/psikoedukasi"
                          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                        >
                          <FileText className="mr-3 h-5 w-5" />
                          Manajemen Psikoedukasi
                        </Link>
                      </>
                    )}
                  </div>
                  {(isAdmin || mockUser.role === "Teacher") && (
                    <div>
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                        {isAdmin ? "Admin" : "Guru"}
                      </div>
                      {mockUser.role === "Teacher" && (
                        <Link
                          to="/dashboard/students"
                          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                        >
                          <Users className="mr-3 h-5 w-5" />
                          Daftar Murid
                        </Link>
                      )}
                      {isAdmin && (
                        <>
                          <Link
                            to="/dashboard/users"
                            className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                          >
                            <Users className="mr-3 h-5 w-5" />
                            Manajemen Pengguna
                          </Link>
                          <Link
                            to="/dashboard/content"
                            className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                          >
                            <FileText className="mr-3 h-5 w-5" />
                            Manajemen Konten
                          </Link>
                          <Link
                            to="/dashboard/broadcast"
                            className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                          >
                            <Megaphone className="mr-3 h-5 w-5" />
                            Siaran
                          </Link>
                          <Link
                            to="/dashboard/reports"
                            className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                          >
                            <AlertCircle className="mr-3 h-5 w-5" />
                            Laporan
                          </Link>
                          <Link
                            to="/dashboard/analytics"
                            className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                          >
                            <LineChart className="mr-3 h-5 w-5" />
                            Statistik & Analitik
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4">
                      Pengaturan
                    </div>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                    >
                      <SettingsIcon className="mr-3 h-5 w-5" />
                      Pengaturan Akun
                    </Link>
                    <Link
                      to="/dashboard/help"
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-muted hover:text-primary"
                    >
                      <BookOpen className="mr-3 h-5 w-5" />
                      Bantuan
                    </Link>
                  </div>
                </nav>
              </div>
            </div>
          </aside>
          <main className="flex-1 min-w-0 overflow-x-hidden">
            <div className="bg-card border-b sticky top-0 z-30">
              <div className="flex items-center justify-between h-16 px-4">
                <div className="flex items-center">
                  <button
                    onClick={toggleSidebar}
                    className="p-2 mr-2 rounded-md lg:hidden hover:bg-muted"
                  >
                    <Menu size={20} />
                  </button>
                  <div className="flex items-center text-lg font-semibold">
                    Dashboard
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Link
                    to="/dashboard/messages"
                    className="p-2 rounded-md hover:bg-muted relative"
                  >
                    <Mail size={20} />
                    {unreadBroadcastsCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                    )}
                  </Link>
                  <div className="relative">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center space-x-1 focus:outline-none">
                        <img
                          src={mockUser.avatarUrl}
                          alt={mockUser.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <ChevronDown
                          size={16}
                          className="text-muted-foreground"
                        />
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
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Log Out</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <Routes>
                <Route index element={<DashboardOverview user={mockUser} />} />
                <Route
                  path="tests/*"
                  element={<DashboardTests user={mockUser} />}
                />
                <Route
                  path="results/*"
                  element={<DashboardResults user={mockUser} />}
                />
                <Route
                  path="appointments/*"
                  element={<DashboardAppointments user={mockUser} />}
                />
                <Route path="diary/*" element={<DashboardDiary user={mockUser} />} />
                <Route path="ai-companion/*" element={<DashboardAICompanion user={mockUser} />} />
                <Route path="mindforum/*" element={<DashboardForumMind user={mockUser} />} />
                <Route path="messages/*" element={<MessageManagement />} />
                {/* Spiritual & Budaya - hanya admin/professional */}
                {(isAdmin || isProfessional) && (
                  <>
                    <Route path="spiritual-budaya/account/*" element={<SpiritualAccountManagement />} />
                    <Route path="spiritual-budaya/assignments/*" element={<SpiritualAssignmentManagement />} />
                    <Route path="spiritual-budaya/meetings/*" element={<SpiritualMeetingManagement />} />
                  </>
                )}
                {/* Hibrida Naratif CBT - hanya admin/professional */}
                {(isAdmin || isProfessional) && (
                  <>
                    <Route path="hibrida-cbt/account/*" element={<HibridaAccountManagement />} />
                    <Route path="hibrida-cbt/assignments/*" element={<HibridaAssignmentManagement />} />
                    <Route path="hibrida-cbt/meetings/*" element={<HibridaMeetingManagement />} />
                  </>
                )}
                {/* Safe Mother - hanya admin */}
                {(isAdmin) && (
                  <>
                    <Route path="safe-mother/psikoedukasi" element={<PsikoedukasiManagement />} />
                  </>
                )}
                {mockUser.role === "Teacher" && (
                  <Route
                    path="students/*"
                    element={<DashboardStudents user={mockUser} />}
                  />
                )}
                {isAdmin && (
                  <>
                    <Route path="users/*" element={<UserManagement />} />
                    <Route
                      path="content"
                      element={<DashboardContent user={mockUser} />}
                    />
                    <Route
                      path="content/new"
                      element={<DashboardContentNew user={mockUser} />}
                    />
                    <Route
                      path="content/edit/:slug"
                      element={<DashboardContentEdit user={mockUser} />}
                    />
                    <Route
                      path="broadcast/*"
                      element={<DashboardBroadcast user={mockUser} />}
                    />
                    <Route
                      path="reports/*"
                      element={<DashboardReports user={mockUser} />}
                    />
                    <Route
                      path="analytics/*"
                      element={<DashboardAnalytics user={mockUser} />}
                    />
                  </>
                )}
                <Route
                  path="settings/*"
                  element={<DashboardSettings user={mockUser} />}
                />
                <Route
                  path="help/*"
                  element={<DashboardHelp user={mockUser} />}
                />
                <Route path="*" element={<DashboardNotFound />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// DashboardOverview dan komponen terkait diambil dari Dashboard (1)
const DashboardOverview = ({ user }: { user: any }) => {
  const [stats, setStats] = useState({
    totalTests: 0,
    testsLast7Days: 0,
    totalBlogs: 0,
    blogsLast7Days: 0
  });
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();

    try {
      console.log("Fetching data...");

      // Fetch data dari Supabase
      const [
        { data: testData, error: testError },
        { count: totalTests, error: totalError },
        { count: testsLast7Days, error: last7DaysError },
        { count: totalBlogs, error: blogError },
        { count: blogsLast7Days, error: blogsLast7DaysError }
      ] = await Promise.all([
        supabase
          .from("test_results")
          .select("id, test_title, created_at, user_id") // Ambil hanya kolom yang diperlukan
          .order("created_at", { ascending: false })
          .limit(4), // Batasi hasil hanya 4 data
        supabase
          .from("test_results")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("test_results")
          .select("id", { count: "exact", head: true })
          .gte("created_at", sevenDaysAgoISO),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("blog_posts")
          .select("id", { count: "exact", head: true })
          .gte("published_date", sevenDaysAgoISO)
      ]);

      // Debug response dari Supabase
      console.log("Test Data:", testData);
      console.log("Stats: ", {
        totalTests,
        testsLast7Days,
        totalBlogs,
        blogsLast7Days
      });

      // Tangani error eksplisit
      if (testError) console.error("Error fetching test results:", testError);
      if (totalError) console.error("Error fetching total tests:", totalError);
      if (last7DaysError)
        console.error("Error fetching last 7 days tests:", last7DaysError);
      if (blogError) console.error("Error fetching total blogs:", blogError);
      if (blogsLast7DaysError)
        console.error("Error fetching blogs last 7 days:", blogsLast7DaysError);

      if (
        testError ||
        totalError ||
        last7DaysError ||
        blogError ||
        blogsLast7DaysError
      )
        return;

      // Set semua state dalam satu tahap
      setTestResults(testData || []);
      setStats({
        totalTests: totalTests || 0,
        testsLast7Days: testsLast7Days || 0,
        totalBlogs: totalBlogs || 0,
        blogsLast7Days: blogsLast7Days || 0
      });
    } catch (error) {
      console.error("Unexpected error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    console.log("Updated testResults:", stats);
  }, [testResults]);

  return (
    <div className="mt-1">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl font-semibold mb-1">
          Selamat Datang, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Berikut adalah ringkasan aktivitas Anda.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Tes Selesai</h3>
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <ClipboardList size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.totalTests}</p>
          <p className="text-xs text-muted-foreground">
            {stats.testsLast7Days} tes dalam 7 hari terakhir
          </p>
        </div>
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Janji Terjadwal</h3>
            <div className="bg-secondary/10 text-secondary p-2 rounded-lg">
              <Calendar size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">-</p>
          <p className="text-xs text-muted-foreground">Akan Segera Datang</p>
        </div>
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Pesan Baru</h3>
            <div className="bg-accent-500/10 text-accent-500 p-2 rounded-lg">
              <MessageSquare size={20} />
            </div>
          </div>

          <p className="text-2xl font-bold">
            {globalUnreadBroadcastsCount && globalUnreadBroadcastsCount > 0
              ? globalUnreadBroadcastsCount
              : 0}
          </p>

          <p className="text-xs text-muted-foreground">
            {globalUnreadBroadcastsCount && globalUnreadBroadcastsCount > 0
              ? "Terdapat pesan yang belum dibaca"
              : "Semua pesan telah dibaca"}
          </p>
        </div>
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Artikel Terbaru</h3>
            <div className="bg-green-500/10 text-green-500 p-2 rounded-lg">
              <File size={20} />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.totalBlogs}</p>
          <p className="text-xs text-muted-foreground">
            {stats.blogsLast7Days} artikel edukasi baru minggu ini
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <h3 className="font-semibold mb-4">Aktivitas Tes Terbaru</h3>

          {testResults.length > 0 ? (
            <div className="space-y-4">
              {testResults.map((test) => (
                <div key={test.id} className="flex items-start">
                  <div className="mr-3 p-2 bg-muted rounded-lg">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <p className="font-medium">
                      Menyelesaikan Tes {test.test_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(test.created_at).toLocaleDateString("id-ID", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6">
              <p className="text-sm">Belum ada aktivitas tes terbaru.</p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" size="sm" className="w-full">
              <Link to="/dashboard/results">Lihat Semua Aktivitas</Link>
            </Button>
          </div>
        </div>

        <div className="bg-card shadow-soft rounded-xl p-4 md:p-6">
          <h3 className="font-semibold mb-4">Tes yang Direkomendasikan</h3>
          <div className="space-y-4">
            {[
              {
                title: "Tes Kecemasan GAD-7",
                desc: "Evaluasi tingkat kecemasan Anda saat ini",
                duration: "5-7 menit"
              },
              {
                title: "Tes Kesehatan Mental Harian",
                desc: "Lacak kondisi kesehatan mental Anda sehari-hari",
                duration: "3-5 menit"
              },
              {
                title: "Tes Manajemen Stres",
                desc: "Evaluasi kemampuan Anda mengelola stres",
                duration: "8-10 menit"
              }
            ].map((test, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg hover:border-primary transition-colors"
              >
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
                  <Link to={`/tests`}>
                    <Button variant="outline" size="sm">
                      Mulai Tes
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
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
    </div>
  );
};

const DashboardResults = ({ user }: { user: any }) => (
  <div>
    <TestListResults
      isProfessional={isProfessional}
      userId={id}
      isAdmin={isAdmin}
    />
  </div>
);

// Untuk appointment, gunakan komponen dari Dashboard (1)
const DashboardAppointments = ({ user }: { user: any }) => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Janji Konsultasi</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>
        Halaman ini akan memungkinkan Anda menjadwalkan, melihat, atau
        membatalkan janji konsultasi dengan psikolog atau konselor.
      </p>
    </div>
  </div>
);

const DashboardTests = ({ user }: { user: any }) => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Tes Mental</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>
        Halaman ini akan berisi daftar tes mental yang tersedia, baik yang
        gratis maupun berbayar, beserta informasi tentang masing-masing tes.
      </p>
    </div>
  </div>
);

const DashboardMessages = ({ user }: { user: any }) => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Pesan</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>
        Halaman ini akan menampilkan sistem pesan untuk berkomunikasi dengan
        profesional kesehatan mental atau staf Mind MHIRC.
      </p>
    </div>
  </div>
);

const DashboardStudents = ({ user }: { user: any }) => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Daftar Murid</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>
        Halaman ini akan menampilkan daftar murid Anda, dengan opsi untuk
        melihat hasil tes, mengirim tes baru, atau mengelola data murid.
      </p>
    </div>
  </div>
);

const DashboardUsers = ({ user }: { user: any }) => (
  <div>
    <h1 className="text-2xl font-semibold mb-6">Manajemen Pengguna</h1>
    <div className="bg-card shadow-soft rounded-xl p-6">
      <p>
        Halaman ini akan memungkinkan Anda mengelola semua pengguna sistem,
        termasuk menambah, mengedit, atau menghapus akun pengguna.
      </p>
    </div>
  </div>
);

const DashboardContent = ({ user }: { user: any }) => (
  <div>
    <ContentManagement />
  </div>
);

const DashboardContentNew = ({ user }: { user: any }) => (
  <div>
    <BlogEditor />
  </div>
);

const DashboardContentEdit = ({ user }: { user: any }) => (
  <div>
    <BlogEditor />
  </div>
);

const DashboardAnalytics = ({ user }: { user: any }) => (
  <div>
    <Analytics />
  </div>
);

const DashboardBroadcast = ({ user }: { user: any }) => (
  <div>
    <BroadcastManagement />
  </div>
);

const DashboardReports = ({ user }: { user: any }) => (
  <div>
    <ReportsManagement />
  </div>
);

const DashboardSettings = ({ user }: { user: any }) => (
  <div>
    <AccountSettings />
  </div>
);

const DashboardHelp = ({ user }: { user: any }) => (
  <div>
    <HelpSection />
  </div>
);

const DashboardDiary = ({ user }: { user: any }) => {
  const Diary = React.lazy(() => import("./Diary"));
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <Diary />
    </React.Suspense>
  );
};

const DashboardAICompanion = ({ user }: { user: any }) => {
  const AICompanion = React.lazy(() => import("./AICompanion"));
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <AICompanion />
    </React.Suspense>
  );
};

const DashboardForumMind = ({ user }: { user: any }) => {
  const ForumMind = React.lazy(() => import("./ForumMind"));
  return (
    <React.Suspense fallback={<div className="flex justify-center items-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <ForumMind />
    </React.Suspense>
  );
};

const DashboardNotFound = () => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-semibold mb-4">Halaman Tidak Ditemukan</h1>
    <p className="text-muted-foreground mb-8">
      Maaf, halaman yang Anda cari tidak tersedia.
    </p>
    <Link to="/dashboard">
      <Button>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali ke Dashboard
      </Button>
    </Link>
  </div>
);

export default Dashboard;

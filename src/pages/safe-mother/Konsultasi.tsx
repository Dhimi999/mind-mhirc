import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; // atau useToast dari hooks Anda
import { useAuth } from "@/contexts/AuthContext"; // Sesuaikan dengan path context Anda
import { supabase } from "@/integrations/supabase/client";
import {
  User,
  Send,
  MessageSquare,
  List,
  Clock,
  CheckCircle,
  ArrowLeft,
  Stethoscope,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import SafeMotherNavbar from "@/components/SafeMotherNavbar";
import { Helmet } from "react-helmet-async";
import { Json } from "@/integrations/type.ts"; // Sesuaikan path jika perlu

// Definisikan tipe data yang dibutuhkan
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  account_type: string | null;
  profession?: string | null; // Tambahkan profession untuk profesional
}

interface ConsultationRoom {
  id: string;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_at: string | null;
  participants: Profile[];
}

interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by: Json | null; // <-- INI PERBAIKANNYA
  sender?: Profile;
}

const Konsultasi = () => {
  // Workaround: Some TS setups flag Helmet as not a valid JSX component due to react type resolution.
  // Casting it locally avoids false positives while keeping runtime intact.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const HelmetAny = Helmet as unknown as React.FC<any>;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("professionals");
  const [professionals, setProfessionals] = useState<Profile[]>([]);
  const [consultationRooms, setConsultationRooms] = useState<
    ConsultationRoom[]
  >([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState({
    professionals: true,
    rooms: true,
    messages: false,
    sending: false
  });
  const [startingChatId, setStartingChatId] = useState<string | null>(null); // <-- TAMBAHKAN INI

  // 1. Fetch daftar profesional
  useEffect(() => {
    const fetchProfessionals = async () => {
      setIsLoading((prev) => ({ ...prev, professionals: true }));
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, profession, account_type")
          .in("profession", ["Dokter", "Perawat"])
          .order("full_name");

        if (error) throw error;
        setProfessionals(data || []);
      } catch (error) {
        console.error("Error fetching professionals:", error);
        toast.error("Gagal memuat daftar profesional.");
      } finally {
        setIsLoading((prev) => ({ ...prev, professionals: false }));
      }
    };
    fetchProfessionals();
  }, []);
  // 2. Fetch riwayat konsultasi (chat rooms)
  const fetchConsultationRooms = useCallback(async () => {
    if (!user) return;
    setIsLoading((prev) => ({ ...prev, rooms: true }));
    try {
      // Ambil semua room_id dimana user adalah partisipan
      const { data: participantsData, error: participantsError } =
        await supabase
          .from("chat_participants")
          .select("chat_room_id")
          .eq("user_id", user.id);
      if (participantsError) throw participantsError;

      const roomIds = participantsData.map((p) => p.chat_room_id);
      if (roomIds.length === 0) {
        setConsultationRooms([]);
        return;
      }

      // Ambil data room yang tipenya 'safe-mother' (khusus layanan Safe Mother)
      const { data: roomsData, error: roomsError } = await supabase
        .from("chat_rooms")
        .select("*")
        .in("id", roomIds)
        .eq("type", "safe-mother")
        .order("updated_at", { ascending: false });
      if (roomsError) throw roomsError;

      // Ambil data partisipan untuk setiap room
      const roomsWithParticipants = await Promise.all(
        roomsData.map(async (room) => {
          const { data: roomParticipants, error: roomParticipantsError } =
            await supabase
              .from("chat_participants")
              .select("profiles(id, full_name, avatar_url, account_type)")
              .eq("chat_room_id", room.id);
          if (roomParticipantsError) throw roomParticipantsError;
          const participants = roomParticipants.map(
            (p) => p.profiles
          ) as Profile[];
          return { ...room, participants };
        })
      );
      setConsultationRooms(roomsWithParticipants);
    } catch (error) {
      console.error("Error fetching consultation rooms:", error);
      toast.error("Gagal memuat riwayat konsultasi.");
    } finally {
      setIsLoading((prev) => ({ ...prev, rooms: false }));
    }
  }, [user]);

  useEffect(() => {
    fetchConsultationRooms();
  }, [fetchConsultationRooms]);

  // 3. Logika untuk memulai chat baru atau membuka yang sudah ada
  const handleStartChat = async (professionalId: string) => {
    if (!user) return toast.error("Anda harus login untuk memulai konsultasi.");

    setStartingChatId(professionalId); // <-- MULAI LOADING

    try {
      // Cek apakah sudah ada room antara user dan profesional ini
      const { data: existingRoom, error: checkError } = await supabase.rpc(
        "get_shared_chat_room",
        {
          user_id_1: user.id,
          user_id_2: professionalId,
          room_type: "safe-mother"
        }
      );

      if (checkError) {
        console.error("Error checking for existing room:", checkError);
        toast.error("Terjadi kesalahan, silakan coba lagi.");
        setStartingChatId(null);
        return; // Hentikan eksekusi jika ada error
      }

      if (existingRoom) {
        // Jika room sudah ada, langsung buka
        setSelectedRoomId(existingRoom);
        setActiveTab("history");
      } else {
        // Jika belum ada, buat room baru
        // ... (logika 'try...catch' internal Anda untuk membuat room tetap sama)
        const { data: newRoomData, error: roomError } = await supabase
          .from("chat_rooms")
          .insert({ created_by: user.id, type: "safe-mother" })
          .select()
          .single();
        if (roomError || !newRoomData) throw roomError;

        await supabase.from("chat_participants").insert([
          { chat_room_id: newRoomData.id, user_id: user.id },
          { chat_room_id: newRoomData.id, user_id: professionalId }
        ]);

        await fetchConsultationRooms();
        setSelectedRoomId(newRoomData.id);
        setActiveTab("history");
        toast.success("Ruang konsultasi berhasil dibuat!");
      }
    } catch (error) {
      console.error("Error in handleStartChat:", error);
      // Toast error sudah ada di blok catch internal Anda, jadi ini opsional
    } finally {
      setStartingChatId(null); // <-- SELALU HENTIKAN LOADING
    }
  };

  // 4. Fetch messages untuk room yang dipilih
  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      return;
    }
    
    // Kosongkan messages saat berpindah antar room
    setMessages([]);

    const fetchMessages = async () => {
      setIsLoading((prev) => ({ ...prev, messages: true }));
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*, sender: profiles(*)")
          .eq("chat_room_id", selectedRoomId)
          .order("created_at");

        if (error) throw error;
        setMessages(data || []); // Gunakan `data || []` agar lebih aman
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Gagal memuat pesan.");
      } finally {
        setIsLoading((prev) => ({ ...prev, messages: false }));
      }
    };
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat:${selectedRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_room_id=eq.${selectedRoomId}`
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;

          // Ambil data sender untuk pesan baru, agar foto & nama tampil
          const { data: senderData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", newMessage.sender_id)
            .single();

          if (senderData) {
            newMessage.sender = senderData;
            // Tambahkan HANYA pesan baru ke state, bukan fetch ulang semua
            setMessages((currentMessages) => [...currentMessages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoomId]);

  // 5. Kirim pesan
  const handleSendMessage = async () => {
    if (!user || !selectedRoomId || !newMessage.trim()) return;
    setIsLoading((prev) => ({ ...prev, sending: true }));
    try {
      const content = newMessage.trim();
      setNewMessage(""); // Optimistic UI
      const { error } = await supabase.from("chat_messages").insert({
        chat_room_id: selectedRoomId,
        sender_id: user.id,
        content: content,
        read_by: [user.id]
      });
      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Gagal mengirim pesan.");
      setNewMessage(newMessage); // Kembalikan pesan jika gagal
    } finally {
      setIsLoading((prev) => ({ ...prev, sending: false }));
    }
  };

  const getOtherParticipant = (room: ConsultationRoom) =>
    user ? room.participants.find((p) => p.id !== user.id) : null;
  const formatDate = (dateString: string) =>
    format(new Date(dateString), "dd MMM, HH:mm", { locale: idLocale });
  const formatTime = (dateString: string) =>
    format(new Date(dateString), "HH:mm", { locale: idLocale });

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-pink-50/30 via-white to-purple-50/30">
      <HelmetAny>
        <title>Konsultasi Profesional - Safe Mother | Mind MHIRC</title>
        <meta
          name="description"
          content="Konsultasi langsung dengan psikolog dan konselor profesional untuk kesehatan mental ibu."
        />
      </HelmetAny>

      <SafeMotherNavbar />
      
      <main className="flex-1 w-full container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center p-3 bg-white/50 backdrop-blur-sm rounded-full mb-4 shadow-sm">
              <Stethoscope className="w-6 h-6 text-pink-500 mr-2" />
              <span className="text-pink-600 font-medium">Layanan Profesional</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
              Konsultasi Ahli
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dapatkan dukungan profesional dari psikolog dan konselor berpengalaman untuk mendampingi perjalanan keibuan Anda.
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full animate-fade-in-up"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/50 backdrop-blur-md p-1 rounded-full border border-white/20 shadow-sm">
                <TabsTrigger 
                  value="professionals"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-sm transition-all duration-300"
                >
                  <List className="w-4 h-4 mr-2" />
                  Daftar Profesional
                </TabsTrigger>
                <TabsTrigger 
                  value="history"
                  className="rounded-full data-[state=active]:bg-white data-[state=active]:text-pink-600 data-[state=active]:shadow-sm transition-all duration-300"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Riwayat Chat
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: DAFTAR PROFESIONAL */}
            <TabsContent value="professionals" className="space-y-6">
              <Card className="border-none shadow-lg bg-white/60 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-pink-50/50 to-purple-50/50 border-b border-white/20">
                  <CardTitle className="flex items-center text-xl text-gray-800">
                    <Sparkles className="w-5 h-5 text-yellow-500 mr-2" />
                    Pilih Profesional
                  </CardTitle>
                  <CardDescription>
                    Mulai sesi konsultasi baru dengan profesional pilihan Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {isLoading.professionals ? (
                    <div className="flex flex-col justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mx-auto mb-4"></div>
                      <p className="text-muted-foreground animate-pulse">Memuat Data Profesional...</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {professionals.map((prof) => (
                        <div
                          key={prof.id}
                          className="group flex items-center justify-between p-4 bg-white border border-pink-100 rounded-xl hover:shadow-md transition-all duration-300 hover:border-pink-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              {prof.avatar_url ? (
                                <img
                                  src={prof.avatar_url}
                                  alt={prof.full_name || ""}
                                  className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300"
                                />
                              ) : (
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-105 transition-transform duration-300">
                                  <User className="h-7 w-7 text-pink-400" />
                                </div>
                              )}
                              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-lg">{prof.full_name}</p>
                              <div className="flex items-center text-sm text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full w-fit mt-1">
                                <Stethoscope className="w-3 h-3 mr-1" />
                                {prof.profession || "Profesional Kesehatan Mental"}
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleStartChat(prof.id)}
                            disabled={startingChatId === prof.id}
                            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-6"
                          >
                            {startingChatId === prof.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Memuat...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Mulai Chat
                              </>
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: RIWAYAT & CHAT INTERFACE */}
            <TabsContent value="history" className="h-[calc(100vh-250px)] min-h-[600px]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                {/* Kolom Daftar Riwayat Konsultasi */}
                <div className={`lg:col-span-1 h-full ${selectedRoomId ? "hidden lg:block" : "block"}`}>
                  <Card className="h-full overflow-hidden flex flex-col border-none shadow-lg bg-white/60 backdrop-blur-md">
                    <CardHeader className="bg-white/50 border-b border-pink-100 py-4">
                      <CardTitle className="text-lg text-gray-800">Riwayat Pesan</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-2 space-y-2">
                      {isLoading.rooms ? (
                        <div className="flex flex-col justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500 mx-auto mb-2"></div>
                          <p className="text-xs text-muted-foreground">Memuat...</p>
                        </div>
                      ) : consultationRooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4 text-muted-foreground">
                          <MessageSquare className="w-12 h-12 text-gray-300 mb-2" />
                          <p>Belum ada riwayat konsultasi.</p>
                        </div>
                      ) : (
                        consultationRooms.map((room) => {
                          const other = getOtherParticipant(room);
                          const isActive = selectedRoomId === room.id;
                          return (
                            <div
                              key={room.id}
                              onClick={() => setSelectedRoomId(room.id)}
                              className={`p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                isActive 
                                  ? "bg-white shadow-md border-l-4 border-pink-500" 
                                  : "hover:bg-white/50 hover:shadow-sm border-l-4 border-transparent"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {other?.avatar_url ? (
                                  <img
                                    src={other.avatar_url}
                                    alt={other.full_name || ""}
                                    className="h-12 w-12 rounded-full object-cover border border-gray-100"
                                  />
                                ) : (
                                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-pink-400">
                                    <User className="h-6 w-6" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                    <p className={`font-semibold truncate ${isActive ? "text-pink-700" : "text-gray-800"}`}>
                                      {other?.full_name}
                                    </p>
                                    {room.updated_at && (
                                      <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                        {formatTime(room.updated_at)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500 truncate mt-0.5">
                                    {room.last_message || "Mulai percakapan..."}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Kolom Area Chat */}
                <div className={`lg:col-span-2 h-full ${selectedRoomId ? "block" : "hidden lg:block"}`}>
                  <Card className="h-full overflow-hidden flex flex-col border-none shadow-lg bg-white/80 backdrop-blur-md relative">
                    {selectedRoomId ? (
                      <>
                        <CardHeader className="bg-white/80 backdrop-blur-md border-b border-pink-100 py-3 px-4 sticky top-0 z-10">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="lg:hidden -ml-2 text-gray-500"
                              onClick={() => setSelectedRoomId(null)}
                            >
                              <ArrowLeft className="h-5 w-5" />
                            </Button>
                            
                            {(() => {
                              const room = consultationRooms.find(r => r.id === selectedRoomId);
                              const other = room ? getOtherParticipant(room) : null;
                              return (
                                <div className="flex items-center gap-3">
                                  {other?.avatar_url ? (
                                    <img
                                      src={other.avatar_url}
                                      alt={other.full_name || ""}
                                      className="h-10 w-10 rounded-full object-cover border border-gray-200"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-500">
                                      <User className="h-5 w-5" />
                                    </div>
                                  )}
                                  <div>
                                    <CardTitle className="text-base text-gray-800">
                                      {other?.full_name || "Konsultasi"}
                                    </CardTitle>
                                    <div className="flex items-center text-xs text-green-600">
                                      <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                      Online
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                          {isLoading.messages ? (
                            <div className="flex justify-center items-center h-full">
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                            </div>
                          ) : (
                            messages.map((msg) => {
                              const isMe = msg.sender_id === user?.id;
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[80%] p-3.5 rounded-2xl shadow-sm relative group ${
                                      isMe
                                        ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-tr-none"
                                        : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                    }`}
                                  >
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                    <p className={`text-[10px] text-right mt-1 ${isMe ? "text-pink-100" : "text-gray-400"}`}>
                                      {formatTime(msg.created_at)}
                                      {isMe && (
                                        <CheckCircle className="w-3 h-3 inline ml-1 opacity-70" />
                                      )}
                                    </p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                        
                        <CardFooter className="bg-white border-t border-pink-100 p-3">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendMessage();
                            }}
                            className="flex w-full items-end space-x-2 bg-gray-50 p-1.5 rounded-3xl border border-gray-200 focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100 transition-all"
                          >
                            <Textarea
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Ketik pesan konsultasi..."
                              className="flex-1 min-h-[44px] max-h-32 resize-none border-none bg-transparent focus-visible:ring-0 py-3 px-4 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                            <Button
                              type="submit"
                              size="icon"
                              disabled={isLoading.sending || !newMessage.trim()}
                              className={`rounded-full h-10 w-10 mb-0.5 transition-all duration-300 ${
                                newMessage.trim() 
                                  ? "bg-pink-500 hover:bg-pink-600 text-white shadow-md" 
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              <Send className="h-4 w-4 ml-0.5" />
                            </Button>
                          </form>
                        </CardFooter>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50/30">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 animate-pulse-soft">
                          <MessageSquare className="w-10 h-10 text-pink-300" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Mulai Konsultasi</h3>
                        <p className="text-gray-500 max-w-xs">
                          Pilih riwayat chat di sebelah kiri atau mulai percakapan baru dengan profesional di tab "Daftar Profesional".
                        </p>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Konsultasi;

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
  ArrowLeft
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
          .eq("profession", "Dokter")
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

      // Ambil data room yang tipenya 'consultation'
      const { data: roomsData, error: roomsError } = await supabase
        .from("chat_rooms")
        .select("*")
        .in("id", roomIds)
        .eq("type", "consultation")
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
          room_type: "consultation"
        }
      );

      if (checkError) {
        console.error("Error checking for existing room:", checkError);
        toast.error("Terjadi kesalahan, silakan coba lagi.");
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
          .insert({ created_by: user.id, type: "consultation" })
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
        <title>Forum & Konsultasi - Safe Mother | Mind MHIRC</title>
        <meta
          name="description"
          content="Platform forum dan konsultasi untuk ibu dengan berbagai pilihan dukungan: forum ibu, konsultasi profesional/perawat, layanan kesehatan, dan grup support khusus."
        />
      </HelmetAny>

      <SafeMotherNavbar />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Konsultasi Profesional
          </h1>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="professionals">
                <List className="w-4 h-4 mr-2" />
                Daftar Profesional
              </TabsTrigger>
              <TabsTrigger value="history">
                <MessageSquare className="w-4 h-4 mr-2" />
                Riwayat Konsultasi
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: DAFTAR PROFESIONAL */}
            <TabsContent value="professionals">
              {/* ... Isi Tab 1 ... */}
              <Card>
                <CardHeader>
                  <CardTitle>Pilih Profesional</CardTitle>
                  <CardDescription>
                    Mulai sesi konsultasi baru dengan profesional pilihan Anda.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading.professionals ? (
                    <div className="flex flex-col justify-center items-center h-screen">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Memuat Data...</p>
                    </div>
                  ) : (
                    professionals.map((prof) => (
                      <div
                        key={prof.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {prof.avatar_url ? (
                            <img
                              src={prof.avatar_url}
                              alt={prof.full_name || ""}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-6 w-6" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold">{prof.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {prof.profession || "Profesional"}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartChat(prof.id)}
                          disabled={startingChatId === prof.id} // Tombol dinonaktifkan saat loading
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
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: RIWAYAT & CHAT INTERFACE */}
            <TabsContent value="history">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Kolom Daftar Riwayat Konsultasi */}
                <div className={`lg:col-span-1 ${selectedRoomId ? "hidden lg:block" : "block"}`}>
                  <Card className="h-[70svh] lg:h-[80vh] overflow-hidden flex flex-col">
                    <CardHeader>
                      <CardTitle>Riwayat</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto">
                      {isLoading.rooms ? (
                        <div className="flex flex-col justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">
                            Memuat Data...
                          </p>
                        </div>
                      ) : consultationRooms.length === 0 ? (
                        <p className="text-muted-foreground text-center">
                          Belum ada riwayat konsultasi.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {consultationRooms.map((room) => {
                            const other = getOtherParticipant(room);
                            return (
                              <div
                                key={room.id}
                                onClick={() => setSelectedRoomId(room.id)}
                                className={`p-3 rounded-lg cursor-pointer hover:bg-muted ${
                                  selectedRoomId === room.id ? "bg-muted" : ""
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  {other?.avatar_url ? (
                                    <img
                                      src={other.avatar_url}
                                      alt={other.full_name || ""}
                                      className="h-10 w-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                                      <User className="h-6 w-6" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {other?.full_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {room.last_message || "..."}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Kolom Area Chat */}
                <div className={`lg:col-span-2 ${selectedRoomId ? "block" : "hidden lg:block"}`}>
                  <Card className="h-[70svh] lg:h-[80vh] overflow-hidden flex flex-col">
                    {selectedRoomId ? (
                      <>
                        <CardHeader className="border-b">
                          <div className="flex items-center gap-2">
                            {/* Tombol kembali hanya tampil di mobile */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="lg:hidden"
                              onClick={() => setSelectedRoomId(null)}
                              aria-label="Kembali ke daftar riwayat"
                            >
                              <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <CardTitle>
                              {getOtherParticipant(
                                consultationRooms.find(
                                  (r) => r.id === selectedRoomId
                                )!
                              )?.full_name || "Konsultasi"}
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                          {isLoading.messages ? (
                            <p>Memuat pesan...</p>
                          ) : (
                            messages.map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex ${
                                  msg.sender_id === user?.id
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] p-3 rounded-lg ${
                                    msg.sender_id === user?.id
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted"
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                  <p className="text-xs text-right mt-1 opacity-70">
                                    {formatTime(msg.created_at)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </CardContent>
                        <CardFooter className="border-t p-3">
                          <form
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleSendMessage();
                            }}
                            className="flex w-full items-center space-x-2"
                          >
                            <Textarea
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Ketik pesan..."
                              className="flex-1 resize-none"
                            />
                            <Button
                              type="submit"
                              size="icon"
                              disabled={isLoading.sending}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </form>
                        </CardFooter>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-muted-foreground">
                          Pilih riwayat konsultasi untuk melihat pesan.
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

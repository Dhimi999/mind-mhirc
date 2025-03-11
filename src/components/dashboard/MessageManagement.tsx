import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, User, Send, Plus, Megaphone, Clock, CheckCircle, Info, AlertTriangle, AlertCircle, Trash, Search, X, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

// Define types
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
  account_type: string | null;
}

interface ChatRoom {
  id: string;
  created_at: string;
  updated_at: string;
  last_message: string | null;
  last_message_at: string | null;
  participants: Profile[];
  created_by: string;
}

interface ChatMessage {
  id: string;
  chat_room_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by: string[];
  sender?: Profile;
}

interface Broadcast {
  id: string;
  title: string;
  content: string;
  created_at: string;
  created_by: string;
  priority: string;
  recipients: string[];
  recepient_id: string[] | null;
  recepient_read: string[] | null;
  is_read?: boolean;
}

const MessageManagement: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(true);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isFetchingBroadcasts, setIsFetchingBroadcasts] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Filter available users based on search term
  useEffect(() => {
    if (userSearch.trim() === '') {
      setFilteredUsers(availableUsers);
    } else {
      const lowercaseSearch = userSearch.toLowerCase();
      setFilteredUsers(
        availableUsers.filter(user => 
          user.full_name?.toLowerCase().includes(lowercaseSearch) || 
          user.account_type?.toLowerCase().includes(lowercaseSearch)
        )
      );
    }
  }, [userSearch, availableUsers]);

  // Fetch chat rooms
  useEffect(() => {
    if (!user) return;
    
    const fetchChatRooms = async () => {
      setIsFetchingRooms(true);
      try {
        const { data: participantsData, error: participantsError } = await supabase
          .from("chat_participants")
          .select("chat_room_id")
          .eq("user_id", user.id);
          
        if (participantsError) throw participantsError;
        if (!participantsData || participantsData.length === 0) {
          setChatRooms([]);
          setIsFetchingRooms(false);
          return;
        }
        
        const roomIds = participantsData.map(p => p.chat_room_id);
        const { data: roomsData, error: roomsError } = await supabase
          .from("chat_rooms")
          .select("*")
          .in("id", roomIds)
          .order("updated_at", { ascending: false });
          
        if (roomsError) throw roomsError;
        
        const roomsWithParticipants = await Promise.all(roomsData.map(async room => {
          const { data: roomParticipants, error: roomParticipantsError } = await supabase
            .from("chat_participants")
            .select("user_id")
            .eq("chat_room_id", room.id);
            
          if (roomParticipantsError) throw roomParticipantsError;
          const userIds = roomParticipants.map(p => p.user_id);
          const { data: profilesData, error: profilesError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, is_admin, account_type")
            .in("id", userIds);
            
          if (profilesError) throw profilesError;
          return {
            ...room,
            participants: profilesData || []
          };
        }));
        
        setChatRooms(roomsWithParticipants);
        if (roomsWithParticipants.length > 0 && !selectedRoomId) {
          setSelectedRoomId(roomsWithParticipants[0].id);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
        toast("Gagal memuat ruang obrolan. Silakan coba lagi.");
      } finally {
        setIsFetchingRooms(false);
      }
    };
    
    fetchChatRooms();
    
    // Real-time subscription for chat room updates
    const roomsSubscription = supabase
      .channel("chat_rooms_changes")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "chat_rooms" },
        () => fetchChatRooms()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(roomsSubscription);
    };
  }, [user, selectedRoomId]);

  // Fetch available users for creating new chat rooms
  useEffect(() => {
    if (!user) return;
    
    const fetchAvailableUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, is_admin, account_type")
          .order("full_name");
          
        if (error) throw error;
        const filteredData = data?.filter(profile => profile.id !== user.id) || [];
        setAvailableUsers(filteredData);
        setFilteredUsers(filteredData);
      } catch (error) {
        console.error("Error fetching available users:", error);
        toast("Gagal memuat daftar pengguna. Silakan coba lagi.");
      }
    };
    
    fetchAvailableUsers();
  }, [user]);

  // Fungsi untuk refresh pesan secara manual
  const refreshMessages = async () => {
    if (!selectedRoomId || !user) return;
    
    setIsFetchingMessages(true);
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("chat_room_id", selectedRoomId)
        .order("created_at");
        
      if (error) throw error;
      
      const messagesWithSenders = await Promise.all(
        data.map(async message => {
          const { data: senderData, error: senderError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, is_admin, account_type")
            .eq("id", message.sender_id)
            .single();
            
          if (senderError) throw senderError;
          
          let convertedReadBy: string[] = [];
          if (message.read_by) {
            if (Array.isArray(message.read_by)) {
              convertedReadBy = message.read_by;
            } else if (typeof message.read_by === 'string') {
              try {
                convertedReadBy = JSON.parse(message.read_by);
              } catch (e) {
                convertedReadBy = [];
              }
            }
          }
          
          return {
            ...message,
            read_by: convertedReadBy,
            sender: senderData
          } as ChatMessage;
        })
      );
      
      setMessages(messagesWithSenders);
      
      // Tandai pesan yang belum terbaca sebagai sudah dibaca
      const unreadMessages = messagesWithSenders.filter(
        msg => msg.sender_id !== user.id && !msg.read_by.includes(user.id)
      );
      
      for (const msg of unreadMessages) {
        const updatedReadBy = [...msg.read_by, user.id];
        await supabase
          .from("chat_messages")
          .update({ read_by: updatedReadBy })
          .eq("id", msg.id);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast("Gagal memuat pesan. Silakan coba lagi.");
    } finally {
      setIsFetchingMessages(false);
    }
  };

  // Fetch messages dan atur langganan real-time untuk pesan
  useEffect(() => {
    refreshMessages();
    
    const messagesSubscription = supabase
      .channel("chat_messages_changes")
      .on("postgres_changes", 
        { 
          event: "INSERT", 
          schema: "public", 
          table: "chat_messages",
          filter: `chat_room_id=eq.${selectedRoomId}`
        },
        async payload => {
          const newMessage = payload.new as any;
          const { data: senderData, error: senderError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, is_admin, account_type")
            .eq("id", newMessage.sender_id)
            .single();
            
          if (!senderError && senderData) {
            let convertedReadBy: string[] = [];
            if (newMessage.read_by) {
              if (Array.isArray(newMessage.read_by)) {
                convertedReadBy = newMessage.read_by;
              } else if (typeof newMessage.read_by === 'string') {
                try {
                  convertedReadBy = JSON.parse(newMessage.read_by);
                } catch (e) {
                  convertedReadBy = [];
                }
              }
            }
            
            const typedMessage: ChatMessage = {
              ...newMessage,
              read_by: convertedReadBy,
              sender: senderData
            };
            
            setMessages(prevMessages => [...prevMessages, typedMessage]);
            
            if (newMessage.sender_id !== user.id) {
              const updatedReadBy = [...convertedReadBy, user.id];
              await supabase
                .from("chat_messages")
                .update({ read_by: updatedReadBy })
                .eq("id", newMessage.id);
            }
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [selectedRoomId, user]);

  // Fetch broadcast messages untuk pengguna saat ini
  useEffect(() => {
    if (!user) return;
    
    const fetchBroadcasts = async () => {
      setIsFetchingBroadcasts(true);
      try {
        const { data: broadcastsData, error: broadcastError } = await supabase
          .from("broadcasts")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (broadcastError) throw broadcastError;
        
        let filteredBroadcasts: Broadcast[] = [];
        if (broadcastsData && broadcastsData.length > 0) {
          filteredBroadcasts = broadcastsData.filter(broadcast => {
            const userAccountType = user.account_type || 'general';
            const broadcastRecipients = Array.isArray(broadcast.recipients) 
              ? broadcast.recipients 
              : typeof broadcast.recipients === 'string' 
                ? [broadcast.recipients] 
                : [];
            return broadcastRecipients.includes('all') || 
                   broadcastRecipients.includes(userAccountType) || 
                   (user.is_admin && broadcastRecipients.includes('professional'));
          }).map(broadcast => {
            let recipientRead: string[] = [];
            if (broadcast.recepient_read) {
              if (typeof broadcast.recepient_read === 'string') {
                try {
                  recipientRead = JSON.parse(broadcast.recepient_read);
                } catch (e) {
                  recipientRead = [];
                }
              } else if (Array.isArray(broadcast.recepient_read)) {
                recipientRead = broadcast.recepient_read as string[];
              }
            }
            let recipients: string[] = [];
            if (broadcast.recipients) {
              if (typeof broadcast.recipients === 'string') {
                try {
                  recipients = JSON.parse(broadcast.recipients as string);
                } catch (e) {
                  recipients = [broadcast.recipients as string];
                }
              } else if (Array.isArray(broadcast.recipients)) {
                recipients = broadcast.recipients as string[];
              }
            }
            return {
              ...broadcast,
              recepient_read: recipientRead,
              recipients: recipients,
              is_read: recipientRead.includes(user.id)
            } as Broadcast;
          });
        }
        
        setBroadcasts(filteredBroadcasts);
      } catch (error) {
        console.error("Error fetching broadcasts:", error);
        toast("Gagal memuat pesan siaran. Silakan coba lagi.");
      } finally {
        setIsFetchingBroadcasts(false);
      }
    };
    
    fetchBroadcasts();
    
    const broadcastsSubscription = supabase
      .channel("broadcasts_changes")
      .on("postgres_changes", 
        { event: "INSERT", schema: "public", table: "broadcasts" },
        () => fetchBroadcasts()
      )
      .subscribe();
      
    const recipientsSubscription = supabase
      .channel("broadcast_recipients_changes")
      .on("postgres_changes", 
        { event: "*", schema: "public", table: "broadcast_recipients", filter: `user_id=eq.${user.id}` },
        () => fetchBroadcasts()
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(broadcastsSubscription);
      supabase.removeChannel(recipientsSubscription);
    };
  }, [user]);

  // Buat ruang obrolan baru
  const handleCreateChatRoom = async () => {
    if (!user || !selectedUserId) return;
    
    setIsCreatingRoom(true);
    try {
      const { data: roomData, error: roomError } = await supabase
        .from("chat_rooms")
        .insert({ created_by: user.id })
        .select()
        .single();
        
      if (roomError) throw roomError;
      
      const { error: participantsError } = await supabase
        .from("chat_participants")
        .insert([
          { chat_room_id: roomData.id, user_id: user.id }, 
          { chat_room_id: roomData.id, user_id: selectedUserId }
        ]);
        
      if (participantsError) throw participantsError;
      
      const { data: selectedUser, error: userError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_admin, account_type")
        .eq("id", selectedUserId)
        .single();
        
      if (userError) throw userError;
      
      const { data: currentUser, error: currentUserError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_admin, account_type")
        .eq("id", user.id)
        .single();
        
      if (currentUserError) throw currentUserError;
      
      const newRoom = { ...roomData, participants: [selectedUser, currentUser] };
      setChatRooms(prevRooms => [newRoom, ...prevRooms]);
      setSelectedRoomId(newRoom.id);
      setSelectedUserId(null);
      setUserSearch("");
      toast("Ruang obrolan berhasil dibuat.");
    } catch (error) {
      console.error("Error creating chat room:", error);
      toast("Gagal membuat ruang obrolan. Silakan coba lagi.");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Hapus ruang obrolan
  const handleDeleteChatRoom = async () => {
    if (!user || !selectedRoomId) return;
    
    setIsDeletingRoom(true);
    try {
      const selectedRoom = chatRooms.find(room => room.id === selectedRoomId);
      if (selectedRoom?.created_by !== user.id) {
        toast("Anda tidak memiliki izin untuk menghapus ruang obrolan ini.");
        return;
      }
      
      const { error: messagesError } = await supabase
        .from("chat_messages")
        .delete()
        .eq("chat_room_id", selectedRoomId);
      if (messagesError) throw messagesError;
      
      const { error: participantsError } = await supabase
        .from("chat_participants")
        .delete()
        .eq("chat_room_id", selectedRoomId);
      if (participantsError) throw participantsError;
      
      const { error: roomError } = await supabase
        .from("chat_rooms")
        .delete()
        .eq("id", selectedRoomId);
      if (roomError) throw roomError;
      
      setChatRooms(prevRooms => prevRooms.filter(room => room.id !== selectedRoomId));
      setSelectedRoomId(null);
      setMessages([]);
      toast("Ruang obrolan berhasil dihapus.");
    } catch (error) {
      console.error("Error deleting chat room:", error);
      toast("Gagal menghapus ruang obrolan. Silakan coba lagi.");
    } finally {
      setIsDeletingRoom(false);
      setShowConfirmDelete(false);
    }
  };

  // Kirim pesan baru pada ruang obrolan yang dipilih
  const handleSendMessage = async () => {
    if (!user || !selectedRoomId || !newMessage.trim()) return;
    
    setIsSendingMessage(true);
    try {
      const trimmedMessage = newMessage.trim();
      const tempMessage: ChatMessage = {
        id: 'temp-' + Date.now(),
        chat_room_id: selectedRoomId,
        sender_id: user.id,
        content: trimmedMessage,
        created_at: new Date().toISOString(),
        read_by: [user.id],
        sender: {
          id: user.id,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          is_admin: user.is_admin,
          account_type: user.account_type
        }
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          chat_room_id: selectedRoomId,
          sender_id: user.id,
          content: trimmedMessage,
          read_by: [user.id]
        });
      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast("Gagal mengirim pesan. Silakan coba lagi.");
      setMessages(prev => prev.filter(msg => !msg.id.startsWith('temp-')));
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Get the other participant in a chat room
  const getOtherParticipant = (room: ChatRoom) => {
    if (!user) return null;
    return room.participants.find(p => p.id !== user.id);
  };

  // Check if the user is the creator of the room
  const isRoomCreator = (room: ChatRoom) => {
    return user?.id === room.created_by;
  };

  // Helper untuk format tanggal dan waktu
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy, HH:mm", { locale: idLocale });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: idLocale });
  };

  // Get priority label dan color untuk pesan siaran
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          label: 'Mendesak',
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: <AlertCircle className="h-4 w-4 mr-1" />
        };
      case 'high':
        return {
          label: 'Penting',
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: <AlertTriangle className="h-4 w-4 mr-1" />
        };
      case 'regular':
        return {
          label: 'Umum',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Info className="h-4 w-4 mr-1" />
        };
      case 'info':
        return {
          label: 'Info',
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: <Info className="h-4 w-4 mr-1" />
        };
      case 'recommendation':
        return {
          label: 'Saran/Rekomendasi',
          color: 'bg-purple-100 text-purple-800 border-purple-300',
          icon: <Info className="h-4 w-4 mr-1" />
        };
      default:
        return {
          label: 'Umum',
          color: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Info className="h-4 w-4 mr-1" />
        };
    }
  };

  // Hitung pesan siaran yang belum terbaca
  const unreadBroadcastsCount = broadcasts.filter(b => !b.is_read).length;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat pesan...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">Manajemen Pesan</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Pesan Obrolan
          </TabsTrigger>
          <TabsTrigger value="broadcasts" className="flex items-center">
            <Megaphone className="w-4 h-4 mr-2" />
            Pesan Siaran
            {unreadBroadcastsCount > 0 && (
              <span className="ml-2 bg-primary text-white text-xs py-0.5 px-1.5 rounded-full">
                {unreadBroadcastsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Chat Messages Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chat Rooms List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap justify-between items-center">
                    <CardTitle>Ruang Obrolan</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex items-center">
                          <Plus className="h-4 w-4 mr-1" />
                          Buat Obrolan
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Buat Ruang Obrolan Baru</DialogTitle>
                          <DialogDescription>
                            Pilih pengguna untuk memulai obrolan baru.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Input 
                              placeholder="Cari pengguna..." 
                              value={userSearch} 
                              onChange={(e) => setUserSearch(e.target.value)}
                              className="flex-1"
                            />
                            {userSearch && (
                              <Button variant="ghost" size="icon" onClick={() => setUserSearch("")}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="max-h-60 overflow-y-auto border rounded-md p-1">
                            {filteredUsers.length === 0 ? (
                              <div className="text-center py-4 text-muted-foreground">
                                {userSearch ? "Tidak ada pengguna yang ditemukan" : "Tidak ada pengguna yang tersedia"}
                              </div>
                            ) : (
                              filteredUsers.map(user => (
                                <div 
                                  key={user.id} 
                                  className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${selectedUserId === user.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                                  onClick={() => setSelectedUserId(user.id)}
                                >
                                  {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.full_name || "User"} className="h-10 w-10 rounded-full object-cover" />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                      <User className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {user.full_name || "Pengguna tanpa nama"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {user.account_type === "professional" ? "Profesional" : user.is_admin ? "Admin" : "Pengguna Umum"}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setSelectedUserId(null); setUserSearch(""); }}>
                            Batal
                          </Button>
                          <Button onClick={handleCreateChatRoom} disabled={!selectedUserId || isCreatingRoom}>
                            {isCreatingRoom ? "Membuat..." : "Buat Obrolan"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                {/* Menggunakan style dari kode lama: h-[500px] */}
                <CardContent className="h-[500px] overflow-y-auto">
                  {isFetchingRooms ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Memuat ruang obrolan...</p>
                    </div>
                  ) : chatRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-2">Belum ada obrolan</p>
                      <p className="text-sm text-muted-foreground">
                        Klik tombol "Buat Obrolan" untuk memulai percakapan baru.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatRooms.map(room => {
                        const otherParticipant = getOtherParticipant(room);
                        const canDelete = isRoomCreator(room);
                        return (
                          <div 
                            key={room.id} 
                            className={`p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors relative ${selectedRoomId === room.id ? "bg-muted border border-primary/20" : "bg-card"}`} 
                            onClick={() => setSelectedRoomId(room.id)}
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 mr-3">
                                {otherParticipant?.avatar_url ? (
                                  <img src={otherParticipant.avatar_url} alt={otherParticipant.full_name || "User"} className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {otherParticipant?.full_name || "Pengguna"}
                                </p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {room.last_message || "Belum ada pesan"}
                                </p>
                              </div>
                              {room.last_message_at && (
                                <div className="text-xs text-muted-foreground ml-2">
                                  {format(new Date(room.last_message_at), "HH:mm")}
                                </div>
                              )}
                              {canDelete && selectedRoomId === room.id && (
                                <AlertDialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="absolute top-2 right-2 h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-transparent"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConfirmDelete(true);
                                      }}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Hapus Ruang Obrolan</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Apakah Anda yakin ingin menghapus ruang obrolan ini? Semua pesan akan terhapus secara permanen dan tidak dapat dipulihkan.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={(e) => e.stopPropagation()}>
                                        Batal
                                      </AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteChatRoom();
                                        }}
                                        className="bg-destructive hover:bg-destructive/90"
                                      >
                                        {isDeletingRoom ? "Menghapus..." : "Hapus"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Chat Messages Area */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                {selectedRoomId ? (
                  <>
                    <CardHeader className="pb-3 border-b flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {(() => {
                              const selectedRoom = chatRooms.find(r => r.id === selectedRoomId);
                              const otherParticipant = selectedRoom ? getOtherParticipant(selectedRoom) : null;
                              return otherParticipant?.avatar_url ? (
                                <img src={otherParticipant.avatar_url} alt={otherParticipant.full_name || "User"} className="h-10 w-10 rounded-full object-cover" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                              );
                            })()}
                          </div>
                          <div>
                            <CardTitle>
                              {chatRooms.find(r => r.id === selectedRoomId)?.participants.find(p => p.id !== user?.id)?.full_name || "Pengguna"}
                            </CardTitle>
                            <CardDescription>
                              {chatRooms.find(r => r.id === selectedRoomId)?.participants.find(p => p.id !== user?.id)?.account_type === "professional" 
                                ? "Profesional" 
                                : chatRooms.find(r => r.id === selectedRoomId)?.participants.find(p => p.id !== user?.id)?.is_admin 
                                  ? "Admin" 
                                  : "Pengguna Umum"}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* Tombol Refresh Manual */}
                          <Button variant="ghost" size="icon" onClick={refreshMessages}>
                            <RefreshCw className="h-5 w-5" />
                          </Button>
                          {isRoomCreator(chatRooms.find(r => r.id === selectedRoomId)!) && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-transparent">
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Ruang Obrolan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus ruang obrolan ini? Semua pesan akan terhapus secara permanen dan tidak dapat dipulihkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={handleDeleteChatRoom}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    {isDeletingRoom ? "Menghapus..." : "Hapus"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {/* Menggunakan style dari kode lama: h-[380px] */}
                    <CardContent className="flex-1 overflow-y-auto h-[380px] p-4">
                      {isFetchingMessages ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                          <p className="text-sm text-muted-foreground">Memuat pesan...</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">Belum ada pesan</p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Mulai percakapan dengan mengirim pesan pertama.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {messages.map(message => {
                            const isCurrentUser = user?.id === message.sender_id;
                            return (
                              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[80%] ${isCurrentUser ? "bg-primary text-white" : "bg-muted"} px-4 py-2 rounded-lg`}>
                                  <div className="text-sm mb-1 flex justify-between items-center">
                                    {!isCurrentUser && (
                                      <span className="font-medium mr-2">
                                        {message.sender?.full_name || "Pengguna"}
                                      </span>
                                    )}
                                    <span className={`text-xs ${isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                      {formatTime(message.created_at)}
                                    </span>
                                  </div>
                                  <p className="break-words whitespace-pre-wrap">{message.content}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t p-3 flex-shrink-0">
                      <form 
                        className="flex w-full items-center space-x-2"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSendMessage();
                        }}
                      >
                        <Textarea 
                          value={newMessage} 
                          onChange={e => setNewMessage(e.target.value)} 
                          placeholder="Ketik pesan..." 
                          className="min-h-[60px] flex-1 resize-none"
                          onKeyDown={e => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim() || isSendingMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    </CardFooter>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mb-6" />
                    <h3 className="text-lg font-medium mb-2">Tidak Ada Obrolan Dipilih</h3>
                    <p className="text-muted-foreground max-w-md">
                      {chatRooms.length > 0 ? "Pilih ruang obrolan dari daftar untuk mulai berkomunikasi." : "Anda belum memiliki obrolan. Buat obrolan baru untuk mulai berkomunikasi."}
                    </p>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="mt-4">
                          <Plus className="h-4 w-4 mr-2" />
                          Buat Obrolan Baru
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Buat Ruang Obrolan Baru</DialogTitle>
                          <DialogDescription>
                            Pilih pengguna untuk memulai obrolan baru.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                          <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <Input 
                              placeholder="Cari pengguna..." 
                              value={userSearch} 
                              onChange={(e) => setUserSearch(e.target.value)}
                              className="flex-1"
                            />
                            {userSearch && (
                              <Button variant="ghost" size="icon" onClick={() => setUserSearch("")}>
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="max-h-60 overflow-y-auto border rounded-md p-1">
                            {filteredUsers.length === 0 ? (
                              <div className="text-center py-4 text-muted-foreground">
                                {userSearch ? "Tidak ada pengguna yang ditemukan" : "Tidak ada pengguna yang tersedia"}
                              </div>
                            ) : (
                              filteredUsers.map(user => (
                                <div 
                                  key={user.id} 
                                  className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${selectedUserId === user.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                                  onClick={() => setSelectedUserId(user.id)}
                                >
                                  {user.avatar_url ? (
                                    <img src={user.avatar_url} alt={user.full_name || "User"} className="h-10 w-10 rounded-full object-cover" />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                      <User className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {user.full_name || "Pengguna tanpa nama"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {user.account_type === "professional" ? "Profesional" : user.is_admin ? "Admin" : "Pengguna Umum"}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => { setSelectedUserId(null); setUserSearch(""); }}>
                            Batal
                          </Button>
                          <Button onClick={handleCreateChatRoom} disabled={!selectedUserId || isCreatingRoom}>
                            {isCreatingRoom ? "Membuat..." : "Buat Obrolan"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Broadcasts Tab */}
        <TabsContent value="broadcasts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pesan Siaran Diterima</CardTitle>
              <CardDescription>
                Pesan penting dan pengumuman dari admin Mind MHIRC.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isFetchingBroadcasts ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Memuat pesan siaran...</p>
                </div>
              ) : broadcasts.length === 0 ? (
                <div className="text-center py-8">
                  <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Belum ada pesan siaran.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {broadcasts.map(broadcast => {
                    const priorityInfo = getPriorityLabel(broadcast.priority);
                    return (
                      <div 
                        key={broadcast.id} 
                        className={`border rounded-lg p-4 ${broadcast.is_read ? "bg-card" : "bg-muted border-primary/20"} ${broadcast.priority === "urgent" ? "border-red-500" : ""}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <h3 className="font-semibold">{broadcast.title}</h3>
                            <Badge variant="outline" className={`ml-2 flex items-center ${priorityInfo.color}`}>
                              {priorityInfo.icon}
                              {priorityInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="prose prose-sm max-w-none mb-4">
                          <p>{broadcast.content}</p>
                        </div>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(broadcast.created_at)}
                          </div>
                          {broadcast.is_read ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              <span>Telah dibaca</span>
                            </div>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleMarkBroadcastRead(broadcast.id)}>
                              Tandai Telah Dibaca
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MessageManagement;

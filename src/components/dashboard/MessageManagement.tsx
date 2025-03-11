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
          color: 'bg-blue-100 text-blue-800 b
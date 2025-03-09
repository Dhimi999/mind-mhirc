
import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  MessageSquare,
  User,
  Send,
  Plus,
  Megaphone,
  Clock,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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
  is_read?: boolean;
  read_at?: string | null;
  broadcast_id?: string;
}

const MessageManagement: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chat");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isFetchingRooms, setIsFetchingRooms] = useState(true);
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  const [isFetchingBroadcasts, setIsFetchingBroadcasts] = useState(true);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch chat rooms for the current user
  useEffect(() => {
    if (!user) return;

    const fetchChatRooms = async () => {
      setIsFetchingRooms(true);
      try {
        // Use a more direct approach to avoid potential RLS issues
        const { data: chatRoomsData, error: roomsError } = await supabase
          .from("chat_rooms")
          .select("*")
          .order("updated_at", { ascending: false });
        
        if (roomsError) throw roomsError;
        
        // Filter rooms where the user is a participant (client-side for now)
        const roomIds = chatRoomsData.map(room => room.id);
        
        if (roomIds.length === 0) {
          setChatRooms([]);
          setIsFetchingRooms(false);
          return;
        }
        
        // Get all participants for these rooms
        const { data: participantsData, error: participantsError } = await supabase
          .from("chat_participants")
          .select("chat_room_id, user_id");
          
        if (participantsError) throw participantsError;
        
        // Get all profiles for users in these rooms
        const userIds = [...new Set(participantsData.map(p => p.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, is_admin, account_type")
          .in("id", userIds);
          
        if (profilesError) throw profilesError;
        
        // Filter down to rooms where current user is a participant
        const userRoomIds = participantsData
          .filter(p => p.user_id === user.id)
          .map(p => p.chat_room_id);
          
        const userRooms = chatRoomsData.filter(room => 
          userRoomIds.includes(room.id)
        );
        
        // Build the full room objects with participants
        const roomsWithParticipants = userRooms.map(room => {
          const roomParticipantIds = participantsData
            .filter(p => p.chat_room_id === room.id)
            .map(p => p.user_id);
            
          const roomParticipants = profilesData.filter(profile => 
            roomParticipantIds.includes(profile.id)
          );
          
          return {
            ...room,
            participants: roomParticipants
          };
        });
        
        setChatRooms(roomsWithParticipants);
        
        // If we have rooms and none selected, select the first one
        if (roomsWithParticipants.length > 0 && !selectedRoomId) {
          setSelectedRoomId(roomsWithParticipants[0].id);
        }
      } catch (error) {
        console.error("Error fetching chat rooms:", error);
        toast({
          title: "Error",
          description: "Failed to load chat rooms. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsFetchingRooms(false);
      }
    };

    fetchChatRooms();
  }, [user, toast, selectedRoomId]);

  // Fetch available users for creating new chat rooms (admin only)
  useEffect(() => {
    if (!user || !user.is_admin) return;

    const fetchAvailableUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, is_admin, account_type")
          .neq("id", user.id)
          .order("full_name");

        if (error) throw error;
        setAvailableUsers(data || []);
      } catch (error) {
        console.error("Error fetching available users:", error);
      }
    };

    fetchAvailableUsers();
  }, [user]);

  // Fetch messages for the selected room
  useEffect(() => {
    if (!selectedRoomId) return;

    const fetchMessages = async () => {
      setIsFetchingMessages(true);
      try {
        const { data, error } = await supabase
          .from("chat_messages")
          .select("*")
          .eq("chat_room_id", selectedRoomId)
          .order("created_at");

        if (error) throw error;

        // Get sender details for each message
        const messagesWithSenders = await Promise.all(
          data.map(async (message) => {
            const { data: senderData, error: senderError } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url, is_admin, account_type")
              .eq("id", message.sender_id)
              .single();

            if (senderError) throw senderError;

            // Convert read_by from Json to string[]
            let convertedReadBy: string[] = [];
            if (message.read_by) {
              if (Array.isArray(message.read_by)) {
                convertedReadBy = message.read_by as string[];
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
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsFetchingMessages(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const subscription = supabase
      .channel("chat_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `chat_room_id=eq.${selectedRoomId}`
        },
        async (payload) => {
          const newMessage = payload.new as any;
          
          // Get the sender details
          const { data: senderData, error: senderError } = await supabase
            .from("profiles")
            .select("id, full_name, avatar_url, is_admin, account_type")
            .eq("id", newMessage.sender_id)
            .single();

          if (!senderError && senderData) {
            // Convert read_by from Json to string[]
            let convertedReadBy: string[] = [];
            if (newMessage.read_by) {
              if (Array.isArray(newMessage.read_by)) {
                convertedReadBy = newMessage.read_by as string[];
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
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [selectedRoomId, toast]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Fetch broadcast messages for the current user
  useEffect(() => {
    if (!user) return;

    const fetchBroadcasts = async () => {
      setIsFetchingBroadcasts(true);
      try {
        const { data, error } = await supabase
          .from("broadcast_recipients")
          .select(`
            id, 
            is_read, 
            read_at, 
            broadcast_id,
            broadcasts:broadcast_id (
              id, 
              title, 
              content, 
              created_at, 
              created_by, 
              priority
            )
          `)
          .eq("user_id", user.id)
          .order("received_at", { ascending: false });

        if (error) throw error;

        // Flatten and shape the data
        const formattedBroadcasts = data.map(item => ({
          id: item.id,
          broadcast_id: item.broadcast_id,
          title: item.broadcasts.title,
          content: item.broadcasts.content,
          created_at: item.broadcasts.created_at,
          created_by: item.broadcasts.created_by,
          priority: item.broadcasts.priority,
          is_read: item.is_read,
          read_at: item.read_at
        }));

        setBroadcasts(formattedBroadcasts);
      } catch (error) {
        console.error("Error fetching broadcasts:", error);
        toast({
          title: "Error",
          description: "Failed to load broadcast messages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsFetchingBroadcasts(false);
      }
    };

    fetchBroadcasts();
  }, [user, toast]);

  // Create a new chat room (admin only)
  const handleCreateChatRoom = async () => {
    if (!user || !user.is_admin || !selectedUserId) return;

    setIsCreatingRoom(true);
    try {
      // Create the chat room
      const { data: roomData, error: roomError } = await supabase
        .from("chat_rooms")
        .insert({ created_by: user.id })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add the admin and selected user as participants
      const { error: participantsError } = await supabase
        .from("chat_participants")
        .insert([
          { chat_room_id: roomData.id, user_id: user.id },
          { chat_room_id: roomData.id, user_id: selectedUserId }
        ]);

      if (participantsError) throw participantsError;

      // Get the participant info
      const { data: selectedUser, error: userError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_admin, account_type")
        .eq("id", selectedUserId)
        .single();

      if (userError) throw userError;

      const { data: adminUser, error: adminError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, is_admin, account_type")
        .eq("id", user.id)
        .single();

      if (adminError) throw adminError;

      // Add the new chat room to state
      const newRoom = {
        ...roomData,
        participants: [selectedUser, adminUser]
      };

      setChatRooms(prevRooms => [newRoom, ...prevRooms]);
      setSelectedRoomId(newRoom.id);
      setSelectedUserId(null);

      toast({
        title: "Success",
        description: `Chat room with ${selectedUser.full_name} created successfully.`
      });
    } catch (error) {
      console.error("Error creating chat room:", error);
      toast({
        title: "Error",
        description: "Failed to create chat room. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  // Send a new message in the selected chat room
  const handleSendMessage = async () => {
    if (!user || !selectedRoomId || !newMessage.trim()) return;

    setIsSendingMessage(true);
    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          chat_room_id: selectedRoomId,
          sender_id: user.id,
          content: newMessage.trim(),
          read_by: []
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Mark a broadcast as read
  const handleMarkBroadcastRead = async (broadcastRecipientId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("broadcast_recipients")
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq("id", broadcastRecipientId)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setBroadcasts(prevBroadcasts =>
        prevBroadcasts.map(broadcast =>
          broadcast.id === broadcastRecipientId
            ? { ...broadcast, is_read: true, read_at: new Date().toISOString() }
            : broadcast
        )
      );

      toast({
        title: "Success",
        description: "Broadcast marked as read."
      });
    } catch (error) {
      console.error("Error marking broadcast as read:", error);
      toast({
        title: "Error",
        description: "Failed to update broadcast status. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get the other participant in a chat room
  const getOtherParticipant = (room: ChatRoom) => {
    if (!user) return null;
    return room.participants.find(p => p.id !== user.id);
  };

  // Helper to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy, HH:mm", { locale: idLocale });
  };

  // Get priority label and color for broadcast messages
  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: 'Penting', color: 'bg-red-100 text-red-800' };
      case 'regular':
        return { label: 'Umum', color: 'bg-blue-100 text-blue-800' };
      case 'info':
        return { label: 'Info', color: 'bg-green-100 text-green-800' };
      default:
        return { label: 'Umum', color: 'bg-blue-100 text-blue-800' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
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
          </TabsTrigger>
        </TabsList>

        {/* Chat Messages Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Chat Rooms List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>Ruang Obrolan</CardTitle>
                    {user?.is_admin && (
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
                          <div className="py-4">
                            <Select
                              value={selectedUserId || ""}
                              onValueChange={setSelectedUserId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pengguna" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.full_name || "Pengguna tanpa nama"} 
                                    {user.account_type === "professional" ? " (Professional)" : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedUserId(null)}
                            >
                              Batal
                            </Button>
                            <Button 
                              onClick={handleCreateChatRoom} 
                              disabled={!selectedUserId || isCreatingRoom}
                            >
                              {isCreatingRoom ? "Membuat..." : "Buat Obrolan"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
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
                      {user?.is_admin ? (
                        <p className="text-sm text-muted-foreground">
                          Klik tombol "Buat Obrolan" untuk memulai percakapan baru.
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Admin akan menghubungi Anda segera.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {chatRooms.map((room) => {
                        const otherParticipant = getOtherParticipant(room);
                        return (
                          <div
                            key={room.id}
                            className={`p-3 rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                              selectedRoomId === room.id ? "bg-muted border border-primary/20" : "bg-card"
                            }`}
                            onClick={() => setSelectedRoomId(room.id)}
                          >
                            <div className="flex items-center">
                              <div className="flex-shrink-0 mr-3">
                                {otherParticipant?.avatar_url ? (
                                  <img
                                    src={otherParticipant.avatar_url}
                                    alt={otherParticipant.full_name || "User"}
                                    className="h-10 w-10 rounded-full"
                                  />
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
                    <CardHeader className="pb-3 border-b">
                      {(() => {
                        const selectedRoom = chatRooms.find(r => r.id === selectedRoomId);
                        const otherParticipant = selectedRoom ? getOtherParticipant(selectedRoom) : null;
                        
                        return (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              {otherParticipant?.avatar_url ? (
                                <img
                                  src={otherParticipant.avatar_url}
                                  alt={otherParticipant.full_name || "User"}
                                  className="h-10 w-10 rounded-full"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <CardTitle>{otherParticipant?.full_name || "Pengguna"}</CardTitle>
                              <CardDescription>
                                {otherParticipant?.account_type === "professional" 
                                  ? "Profesional" 
                                  : "Pengguna Umum"}
                              </CardDescription>
                            </div>
                          </div>
                        );
                      })()}
                    </CardHeader>
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
                          {messages.map((message) => {
                            const isCurrentUser = user?.id === message.sender_id;
                            return (
                              <div
                                key={message.id}
                                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                              >
                                <div className={`max-w-[80%] ${isCurrentUser ? "bg-primary text-white" : "bg-muted"} px-4 py-2 rounded-lg`}>
                                  <div className="text-sm mb-1">
                                    {!isCurrentUser && (
                                      <span className="font-medium mr-2">
                                        {message.sender?.full_name || "Pengguna"}
                                      </span>
                                    )}
                                    <span className={`text-xs ${isCurrentUser ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                      {format(new Date(message.created_at), "HH:mm")}
                                    </span>
                                  </div>
                                  <p className="break-words">{message.content}</p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="border-t p-3">
                      <div className="flex w-full items-center space-x-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Ketik pesan..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <Button
                          type="submit"
                          size="icon"
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isSendingMessage}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageSquare className="h-16 w-16 text-muted-foreground mb-6" />
                    <h3 className="text-lg font-medium mb-2">Tidak Ada Obrolan Dipilih</h3>
                    <p className="text-muted-foreground max-w-md">
                      {chatRooms.length > 0
                        ? "Pilih ruang obrolan dari daftar untuk mulai berkomunikasi."
                        : user?.is_admin
                        ? "Anda belum memiliki obrolan. Buat obrolan baru untuk mulai berkomunikasi."
                        : "Anda belum memiliki obrolan. Admin akan menghubungi Anda segera."}
                    </p>
                    {user?.is_admin && chatRooms.length === 0 && (
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
                          <div className="py-4">
                            <Select
                              value={selectedUserId || ""}
                              onValueChange={setSelectedUserId}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih pengguna" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.full_name || "Pengguna tanpa nama"} 
                                    {user.account_type === "professional" ? " (Professional)" : ""}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedUserId(null)}
                            >
                              Batal
                            </Button>
                            <Button 
                              onClick={handleCreateChatRoom} 
                              disabled={!selectedUserId || isCreatingRoom}
                            >
                              {isCreatingRoom ? "Membuat..." : "Buat Obrolan"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
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
                  {broadcasts.map((broadcast) => {
                    const priorityInfo = getPriorityLabel(broadcast.priority);
                    return (
                      <div 
                        key={broadcast.id}
                        className={`border rounded-lg p-4 ${
                          broadcast.is_read 
                            ? "bg-card" 
                            : "bg-muted border-primary/20"
                        } ${
                          broadcast.priority === "urgent" 
                            ? "border-red-500" 
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <h3 className="font-semibold">{broadcast.title}</h3>
                            <span className={`text-xs px-2 py-0.5 rounded ml-2 ${priorityInfo.color}`}>
                              {priorityInfo.label}
                            </span>
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleMarkBroadcastRead(broadcast.id)}
                            >
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

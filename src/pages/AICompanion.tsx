import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  MessageCircle,
  Sparkles,
  Plus,
  MoreVertical,
  Trash2,
  Edit3,
  Menu,
  X,
  Smile,
  Meh,
  Frown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Database } from "@/integrations/supabase/types"; // <-- Impor tipe dari file yang digenerate
import { InitialDialog } from "@/components/ai/InitialDialog";
import ReactMarkdown from "react-markdown";

// ... (interface Message dan Conversation tidak berubah)

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  created_at: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  summary?: string | null;
  full_summary?: string | null;
}
type UrgentCase = Database["public"]["Tables"]["urgent_cases"]["Row"] & {
  source_conversation: {
    title: string | null;
  } | null;
};

const SUGGESTIONS = [
  "Saya merasa cemas hari ini",
  "Bantu saya rileks",
  "Saya butuh teman cerita",
  "Tips tidur nyenyak"
];

const AICompanion = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isMobile = useIsMobile();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [urgentCases, setUrgentCases] = useState<UrgentCase[]>([]);
  const [showInitialDialog, setShowInitialDialog] = useState(false);
  const [userNickname, setUserNickname] = useState<string | null>(null);
  const [userSubtypes, setUserSubtypes] = useState<string[] | null>(null);
  const [userParentId, setUserParentId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      checkUserProfile();
      fetchConversations();
    }
  }, [user]);

  const checkUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("consent_ai, nick_name, subtypes, parent_id")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;

      // Cast to any because types might not be updated yet in the project
      const profile = data as any;
      
      setUserSubtypes(profile.subtypes);
      setUserParentId(profile.parent_id);

      if (!profile.consent_ai) {
        setShowInitialDialog(true);
      } else if (!profile.nick_name) {
        // If consent is true but no nickname (edge case), show dialog starting at setup
        // But our dialog handles flow. Let's just show dialog.
        // Ideally we pass a prop to start at setup, but for now let's just show it.
        // The dialog starts at consent. If they already consented, maybe we should auto-skip?
        // For simplicity, let's just show the dialog.
        setShowInitialDialog(true);
      } else {
        setUserNickname(profile.nick_name);
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
    }
  };

  useEffect(() => {
    if (!isLoadingConversations && user && conversations.length === 0) {
      createNewConversation();
    }
  }, [isLoadingConversations, user, conversations.length]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id);
    }
  }, [currentConversation]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  useEffect(() => {
    console.log("===== FRONTEND STATE UPDATE =====");
    console.log("User ID:", user ? user.id : "Not logged in");
    console.log("Urgent Cases in State:", urgentCases);
    console.log("Total Conversations in State:", conversations.length);
    console.log("===============================");
  }, [user, urgentCases, conversations]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("ai_conversations_update")
      .on<Conversation>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ai_conversations",
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log(
            "Realtime update received for a conversation:",
            payload.new
          );
          setConversations((prevConvos) =>
            prevConvos.map((convo) =>
              convo.id === payload.new.id ? { ...convo, ...payload.new } : convo
            )
          );
          if (currentConversation?.id === payload.new.id) {
            setCurrentConversation((prev) =>
              prev ? { ...prev, ...payload.new } : null
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, currentConversation?.id]);

  const fetchConversations = async () => {
    if (!user) return;
    try {
      setIsLoadingConversations(true);
      const [convResponse, casesResponse] = await Promise.all([
        supabase
          .from("ai_conversations")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false }),
        supabase
          .from("urgent_cases")
          .select("*, source_conversation:source_conversation_id(title)")
          .eq("parent_user_id", user.id)
          .eq("is_resolved", false)
      ]);

      console.log("===== DATA RAW DARI SUPABASE =====");
      console.log("Raw Conversations Response:", convResponse.data);
      console.log("Raw Urgent Cases Response:", casesResponse.data);
      console.log("=================================");

      if (convResponse.error) throw convResponse.error;
      if (casesResponse.error) throw casesResponse.error;

      setConversations(convResponse.data || []);
      setUrgentCases((casesResponse.data as any[]) || []);

      if (
        convResponse.data &&
        convResponse.data.length > 0 &&
        !currentConversation
      ) {
        // Check if the latest conversation is from today
        const latestConvo = convResponse.data[0];
        const today = new Date().toDateString();
        const convoDate = new Date(latestConvo.created_at).toDateString();
        
        if (today === convoDate) {
          setCurrentConversation(latestConvo);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Gagal Memuat Riwayat",
        description: "Terjadi kesalahan saat memuat riwayat obrolan",
        variant: "destructive"
      });
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;
    try {
      setIsLoadingMessages(true);
      const { data, error } = await supabase
        .from("ai_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(
        (data || []).map((msg) => ({
          ...msg,
          sender: msg.sender as "user" | "ai"
        }))
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Gagal Memuat Pesan",
        description: "Terjadi kesalahan saat memuat pesan",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const createNewConversation = async () => {
    if (!user) return;
    try {
      const { data: newConversation, error: conversationError } = await supabase
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: `Obrolan ${new Date().toLocaleDateString("id-ID")}`
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      const initialAiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        content:
          "Hai! Namaku Eva. Aku akan menjadi temanmu untuk mendengarkan dan membantumu. Bagaimana kabar kamu hari ini?",
        sender: "ai",
        created_at: new Date().toISOString(),
        conversation_id: newConversation.id
      };

      supabase
        .from("ai_messages")
        .insert({
          conversation_id: newConversation.id,
          user_id: user.id,
          content: initialAiMessage.content,
          sender: "ai"
        })
        .then(({ error }) => {
          if (error) console.error("Gagal menyimpan pesan AI pertama:", error);
        });

      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversation(newConversation);
      setMessages([initialAiMessage]);

      toast({
        title: "Obrolan Baru Dibuat",
        description: "Obrolan baru berhasil dibuat"
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Gagal Membuat Obrolan",
        description: "Terjadi kesalahan saat membuat obrolan baru",
        variant: "destructive"
      });
    }
  };

  const deleteConversation = async (conversationId: string) => {
    const originalConversations = [...conversations];
    const conversationToDelete = conversations.find(
      (c) => c.id === conversationId
    );

    setConversations(
      originalConversations.filter((c) => c.id !== conversationId)
    );
    if (currentConversation?.id === conversationId) {
      const remaining = originalConversations.filter(
        (c) => c.id !== conversationId
      );
      setCurrentConversation(remaining.length > 0 ? remaining[0] : null);
      setMessages([]);
    }

    try {
      const { error } = await supabase
        .from("ai_conversations")
        .delete()
        .eq("id", conversationId);
      if (error) throw error;
      toast({ title: "Obrolan Dihapus" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Gagal Menghapus",
        description: "Mengembalikan perubahan.",
        variant: "destructive"
      });
      setConversations(originalConversations);
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(conversationToDelete || null);
      }
    }
  };

  const updateConversationTitle = async (
    conversationId: string,
    title: string
  ) => {
    const originalConversations = [...conversations];
    const originalTitle = conversations.find(
      (c) => c.id === conversationId
    )?.title;

    const updatedConversations = conversations.map((c) =>
      c.id === conversationId
        ? { ...c, title, updated_at: new Date().toISOString() }
        : c
    );
    setConversations(updatedConversations);
    if (currentConversation?.id === conversationId) {
      setCurrentConversation((prev) => (prev ? { ...prev, title } : null));
    }

    try {
      const { error } = await supabase
        .from("ai_conversations")
        .update({ title })
        .eq("id", conversationId);
      if (error) throw error;
      toast({ title: "Judul Diperbarui" });
    } catch (error) {
      console.error("Error updating title:", error);
      toast({
        title: "Gagal Memperbarui",
        description: "Mengembalikan perubahan.",
        variant: "destructive"
      });
      setConversations(originalConversations);
      if (currentConversation?.id === conversationId) {
        setCurrentConversation((prev) =>
          prev ? { ...prev, title: originalTitle || prev.title } : null
        );
      }
    }
  };

  const handleStartConsultation = async (caseItem: UrgentCase) => {
    if (!user) return;
    try {
      toast({ title: "Mempersiapkan Ruang Konsultasi..." });
      const { data: newConsultation, error } = await supabase.functions.invoke(
        "start-consultation",
        {
          body: { case_id: caseItem.id, parent_user_id: user.id }
        }
      );

      if (error) throw error;

      setConversations((prev) => [newConsultation, ...prev]);
      setCurrentConversation(newConsultation);
      setUrgentCases((prev) => prev.filter((c) => c.id !== caseItem.id));
    } catch (error) {
      toast({ title: "Gagal memulai konsultasi", variant: "destructive" });
      console.error("Error starting consultation:", error);
    }
  };

  const handleConversationSwitch = (nextConversation: Conversation) => {
    if (currentConversation?.id === nextConversation.id) return;

    setCurrentConversation(nextConversation);
  };

  const sendMessage = async (text?: string) => {
    const messageToSend = text || inputMessage;
    if (!messageToSend.trim() || !currentConversation || !user) return;

    const userMessageContent = messageToSend;
    const conversationId = currentConversation.id;

    const tempUserMessage: Message = {
      id: `temp-user-${Date.now()}`,
      content: userMessageContent,
      sender: "user",
      created_at: new Date().toISOString(),
      conversation_id: conversationId
    };

    let historyForAI = [];
    const recentMessages = messages.slice(-10);

    if (currentConversation?.full_summary && messages.length <= 1) {
      historyForAI = [
        {
          role: "user",
          parts: [
            {
              text: `Ini adalah ringkasan percakapan kita sebelumnya: "${currentConversation.full_summary}". Mari kita lanjutkan.`
            }
          ]
        },
        {
          role: "model",
          parts: [
            {
              text: "Tentu, saya mengingatnya. Apa yang bisa saya bantu selanjutnya?"
            }
          ]
        }
      ];
    } else {
      const firstUserIndex = recentMessages.findIndex(
        (msg) => msg.sender === "user"
      );
      historyForAI =
        firstUserIndex !== -1
          ? recentMessages.slice(firstUserIndex).map((msg) => ({
              role: msg.sender === "user" ? "user" : "model",
              parts: [{ text: msg.content }]
            }))
          : [];
    }

    setInputMessage("");
    setMessages((prev) => [...prev, tempUserMessage]);
    setIsTyping(true);

    try {
      const tempAiMessage: Message = {
        id: `temp-ai-${Date.now()}`,
        content: "",
        sender: "ai",
        created_at: new Date().toISOString(),
        conversation_id: conversationId
      };
      setMessages((prev) => [...prev, tempAiMessage]);

      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-ai`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({
            history: historyForAI,
            message: userMessageContent,
            conversation_id: conversationId,
            user_id: user.id
          })
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = "";

      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponseContent += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempAiMessage.id
              ? { ...msg, content: aiResponseContent }
              : msg
          )
        );
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAiMessage.id
            ? { ...msg, content: aiResponseContent }
            : msg
        )
      );

    } catch (error) {
      console.error("Error invoking function or sending message:", error);
      toast({
        title: "Gagal Mendapat Respons AI",
        description: "Pesan Anda tidak terkirim.",
        variant: "destructive"
      });
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id && !m.id.startsWith("temp-ai-")));
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleTitleEdit = (conversationId: string, currentTitle: string, currentSummary?: string | null) => {
    setEditingTitle(conversationId);
    setNewTitle(currentSummary || currentTitle);
  };

  const saveTitleEdit = () => {
    if (editingTitle && newTitle.trim()) {
      updateConversationTitle(editingTitle, newTitle.trim());
    }
    setEditingTitle(null);
    setNewTitle("");
  };

  const cancelTitleEdit = () => {
    setEditingTitle(null);
    setNewTitle("");
  };

  return (
    <div className="h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)] flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 md:flex hidden border-r flex-col">
        {/* Hide on mobile */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Riwayat Obrolan</h2>
            <Button onClick={createNewConversation} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Baru
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          {isLoadingConversations ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Belum ada obrolan</p>
              <Button
                onClick={createNewConversation}
                size="sm"
                className="mt-2"
              >
                Mulai Obrolan
              </Button>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {urgentCases.map((caseItem) => (
                <Card
                  key={caseItem.id}
                  className="cursor-pointer bg-destructive/10 border-destructive hover:bg-destructive/20 m-2"
                  onClick={() => handleStartConsultation(caseItem)}
                >
                  <CardContent className="p-3">
                    <h3 className="font-bold text-sm text-destructive">
                      🚨 PERLU PERHATIAN
                    </h3>
                    <p className="text-xs text-destructive/80">
                      Membahas percakapan anak: "
                      {/* [PERBAIKAN DI SINI] 
          Gunakan optional chaining (?.) untuk mengakses title dengan aman.
          Gunakan (||) untuk memberikan teks alternatif jika title tidak ada.
        */}
                      {caseItem.source_conversation?.title ||
                        "Percakapan Telah Dihapus"}
                      "
                    </p>
                  </CardContent>
                </Card>
              ))}
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  className={`cursor-pointer transition-all border-l-4 ${
                    currentConversation?.id === conversation.id
                      ? "bg-primary/5 border-l-primary border-y-transparent border-r-transparent shadow-sm"
                      : "hover:bg-muted/50 border-l-transparent border-transparent shadow-none"
                  }`}
                  onClick={() => handleConversationSwitch(conversation)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      {editingTitle === conversation.id ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") saveTitleEdit();
                              if (e.key === "Escape") cancelTitleEdit();
                            }}
                            className="h-8 text-sm"
                            autoFocus
                            onBlur={saveTitleEdit}
                          />
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {conversation.summary || conversation.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                conversation.updated_at
                              ).toLocaleDateString("id-ID")}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleTitleEdit(
                                    conversation.id,
                                    conversation.title,
                                    conversation.summary
                                  )
                                }
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Judul
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(e) => e.preventDefault()}
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Hapus Obrolan
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus obrolan
                                      ini? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        deleteConversation(conversation.id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Hapus
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Mobile Chat History Sheet */}
      <Sheet open={showMobileMenu} onOpenChange={setShowMobileMenu}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">Riwayat Obrolan</SheetTitle>
            <Button
              onClick={createNewConversation}
              size="sm"
              className="gap-2 w-full"
            >
              <Plus className="h-4 w-4" />
              Obrolan Baru
            </Button>
          </SheetHeader>

          <ScrollArea className="flex-1 h-[calc(100vh-120px)]">
            {isLoadingConversations ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Belum ada obrolan
                </p>
                <Button
                  onClick={createNewConversation}
                  size="sm"
                  className="mt-2"
                >
                  Mulai Obrolan
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {conversations.map((conversation) => (
                  <Card
                    key={conversation.id}
                    className={`cursor-pointer transition-all border-l-4 ${
                      currentConversation?.id === conversation.id
                        ? "bg-primary/5 border-l-primary border-y-transparent border-r-transparent shadow-sm"
                        : "hover:bg-muted/50 border-l-transparent border-transparent shadow-none"
                    }`}
                    onClick={() => {
                      handleConversationSwitch(conversation);
                      setShowMobileMenu(false);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">
                            {conversation.summary || conversation.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              conversation.updated_at
                            ).toLocaleDateString("id-ID")}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTitleEdit(
                                  conversation.id,
                                  conversation.title,
                                  conversation.summary
                                );
                              }}
                            >
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit Judul
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Hapus Obrolan
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Apakah Anda yakin ingin menghapus obrolan
                                    ini? Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteConversation(conversation.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-h-screen">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setShowMobileMenu(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>

                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/eva_pict.png" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base sm:text-lg font-bold text-foreground line-clamp-1 leading-tight">
                      {currentConversation.summary || currentConversation.title}
                    </h1>
                    {isMobile && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleTitleEdit(
                                currentConversation.id,
                                currentConversation.title,
                                currentConversation.summary
                              )
                            }
                          >
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Judul
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus Obrolan
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Hapus Obrolan
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus obrolan ini?
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteConversation(currentConversation.id)
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0">
              <ScrollArea ref={scrollAreaRef} className="h-full p-2 sm:p-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((message) => {
                      // Hide empty AI messages (waiting for stream) to prevent double bubble with typing indicator
                      if (message.sender === "ai" && !message.content) return null;

                      return (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${
                            message.sender === "user"
                              ? "justify-end"
                              : "justify-start"
                          } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        >
                          {message.sender === "ai" && (
                            <Avatar className="h-8 w-8 mt-1 flex-shrink-0 border shadow-sm">
                              <AvatarImage src="/eva_pict.png" />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                <Bot className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}

                          <div
                            className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm ${
                              message.sender === "user"
                                ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                : "bg-card border text-card-foreground rounded-2xl rounded-tl-sm"
                            }`}
                          >
                            <div
                              className={`text-sm leading-relaxed prose prose-sm max-w-none break-words ${
                                message.sender === "user"
                                  ? "prose-invert prose-p:text-primary-foreground prose-headings:text-primary-foreground prose-strong:text-primary-foreground"
                                  : "prose-neutral dark:prose-invert"
                              }`}
                            >
                              <ReactMarkdown
                                components={{
                                  p: ({ node, ...props }) => (
                                    <p className="mb-2 last:mb-0" {...props} />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline font-medium hover:text-opacity-80"
                                      {...props}
                                    />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul className="list-disc pl-4 mb-2" {...props} />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol className="list-decimal pl-4 mb-2" {...props} />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="mb-0.5" {...props} />
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                            <p
                              className={`text-[10px] mt-1.5 text-right opacity-70 ${
                                message.sender === "user"
                                  ? "text-primary-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatTime(message.created_at)}
                            </p>
                          </div>                          {message.sender === "user" && (
                            <Avatar className="h-8 w-8 mt-1 flex-shrink-0 border shadow-sm">
                              <AvatarImage src={user?.avatar_url || ""} />
                              <AvatarFallback className="bg-secondary text-secondary-foreground">
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="h-8 w-8 mt-2 flex-shrink-0">
                          <AvatarImage src="/eva_pict.png" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="max-w-4xl mx-auto">
                <div className="relative flex items-end gap-2 bg-muted/50 p-2 rounded-3xl border focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ceritakan apa yang kamu rasakan..."
                    className="flex-1 min-h-[44px] max-h-[150px] resize-none border-0 focus-visible:ring-0 bg-transparent py-3 px-4 shadow-none"
                    disabled={isTyping}
                    rows={1}
                    style={{ height: "auto", overflow: "hidden" }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto";
                      target.style.height = `${target.scrollHeight}px`;
                    }}
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    size="icon"
                    className="h-10 w-10 rounded-full mb-0.5 shrink-0 transition-all hover:scale-105 active:scale-95"
                  >
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Kirim</span>
                  </Button>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-2">
                  AI dapat membuat kesalahan. Mohon verifikasi informasi penting.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md w-full">
              <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Selamat Datang di Teman AI
              </h3>
              <p className="text-muted-foreground mb-8">
                Saya siap mendengarkan cerita Anda. Pilih topik di bawah atau mulai obrolan baru.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {SUGGESTIONS.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto py-3 px-4 text-left justify-start whitespace-normal hover:bg-primary/5 hover:text-primary border-muted-foreground/20"
                    onClick={() => {
                      createNewConversation().then(() => {
                        setInputMessage(suggestion);
                      });
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>

              <Button onClick={createNewConversation} size="lg" className="gap-2 w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-5 w-5" />
                Mulai Obrolan Baru
              </Button>
            </div>
          </div>
        )}
      </div>
      
      {user && (
        <InitialDialog 
          open={showInitialDialog} 
          userId={user.id} 
          currentSubtypes={userSubtypes}
          currentParentId={userParentId}
          onComplete={(nickname) => {
            setUserNickname(nickname);
            setShowInitialDialog(false);
          }} 
        />
      )}
    </div>
  );
};

export default AICompanion;

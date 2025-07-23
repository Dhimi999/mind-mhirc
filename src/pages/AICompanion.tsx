import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MessageCircle, Sparkles, Plus, MoreVertical, Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
}

const AICompanion = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, [user]);

  useEffect(() => {
    if (currentConversation) {
      fetchMessages(currentConversation.id);
    }
  }, [currentConversation]);

  useEffect(() => {
    // Auto scroll to bottom when new message is added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      setIsLoadingConversations(true);
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setConversations(data || []);
      
      // Auto-select the first conversation if exists
      if (data && data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0]);
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
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        sender: msg.sender as "user" | "ai"
      })));
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
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: `Obrolan ${new Date().toLocaleDateString('id-ID')}`
        })
        .select()
        .single();

      if (error) throw error;

      // Add welcome message
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: data.id,
          user_id: user.id,
          content: "Halo! Saya adalah teman AI Anda. Saya di sini untuk mendengarkan dan membantu Anda. Bagaimana kabar Anda hari ini?",
          sender: "ai"
        });

      setCurrentConversation(data);
      fetchConversations();
      
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
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      // If deleting current conversation, select another one or clear
      if (currentConversation?.id === conversationId) {
        const remainingConversations = conversations.filter(c => c.id !== conversationId);
        setCurrentConversation(remainingConversations.length > 0 ? remainingConversations[0] : null);
        setMessages([]);
      }

      fetchConversations();
      
      toast({
        title: "Obrolan Dihapus",
        description: "Obrolan berhasil dihapus"
      });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus obrolan",
        variant: "destructive"
      });
    }
  };

  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;

      fetchConversations();
      if (currentConversation?.id === conversationId) {
        setCurrentConversation({ ...currentConversation, title });
      }
      
      toast({
        title: "Judul Diperbarui",
        description: "Judul obrolan berhasil diperbarui"
      });
    } catch (error) {
      console.error("Error updating conversation title:", error);
      toast({
        title: "Gagal Memperbarui",
        description: "Terjadi kesalahan saat memperbarui judul",
        variant: "destructive"
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation || !user) return;

    const userMessageContent = inputMessage;
    setInputMessage("");
    setIsTyping(true);

    try {
      // Save user message
      const { data: userMessage, error: userError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: currentConversation.id,
          user_id: user.id,
          content: userMessageContent,
          sender: "user"
        })
        .select()
        .single();

      if (userError) throw userError;

      // Refresh messages
      fetchMessages(currentConversation.id);

      // Simulate AI response with delay
      setTimeout(async () => {
        const aiResponses = [
          "Terima kasih telah berbagi dengan saya. Bagaimana perasaan Anda setelah menceritakan hal tersebut?",
          "Saya mendengar Anda. Itu terdengar seperti pengalaman yang cukup menantang. Apakah ada hal yang bisa membantu Anda merasa lebih baik?",
          "Saya memahami apa yang Anda rasakan. Kadang-kadang berbicara tentang perasaan kita bisa membantu melegakan pikiran.",
          "Itu sangat menarik. Bisakah Anda ceritakan lebih lanjut tentang hal tersebut?",
          "Saya menghargai kepercayaan Anda untuk berbagi dengan saya. Apakah ada hal lain yang ingin Anda diskusikan?",
          "Terdengar seperti Anda sedang melewati banyak hal. Ingatlah bahwa tidak apa-apa untuk merasakan apa yang Anda rasakan saat ini.",
          "Saya di sini untuk mendengarkan Anda. Apakah ada strategi atau aktivitas yang biasanya membantu Anda merasa lebih baik?"
        ];

        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        
        try {
          await supabase
            .from('ai_messages')
            .insert({
              conversation_id: currentConversation.id,
              user_id: user.id,
              content: randomResponse,
              sender: "ai"
            });

          fetchMessages(currentConversation.id);
        } catch (error) {
          console.error("Error saving AI message:", error);
        }
        
        setIsTyping(false);
      }, 1500 + Math.random() * 1000);

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Gagal Mengirim Pesan",
        description: "Terjadi kesalahan saat mengirim pesan",
        variant: "destructive"
      });
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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

  const handleTitleEdit = (conversationId: string, currentTitle: string) => {
    setEditingTitle(conversationId);
    setNewTitle(currentTitle);
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
    <div className="h-screen max-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
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
              <Button onClick={createNewConversation} size="sm" className="mt-2">
                Mulai Obrolan
              </Button>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {conversations.map((conversation) => (
                <Card 
                  key={conversation.id}
                  className={`cursor-pointer transition-colors ${
                    currentConversation?.id === conversation.id ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setCurrentConversation(conversation)}
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
                          />
                          <Button size="sm" onClick={saveTitleEdit} className="h-8 px-2">
                            ✓
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                            <p className="text-xs text-muted-foreground">
                              {new Date(conversation.updated_at).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={() => handleTitleEdit(conversation.id, conversation.title)}
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit Judul
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Hapus
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Hapus Obrolan</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Apakah Anda yakin ingin menghapus obrolan ini? Tindakan ini tidak dapat dibatalkan.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteConversation(conversation.id)}
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-h-screen">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/ai-avatar.png" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{currentConversation.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    Selalu siap mendengarkan dan membantu Anda
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 min-h-0">
              <ScrollArea ref={scrollAreaRef} className="h-full p-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-4xl mx-auto">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        {message.sender === "ai" && (
                          <Avatar className="h-8 w-8 mt-2">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-[70%] ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          } rounded-lg px-4 py-3`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}>
                            {formatTime(message.created_at)}
                          </p>
                        </div>

                        {message.sender === "user" && (
                          <Avatar className="h-8 w-8 mt-2">
                            <AvatarFallback className="bg-secondary text-secondary-foreground">
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-3 justify-start">
                        <Avatar className="h-8 w-8 mt-2">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan Anda di sini..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={!inputMessage.trim() || isTyping}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Kirim
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Fitur ini masih dalam pengembangan. Respons AI saat ini hanya simulasi.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium text-foreground mb-2">
                Selamat Datang di Teman AI
              </h3>
              <p className="text-muted-foreground mb-4">
                Pilih obrolan yang ada atau buat obrolan baru untuk memulai
              </p>
              <Button onClick={createNewConversation} className="gap-2">
                <Plus className="h-4 w-4" />
                Mulai Obrolan Baru
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AICompanion;
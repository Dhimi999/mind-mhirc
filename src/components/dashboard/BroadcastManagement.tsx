
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import { Megaphone, Clock, Send, Users, User, AlertCircle, CheckCircle2 } from 'lucide-react';

const BroadcastManagement = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [recipient, setRecipient] = useState('all');
  const [priority, setPriority] = useState('regular');
  const [activeTab, setActiveTab] = useState('compose');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      setTitle('');
      setMessage('');
      setRecipient('all');
      setPriority('regular');
      setActiveTab('history');
      // Add success notification here in a real app
    }, 1500);
  };

  const mockBroadcasts = [
    {
      id: '1',
      title: 'Pemeliharaan Sistem Terjadwal',
      content: 'Kami ingin memberitahukan bahwa akan ada pemeliharaan sistem pada tanggal 15 Juni 2023 pukul 22:00 - 02:00 WIB. Selama waktu tersebut, sistem mungkin tidak dapat diakses.',
      priority: 'high',
      recipients: ['all'],
      created_at: '2023-06-10T14:30:00Z',
      created_by: 'Administrator'
    },
    {
      id: '2',
      title: 'Fitur Baru: Tes Kecemasan GAD-7',
      content: 'Kami dengan senang hati mengumumkan peluncuran fitur baru: Tes Kecemasan GAD-7. Tes ini dapat membantu Anda mengevaluasi tingkat kecemasan dalam 7 pertanyaan singkat.',
      priority: 'regular',
      recipients: ['users'],
      created_at: '2023-06-05T09:15:00Z',
      created_by: 'Administrator'
    },
    {
      id: '3',
      title: 'Webinar Kesehatan Mental di Tempat Kerja',
      content: 'Bergabunglah dengan kami dalam webinar "Menjaga Kesehatan Mental di Tempat Kerja" pada 20 Juni 2023 pukul 19:00 WIB. Webinar ini akan membahas strategi mengelola stres dan menciptakan lingkungan kerja yang mendukung kesehatan mental.',
      priority: 'regular',
      recipients: ['professionals'],
      created_at: '2023-06-01T11:45:00Z',
      created_by: 'Dr. Anita Wijaya'
    }
  ];

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-500 border-red-200">Penting</Badge>;
      case 'regular':
        return <Badge variant="outline" className="bg-blue-50 text-blue-500 border-blue-200">Reguler</Badge>;
      default:
        return <Badge variant="outline">Reguler</Badge>;
    }
  };

  const getRecipientBadge = (recipients: string[]) => {
    if (recipients.includes('all')) {
      return <Badge variant="outline" className="bg-purple-50 text-purple-500 border-purple-200">Semua Pengguna</Badge>;
    } else if (recipients.includes('users')) {
      return <Badge variant="outline" className="bg-green-50 text-green-500 border-green-200">Pengguna Reguler</Badge>;
    } else if (recipients.includes('professionals')) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-500 border-yellow-200">Profesional</Badge>;
    } else {
      return <Badge variant="outline">Kustom</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Manajemen Siaran</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compose">Buat Siaran</TabsTrigger>
          <TabsTrigger value="history">Riwayat Siaran</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compose" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Buat Siaran Baru</CardTitle>
              <CardDescription>
                Kirim pesan ke semua pengguna atau grup tertentu.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Judul</Label>
                    <Input 
                      id="title" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Masukkan judul siaran" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="recipient">Penerima</Label>
                    <Select value={recipient} onValueChange={setRecipient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih penerima" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Pengguna</SelectItem>
                        <SelectItem value="users">Pengguna Reguler</SelectItem>
                        <SelectItem value="professionals">Profesional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Prioritas</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih prioritas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Reguler</SelectItem>
                        <SelectItem value="high">Penting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea 
                      id="message" 
                      value={message} 
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tulis pesan siaran Anda di sini" 
                      className="min-h-32" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSending}>
                    {isSending ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Kirim Siaran
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Riwayat Siaran</CardTitle>
              <CardDescription>
                Lihat siaran yang telah dibuat sebelumnya.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-6">
                {mockBroadcasts.map((broadcast) => (
                  <div key={broadcast.id} className="rounded-lg border p-4 space-y-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="font-medium">{broadcast.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{formatDate(broadcast.created_at)}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="mr-1 h-4 w-4" />
                            <span>{broadcast.created_by}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {getPriorityBadge(broadcast.priority)}
                        {getRecipientBadge(broadcast.recipients)}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground text-sm">{broadcast.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>
                          {broadcast.recipients.includes('all') 
                            ? 'Dikirim ke semua pengguna' 
                            : broadcast.recipients.includes('users')
                              ? 'Dikirim ke pengguna reguler'
                              : 'Dikirim ke profesional'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-500 border-green-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Terkirim
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BroadcastManagement;

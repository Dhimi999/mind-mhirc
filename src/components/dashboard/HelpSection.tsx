
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageSquare, FileText, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const HelpSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast({
        title: "Validasi Gagal",
        description: "Semua field diperlukan",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('help_reports')
        .insert({
          user_id: user?.id,
          name,
          email,
          subject,
          message,
          status: 'pending'
        });
      
      if (error) throw error;
      
      toast({
        title: "Laporan Terkirim",
        description: "Laporan kendala berhasil dikirim. Tim kami akan segera menanggapi.",
      });
      
      // Reset form
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Gagal Mengirim",
        description: "Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Tabs defaultValue="documentation" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="documentation" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Dokumentasi</span>
        </TabsTrigger>
        <TabsTrigger value="faq" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">FAQ</span>
        </TabsTrigger>
        <TabsTrigger value="contact" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <span className="hidden sm:inline">Kontak</span>
        </TabsTrigger>
        <TabsTrigger value="report" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Laporkan Kendala</span>
        </TabsTrigger>
      </TabsList>
      
      {/* Documentation Tab */}
      <TabsContent value="documentation">
        <Card>
          <CardHeader>
            <CardTitle>Dokumentasi Mind MHIRC</CardTitle>
            <CardDescription>
              Panduan lengkap untuk menggunakan aplikasi Mind MHIRC
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Tentang Mind MHIRC</h3>
              <p>
                Mind MHIRC adalah platform kesehatan mental komprehensif yang dirancang untuk 
                membantu pengguna memahami, mengelola, dan meningkatkan kesehatan mental mereka. 
                Platform ini menyediakan berbagai alat diagnostik, sumber daya edukasi, 
                dan koneksi ke profesional kesehatan mental.
              </p>
              
              <h3 className="text-lg font-medium mt-6">Fitur Utama</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Tes Mental:</strong> Akses berbagai tes skrining kesehatan mental standar.
                </li>
                <li>
                  <strong>Hasil Tes:</strong> Lihat dan kelola hasil tes Anda sebelumnya.
                </li>
                <li>
                  <strong>Janji Konsultasi:</strong> Jadwalkan konsultasi dengan profesional kesehatan mental.
                </li>
                <li>
                  <strong>Pesan:</strong> Berkomunikasi dengan profesional kesehatan mental.
                </li>
                <li>
                  <strong>Blog Edukasi:</strong> Akses artikel informatif tentang kesehatan mental.
                </li>
              </ul>
              
              <h3 className="text-lg font-medium mt-6">Panduan Cepat Dashboard</h3>
              <p>
                Dashboard Anda menyediakan gambaran umum aktivitas dan rekomendasi Anda. Dari sini, Anda dapat dengan cepat 
                mengakses semua fitur platform dan melihat notifikasi penting.
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* FAQ Tab */}
      <TabsContent value="faq">
        <Card>
          <CardHeader>
            <CardTitle>Pertanyaan Umum</CardTitle>
            <CardDescription>
              Jawaban untuk pertanyaan yang sering diajukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Apakah data tes saya dijaga kerahasiaannya?</AccordionTrigger>
                <AccordionContent>
                  Ya, Mind MHIRC berkomitmen untuk menjaga privasi pengguna. Semua data tes dan informasi pribadi dienkripsi 
                  dan tidak akan dibagikan tanpa persetujuan eksplisit dari Anda.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Bagaimana cara menafsirkan hasil tes?</AccordionTrigger>
                <AccordionContent>
                  Setiap tes dilengkapi dengan panduan interpretasi yang komprehensif. Namun, penting untuk diingat bahwa 
                  hasil tes hanya bersifat informatif dan tidak menggantikan diagnosis profesional.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Bagaimana cara menjadwalkan konsultasi?</AccordionTrigger>
                <AccordionContent>
                  Anda dapat menjadwalkan konsultasi melalui menu "Janji Konsultasi" di dashboard. Pilih profesional, 
                  tanggal dan waktu yang tersedia, dan konfirmasikan janji Anda.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Apakah Mind MHIRC tersedia di perangkat mobile?</AccordionTrigger>
                <AccordionContent>
                  Saat ini Mind MHIRC dapat diakses melalui browser web di perangkat mobile. Aplikasi mobile khusus 
                  sedang dalam pengembangan dan akan segera diluncurkan.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5">
                <AccordionTrigger>Berapa biaya untuk menggunakan Mind MHIRC?</AccordionTrigger>
                <AccordionContent>
                  Mind MHIRC menawarkan model layanan bertingkat. Fitur dasar tersedia secara gratis, 
                  sementara konsultasi profesional dan fitur lanjutan memerlukan biaya berlangganan atau 
                  pembayaran per sesi.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-6">
                <AccordionTrigger>Apakah tes mental di Mind MHIRC divalidasi secara klinis?</AccordionTrigger>
                <AccordionContent>
                  Ya, semua tes mental yang tersedia di Mind MHIRC didasarkan pada instrumen yang divalidasi 
                  secara klinis dan digunakan secara luas dalam praktik profesional.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Contact Tab */}
      <TabsContent value="contact">
        <Card>
          <CardHeader>
            <CardTitle>Hubungi Kami</CardTitle>
            <CardDescription>
              Berbagai cara untuk menghubungi tim dukungan kami
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">Untuk pertanyaan umum dan dukungan:</p>
                  <p className="font-medium">support@mindmhirc.com</p>
                  
                  <p className="mt-4 mb-2">Untuk pertanyaan bisnis dan kemitraan:</p>
                  <p className="font-medium">partnerships@mindmhirc.com</p>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">Dukungan WhatsApp (jam kerja: 08.00 - 20.00 WIB):</p>
                  <p className="font-medium">+62 812 3456 7890</p>
                  
                  <Button 
                    className="mt-4 w-full"
                    onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                  >
                    Chat via WhatsApp
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Jam Operasional</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Tim dukungan kami tersedia pada:</p>
                  <p className="mt-2">Senin - Jumat: 08.00 - 20.00 WIB</p>
                  <p>Sabtu: 09.00 - 17.00 WIB</p>
                  <p>Minggu & Hari Libur: 10.00 - 15.00 WIB</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Report Issue Tab */}
      <TabsContent value="report">
        <Card>
          <CardHeader>
            <CardTitle>Laporkan Kendala</CardTitle>
            <CardDescription>
              Laporkan masalah atau bug yang Anda temui saat menggunakan Mind MHIRC
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="font-medium">
                    Nama
                  </label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@anda.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="font-medium">
                  Judul Kendala
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ringkasan singkat kendala yang Anda alami"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="message" className="font-medium">
                  Detail Kendala
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Jelaskan secara detail kendala yang Anda alami, termasuk langkah-langkah untuk mereproduksinya jika memungkinkan"
                  rows={6}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Mengirim..." : "Kirim Laporan"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default HelpSection;

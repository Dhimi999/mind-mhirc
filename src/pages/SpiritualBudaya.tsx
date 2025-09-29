import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Book, FileText, Users, Heart, Home, Brain, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import heroImage from "@/assets/spiritual-cultural-hero.jpg";
import jelajahImage from "@/assets/spiritual-jelajah.jpg";
import tasksImage from "@/assets/spiritual-tasks.jpg";
const SpiritualBudaya = () => {
  const [activeTab, setActiveTab] = useState("jelajah");
  const { isAuthenticated } = useAuth();
  type SessionProgress = { meetingDone: boolean; assignmentDone: boolean };
  const [progressMap, setProgressMap] = useState<Record<number, SessionProgress>>({});
  const navigate = useNavigate();

  // Load/save progress from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("spiritualInterventionProgress");
      if (raw) setProgressMap(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("spiritualInterventionProgress", JSON.stringify(progressMap));
    } catch {}
  }, [progressMap]);

  // meetingSchedule dipindahkan ke halaman portal sesi
  const treatmentModules = [{
    session: 1,
    title: "Identitas Budaya Dan Makna Diri",
    description: "Memahami identitas budaya sebagai fondasi kesehatan mental dan mengeksplorasi makna diri dalam konteks budaya.",
    duration: "60 menit",
    status: "available"
  }, {
    session: 2,
    title: "Spiritualitas Sebagai Pilar Harapan",
    description: "Menggali kekuatan spiritual sebagai sumber harapan dan ketahanan dalam menghadapi tantangan hidup.",
    duration: "60 menit",
    status: "locked"
  }, {
    session: 3,
    title: "Ekspresi Emosi Melalui Budaya",
    description: "Belajar mengekspresikan emosi dengan cara-cara yang sehat melalui tradisi dan budaya lokal.",
    duration: "60 menit",
    status: "locked"
  }, {
    session: 4,
    title: "Mengurai Stigma Melalui Nilai Komunitas",
    description: "Memahami dan mengatasi stigma kesehatan mental dengan memanfaatkan nilai-nilai komunitas.",
    duration: "60 menit",
    status: "locked"
  }, {
    session: 5,
    title: "Peran Komunitas Dalam Dukungan Emosional",
    description: "Mengoptimalkan peran komunitas sebagai sistem dukungan emosional yang berkelanjutan.",
    duration: "60 menit",
    status: "locked"
  }, {
    session: 6,
    title: "Ritual Dan Tradisi Sebagai Media Kesembuhan",
    description: "Menerapkan ritual dan tradisi budaya sebagai metode penyembuhan dan pemulihan mental.",
    duration: "60 menit",
    status: "locked"
  }, {
    session: 7,
    title: "Literasi Spiritual Dan Budaya Kesehatan Jiwa",
    description: "Meningkatkan pemahaman tentang integrasi spiritualitas dan budaya dalam kesehatan mental.",
    duration: "60 menit",
    status: "locked"
  }, {
    session: 8,
    title: "Komitmen Hidup Dan Prospek Masa Depan",
    description: "Membangun komitmen hidup yang bermakna dan merencanakan masa depan dengan optimisme.",
    duration: "60 menit",
    status: "locked"
  }];
  const jelajahContent = [{
    title: "Prinsip Dasar Intervensi Spiritual & Budaya",
    description: "Memahami fondasi teoretis dan praktis dalam mengintegrasikan spiritualitas dan budaya untuk kesehatan mental.",
    icon: Brain,
    articles: 8,
    slug: "prinsip-dasar"
  }, {
    title: "Kearifan Lokal dalam Kesehatan Mental",
    description: "Eksplorasi berbagai tradisi dan kearifan lokal Indonesia yang dapat mendukung kesejahteraan psikologis.",
    icon: Home,
    articles: 12,
    slug: "kearifan-lokal"
  }, {
    title: "Teknik Self-Compassion Berbasis Budaya",
    description: "Metode praktis untuk mengembangkan kasih sayang diri dengan pendekatan yang sesuai budaya Indonesia.",
    icon: Heart,
    articles: 15,
    slug: "self-compassion-budaya"
  }, {
    title: "Komunitas dan Dukungan Sosial",
    description: "Peran penting komunitas dalam memberikan dukungan emosional dan spiritual untuk kesehatan mental.",
    icon: Users,
    articles: 10,
    slug: "komunitas-dukungan"
  }];
  return <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Spiritual & Budaya - Intervensi Self Compassion | Mind MHIRC</title>
        <meta name="description" content="Program intervensi self compassion berbasis spiritual dan budaya untuk kesehatan mental yang sesuai dengan nilai-nilai kearifan lokal Indonesia." />
        <link rel="canonical" href="https://mind-mhirc.my.id/spiritual-budaya" />
      </Helmet>

      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-muted/50 to-background overflow-hidden rounded">
          <div className="absolute inset-0 opacity-10">
            <img src={heroImage} alt="Spiritual & Budaya Background" className="w-full h-full object-cover" />
          </div>
          <div className="relative container mx-auto px-6 py-16 rounded-xl">
            <div className="max-w-4xl mx-auto text-center fade-in">
              
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-br from-amber-600 to-amber-800 bg-clip-text text-transparent">
                Spiritual & Budaya
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Program intervensi self compassion berbasis spiritual dan budaya yang mengintegrasikan 
                nilai-nilai kearifan lokal Indonesia untuk mendukung kesehatan mental dan kesejahteraan holistik.
              </p>

              
            </div>
          </div>
        </section>

        {/* Main Content with Tabs */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                if (!isAuthenticated && val !== "jelajah") {
                  // Arahkan ke login dan jangan ganti tab
                  navigate(`/login?redirect=/spiritual-budaya`);
                  return;
                }
                setActiveTab(val);
              }}
              className="max-w-6xl mx-auto"
            >
              <TabsList className="grid w-full grid-cols-3 mb-12">
                <TabsTrigger value="jelajah" className="text-lg py-3">
                  <Book className="mr-2 h-5 w-5" />
                  Jelajah
                </TabsTrigger>
                <TabsTrigger
                  value="intervensi"
                  className={`text-lg py-3 ${!isAuthenticated ? "opacity-60" : ""}`}
                  title={!isAuthenticated ? "Login diperlukan" : undefined}
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Intervensi
                </TabsTrigger>
                <TabsTrigger
                  value="psikoedukasi"
                  className={`text-lg py-3 ${!isAuthenticated ? "opacity-60" : ""}`}
                  title={!isAuthenticated ? "Login diperlukan" : undefined}
                >
                  <Brain className="mr-2 h-5 w-5" />
                  Psikoedukasi
                </TabsTrigger>
              </TabsList>

              {/* Jelajah Tab */}
              <TabsContent value="jelajah" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Jelajahi Materi Spiritual & Budaya</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Temukan berbagai materi dan pengetahuan seputar intervensi kesehatan mental 
                    yang berbasis spiritual dan budaya Indonesia.
                  </p>
                </div>

                <div className="relative mb-8 rounded-2xl overflow-hidden">
                  <img src={jelajahImage} alt="Spiritual Jelajah" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">Kearifan Lokal untuk Kesehatan Mental</h3>
                      <p className="text-white/90">Menggali tradisi dan nilai-nilai budaya Indonesia untuk kesejahteraan psikologis</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jelajahContent.map((item, index) => <Card key={index} className="group hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="bg-amber-100 p-3 rounded-lg">
                            <item.icon className="h-6 w-6 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="group-hover:text-amber-600 transition-colors">
                              {item.title}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {item.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="bg-green-300">
                            {item.articles} artikel
                          </Badge>
                          <Link to={`/spiritual-budaya/materi/${item.slug}`}>
                            <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                              Baca Selengkapnya →
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>
              </TabsContent>

              {/* Intervensi Tab */}
              <TabsContent value="intervensi" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Intervensi & Treatment Modules</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Serangkaian intervensi dan latihan terstruktur untuk membantu Anda menerapkan 
                    prinsip-prinsip spiritual dan budaya dalam kehidupan sehari-hari.
                  </p>
                </div>

                <div className="relative mb-8 rounded-2xl overflow-hidden">
                  <img src={tasksImage} alt="Spiritual Intervensi" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">Portal Intervensi Terstruktur</h3>
                      <p className="text-white/90">8 sesi treatment module untuk perjalanan penyembuhan holistik</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {treatmentModules.map((module, index) => <Card key={index} className={`group transition-all ${module.status === 'available' ? 'hover:shadow-lg border-amber-200 bg-amber-50/50' : 'opacity-60 bg-muted/30'}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${module.status === 'available' ? 'bg-amber-600' : 'bg-muted'}`}>
                            {module.session}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg">
                                Sesi {module.session}: {module.title}
                              </h3>
                              <Badge variant={module.status === 'available' ? 'default' : 'secondary'}>
                                {module.status === 'available' ? 'Tersedia' : 'Terkunci'}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground mb-3">
                              {module.description}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                Durasi: {module.duration}
                              </span>
                              
                              <Button
                                variant={module.status === 'available' ? 'default' : 'secondary'}
                                disabled={module.status !== 'available'}
                                className={module.status === 'available' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                                onClick={() => module.status === 'available' && navigate(`/spiritual-budaya/intervensi/sesi/${module.session}`)}
                              >
                                {module.status === 'available' ? 'Mulai Sesi' : 'Belum Tersedia'}
                              </Button>
                            </div>

                            {/* Status dua unsur + detail saat sesi dibuka */}
                            <div className="mt-4 space-y-3">
                              {/* Status ringkas */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-lg border bg-background p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium">Pertemuan Daring</p>
                                      <p className="text-xs text-muted-foreground">Sesi sinkron dengan fasilitator</p>
                                    </div>
                                    <Badge className={progressMap[module.session]?.meetingDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-900'}>
                                      {progressMap[module.session]?.meetingDone ? 'Sudah selesai' : 'Belum selesai'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="rounded-lg border bg-background p-4">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-medium">Penugasan</p>
                                      <p className="text-xs text-muted-foreground">Latihan terstruktur pasca pertemuan</p>
                                    </div>
                                    <Badge className={progressMap[module.session]?.assignmentDone ? 'bg-green-500 text-white' : 'bg-amber-200 text-amber-900'}>
                                      {progressMap[module.session]?.assignmentDone ? 'Sudah selesai' : 'Belum selesai'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Detail sesi dipindah ke halaman portal sesi */}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>

                <div className="text-center mt-12">
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardContent className="p-8">
                      <h3 className="text-xl font-semibold mb-4">Panduan Penggunaan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div className="text-center">
                          <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
                          <p><strong>Mulai Berurutan</strong><br />Ikuti sesi sesuai urutan untuk hasil optimal</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
                          <p><strong>Konsisten</strong><br />Lakukan latihan secara rutin sesuai jadwal</p>
                        </div>
                        <div className="text-center">
                          <div className="bg-amber-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
                          <p><strong>Refleksi</strong><br />Luangkan waktu untuk merefleksikan setiap sesi</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Psikoedukasi Tab */}
              <TabsContent value="psikoedukasi" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Psikoedukasi</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Dapatkan pengetahuan dan edukasi seputar kesehatan mental, spiritual, dan budaya yang relevan untuk mendukung kesejahteraan Anda.
                  </p>
                </div>
                <div className="relative mb-8 rounded-2xl overflow-hidden">
                  <img src={heroImage} alt="Psikoedukasi" className="w-full h-64 object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <div className="p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2">Materi Psikoedukasi</h3>
                      <p className="text-white/90">Informasi, tips, dan edukasi untuk memperkuat pemahaman Anda tentang kesehatan mental dan spiritual.</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Placeholder konten psikoedukasi, bisa diisi materi sesuai kebutuhan */}
                  <Card className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="bg-amber-100 p-3 rounded-lg">
                          <Brain className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="group-hover:text-amber-600 transition-colors">
                            Apa itu Psikoedukasi?
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Psikoedukasi adalah proses pemberian edukasi dan informasi kepada individu atau kelompok mengenai kesehatan mental, spiritual, dan budaya untuk meningkatkan pemahaman dan keterampilan dalam menghadapi tantangan hidup.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-green-300">
                          Edukasi
                        </Badge>
                        <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                          Baca Selengkapnya →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>;
};

export default SpiritualBudaya;
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Smile, Frown, Meh, CloudRain, Sun, CloudLightning, Calendar as CalendarIcon, Trash2, List, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Mood types and colors
const MOODS = [
  { id: "happy", label: "Senang", icon: Smile, color: "#4ade80", diaryColor: "#dcfce7" }, // green-400, green-100
  { id: "sad", label: "Sedih", icon: CloudRain, color: "#60a5fa", diaryColor: "#dbeafe" }, // blue-400, blue-100
  { id: "neutral", label: "Biasa", icon: Meh, color: "#94a3b8", diaryColor: "#f1f5f9" }, // slate-400, slate-100
  { id: "angry", label: "Marah", icon: CloudLightning, color: "#f87171", diaryColor: "#fee2e2" }, // red-400, red-100
  { id: "excited", label: "Bersemangat", icon: Sun, color: "#fbbf24", diaryColor: "#fef3c7" }, // amber-400, amber-100
  { id: "anxious", label: "Cemas", icon: Frown, color: "#a78bfa", diaryColor: "#f3e8ff" }, // violet-400, violet-100
];

interface MoodEntry {
  id: string;
  mood_id: string;
  note: string;
  created_at: string;
  color: string;
}

const MoodCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [hasCheckedToday, setHasCheckedToday] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const isMobile = useIsMobile();

  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      checkConsent();
    }
  }, [user]);

  useEffect(() => {
    if (user && hasConsent) {
      fetchMoodEntries();
    }
  }, [user, currentDate, hasConsent]);

  useEffect(() => {
    if (user && hasConsent && hasFetched && !hasCheckedToday) {
      const todayMood = moodEntries.find(e => isSameDay(new Date(e.created_at), new Date()));
      if (!todayMood) {
        setSelectedDate(new Date());
        setIsDialogOpen(true);
      }
      setHasCheckedToday(true);
    }
  }, [hasFetched, hasCheckedToday, moodEntries, user, hasConsent]);

  const checkConsent = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notes_consent' as any)
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setHasConsent(!!data?.notes_consent);
    } catch (error) {
      console.error("Error checking consent:", error);
      setHasConsent(false);
    }
  };

  const fetchMoodEntries = async () => {
    if (!user) return;
    
    const start = startOfMonth(currentDate).toISOString();
    const end = endOfMonth(currentDate).toISOString();

    try {
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .ilike('title', '[MOOD]%')
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;

      const formattedEntries: MoodEntry[] = (data || []).map(entry => {
        let moodId = "neutral";
        const title = entry.title;
        
        // Try to match by label first (New format: "[MOOD] sedang merasa Senang")
        const labelMatch = MOODS.find(m => title.includes(m.label));
        if (labelMatch) {
          moodId = labelMatch.id;
        } else {
          // Fallback to old format (ID in title: "[MOOD] happy")
          const idMatch = MOODS.find(m => title.toLowerCase().includes(m.id));
          if (idMatch) {
            moodId = idMatch.id;
          }
        }
        
        const moodDef = MOODS.find(m => m.id === moodId);
        
        return {
          id: entry.id,
          mood_id: moodId,
          note: entry.content,
          created_at: entry.created_at,
          color: moodDef?.color || "#ccc"
        };
      });

      setMoodEntries(formattedEntries);
      setHasFetched(true);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
    }
  };

  const handleSaveMood = async () => {
    if (!user || !selectedMood) return;
    if (!hasConsent) {
      toast({
        title: "Fitur Belum Aktif",
        description: "Anda perlu mengaktifkan fitur Catatan Harian terlebih dahulu di menu Catatan Harian.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const moodDef = MOODS.find(m => m.id === selectedMood);
      // Localized title
      const title = `[MOOD] sedang merasa ${moodDef?.label}`;
      
      const entryDate = new Date(selectedDate);
      if (!isSameDay(entryDate, new Date())) {
        entryDate.setHours(12, 0, 0, 0);
      } else {
        entryDate.setHours(new Date().getHours(), new Date().getMinutes());
      }

      const { error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: user.id,
          title: title,
          content: note || "Tidak ada catatan.",
          // Use diaryColor for background readability in Diary
          theme_color: moodDef?.diaryColor || "#ffffff",
          created_at: entryDate.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Mood Disimpan",
        description: "Perasaan Anda hari ini telah dicatat."
      });

      setIsDialogOpen(false);
      setSelectedMood(null);
      setNote("");
      fetchMoodEntries();
    } catch (error) {
      console.error("Error saving mood:", error);
      toast({
        title: "Gagal Menyimpan",
        description: "Terjadi kesalahan saat menyimpan mood.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteMood = async (id: string) => {
    try {
      const { error } = await supabase
        .from('diary_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Mood Dihapus",
        description: "Catatan mood berhasil dihapus."
      });
      
      fetchMoodEntries();
    } catch (error) {
      console.error("Error deleting mood:", error);
      toast({
        title: "Gagal Menghapus",
        description: "Terjadi kesalahan saat menghapus mood.",
        variant: "destructive"
      });
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const getMoodsForDate = (date: Date) => {
    return moodEntries.filter(entry => isSameDay(new Date(entry.created_at), date));
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Helper for Quick Cards
  const QuickMoodCard = ({ date, label }: { date: Date; label: string }) => {
    const moods = getMoodsForDate(date);
    const isTodayDate = isSameDay(date, new Date());
    
    return (
      <Card className={cn("flex-1 hover:shadow-md transition-all cursor-pointer border-2", isTodayDate ? "border-primary/20" : "border-transparent")} onClick={() => handleDayClick(date)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between items-center">
            {label}
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full">
              {format(date, "d MMM")}
            </span>
          </CardTitle>
          <CardDescription>
            {moods.length > 0 
              ? `${moods.length} catatan mood tersimpan`
              : "Belum ada catatan mood"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 min-h-[2rem]">
            {moods.length > 0 ? (
              moods.map((entry) => (
                <div
                  key={entry.id}
                  className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: entry.color }}
                  title={entry.note}
                >
                  {/* Optional: Show icon inside dot if needed, or just color */}
                </div>
              ))
            ) : (
              <div className="flex items-center text-muted-foreground text-sm italic">
                <Plus className="w-4 h-4 mr-1" />
                Catat sekarang
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    const moods = getMoodsForDate(date);
    if (moods.length > 0) {
      setIsDetailOpen(true);
    } else {
      setIsDialogOpen(true);
    }
  };

  const getGradient = (moods: MoodEntry[]) => {
    if (moods.length === 0) return undefined;
    if (moods.length === 1) return moods[0].color;
    const colors = moods.map(m => m.color).join(', ');
    return `linear-gradient(135deg, ${colors})`;
  };

  if (hasConsent === false) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="bg-muted p-6 rounded-full">
          <CalendarIcon className="w-12 h-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Fitur Belum Diaktifkan</h2>
        <p className="text-muted-foreground max-w-md">
          Untuk menggunakan Kalender Mood, Anda perlu mengaktifkan fitur "Catatan Harian" terlebih dahulu.
          Silakan pergi ke menu Catatan Harian untuk mengaktifkannya.
        </p>
        <Button onClick={() => window.location.href = '/dashboard/diary'}>
          Pergi ke Catatan Harian
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Kalender Mood</h1>
          <p className="text-muted-foreground mt-1">
            Pantau perubahan suasana hati Anda setiap hari.
          </p>
        </div>
        
        {/* Add Mood Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { setSelectedDate(new Date()); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4" />
              Catat Mood Hari Ini
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Bagaimana perasaan Anda {isSameDay(selectedDate, new Date()) ? "hari ini" : `pada ${format(selectedDate, "d MMMM")}`}?
              </DialogTitle>
              <DialogDescription>
                Pilih ikon yang paling menggambarkan suasana hati Anda.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-3 py-4">
              {MOODS.map((mood) => {
                const Icon = mood.icon;
                const isSelected = selectedMood === mood.id;
                return (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={cn(
                      "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all hover:bg-muted/50",
                      isSelected ? "border-primary bg-primary/5" : "border-transparent bg-muted/30"
                    )}
                  >
                    <Icon 
                      className="w-8 h-8 mb-2" 
                      style={{ color: mood.color }} 
                    />
                    <span className="text-xs font-medium">{mood.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Catatan (Opsional)</Label>
              <Textarea
                id="note"
                placeholder="Ceritakan sedikit tentang apa yang Anda rasakan..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSaveMood} disabled={!selectedMood || loading}>
                {loading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Day Detail Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                Mood pada {format(selectedDate, "d MMMM yyyy", { locale: idLocale })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              {getMoodsForDate(selectedDate).map((entry) => {
                 const moodDef = MOODS.find(m => m.id === entry.mood_id);
                 const Icon = moodDef?.icon || Smile;
                 return (
                   <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                     <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: entry.color }}>
                        <Icon className="w-6 h-6 text-white" />
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex items-center justify-between">
                         <h4 className="font-medium text-sm">{moodDef?.label || "Mood"}</h4>
                         <span className="text-xs text-muted-foreground">{format(new Date(entry.created_at), "HH:mm")}</span>
                       </div>
                       <p className="text-sm text-muted-foreground mt-1 break-words">{entry.note}</p>
                     </div>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteMood(entry.id)}>
                       <Trash2 className="w-4 h-4" />
                     </Button>
                   </div>
                 );
              })}
            </div>
            <DialogFooter>
               <Button onClick={() => { setIsDetailOpen(false); setIsDialogOpen(true); }} className="w-full">
                 <Plus className="w-4 h-4 mr-2" /> Tambah Mood Lain
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Access Cards */}
      <div className="flex flex-col sm:flex-row gap-4">
        <QuickMoodCard label="Kemarin" date={new Date(new Date().setDate(new Date().getDate() - 1))} />
        <QuickMoodCard label="Hari Ini" date={new Date()} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            {format(currentDate, "MMMM yyyy", { locale: idLocale })}
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Mobile List View */}
          <div className="md:hidden space-y-2">
             {days.map(day => {
               const moods = getMoodsForDate(day);
               const isTodayDate = isToday(day);
               // Show if it has moods or if it's today
               if (moods.length === 0 && !isTodayDate) return null;
               
               return (
                 <div key={day.toISOString()} 
                      className={cn("flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50", isTodayDate ? "border-primary bg-primary/5" : "bg-card")}
                      onClick={() => handleDayClick(day)}
                 >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0", isTodayDate ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                      {format(day, "d")}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{format(day, "EEEE, d MMMM", { locale: idLocale })}</div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {moods.length > 0 ? moods.map(m => (
                          <div key={m.id} className="w-4 h-4 rounded-full" style={{ backgroundColor: m.color }} />
                        )) : <span className="text-xs text-muted-foreground">Tidak ada catatan</span>}
                      </div>
                    </div>
                 </div>
               );
             })}
             {days.every(d => getMoodsForDate(d).length === 0 && !isToday(d)) && (
               <div className="text-center py-8 text-muted-foreground">Belum ada mood bulan ini.</div>
             )}
          </div>

          {/* Desktop Grid View */}
          <div className="hidden md:block">
            <div className="grid grid-cols-7 gap-4 text-center mb-4">
              {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
                <div key={day} className="text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              
              {days.map((day) => {
                const moods = getMoodsForDate(day);
                const isTodayDate = isToday(day);
                const background = getGradient(moods);
                
                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => handleDayClick(day)}
                    className={cn(
                      "aspect-square rounded-xl border p-2 flex flex-col items-center justify-center relative transition-all hover:shadow-md cursor-pointer overflow-hidden",
                      isTodayDate ? "ring-2 ring-primary ring-offset-2" : "bg-card"
                    )}
                    style={{ background: background }}
                  >
                    <span className={cn(
                      "text-sm font-medium w-8 h-8 flex items-center justify-center rounded-full z-10",
                      isTodayDate ? "bg-primary text-primary-foreground" : (moods.length > 0 ? "bg-white/90 text-black shadow-sm" : "text-muted-foreground")
                    )}>
                      {format(day, "d")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-sm text-muted-foreground">
        {MOODS.map(mood => (
          <div key={mood.id} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mood.color }} />
            <span>{mood.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoodCalendar;

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Smile, Frown, Meh, CloudRain, Sun, CloudLightning, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Mood types and colors
const MOODS = [
  { id: "happy", label: "Senang", icon: Smile, color: "#4ade80" }, // green-400
  { id: "sad", label: "Sedih", icon: CloudRain, color: "#60a5fa" }, // blue-400
  { id: "neutral", label: "Biasa", icon: Meh, color: "#94a3b8" }, // slate-400
  { id: "angry", label: "Marah", icon: CloudLightning, color: "#f87171" }, // red-400
  { id: "excited", label: "Bersemangat", icon: Sun, color: "#fbbf24" }, // amber-400
  { id: "anxious", label: "Cemas", icon: Frown, color: "#a78bfa" }, // violet-400
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
      // We are using diary_entries to store moods
      // Convention: Title starts with "[MOOD]"
      const { data, error } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_id', user.id)
        .ilike('title', '[MOOD]%')
        .gte('created_at', start)
        .lte('created_at', end);

      if (error) throw error;

      const formattedEntries: MoodEntry[] = (data || []).map(entry => {
        // Parse mood ID from title: "[MOOD] happy" -> "happy"
        const moodId = entry.title.replace('[MOOD] ', '').trim();
        const moodDef = MOODS.find(m => m.id === moodId);
        
        return {
          id: entry.id,
          mood_id: moodId,
          note: entry.content,
          created_at: entry.created_at,
          color: entry.theme_color || moodDef?.color || "#ccc"
        };
      });

      setMoodEntries(formattedEntries);
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
      const title = `[MOOD] ${selectedMood}`;
      
      // Use selectedDate instead of new Date() to allow backdating for "Yesterday"
      const entryDate = new Date(selectedDate);
      // Preserve current time for ordering if it's today, otherwise use noon or end of day? 
      // Let's just use current time if today, or set to noon if different day to avoid timezone issues
      if (!isSameDay(entryDate, new Date())) {
        entryDate.setHours(12, 0, 0, 0);
      } else {
        // If today, use current time
        entryDate.setHours(new Date().getHours(), new Date().getMinutes());
      }

      const { error } = await supabase
        .from('diary_entries')
        .insert({
          user_id: user.id,
          title: title,
          content: note || "Tidak ada catatan.",
          theme_color: moodDef?.color || "#ffffff",
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
      <Card className={cn("flex-1 hover:shadow-md transition-all cursor-pointer border-2", isTodayDate ? "border-primary/20" : "border-transparent")} onClick={() => {
        setSelectedDate(date);
        setIsDialogOpen(true);
      }}>
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => setSelectedDate(new Date())}>
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
          <div className="grid grid-cols-7 gap-4 text-center mb-4">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 md:gap-4">
            {/* Empty cells for start of month */}
            {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            
            {days.map((day) => {
              const moods = getMoodsForDate(day);
              const isTodayDate = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "aspect-square rounded-xl border p-1 md:p-2 flex flex-col items-center justify-between relative transition-all hover:shadow-md",
                    isTodayDate ? "ring-2 ring-primary ring-offset-2" : "bg-card"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isTodayDate ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {format(day, "d")}
                  </span>
                  
                  <div className="flex flex-wrap gap-1 justify-center content-end w-full h-full pb-1">
                    {moods.slice(0, 4).map((entry, idx) => (
                      <div
                        key={entry.id}
                        className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                        title={entry.note}
                      />
                    ))}
                    {moods.length > 4 && (
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-muted-foreground/30 flex items-center justify-center text-[6px]">
                        +
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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

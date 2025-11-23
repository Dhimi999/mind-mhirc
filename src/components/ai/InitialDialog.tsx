import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Copy, Check, User, Users, Baby } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface InitialDialogProps {
  open: boolean;
  userId: string;
  currentSubtypes?: string[] | null;
  currentParentId?: string | null;
  onComplete: (nickname: string) => void;
}

type Step = "consent" | "role_check" | "nickname";

export function InitialDialog({ open, userId, currentSubtypes, currentParentId, onComplete }: InitialDialogProps) {
  const [step, setStep] = useState<Step>("consent");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roleSelection, setRoleSelection] = useState<"child" | "parent" | "single" | null>(null);
  const [inputParentId, setInputParentId] = useState("");
  const [parentName, setParentName] = useState<string | null>(null);
  const [isVerifyingParent, setIsVerifyingParent] = useState(false);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [greetingText, setGreetingText] = useState("");
  const fullGreeting = "Saya akan menjadi teman cerita kamu. Agar lebih akrab, kamu ingin dipanggil siapa?";
  
  const { toast } = useToast();

  // Fetch parent name if ID exists on mount
  useEffect(() => {
    if (currentParentId) {
      const fetchParentName = async () => {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", currentParentId)
            .single();
          if (data) setParentName(data.full_name);
        } catch (e) {
          console.error("Error fetching parent name", e);
        }
      };
      fetchParentName();
    }
  }, [currentParentId]);

  // Animation for greeting
  useEffect(() => {
    if (step === "nickname") {
      let i = 0;
      const interval = setInterval(() => {
        setGreetingText(fullGreeting.slice(0, i));
        i++;
        if (i > fullGreeting.length) {
          clearInterval(interval);
          setTimeout(() => setShowNicknameInput(true), 500);
        }
      }, 30);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleConsent = async () => {
    setStep("role_check");
  };

  const verifyParentId = async (pid: string) => {
    if (!pid) return;
    setIsVerifyingParent(true);
    try {
      // Check if parent exists in profiles (or admin_users if needed, but profiles is safer)
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", pid)
        .single();
      
      if (error || !data) {
        setParentName(null);
        toast({
          title: "ID Orang Tua Tidak Ditemukan",
          description: "Pastikan ID yang dimasukkan benar.",
          variant: "destructive"
        });
      } else {
        setParentName(data.full_name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifyingParent(false);
    }
  };

  const handleRoleSubmit = async () => {
    setIsLoading(true);
    try {
      let updates: any = {};

      if (currentSubtypes && currentSubtypes.length > 0 && currentParentId) {
        // Already set, just confirm
        // No updates needed unless we want to re-confirm
      } else if (currentSubtypes?.includes('child') && !currentParentId) {
        // Child missing parent
        if (!inputParentId || !parentName) {
          toast({ title: "Mohon verifikasi ID Orang Tua", variant: "destructive" });
          setIsLoading(false);
          return;
        }
        updates = { parent_id: inputParentId };
      } else if (!currentSubtypes || currentSubtypes.length === 0) {
        // New setup
        if (roleSelection === "child") {
          if (!inputParentId || !parentName) {
            toast({ title: "Mohon verifikasi ID Orang Tua", variant: "destructive" });
            setIsLoading(false);
            return;
          }
          updates = { subtypes: ["child"], parent_id: inputParentId };
        } else if (roleSelection === "parent") {
          updates = { subtypes: ["parent"] }; // Assuming 'parent' is the subtype string
        } else if (roleSelection === "single") {
          updates = { subtypes: ["single"] }; // Or empty? User said "Atur jadi akun tunggal"
        } else {
           toast({ title: "Pilih peran Anda", variant: "destructive" });
           setIsLoading(false);
           return;
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", userId);
        if (error) throw error;
      }

      setStep("nickname");
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Gagal menyimpan peran",
        description: "Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNicknameSubmit = async () => {
    if (!nickname.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          consent_ai: true,
          nick_name: nickname.trim()
        } as any)
        .eq("id", userId);

      if (error) throw error;

      onComplete(nickname.trim());
      toast({
        title: "Selamat Datang!",
        description: `Halo ${nickname}, senang bertemu denganmu.`,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Gagal menyimpan data",
        description: "Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "ID disalin ke clipboard" });
  };

  // Render Role Check Content
  const renderRoleCheck = () => {
    const hasRole = currentSubtypes && currentSubtypes.length > 0;
    const isChild = currentSubtypes?.includes('child');
    const isParent = currentSubtypes?.includes('parent');
    const isSingle = currentSubtypes?.includes('single');

    // Case A: Data already filled (Child with Parent, or Parent, or Single)
    if (hasRole && ((isChild && currentParentId) || isParent || isSingle)) {
      return (
        <div className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg text-center">
            <h3 className="font-semibold mb-2">Apakah data ini sudah sesuai?</h3>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-primary">
                {isChild ? <Baby className="h-5 w-5" /> : isParent ? <Users className="h-5 w-5" /> : <User className="h-5 w-5" />}
                <span className="font-medium capitalize">
                  {isChild ? "Anak" : isParent ? "Orang Tua" : "Individu"}
                </span>
              </div>
              {isChild && (
                <div className="text-sm text-muted-foreground">
                  Terhubung dengan Orang Tua {parentName ? `(${parentName})` : `(ID: ${currentParentId})`}
                </div>
              )}
              {isParent && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">ID Anda:</span>
                  <div className="flex items-center gap-2 bg-background border p-2 rounded text-xs font-mono">
                    {userId}
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(userId)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Button onClick={handleRoleSubmit} className="w-full">Ya, Sesuai</Button>
        </div>
      );
    }

    // Case B: Child but no parent ID
    if (isChild && !currentParentId) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold">Lengkapi Data Orang Tua</h3>
            <p className="text-sm text-muted-foreground">Akun Anda terdaftar sebagai Anak. Mohon masukkan ID Orang Tua Anda.</p>
          </div>
          <div className="space-y-2">
            <Label>ID Orang Tua</Label>
            <div className="flex gap-2">
              <Input 
                value={inputParentId} 
                onChange={(e) => setInputParentId(e.target.value)} 
                placeholder="Masukkan ID..."
              />
              <Button variant="outline" onClick={() => verifyParentId(inputParentId)} disabled={isVerifyingParent}>
                {isVerifyingParent ? "..." : "Cek"}
              </Button>
            </div>
            {parentName && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                <Check className="h-4 w-4" />
                <span>Orang Tua: {parentName}</span>
              </div>
            )}
          </div>
          <Button onClick={handleRoleSubmit} className="w-full" disabled={!parentName}>Simpan & Lanjutkan</Button>
        </div>
      );
    }

    // Case C: Empty subtypes (New Setup)
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="font-semibold text-lg">Atur Peran Anda</h3>
          <p className="text-sm text-muted-foreground">Pilih peran yang sesuai untuk pengalaman yang lebih baik.</p>
        </div>

        <RadioGroup value={roleSelection || ""} onValueChange={(v: any) => setRoleSelection(v)} className="grid grid-cols-1 gap-4">
          <div>
            <RadioGroupItem value="child" id="child" className="peer sr-only" />
            <Label
              htmlFor="child"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Baby className="mb-2 h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Anak</div>
                <div className="text-xs text-muted-foreground">Saya butuh bimbingan orang tua</div>
              </div>
            </Label>
          </div>
          
          <div>
            <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
            <Label
              htmlFor="parent"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <Users className="mb-2 h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Orang Tua</div>
                <div className="text-xs text-muted-foreground">Saya ingin memantau anak saya</div>
              </div>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="single" id="single" className="peer sr-only" />
            <Label
              htmlFor="single"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
            >
              <User className="mb-2 h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Individu</div>
                <div className="text-xs text-muted-foreground">Akun personal tanpa tautan</div>
              </div>
            </Label>
          </div>
        </RadioGroup>

        {roleSelection === "child" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
            <Label>Masukkan ID Orang Tua</Label>
            <div className="flex gap-2">
              <Input 
                value={inputParentId} 
                onChange={(e) => setInputParentId(e.target.value)} 
                placeholder="ID Orang Tua..."
              />
              <Button variant="outline" onClick={() => verifyParentId(inputParentId)} disabled={isVerifyingParent}>
                Cek
              </Button>
            </div>
            {parentName && (
              <div className="text-sm text-green-600">Ditemukan: {parentName}</div>
            )}
          </div>
        )}

        {roleSelection === "parent" && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 bg-muted p-3 rounded text-center">
            <p className="text-sm font-medium">ID Anda:</p>
            <div className="flex items-center justify-center gap-2 font-mono text-xs bg-background p-2 rounded border">
              {userId}
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(userId)}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Bagikan ID ini ke akun Anak untuk ditautkan.</p>
          </div>
        )}

        <Button 
          onClick={handleRoleSubmit} 
          className="w-full" 
          disabled={!roleSelection || (roleSelection === "child" && !parentName) || isLoading}
        >
          Lanjutkan
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        {step === "consent" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Bot className="h-6 w-6 text-primary" />
                Selamat Datang di Teman AI
              </DialogTitle>
              <DialogDescription>
                Sebelum kita mulai, mohon baca dan setujui ketentuan berikut.
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-muted/30 text-sm text-muted-foreground">
              <h4 className="font-semibold text-foreground mb-2">Informed Consent (Persetujuan Pengguna)</h4>
              <p className="mb-4">
                Dengan menggunakan fitur Teman AI, Anda menyetujui hal-hal berikut:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  <strong>Pengumpulan Data:</strong> Percakapan Anda akan diproses oleh sistem AI untuk memberikan respons yang relevan. Kami menjaga kerahasiaan data Anda, namun hindari membagikan informasi sensitif seperti nomor kartu kredit atau password.
                </li>
                <li>
                  <strong>Bukan Pengganti Profesional:</strong> Teman AI adalah pendamping untuk dukungan emosional ringan dan edukasi. Fitur ini <strong>bukan</strong> pengganti konsultasi dengan psikolog atau psikiater profesional.
                </li>
                <li>
                  <strong>Keterbatasan AI:</strong> AI mungkin sesekali memberikan informasi yang kurang akurat. Gunakan penilaian Anda sendiri dalam mengambil keputusan penting.
                </li>
                <li>
                  <strong>Keamanan:</strong> Jika percakapan mengindikasikan risiko bahaya bagi diri sendiri atau orang lain, sistem mungkin akan menyarankan bantuan profesional atau kontak darurat.
                </li>
              </ul>
              <p>
                Dengan menekan tombol "Saya Setuju", Anda menyatakan telah membaca, memahami, dan menyetujui ketentuan di atas.
              </p>
            </ScrollArea>

            <DialogFooter className="mt-4">
              <Button onClick={handleConsent} className="w-full sm:w-auto">
                Saya Setuju & Lanjutkan
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "role_check" && (
          <>
             <DialogHeader>
              <DialogTitle className="text-xl text-center">Verifikasi Peran</DialogTitle>
            </DialogHeader>
            {renderRoleCheck()}
          </>
        )}

        {step === "nickname" && (
          <>
            <DialogHeader>
              <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <DialogTitle className="text-center text-xl font-bold">
                Halo! Saya Eva.
              </DialogTitle>
              <DialogDescription className="text-center min-h-[3rem] flex items-center justify-center">
                {greetingText}
              </DialogDescription>
            </DialogHeader>

            <div className={`py-6 transition-all duration-500 ${showNicknameInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <Input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Masukkan nama panggilanmu..."
                className="text-center text-lg h-12"
                autoFocus={showNicknameInput}
                onKeyDown={(e) => e.key === "Enter" && handleNicknameSubmit()}
              />
            </div>

            <DialogFooter className={`transition-opacity duration-500 ${showNicknameInput ? 'opacity-100' : 'opacity-0'}`}>
              <Button 
                onClick={handleNicknameSubmit} 
                disabled={!nickname.trim() || isLoading} 
                className="w-full"
                size="lg"
              >
                {isLoading ? "Menyiapkan..." : "Mulai Mengobrol"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
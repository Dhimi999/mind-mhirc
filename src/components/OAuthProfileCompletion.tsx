
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OAuthProfileData, completeOAuthProfile } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import Button from "./Button";
import { Briefcase, User } from "lucide-react";

interface OAuthProfileCompletionProps {
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

const professions = [
  "Psikolog",
  "Dokter",
  "Psikiater",
  "Konselor",
  "Guru/Pendidik",
  "Pekerja Sosial",
  "Peneliti",
  "Terapis",
  "Lainnya"
];

const OAuthProfileCompletion = ({ email, fullName, avatarUrl }: OAuthProfileCompletionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"general" | "professional">("general");
  const [formData, setFormData] = useState({
    birthdate: "",
    city: "",
    profession: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, profession: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const profileData: OAuthProfileData = {
        birth_date: formData.birthdate,
        city: formData.city,
        profession: accountType === "professional" ? formData.profession : undefined,
        account_type: accountType
      };

      const { success, error } = await completeOAuthProfile(profileData);

      if (success) {
        toast({
          title: "Profil Berhasil Dilengkapi",
          description: "Selamat datang di Mind MHIRC"
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Gagal Melengkapi Profil",
          description: error || "Terjadi kesalahan, silahkan coba lagi",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Profile completion error:", error);
      toast({
        title: "Gagal Melengkapi Profil",
        description: "Terjadi kesalahan, silahkan coba lagi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 md:p-8 rounded-xl shadow-medium bg-card fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Lengkapi Profil Anda</h2>
        <p className="text-muted-foreground mt-2">
          Selamat datang di Mind MHIRC! Silakan lengkapi beberapa informasi tambahan untuk melanjutkan.
        </p>
      </div>

      <div className="flex items-center mb-6 gap-4">
        {avatarUrl && (
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <img 
              src={avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          {email && <p className="text-sm text-muted-foreground">{email}</p>}
          {fullName && <p className="font-medium">{fullName}</p>}
        </div>
      </div>

      <Tabs
        defaultValue="general"
        className="mb-6"
        onValueChange={(value) => setAccountType(value as "general" | "professional")}
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="general" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Umum</span>
          </TabsTrigger>
          <TabsTrigger value="professional" className="flex items-center">
            <Briefcase className="mr-2 h-4 w-4" />
            <span>Professional</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="birthdate">Tanggal Lahir</Label>
          <Input
            id="birthdate"
            type="date"
            required
            value={formData.birthdate}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Kota</Label>
          <Input
            id="city"
            type="text"
            placeholder="Masukkan kota Anda"
            required
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        {accountType === "professional" && (
          <div className="space-y-2">
            <Label htmlFor="profession">Jenis Profesi</Label>
            <Select onValueChange={handleSelectChange} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis profesi" />
              </SelectTrigger>
              <SelectContent>
                {professions.map((profession) => (
                  <SelectItem key={profession} value={profession}>
                    {profession}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Simpan dan Lanjutkan
        </Button>
      </form>
    </div>
  );
};

export default OAuthProfileCompletion;

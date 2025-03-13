
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, UserPlus, Briefcase, User } from "lucide-react";
import Button from "./Button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { signUp, signIn } from "@/services/authService";
import type { SignUpData, SignInData } from "@/services/authService";

interface LoginFormProps {
  isRegister?: boolean;
  onToggleMode?: () => void;
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

const LoginForm = ({ isRegister = false, onToggleMode }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"general" | "professional">("general");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdate: "",
    city: "",
    profession: ""
  });
  const location = useLocation();
  const navigate = useNavigate();

  const toggleShowPassword = () => setShowPassword(!showPassword);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      if (isRegister) {
        // Validasi password dan konfirmasi password
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: "Pendaftaran Gagal",
            description: "Password dan konfirmasi password tidak cocok",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const userData: SignUpData = {
          email: formData.email,
          password: formData.password,
          full_name: formData.name,
          birth_date: formData.birthdate,
          city: formData.city,
          profession: accountType === "professional" ? formData.profession : undefined,
          account_type: accountType,
          forwarding: formData.email
        };

        const { success, error } = await signUp(userData);

        if (error) {
          if (error.toLowerCase().includes("already registered")) {
            toast({
              title: "Pendaftaran Gagal",
              description: "Email sudah terdaftar",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Pendaftaran Gagal",
              description: error || "Terjadi kesalahan, silahkan coba lagi",
              variant: "destructive"
            });
          }
          setIsLoading(false);
          return;
        }

        toast({
          title: "Pendaftaran Berhasil",
          description: "Silakan periksa email Anda untuk konfirmasi akun"
        });
        if (onToggleMode) {
          onToggleMode();
        } else {
          const searchParams = new URLSearchParams(location.search);
          searchParams.delete("register");
          navigate({ pathname: "/login", search: searchParams.toString() });
        }
      } else {
        const loginData: SignInData = {
          email: formData.email,
          password: formData.password
        };

        const { success, error } = await signIn(loginData);

        if (success) {
          toast({
            title: "Login Berhasil",
            description: "Selamat datang kembali di Mind MHIRC"
          });
          navigate("/dashboard");
        } else {
          toast({
            title: "Login Gagal",
            description: error || "Email atau password salah",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: isRegister ? "Pendaftaran Gagal" : "Login Gagal",
        description: "Terjadi kesalahan, silahkan coba lagi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    if (onToggleMode) {
      onToggleMode();
    } else {
      const searchParams = new URLSearchParams(location.search);
      if (isRegister) {
        searchParams.delete("register");
      } else {
        searchParams.set("register", "true");
      }
      navigate({ pathname: "/login", search: searchParams.toString() });
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 md:p-8 rounded-xl shadow-medium bg-card fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">
          {isRegister ? "Buat Akun Baru" : "Masuk ke Akun Anda"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isRegister
            ? "Daftarkan diri Anda untuk akses penuh layanan Mind MHIRC"
            : "Masukkan kredensial Anda untuk mengakses akun Anda"}
        </p>
      </div>

      {isRegister && (
        <Tabs
          defaultValue="general"
          className="mb-6"
          onValueChange={(value) =>
            setAccountType(value as "general" | "professional")
          }
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
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>

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
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="pr-10"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {isRegister && (
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                className="pr-10"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {!isRegister && (
          <div className="flex justify-end">
            <Link
              to="/forget-password-by-email"
              className="text-sm text-primary hover:underline"
            >
              Lupa password?
            </Link>
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          {isRegister ? (
            <>
              <UserPlus className="mr-2 h-4 w-4" /> Daftar
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" /> Masuk
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-muted-foreground text-sm">
          {isRegister ? "Sudah memiliki akun?" : "Belum memiliki akun?"}
          <button
            type="button"
            onClick={toggleForm}
            className="text-primary hover:underline ml-1 font-medium"
          >
            {isRegister ? "Masuk" : "Daftar"}
          </button>
        </p>
      </div>

      <div className="mt-8 pt-6 border-t">
        <p className="text-center text-sm text-muted-foreground mb-4">
          Atau lanjutkan dengan
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            <span className="text-sm font-medium">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;

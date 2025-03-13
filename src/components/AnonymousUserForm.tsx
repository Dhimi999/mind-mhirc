import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export interface AnonymousUserData {
  name: string;
  birthdate: string;
  email: string;
  city: string;
}

interface AnonymousUserFormProps {
  onSubmit: (data: AnonymousUserData) => void;
}

const AnonymousUserForm = ({ onSubmit }: AnonymousUserFormProps) => {
  const [formData, setFormData] = useState<AnonymousUserData>({
    name: "",
    birthdate: "",
    email: "",
    city: ""
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      toast({
        title: "Nama diperlukan",
        description: "Silahkan masukkan nama Anda untuk melanjutkan",
        variant: "destructive"
      });
      return;
    }

    // if (!formData.birthdate.trim() || isNaN(Number(formData.birthdate))) {
    //   toast({
    //     title: "Umur tidak valid",
    //     description: "Silahkan masukkan umur yang valid",
    //     variant: "destructive"
    //   });
    //   return;
    // }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({
        title: "Email tidak valid",
        description: "Silahkan masukkan alamat email yang valid",
        variant: "destructive"
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="Masukkan nama lengkap Anda"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthdate">Tanggal Lahir</Label>
        <Input
          id="birthdate"
          name="birthdate"
          type="date"
          value={formData.birthdate}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-muted-foreground">
          Kami memerlukan tanggal lahir untuk menyesuaikan hasil tes berdasarkan
          umur anda
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="city">Asal Kota</Label>
        <Input
          id="city"
          name="city"
          type="text"
          placeholder="Masukkan asal kota Anda"
          value={formData.city}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <p className="text-xs text-muted-foreground">
          Email Anda tidak akan dipublikasikan dan hanya untuk keperluan
          identifikasi
        </p>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full">
          Mulai Tes
        </Button>
      </div>
    </form>
  );
};

export default AnonymousUserForm;

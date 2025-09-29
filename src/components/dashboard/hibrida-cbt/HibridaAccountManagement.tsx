import React from "react";
import { Users } from "lucide-react";
import Button from "@/components/Button";

const HibridaAccountManagement: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Hibrida Naratif CBT — Manajemen Akun</h1>
      <div className="bg-card shadow-soft rounded-xl p-6">
        <p className="text-muted-foreground mb-4">
          Kelola akun peserta terkait program Hibrida Naratif CBT sesuai peran Anda.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Daftar Peserta</h3>
              <div className="bg-muted p-2 rounded"><Users size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Tinjau ringkas akun dan status peserta.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Lihat Daftar</Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Peran & Akses</h3>
              <div className="bg-muted p-2 rounded"><Users size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Atur peran & izin akses program.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Kelola Akses</Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Preferensi</h3>
              <div className="bg-muted p-2 rounded"><Users size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Atur preferensi portal per peserta.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Atur Preferensi</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HibridaAccountManagement;

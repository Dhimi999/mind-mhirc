import React from "react";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "@/components/Button";

const SpiritualAccountManagement: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Spiritual & Budaya — Manajemen Akun</h1>
      <div className="bg-card shadow-soft rounded-xl p-6">
        <p className="text-muted-foreground mb-4">
          Kelola akun peserta terkait program Spiritual & Budaya sesuai peran Anda. Anda dapat meninjau daftar akun, status, serta melakukan tindakan sesuai izin.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Daftar Peserta</h3>
              <div className="bg-muted p-2 rounded"><Users size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Lihat ringkas akun peserta program dan status aktifnya.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Lihat Daftar</Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Peran & Akses</h3>
              <div className="bg-muted p-2 rounded"><Users size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Atur peran dan hak akses sesuai kebutuhan (opsional).</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Kelola Akses</Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Preferensi Sesi</h3>
              <div className="bg-muted p-2 rounded"><Users size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Setel preferensi perilaku portal per sesi (opsional).</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Atur Preferensi</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpiritualAccountManagement;

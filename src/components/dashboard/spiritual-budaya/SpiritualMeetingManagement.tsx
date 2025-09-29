import React from "react";
import { Calendar } from "lucide-react";
import Button from "@/components/Button";

const SpiritualMeetingManagement: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Spiritual & Budaya — Manajemen Pertemuan</h1>
      <div className="bg-card shadow-soft rounded-xl p-6">
        <p className="text-muted-foreground mb-4">
          Atur jadwal pertemuan daring, link konferensi, dan kehadiran untuk setiap sesi program.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Jadwal Sesi</h3>
              <div className="bg-muted p-2 rounded"><Calendar size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Kelola tanggal, waktu, dan tautan meeting per sesi.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Kelola Jadwal</Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Kehadiran</h3>
              <div className="bg-muted p-2 rounded"><Calendar size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Pantau dan tandai kehadiran peserta.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Buka Kehadiran</Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Integrasi Link</h3>
              <div className="bg-muted p-2 rounded"><Calendar size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Simpan link Google Meet/Zoom untuk tiap pertemuan.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Atur Link</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpiritualMeetingManagement;

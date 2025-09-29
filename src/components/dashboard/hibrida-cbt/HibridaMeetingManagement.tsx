import React from "react";
import { CalendarCheck2 } from "lucide-react";
import Button from "@/components/Button";

const HibridaMeetingManagement: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Hibrida Naratif CBT — Manajemen Pertemuan</h1>
      <div className="bg-card shadow-soft rounded-xl p-6">
        <p className="text-muted-foreground mb-4">
          Kelola jadwal, tautan pertemuan daring, dan catatan sesi untuk program Hibrida Naratif CBT.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Jadwal Sesi</h3>
              <div className="bg-muted p-2 rounded"><CalendarCheck2 size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Atur dan lihat jadwal.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Kelola</Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Tautan Pertemuan</h3>
              <div className="bg-muted p-2 rounded"><CalendarCheck2 size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Tentukan platform dan tautan.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Atur</Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Catatan Sesi</h3>
              <div className="bg-muted p-2 rounded"><CalendarCheck2 size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Simpan notulen dan ringkasan.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Buka</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HibridaMeetingManagement;

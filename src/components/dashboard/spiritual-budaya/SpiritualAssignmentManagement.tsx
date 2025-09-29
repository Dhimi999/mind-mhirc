import React from "react";
import { ClipboardList } from "lucide-react";
import Button from "@/components/Button";

const SpiritualAssignmentManagement: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Spiritual & Budaya — Manajemen Penugasan</h1>
      <div className="bg-card shadow-soft rounded-xl p-6">
        <p className="text-muted-foreground mb-4">
          Kelola penugasan untuk setiap sesi intervensi. Anda dapat meninjau progres, menyesuaikan item penugasan, atau mengekspor data.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Daftar Penugasan</h3>
              <div className="bg-muted p-2 rounded"><ClipboardList size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Lihat rekap penugasan per sesi dan status penyelesaiannya.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Buka</Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Konfigurasi Item</h3>
              <div className="bg-muted p-2 rounded"><ClipboardList size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Atur item/form penugasan untuk setiap sesi.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Kelola</Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Ekspor Data</h3>
              <div className="bg-muted p-2 rounded"><ClipboardList size={16} /></div>
            </div>
            <p className="text-sm text-muted-foreground">Unduh laporan progres penugasan dalam format CSV/Excel.</p>
            <div className="mt-3">
              <Button variant="outline" size="sm">Ekspor</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpiritualAssignmentManagement;

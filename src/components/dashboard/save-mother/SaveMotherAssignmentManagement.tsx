import React from "react";
import { ClipboardList } from "lucide-react";
import Button from "@/components/Button";
import { Link } from "react-router-dom";

const SaveMotherAssignmentManagement: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Save Mother CBT — Manajemen Penugasan
      </h1>
      <div className="bg-card shadow-soft rounded-xl p-6">
        <p className="text-muted-foreground mb-4">
          Kelola penugasan untuk setiap sesi Save Mother CBT.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Daftar Penugasan</h3>
              <div className="bg-muted p-2 rounded">
                <ClipboardList size={16} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Lihat rekap dan status penyelesaian.
            </p>
            <div className="mt-3">
              <Link to="/dashboard/save-mother/assignments/cbt/users">
                <Button variant="outline" size="sm">
                  Buka
                </Button>
              </Link>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Konfigurasi Item</h3>
              <div className="bg-muted p-2 rounded">
                <ClipboardList size={16} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Atur form penugasan per sesi.
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm">
                Kelola
              </Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Ekspor Data</h3>
              <div className="bg-muted p-2 rounded">
                <ClipboardList size={16} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Unduh laporan dalam CSV/Excel.
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm">
                Ekspor
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveMotherAssignmentManagement;

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SessionCardProps {
  session: number;
  title: string;
  status: "available" | "locked";
  submissionCount: number;
  guideDone?: boolean;
  assignmentDone?: boolean;
  onNavigate: () => void;
  showProgressIndicators?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  title,
  status,
  submissionCount,
  guideDone,
  assignmentDone,
  onNavigate,
  showProgressIndicators = false,
}) => {
  return (
    <Card
      className={`group transition-all ${
        status === "available"
          ? "hover:shadow-lg border-amber-200 bg-amber-50/50"
          : "opacity-60 bg-muted/30"
      }`}
    >
      <CardContent className="p-6">
        {/* Row 1: Nomor sesi, judul, submission count, dan status badge */}
        <div className="flex items-start sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg ${
                status === "available" ? "bg-amber-600" : "bg-muted"
              }`}
            >
              {session}
            </div>
            <h3 className="font-semibold text-base sm:text-lg">
              {session === 0 ? 'Pra-Sesi' : `Sesi ${session}`}: {title}
            </h3>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium border border-gray-200">
              <span>📝</span>
              <span>Terkirim: {submissionCount} kali</span>
            </span>
          </div>
          <Badge
            variant="outline"
            className={`flex-shrink-0 ${
              status === "available"
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {status === "available" ? "✅ Tersedia" : "🔒 Terkunci"}
          </Badge>
        </div>

        {/* Row 2: Dua container status + tombol CTA */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {showProgressIndicators && (
            <>
              <div className="flex-1 rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {guideDone !== undefined && assignmentDone !== undefined
                        ? "Pertemuan Daring"
                        : "Materi Inti"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {guideDone !== undefined && assignmentDone !== undefined
                        ? "Sesi sinkron dengan fasilitator"
                        : "Konsep & bacaan utama"}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      guideDone
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {guideDone ? "Selesai" : "Belum"}
                  </Badge>
                </div>
              </div>
              <div className="flex-1 rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Penugasan</p>
                    <p className="text-xs text-muted-foreground">
                      {guideDone !== undefined && assignmentDone !== undefined
                        ? "Latihan terstruktur pasca pertemuan"
                        : "Refleksi & penerapan"}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      assignmentDone
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {assignmentDone ? "Selesai" : "Belum"}
                  </Badge>
                </div>
              </div>
            </>
          )}

          <div className="flex sm:w-[180px] justify-end items-center">
            <Button
              className={status === "available" ? "bg-amber-600 hover:bg-amber-700" : ""}
              variant={status === "available" ? "default" : "secondary"}
              disabled={status !== "available"}
              onClick={() => status === "available" && onNavigate()}
            >
              {status === "available" ? "Buka Sesi" : "Belum Tersedia"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

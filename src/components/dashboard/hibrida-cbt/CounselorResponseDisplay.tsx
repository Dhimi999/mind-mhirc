import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";

interface CounselorResponseProps {
  counselorResponse?: string;
  counselorName?: string;
  respondedAt?: string;
}

export const CounselorResponseDisplay: React.FC<CounselorResponseProps> = ({
  counselorResponse,
  counselorName,
  respondedAt
}) => {
  if (!counselorResponse) {
    return (
      <Card className="border-indigo-100 shadow-sm">
        <CardHeader>
          <CardTitle>Response Konselor</CardTitle>
          <CardDescription>Belum ada response dari konselor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground p-4 bg-gray-50 rounded-lg text-center">
            Response konselor akan muncul di sini setelah konselor mengirimkan tanggapan terhadap penugasan Anda.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50/50 shadow-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-green-800">Response Konselor</CardTitle>
              <CardDescription>
                {counselorName && (
                  <span className="font-medium">Oleh: {counselorName}</span>
                )}
                {respondedAt && (
                  <span className="ml-2 text-xs">
                    • {new Date(respondedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-green-600 text-white">✓ Sudah Dibalas</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-green-200 rounded-lg p-4">
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {counselorResponse}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

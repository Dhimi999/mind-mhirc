import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Headphones, PlayCircle, ExternalLink } from "lucide-react";

interface GuidanceMaterialsProps {
  guidance_text?: string | null;
  guidance_pdf_url?: string | null;
  guidance_audio_url?: string | null;
  guidance_video_url?: string | null;
  guidance_links?: Array<{ title: string; url: string }> | null;
  showTitle?: boolean;
}

export const GuidanceMaterialsDisplay: React.FC<GuidanceMaterialsProps> = ({
  guidance_text,
  guidance_pdf_url,
  guidance_audio_url,
  guidance_video_url,
  guidance_links,
  showTitle = true
}) => {
  const hasAnyMaterial = guidance_text || guidance_pdf_url || guidance_audio_url || guidance_video_url || (guidance_links && guidance_links.length > 0);

  if (!hasAnyMaterial) {
    return null;
  }

  return (
    <Card className="border-indigo-100 shadow-sm">
      {showTitle && (
        <CardHeader>
          <CardTitle>Panduan Penugasan</CardTitle>
          <CardDescription>Materi dan referensi untuk penugasan sesi ini</CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {/* Text Guidance */}
        {guidance_text && (
          <div className="prose prose-sm max-w-none">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{guidance_text}</div>
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        {guidance_pdf_url && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-sm">Dokumen PDF</h4>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <iframe
                src={guidance_pdf_url}
                className="w-full h-[600px]"
                title="Panduan PDF"
              />
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => window.open(guidance_pdf_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Buka di Tab Baru
            </Button>
          </div>
        )}

        {/* Audio Player */}
        {guidance_audio_url && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Headphones className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-sm">Audio Panduan</h4>
            </div>
            <audio controls className="w-full">
              <source src={guidance_audio_url} type="audio/mpeg" />
              Browser Anda tidak mendukung audio player.
            </audio>
          </div>
        )}

        {/* Video (YouTube Iframe) */}
        {guidance_video_url && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PlayCircle className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-sm">Video Panduan</h4>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={guidance_video_url}
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                title="Video Panduan"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* External Links */}
        {guidance_links && guidance_links.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-sm">Tautan Eksternal</h4>
            </div>
            <div className="space-y-2">
              {guidance_links.map((link, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {link.title}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

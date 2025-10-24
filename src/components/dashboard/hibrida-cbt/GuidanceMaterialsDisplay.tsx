import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Headphones, PlayCircle, ExternalLink, Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import PdfInlineViewer from "@/components/common/PdfInlineViewer";

interface GuidanceMaterialsProps {
  guidance_text?: string | null;
  // Accept single URL, JSON array string, newline-separated string, or string[] for backward and forward compatibility
  guidance_pdf_url?: string | string[] | null;
  guidance_audio_url?: string | string[] | null;
  guidance_video_url?: string | string[] | null;
  guidance_links?: Array<{ title: string; url: string; icon?: string }> | null;
  showTitle?: boolean;
}
import { MessageCircle, Globe, Folder, Link2 } from "lucide-react";

export const GuidanceMaterialsDisplay: React.FC<GuidanceMaterialsProps> = ({
  guidance_text,
  guidance_pdf_url,
  guidance_audio_url,
  guidance_video_url,
  guidance_links,
  showTitle = true
}) => {
  const isMobile = useIsMobile();
  // Per-type single selection preview index (null = no preview shown)
  const [selectedPdfIndex, setSelectedPdfIndex] = useState<number | null>(null);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState<number | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  // Normalize possibly multi-valued URL fields to arrays
  const toArray = (val?: string | string[] | null): string[] => {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(Boolean);
    const s = val.trim();
    if (!s) return [];
    // Try JSON array
    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        // noop
        void 0;
      }
    }
    // Fallback: split by newlines
    return s.split(/\r?\n/).map(v => v.trim()).filter(Boolean);
  };

  const pdfUrls = toArray(guidance_pdf_url);
  const audioUrls = toArray(guidance_audio_url);
  const videoUrls = toArray(guidance_video_url);
  // Normalize a variety of YouTube URL formats (watch, youtu.be, shorts, embed) into embeddable URL
  const toYouTubeEmbedUrl = (url: string): string => {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");

      // Helper: parse t or start to seconds
      const parseStartSeconds = (): number | null => {
        const t = u.searchParams.get("t") || u.searchParams.get("start");
        if (!t) return null;
        // supports formats like 90, 90s, 1m30s
        const match = /^((\d+)h)?((\d+)m)?((\d+)(s)?)?$/.exec(t);
        if (match) {
          const hours = match[2] ? parseInt(match[2], 10) : 0;
          const mins = match[4] ? parseInt(match[4], 10) : 0;
          const secs = match[6] ? parseInt(match[6], 10) : 0;
          return hours * 3600 + mins * 60 + secs;
        }
        const asInt = parseInt(t, 10);
        return isNaN(asInt) ? null : asInt;
      };

      let videoId: string | null = null;

      if (host.endsWith("youtu.be")) {
        // e.g., youtu.be/VIDEO_ID
        videoId = u.pathname.split("/").filter(Boolean)[0] || null;
      } else if (host.endsWith("youtube.com")) {
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts[0] === "watch") {
          videoId = u.searchParams.get("v");
        } else if (parts[0] === "embed" && parts[1]) {
          videoId = parts[1];
        } else if (parts[0] === "shorts" && parts[1]) {
          videoId = parts[1];
        }
      }

      if (videoId) {
        const start = parseStartSeconds();
        const startQuery = typeof start === "number" && start > 0 ? `?start=${start}` : "";
        return `https://www.youtube.com/embed/${videoId}${startQuery}`;
      }

      // If it's already an embed or unknown host, return original
      return url;
    } catch (_) {
      return url;
    }
  };

  const inferIconFromUrl = (url: string): string => {
    try {
      const u = new URL(url);
      const h = u.hostname;
      if (/youtu\.be|youtube\.com/.test(h)) return "youtube";
      if (/drive\.google\.com/.test(h)) return "google-drive";
      if (/facebook\.com/.test(h)) return "facebook";
      if (/wa\.me|whatsapp\.com/.test(h)) return "whatsapp";
      return "link";
    } catch {
      return "link";
    }
  };

  const renderLinkIcon = (icon: string | undefined, url: string) => {
    const normalized = icon || inferIconFromUrl(url);
    const cls = "w-4 h-4";
    switch (normalized) {
      case "youtube":
        return <PlayCircle className={cls} />;
      case "google-drive":
        return <Folder className={cls} />;
      case "facebook":
        return <Globe className={cls} />;
      case "whatsapp":
        return <MessageCircle className={cls} />;
      case "link":
        return <Link2 className={cls} />;
      default:
        return <ExternalLink className={cls} />;
    }
  };

  const hasAnyMaterial = guidance_text || pdfUrls.length > 0 || audioUrls.length > 0 || videoUrls.length > 0 || (guidance_links && guidance_links.length > 0);

  return (
    <Card className="border-indigo-100 shadow-sm">
      {showTitle && (
        <CardHeader>
          <CardTitle>Panduan Penugasan</CardTitle>
          <CardDescription>Materi dan referensi untuk penugasan sesi ini</CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {!hasAnyMaterial && (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            Tidak ada/Belum ada Panduan Penugasan untuk Sesi Ini, silahkan mengerjakan sesuai arahan Pertemuan Daring atau Panduan Sesi.
          </div>
        )}
        {/* Text Guidance */}
        {guidance_text && (
          <div className="prose prose-sm max-w-none">
            <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{guidance_text}</div>
            </div>
          </div>
        )}

        {/* PDF Viewer (supports multiple) */}
        {pdfUrls.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-sm">Dokumen PDF</h4>
            </div>
            {pdfUrls.length === 1 ? (
              // Single PDF: show inline preview directly
              <div className="space-y-2">
                {isMobile ? (
                  <PdfInlineViewer fileUrl={pdfUrls[0]} />
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <iframe src={pdfUrls[0]} className="w-full h-[600px]" title="Panduan PDF" />
                  </div>
                )}
                <Button size="sm" variant="outline" onClick={() => window.open(pdfUrls[0], '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-2" /> Buka di Tab Baru
                </Button>
              </div>
            ) : (
              // Multiple PDFs: list with per-item preview toggle
              <div className="space-y-3">
                <div className="space-y-2">
                  {pdfUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Button variant="outline" className="flex-1 justify-between" onClick={() => window.open(url, '_blank')}>
                        <span>Dokumen {idx + 1}</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedPdfIndex(prev => (prev === idx ? null : idx))}
                        aria-pressed={selectedPdfIndex === idx}
                      >
                        {selectedPdfIndex === idx ? (
                          <><EyeOff className="w-4 h-4 mr-1" /> Tutup</>
                        ) : (
                          <><Eye className="w-4 h-4 mr-1" /> Pratinjau</>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                {selectedPdfIndex !== null && pdfUrls[selectedPdfIndex] && (
                  <div className="mt-2">
                    {isMobile ? (
                      <PdfInlineViewer fileUrl={pdfUrls[selectedPdfIndex]} />
                    ) : (
                      <div className="border rounded-lg overflow-hidden">
                        <iframe
                          src={pdfUrls[selectedPdfIndex]}
                          className="w-full h-[600px]"
                          title={`Panduan PDF ${selectedPdfIndex + 1}`}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Audio Player (supports multiple) */}
        {audioUrls.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Headphones className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-sm">Audio Panduan</h4>
            </div>
            {audioUrls.length === 1 ? (
              <audio controls className="w-full">
                <source src={audioUrls[0]} />
                Browser Anda tidak mendukung audio player.
              </audio>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {audioUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Button variant="outline" className="flex-1 justify-between" onClick={() => window.open(url, '_blank')}>
                        <span>Audio {idx + 1}</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedAudioIndex(prev => (prev === idx ? null : idx))}
                        aria-pressed={selectedAudioIndex === idx}
                      >
                        {selectedAudioIndex === idx ? (
                          <><EyeOff className="w-4 h-4 mr-1" /> Tutup</>
                        ) : (
                          <><PlayCircle className="w-4 h-4 mr-1" /> Putar</>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                {selectedAudioIndex !== null && audioUrls[selectedAudioIndex] && (
                  <audio controls className="w-full mt-1">
                    <source src={audioUrls[selectedAudioIndex]} />
                    Browser Anda tidak mendukung audio player.
                  </audio>
                )}
              </div>
            )}
          </div>
        )}

        {/* Video (YouTube Iframe) – supports multiple */}
        {videoUrls.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <PlayCircle className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-sm">Video Panduan</h4>
            </div>
            {videoUrls.length === 1 ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  width="1440"
                  height="810"
                  src={toYouTubeEmbedUrl(videoUrls[0])}
                  title={`Panduan Penugasan - YouTube`}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  frameBorder={0}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  {videoUrls.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Button variant="outline" className="flex-1 justify-between" onClick={() => window.open(url, '_blank')}>
                        <span>Video {idx + 1}</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedVideoIndex(prev => (prev === idx ? null : idx))}
                        aria-pressed={selectedVideoIndex === idx}
                      >
                        {selectedVideoIndex === idx ? (
                          <><EyeOff className="w-4 h-4 mr-1" /> Tutup</>
                        ) : (
                          <><Eye className="w-4 h-4 mr-1" /> Pratinjau</>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
                {selectedVideoIndex !== null && videoUrls[selectedVideoIndex] && (
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      width="1440"
                      height="810"
                      src={toYouTubeEmbedUrl(videoUrls[selectedVideoIndex])}
                      title={`Panduan Penugasan ${selectedVideoIndex + 1} - YouTube`}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      frameBorder={0}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            )}
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
                  className="w-full justify-start whitespace-normal break-words text-left"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  {renderLinkIcon(link.icon, link.url)}
                  <span className="ml-2">{link.title}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

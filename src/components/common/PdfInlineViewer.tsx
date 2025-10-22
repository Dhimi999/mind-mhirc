import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, Download, ChevronLeft, ChevronRight } from "lucide-react";
// Resolve pdf.js worker to a concrete URL at build-time (Vite)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

// Lazy load react-pdf to keep initial bundle small
let Document: any, Page: any, pdfjs: any;
async function ensurePdfLib() {
  if (!Document || !Page || !pdfjs) {
    const mod = await import("react-pdf");
    Document = mod.Document;
    Page = mod.Page;
    pdfjs = mod.pdfjs;
    // Configure worker for pdf.js using resolved URL
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl as string;
    } catch {}
  }
}

type PdfInlineViewerProps = {
  fileUrl: string;
  className?: string;
};

export default function PdfInlineViewer({ fileUrl, className }: PdfInlineViewerProps) {
  const [ready, setReady] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    ensurePdfLib().then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setPageNumber(1);
  }, [fileUrl]);

  const onDocumentLoadSuccess = useCallback((pdf: { numPages: number }) => {
    setNumPages(pdf.numPages);
    setErrorMsg(null);
  }, []);

  const onDocumentLoadError = useCallback((err: any) => {
    console.error("PDF load error", err);
    setErrorMsg("Gagal memuat PDF. Coba buka di tab baru atau periksa koneksi Anda.");
  }, []);

  const canPrev = pageNumber > 1;
  const canNext = pageNumber < numPages;

  const pageControls = useMemo(() => (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <div className="text-sm w-16 text-center">{Math.round(scale * 100)}%</div>
        <Button size="sm" variant="outline" onClick={() => setScale((s) => Math.min(3, s + 0.1))}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => setRotation((r) => (r + 90) % 360)}>
          <RotateCw className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Button size="sm" variant="outline" disabled={!canPrev} onClick={() => setPageNumber((p) => Math.max(1, p - 1))}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-sm min-w-24 text-center">
          Halaman {pageNumber} / {numPages || "-"}
        </div>
        <Button size="sm" variant="outline" disabled={!canNext} onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}>
          <ChevronRight className="w-4 h-4" />
        </Button>
        <div className="w-full sm:w-auto">
          <Button size="sm" variant="secondary" className="w-full" onClick={() => window.open(fileUrl, "_blank")}>
            <Download className="w-4 h-4 mr-2" />
            Unduh
          </Button>
        </div>
      </div>
    </div>
  ), [canNext, canPrev, fileUrl, numPages, pageNumber, scale]);

  return (
    <div className={className}>
      {pageControls}
      <div className="mt-3 border rounded-lg overflow-hidden bg-gray-50">
        {!ready ? (
          <div className="p-6 text-center text-sm text-gray-500">Memuat penampil PDF…</div>
        ) : errorMsg ? (
          <div className="p-6 text-center text-sm text-red-600">{errorMsg}</div>
        ) : (
          <Document
            file={fileUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="p-6 text-center text-sm text-gray-500">Memuat dokumen…</div>}
            error={<div className="p-6 text-center text-sm text-red-600">Gagal memuat dokumen.</div>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation as any}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        )}
      </div>
      {numPages > 1 && <div className="mt-2 text-xs text-gray-500">Geser halaman dengan tombol panah. Gunakan zoom untuk memperbesar.</div>}
    </div>
  );
}

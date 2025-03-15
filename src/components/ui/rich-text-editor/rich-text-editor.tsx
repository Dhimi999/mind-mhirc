import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolbarButtons } from "./toolbar-buttons";
import ImageCropModal from "./image-crop-modal";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Mulai menulis cerita...",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showLinkPopover, setShowLinkPopover] = useState(false);
  // State untuk input gambar (popover) dan modal crop terpisah
  const [showImageInputPopover, setShowImageInputPopover] = useState(false);
  const [showImageCropModal, setShowImageCropModal] = useState(false);

  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  // Inisialisasi konten editor dari prop value
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
      setIsEditorInitialized(true);
    }
  }, []);

  // Tambahkan style khusus ke <head> agar formatting terlihat pada contentEditable
  useEffect(() => {
    if (isEditorInitialized && editorRef.current) {
      const style = document.createElement("style");
      style.innerHTML = `
        [contenteditable] h1 { font-size: 2em; font-weight: bold; margin-top: 0.67em; margin-bottom: 0.67em; }
        [contenteditable] h2 { font-size: 1.5em; font-weight: bold; margin-top: 0.83em; margin-bottom: 0.83em; }
        [contenteditable] h3 { font-size: 1.17em; font-weight: bold; margin-top: 1em; margin-bottom: 1em; }
        [contenteditable] blockquote { margin: 1em 40px; padding-left: 10px; border-left: 4px solid #ddd; color: #666; }
        [contenteditable] ul { display: block; list-style-type: disc; margin-top: 1em; margin-bottom: 1em; padding-left: 40px; }
        [contenteditable] ol { display: block; list-style-type: decimal; margin-top: 1em; margin-bottom: 1em; padding-left: 40px; }
        [contenteditable] li { display: list-item; }
        [contenteditable] img { max-width: 100%; height: auto; }
      `;
      document.head.appendChild(style);
    }
  }, [isEditorInitialized]);

  // Update konten editor jika prop value berubah (selama editor tidak dalam focus)
  useEffect(() => {
    if (
      isEditorInitialized &&
      editorRef.current &&
      !editorRef.current.contains(document.activeElement)
    ) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value, isEditorInitialized]);

  // Simpan selection sebelum membuka popover/modal
  const saveSelection = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        setSelectionRange(selection.getRangeAt(0).cloneRange());
      }
    }
  };

  // Kembalikan selection yang telah disimpan
  const restoreSelection = () => {
    if (selectionRange && window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRange);
      }
    }
  };

  // Eksekusi perintah menggunakan document.execCommand
  const execCommand = (command: string, value: string | null = null) => {
    if (!document.activeElement?.contains(editorRef.current)) {
      editorRef.current?.focus();
      restoreSelection();
    }
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  const handleFormat = (format: string, value: string | null = null) => {
    execCommand(format, value);
  };

  const handleHeading = (level: string) => {
    execCommand("formatBlock", `<${level}>`);
  };

  const handleAlignment = (alignment: string) => {
    if (alignment === "left") execCommand("justifyLeft");
    if (alignment === "center") execCommand("justifyCenter");
    if (alignment === "right") execCommand("justifyRight");
  };

  const handleLink = () => {
    if (linkUrl && linkText) {
      restoreSelection();
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      document.execCommand("insertHTML", false, linkHtml);
      setLinkUrl("");
      setLinkText("");
      setShowLinkPopover(false);
      handleContentChange();
    }
  };

  // Fungsi untuk menyisipkan gambar hasil crop ke dalam editor
  const handleImageInsertion = (croppedImageUrl: string) => {
    restoreSelection();
    const imgAltText = imageAlt || "Image";
    const imgHtml = `<img src="${croppedImageUrl}" alt="${imgAltText}" style="display: block; max-width:100%; border-radius:8px; margin:10px auto;" />`;
    document.execCommand("insertHTML", false, imgHtml);
    setImageUrl("");
    setImageAlt("");
    setShowImageCropModal(false);
    handleContentChange();
    editorRef.current?.focus();
  };

  // Saat tombol image di toolbar ditekan, simpan selection dan tampilkan popover input gambar
  const onImageButtonClick = () => {
    saveSelection();
    setShowImageInputPopover(true);
  };

  // Saat user submit input gambar, tutup popover dan tampilkan modal crop
  const handleImageInputSubmit = () => {
    setShowImageInputPopover(false);
    setShowImageCropModal(true);
  };

  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  return (
    <div className={cn("border rounded-md", className)}>
      <ToolbarButtons
        onFormat={handleFormat}
        onHeading={handleHeading}
        onAlignment={handleAlignment}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        linkText={linkText}
        setLinkText={setLinkText}
        imageUrl={imageUrl}
        setImageUrl={setImageUrl}
        imageAlt={imageAlt}
        setImageAlt={setImageAlt}
        showLinkPopover={showLinkPopover}
        setShowLinkPopover={setShowLinkPopover}
        // Gunakan state untuk popover input gambar
        showImagePopover={showImageInputPopover}
        setShowImagePopover={setShowImageInputPopover}
        handleLink={handleLink}
        handleImage={handleImageInsertion}
        onLinkButtonClick={() => {
          saveSelection();
          if (window.getSelection) {
            const selection = window.getSelection();
            if (selection && !selection.isCollapsed) {
              setLinkText(selection.toString());
            }
          }
          setShowLinkPopover(true);
        }}
        onImageButtonClick={onImageButtonClick}
        onImageInputSubmit={handleImageInputSubmit}
      />

      <ScrollArea className="h-[500px]">
        <div
          ref={editorRef}
          className="min-h-[200px] p-4 outline-none"
          contentEditable={true}
          onInput={handleContentChange}
          data-placeholder={placeholder}
          role="textbox"
          onFocus={() => {
            if (editorRef.current && !editorRef.current.innerHTML.trim()) {
              editorRef.current.innerHTML = "";
            }
          }}
          onBlur={handleContentChange}
          style={{ position: "relative" }}
        />
      </ScrollArea>

      {/* Tampilkan modal crop gambar jika state showImageCropModal true */}
      {showImageCropModal && imageUrl && (
        <ImageCropModal
          imageUrl={imageUrl}
          onClose={() => setShowImageCropModal(false)}
          onCrop={handleImageInsertion}
          aspect={16 / 9}
        />
      )}
    </div>
  );
}

export default RichTextEditor;

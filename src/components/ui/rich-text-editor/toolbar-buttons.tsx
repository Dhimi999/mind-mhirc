import React from "react";
import {
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ToolbarButtonsProps {
  onFormat: (format: string, value?: string | null) => void;
  onHeading: (level: string) => void;
  onAlignment: (alignment: string) => void;
  linkUrl: string;
  setLinkUrl: React.Dispatch<React.SetStateAction<string>>;
  linkText: string;
  setLinkText: React.Dispatch<React.SetStateAction<string>>;
  imageUrl: string;
  setImageUrl: React.Dispatch<React.SetStateAction<string>>;
  imageAlt: string;
  setImageAlt: React.Dispatch<React.SetStateAction<string>>;
  showLinkPopover: boolean;
  setShowLinkPopover: React.Dispatch<React.SetStateAction<boolean>>;
  // Untuk popover input gambar
  showImagePopover: boolean;
  setShowImagePopover: React.Dispatch<React.SetStateAction<boolean>>;
  handleLink: () => void;
  // handleImage akan dipanggil setelah proses crop selesai
  handleImage: (croppedImageUrl: string) => void;
  onLinkButtonClick: () => void;
  onImageButtonClick: () => void;
  // Fungsi untuk submit input gambar (tutup popover input dan buka modal crop)
  onImageInputSubmit: () => void;
}

export const ToolbarButtons = ({
  onFormat,
  onHeading,
  onAlignment,
  linkUrl,
  setLinkUrl,
  linkText,
  setLinkText,
  imageUrl,
  setImageUrl,
  imageAlt,
  setImageAlt,
  showLinkPopover,
  setShowLinkPopover,
  showImagePopover,
  setShowImagePopover,
  handleLink,
  handleImage,
  onLinkButtonClick,
  onImageButtonClick,
  onImageInputSubmit,
}: ToolbarButtonsProps) => {
  return (
    <div className="bg-muted p-2 flex flex-wrap gap-1 border-b">
      {/* Formatting Buttons */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("bold")}
        title="Bold"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("italic")}
        title="Italic"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("underline")}
        title="Underline"
      >
        <Underline className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Heading Buttons */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onHeading("h1")}
        title="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onHeading("h2")}
        title="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onHeading("h3")}
        title="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Alignment Buttons */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onAlignment("left")}
        title="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onAlignment("center")}
        title="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onAlignment("right")}
        title="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* List & Quote Buttons */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("insertUnorderedList")}
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("insertOrderedList")}
        title="Numbered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("formatBlock", "blockquote")}
        title="Quote"
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Link Popover */}
      <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onLinkButtonClick}
            title="Add Link"
          >
            <Link className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-2">
            <h4 className="font-medium">Tambah Tautan</h4>
            <div className="space-y-2">
              <Input
                placeholder="Teks tautan"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
              />
              <Input
                placeholder="URL (https://...)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
              <Button
                size="sm"
                className="w-full"
                onClick={handleLink}
                disabled={!linkUrl || !linkText}
              >
                Tambahkan
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Image Popover */}
      <Popover open={showImagePopover} onOpenChange={setShowImagePopover}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onImageButtonClick}
            title="Add Image"
          >
            <Image className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-2">
            <h4 className="font-medium">Tambah Gambar</h4>
            <div className="space-y-2">
              <Input
                placeholder="URL Gambar (https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Input
                placeholder="Alt Text (deskripsi gambar)"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
              <Button
                size="sm"
                className="w-full"
                onClick={onImageInputSubmit}
                disabled={!imageUrl}
              >
                Tambahkan
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Separator orientation="vertical" className="mx-1 h-6" />

      {/* Undo/Redo Buttons */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("undo")}
        title="Undo"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onFormat("redo")}
        title="Redo"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

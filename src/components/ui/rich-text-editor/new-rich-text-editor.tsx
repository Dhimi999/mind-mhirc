
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface RichTextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
}

export function NewRichTextEditor({
  initialValue,
  onChange,
  placeholder = "Mulai menulis cerita...",
  height = "500px",
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [lastSelection, setLastSelection] = useState<Range | null>(null);
  
  // Format tracking
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    heading1: false,
    heading2: false,
    heading3: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    orderedList: false,
    unorderedList: false,
    quote: false,
  });

  // Initialize editor with content
  useEffect(() => {
    if (editorRef.current) {
      // Only set initial HTML if the editor is empty
      if (!editorRef.current.innerHTML || editorRef.current.innerHTML === "<br>") {
        editorRef.current.innerHTML = initialValue || "";
      }
    }
  }, []);

  // Save selection state
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setLastSelection(range.cloneRange());
      return range.cloneRange();
    }
    return null;
  };

  // Restore selection state
  const restoreSelection = () => {
    if (lastSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(lastSelection);
        return true;
      }
    }
    return false;
  };

  // Check current formatting
  const updateActiveFormats = () => {
    if (!document.queryCommandState) return;
    
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      heading1: false, // We'll need custom logic for these
      heading2: false,
      heading3: false,
      alignLeft: document.queryCommandState("justifyLeft"),
      alignCenter: document.queryCommandState("justifyCenter"),
      alignRight: document.queryCommandState("justifyRight"),
      orderedList: document.queryCommandState("insertOrderedList"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      quote: false, // Need custom logic for blockquote
    });
  };

  // Handle content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      updateActiveFormats();
    }
  };

  // Format commands
  const execCommand = (command: string, value: string | boolean = false) => {
    // Focus editor if it's not focused
    if (document.activeElement !== editorRef.current) {
      editorRef.current?.focus();
      restoreSelection();
    }
    
    document.execCommand(command, false, value);
    
    // Update content and save selection
    handleContentChange();
    saveSelection();
    
    // Re-focus editor
    editorRef.current?.focus();
  };

  // Handle toggling basic formatting
  const toggleFormat = (format: string) => {
    execCommand(format);
  };

  // Handle headings
  const applyHeading = (level: string) => {
    execCommand("formatBlock", `<${level}>`);
  };

  // Handle alignment
  const setAlignment = (align: string) => {
    if (align === "left") execCommand("justifyLeft");
    else if (align === "center") execCommand("justifyCenter");
    else if (align === "right") execCommand("justifyRight");
  };

  // Handle link insertion
  const openLinkDialog = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString() || "";
    
    // If text is selected, use it as the link text
    if (selectedText) {
      setLinkText(selectedText);
    } else {
      setLinkText("");
    }
    
    setLinkUrl("");
    saveSelection();
    setLinkDialogOpen(true);
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      editorRef.current?.focus();
      restoreSelection();
      
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      document.execCommand("insertHTML", false, linkHtml);
      
      // Reset states
      setLinkDialogOpen(false);
      setLinkUrl("");
      setLinkText("");
      
      // Update content
      handleContentChange();
      saveSelection();
    }
  };

  // Handle image insertion
  const openImageDialog = () => {
    setImageUrl("");
    setImageAlt("");
    saveSelection();
    setImageDialogOpen(true);
  };

  const insertImage = () => {
    if (imageUrl) {
      editorRef.current?.focus();
      restoreSelection();
      
      const imgAlt = imageAlt || "Image";
      const imgHtml = `<img src="${imageUrl}" alt="${imgAlt}" style="max-width:100%; height:auto; border-radius:8px; margin:10px 0;" />`;
      document.execCommand("insertHTML", false, imgHtml);
      
      // Reset states
      setImageDialogOpen(false);
      setImageUrl("");
      setImageAlt("");
      
      // Update content
      handleContentChange();
      saveSelection();
    }
  };

  // Custom CSS for editor content
  const editorStyles = `
    [contenteditable] h1 { font-size: 2rem; font-weight: bold; margin: 0.67em 0; }
    [contenteditable] h2 { font-size: 1.5rem; font-weight: bold; margin: 0.83em 0; }
    [contenteditable] h3 { font-size: 1.17rem; font-weight: bold; margin: 1em 0; }
    [contenteditable] blockquote { margin: 1em 0; padding-left: 1em; border-left: 4px solid #ddd; color: #666; }
    [contenteditable] ul { display: block; list-style-type: disc; margin: 1em 0; padding-left: 40px; }
    [contenteditable] ol { display: block; list-style-type: decimal; margin: 1em 0; padding-left: 40px; }
    [contenteditable] li { display: list-item; }
    [contenteditable] a { color: #0077cc; text-decoration: underline; }
    [contenteditable] img { max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0; }
    [contenteditable]:empty:before {
      content: attr(data-placeholder);
      color: #aaa;
      font-style: italic;
    }
  `;

  return (
    <div className={cn("border rounded-md", className)}>
      <style>{editorStyles}</style>
      
      {/* Toolbar */}
      <div className="bg-muted p-2 flex flex-wrap gap-1 border-b">
        <Button
          type="button"
          variant={activeFormats.bold ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleFormat("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.italic ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleFormat("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.underline ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleFormat("underline")}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          type="button"
          variant={activeFormats.heading1 ? "default" : "ghost"}
          size="sm"
          onClick={() => applyHeading("h1")}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.heading2 ? "default" : "ghost"}
          size="sm"
          onClick={() => applyHeading("h2")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.heading3 ? "default" : "ghost"}
          size="sm"
          onClick={() => applyHeading("h3")}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          type="button"
          variant={activeFormats.alignLeft ? "default" : "ghost"}
          size="sm"
          onClick={() => setAlignment("left")}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.alignCenter ? "default" : "ghost"}
          size="sm"
          onClick={() => setAlignment("center")}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.alignRight ? "default" : "ghost"}
          size="sm"
          onClick={() => setAlignment("right")}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          type="button"
          variant={activeFormats.unorderedList ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleFormat("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.orderedList ? "default" : "ghost"}
          size="sm"
          onClick={() => toggleFormat("insertOrderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeFormats.quote ? "default" : "ghost"}
          size="sm"
          onClick={() => execCommand("formatBlock", "blockquote")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openLinkDialog}
          title="Add Link"
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={openImageDialog}
          title="Add Image"
        >
          <Image className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("undo")}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("redo")}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Editor Content */}
      <ScrollArea style={{ height }}>
        <div
          ref={editorRef}
          className="p-4 outline-none min-h-[200px]"
          contentEditable={true}
          suppressContentEditableWarning={true}
          onInput={handleContentChange}
          onMouseUp={saveSelection}
          onKeyUp={saveSelection}
          onFocus={() => {
            if (editorRef.current && editorRef.current.innerHTML === "") {
              editorRef.current.innerHTML = "";
            }
          }}
          data-placeholder={placeholder}
        />
      </ScrollArea>
      
      {/* Link Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Tautan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="link-text" className="text-right">
                Teks
              </label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="link-url" className="text-right">
                URL
              </label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              onClick={() => setLinkDialogOpen(false)} 
              variant="outline"
            >
              Batal
            </Button>
            <Button 
              type="button" 
              onClick={insertLink} 
              disabled={!linkUrl || !linkText}
            >
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Gambar</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="image-url" className="text-right">
                URL Gambar
              </label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="image-alt" className="text-right">
                Alt Text
              </label>
              <Input
                id="image-alt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                className="col-span-3"
                placeholder="Deskripsi gambar"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              onClick={() => setImageDialogOpen(false)} 
              variant="outline"
            >
              Batal
            </Button>
            <Button 
              type="button" 
              onClick={insertImage} 
              disabled={!imageUrl}
            >
              Tambahkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NewRichTextEditor;

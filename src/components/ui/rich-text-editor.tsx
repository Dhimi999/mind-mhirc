
import { useState, useRef, useEffect } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface RichTextEditorProps {
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
  const toolbarRef = useRef<HTMLDivElement>(null);
  const floatingToolbarRef = useRef<HTMLDivElement>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  
  // Track formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [currentAlignment, setCurrentAlignment] = useState("left");
  
  // Floating toolbar state
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [floatingToolbarPosition, setFloatingToolbarPosition] = useState({ top: 0, left: 0 });

  // Save selection range for persistent selection
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  // Initialize the editor with the HTML content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, []);

  // Update editor content when value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current !== document.activeElement) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle content changes and update parent
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  // Save selection when user interacts with editor
  const saveSelection = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        setSelectionRange(selection.getRangeAt(0).cloneRange());
        
        // Check if the selection is a range (not a caret)
        if (!selection.isCollapsed) {
          // Show floating toolbar
          showFloatingToolbarAtSelection(selection);
        } else {
          // Hide floating toolbar if there's no selected text
          setShowFloatingToolbar(false);
        }
      }
    }
  };
  
  // Show floating toolbar at selected text
  const showFloatingToolbarAtSelection = (selection: Selection) => {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    if (rect.width > 0 && rect.height > 0 && editorRef.current) {
      const editorRect = editorRef.current.getBoundingClientRect();
      
      // Calculate optimal position for the floating toolbar
      // Position above the selected text
      const toolbarTop = rect.top - editorRect.top - 45; // 40px for toolbar height + 5px gap
      const toolbarLeft = rect.left - editorRect.left + rect.width / 2 - 150; // Center horizontally, adjust based on toolbar width
      
      setFloatingToolbarPosition({
        top: Math.max(0, toolbarTop),
        left: Math.max(0, Math.min(toolbarLeft, editorRect.width - 300)), // Ensure it doesn't go off the screen
      });
      
      setShowFloatingToolbar(true);
    }
  };

  // Restore selection before applying formatting
  const restoreSelection = () => {
    if (selectionRange && window.getSelection && editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRange);
        
        // Scroll the selected range into view
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        if (editorRef.current.scrollHeight > editorRef.current.clientHeight) {
          // Ensure the selection is visible in the editor
          const editorRect = editorRef.current.getBoundingClientRect();
          
          if (rect.top < editorRect.top) {
            editorRef.current.scrollTop -= (editorRect.top - rect.top + 50);
          } else if (rect.bottom > editorRect.bottom) {
            editorRef.current.scrollTop += (rect.bottom - editorRect.bottom + 50);
          }
        }
      }
    }
  };

  // Check current formatting state
  const checkFormattingState = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    
    if (document.queryCommandState('justifyLeft')) setCurrentAlignment("left");
    else if (document.queryCommandState('justifyCenter')) setCurrentAlignment("center");
    else if (document.queryCommandState('justifyRight')) setCurrentAlignment("right");
  };

  // Command functions with selection persistence
  const execCommand = (command: string, value: string | undefined = undefined) => {
    // Focus the editor if it's not already focused
    editorRef.current?.focus();
    
    // Restore the saved selection
    if (selectionRange) {
      restoreSelection();
    }
    
    // Execute the command with proper value type handling
    if (typeof value === 'string') {
      document.execCommand(command, false, value);
    } else {
      document.execCommand(command, false, '');
    }
    
    // Save the new selection
    saveSelection();
    
    // Update parent with new content
    handleContentChange();
    
    // Update formatting state indicators
    checkFormattingState();
  };

  const handleFormat = (format: string) => {
    execCommand(format);
  };

  const handleHeading = (level: string) => {
    execCommand("formatBlock", level);
  };

  const handleAlignment = (alignment: string) => {
    if (alignment === "left") execCommand("justifyLeft");
    if (alignment === "center") execCommand("justifyCenter");
    if (alignment === "right") execCommand("justifyRight");
    setCurrentAlignment(alignment);
  };

  const handleLink = () => {
    if (linkUrl && linkText) {
      restoreSelection();
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
      document.execCommand("insertHTML", false, linkHtml);
      setLinkUrl("");
      setLinkText("");
      setShowLinkDialog(false);
      handleContentChange();
    }
  };

  const handleImage = () => {
    if (imageUrl) {
      restoreSelection();
      const imgAlt = imageAlt || "Image";
      const imgHtml = `<img src="${imageUrl}" alt="${imgAlt}" style="max-width:100%;border-radius:8px;margin:10px 0;" />`;
      document.execCommand("insertHTML", false, imgHtml);
      setImageUrl("");
      setImageAlt("");
      setShowImageDialog(false);
      handleContentChange();
    }
  };

  const handleLinkButtonClick = () => {
    saveSelection();
    // Get selected text for link
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        setLinkText(selection.toString());
      }
    }
    setShowLinkDialog(true);
  };

  const handleImageButtonClick = () => {
    saveSelection();
    setShowImageDialog(true);
  };

  const handleBulletList = () => {
    execCommand("insertUnorderedList");
  };

  const handleNumberedList = () => {
    execCommand("insertOrderedList");
  };

  const handleQuote = () => {
    execCommand("formatBlock", "blockquote");
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    checkFormattingState();
    saveSelection();
  };

  const handleMouseUp = () => {
    checkFormattingState();
    saveSelection();
  };
  
  // Hide floating toolbar when clicking outside the editor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorRef.current && 
        !editorRef.current.contains(event.target as Node) &&
        floatingToolbarRef.current &&
        !floatingToolbarRef.current.contains(event.target as Node)
      ) {
        setShowFloatingToolbar(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={cn("border rounded-md", className)}>
      <div 
        ref={toolbarRef}
        className="bg-muted p-2 flex flex-wrap gap-1 border-b sticky top-0 z-10"
      >
        <Button
          type="button"
          variant={isBold ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFormat("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={isItalic ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFormat("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={isUnderline ? "default" : "ghost"}
          size="sm"
          onClick={() => handleFormat("underline")}
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleHeading("h1")}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleHeading("h2")}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleHeading("h3")}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          type="button"
          variant={currentAlignment === "left" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleAlignment("left")}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={currentAlignment === "center" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleAlignment("center")}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={currentAlignment === "right" ? "default" : "ghost"}
          size="sm"
          onClick={() => handleAlignment("right")}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBulletList}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNumberedList}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleQuote}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        {/* Link Dialog */}
        <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLinkButtonClick}
              title="Add Link"
            >
              <Link className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Tautan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teks Tautan</label>
                <Input
                  placeholder="Teks yang akan ditampilkan"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Tautan</label>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button 
                onClick={handleLink}
                disabled={!linkUrl || !linkText}
              >
                Tambahkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Image Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImageButtonClick}
              title="Add Image"
            >
              <Image className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tambah Gambar</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">URL Gambar</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teks Alternatif (Alt)</label>
                <Input
                  placeholder="Deskripsi gambar"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Batal</Button>
              </DialogClose>
              <Button 
                onClick={handleImage}
                disabled={!imageUrl}
              >
                Tambahkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Separator orientation="vertical" className="mx-1 h-6" />
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => document.execCommand("undo")}
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => document.execCommand("redo")}
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Floating toolbar */}
      {showFloatingToolbar && (
        <div
          ref={floatingToolbarRef}
          className="absolute bg-white border border-input rounded shadow-md p-1 flex flex-wrap gap-1 z-50"
          style={{
            top: `${floatingToolbarPosition.top}px`,
            left: `${floatingToolbarPosition.left}px`,
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("bold")}
            title="Bold"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("italic")}
            title="Italic"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleFormat("underline")}
            title="Underline"
          >
            <Underline className="h-3 w-3" />
          </Button>
          <Separator orientation="vertical" className="mx-0.5 h-5" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleHeading("h1")}
            title="Heading 1"
          >
            <Heading1 className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleHeading("h2")}
            title="Heading 2"
          >
            <Heading2 className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleLinkButtonClick}
            title="Add Link"
          >
            <Link className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      <ScrollArea className="h-full max-h-[500px] relative">
        <div
          ref={editorRef}
          className="min-h-[200px] p-4 outline-none"
          contentEditable={true}
          onInput={handleContentChange}
          onKeyUp={handleKeyUp}
          onMouseUp={handleMouseUp}
          onClick={handleMouseUp} 
          onFocus={() => {
            checkFormattingState();
            saveSelection();
          }}
          data-placeholder={placeholder}
          role="textbox"
          style={{
            position: 'relative',
            minHeight: '200px',
          }}
        />
      </ScrollArea>
      
      <style>
        {`
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            cursor: text;
          }
          
          [contenteditable] {
            overflow-wrap: break-word;
            word-wrap: break-word;
          }
          
          [contenteditable] h1 {
            font-size: 2em;
            font-weight: bold;
            margin-top: 0.67em;
            margin-bottom: 0.67em;
          }
          
          [contenteditable] h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin-top: 0.83em;
            margin-bottom: 0.83em;
          }
          
          [contenteditable] h3 {
            font-size: 1.17em;
            font-weight: bold;
            margin-top: 1em;
            margin-bottom: 1em;
          }
          
          [contenteditable] blockquote {
            margin: 1em 0;
            padding-left: 1em;
            border-left: 4px solid #e5e7eb;
            color: #6b7280;
          }
          
          [contenteditable] ul {
            list-style-type: disc;
            margin: 1em 0;
            padding-left: 2em;
          }
          
          [contenteditable] ol {
            list-style-type: decimal;
            margin: 1em 0;
            padding-left: 2em;
          }
        `}
      </style>
    </div>
  );
}


import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolbarButtons } from "./toolbar-buttons";

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
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  
  // Save selection range for popover usage
  const [selectionRange, setSelectionRange] = useState<Range | null>(null);

  // Initialize the editor with the HTML content
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || "";
      setIsEditorInitialized(true);
    }
  }, []);

  // Apply styles to make formatting visible in the editor
  useEffect(() => {
    if (isEditorInitialized && editorRef.current) {
      const style = document.createElement('style');
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

  // Fix for value updates from props
  useEffect(() => {
    if (isEditorInitialized && editorRef.current && !editorRef.current.contains(document.activeElement)) {
      // Only update innerHTML if the editor doesn't have focus to avoid cursor jumping
      editorRef.current.innerHTML = value || "";
    }
  }, [value, isEditorInitialized]);

  const saveSelection = () => {
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        setSelectionRange(selection.getRangeAt(0).cloneRange());
      }
    }
  };

  const restoreSelection = () => {
    if (selectionRange && window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(selectionRange);
      }
    }
  };

  // Command functions
  const execCommand = (command: string, value: string | null = null) => {
    // Restore selection if we're in a popover
    if (!document.activeElement?.contains(editorRef.current)) {
      editorRef.current?.focus();
      restoreSelection();
    }
    
    document.execCommand(command, false, value);
    
    // Ensure change is registered
    handleContentChange();
    
    // Focus the editor again
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

  const handleImage = () => {
    if (imageUrl) {
      restoreSelection();
      const imgAlt = imageAlt || "Image";
      const imgHtml = `<img src="${imageUrl}" alt="${imgAlt}" style="max-width:100%;border-radius:8px;margin:10px 0;" />`;
      document.execCommand("insertHTML", false, imgHtml);
      setImageUrl("");
      setImageAlt("");
      setShowImagePopover(false);
      handleContentChange();
    }
  };

  const onLinkButtonClick = () => {
    saveSelection();
    // Get selected text for link
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        setLinkText(selection.toString());
      }
    }
    setShowLinkPopover(true);
  };

  const onImageButtonClick = () => {
    saveSelection();
    setShowImagePopover(true);
  };

  // Handle content changes
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
        showImagePopover={showImagePopover}
        setShowImagePopover={setShowImagePopover}
        handleLink={handleLink}
        handleImage={handleImage}
        onLinkButtonClick={onLinkButtonClick}
        onImageButtonClick={onImageButtonClick}
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
            // Make sure contentEditable div has a proper placeholder when empty
            if (editorRef.current && !editorRef.current.innerHTML.trim()) {
              editorRef.current.innerHTML = '';
            }
          }}
          onBlur={handleContentChange}
          style={{ position: 'relative' }}
        />
      </ScrollArea>
    </div>
  );
}

export default RichTextEditor;
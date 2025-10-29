
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading1, Heading2,
  Heading3, Quote, 
} from 'lucide-react';

export interface RichTextEditorRef {
  getContent: () => string;
  setContent: (content: string) => void;
}

interface RichTextEditorProps {
  initialContent?: string;
  className?: string;
  onChange?: (content: string) => void;
  onBlur?: () => void;
  height?: string;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ initialContent = '', className = '', onChange, onBlur, height = '250px' }, ref) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');

    useEffect(() => {
      if (editorRef.current && initialContent) {
        editorRef.current.innerHTML = initialContent;
      }
    }, [initialContent]);

    useImperativeHandle(ref, () => ({
      getContent: () => editorRef.current?.innerHTML || '',
      setContent: (content: string) => {
        if (editorRef.current) {
          editorRef.current.innerHTML = content;
        }
      }
    }));

    const handleContentChange = () => {
      if (onChange && editorRef.current) {
        onChange(editorRef.current.innerHTML);
      }
    };

    // Custom function to execute commands safely across browsers
    const execCommand = (command: string, showUI = false, value: string = '') => {
      document.execCommand(command, showUI, value);
    };

    const formatText = (command: string, value: string = '') => {
      if (editorRef.current) {
        editorRef.current.focus();
        execCommand(command, false, value);
        handleContentChange();
      }
    };

    const formatBlock = (block: string) => {
      if (editorRef.current) {
        editorRef.current.focus();
        execCommand('formatBlock', false, block);
        handleContentChange();
      }
    };

    const insertLink = () => {
      if (editorRef.current && linkUrl) {
        editorRef.current.focus();
        if (window.getSelection()?.toString()) {
          execCommand('createLink', false, linkUrl);
        } else if (linkText) {
          execCommand('insertHTML', false, `<a href="${linkUrl}" target="_blank">${linkText}</a>`);
        }
        setIsLinkDialogOpen(false);
        setLinkUrl('');
        setLinkText('');
        handleContentChange();
      }
    };

    const insertImage = () => {
      if (editorRef.current && imageUrl) {
        editorRef.current.focus();
        execCommand('insertHTML', false, `<img src="${imageUrl}" alt="${imageAlt || 'image'}" style="max-width: 100%; height: auto;" />`);
        setIsImageDialogOpen(false);
        setImageUrl('');
        setImageAlt('');
        handleContentChange();
      }
    };

    return (
      <div className={`rich-text-editor ${className}`}>
        <div className="toolbar flex flex-wrap items-center gap-1 p-2 bg-muted border rounded-t-md">
          <TooltipProvider>
            {/* Text formatting */}
            <div className="flex space-x-1 mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatText('bold')}
                  >
                    <Bold size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatText('italic')}
                  >
                    <Italic size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatText('underline')}
                  >
                    <Underline size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Underline</TooltipContent>
              </Tooltip>
            </div>

            {/* Alignment */}
            <div className="flex space-x-1 mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatText('justifyLeft')}
                  >
                    <AlignLeft size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatText('justifyCenter')}
                  >
                    <AlignCenter size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Center</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatText('justifyRight')}
                  >
                    <AlignRight size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>
            </div>

            {/* Lists */}
            <div className="flex space-x-1 mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatText('insertUnorderedList')}
                  >
                    <List size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bullet List</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatText('insertOrderedList')}
                  >
                    <ListOrdered size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Numbered List</TooltipContent>
              </Tooltip>
            </div>

            {/* Headings */}
            <div className="flex space-x-1 mr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatBlock('h1')}
                  >
                    <Heading1 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 1</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatBlock('h2')}
                  >
                    <Heading2 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 2</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatBlock('h3')}
                  >
                    <Heading3 size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading 3</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => formatBlock('blockquote')}
                  >
                    <Quote size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quote</TooltipContent>
              </Tooltip>
            </div>

            {/* Media */}
            <div className="flex space-x-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsLinkDialogOpen(true)}
                  >
                    <LinkIcon size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Link</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsImageDialogOpen(true)}
                  >
                    <ImageIcon size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Insert Image</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>

        <div
          ref={editorRef}
          contentEditable
          className="p-4 border border-t-0 rounded-b-md min-h-[200px] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          onInput={handleContentChange}
          onBlur={onBlur}
          style={{ height }}
        />

        {/* Link Dialog */}
        {isLinkDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-4 rounded-md w-80">
              <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Text (optional)</label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Link text"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={insertLink}>Insert</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Dialog */}
        {isImageDialogOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-4 rounded-md w-80">
              <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Alt Text</label>
                  <input
                    type="text"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Image description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsImageDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={insertImage}>Insert</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;

import { useState, useEffect } from "react";
import { X, Save, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const themeColors = [
  "#ffffff", "#fff2cc", "#ffe6cc", "#ffcccc", "#ffccf2",
  "#e6ccff", "#ccccff", "#cce6ff", "#ccffff", "#ccffe6",
  "#ccffcc", "#e6ffcc", "#f0f0f0", "#e0e0e0", "#d0d0d0"
];

interface DiaryEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; content: string; theme_color: string; background_image: string }) => void;
  initialData?: {
    title: string;
    content: string;
    theme_color: string;
    background_image: string;
  };
  isEditing?: boolean;
}

export function DiaryEntryForm({ isOpen, onClose, onSave, initialData, isEditing = false }: DiaryEntryFormProps) {
  const [formData, setFormData] = useState(() => 
    initialData || { 
      title: "", 
      content: "", 
      theme_color: "#ffffff",
      background_image: ""
    }
  );
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Reset form when opening for new entry or when initialData changes
  useEffect(() => {
    if (!isEditing && !initialData) {
      setFormData({ 
        title: "", 
        content: "", 
        theme_color: "#ffffff",
        background_image: ""
      });
    } else if (initialData) {
      setFormData(initialData);
    }
  }, [isEditing, initialData, isOpen]);

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card 
        className="w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl border-0"
        style={{ backgroundColor: formData.theme_color }}
      >
        {/* Header */}
        <div 
          className="p-4 border-b"
          style={{ backgroundColor: formData.theme_color }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              {isEditing ? "Edit Catatan" : "Catatan Baru"}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Title Input - Borderless */}
            <div className="space-y-1">
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Judul di sini...."
                className="text-2xl md:text-3xl font-semibold border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Divider Line */}
            <div className="w-full h-px bg-border/80" />

            {/* Content Textarea - Borderless */}
            <div 
              className="rounded-lg p-4 min-h-[300px]"
              style={{ backgroundColor: formData.theme_color }}
            >
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Catatan mulai di sini......"
                className="border-0 bg-transparent placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none text-base leading-relaxed p-0 shadow-none min-h-[280px]"
              />
            </div>

            {/* Theme Color Selection */}
            {showColorPicker && (
              <div className="space-y-3">
                <div className="grid grid-cols-8 gap-2 p-4 bg-muted/30 rounded-lg">
                  {themeColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                        formData.theme_color === color 
                          ? "border-primary ring-2 ring-primary/30" 
                          : "border-muted-foreground/20"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, theme_color: color })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-4 border-t flex justify-between items-center"
          style={{ backgroundColor: formData.theme_color }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="gap-2 md:gap-2"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Tema Warna</span>
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} size="sm" className="md:gap-2">
              <X className="h-4 w-4" />
              <span className="hidden md:inline">Batal</span>
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.title.trim() || !formData.content.trim()}
              size="sm"
              className="gap-2 md:gap-2"
            >
              <Save className="h-4 w-4" />
              <span className="hidden md:inline">{isEditing ? "Perbarui" : "Simpan"} Catatan</span>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
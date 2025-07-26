import { MessageCircle, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface InitialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onContinueLastChat: () => void;
  hasConversations: boolean;
}

export function InitialDialog({
  isOpen,
  onClose,
  onNewChat,
  onContinueLastChat,
  hasConversations
}: InitialDialogProps) {
  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  const handleContinueChat = () => {
    onContinueLastChat();
    onClose();
  };

  if (!hasConversations) {
    // If no conversations exist, automatically create a new one
    if (isOpen) {
      handleNewChat();
    }
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Selamat Datang di Teman AI</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 p-2">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={handleNewChat}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Obrolan Baru</h3>
                  <p className="text-muted-foreground text-sm">
                    Mulai percakapan baru dengan teman AI Anda
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow group"
            onClick={handleContinueChat}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <MessageCircle className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Lanjutkan Obrolan Terakhir</h3>
                  <p className="text-muted-foreground text-sm">
                    Kembali ke percakapan terakhir Anda
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
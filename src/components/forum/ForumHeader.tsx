import { Button } from "@/components/ui/button";
import { Users, User, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ForumUser {
  id: string;
  username: string;
  user_id: string;
}

interface ForumHeaderProps {
  forumUser: ForumUser | null;
  onProfileClick: () => void;
  onNotificationClick: () => void;
  notificationCount?: number;
}

export const ForumHeader = ({ 
  forumUser, 
  onProfileClick, 
  onNotificationClick, 
  notificationCount = 0 
}: ForumHeaderProps) => {
  return (
    <div className="mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 py-4 border-b">
      <div className="space-y-4">
        {/* Mobile-optimized layout */}
        <div className="flex flex-col space-y-3">
          {/* Row 1: Title */}
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
            Forum Mind
          </h1>
          
          {/* Row 2: Action buttons (only show if user exists) */}
          {forumUser && (
            <div className="flex justify-end gap-2">
              {/* Notification Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onNotificationClick}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 99 ? "99+" : notificationCount}
                  </span>
                )}
              </Button>
              
              {/* Profile Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onProfileClick}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profil Forum Saya</span>
              </Button>
            </div>
          )}
          
          {/* Row 3 & 4: Description and user info */}
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm md:text-base">
              Berbagi cerita dan pengalaman secara anonim dengan komunitas
            </p>
            {forumUser && (
              <p className="text-sm text-primary">
                Anda masuk sebagai: <strong>@{forumUser.username}</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
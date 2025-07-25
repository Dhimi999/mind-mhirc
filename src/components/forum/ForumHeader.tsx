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
    <div className="mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Forum Mind
          </h1>
          <p className="text-muted-foreground">
            Berbagi cerita dan pengalaman secara anonim dengan komunitas
          </p>
          {forumUser && (
            <p className="text-sm text-primary mt-2">
              Anda masuk sebagai: <strong>@{forumUser.username}</strong>
            </p>
          )}
        </div>
        
        {forumUser && (
          <div className="flex items-center gap-2">
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
              Profil Forum Saya
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
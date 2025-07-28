// =======================================================================================
// File: src/components/forum/ForumHeader.tsx
// Deskripsi: Komponen header yang berisi judul dan tombol navigasi antar forum.
// =======================================================================================

import { Button } from "@/components/ui/button";
import { Users, User, Bell } from "lucide-react";

type ForumType = "public" | "parent" | "child";

interface ForumUser {
  id: string;
  username: string;
  user_id: string;
  subtypes?: string[];
}

interface ForumHeaderProps {
  forumUser: ForumUser | null;
  activeForum: ForumType;
  onForumChange: (type: ForumType) => void;
  onProfileClick: () => void;
  onNotificationClick: () => void;
  notificationCount?: number;
  isLoadingPosts?: boolean;
}

export const ForumHeader = ({
  forumUser,
  activeForum,
  onForumChange,
  onProfileClick,
  onNotificationClick,
  notificationCount = 0,
  isLoadingPosts = false
}: ForumHeaderProps) => {
  return (
    <div className="mb-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 py-4 border-b">
      <div className="space-y-4">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              Forum Mind
            </h1>
            {forumUser && (
              <div className="flex justify-end gap-2">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onProfileClick}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profil Saya</span>
                </Button>
              </div>
            )}
          </div>
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

        {forumUser && (
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button
              variant={activeForum === "public" ? "default" : "ghost"}
              onClick={() => onForumChange("public")}
              size="sm"
              disabled={isLoadingPosts}
            >
              Forum Umum
            </Button>
            {forumUser.subtypes?.includes("parent") && (
              <Button
                variant={activeForum === "parent" ? "default" : "ghost"}
                onClick={() => onForumChange("parent")}
                size="sm"
                disabled={isLoadingPosts}
              >
                Forum Orang Tua
              </Button>
            )}
            {forumUser.subtypes?.includes("child") && (
              <Button
                variant={activeForum === "child" ? "default" : "ghost"}
                onClick={() => onForumChange("child")}
                size="sm"
                disabled={isLoadingPosts}
              >
                Forum Anak
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

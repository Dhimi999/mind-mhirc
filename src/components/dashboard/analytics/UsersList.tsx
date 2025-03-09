
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";

interface Profile {
  id: string;
  created_at?: string;
  full_name?: string | null;
}

interface UsersListProps {
  users: Profile[];
}

export const UsersList = ({ users }: UsersListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Pengguna Baru Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground pb-2 border-b">
            <div>Nama</div>
            <div>Tanggal Bergabung</div>
            <div>Hari Sejak Bergabung</div>
          </div>
          {users.slice(0, 8).map((user) => (
            <div key={user.id} className="grid grid-cols-3 text-sm items-center">
              <div className="font-medium">{user.full_name || "Pengguna"}</div>
              <div className="text-muted-foreground">
                {user.created_at 
                  ? format(new Date(user.created_at), "d MMMM yyyy", { locale: id }) 
                  : "Tanggal tidak tersedia"
                }
              </div>
              <div>
                {user.created_at 
                  ? `${differenceInDays(new Date(), new Date(user.created_at))} hari`
                  : "-"
                }
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

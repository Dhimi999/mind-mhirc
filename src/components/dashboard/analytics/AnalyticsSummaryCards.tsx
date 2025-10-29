
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Heart, MessageSquare, Users } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AnalyticsSummaryCardsProps {
  totalPosts: number;
  totalNewUsers: number;
  totalLikes: number;
  totalComments: number;
  startDate: Date;
  endDate: Date;
}

export const AnalyticsSummaryCards = ({
  totalPosts,
  totalNewUsers,
  totalLikes,
  totalComments,
  startDate,
  endDate
}: AnalyticsSummaryCardsProps) => {
  const dateRange = `${format(startDate, "d MMMM", { locale: id })} - ${format(endDate, "d MMMM", { locale: id })}`;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Konten Baru</p>
              <h3 className="text-2xl font-bold mt-2">{totalPosts}</h3>
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{dateRange}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pengguna Baru</p>
              <h3 className="text-2xl font-bold mt-2">{totalNewUsers}</h3>
            </div>
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{dateRange}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
              <h3 className="text-2xl font-bold mt-2">{totalLikes}</h3>
            </div>
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <Heart size={20} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{dateRange}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Komentar</p>
              <h3 className="text-2xl font-bold mt-2">{totalComments}</h3>
            </div>
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
              <MessageSquare size={20} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4">{dateRange}</p>
        </CardContent>
      </Card>
    </div>
  );
};

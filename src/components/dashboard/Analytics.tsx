
import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Heart, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Calendar
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, parse, differenceInDays } from "date-fns";
import { id } from "date-fns/locale";
import { AnalyticsSummaryCards } from "./analytics/AnalyticsSummaryCards";
import { RecentActivityList } from "./analytics/RecentActivityList";
import { CategoryDistribution } from "./analytics/CategoryDistribution";
import { ContentPerformanceTable } from "./analytics/ContentPerformanceTable";
import { ActivityChart } from "./analytics/ActivityChart";
import { UsersList } from "./analytics/UsersList";
import { Json } from "@/integrations/supabase/types";

// Type for the data fetched from the database
interface BlogPost {
  id: string;
  title: string;
  published_date: string;
  likes: number | null;
  comments: Json | null;
  category: string;
}

interface Profile {
  id: string;
  created_at: string;
  full_name: string | null;
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate date range for 30 days - useMemo to prevent recalculation
  const { endDate, startDate, startDateString } = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    const startDateString = startDate.toISOString();
    return { endDate, startDate, startDateString };
  }, []);
  
  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch blog posts from the last 30 days
        const { data: postsData, error: postsError } = await supabase
          .from("blog_posts")
          .select("id, title, published_date, likes, comments, category")
          .gte("published_date", startDateString)
          .order("published_date", { ascending: false });
          
        if (postsError) throw postsError;
        
        // Fetch users created in the last 30 days
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("id, created_at, full_name")
          .gte("created_at", startDateString)
          .order("created_at", { ascending: false });
          
        if (usersError) throw usersError;
        
        setBlogPosts(postsData || []);
        setUsers(usersData || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [startDateString]);
  
  // Memoize all derived data to prevent recalculations on render
  const {
    totalPosts,
    totalNewUsers,
    totalLikes,
    totalComments,
    categoryChartData,
    postsChartData,
    likesChartData,
    usersChartData
  } = useMemo(() => {
    // Calculate summary metrics
    const totalPosts = blogPosts.length;
    const totalNewUsers = users.length;
    const totalLikes = blogPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    
    // Calculate total comments safely
    const totalComments = blogPosts.reduce((sum, post) => {
      if (!post.comments) return sum;
      
      if (Array.isArray(post.comments)) {
        return sum + post.comments.length;
      }
      
      if (typeof post.comments === 'string') {
        try {
          const parsedComments = JSON.parse(post.comments);
          return sum + (Array.isArray(parsedComments) ? parsedComments.length : 0);
        } catch {
          return sum;
        }
      }
      
      return sum;
    }, 0);
    
    // Group posts by category for pie chart
    const postsByCategory = blogPosts.reduce((acc, post) => {
      acc[post.category] = (acc[post.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group posts by date for trend chart
    const postsByDate = blogPosts.reduce((acc, post) => {
      const date = format(new Date(post.published_date), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Group likes by date for trend chart
    const likesByDate = blogPosts.reduce((acc, post) => {
      const date = format(new Date(post.published_date), "yyyy-MM-dd");
      acc[date] = (acc[date] || 0) + (post.likes || 0);
      return acc;
    }, {} as Record<string, number>);
    
    // Group users by date for trend chart
    const usersByDate = users.reduce((acc, user) => {
      if (user.created_at) {
        const date = format(new Date(user.created_at), "yyyy-MM-dd");
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    // Generate full date range for charts (last 30 days)
    const dateRange = Array.from({ length: 30 }).map((_, i) => {
      return format(subDays(new Date(), 29 - i), "yyyy-MM-dd");
    });
    
    // Format data for charts
    const postsChartData = dateRange.map(date => ({
      date: format(parse(date, "yyyy-MM-dd", new Date()), "dd MMM", { locale: id }),
      value: postsByDate[date] || 0
    }));
    
    const likesChartData = dateRange.map(date => ({
      date: format(parse(date, "yyyy-MM-dd", new Date()), "dd MMM", { locale: id }),
      value: likesByDate[date] || 0
    }));
    
    const usersChartData = dateRange.map(date => ({
      date: format(parse(date, "yyyy-MM-dd", new Date()), "dd MMM", { locale: id }),
      value: usersByDate[date] || 0
    }));
    
    const categoryChartData = Object.entries(postsByCategory).map(([name, value]) => ({
      name,
      value
    }));

    return {
      totalPosts,
      totalNewUsers,
      totalLikes,
      totalComments,
      categoryChartData,
      postsChartData,
      likesChartData,
      usersChartData
    };
  }, [blogPosts, users]);
  
  // Handle tab change callback
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Statistik & Analitik</h1>
      <p className="text-muted-foreground">
        Data analitik dari 30 hari terakhir ({format(startDate, "d MMMM yyyy", { locale: id })} - {format(endDate, "d MMMM yyyy", { locale: id })})
      </p>
      
      <AnalyticsSummaryCards 
        totalPosts={totalPosts}
        totalNewUsers={totalNewUsers}
        totalLikes={totalLikes}
        totalComments={totalComments}
        startDate={startDate}
        endDate={endDate}
      />
      
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <TrendingUp className="h-4 w-4 mr-2" />
            Aktivitas
          </TabsTrigger>
          <TabsTrigger value="content">
            <FileText className="h-4 w-4 mr-2" />
            Konten
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Pengguna
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <ActivityChart postsChartData={postsChartData} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentActivityList blogPosts={blogPosts} users={users} />
            <CategoryDistribution categoryChartData={categoryChartData} totalPosts={totalPosts} />
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-6">
          <ActivityChart chartData={postsChartData} title="Konten Berdasarkan Waktu" color="blue" />
          <ContentPerformanceTable blogPosts={blogPosts} />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <ActivityChart chartData={usersChartData} title="Pengguna Baru Berdasarkan Waktu" color="green" />
          <UsersList users={users} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;

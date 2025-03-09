
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertCircle, 
  Check, 
  Mail, 
  Eye 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatDistance } from "date-fns";
import { id } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";

type ReportType = "contact" | "help";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface HelpReport {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

const ReportsManagement = () => {
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [helpReports, setHelpReports] = useState<HelpReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("contact");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | HelpReport | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch contact messages
      const { data: contactData, error: contactError } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactError) throw contactError;
      
      // Fetch help reports
      const { data: helpData, error: helpError } = await supabase
        .from('help_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (helpError) throw helpError;
      
      console.log("Contact Messages:", contactData);
      console.log("Help Reports:", helpData);
      
      setContactMessages(contactData || []);
      setHelpReports(helpData || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Gagal memuat data laporan",
        description: "Terjadi kesalahan saat memuat data laporan. Silakan coba lagi nanti.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string, type: ReportType) => {
    const table = type === "contact" ? "contact_messages" : "help_reports";
    
    try {
      // Update the status in the database
      const { error } = await supabase
        .from(table)
        .update({ status: 'read' })
        .eq('id', id);

      if (error) {
        console.error("Supabase update error:", error);
        throw error;
      }
      
      // Update local state to reflect the change
      if (type === "contact") {
        setContactMessages(prevMessages => 
          prevMessages.map(msg => 
            msg.id === id ? { ...msg, status: 'read' } : msg
          )
        );
      } else {
        setHelpReports(prevReports => 
          prevReports.map(report => 
            report.id === id ? { ...report, status: 'read' } : report
          )
        );
      }
      
      // Show success notification
      toast({
        title: "Status diubah",
        description: "Laporan telah ditandai sebagai telah dibaca.",
      });
      
      // Re-fetch data to ensure consistency with database
      fetchData();
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Gagal mengubah status",
        description: "Terjadi kesalahan saat mengubah status laporan. Detail: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      });
    }
  };

  const viewMessage = (message: ContactMessage | HelpReport) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistance(
        new Date(dateString),
        new Date(),
        { addSuffix: true, locale: id }
      );
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'read' ? (
      <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-600 border-green-200">
        <Check size={12} />
        <span>Telah Dibaca</span>
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-600 border-yellow-200">
        <AlertCircle size={12} />
        <span>Belum Dibaca</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="contact">Pesan dari Hubungi Kami</TabsTrigger>
          <TabsTrigger value="help">Laporan Kendala</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Pesan dari Halaman Tentang</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : contactMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p>Belum ada pesan yang dikirim</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pengirim</TableHead>
                        <TableHead>Subjek</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contactMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">
                            <div>{message.name}</div>
                            <div className="text-xs text-muted-foreground">{message.email}</div>
                          </TableCell>
                          <TableCell>{message.subject}</TableCell>
                          <TableCell>{getStatusBadge(message.status)}</TableCell>
                          <TableCell className="text-sm">
                            {formatDate(message.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewMessage(message)}
                              >
                                <Eye size={16} className="mr-1" />
                                Lihat
                              </Button>
                              {message.status !== 'read' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsRead(message.id, "contact")}
                                >
                                  <Check size={16} className="mr-1" />
                                  Tandai Dibaca
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="help" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Laporan Kendala</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : helpReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p>Belum ada laporan kendala yang dikirim</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pengirim</TableHead>
                        <TableHead>Subjek</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {helpReports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell className="font-medium">
                            <div>{report.name}</div>
                            <div className="text-xs text-muted-foreground">{report.email}</div>
                          </TableCell>
                          <TableCell>{report.subject}</TableCell>
                          <TableCell>{getStatusBadge(report.status)}</TableCell>
                          <TableCell className="text-sm">
                            {formatDate(report.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => viewMessage(report)}
                              >
                                <Eye size={16} className="mr-1" />
                                Lihat
                              </Button>
                              {report.status !== 'read' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => markAsRead(report.id, "help")}
                                >
                                  <Check size={16} className="mr-1" />
                                  Tandai Dibaca
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription className="flex justify-between">
              <span>Dari: {selectedMessage?.name} ({selectedMessage?.email})</span>
              <span className="text-muted-foreground text-sm">
                {selectedMessage && formatDate(selectedMessage.created_at)}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/40 p-4 rounded-md mt-2">
            <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
          </div>
          <div className="flex justify-between mt-4">
            <DialogClose asChild>
              <Button variant="outline">Tutup</Button>
            </DialogClose>
            {selectedMessage && selectedMessage.status !== 'read' && (
              <Button 
                onClick={() => {
                  const type = activeTab === "contact" ? "contact" : "help";
                  markAsRead(selectedMessage.id, type);
                  setMessageDialogOpen(false);
                }}
              >
                Tandai Telah Dibaca
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportsManagement;

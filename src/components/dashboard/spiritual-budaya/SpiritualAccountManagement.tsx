import React, { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Clock, UserPlus, Filter, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  id: string;
  user_id: string;
  role: 'reguler' | 'grup-int' | 'grup-cont' | 'super-admin';
  group_assignment: 'A' | 'B' | 'C' | 'Admin' | null;
  enrollment_status: 'pending' | 'approved' | 'rejected';
  enrollment_requested_at: string | null;
  approved_at: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

const SpiritualAccountManagement: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>('');
  const [newGroup, setNewGroup] = useState<string>('');
  const { toast } = useToast();

  // Bulk selection state for pending enrollments
  const [selectedPending, setSelectedPending] = useState<Set<string>>(new Set());
  const [selectAllPending, setSelectAllPending] = useState(false);
  // Bulk approve dialog
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkRole, setBulkRole] = useState<string>('');
  const [bulkGroup, setBulkGroup] = useState<string>('');

  // Filters for approved enrollments
  const [roleFilter, setRoleFilter] = useState<'all' | 'grup-int' | 'grup-cont' | 'super-admin'>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | 'A' | 'B' | 'C' | 'Admin'>('all');
  // Pagination state
  const [pageSize, setPageSize] = useState<25 | 50 | 100>(25);
  const [pendingPage, setPendingPage] = useState(1);
  const [approvedPage, setApprovedPage] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('sb_enrollments' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (enrollmentError) throw enrollmentError;

      if (!enrollmentData || enrollmentData.length === 0) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      const userIds = (enrollmentData as any[]).map((e: any) => e.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, forwarding')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const enrichedEnrollments: Enrollment[] = (enrollmentData as any[]).map((enrollment: any) => ({
        ...enrollment,
        profiles: {
          full_name: profilesData?.find(p => p.id === enrollment.user_id)?.full_name || 'Unknown User',
          email: profilesData?.find(p => p.id === enrollment.user_id)?.forwarding || 'Tidak tersedia',
          avatar_url: profilesData?.find(p => p.id === enrollment.user_id)?.avatar_url || null
        }
      }));

      setEnrollments(enrichedEnrollments);
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: "Gagal Memuat Data",
        description: error.message || "Terjadi kesalahan saat memuat data pendaftaran.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setNewRole(enrollment.role as string);
    setNewGroup((enrollment.group_assignment as string) || '');
    setIsDialogOpen(true);
  };

  const handleReject = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('sb_enrollments' as any)
        .update({ 
          enrollment_status: 'rejected',
          approved_at: new Date().toISOString()
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      toast({ title: "Pendaftaran Ditolak", description: "Pendaftaran berhasil ditolak." });
      fetchEnrollments();
    } catch (error: any) {
      console.error('Error rejecting enrollment:', error);
      toast({ title: "Gagal Menolak", description: error.message || "Terjadi kesalahan saat menolak pendaftaran.", variant: "destructive" });
    }
  };

  const handleSubmitApproval = async () => {
    if (!selectedEnrollment || !newRole) {
      toast({ title: "Data Tidak Lengkap", description: "Silakan pilih role untuk peserta.", variant: "destructive" });
      return;
    }
    const finalGroup = newRole === 'super-admin' ? 'Admin' : newGroup;
    if (!finalGroup && newRole !== 'reguler') {
      toast({ title: "Data Tidak Lengkap", description: "Silakan pilih kelompok untuk peserta.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase
        .from('sb_enrollments' as any)
        .update({ 
          role: newRole as any,
          group_assignment: (finalGroup || null) as any,
          enrollment_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', selectedEnrollment.id);

      if (error) throw error;

      toast({ title: "Pendaftaran Disetujui", description: `Peserta berhasil disetujui sebagai ${newRole} di Grup ${finalGroup || '-'}.` });
      setIsDialogOpen(false);
      setSelectedEnrollment(null);
      fetchEnrollments();
    } catch (error: any) {
      console.error('Error approving enrollment:', error);
      toast({ title: "Gagal Menyetujui", description: error.message || "Terjadi kesalahan saat menyetujui pendaftaran.", variant: "destructive" });
    }
  };

  const pendingEnrollments = enrollments.filter(e => e.enrollment_status === 'pending' && e.enrollment_requested_at);
  const approvedEnrollments = enrollments.filter(e => e.enrollment_status === 'approved');
  const rejectedEnrollments = enrollments.filter(e => e.enrollment_status === 'rejected');

  const filteredApproved = approvedEnrollments.filter(e => {
    const roleOk = roleFilter === 'all' ? true : e.role === roleFilter;
    const groupOk = groupFilter === 'all' ? true : (e.group_assignment === groupFilter);
    return roleOk && groupOk;
  });

  // Pagination helpers
  const paginate = <T,>(arr: T[], page: number, size: number) => {
    const totalPages = Math.max(1, Math.ceil(arr.length / size));
    const current = Math.min(page, totalPages);
    const start = (current - 1) * size;
    const end = start + size;
    return { items: arr.slice(start, end), totalPages, current };
  };
  const pendingPaged = paginate(pendingEnrollments, pendingPage, pageSize);
  const approvedPaged = paginate(filteredApproved, approvedPage, pageSize);
  const rejectedPaged = paginate(rejectedEnrollments, rejectedPage, pageSize);

  const onChangePageSize = (val: string) => {
    const n = Number(val) as 25 | 50 | 100;
    setPageSize(n);
    setPendingPage(1);
    setApprovedPage(1);
    setRejectedPage(1);
  };

  const toggleSelectAllPending = () => {
    if (selectAllPending) {
      setSelectedPending(new Set());
      setSelectAllPending(false);
    } else {
      const allIds = new Set(pendingEnrollments.map(p => p.id));
      setSelectedPending(allIds);
      setSelectAllPending(true);
    }
  };

  const toggleSelectPending = (id: string) => {
    setSelectedPending(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (next.size === pendingEnrollments.length) setSelectAllPending(true);
      else setSelectAllPending(false);
      return next;
    });
  };

  const bulkRejectSelected = async () => {
    const ids = Array.from(selectedPending);
    if (ids.length === 0) return;
    try {
      const { error } = await supabase
        .from('sb_enrollments' as any)
        .update({ enrollment_status: 'rejected', approved_at: new Date().toISOString() })
        .in('id', ids);
      if (error) throw error;
      toast({ title: 'Ditolak', description: `${ids.length} pendaftaran ditolak.` });
      setSelectedPending(new Set());
      setSelectAllPending(false);
      fetchEnrollments();
    } catch (error: any) {
      console.error('Error bulk rejecting:', error);
      toast({ title: 'Gagal Menolak', description: error.message || 'Terjadi kesalahan saat menolak massal.', variant: 'destructive' });
    }
  };

  const openBulkApprove = () => {
    if (selectedPending.size === 0) return;
    setBulkRole('');
    setBulkGroup('');
    setIsBulkDialogOpen(true);
  };

  const submitBulkApprove = async () => {
    const ids = Array.from(selectedPending);
    if (ids.length === 0) return;
    if (!bulkRole) {
      toast({ title: 'Data Tidak Lengkap', description: 'Pilih role untuk persetujuan massal.', variant: 'destructive' });
      return;
    }
    const finalGroup = bulkRole === 'super-admin' ? 'Admin' : bulkGroup || null;
    if (!finalGroup && bulkRole !== 'reguler' && bulkRole !== 'super-admin') {
      toast({ title: 'Data Tidak Lengkap', description: 'Pilih grup untuk persetujuan massal.', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase
        .from('sb_enrollments' as any)
        .update({
          role: bulkRole as any,
          group_assignment: finalGroup as any,
          enrollment_status: 'approved',
          approved_at: new Date().toISOString()
        })
        .in('id', ids);
      if (error) throw error;
      toast({ title: 'Disetujui', description: `${ids.length} pendaftaran disetujui.` });
      setIsBulkDialogOpen(false);
      setSelectedPending(new Set());
      setSelectAllPending(false);
      fetchEnrollments();
    } catch (error: any) {
      console.error('Error bulk approving:', error);
      toast({ title: 'Gagal Menyetujui', description: error.message || 'Terjadi kesalahan saat persetujuan massal.', variant: 'destructive' });
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      'reguler': 'bg-gray-100 text-gray-800 border-gray-300',
      'grup-int': 'bg-blue-100 text-blue-800 border-blue-300',
      'grup-cont': 'bg-purple-100 text-purple-800 border-purple-300',
      'super-admin': 'bg-red-100 text-red-800 border-red-300'
    };
    const roleLabels: Record<string, string> = {
      'reguler': 'Reguler',
      'grup-int': 'Intervensi (SB)',
      'grup-cont': 'Psikoedukasi (SB)',
      'super-admin': 'Super Admin'
    };
    return <Badge className={roleColors[role] || 'bg-gray-100 text-gray-800'}>{roleLabels[role] || role}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Spiritual & Budaya — Manajemen Akun</h1>
          <p className="text-muted-foreground mt-1">Kelola pendaftaran dan peserta program Spiritual & Budaya</p>
        </div>
        <Button variant="outline" onClick={fetchEnrollments}>
          <Users className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Permintaan ({pendingEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Peserta Aktif ({approvedEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Ditolak ({rejectedEnrollments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between border rounded-lg p-3 gap-3">
            <div className="flex items-center gap-3">
              <button onClick={toggleSelectAllPending} className="flex items-center gap-2 text-sm">
                {selectAllPending ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                <span>Pilih semua ({pendingEnrollments.length})</span>
              </button>
              <span className="text-sm text-muted-foreground">Terpilih: {selectedPending.size}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Tampil:</span>
                <Select value={String(pageSize)} onValueChange={onChangePageSize}>
                  <SelectTrigger className="h-8 w-[100px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={bulkRejectSelected} disabled={selectedPending.size === 0}>
                <XCircle className="mr-2 h-4 w-4" /> Decline Selected
              </Button>
              <Button size="sm" onClick={openBulkApprove} disabled={selectedPending.size === 0}>
                <CheckCircle className="mr-2 h-4 w-4" /> Approve Selected
              </Button>
            </div>
          </div>

          {pendingEnrollments.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada permintaan pendaftaran yang menunggu.</p>
              </CardContent>
            </Card>
          ) : (
            pendingPaged.items.map(enrollment => (
              <Card key={enrollment.id}>
                <CardHeader className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedPending.has(enrollment.id)}
                        onCheckedChange={() => toggleSelectPending(enrollment.id)}
                        aria-label="Pilih"
                      />
                      {enrollment.profiles?.avatar_url ? (
                        <img src={enrollment.profiles.avatar_url} alt={enrollment.profiles?.full_name || 'Avatar'} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                          {enrollment.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{enrollment.profiles?.full_name}</CardTitle>
                        <CardDescription>{enrollment.profiles?.email}</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">Menunggu</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>Tanggal Pendaftaran: {enrollment.enrollment_requested_at ? new Date(enrollment.enrollment_requested_at).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleReject(enrollment.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Tolak
                      </Button>
                      <Button size="sm" onClick={() => handleApprove(enrollment)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Setujui
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {pendingEnrollments.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Halaman {pendingPaged.current} dari {pendingPaged.totalPages}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={pendingPaged.current <= 1} onClick={() => setPendingPage(p => Math.max(1, p - 1))}>Sebelumnya</Button>
                <Button variant="outline" size="sm" disabled={pendingPaged.current >= pendingPaged.totalPages} onClick={() => setPendingPage(p => Math.min(pendingPaged.totalPages, p + 1))}>Berikutnya</Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Select value={roleFilter} onValueChange={(v)=> setRoleFilter(v as any)}>
                <SelectTrigger className="h-8 w-[180px]"><SelectValue placeholder="Semua role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="grup-int">Intervensi (SB)</SelectItem>
                  <SelectItem value="grup-cont">Psikoedukasi (SB)</SelectItem>
                  <SelectItem value="super-admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Grup:</span>
              <Select value={groupFilter} onValueChange={(v)=> setGroupFilter(v as any)}>
                <SelectTrigger className="h-8 w-[160px]"><SelectValue placeholder="Semua grup" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Tampil:</span>
              <Select value={String(pageSize)} onValueChange={onChangePageSize}>
                <SelectTrigger className="h-8 w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredApproved.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada data sesuai filter.</p>
              </CardContent>
            </Card>
          ) : (
            approvedPaged.items.map(enrollment => (
              <Card key={enrollment.id}>
                <CardHeader className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {enrollment.profiles?.avatar_url ? (
                        <img src={enrollment.profiles.avatar_url} alt={enrollment.profiles?.full_name || 'Avatar'} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-semibold">
                          {enrollment.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{enrollment.profiles?.full_name}</CardTitle>
                        <CardDescription>{enrollment.profiles?.email}</CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {getRoleBadge(enrollment.role)}
                      {enrollment.group_assignment && (
                        <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                          Grup {enrollment.group_assignment}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>Disetujui: {enrollment.approved_at ? new Date(enrollment.approved_at).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleApprove(enrollment)}>
                      Edit Role/Grup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {filteredApproved.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Halaman {approvedPaged.current} dari {approvedPaged.totalPages}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={approvedPaged.current <= 1} onClick={() => setApprovedPage(p => Math.max(1, p - 1))}>Sebelumnya</Button>
                <Button variant="outline" size="sm" disabled={approvedPaged.current >= approvedPaged.totalPages} onClick={() => setApprovedPage(p => Math.min(approvedPaged.totalPages, p + 1))}>Berikutnya</Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-3">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Tampil:</span>
              <Select value={String(pageSize)} onValueChange={onChangePageSize}>
                <SelectTrigger className="h-8 w-[100px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {rejectedEnrollments.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Tidak ada pendaftaran yang ditolak.</p>
              </CardContent>
            </Card>
          ) : (
            rejectedPaged.items.map(enrollment => (
              <Card key={enrollment.id}>
                <CardHeader className="py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {enrollment.profiles?.avatar_url ? (
                        <img src={enrollment.profiles.avatar_url} alt={enrollment.profiles?.full_name || 'Avatar'} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-rose-400 flex items-center justify-center text-white font-semibold">
                          {enrollment.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{enrollment.profiles?.full_name}</CardTitle>
                        <CardDescription>{enrollment.profiles?.email}</CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-red-100 text-red-800 border-red-300">Ditolak</Badge>
                  </div>
                </CardHeader>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      <p>Ditolak: {enrollment.approved_at ? new Date(enrollment.approved_at).toLocaleDateString('id-ID') : '-'}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleApprove(enrollment)}>
                      Review Ulang
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          {rejectedEnrollments.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Halaman {rejectedPaged.current} dari {rejectedPaged.totalPages}</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={rejectedPaged.current <= 1} onClick={() => setRejectedPage(p => Math.max(1, p - 1))}>Sebelumnya</Button>
                <Button variant="outline" size="sm" disabled={rejectedPaged.current >= rejectedPaged.totalPages} onClick={() => setRejectedPage(p => Math.min(rejectedPaged.totalPages, p + 1))}>Berikutnya</Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setujui Pendaftaran</DialogTitle>
            <DialogDescription>
              Pilih role dan kelompok untuk {selectedEnrollment?.profiles?.full_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role Program</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grup-int">Intervensi (SB)</SelectItem>
                  <SelectItem value="grup-cont">Psikoedukasi (SB)</SelectItem>
                  <SelectItem value="super-admin">Super Admin (Semua Akses)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newRole !== 'super-admin' && newRole !== 'reguler' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Kelompok</label>
                <Select value={newGroup} onValueChange={setNewGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelompok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grup A</SelectItem>
                    <SelectItem value="B">Grup B</SelectItem>
                    <SelectItem value="C">Grup C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {newRole === 'super-admin' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  Super Admin akan otomatis masuk ke Grup Admin dan memiliki akses ke semua tab intervensi.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmitApproval}>
              Setujui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setujui {selectedPending.size} Pendaftaran</DialogTitle>
            <DialogDescription>
              Pilih role dan kelompok untuk semua peserta terpilih.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role Program</label>
              <Select value={bulkRole} onValueChange={setBulkRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grup-int">Intervensi (SB)</SelectItem>
                  <SelectItem value="grup-cont">Psikoedukasi (SB)</SelectItem>
                  <SelectItem value="super-admin">Super Admin (Semua Akses)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {bulkRole !== 'super-admin' && bulkRole !== 'reguler' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Kelompok</label>
                <Select value={bulkGroup} onValueChange={setBulkGroup}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelompok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Grup A</SelectItem>
                    <SelectItem value="B">Grup B</SelectItem>
                    <SelectItem value="C">Grup C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {bulkRole === 'super-admin' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  Super Admin akan otomatis masuk ke Grup Admin dan memiliki akses ke semua tab intervensi.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={submitBulkApprove}>
              Setujui Semua
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpiritualAccountManagement;

# 📋 Implementasi UI Terstruktur untuk Multiple Submission

## 🎯 Tujuan
Mengubah UI submission agar lebih terstruktur dengan:
1. **Default View**: Menampilkan jawaban terakhir (locked/disabled)
2. **Tombol "Buat Jawaban Baru"**: Mengosongkan form dan enable untuk input baru  
3. **Tombol "Riwayat Jawaban"**: Menampilkan daftar semua jawaban dengan detail

## ⚠️ Status Saat Ini

File `SpiritualIntervensiUnified.tsx` mengalami syntax error karena duplikasi Card components.  
Saya akan memberikan panduan manual untuk implementasi UI yang bersih.

## 🔧 Langkah Implementasi

### STEP 1: Update State Variables

Tambahkan state baru di component (setelah state `showHistory`):

```typescript
const [isCreatingNew, setIsCreatingNew] = useState(false);
const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
```

### STEP 2: Update useEffect Load History

Ganti useEffect yang load submission history dengan logic baru:

```typescript
// Load submission history
useEffect(() => {
  if (!fetchSubmissionHistory) return;
  
  const loadHistory = async () => {
    const history = await fetchSubmissionHistory();
    console.log('Submission history:', history);
    setSubmissionHistory(history);
    
    // Set initial state: if has submissions, show latest (locked), else create new mode
    if (history && history.length > 0) {
      setIsCreatingNew(false);
      // Load latest submission into form (will be disabled)
      const latest = history[0]; // Already sorted by submitted_at DESC
      if (latest.answers && typeof latest.answers === 'object') {
        setAssignment({ ...latest.answers });
      }
    } else {
      // No submission yet, enable create new mode
      setIsCreatingNew(true);
      if (config?.defaultAssignment) {
        setAssignment({ ...config.defaultAssignment });
      }
    }
  };
  
  loadHistory();
}, [fetchSubmissionHistory, progress?.assignment_done, config]);
```

### STEP 3: Hapus useEffect Load Assignment Lama

**HAPUS** seluruh useEffect yang menggunakan `loadAssignmentIntervensi()` atau `loadAssignment()`. Kita tidak lagi load dari tabel assignments, tapi dari submission history.

```typescript
// ❌ HAPUS KODE INI:
useEffect(() => {
  if (!config || !loadAssignmentIntervensi) return;
  
  (async () => {
    const remote = await loadAssignmentIntervensi();
    // ... dst
  })();
}, [config, loadAssignmentIntervensi]);
```

### STEP 4: Update handleSubmitAssignment

Ganti handler submit dengan logic baru yang reload history setelah submit:

```typescript
const handleSubmitAssignment = useCallback(async () => {
  if (!assignmentValid || isSubmitting) return;

  setIsSubmitting(true);
  try {
    const result = await updateProgress({ 
      assignment_data: assignment, 
      assignment_done: true 
    });

    if (result?.success) {
      toast({
        title: "Jawaban Berhasil Dikirim",
        description: `Jawaban #${submissionHistory.length + 1} telah tersimpan.`,
        variant: "default",
      });
      
      // Exit create new mode and reload history
      setIsCreatingNew(false);
      
      // Reload history akan automatically show latest submission (locked)
      const history = await fetchSubmissionHistory();
      setSubmissionHistory(history);
      if (history && history.length > 0) {
        const latest = history[0];
        if (latest.answers && typeof latest.answers === 'object') {
          setAssignment({ ...latest.answers });
        }
      }
    } else {
      throw new Error(result?.error?.message || "Gagal mengirim jawaban");
    }
  } catch (error) {
    console.error("Submit assignment error:", error);
    toast({
      title: "Gagal Mengirim Jawaban",
      description: error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
}, [assignmentValid, isSubmitting, assignment, updateProgress, toast, submissionHistory, fetchSubmissionHistory]);
```

### STEP 5: Tambahkan Handler Baru

Tambahkan 3 handler baru setelah `handleSubmitAssignment`:

```typescript
const handleCreateNewAnswer = useCallback(() => {
  setIsCreatingNew(true);
  setAssignment(config?.defaultAssignment || {});
  setShowHistory(false);
  setSelectedHistoryItem(null);
  toast({
    title: "Mode Buat Jawaban Baru",
    description: "Form telah dikosongkan. Silakan isi jawaban baru Anda.",
    variant: "default",
  });
}, [config, toast]);

const handleViewHistory = useCallback(() => {
  setShowHistory(!showHistory);
  setSelectedHistoryItem(null);
}, [showHistory]);

const handleViewHistoryDetail = useCallback((item: any) => {
  setSelectedHistoryItem(item);
  setShowHistory(false);
}, []);
```

### STEP 6: Update UI Card Penugasan

**GANTI** seluruh Card Penugasan dengan struktur baru ini:

```tsx
{/* Card Penugasan */}
<Card className="border border-gray-200 rounded-lg overflow-hidden bg-white">
  <div className="p-5 bg-orange-600 text-white border-b border-orange-700">
    <div className="flex items-center gap-3">
      <span className="text-2xl">✍️</span>
      <div>
        <h3 className="text-lg font-semibold">Penugasan Sesi {sessionNumber}</h3>
        <p className="text-xs text-orange-100 mt-0.5">
          {isCreatingNew ? "Buat Jawaban Baru" : selectedHistoryItem ? "Riwayat Jawaban" : "Jawaban Terakhir"}
        </p>
      </div>
    </div>
  </div>
  
  <div className="p-6">
    {/* Action buttons - always visible if has submissions */}
    {submissionHistory.length > 0 && !isCreatingNew && !selectedHistoryItem && (
      <div className="mb-6 flex gap-3">
        <Button
          onClick={handleCreateNewAnswer}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          ➕ Buat Jawaban Baru
        </Button>
        <Button
          variant="outline"
          onClick={handleViewHistory}
          className="flex-1 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-lg transition-colors"
        >
          📋 Riwayat Jawaban
        </Button>
      </div>
    )}

    {/* Back button when in create new or viewing history detail */}
    {(isCreatingNew || selectedHistoryItem) && (
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => {
            setIsCreatingNew(false);
            setSelectedHistoryItem(null);
            // Reload latest submission
            if (submissionHistory.length > 0) {
              const latest = submissionHistory[0];
              if (latest.answers) {
                setAssignment({ ...latest.answers });
              }
            }
          }}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          ← Kembali ke Jawaban Terakhir
        </Button>
      </div>
    )}

    {/* History List View */}
    {showHistory && !selectedHistoryItem && (
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">📚 Riwayat Jawaban ({submissionHistory.length})</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕ Tutup
          </Button>
        </div>
        {submissionHistory.map((item, idx) => (
          <div key={item.id} className="p-4 border-2 border-gray-200 rounded-lg bg-gray-50 hover:border-blue-400 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full mb-2">
                  Jawaban #{item.submission_number}
                </span>
                <p className="text-xs text-gray-500">
                  Dikirim: {new Date(item.submitted_at).toLocaleString('id-ID')}
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => handleViewHistoryDetail(item)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
              >
                👁️ Lihat Detail
              </Button>
            </div>
            {item.counselor_response && (
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="text-xs text-green-600 font-semibold">✅ Sudah Ada Respons Konselor</p>
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Display selected history item detail */}
    {selectedHistoryItem && (
      <div className="mb-6">
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 font-bold">📋 Jawaban #{selectedHistoryItem.submission_number}</span>
            <span className="text-xs text-blue-600">
              {new Date(selectedHistoryItem.submitted_at).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
        {(config?.assignmentFields || []).map((field: any) => {
          const value = selectedHistoryItem.answers?.[field.key] || '';
          return (
            <div key={field.key} className="mb-6">
              <label className="block text-sm font-semibold mb-1 text-gray-800">{field.label}</label>
              <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
              <div className="w-full rounded-lg border-2 border-gray-300 bg-gray-50 p-3 text-sm min-h-[80px]">
                {value || <span className="text-gray-400 italic">Tidak ada jawaban</span>}
              </div>
            </div>
          );
        })}
        {selectedHistoryItem.counselor_response && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <h5 className="text-sm font-bold text-green-800 mb-2">💬 Respons Konselor:</h5>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedHistoryItem.counselor_response}</p>
            {selectedHistoryItem.counselor_name && (
              <p className="text-xs text-green-600 mt-2">
                — {selectedHistoryItem.counselor_name}
              </p>
            )}
            {selectedHistoryItem.responded_at && (
              <p className="text-xs text-gray-500 mt-1">
                {new Date(selectedHistoryItem.responded_at).toLocaleString('id-ID')}
              </p>
            )}
          </div>
        )}
      </div>
    )}

    {/* Form fields - only show in create new mode or when showing latest (not history) */}
    {!showHistory && !selectedHistoryItem && (
      <>
        {(config?.assignmentFields || []).map((field: any) => (
          <div key={field.key} className="mb-6">
            <label className="block text-sm font-semibold mb-1 text-gray-800">{field.label}</label>
            <div className="text-xs text-gray-600 mb-2 italic">{field.desc}</div>
            <textarea
              rows={3}
              disabled={!isCreatingNew}
              className={`w-full rounded-lg border p-3 text-sm transition-colors ${
                isCreatingNew 
                  ? 'border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 bg-white' 
                  : 'border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
              placeholder={isCreatingNew ? `Tulis ${field.label.toLowerCase()} Anda di sini...` : ''}
              value={getNestedValue(assignment, field.key) || ''}
              onChange={e => setAssignment((prev: any) => setNestedValue(prev, field.key, e.target.value))}
            />
          </div>
        ))}
        
        {/* Submit button - only show in create new mode */}
        {isCreatingNew && (
          <Button
            onClick={handleSubmitAssignment}
            disabled={!assignmentValid || isSubmitting}
            className="mt-4 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Mengirim..." : "📤 Kirim Jawaban"}
          </Button>
        )}

        {/* Status indicator when showing latest locked */}
        {!isCreatingNew && submissionHistory.length > 0 && (
          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded-lg text-center">
            <p className="text-sm text-gray-600">
              🔒 <strong>Jawaban Terakhir</strong> — Gunakan tombol "Buat Jawaban Baru" untuk mengirim jawaban baru
            </p>
          </div>
        )}
      </>
    )}
  </div>
</Card>
```

### STEP 7: Hapus Card Riwayat dan Respons Konselor Lama

**HAPUS** kedua Card berikut (jika ada):
- `{/* Card Riwayat Penugasan */}`
- `{/* Card Respons Konselor - Show latest only */}`

Kedua Card ini sudah tidak diperlukan karena fungsinya sudah terintegrasi ke dalam Card Penugasan yang baru.

---

## 📁 File yang Perlu Diupdate

1. **`src/pages/spiritual-budaya/intervensi/SpiritualIntervensiUnified.tsx`**
   - Implementasikan semua STEP 1-7 di atas
   
2. **`src/pages/spiritual-budaya/psikoedukasi/SpiritualPsikoedukasiUnified.tsx`**
   - Implementasikan STEP yang sama
   - Sesuaikan nama variabel/function (ganti `Intervensi` dengan `Psikoedukasi`)

---

## ✅ Hasil Akhir

Setelah implementasi selesai, UI akan berfungsi sebagai berikut:

### 🔹 Saat Pertama Kali Buka Sesi (Belum Ada Submission)
- Form dalam mode **create new** (enabled)
- User langsung bisa mengisi
- Tombol "Kirim Jawaban"

### 🔹 Setelah Ada Submission
- Default view: **Jawaban terakhir (locked/disabled)**
- 2 Tombol: **"Buat Jawaban Baru"** dan **"Riwayat Jawaban"**

### 🔹 Mode "Buat Jawaban Baru"
- Form kosong dan enabled
- User bisa mengisi jawaban baru
- Tombol "Kirim Jawaban"
- Tombol "Kembali ke Jawaban Terakhir"

### 🔹 Mode "Riwayat Jawaban"
- Daftar semua jawaban dalam card-card kecil
- Setiap card punya badge submission number, tanggal, dan status respons konselor
- Tombol "Lihat Detail" per jawaban
- Tombol "Tutup"

### 🔹 Mode "Lihat Detail Riwayat"
- Menampilkan semua field jawaban (read-only)
- Menampilkan respons konselor (jika ada)
- Tombol "Kembali ke Jawaban Terakhir"

---

## 🚀 Testing Checklist

- [ ] Buka sesi pertama kali → form enabled untuk input
- [ ] Submit jawaban pertama → form switch ke locked mode (jawaban terakhir)
- [ ] Klik "Buat Jawaban Baru" → form kosong dan enabled
- [ ] Submit jawaban kedua → kembali ke locked mode dengan jawaban terbaru
- [ ] Klik "Riwayat Jawaban" → muncul list 2 jawaban
- [ ] Klik "Lihat Detail" → tampil detail jawaban tertentu
- [ ] Klik "Kembali" → kembali ke jawaban terakhir (locked)
- [ ] Test untuk kedua portal (Intervensi dan Psikoedukasi)

---

## 💡 Catatan Penting

1. **Autosave dihapus**: Karena sekarang menggunakan sistem submission history, autosave tidak diperlukan lagi.

2. **Load dari History**: Data assignment sekarang selalu load dari submission history, bukan dari tabel `sb_intervensi_assignments` atau `sb_psikoedukasi_assignments`.

3. **Dual Write**: Hook tetap write ke kedua tabel (assignments + history) untuk backward compatibility.

4. **Progress Tracking**: `assignment_done` tetap diupdate setelah submission pertama untuk unlock sesi berikutnya.

---

**STATUS**: Panduan lengkap implementasi UI terstruktur siap digunakan! 🎉

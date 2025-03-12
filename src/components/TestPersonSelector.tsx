import { useState } from "react";
import { Calendar, User, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Button from "@/components/Button";

interface TestPersonSelectorProps {
  onSelectOption: (
    option: "self" | "other",
    otherPersonData?: OtherPersonData
  ) => void;
  isProfessional: boolean;
}

export interface OtherPersonData {
  name: string;
  birthdate: string;
  notes: string;
}

const TestPersonSelector = ({
  onSelectOption,
  isProfessional
}: TestPersonSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<OtherPersonData>>({
    name: "",
    birthdate: "",
    notes: ""
  });

  // If not a professional user, auto-select "self" option
  if (!isProfessional) {
    onSelectOption("self");
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOtherPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.birthdate) {
      onSelectOption("other", formData as OtherPersonData);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="bg-card shadow-soft p-6 rounded-xl mb-6">
      <h2 className="text-xl font-semibold mb-4">
        Siapa yang akan melakukan tes?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="border rounded-lg p-5 hover:border-primary cursor-pointer transition-colors"
          onClick={() => onSelectOption("self")}
        >
          <div className="flex items-center mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-4">
              <User size={24} />
            </div>
            <h3 className="font-medium text-lg">Untuk Diri Sendiri</h3>
          </div>
          <p className="text-muted-foreground text-sm">
            Lakukan tes untuk mengukur kondisi kesehatan mental Anda sendiri
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <div className="border rounded-lg p-5 hover:border-primary cursor-pointer transition-colors">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mr-4">
                  <Users size={24} />
                </div>
                <h3 className="font-medium text-lg">Untuk Orang Lain</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Lakukan tes untuk mengukur kondisi kesehatan mental orang lain
              </p>
            </div>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Detail Orang yang Akan Dites</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitOtherPerson} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthdate">Tanggal Lahir</Label>
                <div className="flex">
                  <Calendar className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Tambahkan catatan jika diperlukan"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit">Lanjutkan</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TestPersonSelector;

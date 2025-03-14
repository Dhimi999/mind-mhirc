import React from "react";
import TeamMember from "@/components/TeamMember";
import { User, Users, GraduationCap, Handshake } from "lucide-react";

interface TeamMemberType {
  name: string;
  role: string;
  bio: string;
  image: string;
  email?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

interface TeamCategoryType {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  members: TeamMemberType[];
}

const TeamSection = () => {
  const teamCategories: TeamCategoryType[] = [
    {
      id: "ketua",
      title: "Ketua",
      icon: <User className="h-5 w-5" />,
      description: "Pemimpin yang mengarahkan visi dan misi Mind MHIRC",
      color: "from-primary/20 to-primary/5",
      members: [
        {
          name: "Dr. Ns. Heni Dwi Windarwati., M.Kep.Sp.Kep.J",
          role: "Ketua (0026028001)",
          bio: "Memimpin inisiatif penelitian dan pengembangan inovasi kesehatan mental di Indonesia dengan fokus pada pendekatan berbasis bukti dan peka budaya.",
          image: "https://randomuser.me/api/portraits/women/44.jpg",
          email: "heni.windarwati@mindmhirc.org"
        }
      ]
    },
    {
      id: "fikes",
      title: "Anggota FIKES",
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Tim ahli dari Fakultas Ilmu Kesehatan",
      color: "from-secondary/20 to-secondary/5",
      members: [
        {
          name: "Dr. Ns. Retno Lestari., S.Kep.M.Nurs",
          role: "Anggota FIKES (0014098001)",
          bio: "Spesialis dalam penelitian keperawatan jiwa dengan fokus pada intervensi preventif.",
          image: "https://randomuser.me/api/portraits/women/42.jpg",
          email: "retno.lestari@mindmhirc.org"
        },
        {
          name: "Dr. Ns. Lilik Supriati., S.Kep.M.Kep",
          role: "Anggota FIKES (0705058302)",
          bio: "Ahli dalam pengembangan program kesehatan mental berbasis komunitas.",
          image: "https://randomuser.me/api/portraits/women/22.jpg",
          email: "lilik.supriati@mindmhirc.org"
        },
        {
          name: "Ns. Ridhoyanti Hidayah., S.Kep.M.Kep",
          role: "Anggota FIKES (0020098502)",
          bio: "Fokus pada intervensi keperawatan jiwa untuk kelompok remaja dan dewasa muda.",
          image: "https://randomuser.me/api/portraits/women/67.jpg",
          email: "ridhoyanti.hidayah@mindmhirc.org"
        },
        {
          name: "Ns. Muhammad Sunarto., M.Kep.Sp.Kep.J",
          role: "Anggota FIKES (0020117103)",
          bio: "Spesialis keperawatan jiwa dengan pengalaman dalam manajemen kasus kompleks.",
          image: "https://randomuser.me/api/portraits/men/32.jpg",
          email: "muhammad.sunarto@mindmhirc.org"
        },
        {
          name: "Ns. Renny Nova., M.Kep.Sp.Kep.J",
          role: "Anggota FIKES (120188493)",
          bio: "Ahli intervensi kesehatan mental pada populasi geriatri.",
          image: "https://randomuser.me/api/portraits/women/52.jpg",
          email: "renny.nova@mindmhirc.org"
        },
        {
          name: "Dr. Kuswantoro Rusca Putra., SKp., M.Kep",
          role: "Anggota FIKES (0022057901)",
          bio: "Peneliti dengan fokus pada pengembangan model perawatan kesehatan mental berbasis keluarga.",
          image: "https://randomuser.me/api/portraits/men/45.jpg",
          email: "kuswantoro.putra@mindmhirc.org"
        },
        {
          name: "Dr. Ns. Rinik Eko Kapti., S.Kep., M.Kep",
          role: "Anggota FIKES (0031018203)",
          bio: "Spesialis dalam penelitian keperawatan jiwa pediatrik.",
          image: "https://randomuser.me/api/portraits/women/29.jpg",
          email: "rinik.kapti@mindmhirc.org"
        },
        {
          name: "Dr. Nurul Muslihah, SP., M.Kes",
          role: "Anggota FIKES (0026017405)",
          bio: "Ahli dalam aspek nutrisi dan pengaruhnya terhadap kesehatan mental.",
          image: "https://randomuser.me/api/portraits/women/24.jpg",
          email: "nurul.muslihah@mindmhirc.org"
        }
      ]
    },
    {
      id: "filkom",
      title: "Anggota FILKOM",
      icon: <Users className="h-5 w-5" />,
      description: "Tim ahli dari Fakultas Ilmu Komputer",
      color: "from-indigo-400/20 to-indigo-400/5",
      members: [
        {
          name: "Ir. Satrio Agung Wicaksono, S.Kom, M.Kom",
          role: "Anggota FILKOM (0021058602)",
          bio: "Ahli pengembangan teknologi kesehatan dan sistem informasi kesehatan mental.",
          image: "https://randomuser.me/api/portraits/men/54.jpg",
          email: "satrio.wicaksono@mindmhirc.org"
        }
      ]
    },
    {
      id: "mitra",
      title: "Anggota Mitra Kerja Sama",
      icon: <Handshake className="h-5 w-5" />,
      description: "Kolaborator dan mitra strategis",
      color: "from-emerald-400/20 to-emerald-400/5",
      members: [
        {
          name: "Ns. Niken Asih Laras Ati, S.Kep.M.Kep",
          role: "Mitra Kerja Sama",
          bio: "Spesialis dalam pengembangan program kesehatan mental kolaboratif.",
          image: "https://randomuser.me/api/portraits/women/65.jpg"
        },
        {
          name: "Ns. Mira Wahyu Kusumawati, S.Kep.M.Kep",
          role: "Mitra Kerja Sama",
          bio: "Fokus pada intervensi kesehatan mental berbasis komunitas.",
          image: "https://randomuser.me/api/portraits/women/59.jpg"
        },
        {
          name: "Dr. dr Irmansyah, Sp.KJ",
          role: "Mitra Kerja Sama (BRIN)",
          bio: "Psikiater dan peneliti dengan fokus pada penelitian kesehatan mental nasional.",
          image: "https://randomuser.me/api/portraits/men/62.jpg"
        },
        {
          name: "Dr Asri Maharani",
          role: "Mitra Kerja Sama (The University of Manchester)",
          bio: "Peneliti di bidang kesehatan mental dengan fokus pada determinan sosial.",
          image: "https://randomuser.me/api/portraits/women/56.jpg"
        },
        {
          name: "Helen Brooks, Ph.D. MRes BSc",
          role: "Mitra Kerja Sama (The University of Manchester)",
          bio: "Peneliti dengan fokus pada keterlibatan pasien dalam perawatan kesehatan mental.",
          image: "https://randomuser.me/api/portraits/women/33.jpg"
        },
        {
          name: "Agus Sugianto S.Pd., M.HP",
          role: "Mental Health Promotion Specialist (KPSI)",
          bio: "Spesialis dalam pengembangan dan implementasi program promosi kesehatan mental.",
          image: "https://randomuser.me/api/portraits/men/75.jpg"
        },
        {
          name: "dr. Herbet Sidabutar., Sp.KJ",
          role: "Mitra Kerja Sama (Kementrian Kesehatan)",
          bio: "Psikiater dengan fokus pada pengembangan kebijakan kesehatan mental nasional.",
          image: "https://randomuser.me/api/portraits/men/41.jpg"
        }
      ]
    }
  ];

  return (
    <section className="py-12 px-4 sm:px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 fade-in">
          <div className="inline-flex items-center space-x-2 bg-primary/10 rounded-full px-4 py-1 text-primary text-sm font-medium mb-4">
            <span>Tim Kami</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Para Ahli di Balik Mind MHIRC
          </h2>
          <p className="text-muted-foreground text-sm">
            Tim multidisiplin kami terdiri dari peneliti kesehatan mental, ahli
            keperawatan jiwa, pengembang teknologi, dan mitra strategis yang
            berdedikasi.
          </p>
        </div>

        <div className="space-y-10">
          {teamCategories.map((category) => (
            <div key={category.id} className="fade-in">
              <div
                className={`p-4 rounded-xl bg-gradient-to-r ${category.color} mb-6 shadow-sm`}
              >
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                    <div className="text-primary">{category.icon}</div>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl font-bold">{category.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`grid gap-4 ${
                  category.members.length === 1
                    ? "grid-cols-1 place-items-center" // Jika hanya 1 anggota, gunakan 1 kolom dan center item
                    : "grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {category.members.map((member) => (
                  <TeamMember key={member.name} {...member} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

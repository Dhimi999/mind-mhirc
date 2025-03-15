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
    schoolar?: string;
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
          image: "https://media.licdn.com/dms/image/v2/D4D03AQGKrnp1gvZvyA/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1711167024171?e=2147483647&v=beta&t=0j_nJYOMsitYzAVA5qd7FQoBiFzIrhPVLYHl82-dQjk",
          email: "henipsik.fk@ub.ac.id",
          socialLinks: {
            linkedin: "https://www.linkedin.com/in/heni-dwi-windarwati-37a416300",
            schoolar: "https://scholar.google.co.id/citations?user=YDXOzfMAAAAJ&hl=en",
            website: "https://fikes.ub.ac.id/en/sdm_all/heni-dwi-windarwati-2/"
          }
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
          role: "Universitas Brawijaya (0014098001)",
          bio: "Spesialis dalam penelitian keperawatan jiwa dengan fokus pada intervensi preventif.",
          image: "https://apps.ub.ac.id/upload/kepegawaian/2021/03/31/20210331_112831_179472.jpg",
          email: "retno.lestari.fk@ub.ac.id",
          socialLinks: {
            linkedin: "https://id.linkedin.com/in/dr-retno-lestari-s-kep-ns-m-nurs-3870835a",
            schoolar: "https://scholar.google.com/citations?user=xgzT_WkAAAAJ&hl=en",
            website: "https://fikes.ub.ac.id/id/sdm_all/retno-lestari/"
          }
        },
        {
          name: "Dr. Ns. Lilik Supriati., S.Kep.M.Kep",
          role: "Universitas Brawijaya (0705058302)",
          bio: "Ahli dalam pengembangan program kesehatan mental berbasis komunitas.",
          image: "https://fikes.ub.ac.id/wp-content/uploads/2024/02/WhatsApp-Image-2023-07-11-at-10.44.33.jpeg",
          email: "liliks.83@ub.ac.id",
          socialLinks:  {
            linkedin: "https://id.linkedin.com/in/lilik-supriati-09b39975",
            schoolar: "https://scholar.google.co.id/citations?user=TlrTIO4AAAAJ&hl=id",
            website: "https://fikes.ub.ac.id/en/sdm_all/lilik-supriati-2/"
          }
        },
        {
          name: "Ns. Ridhoyanti Hidayah., S.Kep.M.Kep",
          role: "Universitas Brawijaya (0020098502)",
          bio: "Fokus pada intervensi keperawatan jiwa untuk kelompok remaja dan dewasa muda.",
          image: "https://fikes.ub.ac.id/wp-content/uploads/2023/11/WhatsApp-Image-2023-11-11-at-12.13.49-1536x1536.jpeg",
          email: "ridhoyanti.fk@ub.ac.id",
          socialLinks: {
            schoolar: "https://scholar.google.co.id/citations?user=SGjAt3kAAAAJ&hl=id",
            website: "https://fikes.ub.ac.id/id/sdm_all/ridhoyanti-hidayah/"
          }
        },
        {
          name: "Ns. Muhammad Sunarto., M.Kep.Sp.Kep.J",
          role: "Universitas Brawijaya (0020117103)",
          bio: "Spesialis keperawatan jiwa dengan pengalaman dalam manajemen kasus kompleks.",
          image: "https://fikes.ub.ac.id/wp-content/uploads/2024/02/20210317_150549_743020.jpg",
          email: "nartompsikfk@ub.ac.id",
          socialLinks: {
            linkedin: "https://www.linkedin.com/in/muhammad-sunarto-9bb862303",
            schoolar: "https://scholar.google.com/citations?user=Tzc0o9oAAAAJ&hl=id",
            website: "https://fikes.ub.ac.id/id/sdm_all/muhammad-sunarto/"
          }
        },
        {
          name: "Ns. Renny Nova., M.Kep.Sp.Kep.J",
          role: "Universitas Brawijaya (120188493)",
          bio: "Ahli intervensi kesehatan mental pada populasi geriatri.",
          image: "https://fikes.ub.ac.id/wp-content/uploads/2023/11/rv.jpeg",
          email: "reva.fk.psik@ub.ac.id",
          socialLinks:  {
            linkedin: "https://www.linkedin.com/in/renny-nova-561200114",
            schoolar: "https://scholar.google.co.id/citations?user=vo-2G48AAAAJ&hl=id",
            website: "https://fikes.ub.ac.id/id/sdm_all/renny-nova/"
          }
        },
        {
          name: "Dr. Kuswantoro Rusca Putra., SKp., M.Kep",
          role: "Universitas Brawijaya (0022057901)",
          bio: "Peneliti dengan fokus pada pengembangan model perawatan kesehatan mental berbasis keluarga.",
          image: "https://nursing.ub.ac.id/wp-content/uploads/2021/12/WhatsApp-Image-2021-11-11-at-12.07.45-Kuswantoro-Rusca-Putra-768x823.jpeg",
          email: "kuswantoro.putra@mindmhirc.org",
          socialLinks: {
            schoolar: "https://scholar.google.co.id/citations?user=999r5dUAAAAJ&hl=en",
            website: "https://nursing.ub.ac.id/en/staff/kuswantoro-rusca-putra/"
          }
        },
        {
          name: "Dr. Ns. Rinik Eko Kapti., S.Kep., M.Kep",
          role: "Universitas Brawijaya (0031018203)",
          bio: "Spesialis dalam penelitian keperawatan jiwa pediatrik.",
          image: "https://fikes.ub.ac.id/wp-content/uploads/2024/02/WhatsApp-Image-2024-02-29-at-13.53.58.jpeg",
          email: "rinik.kapti@mindmhirc.org",
          socialLinks: {
            schoolar: "https://scholar.google.co.id/citations?user=Xhyh8FkAAAAJ&hl=en",
            website: "https://fikes.ub.ac.id/id/sdm_all/rinik-eko-kapti/"
          }
        },
        {
          name: "Dr. Nurul Muslihah, SP., M.Kes",
          role: "Universitas Brawijaya (0026017405)",
          bio: "Ahli dalam aspek epidemiologi dan intervensi melalui nutrisi",
          image: "https://fikes.ub.ac.id/wp-content/uploads/2023/11/Foto-Nurul-Muslihah_Gizi.jpg",
          email: "nurul_muslihah.fk@ub.ac.id",
          socialLinks: {
            schoolar: "https://scholar.google.co.id/citations?user=1sDmmY8AAAAJ&hl=en",
            website: "https://fikes.ub.ac.id/id/sdm_all/nurul-muslihah/"
          }
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
          role: "Universitas Brawijaya (0021058602)",
          bio: "Ahli Pengembangan Sistem Informasi, Datawarehouse, basis data terdistribusi, kecerdasan buatan, data mining.",
          image: "https://file-filkom.ub.ac.id/fileupload/assets/upload/foto/PTIIK/dosen/201301081122.jpg",
          email: "satrio@ub.ac.id",
          socialLinks: {
            schoolar: "https://scholar.google.co.id/citations?user=72NRVv4AAAAJ&hl=en",
            website: "https://filkom.ub.ac.id/profile/dosen/satrio.agung.wicaksono"
          }
        }
      ]
    },
    {
      id: "mitra",
      title: "Anggota Mitra Kerja Sama",
      icon: <Handshake className="h-5 w-5" />,
      description: "Kolaborator dan Mitra Strategis",
      color: "from-emerald-400/20 to-emerald-400/5",
      members: [
        {
          name: "Ns. Niken Asih Laras Ati, S.Kep.M.Kep",
          role: "Universitas Jember",
          bio: "Spesialis dalam pengembangan program kesehatan mental kolaboratif.",
          image: "https://i1.rgstatic.net/ii/profile.image/933073357131777-1599473432427_Q512/Niken-Ati.jpg",
          email: "199505302022032020@unej.ac.id",
          socialLinks: {
            linkedin: "https://id.linkedin.com/in/niken-asih-laras-ati-b99551160",
            schoolar: "https://scholar.google.com/citations?user=uyIU5-gAAAAJ&hl=en"
          }
        },
        {
          name: "Ns. Mira Wahyu Kusumawati, S.Kep.M.Kep",
          role: "Universitas Kusuma Husada",
          bio: "Fokus pada intervensi kesehatan mental berbasis komunitas.",
          image: "https://scholar.googleusercontent.com/citations?view_op=medium_photo&user=oRzkCCIAAAAJ&citpid=7",
          socialLinks: {
            schoolar: "https://scholar.google.com/citations?user=oRzkCCIAAAAJ&hl=id"
          }
        },
        {
          name: "Dr. dr Irmansyah, Sp.KJ",
          role: "Badan Riset dan Inovasi Nasional (BRIN)",
          bio: "Psikiater dan peneliti dengan fokus pada penelitian kesehatan mental nasional.",
          image: "https://fk.ui.ac.id/wp-content/uploads/2015/08/Promosi-Doktor-Irmansyah.jpg"
        },
        {
          name: "Dr Asri Maharani",
          role: "The University of Manchester",
          bio: "Peneliti di bidang kesehatan mental dengan fokus pada determinan sosial.",
          image: "https://research.manchester.ac.uk/files-asset/279158748/foto_UoM_crop.png?w=320&f=webp",
          email: "asri.maharani@manchester.ac.uk",
          socialLinks: {
            linkedin: "https://www.linkedin.com/in/asri-maharani-59634633/",
            schoolar: "https://scholar.google.co.uk/citations?user=cVRlCo0AAAAJ&hl=en",
            website: "https://research.manchester.ac.uk/en/persons/asri.maharani"
          }
        },
        {
          name: "Helen Brooks, Ph.D. MRes BSc",
          role: "The University of Manchester",
          bio: "Peneliti dengan fokus pada keterlibatan pasien dalam perawatan kesehatan mental.",
          image: "https://research.manchester.ac.uk/files-asset/174649053/thumbnail_image0.jpg?w=320&f=webp",
          socialLinks: {
            linkedin: "https://uk.linkedin.com/in/helen-brooks-6a7bbb117",
            schoolar: "https://scholar.google.co.uk/citations?user=bcWvv5gAAAAJ&hl=en",
            website: "https://research.manchester.ac.uk/en/persons/helen.brooks"
          }
        },
        {
          name: "Agus Sugianto S.Pd., M.HP",
          role: "Mental Health Promotion Specialist (KPSI)",
          bio: "Spesialis dalam pengembangan dan implementasi program promosi kesehatan mental.",
          image: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
        },
        {
          name: "dr. Herbet Sidabutar., Sp.KJ",
          role: "Kementrian Kesehatan",
          bio: "Psikiater dengan fokus pada pengembangan kebijakan kesehatan mental nasional.",
          image: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
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

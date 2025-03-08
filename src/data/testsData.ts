export interface TestQuestion {
  id: number;
  text: string;
}

export interface TestData {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  instructions: string;
  duration: string;
  questions: TestQuestion[];
  answerType: "binary" | "likert" | "multiple";
  answerOptions?: Array<{value: string | number; label: string}>;
  category: string;
  image: string;
  featured: boolean;
}

export interface TestResult {
  level: string;
  message: string;
  color: string;
  recommendations: string[];
  image: string;
}

const testsData: Record<string, TestData> = {
  "srq": {
    id: "srq",
    title: "Self-Reporting Questionnaire (SRQ-20)",
    shortTitle: "SRQ-20",
    description: "Kuesioner SRQ-20 adalah alat skrining untuk mendeteksi gejala gangguan mental umum yang dikembangkan oleh World Health Organization (WHO).",
    instructions: "Bacalah petunjuk ini seluruhnya sebelum mulai mengisi. Pertanyaan berikut berhubungan dengan masalah yang mungkin mengganggu Anda selama 30 hari terakhir. Apabila Anda menganggap pertanyaan itu berlaku bagi Anda dan Anda mengalami masalah yang disebutkan dalam 30 hari terakhir, berilah tanda pada kolom Ya. Sebaliknya, berilah tanda pada kolom Tidak. Jika Anda tidak yakin tentang jawabannya, berilah jawaban yang paling sesuai di antara Ya dan Tidak.",
    duration: "5-10 menit",
    answerType: "binary",
    category: "Kesehatan Mental",
    image: "https://plus.unsplash.com/premium_photo-1682546068715-386bd3c676e8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    featured: true,
    questions: [
      { id: 1, text: "Apakah Anda sering menderita sakit kepala?" },
      { id: 2, text: "Apakah Anda kehilangan nafsu makan?" },
      { id: 3, text: "Apakah tidur Anda tidak lelap?" },
      { id: 4, text: "Apakah Anda mudah menjadi takut?" },
      { id: 5, text: "Apakah Anda merasa cemas, tegang dan khawatir?" },
      { id: 6, text: "Apakah tangan Anda gemetar?" },
      { id: 7, text: "Apakah Anda mengalami gangguan pencernaan?" },
      { id: 8, text: "Apakah Anda merasa sulit berpikir jernih?" },
      { id: 9, text: "Apakah Anda merasa tidak bahagia?" },
      { id: 10, text: "Apakah Anda lebih sering menangis?" },
      { id: 11, text: "Apakah Anda merasa sulit untuk menikmati aktivitas sehari-hari?" },
      { id: 12, text: "Apakah Anda mengalami kesulitan untuk mengambil keputusan?" },
      { id: 13, text: "Apakah aktivitas/tugas sehari-hari Anda terbengkalai?" },
      { id: 14, text: "Apakah Anda merasa tidak mampu berperan dalam kehidupan ini?" },
      { id: 15, text: "Apakah Anda kehilangan minat terhadap banyak hal?" },
      { id: 16, text: "Apakah Anda merasa tidak berharga?" },
      { id: 17, text: "Apakah Anda mempunyai pikiran untuk mengakhiri hidup Anda?" },
      { id: 18, text: "Apakah Anda merasa lelah sepanjang waktu?" },
      { id: 19, text: "Apakah Anda merasa tidak enak di perut?" },
      { id: 20, text: "Apakah Anda mudah lelah?" }
    ]
  },
  "sas-sv": {
    id: "sas-sv",
    title: "Tes Kecanduan Smartphone (SAS-SV)",
    shortTitle: "SAS-SV",
    description: "Tes Kecanduan Smartphone adalah alat ukur untuk mengukur tingkat ketergantungan seseorang terhadap penggunaan smartphone dalam kehidupan sehari-hari.",
    instructions: "Berikut terdapat beberapa pernyataan yang mungkin sesuai dengan kondisi Anda. Bacalah setiap pernyataan dan pilih opsi yang paling sesuai dengan Anda, mulai sangat setuju atau sangat tidak setuju dengan pernyataan tersebut.",
    duration: "5-10 menit",
    answerType: "likert",
    answerOptions: [
      { value: 1, label: "Sangat Setuju" },
      { value: 2, label: "Setuju" },
      { value: 3, label: "Sedikit Setuju" },
      { value: 4, label: "Sedikit Tidak Setuju" },
      { value: 5, label: "Tidak Setuju" },
      { value: 6, label: "Sangat Tidak Setuju" }
    ],
    category: "Adiksi Digital",
    image: "https://plus.unsplash.com/premium_photo-1670002275951-541a4a17e92f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    featured: true,
    questions: [
      { id: 1, text: "Karena penggunaan smartphone, saya sulit melakukan pekerjaan sesuai dengan jadwal yang sudah saya tentukan sebelumnya." },
      { id: 2, text: "Saya merasa sulit berkonsentrasi saat di kelas, mengerjakan tugas, atau bekerja disebabkan oleh penggunaan smartphone." },
      { id: 3, text: "Saya merasakan nyeri pada pergelangan tangan atau leher bagian belakang saat menggunakan smartphone." },
      { id: 4, text: "Saya tidak sanggup apabila saya diharuskan untuk tidak memiliki smartphone." },
      { id: 5, text: "Saya merasa tidak sabaran dan gelisah saat saya tidak memegang smartphone milik saya." },
      { id: 6, text: "Saya berpikir tentang smartphone saya bahkan saat saya tidak menggunakannya." },
      { id: 7, text: "Saya tidak akan pernah berhenti menggunakan smartphone meskipun saya tahu bahwa kehidupan sehari-hari saya sudah sangat terpengaruh oleh smartphone." },
      { id: 8, text: "Saya memeriksa smartphone saya secara berkala sehingga saya tidak akan melewatkan percakapan orang lain di media sosial." },
      { id: 9, text: "Saya selalu menggunakan smartphone lebih lama dari waktu yang saya rencanakan." },
      { id: 10, text: "Orang-orang di sekitar saya memberitahu saya bahwa saya menggunakan smartphone secara berlebihan." }
    ]
  },
  "sdq": {
    id: "sdq",
    title: "Tes Kekuatan dan Kelemahan (SDQ)",
    shortTitle: "SDQ",
    description: "Tes Kekuatan dan Kelemahan (SDQ) adalah instrumen skrining untuk menilai kesejahteraan emosional dan perilaku anak dan remaja.",
    instructions: "Berikan jawaban yang sesuai sebagaimana sesuatu telah terjadi pada dirimu selama enam bulan terakhir.",
    duration: "10-15 menit",
    answerType: "multiple",
    answerOptions: [
      { value: 0, label: "Tidak Benar" },
      { value: 1, label: "Agak Benar" },
      { value: 2, label: "Selalu Benar" }
    ],
    category: "Perkembangan Anak",
    image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    featured: false,
    questions: [
      { id: 1, text: "Saya berusaha baik kepada orang lain. Saya peduli dengan perasaan mereka." },
      { id: 2, text: "Saya gelisah. Saya tidak dapat diam untuk waktu lama." },
      { id: 3, text: "Saya sering sakit kepala, sakit perut, atau sakit lainnya." },
      { id: 4, text: "Kalau saya memiliki mainan, CD, atau makanan, saya biasanya berbagi dengan orang lain." },
      { id: 5, text: "Saya sering marah dan tidak dapat mengendalikan kemarahan saya." },
      { id: 6, text: "Saya lebih suka sendiri daripada bersama dengan orang yang seusia saya." },
      { id: 7, text: "Saya biasanya melakukan apa yang diperintahkan oleh orang lain." },
      { id: 8, text: "Saya sering merasa cemas atau khawatir terhadap apa pun." },
      { id: 9, text: "Saya selalu siap menolong jika seseorang terluka, kecewa, atau merasa sakit." },
      { id: 10, text: "Bila sedang gelisah atau cemas, badan saya sering bergerak tanpa saya sadari." },
      { id: 11, text: "Saya mempunyai satu teman baik atau lebih." },
      { id: 12, text: "Saya sering bertengkar dengan orang lain atau memaksa mereka melakukan apa yang saya inginkan." },
      { id: 13, text: "Saya sering merasa tidak bahagia, sedih, atau menangis." },
      { id: 14, text: "Orang lain seusia saya umumnya menyukai saya." },
      { id: 15, text: "Perhatian saya mudah teralih. Saya sulit memusatkan perhatian pada apa pun." },
      { id: 16, text: "Saya merasa gugup dalam situasi baru atau mudah kehilangan rasa percaya diri." },
      { id: 17, text: "Saya bersikap baik kepada anak-anak yang lebih muda dari saya." },
      { id: 18, text: "Saya sering dituduh berbohong atau berbuat curang." },
      { id: 19, text: "Saya sering diganggu atau dipermainkan oleh anak-anak atau remaja lainnya." },
      { id: 20, text: "Saya sering menawarkan diri untuk membantu orang lain (orang tua, guru, anak-anak)." },
      { id: 21, text: "Saya berpikir terlebih dulu akibat yang akan terjadi sebelum melakukan sesuatu." },
      { id: 22, text: "Saya pernah mengambil barang yang bukan milik saya dari rumah, sekolah, atau tempat lain." },
      { id: 23, text: "Saya lebih mudah berteman dengan orang dewasa daripada dengan orang seusia saya." },
      { id: 24, text: "Banyak yang saya takuti, dan saya mudah menjadi takut." },
      { id: 25, text: "Saya mampu menyelesaikan pekerjaan yang sedang saya lakukan dan memiliki perhatian yang baik." }
    ]
  },
  "bfi": {
    id: "bfi",
    title: "Big Five Inventory (BFI-10)",
    shortTitle: "BFI-10",
    description: "Big Five Inventory (BFI) adalah alat ukur yang dirancang untuk menilai kepribadian individu berusia 18 tahun ke atas. BFI-10 merupakan versi singkat dari versi aslinya yang terdiri dari 44 item.",
    instructions: "Bacalah setiap pernyataan di bawah ini. Pilih opsi yang paling sesuai dengan kondisi Anda saat ini, mulai dari Sangat Setuju hingga Sangat Tidak Setuju. Usahakan menjawab secara jujur untuk mendapatkan hasil yang lebih akurat.",
    duration: "5-10 menit",
    answerType: "likert",
    answerOptions: [
      { value: 5, label: "Sangat Setuju" },
      { value: 4, label: "Setuju" },
      { value: 3, label: "Netral" },
      { value: 2, label: "Tidak Setuju" },
      { value: 1, label: "Sangat Tidak Setuju" }
    ],
    category: "Kepribadian",
    image: "https://images.unsplash.com/photo-1590345663334-145e2bd442ea?q=80&w=1914&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    featured: true,
    questions: [
      { id: 1, text: "Saya melihat diri saya sebagai orang yang pendiam." },
      { id: 2, text: "Saya melihat diri saya sebagai orang yang dapat dipercaya." },
      { id: 3, text: "Saya melihat diri saya sebagai orang yang cenderung malas." },
      { id: 4, text: "Saya melihat diri saya sebagai orang yang santai dan dapat menangani stres dengan baik." },
      { id: 5, text: "Saya melihat diri saya sebagai orang yang memiliki sedikit minat pada artistik/seni." },
      { id: 6, text: "Saya melihat diri saya sebagai orang yang ramah dan mudah bergaul." },
      { id: 7, text: "Saya cenderung mencari kesalahan orang lain." },
      { id: 8, text: "Saya mengerjakan tugas hingga tuntas." },
      { id: 9, text: "Saya mudah gugup." },
      { id: 10, text: "Saya memiliki imajinasi yang tinggi." }
    ]
  }
};

export const getTestResultSRQ = (score: number): TestResult => {
  if (score < 6) {
    return {
      level: "Rendah",
      message: "Kondisi mental Anda baik, tidak ada masalah berarti.",
      color: "text-green-500",
      recommendations: [
        "Tetap jaga kesehatan mental dengan istirahat yang cukup",
        "Lakukan aktivitas fisik secara teratur",
        "Pertahankan pola hidup seimbang dan hubungan sosial yang positif"
      ],
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=1528&auto=format&fit=crop"
    };
  } else {
    return {
      level: "Tinggi",
      message: "Anda memerlukan bantuan. Hasil tes menunjukkan adanya indikasi gangguan mental yang perlu ditindaklanjuti.",
      color: "text-red-500",
      recommendations: [
        "Konsultasikan hasil ini dengan profesional kesehatan mental",
        "Cari dukungan dari orang terdekat atau keluarga",
        "Kurangi stres dengan teknik relaksasi dan meditasi",
        "Prioritaskan waktu istirahat dan tidur yang cukup"
      ],
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=1470&auto=format&fit=crop"
    };
  }
};

export const getTestResultSAS = (score: number): TestResult => {
  if (score >= 10 && score <= 20) {
    return {
      level: "Kecanduan Ringan",
      message: "Anda memiliki tingkat kecanduan smartphone yang ringan. Penggunaan smartphone Anda masih dalam batas wajar.",
      color: "text-green-500",
      recommendations: [
        "Tetap pantau penggunaan smartphone Anda",
        "Atur waktu istirahat dari penggunaan gadget",
        "Prioritaskan interaksi sosial langsung"
      ],
      image: "https://images.unsplash.com/photo-1646330024011-46b08e1714a6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGxvdyUyMGxldmVsfGVufDB8fDB8fHww"
    };
  } else if (score >= 21 && score <= 40) {
    return {
      level: "Kecanduan Sedang",
      message: "Anda memiliki tingkat kecanduan smartphone yang sedang. Mulai batasi penggunaan smartphone Anda.",
      color: "text-yellow-500",
      recommendations: [
        "Tetapkan batas waktu penggunaan smartphone harian",
        "Gunakan aplikasi pengatur waktu penggunaan aplikasi",
        "Matikan notifikasi yang tidak penting",
        "Coba aktivitas baru yang tidak melibatkan penggunaan smartphone"
      ],
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1470&auto=format&fit=crop"
    };
  } else {
    return {
      level: "Kecanduan Berat",
      message: "Anda memiliki tingkat kecanduan smartphone yang berat. Segera ambil tindakan untuk mengurangi ketergantungan pada smartphone.",
      color: "text-red-500",
      recommendations: [
        "Konsultasikan masalah ini dengan profesional kesehatan",
        "Batasi penggunaan smartphone dengan ketat",
        "Mulai digital detox secara bertahap",
        "Cari aktivitas pengganti yang menyenangkan dan tidak melibatkan smartphone",
        "Minta dukungan keluarga dan teman dalam mengurangi penggunaan smartphone"
      ],
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=1470&auto=format&fit=crop"
    };
  }
};

export const getTestResultSDQ = (difficultyScore: number, strengthScore: number, isYounger: boolean): TestResult => {
  let difficultyLevel = "";
  let difficultyColor = "";
  let strengthLevel = "";
  let strengthColor = "";
  
  if (isYounger) {
    if (difficultyScore <= 13) {
      difficultyLevel = "Normal";
      difficultyColor = "text-green-500";
    } else if (difficultyScore <= 15) {
      difficultyLevel = "Borderline";
      difficultyColor = "text-yellow-500";
    } else {
      difficultyLevel = "Abnormal";
      difficultyColor = "text-red-500";
    }
  } else {
    if (difficultyScore <= 15) {
      difficultyLevel = "Normal";
      difficultyColor = "text-green-500";
    } else if (difficultyScore <= 19) {
      difficultyLevel = "Borderline";
      difficultyColor = "text-yellow-500";
    } else {
      difficultyLevel = "Abnormal";
      difficultyColor = "text-red-500";
    }
  }
  
  if (isYounger) {
    if (strengthScore >= 6) {
      strengthLevel = "Normal";
      strengthColor = "text-green-500";
    } else if (strengthScore === 5) {
      strengthLevel = "Borderline";
      strengthColor = "text-yellow-500";
    } else {
      strengthLevel = "Abnormal";
      strengthColor = "text-red-500";
    }
  } else {
    if (strengthScore >= 7) {
      strengthLevel = "Normal";
      strengthColor = "text-green-500";
    } else if (strengthScore >= 5) {
      strengthLevel = "Borderline";
      strengthColor = "text-yellow-500";
    } else {
      strengthLevel = "Abnormal";
      strengthColor = "text-red-500";
    }
  }
  
  let overallLevel, overallMessage, overallColor, recommendations, resultImage;
  
  if (difficultyLevel === "Normal" && strengthLevel === "Normal") {
    overallLevel = "Normal";
    overallMessage = "Perkembangan mental dan sosial Anda tampak dalam kondisi baik.";
    overallColor = "text-green-500";
    resultImage = "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?q=80&w=1470&auto=format&fit=crop";
    recommendations = [
      "Pertahankan pola interaksi sosial yang positif",
      "Terus kembangkan keterampilan sosial dan emosional",
      "Jaga keseimbangan antara aktivitas akademik dan sosial"
    ];
  } else if (difficultyLevel === "Abnormal" || strengthLevel === "Abnormal") {
    overallLevel = "Perlu Perhatian";
    overallMessage = "Hasil tes menunjukkan beberapa area yang perlu perhatian dan dukungan khusus.";
    overallColor = "text-red-500";
    resultImage = "https://images.unsplash.com/photo-1535083988052-565ca9546643?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    recommendations = [
      "Konsultasikan hasil ini dengan profesional kesehatan mental",
      "Diskusikan dengan orang tua atau pengasuh tentang dukungan yang diperlukan",
      "Pertimbangkan untuk mendapatkan penilaian lebih lanjut dari psikolog atau konselor",
      "Kembangkan strategi untuk mengelola area yang menunjukkan kesulitan"
    ];
  } else {
    overallLevel = "Memerlukan Perhatian";
    overallMessage = "Terdapat beberapa area yang perlu diperhatikan dalam perkembangan mental dan sosial.";
    overallColor = "text-yellow-500";
    resultImage = "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1480&auto=format&fit=crop";
    recommendations = [
      "Perhatikan perkembangan area yang menunjukkan tanda borderline",
      "Tingkatkan komunikasi dengan keluarga dan teman",
      "Cari aktivitas yang dapat memperkuat kekuatan sosial dan emosional",
      "Pantau perubahan perilaku dan perasaan secara berkala"
    ];
  }
  
  return {
    level: overallLevel,
    message: overallMessage,
    color: overallColor,
    recommendations: recommendations,
    image: resultImage
  };
};

export const getTestResultBFI = (scores: Record<string, number>): TestResult => {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  
  const percentages: Record<string, number> = {};
  for (const [key, score] of Object.entries(scores)) {
    percentages[key] = Math.round((score / totalScore) * 100);
  }
  
  let dominantTrait = "";
  let highestPercentage = 0;
  
  for (const [trait, percentage] of Object.entries(percentages)) {
    if (percentage > highestPercentage) {
      highestPercentage = percentage;
      dominantTrait = trait;
    }
  }
  
  const traitDescriptions: Record<string, string> = {
    extraversion: "cenderung menikmati interaksi sosial dan merasa terstimulasi oleh lingkungan di sekitarnya. Orang dengan Ekstraversi yang tinggi sering kali energik, antusias, dan merasa nyaman dalam keramaian. Individu yang ekstrover cenderung memiliki kepercayaan diri yang tinggi, senang mengambil inisiatif dalam situasi sosial, dan sering kali menjadi pusat perhatian. Mereka juga biasanya lebih optimis dan mampu menginspirasi orang lain dengan semangat serta energi positif yang mereka pancarkan. Di sisi lain, mereka mungkin kadang-kadang kurang menyadari kebutuhan untuk waktu sendiri guna mengisi ulang energi.",
    agreeableness: "mudah bekerjasama, bersahabat, penuh kepercayaan, dan hangat. Individu dengan tingkat agreeableness yang tinggi biasanya memiliki empati yang baik, mampu memahami perasaan orang lain, dan cenderung mengutamakan kerjasama serta keharmonisan dalam hubungan. Mereka dipercaya, penuh kepercayaan, dan selalu berusaha untuk menghindari konflik. Kelebihan ini membuat mereka mudah diajak bekerja sama dalam tim dan lingkungan sosial, meskipun terkadang sikap yang terlalu mengalah atau kompromistis bisa membuat mereka rentan terhadap manipulasi.",
    conscientiousness: "terorganisir, disiplin, dan berorientasi pada pencapaian. Orang dengan Conscientiouness yang tinggi biasanya menetapkan tujuan yang jelas, memiliki perencanaan yang baik, dan sangat bertanggung jawab dalam menyelesaikan tugas. Sifat teliti dan perhatian terhadap detail memungkinkan mereka untuk bekerja secara konsisten dan mencapai hasil yang maksimal. Sementara kelebihan ini sangat mendukung kesuksesan dalam berbagai bidang, kecenderungan untuk perfeksionis atau terlalu kaku dalam mengikuti aturan kadang bisa menghambat fleksibilitas dan spontanitas dalam situasi yang membutuhkan kreativitas.",
    neuroticism: "cenderung mengalami emosi negatif seperti kecemasan, kemarahan, atau depresi. Trait neuroticism mengacu pada kecenderungan seseorang untuk mengalami emosi negatif dengan intensitas yang lebih tinggi. Individu dengan skor neuroticism yang tinggi cenderung mudah merasa cemas, khawatir, atau marah dalam menghadapi stres atau situasi yang tidak pasti. Mereka sering kali memiliki respons emosional yang kuat terhadap tantangan, dan mungkin kesulitan mengelola perasaan negatif seperti frustrasi, depresi, atau ketidakamanan. Meskipun demikian, tingkat neuroticism yang moderat juga dapat meningkatkan kesadaran diri dan sensitivitas terhadap risiko, asalkan tidak mengganggu kesejahteraan secara keseluruhan.",
    openness: "memiliki minat intelektual, berpikiran terbuka, dan imajinatif. Openness menggambarkan tingkat keterbukaan seseorang terhadap pengalaman baru, ide-ide kreatif, dan pemikiran abstrak. Individu yang tinggi pada trait ini memiliki rasa ingin tahu yang besar dan cenderung berpikiran terbuka terhadap berbagai perspektif. Mereka menikmati eksplorasi intelektual, memiliki imajinasi yang kuat, dan seringkali menemukan solusi inovatif untuk masalah. Keingintahuan dan kecenderungan untuk bereksperimen memungkinkan mereka untuk menikmati seni, budaya, dan diskusi filosofis. Namun, mereka juga mungkin terlihat tidak konvensional atau sulit diprediksi dalam beberapa situasi, karena kecenderungan untuk mencari pengalaman yang berbeda dari norma yang ada."
  };
  
  const message = `Anda memiliki dominasi kepribadian ${dominantTrait} (${highestPercentage}%), yang berarti Anda ${traitDescriptions[dominantTrait]}.`;
  
  const traitColors: Record<string, string> = {
    extraversion: "text-yellow-500",
    agreeableness: "text-green-500",
    conscientiousness: "text-blue-500",
    neuroticism: "text-purple-500",
    openness: "text-red-500"
  };
  
  const recommendations: string[] = [
    "Kepribadian ini hanya indikasi umum dan bukan diagnosis profesional",
    "Kenali kekuatan kepribadian Anda dan manfaatkan dalam kehidupan sehari-hari",
    "Terus kembangkan aspek kepribadian positif yang Anda miliki"
  ];
  
  if (dominantTrait === "extraversion") {
    recommendations.push("Gunakan kekuatan sosial Anda untuk membangun jaringan yang lebih luas");
    recommendations.push("Luangkan waktu untuk merenung dan meresapi pengalaman pribadi di tengah aktivitas sosial");
    recommendations.push("Ikuti kegiatan komunitas untuk memperkuat koneksi interpersonal");
    recommendations.push("Tingkatkan kemampuan komunikasi agar hubungan Anda semakin bermakna");
    recommendations.push("Manfaatkan energi positif Anda untuk menginspirasi orang di sekitar");
  } else if (dominantTrait === "agreeableness") {
    recommendations.push("Belajar menetapkan batas agar kebutuhan pribadi tetap terpenuhi");
    recommendations.push("Manfaatkan empati Anda untuk mendukung orang lain sambil menjaga keseimbangan diri");
    recommendations.push("Luangkan waktu untuk mengeksplorasi minat pribadi secara mandiri");
    recommendations.push("Ungkapkan pendapat Anda dengan asertif tanpa mengurangi kebaikan hati");
    recommendations.push("Ciptakan ruang bagi diri sendiri agar tidak selalu mengorbankan kepentingan orang lain");
  } else if (dominantTrait === "conscientiousness") {
    recommendations.push("Jangan terlalu keras pada diri sendiri saat menghadapi kegagalan kecil");
    recommendations.push("Gunakan disiplin Anda untuk menetapkan dan mencapai tujuan jangka panjang secara bertahap");
    recommendations.push("Ambil waktu istirahat yang cukup untuk menjaga produktivitas dan kesehatan");
    recommendations.push("Eksplorasi metode kerja baru yang dapat meningkatkan efisiensi tanpa mengorbankan kualitas");
    recommendations.push("Refleksikan pencapaian Anda untuk terus belajar dari setiap pengalaman");
  } else if (dominantTrait === "neuroticism") {
    recommendations.push("Kembangkan strategi manajemen stres seperti meditasi atau olahraga secara rutin");
    recommendations.push("Luangkan waktu untuk teknik relaksasi dan mindfulness guna meredakan kecemasan");
    recommendations.push("Pertimbangkan konsultasi dengan profesional jika emosi negatif mulai mengganggu aktivitas");
    recommendations.push("Catat dan evaluasi pemicu emosi agar dapat mengidentifikasi pola reaksi diri");
    recommendations.push("Ciptakan rutinitas harian yang mendukung keseimbangan emosi dan kesehatan mental");
  } else if (dominantTrait === "openness") {
    recommendations.push("Eksplorasi minat baru yang dapat memperluas wawasan dan kreativitas Anda");
    recommendations.push("Gabungkan ide-ide inovatif dalam pemecahan masalah sehari-hari untuk hasil yang optimal");
    recommendations.push("Luangkan waktu untuk membaca dan mendalami topik-topik yang belum pernah Anda eksplorasi");
    recommendations.push("Terlibat dalam kegiatan seni atau musik untuk menyalurkan kreativitas secara bebas");
    recommendations.push("Berpartisipasilah dalam diskusi yang menantang pemikiran konvensional dan memperkaya perspektif");
  }
  
  return {
    level: dominantTrait.charAt(0).toUpperCase() + dominantTrait.slice(1),
    message: message,
    color: traitColors[dominantTrait],
    recommendations: recommendations,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1974&auto=format&fit=crop"
  };
};

export default testsData;

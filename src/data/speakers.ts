import type { Locale, Messages } from "@/i18n/LanguageProvider";

type Localized<T = string> = Record<Locale, T>;

export type Speaker = {
  slug: string;
  name: string;
  affiliation: Localized<string[]>; // one line each, as on the poster
  photo: string;
  // For a portrait photo: how it sits in the round frame (sizes in % of the frame) and the
  // backdrop around it. Without it the photo covers the frame (square photos).
  frame?: { photoWidth: number; photoHeight: number; width: number; left: number; top: number; backdrop: string };
  bio: Localized<string[]>;
  links: Partial<Record<"profile" | "scholar" | "scopus" | "orcid" | "wos", string>>;
};

export const linkNames: Record<keyof Speaker["links"], string> = {
  profile: "Profile",
  scholar: "Google Scholar",
  scopus: "Scopus",
  orcid: "ORCID",
  wos: "Web of Science",
};

export const speakers: Speaker[] = [
  {
    slug: "ilker-unal",
    name: "Prof. Dr. İlker Ünal",
    affiliation: {
      en: ["Çukurova University", "Faculty of Medicine, Dept. of Biostatistics"],
      tr: ["Çukurova Üniversitesi", "Tıp Fakültesi, Biyoistatistik Anabilim Dalı"],
    },
    photo: "/images/speakers/ilker-unal.webp",
    // Original 768×1181 portrait: shown from the hair to the shoulders, face in the middle,
    // with the dark wall of the photo continued on both sides.
    frame: { photoWidth: 768, photoHeight: 1181, width: 85.3, left: 8.9, top: -3.3, backdrop: "linear-gradient(to right, #262321, #3a3532 60%, #423d3b)" },
    bio: {
      en: [
        "Prof. Dr. İlker Ünal completed primary and secondary education in İzmir and high school at Konya Meram Science High School, and graduated from the Department of Mathematics at Middle East Technical University in 2001. In the same year Ünal was admitted to the master’s program in Biostatistics at the Institute of Health Sciences of Çukurova University, and received a PhD in the same field in 2010.",
        "After the doctorate, Ünal worked in the private sector as a biostatistics consultant. In 2012 Ünal joined the Faculty of Medicine of İzmir University as a founding faculty member, taking on administrative roles such as deputy chief coordinator, phase coordinator, head of department and chair of the assessment and evaluation committee. Appointed Assistant Professor at the Department of Biostatistics of Çukurova University in 2013, Ünal served there as deputy coordinator, member of the medical education accreditation committee and member of the medical informatics board. Ünal chaired the Eastern Mediterranean Region of the International Biometric Society from 2015 to 2017, and became Associate Professor in 2018 and Professor in 2026. A member of the board of the Çukurova University Statistics Application and Research Center since 2015 and its Director since 2022, Ünal was also elected to the board of the National Biostatistics Association in 2022.",
        "Specializing in ROC curves and the determination of optimal cut-off points, Ünal proposed the cut-off point method known as the “Index of Union”, which has received nearly 1,000 citations to date. With more than 130 publications, over 2,500 citations and more than 110 papers at national and international congresses, Ünal has taken part in more than 10 projects, two of them funded by TÜBİTAK, as principal investigator and researcher, and has contributed to many journals as statistics editor and advisory board member, most notably as editor of Sağlık Bilimleri Dergisi. Listed every year since 2022 among the “World’s Most Influential Scientists” published by Stanford University and Elsevier, Prof. Dr. İlker Ünal continues to work at Çukurova University.",
      ],
      tr: [
        "Prof. Dr. İlker Ünal, ilk ve orta eğitimini İzmir’de, lise eğitimini Konya Meram Fen Lisesi’nde tamamladıktan sonra Orta Doğu Teknik Üniversitesi Matematik bölümünden 2001 yılında mezun olmuştur. Aynı yıl Çukurova Üniversitesi Sağlık Bilimleri Enstitüsü Biyoistatistik Yüksek Lisans programına kabul edilen Ünal, doktorasını da aynı alanda tamamlayarak 2010 yılında doktor unvanını almıştır.",
        "Doktora sonrasında özel sektörde Biyoistatistik uzmanı olarak danışmanlık hizmeti veren Ünal, 2012 yılında İzmir Üniversitesi Tıp Fakültesi’nin kurucu öğretim üyesi olarak göreve başlamış; başkoordinatör yardımcılığı, dönem koordinatörlüğü, anabilim dalı başkanlığı ve ölçme-değerlendirme komisyon başkanlığı gibi çeşitli idari sorumluluklar üstlenmiştir. 2013 yılında Çukurova Üniversitesi Biyoistatistik Anabilim Dalı’na Yardımcı Doçent olarak atanan Ünal, burada koordinatör yardımcılığı, tıp eğitimi akreditasyon komisyon üyeliği ve tıbbi bilişim kurulu üyeliği gibi görevleri sürdürmüştür. 2015–2017 yılları arasında International Biometric Society derneğinin Doğu Akdeniz Bölgesi Başkanlığı’nı yürüten Ünal, 2018’de Doçent, 2026’da ise Profesör unvanını almıştır. 2015’ten bu yana Çukurova Üniversitesi İstatistik Uygulama ve Araştırma Merkezi Yönetim Kurulu üyesi, 2022’den itibaren ise aynı merkezde Müdür olarak görev yapmakta olan Ünal, aynı yıl Ulusal Biyoistatistik Derneği Yönetim Kurulu’na da seçilmiştir.",
        "ROC eğrisi ve optimal kesim noktası belirleme konularında uzmanlaşan İlker Ünal, “Index of Union” olarak bilinen bir kesim noktası belirleme yöntemi önermiş ve bu yöntem bugüne kadar 1000’e yakın atıf almıştır. 130’dan fazla yayını, 2.500’ü aşkın atıfı ve 110’dan fazla ulusal ve uluslararası kongre bildirisi bulunan Ünal; 2’si TÜBİTAK projesi olmak üzere 10’dan fazla projede yürütücü ve araştırmacı olarak yer almış, başta Sağlık Bilimleri Dergisi Editörlüğü olmak üzere pek çok dergide istatistik editörü ve bilimsel danışma kurulu üyesi olarak katkı sağlamıştır. 2022 yılından itibaren Stanford Üniversitesi ve Elsevier iş birliğiyle her yıl düzenli olarak açıklanan “Dünyanın En Etkili Bilim İnsanları” listesinde yer alan Prof. Dr. İlker Ünal, hâlen Çukurova Üniversitesi’ndeki akademik görevini sürdürmektedir.",
      ],
    },
    links: {
      profile: "https://avesis.cu.edu.tr/ilkerun",
      scholar: "https://scholar.google.com.tr/citations?user=wOEHmyIAAAAJ",
      scopus: "https://www.scopus.com/authid/detail.uri?authorId=23480797700",
      orcid: "https://orcid.org/0000-0002-9485-3295",
      wos: "https://publons.com/researcher/E-5071-2018",
    },
  },
  {
    slug: "silvan-schwaller",
    name: "Silvan Schwaller",
    affiliation: {
      en: ["FİGES", "Academic Planning and Development Engineer"],
      tr: ["FİGES", "Akademik Planlama ve Geliştirme Mühendisi"],
    },
    photo: "/images/speakers/silvan-schwaller.webp",
    bio: {
      en: [
        "After graduating from the Department of Aerospace Engineering at Middle East Technical University (METU) in 2019, he completed a master’s degree in Engineering Management at Galatasaray University. He currently works as a Customer Success Engineer at FİGES A.Ş., where he supports academics, researchers and students working on a wide range of topics at universities with MATLAB & Simulink.",
      ],
      tr: [
        "ODTÜ Havacılık ve Uzay Mühendisliği bölümünden 2019 yılında mezun olduktan sonra Galatasaray Üniversitesi’nde Mühendislik Yönetimi üstüne yüksek lisans yaptı. Şu anda FİGES A.Ş.’de Müşteri Başarı Mühendisi olarak çalışmakta ve bu kapsamda üniversitelerdeki farklı konularda çalışan akademisyen, araştırmacı ve öğrencilere MATLAB & Simulink ile ilgili konularda destek olmaktadır.",
      ],
    },
    links: {},
  },
  {
    slug: "recep-erol",
    name: "Dr. Recep Erol",
    affiliation: {
      en: ["Rice University", "Center for Research and Computing"],
      tr: ["Rice Üniversitesi", "Center for Research and Computing"],
    },
    photo: "/images/speakers/recep-erol.webp",
    bio: {
      en: [
        "Dr. Recep Erol works in high-performance computing (HPC), machine learning and artificial intelligence at the Center for Research Computing at Rice University. He received his PhD from the University of Arkansas at Little Rock in 2024. For more than ten years he has worked on machine learning, deep learning and the optimization of computing systems.",
        "His research interests include the compression of machine learning models and the evaluation of quantization methods, energy-efficient computing, and scientific computing on heterogeneous hardware. His work focuses on achieving high performance with limited computing resources and on making artificial intelligence applications more efficient in terms of compute, memory and storage.",
        "In his professional role he helps researchers make effective use of high-performance computing infrastructure and AI/machine learning methods, and he runs technical trainings and hands-on workshops for researchers and students. As an NVIDIA Deep Learning Institute (DLI) certified instructor, he contributes to training on hardware acceleration and generative AI. He also takes part in the conferences and organizing work of the supercomputing and research computing communities, supporting academic collaboration and knowledge sharing.",
      ],
      tr: [
        "Dr. Recep Erol, Rice Üniversitesi Araştırma ve Hesaplama Merkezi’nde (Center for Research Computing) yüksek başarımlı hesaplama (HPC), makine öğrenmesi ve yapay zekâ alanlarında görev yapmaktadır. Doktora derecesini 2024 yılında University of Arkansas at Little Rock’tan almıştır. On yılı aşkın süredir makine öğrenmesi, derin öğrenme ve hesaplama sistemlerinin optimizasyonu alanlarında çalışmalar yürütmektedir.",
        "Araştırma ilgi alanları; makine öğrenmesi modellerinin sıkıştırılması ve niceleme yöntemlerinin değerlendirilmesi, enerji verimli hesaplama ve heterojen donanımlar üzerinde bilimsel hesaplamadır. Çalışmaları, sınırlı hesaplama kaynaklarıyla yüksek performans elde edilmesine ve yapay zekâ uygulamalarının hesaplama, bellek ve depolama kaynakları açısından daha verimli hâle getirilmesine odaklanmaktadır.",
        "Mesleki çalışmaları kapsamında araştırmacıların yüksek başarımlı hesaplama altyapılarından ve yapay zekâ/makine öğrenmesi yöntemlerinden etkin biçimde yararlanmalarını desteklemekte; araştırmacılara ve öğrencilere yönelik teknik eğitimler ve uygulamalı atölyeler düzenlemektedir. NVIDIA Deep Learning Institute (DLI) sertifikalı eğitmen olarak donanım hızlandırma ve üretken yapay zekâ konularında eğitim faaliyetlerine katkı sunmaktadır. Ayrıca süperbilgisayar ve araştırma bilişimi topluluklarının konferans ve organizasyon çalışmalarına katılarak akademik iş birliğini ve bilgi paylaşımını desteklemektedir.",
      ],
    },
    links: {
      profile: "https://researchcomputing.rice.edu/staff",
      orcid: "https://orcid.org/0000-0002-3131-4999",
    },
  },
];

export const speakerBySlug = Object.fromEntries(speakers.map((s) => [s.slug, s]));

// The speaker's talks, taken from the program so titles and times live in one place.
export function talksOf(slug: string, program: Messages["program"]) {
  return program.days.flatMap((day) =>
    day.sessions.filter((session) => session.speaker === slug).map((session) => ({ day: day.n, ...session })),
  );
}

// "Day 1 · 10:15" or "Day 1 & 2 · 14:00", like the badges on the poster.
export function slotLabel(slug: string, m: Messages) {
  const talks = talksOf(slug, m.program);
  const days = [...new Set(talks.map((talk) => talk.day))];
  const start = talks[0]?.time.split("–")[0] ?? "";
  const dayText =
    days.length === 1
      ? m.speakers.dayOne.replace("{n}", String(days[0]))
      : m.speakers.dayMany.replace("{a}", String(days[0])).replace("{b}", String(days[1]));
  const sameTime = talks.every((talk) => talk.time.startsWith(start));
  return sameTime ? `${dayText} · ${start}` : dayText;
}

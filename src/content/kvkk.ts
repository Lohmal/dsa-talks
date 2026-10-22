// KVKK information notice (aydınlatma metni) for the DSATalks survey and certificates.
// Controller details and application channels follow the university's own notice at
// https://kvk.atu.edu.tr; have changes approved by the university's KVKK unit.

// paragraphs come before the list, after (if any) follows it.
export type KvkkSection = { title: string; paragraphs?: string[]; items?: string[]; after?: string[] };

export const KVKK_LINKS = {
  university: "https://kvk.atu.edu.tr",
  notice: "https://kvk.atu.edu.tr/Upload/Dosyalar/Icerik/Dosya/446/02022021110942_Icerik_D_446.pdf",
  kep: "atu@hs01.kep.tr",
};

export const kvkk: Record<"tr" | "en", { updated: string; intro: string; sections: KvkkSection[] }> = {
  tr: {
    updated: "Son güncelleme: Ekim 2026",
    intro:
      "Bu metin, DSATalks etkinliği kapsamında Etkinlik Memnuniyet Anketi’ni dolduran ve katılım sertifikası alan kişilerin kişisel verilerinin nasıl işlendiğini, 6698 sayılı Kişisel Verilerin Korunması Kanunu’nun (KVKK) 10. maddesi uyarınca açıklamak için hazırlanmıştır.",
    sections: [
      {
        title: "1. Veri sorumlusu",
        paragraphs: [
          "Kişisel verileriniz, veri sorumlusu sıfatıyla Adana Alparslan Türkeş Bilim ve Teknoloji Üniversitesi (“Üniversite”) tarafından, etkinliği düzenleyen Veri Bilimi ve Analitiği Bölümü aracılığıyla işlenmektedir.",
          "Adres: Balcalı Mah. Güney Kampüs 10 Sokak No:1U, Sarıçam/Adana",
        ],
      },
      {
        title: "2. İşlenen kişisel veriler",
        items: [
          "Kimlik bilgisi: ad ve soyad",
          "İletişim bilgisi: e-posta adresi",
          "Anket cevapları: etkinliğe ilişkin değerlendirmeleriniz, ilgi duyduğunuz konular, görüş ve önerileriniz",
          "İşlem bilgisi: anketin gönderildiği tarih ve saat, katıldığınız oturum, sertifika numarası",
        ],
        after: ["IP adresiniz ya da konum bilginiz anket kapsamında kaydedilmez."],
      },
      {
        title: "3. İşleme amaçları",
        items: [
          "Katılım sertifikanızın düzenlenmesi ve e-posta adresinize gönderilmesi",
          "Sertifikaların geçerliliğinin sertifika numarası ile doğrulanabilmesi",
          "Etkinliğin değerlendirilmesi, gelecekteki etkinliklerin ve konuların planlanması",
          "Aynı kişinin aynı oturum için birden fazla sertifika almasının önlenmesi",
        ],
      },
      {
        title: "4. Toplama yöntemi ve hukuki sebep",
        paragraphs: [
          "Kişisel verileriniz, DSATalks web sitesindeki anket formu aracılığıyla elektronik ortamda ve doğrudan sizden toplanır.",
          "Verileriniz KVKK’nın 5. maddesinin 2. fıkrasında yer alan; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (talep ettiğiniz katılım sertifikasının düzenlenmesi), veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması (eğitim ve bilimsel etkinliklerin yürütülmesi) ve ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaatleri için zorunlu olması (etkinliğin değerlendirilmesi) hukuki sebeplerine dayanılarak işlenir.",
        ],
      },
      {
        title: "5. Aktarım",
        paragraphs: [
          "Verileriniz Üniversite bünyesinde yalnızca etkinliği düzenleyen yetkili kişilerce görüntülenir; üçüncü kişilerle paylaşılmaz ve ticari amaçla kullanılmaz.",
          "Verileriniz, sertifikanın gönderilmesi ve sistemin çalıştırılması için Üniversitenin kullandığı barındırma ve e-posta hizmetleri üzerinde, KVKK’nın 8. ve 9. maddelerindeki şartlara uygun olarak işlenebilir. Kanunen yetkili kamu kurum ve kuruluşlarına, talep hâlinde ve mevzuatın izin verdiği ölçüde aktarılabilir.",
        ],
      },
      {
        title: "6. Saklama süresi",
        paragraphs: [
          "Verileriniz, yukarıdaki amaçlar için gerekli olan süre boyunca saklanır. Sertifikaların doğrulanabilmesi için ad, soyad ve sertifika numarası, sertifika doğrulama hizmeti sürdüğü müddetçe tutulur. Süre sona erdiğinde veriler silinir, yok edilir ya da anonim hâle getirilir.",
        ],
      },
      {
        title: "7. Çerezler",
        paragraphs: [
          "DSATalks web sitesi reklam veya izleme (analitik) amaçlı çerez kullanmaz.",
          "Seçtiğiniz dil, yalnızca tarayıcınızda saklanır ve sunucuya gönderilmez. Yönetim paneline giriş yapan yetkililer için oturumun sürdürülmesine yarayan zorunlu bir çerez kullanılır.",
          "Ulaşım bölümündeki Google Haritalar, siz “Haritayı göster” butonuna basmadan yüklenmez; haritayı açtığınızda Google’ın kendi çerez ve gizlilik politikası geçerli olur.",
        ],
      },
      {
        title: "8. Haklarınız ve başvuru",
        paragraphs: ["KVKK’nın 11. maddesi uyarınca;"],
        items: [
          "Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse buna ilişkin bilgi talep etme,",
          "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,",
          "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,",
          "Eksik veya yanlış işlenmişse düzeltilmesini, KVKK’nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme ve bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme,",
          "Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme,",
          "Kanuna aykırı işleme nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme",
        ],
        after: [
          "haklarına sahipsiniz. Bu haklara ilişkin taleplerinizi, Üniversitenin Kişisel Verilerin Korunması sayfasında yer alan Veri Sahibi Başvuru Formu ile yazılı olarak Balcalı Mah. Güney Kampüs 10 Sokak No:1U Sarıçam/Adana adresine şahsen ya da noter aracılığıyla iletebilir veya güvenli elektronik imzalı olarak atu@hs01.kep.tr KEP adresine gönderebilirsiniz. Başvurular en geç otuz gün içinde ücretsiz olarak sonuçlandırılır.",
          "Yalnızca anket yanıtınızın ve sertifikanızın silinmesini istiyorsanız, sertifika numaranızı belirterek etkinlik iletişim adresine de yazabilirsiniz.",
        ],
      },
    ],
  },
  en: {
    updated: "Last updated: October 2026",
    intro:
      "This notice explains, under Article 10 of the Turkish Personal Data Protection Law No. 6698 (KVKK), how the personal data of people who complete the DSATalks Event Satisfaction Survey and receive a certificate of participation are processed.",
    sections: [
      {
        title: "1. Data controller",
        paragraphs: [
          "Your personal data are processed by Adana Alparslan Türkeş Science and Technology University (the “University”) as data controller, through the Department of Data Science and Analytics, which organizes the event.",
          "Address: Balcalı Mah. Güney Kampüs 10 Sokak No:1U, Sarıçam/Adana, Türkiye",
        ],
      },
      {
        title: "2. Personal data processed",
        items: [
          "Identity: first name and surname",
          "Contact: e-mail address",
          "Survey answers: your evaluation of the event, topics of interest, comments and suggestions",
          "Transaction details: date and time of submission, the session attended, certificate number",
        ],
        after: ["Your IP address and location are not recorded with the survey."],
      },
      {
        title: "3. Purposes",
        items: [
          "Issuing your certificate of participation and sending it to your e-mail address",
          "Allowing certificates to be verified by their number",
          "Evaluating the event and planning future events and topics",
          "Preventing the same person from receiving more than one certificate for the same session",
        ],
      },
      {
        title: "4. Collection method and legal basis",
        paragraphs: [
          "Your data are collected electronically and directly from you through the survey form on the DSATalks website.",
          "They are processed on the legal grounds set out in Article 5(2) of the KVKK: processing being directly related to the performance of a contract (issuing the certificate you request), being necessary for the University to fulfil its legal obligations (carrying out educational and scientific activities), and being necessary for the legitimate interests of the University (evaluating the event), provided that your fundamental rights and freedoms are not harmed.",
        ],
      },
      {
        title: "5. Transfers",
        paragraphs: [
          "Within the University, your data are only accessed by the authorized people organizing the event; they are not shared with third parties or used for commercial purposes.",
          "To send certificates and run the system, your data may be processed on the hosting and e-mail services used by the University, in line with Articles 8 and 9 of the KVKK. They may be disclosed to public authorities where required and permitted by law.",
        ],
      },
      {
        title: "6. Retention",
        paragraphs: [
          "Your data are kept for as long as necessary for the purposes above. So that certificates can be verified, the name, surname and certificate number are kept for as long as the verification service runs. Afterwards the data are erased, destroyed or anonymized.",
        ],
      },
      {
        title: "7. Cookies",
        paragraphs: [
          "The DSATalks website does not use advertising or tracking (analytics) cookies.",
          "Your chosen language is stored only in your browser and is not sent to the server. A strictly necessary cookie keeps authorized administrators signed in to the admin panel.",
          "The Google Maps map in the Venue section is not loaded until you press “Show map”; once it is shown, Google’s own cookie and privacy policies apply.",
        ],
      },
      {
        title: "8. Your rights and how to apply",
        paragraphs: ["Under Article 11 of the KVKK you have the right to:"],
        items: [
          "learn whether your personal data are processed and request information about it,",
          "learn the purpose of the processing and whether the data are used accordingly,",
          "know the third parties in Türkiye or abroad to whom the data are transferred,",
          "request correction of incomplete or inaccurate data, and erasure or destruction under Article 7 of the KVKK, and that these actions be notified to third parties the data were transferred to,",
          "object to a result against you arising solely from automated analysis,",
          "claim compensation for damage caused by unlawful processing.",
        ],
        after: [
          "You can send requests concerning these rights in writing using the Data Subject Application Form on the University’s Personal Data Protection page, in person or through a notary to Balcalı Mah. Güney Kampüs 10 Sokak No:1U Sarıçam/Adana, or with a secure electronic signature to the registered e-mail (KEP) address atu@hs01.kep.tr. Applications are answered free of charge within thirty days at the latest.",
          "If you only want your survey response and certificate deleted, you can also write to the event’s contact address, quoting your certificate number.",
        ],
      },
    ],
  },
};

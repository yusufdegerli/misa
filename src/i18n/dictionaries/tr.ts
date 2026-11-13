const tr = {
  meta: {
    description: "925 ayar gümüş takı toptan kataloğu.",
  },
  a11y: {
    skipToContent: "İçeriğe geç",
    breadcrumb: "Konum",
    mainMenu: "Ana menü",
    home: "Mişa Silver ana sayfa",
  },
  nav: {
    collection: "Koleksiyon",
    categories: "Kategoriler",
    issues: "Sayılar",
    contact: "İletişim",
    menu: "Menü",
    close: "Kapat",
    language: "Dil",
  },
  hero: {
    issue: "Sayı {n}",
    discover: "Koleksiyonu keşfet",
    pdfCatalog: "PDF katalog",
    scroll: "Kaydır",
  },
  categories: {
    title: "Kategoriler",
    intro: "Her parça 925 ayar gümüş. Ürün kodu, gramaj ve minimum sipariş bilgisi her sayfada.",
    explore: "Keşfet",
    count: "{n} ürün",
    empty: "Bu kategoride henüz ürün yok.",
    plural: {
      rings: "Yüzükler",
      necklaces: "Kolyeler",
      earrings: "Küpeler",
      bracelets: "Bileklikler",
      sets: "Setler",
    },
    singular: {
      rings: "Yüzük",
      necklaces: "Kolye",
      earrings: "Küpe",
      bracelets: "Bileklik",
      sets: "Set",
    },
    /** How a product's display name is built from its own name and its type. */
    productName: "{name} {type}",
  },
  editorial: {
    eyebrow: "Editörün seçimi",
    title: "Işığı yakalayan, zamana dayanan.",
    body: "İnce işçilik ile sade formlar bir arada. Tüm parçalar 925 ayar gümüş ve toptan siparişe uygun.",
  },
  wholesale: {
    eyebrow: "Toptan sipariş",
    title: "Fiyat ve sipariş için doğrudan bize yazın.",
    body: "Ürün kodlarını iletmeniz yeterli. Ekibimiz fiyat, stok ve teslim bilgisiyle size döner.",
    email: "E-posta",
  },
  issues: {
    title: "Sayılar",
    intro: "Her sezon, ayrı bir sayı. Hepsi PDF olarak indirilebilir.",
    current: "Güncel",
    view: "Sayıyı gör",
  },
  product: {
    code: "Ürün kodu",
    purity: "Ayar",
    purityValue: "925 sterling gümüş",
    weight: "Ağırlık",
    grams: "≈ {g} g",
    sizes: "Ölçüler",
    minOrder: "Minimum sipariş",
    pieces: "{n} adet",
    askWhatsApp: "WhatsApp ile sor",
    whatsAppQuestion: "Merhaba, {code} ({name}) hakkında bilgi almak istiyorum.",
    sendEmail: "E-posta gönder",
    emailSubject: "{code} hakkında",
    priceNote: "Fiyat bilgisi talep üzerine paylaşılır. Mesajınıza ürün kodu otomatik eklenir.",
    sameIssue: "Aynı sayıdan",
    fullCollection: "Tüm koleksiyon",
    zoomHint: "Yakınlaştırmak için üzerinde gezin",
    photoPending: "Fotoğraf yakında",
    gallery: "Görsel {n}",
  },
  footer: {
    tagline: "925 ayar gümüş takı · Toptan satış",
    contact: "İletişim",
    language: "Dil",
    rights: "Tüm hakları saklıdır.",
  },
};

export default tr;

/** Shape every language's dictionary must match; Turkish is the source language. */
export type Dictionary = typeof tr;

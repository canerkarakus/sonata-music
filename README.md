# 🎵 SONATA - Modern Masaüstü Müzik Uygulaması

Modern ve kullanıcı dostu arayüzü ile cross-platform masaüstü müzik uygulaması. Electron ile geliştirilmiştir.

## ✨ Özellikler

### 🎯 Temel Özellikler
- **Modern UI/UX**: Dark theme ile modern tasarım
- **Müzik Çalma**: Tam özellikli müzik çalar
- **Çalma Listeleri**: Özel çalma listeleri oluşturma
- **Kullanıcı Hesapları**: Giriş/kayıt sistemi
- **Arama**: Şarkı ve sanatçı arama
- **Beğenilen Şarkılar**: Favori şarkıları kaydetme

### 🎨 Arayüz Özellikleri
- **Üç Panel Tasarım**: Sol sidebar, ana içerik, sağ sidebar
- **Responsive**: Farklı ekran boyutlarına uyum
- **Sidebar Yeniden Boyutlandırma**: Sürükle-bırak ile boyutlandırma
- **Window Controls**: Minimize, maximize, close butonları
- **Gradient Kartlar**: Görsel olarak çekici Daily Mix kartları

### 👥 Kullanıcı Sistemi
- **Kullanıcı Kayıt**: Normal kullanıcı kaydı
- **Sanatçı Başvurusu**: Sanatçı hesabı için başvuru sistemi
- **Profil Yönetimi**: Profil fotoğrafı ve bilgi güncelleme
- **İki Aşamalı Doğrulama**: Güvenlik için 2FA
- **Şifre Yönetimi**: Şifre değiştirme

### 🎵 Müzik Özellikleri
- **Oynatma Kontrolleri**: Play, pause, next, previous
- **Progress Bar**: İlerleme çubuğu ve manuel arama
- **Ses Kontrolü**: Volume slider ve mute
- **Tekrar Modları**: None, one, all
- **Karıştırma**: Shuffle özelliği
- **Şarkı Yükleme**: Sanatçılar için şarkı yükleme (Sadece sanatçı hesapları)

### ⚙️ Ayarlar
- **Güvenlik**: Şifre değiştirme, 2FA ayarları
- **Destek**: Yardım ve iletişim seçenekleri

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js**: v16.0.0 veya üzeri
- **npm**: Node.js ile birlikte gelir

### Hızlı Başlangıç
```bash
# Projeyi klonlayın
git clone https://github.com/sonata-music/sonata-desktop.git
cd sonata-desktop

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm start
```

### Geliştirme Modu
```bash
# Geliştirme modunda çalıştırın (DevTools açık)
npm run dev
```

### Production Build
```bash
# Windows için build
npm run build-win

# macOS için build (sadece macOS'ta)
npm run build-mac

# Linux için build
npm run build-linux

# Tüm platformlar için build
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulacaktır.

## 📁 Proje Yapısı

```
SonataV2/
├── main.js            # Electron ana process
├── preload.js         # Güvenli IPC köprüsü
├── index.html         # Ana HTML dosyası
├── styles.css         # CSS stilleri
├── renderer.js        # Frontend JavaScript (renderer process)
├── package.json       # NPM konfigürasyonu ve Electron build ayarları
├── README.md          # Bu dosya
└── assets/            # Medya dosyaları ve iconlar
    ├── icon.png       # Uygulama ikonu (PNG)
    ├── icon.ico       # Windows ikonu
    ├── icon.icns      # macOS ikonu
    └── profile.png    # Varsayılan profil resmi
```

## 🎮 Kullanım Kılavuzu

### İlk Kullanım
1. **Kayıt Olun**: Sağ üstteki "Giriş Yap" butonuna tıklayın
2. **Hesap Türü Seçin**: Kullanıcı veya Sanatçı hesabı seçin
3. **Bilgilerinizi Girin**: Gerekli bilgileri doldurun
4. **E-posta Doğrulama**: Gönderilen kodu girin

### Müzik Dinleme
1. **Şarkı Seçin**: Ana sayfadaki kartlardan birine tıklayın
2. **Oynatma Kontrolleri**: Alt kısımdaki player kontrollerini kullanın
3. **Ses Ayarı**: Sağ alttaki volume slider ile ses seviyesini ayarlayın

### Çalma Listesi Oluşturma
1. **Artı Butonuna Tıklayın**: Sol sidebar'daki + butonuna tıklayın
2. **Bilgileri Girin**: Liste adı ve açıklama girin
3. **Kapak Resmi**: İsteğe bağlı olarak kapak resmi seçin
4. **Oluştur**: "Oluştur" butonuna tıklayın

### Sanatçı Olarak Şarkı Yükleme
1. **Sanatçı Hesabıyla Giriş**: Onaylanmış sanatçı hesabıyla giriş yapın
2. **Profil Menüsü**: Profil fotoğrafına tıklayın
3. **Şarkı Yükle**: "Şarkı Yükle" seçeneğine tıklayın
4. **Dosyaları Seçin**: Müzik dosyası ve kapak resmi seçin
5. **Bilgileri Girin**: Şarkı adı, sanatçı adı vb. bilgileri girin

## 🛠️ Teknik Detaylar

### Teknolojiler
- **Electron**: Cross-platform masaüstü uygulama framework'ü
- **HTML5**: Yapısal işaretleme
- **CSS3**: Modern stillendirme ve animasyonlar
- **Vanilla JavaScript**: ES6+ özellikleri ile
- **IPC Communication**: Ana ve renderer process arası güvenli iletişim
- **Font Awesome**: İkonlar için
- **Local Storage**: Veri kalıcılığı

### CSS Özellikleri
- **CSS Variables**: Tema renkleri için
- **Flexbox & Grid**: Layout düzeni
- **Transitions**: Smooth animasyonlar
- **Custom Scrollbars**: Özelleştirilmiş kaydırma çubukları
- **Responsive Design**: Mobil uyumluluk

### JavaScript Özellikleri
- **Class-based Architecture**: Modern OOP yaklaşımı
- **Event Delegation**: Performanslı event handling
- **Local Storage**: Kullanıcı verisi kalıcılığı
- **Audio API**: Müzik çalma işlevselliği
- **File API**: Dosya yükleme işlemleri

## 🎨 Tasarım Renkleri

```css
:root {
    --bg-color: #0a0a0a;           /* Ana arka plan */
    --sidebar-bg: #131313;         /* Sidebar arka plan */
    --surface-bg: #1a1a1a;        /* Yüzey arka plan */
    --elevated-bg: #242424;        /* Yükseltilmiş elemanlar */
    --text-primary: #ffffff;        /* Ana metin */
    --text-secondary: #b3b3b3;     /* İkincil metin */
    --accent-color: #1ed760;       /* Vurgu rengi (Yeşil) */
    --border-color: #282828;       /* Kenarlık rengi */
}
```

## 🔄 Özelleştirme

### Tema Değiştirme
CSS değişkenlerini düzenleyerek tema renklerini değiştirebilirsiniz:

```css
:root {
    --accent-color: #ff6b6b;  /* Kırmızı tema için */
}
```

### Yeni Özellik Ekleme
1. HTML yapısını güncelleyin
2. CSS stillerini ekleyin
3. JavaScript işlevselliğini implement edin
4. Event listener'ları ekleyin

## 📱 Tarayıcı Desteği

- ✅ Chrome 70+
- ✅ Firefox 65+
- ✅ Safari 12+
- ✅ Edge 79+

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'e push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## 🐛 Bilinen Sorunlar

- Şu anda gerçek müzik dosyası çalma özelliği demo amaçlıdır
- Dosya yükleme işlemleri local storage ile simüle edilmektedir
- E-posta doğrulama sistemi demo amaçlıdır

## 🔮 Gelecek Özellikler

- [ ] Gerçek müzik streaming API entegrasyonu
- [ ] Şarkı sözleri görüntüleme
- [ ] Equalizer
- [ ] Sosyal özellikler (arkadaş ekleme, paylaşım)
- [ ] Dark/Light tema değiştirici
- [ ] Auto-updater (otomatik güncelleme)
- [ ] System tray integration
- [ ] Global keyboard shortcuts
- [ ] Çevrimdışı dinleme
- [ ] Last.fm entegrasyonu
- [ ] Native file format support
- [ ] MPRIS support (Linux)
- [ ] Windows Media Center integration

## 📞 İletişim

- **E-posta**: info@canerkarakus.com.tr
- **Website**: https://canerkarakus.com.tr
- **GitHub**: https://github.com/canerkarakus

---

💫 **SONATA** ile müziğin keyfini çıkarın! 🎵 
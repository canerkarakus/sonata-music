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
- **Progress Bar**: İlerleme çubuğu ve manuel arama + sürükleme desteği
- **Ses Kontrolü**: Volume slider ve mute
- **Tekrar Modları**: None, one, all (akıllı şarkı bitirme)
- **Karıştırma**: Shuffle özelliği
- **Şarkı Yükleme**: Sanatçılar için şarkı yükleme (Sadece sanatçı hesapları)
- **Tıkla ve Çal**: Şarkı kartlarına tıklayarak direkt oynatma
- **Gerçek Zamanlı Player**: Alt çubukta şarkı bilgileri ve ilerleme
- **Volume Kontrolü**: Progress bar üzerinden ses ayarı

### ⚙️ Ayarlar
- **Güvenlik**: Şifre değiştirme, 2FA ayarları
- **Destek**: Yardım ve iletişim seçenekleri

### 🎨 UI/UX İyileştirmeleri
- **Yeşil Tema**: Müzik temalı yeşil vurgu renkleri
- **Smooth Animasyonlar**: Butona tıklama ve hover efektleri
- **Visual Feedback**: Çalan şarkılar için özel görsel geri bildirim
- **Responsive Player**: Ekran boyutuna uyum sağlayan player bar
- **Icon Ortalama**: Tüm play/pause butonlarında mükemmel icon hizalaması
- **Drag & Drop**: Progress bar'da sürükleme ile konum ayarlama
- **Always Visible**: Volume slider göstergesi her zaman görünür
- **Click to Play**: Şarkı kartlarına tıklayarak anında oynatma

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- **Node.js**: v16.0.0 veya üzeri
- **npm**: Node.js ile birlikte gelir

### ⚠️ Önemli: E-posta Özellikleri İçin Gerekli Ayar
E-posta doğrulama, şifre sıfırlama ve bildirim özellikleri için `.env.local` dosyası oluşturmanız gereklidir:

```bash
# Proje ana dizininde .env.local dosyası oluşturun
touch .env.local

# Aşağıdaki içeriği .env.local dosyasına ekleyin:
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**Gmail için App Password oluşturma:**
1. Google hesabınızda 2FA'yı etkinleştirin
2. Hesap ayarlarından "App passwords" bölümüne gidin
3. "Mail" için yeni bir app password oluşturun
4. Bu password'u `EMAIL_PASS` değeri olarak kullanın

**⚠️ Uyarı**: `.env.local` dosyası olmadan e-posta doğrulama, sanatçı başvuruları ve şifre sıfırlama özellikleri çalışmayacaktır!

### 🔐 KRITIK GÜVENLİK UYARISI
**E-posta bilgilerinizi ASLA kimseyle paylaşmayın!**

❌ **YAPMAYINIZ:**
- E-posta şifrenizi kimseyle paylaşmayın
- `.env.local` dosyanızı GitHub'a yüklemeyin
- Yapay Zeka sistemleri (ChatGPT, Claude, Gemini vb.) ile e-posta bilgilerinizi paylaşmayın
- Discord, Telegram veya diğer platformlarda e-posta bilgilerinizi yazmayın
- Ekran görüntüsü alırken `.env.local` dosyasının açık olmamasına dikkat edin

✅ **YAPINIZ:**
- `.env.local` dosyasını sadece kendi bilgisayarınızda tutun
- Google App Password kullanın, normal şifrenizi kullanmayın
- Düzenli olarak App Password'unuzu yenileyin
- `.env.local` dosyasının `.gitignore` dosyasında listelendiğinden emin olun

**🚨 Önemli**: Bu proje zaten `.env.local` dosyasını `.gitignore` ile koruyor, ancak yine de dikkatli olun!

### Hızlı Başlangıç

#### 🚀 Tek Komut ile Tam Sistem (ÖNERİLEN)
```bash
# Projeyi klonlayın
git clone https://github.com/sonata-music/sonata-desktop.git
cd sonata-desktop

# E-posta ayarları için .env.local dosyası oluşturun (ÖNEMLİ!)
touch .env.local
# .env.local dosyasına yukarıdaki e-posta ayarlarını ekleyin

# Bağımlılıkları yükleyin
npm install

# Admin panel bağımlılıklarını kurun
npm run setup-admin

# Tüm sistemi başlatın (Backend + Admin Panel + Electron)
npm run start-all

# VEYA Windows için (.bat dosyası ile)
npm run start-all-win
```

#### 📱 Manuel Başlatma (Ayrı ayrı)
```bash
# Önce .env.local dosyasını oluşturun (ÖNEMLİ!)
touch .env.local
# .env.local dosyasına e-posta ayarlarını ekleyin

# Backend sunucusunu başlatın (Terminal 1)
node server.js

# Electron uygulamasını başlatın (Terminal 2)
npm start

# Admin paneli için (Terminal 3)
cd admin-panel
npm install
npm start
```

#### ⚡ Concurrently ile Paralel Başlatma
```bash
# Tüm servisleri paralel başlat
npm run full-start

# Geliştirme modu (DevTools açık)
npm run dev-all
```

### Sistem Gereksinimleri
- **Backend**: http://localhost:3001 (Express.js)
- **Electron App**: Ana uygulama  
- **Admin Panel**: http://localhost:5000 (Web arayüzü)

### 🎯 Başlatma Seçenekleri
| Komut | Açıklama |
|-------|----------|
| `npm run start-all` | Tüm sistemi sıralı başlatır (Backend → Admin Panel → Electron) |
| `npm run start-all-win` | Windows .bat dosyası ile tüm sistemi başlatır |
| `npm run full-start` | Concurrently ile paralel başlatır |
| `npm run dev-all` | Geliştirme modu ile paralel başlatır |

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
Sonata/
├── main.js            # Electron ana process
├── preload.js         # Güvenli IPC köprüsü
├── index.html         # Ana HTML dosyası
├── styles.css         # CSS stilleri
├── renderer.js        # Frontend JavaScript (renderer process)
├── server.js          # Backend sunucusu (Express.js)
├── package.json       # NPM konfigürasyonu ve Electron build ayarları
├── .env.local         # E-posta konfigürasyonu (kullanıcı tarafından oluşturulacak)
├── README.md          # Bu dosya
├── assets/            # Medya dosyaları ve iconlar
│   ├── icon.png       # Uygulama ikonu (PNG)
│   ├── icon.ico       # Windows ikonu
│   ├── icon.icns      # macOS ikonu
│   └── profile.png    # Varsayılan profil resmi
├── database/          # JSON veritabanı dosyaları
│   ├── users.json     # Kullanıcı verileri
│   ├── artists.json   # Sanatçı verileri
│   └── verification_codes.json # Doğrulama kodları
└── admin-panel/       # Web admin paneli
    ├── server.js      # Admin panel sunucusu
    ├── package.json   # Admin panel bağımlılıkları
    └── public/
        ├── index.html # Admin panel HTML
        ├── style.css  # Admin panel CSS
        └── script.js  # Admin panel JavaScript
```

## 🎮 Kullanım Kılavuzu

### İlk Kullanım
1. **Kayıt Olun**: Sağ üstteki "Giriş Yap" butonuna tıklayın
2. **Hesap Türü Seçin**: Kullanıcı veya Sanatçı hesabı seçin
3. **Bilgilerinizi Girin**: Gerekli bilgileri doldurun
4. **E-posta Doğrulama**: Gönderilen kodu girin

### Müzik Dinleme
1. **Şarkı Seçin**: Ana sayfadaki şarkı kartının herhangi bir yerine tıklayın
2. **Oynatma Kontrolleri**: Alt kısımdaki player kontrollerini kullanın
3. **Progress Bar**: Sürükleyerek şarkıda istediğiniz yere atlayın
4. **Ses Ayarı**: Sağ alttaki volume slider ile ses seviyesini ayarlayın
5. **Repeat Kontrolü**: Repeat butonu ile şarkı bitişini kontrol edin

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

## 🔧 Backend Sistemi

### Backend Server (Port 3001)
- **Express.js**: RESTful API sunucusu
- **CORS**: Cross-origin istekleri için
- **bcryptjs**: Şifre hashleme
- **jsonwebtoken**: JWT authentication
- **nodemailer**: E-posta gönderimi
- **JSON Database**: Dosya tabanlı veritabanı sistemi

### API Endpoints
```
POST /api/register          # Kullanıcı kaydı
POST /api/artist-application # Sanatçı başvurusu
POST /api/verify-email       # E-posta doğrulama
POST /api/login             # Giriş yapma
POST /api/resend-verification # Doğrulama kodu tekrar gönder
GET  /api/health            # Backend durumu
GET  /api/songs/approved     # Onaylanan şarkıları getir
POST /api/songs/:songId/play # Şarkı çalma sayısını artır
```

### Admin API Endpoints
```
GET  /api/admin/users       # Tüm kullanıcıları listele
POST /api/admin/ban-user    # Kullanıcı hesabını kapat
POST /api/admin/unban-user  # Hesap yasağını kaldır
GET  /api/admin/songs       # Tüm şarkıları listele (pending, approved, rejected)
POST /api/admin/approve-song # Şarkı onaylama
POST /api/admin/reject-song  # Şarkı reddetme
POST /api/admin/delete-song  # Şarkı silme
```

### Backend Başlatma
```bash
# Ana backend sunucusu (Port 3001)
node server.js
```

## 🛡️ Admin Panel Sistemi

### Web Admin Panel (Port 5000)
Sonata Music için tam özellikli web tabanlı yönetim paneli.

### Özellikler
- **Kullanıcı Yönetimi**: Tüm kullanıcı ve sanatçıları görüntüleme
- **Hesap Kontrolü**: Hesapları kapatma/açma yetkisi
- **E-posta Bildirimleri**: Hesap kapatıldığında otomatik mail gönderimi
- **Filtreleme & Arama**: Gelişmiş filtreleme ve arama özellikleri
- **İstatistikler**: Kullanıcı, sanatçı, yasaklı hesap sayıları
- **Responsive Design**: Mobil uyumlu tasarım
- **Şarkı Yönetimi**: Onaylanan, bekleyen ve reddedilen şarkıları yönetme
- **Play/Pause Kontrolleri**: Admin panelinde şarkıları dinleme
- **Şarkı Onay Sistemi**: Pending şarkıları onaylama/reddetme
- **Şarkı Silme**: Yayındaki ve reddedilen şarkıları silme

### Admin Panel Başlatma
```bash
# Admin panel klasörüne gidin
cd admin-panel

# Bağımlılıkları yükleyin
npm install

# Admin paneli başlatın (Port 5000)
npm start

# Geliştirme modu (nodemon ile)
npm run dev
```

### Admin Panel Erişimi
- **URL**: http://localhost:5000
- **Backend Bağlantısı**: http://localhost:3001 (proxy ile)

### Admin Panel Yapısı
```
admin-panel/
├── server.js              # Express sunucusu (Port 5000)
├── package.json           # NPM bağımlılıkları
└── public/
    ├── index.html         # Ana HTML dosyası
    ├── style.css          # Admin panel stilleri
    └── script.js          # Frontend JavaScript
```

### Admin Panel Özellikleri
- **Dashboard**: Toplam kullanıcı, sanatçı, yasaklı hesap sayıları
- **Kullanıcı Listesi**: Tüm kullanıcılar ve sanatçılar tek tabloda
- **Filtreleme**: Hesap türü, durum ve arama filtreleri
- **Ban/Unban**: Hesap kapatma/açma işlemleri
- **E-posta Bildirimi**: Hesap kapatıldığında kullanıcıya otomatik mail
- **Şarkı Yönetimi**: 3 sekme (Yayında, Onay Bekleyen, Reddedilen)
- **Şarkı Preview**: Admin panelinde şarkıları dinleme imkanı
- **Onay/Red Sistemi**: Tek tıkla şarkı onaylama/reddetme
- **Toplu İşlemler**: Çoklu şarkı seçimi ve toplu işlemler
- **Görsel Geri Bildirim**: Modern kartlar ve durum göstergeleri

### Hesap Kapatma İşlemi
1. Admin panelde kullanıcıyı seçin
2. "Hesabı Kapat" butonuna tıklayın
3. Kapatma nedenini yazın
4. Onaylayın
5. Kullanıcıya otomatik e-posta gönderilir

## 🔮 Gelecek Özellikler

- [ ] Gerçek müzik streaming API entegrasyonu
- [ ] Şarkı sözleri görüntüleme
- [ ] Equalizer ve ses efektleri
- [ ] Sosyal özellikler (arkadaş ekleme, paylaşım)
- [ ] Dark/Light tema değiştirici
- [ ] Auto-updater (otomatik güncelleme)
- [ ] System tray integration
- [ ] Global keyboard shortcuts
- [ ] Çevrimdışı dinleme
- [ ] Last.fm entegrasyonu
- [ ] Native file format support (FLAC, ALAC, etc.)
- [ ] MPRIS support (Linux)
- [ ] Windows Media Center integration
- [ ] AI-powered music recommendations
- [ ] Crossfade between tracks
- [ ] Gapless playback
- [ ] Advanced playlist management
- [ ] Music visualization
- [ ] Cloud sync between devices

## ❓ Sık Sorulan Sorular (FAQ)

### E-posta Güvenliği

**S: E-posta şifremi unuttuysam ne yapmalıyım?**
C: Google App Password'unuzu yeniden oluşturun ve `.env.local` dosyasını güncelleyin.

**S: Hangi e-posta servislerini kullanabilirim?**
C: Gmail önerilir, ancak diğer servisleri de kullanabilirsiniz. `EMAIL_SERVICE` değerini uygun şekilde ayarlayın.

**S: AI asistanından yardım alırken ne yapmalıyım?**
C: ASLA gerçek e-posta bilgilerinizi paylaşmayın. Örnek veriler kullanın:
```
EMAIL_USER=example@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
```

**S: `.env.local` dosyam yanlışlıkla GitHub'a yüklenirse ne yapmalıyım?**
C: 
1. Hemen App Password'unuzu iptal edin
2. Yeni bir App Password oluşturun  
3. Repository'den dosyayı silin
4. `.gitignore` kontrolü yapın

### Teknik Sorunlar

**S: E-posta gönderimi çalışmıyor, ne yapmalıyım?**
C: 
1. `.env.local` dosyasının doğru dizinde olduğunu kontrol edin
2. Gmail'de 2FA'nın aktif olduğunu kontrol edin
3. App Password'un doğru olduğunu kontrol edin
4. Gmail'in "less secure apps" ayarını kontrol edin

## 📞 İletişim

- **E-posta**: info@canerkarakus.com.tr
- **Website**: https://canerkarakus.com.tr
- **GitHub**: https://github.com/canerkarakus

---

💫 **SONATA** ile müziğin keyfini çıkarın! 🎵 

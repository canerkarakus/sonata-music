const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sonata-music-secret-key-2024';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Email transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// JSON Database Implementation
const DB_DIR = path.join(__dirname, 'database');
const USERS_FILE = path.join(DB_DIR, 'users.json');
const ARTISTS_FILE = path.join(DB_DIR, 'artists.json');
const VERIFICATION_CODES_FILE = path.join(DB_DIR, 'verification_codes.json');

// Initialize database directory and files
function initDatabase() {
    try {
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR);
        }
        
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, JSON.stringify([]));
        }
        
        if (!fs.existsSync(ARTISTS_FILE)) {
            fs.writeFileSync(ARTISTS_FILE, JSON.stringify([]));
        }
        
        if (!fs.existsSync(VERIFICATION_CODES_FILE)) {
            fs.writeFileSync(VERIFICATION_CODES_FILE, JSON.stringify([]));
        }
        
        console.log('📊 JSON veritabanı dosyaları hazırlandı');
    } catch (error) {
        console.error('❌ Veritabanı başlatma hatası:', error);
    }
}

// Database helper functions
function readJsonFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`JSON okuma hatası ${filePath}:`, error);
        return [];
    }
}

function writeJsonFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`JSON yazma hatası ${filePath}:`, error);
        return false;
    }
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Database operations
const db = {
    users: {
        findByEmail: (email) => {
            const users = readJsonFile(USERS_FILE);
            return users.find(user => user.email === email);
        },
        
        create: (userData) => {
            const users = readJsonFile(USERS_FILE);
            const newUser = {
                id: generateId(),
                ...userData,
                isVerified: false,
                accountType: 'user',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            users.push(newUser);
            writeJsonFile(USERS_FILE, users);
            return newUser;
        },
        
        updateVerification: (email) => {
            const users = readJsonFile(USERS_FILE);
            const userIndex = users.findIndex(user => user.email === email);
            if (userIndex !== -1) {
                users[userIndex].isVerified = true;
                users[userIndex].updatedAt = new Date().toISOString();
                writeJsonFile(USERS_FILE, users);
                return true;
            }
            return false;
        }
    },
    
    artists: {
        findByEmail: (email) => {
            const artists = readJsonFile(ARTISTS_FILE);
            return artists.find(artist => artist.email === email);
        },
        
        create: (artistData) => {
            const artists = readJsonFile(ARTISTS_FILE);
            const newArtist = {
                id: generateId(),
                ...artistData,
                isApproved: false,
                isRejected: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            artists.push(newArtist);
            writeJsonFile(ARTISTS_FILE, artists);
            return newArtist;
        },
        
        approve: (email, password) => {
            const artists = readJsonFile(ARTISTS_FILE);
            const artistIndex = artists.findIndex(artist => artist.email === email);
            if (artistIndex !== -1) {
                artists[artistIndex].isApproved = true;
                artists[artistIndex].password = password;
                artists[artistIndex].updatedAt = new Date().toISOString();
                writeJsonFile(ARTISTS_FILE, artists);
                return artists[artistIndex];
            }
            return null;
        },
        
        reject: (email, reason) => {
            const artists = readJsonFile(ARTISTS_FILE);
            const artistIndex = artists.findIndex(artist => artist.email === email);
            if (artistIndex !== -1) {
                artists[artistIndex].isRejected = true;
                artists[artistIndex].rejectionReason = reason;
                artists[artistIndex].updatedAt = new Date().toISOString();
                writeJsonFile(ARTISTS_FILE, artists);
                return artists[artistIndex];
            }
            return null;
        }
    },
    
    verificationCodes: {
        create: (email, code, type) => {
            const codes = readJsonFile(VERIFICATION_CODES_FILE);
            const newCode = {
                id: generateId(),
                email,
                code,
                type,
                used: false,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
                createdAt: new Date().toISOString()
            };
            codes.push(newCode);
            writeJsonFile(VERIFICATION_CODES_FILE, codes);
            return newCode;
        },
        
        findValid: (email, code, type) => {
            const codes = readJsonFile(VERIFICATION_CODES_FILE);
            return codes.find(c => 
                c.email === email && 
                c.code === code && 
                c.type === type && 
                !c.used && 
                new Date(c.expiresAt) > new Date()
            );
        },
        
        markUsed: (id) => {
            const codes = readJsonFile(VERIFICATION_CODES_FILE);
            const codeIndex = codes.findIndex(c => c.id === id);
            if (codeIndex !== -1) {
                codes[codeIndex].used = true;
                writeJsonFile(VERIFICATION_CODES_FILE, codes);
                return true;
            }
            return false;
        },
        
        invalidateOld: (email, type) => {
            const codes = readJsonFile(VERIFICATION_CODES_FILE);
            const updatedCodes = codes.map(c => {
                if (c.email === email && c.type === type && !c.used) {
                    c.used = true;
                }
                return c;
            });
            writeJsonFile(VERIFICATION_CODES_FILE, updatedCodes);
        }
    }
};

// Initialize database
initDatabase();

// Utility functions
const generateVerificationCode = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

const generatePassword = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};

const hashPassword = async (password) => {
    return await bcrypt.hash(password, 12);
};

const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

// Email gönderme fonksiyonları
const sendVerificationEmail = async (email, code) => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Sonata - Email Doğrulama Kodu',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1db954;">Sonata Music</h2>
                <h3>Email Doğrulama</h3>
                <p>Merhaba,</p>
                <p>Sonata Music hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
                <div style="background: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                    ${code}
                </div>
                <p>Bu kod 10 dakika geçerlidir.</p>
                <p>Eğer bu işlemi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
                <br>
                <p>Saygılarımızla,<br>Sonata Music Ekibi</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

const sendArtistApprovalEmail = async (artistData) => {
    const approvalToken = generateToken({ email: artistData.email, type: 'approval' });
    const rejectionToken = generateToken({ email: artistData.email, type: 'rejection' });
    
    const approvalUrl = `http://localhost:${PORT}/admin/approve-artist?token=${approvalToken}`;
    const rejectionUrl = `http://localhost:${PORT}/admin/reject-artist?token=${rejectionToken}`;

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: 'info@canerkarakus.com.tr',
        subject: 'Sonata - Yeni Sanatçı Başvurusu',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1db954;">Sonata Music - Admin Panel</h2>
                <h3>Yeni Sanatçı Başvurusu</h3>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4>Başvuru Bilgileri:</h4>
                    <p><strong>Sanatçı Adı:</strong> ${artistData.artistName}</p>
                    <p><strong>Email:</strong> ${artistData.email}</p>
                    <p><strong>Doğum Tarihi:</strong> ${artistData.birthDate}</p>
                    <p><strong>Telefon:</strong> ${artistData.phone}</p>
                    <p><strong>Sosyal Medya:</strong> <a href="${artistData.socialMediaLink}" target="_blank">${artistData.socialMediaLink}</a></p>
                    ${artistData.bio ? `<p><strong>Biyografi:</strong><br>${artistData.bio}</p>` : ''}
                    <p><strong>Başvuru Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${approvalUrl}" style="background: #1db954; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block;">
                        ✅ ONAYLA
                    </a>
                    <a href="${rejectionUrl}" style="background: #e22134; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block;">
                        ❌ REDDET
                    </a>
                </div>

                <p><small>Bu emaildeki linkler tek kullanımlıktır ve güvenlik nedeniyle 7 gün geçerlidir.</small></p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

const sendArtistApprovedEmail = async (email, tempPassword) => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Sonata - Sanatçı Başvurunuz Onaylandı! 🎉',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1db954;">Sonata Music</h2>
                <h3>Tebrikler! Sanatçı Başvurunuz Onaylandı 🎉</h3>
                <p>Merhaba,</p>
                <p>Sonata Music sanatçı başvurunuz başarıyla onaylandı! Artık platformumuza şarkılarınızı yükleyebilirsiniz.</p>
                
                <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4>Giriş Bilgileriniz:</h4>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Geçici Şifre:</strong> <span style="background: #e8e8e8; padding: 5px 10px; border-radius: 4px; font-family: monospace;">${tempPassword}</span></p>
                </div>

                <p><strong>Önemli:</strong> Güvenliğiniz için ilk girişinizden sonra şifrenizi değiştirmenizi öneriyoruz.</p>
                
                <p>Şimdi Sonata Music uygulamasını açarak giriş yapabilir ve müzik yolculuğunuza başlayabilirsiniz!</p>
                
                <br>
                <p>Müzik dünyasına hoş geldiniz!<br>Sonata Music Ekibi</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

const sendArtistRejectedEmail = async (email, reason = 'Başvuru kriterleri karşılanmadı') => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Sonata - Sanatçı Başvurunuz Hakkında',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1db954;">Sonata Music</h2>
                <h3>Sanatçı Başvurunuz Hakkında</h3>
                <p>Merhaba,</p>
                <p>Maalesef Sonata Music sanatçı başvurunuz şu anda kabul edilemedi.</p>
                
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                    <p><strong>Ret Nedeni:</strong> ${reason}</p>
                </div>

                <p>Ancak bu durum kalıcı değildir. Profilinizi geliştirdikten sonra tekrar başvurabilirsiniz.</p>
                <p>Sorularınız için bize ulaşabilirsiniz.</p>
                
                <br>
                <p>Saygılarımızla,<br>Sonata Music Ekibi</p>
            </div>
        `
    };

    return await transporter.sendMail(mailOptions);
};

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Sonata Music Backend çalışıyor!',
        timestamp: new Date().toISOString()
    });
});

// Kullanıcı Kayıt
app.post('/api/register', async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Email zaten var mı kontrol et
        const existingUser = db.users.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'Bu email adresi zaten kullanılıyor' });
        }

        // Şifreyi hash'le
        const hashedPassword = await hashPassword(password);
        
        // Doğrulama kodu oluştur
        const verificationCode = generateVerificationCode();

        try {
            // Kullanıcıyı kaydet
            db.users.create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone,
                verificationCode
            });
            
            // Doğrulama kodu kaydet
            db.verificationCodes.create(email, verificationCode, 'register');

            try {
                // Email gönder
                await sendVerificationEmail(email, verificationCode);
                res.status(201).json({ 
                    message: 'Kayıt başarılı! Email adresinize doğrulama kodu gönderildi.',
                    email: email
                });
            } catch (emailError) {
                console.error('Email gönderilemedi:', emailError);
                res.status(201).json({ 
                    message: 'Kayıt başarılı ama email gönderilemedi. Lütfen tekrar deneyin.',
                    email: email
                });
            }
        } catch (dbError) {
            console.error('Veritabanı hatası:', dbError);
            res.status(500).json({ message: 'Kayıt sırasında hata oluştu' });
        }
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Sanatçı Başvuru
app.post('/api/artist-application', async (req, res) => {
    try {
        const { artistName, email, birthDate, phone, socialMediaLink, bio } = req.body;

        // Email zaten var mı kontrol et
        const existingArtist = db.artists.findByEmail(email);
        if (existingArtist) {
            return res.status(400).json({ message: 'Bu email adresi ile daha önce başvuru yapılmış' });
        }

        try {
            // Sanatçı başvurusunu kaydet
            db.artists.create({
                artistName,
                email,
                birthDate,
                phone,
                socialMediaLink,
                bio
            });

            try {
                // Admin'e email gönder
                await sendArtistApprovalEmail({
                    artistName, email, birthDate, phone, socialMediaLink, bio
                });
                
                res.status(201).json({ 
                    message: 'Başvurunuz alındı! En kısa sürede dönüş yapacağız.'
                });
            } catch (emailError) {
                console.error('Admin emaili gönderilemedi:', emailError);
                res.status(201).json({ 
                    message: 'Başvurunuz alındı ancak bildirim emaili gönderilemedi.'
                });
            }
        } catch (dbError) {
            console.error('Sanatçı kaydı hatası:', dbError);
            res.status(500).json({ message: 'Başvuru sırasında hata oluştu' });
        }
    } catch (error) {
        console.error('Sanatçı başvuru hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Email Doğrulama
app.post('/api/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;

        // Doğrulama kodunu kontrol et
        const verificationRecord = db.verificationCodes.findValid(email, code, 'register');
        if (!verificationRecord) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş doğrulama kodu' });
        }

        try {
            // Kullanıcıyı doğrulanmış olarak işaretle
            const updated = db.users.updateVerification(email);
            if (!updated) {
                return res.status(400).json({ message: 'Kullanıcı bulunamadı' });
            }
            
            // Doğrulama kodunu kullanılmış olarak işaretle
            db.verificationCodes.markUsed(verificationRecord.id);

            res.status(200).json({ 
                message: 'Email başarıyla doğrulandı! Artık giriş yapabilirsiniz.'
            });
        } catch (dbError) {
            console.error('Doğrulama güncellemesi hatası:', dbError);
            res.status(500).json({ message: 'Doğrulama sırasında hata oluştu' });
        }
    } catch (error) {
        console.error('Email doğrulama hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Giriş Yap
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, accountType = 'user' } = req.body;

        if (accountType === 'user') {
            // Kullanıcı girişi
            const user = db.users.findByEmail(email);
            if (!user) {
                return res.status(400).json({ message: 'Email bulunamadı' });
            }

            if (!user.isVerified) {
                return res.status(400).json({ message: 'Email adresiniz doğrulanmamış. Lütfen emailinizi kontrol edin.' });
            }

            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Email veya şifre hatalı' });
            }

            const token = generateToken({ 
                userId: user.id, 
                email: user.email, 
                accountType: 'user' 
            });

            res.status(200).json({
                message: 'Giriş başarılı',
                token: token,
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    accountType: 'user'
                }
            });
        } else {
            // Sanatçı girişi
            const artist = db.artists.findByEmail(email);
            if (!artist) {
                return res.status(400).json({ message: 'Email bulunamadı' });
            }

            if (!artist.isApproved) {
                return res.status(400).json({ message: 'Hesap henüz onaylanmamış' });
            }

            if (!artist.password) {
                return res.status(400).json({ message: 'Hesabınız henüz aktifleştirilmemiş' });
            }

            const isPasswordValid = await bcrypt.compare(password, artist.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Email veya şifre hatalı' });
            }

            const token = generateToken({ 
                userId: artist.id, 
                email: artist.email, 
                accountType: 'artist' 
            });

            res.status(200).json({
                message: 'Giriş başarılı',
                token: token,
                user: {
                    id: artist.id,
                    artistName: artist.artistName,
                    email: artist.email,
                    phone: artist.phone,
                    accountType: 'artist'
                }
            });
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Admin Sanatçı Onaylama
app.get('/admin/approve-artist', async (req, res) => {
    try {
        const { token } = req.query;

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'approval') {
            return res.status(400).send('Geçersiz onay token\'ı');
        }

        const email = decoded.email;

        // Sanatçıyı bul
        const artist = db.artists.findByEmail(email);
        if (!artist) {
            return res.status(404).send('Sanatçı bulunamadı');
        }

        if (artist.isApproved) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2>Bu sanatçı zaten onaylanmış</h2>
                        <p>Sanatçı: ${artist.artistName}</p>
                        <p>Email: ${artist.email}</p>
                    </body>
                </html>
            `);
        }

        // Geçici şifre oluştur
        const tempPassword = generatePassword();
        const hashedPassword = await hashPassword(tempPassword);

        try {
            // Sanatçıyı onayla ve şifre ata
            db.artists.approve(email, hashedPassword);

            try {
                // Sanatçıya onay emaili gönder
                await sendArtistApprovedEmail(email, tempPassword);
                
                res.send(`
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <title>Sanatçı Onaylandı</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
                            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
                                <h2 style="color: #1db954;">✅ Sanatçı Başarıyla Onaylandı</h2>
                                <p><strong>Sanatçı:</strong> ${artist.artistName}</p>
                                <p><strong>Email:</strong> ${artist.email}</p>
                                <p style="color: #28a745;">Sanatçıya giriş bilgileri emaille gönderildi.</p>
                                <hr style="margin: 20px 0;">
                                <p><small>Bu pencereyi kapatabilirsiniz.</small></p>
                            </div>
                        </body>
                    </html>
                `);
            } catch (emailError) {
                console.error('Onay emaili gönderilemedi:', emailError);
                res.send(`
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <title>Sanatçı Onaylandı</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
                            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
                                <h2 style="color: #1db954;">✅ Sanatçı Onaylandı</h2>
                                <p><strong>Sanatçı:</strong> ${artist.artistName}</p>
                                <p><strong>Email:</strong> ${artist.email}</p>
                                <p style="color: #dc3545;">⚠️ Email gönderilemedi ancak onaylama tamamlandı.</p>
                                <p><strong>Geçici Şifre:</strong> <code>${tempPassword}</code></p>
                                <hr style="margin: 20px 0;">
                                <p><small>Şifreyi manuel olarak sanatçıya iletin.</small></p>
                            </div>
                        </body>
                    </html>
                `);
            }
        } catch (dbError) {
            console.error('Sanatçı onaylama hatası:', dbError);
            res.status(500).send('Onaylama sırasında hata oluştu');
        }
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        res.status(400).send('Geçersiz veya süresi dolmuş token');
    }
});

// Admin Sanatçı Reddetme
app.get('/admin/reject-artist', async (req, res) => {
    try {
        const { token } = req.query;

        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.type !== 'rejection') {
            return res.status(400).send('Geçersiz ret token\'ı');
        }

        const email = decoded.email;

        // Sanatçıyı bul
        const artist = db.artists.findByEmail(email);
        if (!artist) {
            return res.status(404).send('Sanatçı bulunamadı');
        }

        if (artist.isRejected) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2>Bu sanatçı zaten reddedilmiş</h2>
                        <p>Sanatçı: ${artist.artistName}</p>
                        <p>Email: ${artist.email}</p>
                    </body>
                </html>
            `);
        }

        if (artist.isApproved) {
            return res.send(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h2>Bu sanatçı zaten onaylanmış, reddedemezsiniz</h2>
                        <p>Sanatçı: ${artist.artistName}</p>
                        <p>Email: ${artist.email}</p>
                    </body>
                </html>
            `);
        }

        // Reddetme formu göster
        res.send(`
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Sanatçı Reddet</title>
                </head>
                <body style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
                    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px;">
                        <h2 style="color: #e22134;">Sanatçı Başvurusunu Reddet</h2>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p><strong>Sanatçı:</strong> ${artist.artistName}</p>
                            <p><strong>Email:</strong> ${artist.email}</p>
                            <p><strong>Telefon:</strong> ${artist.phone}</p>
                            <p><strong>Sosyal Medya:</strong> <a href="${artist.socialMediaLink}" target="_blank">${artist.socialMediaLink}</a></p>
                            ${artist.bio ? `<p><strong>Biyografi:</strong> ${artist.bio}</p>` : ''}
                        </div>
                        
                        <form method="POST" action="/admin/reject-artist-confirm">
                            <input type="hidden" name="email" value="${email}">
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 8px; font-weight: bold;">Reddetme Nedeni:</label>
                                <textarea name="reason" rows="4" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" placeholder="Başvuru ret nedenini yazın..." required></textarea>
                            </div>
                            <div style="text-align: center;">
                                <button type="submit" style="background: #e22134; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
                                    Başvuruyu Reddet
                                </button>
                            </div>
                        </form>
                    </div>
                </body>
            </html>
        `);
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        res.status(400).send('Geçersiz veya süresi dolmuş token');
    }
});

// Admin Sanatçı Reddetme Onayı
app.post('/admin/reject-artist-confirm', async (req, res) => {
    try {
        const { email, reason } = req.body;

        try {
            // Sanatçıyı reddet
            const artist = db.artists.reject(email, reason);
            if (!artist) {
                return res.status(404).send('Sanatçı bulunamadı');
            }

            try {
                // Sanatçıya ret emaili gönder
                await sendArtistRejectedEmail(email, reason);
                
                res.send(`
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <title>Başvuru Reddedildi</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
                            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
                                <h2 style="color: #e22134;">❌ Başvuru Reddedildi</h2>
                                <p><strong>Sanatçı:</strong> ${artist.artistName}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Ret Nedeni:</strong> ${reason}</p>
                                <p style="color: #28a745;">Sanatçıya bilgilendirme emaili gönderildi.</p>
                                <hr style="margin: 20px 0;">
                                <p><small>Bu pencereyi kapatabilirsiniz.</small></p>
                            </div>
                        </body>
                    </html>
                `);
            } catch (emailError) {
                console.error('Ret emaili gönderilemedi:', emailError);
                res.send(`
                    <html>
                        <head>
                            <meta charset="utf-8">
                            <title>Başvuru Reddedildi</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5;">
                            <div style="background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
                                <h2 style="color: #e22134;">❌ Başvuru Reddedildi</h2>
                                <p><strong>Sanatçı:</strong> ${artist.artistName}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p style="color: #dc3545;">⚠️ Email gönderilemedi ancak reddetme tamamlandı.</p>
                                <hr style="margin: 20px 0;">
                                <p><small>Manuel olarak sanatçıyı bilgilendirin.</small></p>
                            </div>
                        </body>
                    </html>
                `);
            }
        } catch (dbError) {
            console.error('Reddetme hatası:', dbError);
            res.status(500).send('Reddetme sırasında hata oluştu');
        }
    } catch (error) {
        console.error('Reddetme onayı hatası:', error);
        res.status(500).send('Sunucu hatası');
    }
});

// Doğrulama kodu tekrar gönderme
app.post('/api/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        // Kullanıcının varlığını kontrol et
        const user = db.users.findByEmail(email);
        if (!user || user.isVerified) {
            return res.status(400).json({ message: 'Kullanıcı bulunamadı veya zaten doğrulanmış' });
        }

        try {
            // Eski kodları pasif yap
            db.verificationCodes.invalidateOld(email, 'register');

            // Yeni doğrulama kodu oluştur
            const verificationCode = generateVerificationCode();
            db.verificationCodes.create(email, verificationCode, 'register');

            try {
                // Email gönder
                await sendVerificationEmail(email, verificationCode);
                res.status(200).json({ 
                    message: 'Yeni doğrulama kodu email adresinize gönderildi.'
                });
            } catch (emailError) {
                console.error('Email gönderilemedi:', emailError);
                res.status(500).json({ 
                    message: 'Email gönderilemedi. Lütfen tekrar deneyin.'
                });
            }
        } catch (dbError) {
            console.error('Kod oluşturma hatası:', dbError);
            res.status(500).json({ message: 'Doğrulama kodu oluşturulamadı' });
        }
    } catch (error) {
        console.error('Doğrulama kodu tekrar gönderme hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası' });
    }
});

// Server başlatma
app.listen(PORT, () => {
    console.log(`🎵 Sonata Music Backend Server ${PORT} portunda çalışıyor`);
    console.log(`📧 SMTP Konfigürasyonu: ${process.env.SMTP_HOST ? '✅ Yapılandırılmış' : '❌ Eksik'}`);
    console.log(`💾 Veritabanı: JSON dosyaları (database/ klasörü)`);
    console.log(`🔐 JWT Secret: ${JWT_SECRET ? '✅ Ayarlanmış' : '❌ Varsayılan kullanılıyor'}`);
});

module.exports = app; 
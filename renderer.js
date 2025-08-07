// Sonata Music App - Main JavaScript File

class SonataApp {
    constructor() {
        this.currentUser = null;
        this.isPlaying = false;
        this.currentSong = null;
        this.currentTime = 0;
        this.duration = 0;
        this.volume = 0.5;
        this.playlists = [];
        this.likedSongs = [];
        this.songs = [];
        this.currentPlaylist = [];
        this.currentIndex = 0;
        this.isShuffled = false;
        this.repeatMode = 'none'; // none, one, all
        this.audioElement = new Audio();
        this.backendUrl = 'http://localhost:3001';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.setupAudioPlayer();
        this.setupModals();
        this.setupSidebarResizing();
        this.loadSampleData();
        this.testBackendConnection();
    }

    // Backend bağlantı testi
    async testBackendConnection() {
        console.log('🔌 Backend bağlantısı test ediliyor...');
        
        // 2 saniye bekle ki backend başlasın
        setTimeout(async () => {
            try {
                const response = await this.makeApiCall('/api/health');
                if (response.success) {
                    console.log('✅ Backend bağlantısı başarılı!', response.data);
                    // Toast mesajı kaldırıldı
                } else {
                    console.error('❌ Backend bağlantı hatası:', response);
                    this.showToast('❌ Backend bağlantı sorunu!', 'error');
                }
            } catch (error) {
                console.error('❌ Backend test hatası:', error);
                this.showToast('⚠️ Backend sunucusu çalışmıyor!', 'error');
            }
        }, 2000);
    }



    setupEventListeners() {
        console.log('🔧 Event listener sistemi kuriliyor...');
        
        // Global event delegation - tek bir listener ile tüm tıklamaları yakala
        document.addEventListener('click', (e) => {
            console.log('🖱️ Tıklanan element:', e.target.id || e.target.className);
            
            const target = e.target;
            const id = target.id;
            const classes = target.classList;
            
            // Navigation buttons
            if (id === 'homeBtn') {
                console.log('🏠 Home button clicked');
                this.goHome();
            }
            else if (id === 'backBtn') {
                console.log('⬅️ Back button clicked');
                this.goBack();
            }
            else if (id === 'forwardBtn') {
                console.log('➡️ Forward button clicked');
                this.goForward();
            }
            
            // User controls - özel debugging
            else if (id === 'loginBtn' || id === 'profileImage' || id === 'userNameDisplay' || target.closest('#loginBtn')) {
                console.log('👤 Login button area clicked, currentUser:', this.currentUser);
                e.preventDefault(); // Varsayılan button davranışını engelle
                this.toggleUserDropdown();
            }
            else if (id === 'profileBtn' || target.closest('#profileBtn')) {
                console.log('👤 Profile button clicked');
                e.preventDefault();
                this.openProfileModal();
            }
            else if (id === 'uploadSongBtn' || target.closest('#uploadSongBtn')) {
                console.log('📤 Upload song button clicked');
                e.preventDefault();
                this.openUploadSongModal();
            }
            else if (id === 'settingsBtn' || target.closest('#settingsBtn')) {
                console.log('⚙️ Settings button clicked');
                e.preventDefault();
                this.openSettingsModal();
            }
            else if (id === 'logoutBtn' || target.closest('#logoutBtn')) {
                console.log('🚪 Logout button clicked');
                e.preventDefault();
                this.logout();
            }
            
            // Library controls
            else if (classes.contains('library-btn')) this.openCreatePlaylistModal();
            else if (classes.contains('liked-songs')) this.showLikedSongs();
            
            // Player controls
            else if (id === 'playBtn') this.togglePlay();
            else if (id === 'prevBtn') this.previousSong();
            else if (id === 'nextBtn') this.nextSong();
            else if (id === 'shuffleBtn') this.toggleShuffle();
            else if (id === 'repeatBtn') this.toggleRepeat();
            else if (id === 'volumeBtn') this.toggleMute();
            
            // Window controls
            else if (classes.contains('minimize')) this.minimizeWindow();
            else if (classes.contains('maximize')) this.maximizeWindow();
            else if (classes.contains('close')) this.closeWindow();
            
            // Sidebar controls
            else if (id === 'minimizeRight') this.toggleRightSidebar();
            else if (classes.contains('minimize-library-btn')) this.toggleLeftSidebar();
            
            // Modal controls
            else if (id === 'closeModal' || id === 'closeRegisterModal' || id === 'closeVerificationModal' || 
                     id === 'closeProfileModal' || id === 'closeSettingsModal' || id === 'closeChangePasswordModal' ||
                     id === 'closeTwoFactorModal' || id === 'closeTwoFactorLoginModal' || 
                     id === 'closeCreatePlaylistModal' || id === 'closeUploadSongModal') {
                const modalId = target.closest('.modal').id;
                if (modalId) this.closeModal(modalId);
            }
            
            // Registration/Login links
            else if (id === 'registerLink') {
                e.preventDefault();
                this.closeModal('loginModal');
                this.openModal('registerModal');
            }
            else if (id === 'loginLink') {
                e.preventDefault();
                this.closeModal('registerModal');
                this.openModal('loginModal');
            }
            
            // FORM SUBMIT BUTTONS - EN ÖNEMLİSİ!
            else if (id === 'submitRegister') {
                console.log('✅ Kayıt butonu tıklandı!');
                e.preventDefault();
                this.handleRegister(e);
            }
            else if (id === 'submitApplication') {
                console.log('✅ Başvuru butonu tıklandı!');
                e.preventDefault();
                this.handleArtistApplication(e);
            }
            else if (id === 'submitLogin') {
                console.log('✅ Giriş butonu tıklandı!');
                e.preventDefault();
                this.handleLogin(e);
            }
            else if (id === 'submitVerification') {
                console.log('✅ Doğrulama butonu tıklandı!');
                e.preventDefault();
                this.handleVerification(e);
            }
            
            // Settings & other buttons
            else if (id === 'changePasswordBtn') this.openChangePasswordModal();
            else if (id === 'toggleTwoFactorBtn') this.toggleTwoFactor();
            else if (id === 'changePhotoBtn') document.getElementById('profileImageUpload')?.click();
            else if (id === 'selectImageBtn') document.getElementById('playlistImageInput')?.click();
            else if (id === 'selectCoverBtn') document.getElementById('songCoverInput')?.click();
            
            // Back buttons
            else if (id === 'backToTypeSelection' || id === 'backToTypeSelectionArtist') {
                e.preventDefault();
                this.showAccountTypeSelection();
            }
            
            // Resend code
            else if (id === 'resendCode') {
                e.preventDefault();
                this.resendVerificationCode(e);
            }
            
            // Account type selection buttons
            else if (classes.contains('account-type-btn')) {
                const accountType = target.dataset.type;
                if (accountType) {
                    this.showRegistrationForm(accountType);
                }
            }
            
            // Dropdown items için child element handling
            else if (target.closest('.dropdown-item')) {
                const dropdownItem = target.closest('.dropdown-item');
                const dropdownId = dropdownItem.id;
                console.log('📱 Dropdown item clicked:', dropdownId);
                
                if (dropdownId === 'profileBtn') {
                    console.log('👤 Profile dropdown clicked');
                    e.preventDefault();
                    this.openProfileModal();
                }
                else if (dropdownId === 'uploadSongBtn') {
                    console.log('📤 Upload song dropdown clicked');
                    e.preventDefault();
                    this.openUploadSongModal();
                }
                else if (dropdownId === 'settingsBtn') {
                    console.log('⚙️ Settings dropdown clicked');
                    e.preventDefault();
                    this.openSettingsModal();
                }
                else if (dropdownId === 'logoutBtn') {
                    console.log('🚪 Logout dropdown clicked');
                    e.preventDefault();
                    this.logout();
                }
            }
            
            // Close dropdowns when clicking outside
            if (!target.closest('.user-dropdown-container')) {
                this.closeUserDropdown();
            }
            
            // Modal background close
            if (target.classList.contains('modal')) {
                this.closeModal(target.id);
            }
            
            // Settings navigation
            if (target.classList.contains('settings-nav-item')) {
                this.switchSettingsSection(target.dataset.section);
            }
        });

        // Input event listeners
        document.addEventListener('input', (e) => {
            const target = e.target;
            
            if (target.id === 'searchInput') {
                this.handleSearch(target.value);
            }
            else if (target.id === 'volumeSlider') {
                this.setVolume(target.value / 100);
            }
            
            // Label floating animation for modern inputs
            if (target.closest('.input-container')) {
                if (target.value.trim() !== '') {
                    target.classList.add('has-value');
                } else {
                    target.classList.remove('has-value');
                }
            }
        });

        // Change event listeners for file uploads
        document.addEventListener('change', (e) => {
            const target = e.target;
            
            if (target.id === 'profileImageUpload') this.handleProfileImageUpload(e);
            else if (target.id === 'playlistImageInput') this.handlePlaylistImageUpload(e);
            else if (target.id === 'songCoverInput') this.handleSongCoverUpload(e);
        });

        // Progress bar click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.progress-container')) {
                this.seekTo(e);
            }
        });

        // Electron menu actions
        if (window.electronAPI) {
            window.electronAPI.on('menu-action', (action) => {
                this.handleMenuAction(action);
            });

            window.electronAPI.on('player-action', (action) => {
                this.handlePlayerAction(action);
            });


        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        console.log('✅ Event listener sistemi kuruldu!');
    }

    setupAudioPlayer() {
        this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
        this.audioElement.addEventListener('ended', () => this.nextSong());
        this.audioElement.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioElement.volume = this.volume;
    }

    setupModals() {
        // Login Modal
        this.setupModal('loginModal', 'closeModal');
        document.getElementById('registerLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('loginModal');
            this.openModal('registerModal');
        });

        // Register Modal
        this.setupModal('registerModal', 'closeRegisterModal');
        
        // Phone number formatting - modal açıldığında kurulacak
        this.setupPhoneFormatting();

        // Other modals
        this.setupModal('verificationModal', 'closeVerificationModal');
        this.setupModal('profileModal', 'closeProfileModal');
        this.setupModal('settingsModal', 'closeSettingsModal');
        this.setupModal('changePasswordModal', 'closeChangePasswordModal');
        this.setupModal('twoFactorModal', 'closeTwoFactorModal');
        this.setupModal('twoFactorLoginModal', 'closeTwoFactorLoginModal');
        this.setupModal('createPlaylistModal', 'closeCreatePlaylistModal');
        this.setupModal('uploadSongModal', 'closeUploadSongModal');

        // Settings navigation
        document.querySelectorAll('.settings-nav-item').forEach(item => {
            item.addEventListener('click', () => this.switchSettingsSection(item.dataset.section));
        });

        // Settings actions
        document.getElementById('changePasswordBtn')?.addEventListener('click', () => this.openChangePasswordModal());
        document.getElementById('toggleTwoFactorBtn')?.addEventListener('click', () => this.toggleTwoFactor());

        // File uploads
        document.getElementById('profileImageUpload')?.addEventListener('change', (e) => this.handleProfileImageUpload(e));
        document.getElementById('changePhotoBtn')?.addEventListener('click', () => document.getElementById('profileImageUpload').click());
        document.getElementById('playlistImageInput')?.addEventListener('change', (e) => this.handlePlaylistImageUpload(e));
        document.getElementById('selectImageBtn')?.addEventListener('click', () => document.getElementById('playlistImageInput').click());
        document.getElementById('songCoverInput')?.addEventListener('change', (e) => this.handleSongCoverUpload(e));
        document.getElementById('selectCoverBtn')?.addEventListener('click', () => document.getElementById('songCoverInput').click());
    }

    setupModal(modalId, closeButtonId) {
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeButtonId);
        
        closeBtn?.addEventListener('click', () => this.closeModal(modalId));
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modalId);
            }
        });
    }

    setupSidebarResizing() {
        const leftResizer = document.getElementById('leftResizer');
        const rightResizer = document.getElementById('rightResizer');
        const leftSidebar = document.getElementById('leftSidebar');
        const rightSidebar = document.getElementById('rightSidebar');

        this.setupResizer(leftResizer, leftSidebar, 'width', 200, 400);
        this.setupResizer(rightResizer, rightSidebar, 'width', 280, 500);
    }

    setupResizer(resizer, target, property, min, max) {
        let isResizing = false;
        let startX, startWidth;

        resizer?.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startWidth = parseInt(document.defaultView.getComputedStyle(target).width, 10);
            document.addEventListener('mousemove', doResize);
            document.addEventListener('mouseup', stopResize);
        });

        function doResize(e) {
            if (!isResizing) return;
            const width = startWidth + e.clientX - startX;
            if (width >= min && width <= max) {
                target.style.width = width + 'px';
            }
        }

        function stopResize() {
            isResizing = false;
            document.removeEventListener('mousemove', doResize);
            document.removeEventListener('mouseup', stopResize);
        }
    }

    // Phone Number Formatting
    setupPhoneFormatting() {
        console.log('📱 Telefon formatlaması kuruluyor...');
        
        const phoneInputs = ['registerPhone', 'artistPhone'];
        
        phoneInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                // Event listener'ı yoksa ekle
                if (!input.dataset.phoneFormatted) {
                    input.addEventListener('input', (e) => this.formatPhoneNumber(e));
                    input.addEventListener('keydown', (e) => this.handlePhoneKeydown(e));
                    input.dataset.phoneFormatted = 'true';
                    
                    // Set default +90 prefix
                    if (!input.value.trim()) {
                        input.value = '+90 ';
                    }
                    
                    console.log(`✅ Telefon formatlaması aktif: ${inputId}`);
                } else {
                    console.log(`ℹ️ Telefon formatlaması zaten aktif: ${inputId}`);
                }
            } else {
                console.log(`❌ Telefon input bulunamadı: ${inputId}`);
            }
        });
    }

    // Code Input Navigation
    setupCodeInputNavigation() {
        console.log('🔢 Kod input navigation kuruluyor...');
        
        const codeInputs = ['code1', 'code2', 'code3', 'code4', 'code5'];
        
        codeInputs.forEach((inputId, index) => {
            const input = document.getElementById(inputId);
            if (input && !input.dataset.codeNavSetup) {
                input.addEventListener('input', (e) => this.handleCodeInput(e, index));
                input.addEventListener('keydown', (e) => this.handleCodeKeydown(e, index));
                input.addEventListener('paste', (e) => this.handleCodePaste(e));
                input.dataset.codeNavSetup = 'true';
                
                console.log(`✅ Kod input navigation aktif: ${inputId}`);
            }
        });
        
        // İlk input'a odaklan
        const firstInput = document.getElementById('code1');
        if (firstInput) {
            firstInput.focus();
        }
    }

    handleCodeInput(e, index) {
        const value = e.target.value;
        
        // Sadece rakam kabul et
        if (!/^\d$/.test(value)) {
            e.target.value = '';
            return;
        }
        
        // Bir sonraki input'a geç
        if (value.length === 1 && index < 4) {
            const nextInput = document.getElementById(`code${index + 2}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
        
        // Tüm alanlar doluysa form gönder
        this.checkCodeComplete();
    }

    handleCodeKeydown(e, index) {
        // Backspace ile önceki input'a geç
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            const prevInput = document.getElementById(`code${index}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
        
        // Arrow keys ile navigation
        if (e.key === 'ArrowLeft' && index > 0) {
            const prevInput = document.getElementById(`code${index}`);
            if (prevInput) {
                prevInput.focus();
            }
        }
        
        if (e.key === 'ArrowRight' && index < 4) {
            const nextInput = document.getElementById(`code${index + 2}`);
            if (nextInput) {
                nextInput.focus();
            }
        }
        
        // Enter ile form gönder
        if (e.key === 'Enter') {
            e.preventDefault();
            this.checkCodeComplete();
        }
    }

    handleCodePaste(e) {
        e.preventDefault();
        
        const pastedData = e.clipboardData.getData('text');
        const cleanData = pastedData.replace(/\D/g, '').slice(0, 5);
        
        if (cleanData.length === 5) {
            for (let i = 0; i < 5; i++) {
                const input = document.getElementById(`code${i + 1}`);
                if (input) {
                    input.value = cleanData[i];
                }
            }
            
            // Son input'a odaklan
            const lastInput = document.getElementById('code5');
            if (lastInput) {
                lastInput.focus();
            }
            
            this.checkCodeComplete();
        }
    }

    checkCodeComplete() {
        const code1 = document.getElementById('code1')?.value || '';
        const code2 = document.getElementById('code2')?.value || '';
        const code3 = document.getElementById('code3')?.value || '';
        const code4 = document.getElementById('code4')?.value || '';
        const code5 = document.getElementById('code5')?.value || '';
        
        if (code1 && code2 && code3 && code4 && code5) {
            // Otomatik form gönder
            const form = document.getElementById('verificationForm');
            if (form) {
                console.log('🎯 Kod tamamlandı, form otomatik gönderiliyor...');
                form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
        }
    }

    clearCodeInputs() {
        const codeInputs = ['code1', 'code2', 'code3', 'code4', 'code5'];
        codeInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.value = '';
            }
        });
        
        // İlk input'a odaklan
        const firstInput = document.getElementById('code1');
        if (firstInput) {
            firstInput.focus();
        }
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        
        // Ensure it starts with 90 (Turkey code)
        if (!value.startsWith('90')) {
            value = '90' + value.replace(/^90/, '');
        }
        
        // Format: +90 XXX XXX XXXX
        if (value.length >= 2) {
            let formatted = '+90';
            const remaining = value.slice(2);
            
            if (remaining.length > 0) {
                formatted += ' ' + remaining.slice(0, 3);
            }
            if (remaining.length > 3) {
                formatted += ' ' + remaining.slice(3, 6);
            }
            if (remaining.length > 6) {
                formatted += ' ' + remaining.slice(6, 10);
            }
            
            e.target.value = formatted;
        }
    }

    handlePhoneKeydown(e) {
        const input = e.target;
        const cursorPos = input.selectionStart;
        
        // Prevent deleting +90 prefix
        if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPos <= 4) {
            e.preventDefault();
        }
        
        // Reset to +90 if completely cleared
        if (e.key === 'Backspace' && input.value === '+90 ') {
            e.preventDefault();
        }
    }

    // Backend API calls
    async makeApiCall(endpoint, method = 'GET', data = null) {
        console.log(`🌐 API Call: ${method} ${this.backendUrl}${endpoint}`, data);
        
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };

            if (data) {
                options.body = JSON.stringify(data);
            }

            console.log(`📤 Request options:`, options);
            
            const response = await fetch(`${this.backendUrl}${endpoint}`, options);
            console.log(`📥 Response status: ${response.status}`);
            
            const result = await response.json();
            console.log(`📦 Response data:`, result);

            return {
                success: response.ok,
                data: result,
                status: response.status
            };
        } catch (error) {
            console.error('❌ API call error:', error);
            return {
                success: false,
                data: { message: 'Bağlantı hatası. Backend sunucusunun çalıştığından emin olun.' },
                status: 500
            };
        }
    }

    // User Management
    toggleUserDropdown() {
        console.log('🔄 toggleUserDropdown called, currentUser:', this.currentUser);
        
        // Eğer kullanıcı giriş yapmamışsa login modal'ını aç
        if (!this.currentUser) {
            console.log('📝 Kullanıcı giriş yapmamış, login modal açılıyor...');
            this.openModal('loginModal');
            return;
        }
        
        console.log('👤 Kullanıcı giriş yapmış, dropdown toggle ediliyor...');
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
            console.log('✅ Dropdown toggle edildi:', dropdown.classList.contains('show'));
        } else {
            console.error('❌ userDropdown elementi bulunamadı!');
        }
    }

    closeUserDropdown() {
        const dropdown = document.getElementById('userDropdown');
        dropdown?.classList.remove('show');
    }

    async handleLogin(e) {
        e.preventDefault();
        console.log('🔑 Giriş formu gönderiliyor...');
        
        const form = e.target.closest('form') || e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');
        const accountType = formData.get('accountType');

        console.log('👤 Giriş verileri:', {email, accountType});
        this.showLoading(form);

        const response = await this.makeApiCall('/api/login', 'POST', {
            email: email,
            password: password,
            accountType: accountType
        });

        this.hideLoading(form);

        if (response.success) {
            this.currentUser = response.data.user;
            this.currentUser.token = response.data.token;
            this.currentUser.profileImage = 'assets/profile.png';
            this.currentUser.twoFactorEnabled = false;
            this.updateUserInterface();
            this.saveUserData();
            this.closeModal('loginModal');
            
            const accountTypeText = accountType === 'artist' ? 'sanatçı' : 'kullanıcı';
            this.showToast(`${accountTypeText} olarak başarıyla giriş yapıldı!`, 'success');
        } else {
            this.showToast(response.data.message || 'Giriş başarısız', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        console.log('📝 Kayıt formu gönderiliyor...');
        
        // Checkbox validation
        const acceptTermsCheckbox = document.getElementById('acceptTerms');
        if (!acceptTermsCheckbox || !acceptTermsCheckbox.checked) {
            this.showToast('Kullanım şartlarını kabul etmelisiniz!', 'error');
            if (acceptTermsCheckbox) acceptTermsCheckbox.focus();
            return;
        }
        
        const form = e.target.closest('form') || e.target;
        const formData = new FormData(form);
        
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('registerEmail'),
            password: formData.get('registerPassword'),
            phone: formData.get('registerPhone')
        };

        console.log('👤 Kayıt verileri:', userData);
        this.showLoading(form);

        const response = await this.makeApiCall('/api/register', 'POST', userData);

        this.hideLoading(form);

        if (response.success) {
            this.closeModal('registerModal');
            this.openVerificationModal(userData.email);
            this.showToast(response.data.message, 'success');
        } else {
            this.showToast(response.data.message || 'Kayıt başarısız', 'error');
        }
    }

    async handleArtistApplication(e) {
        e.preventDefault();
        console.log('🎨 Sanatçı başvuru formu gönderiliyor...');
        
        // Checkbox validation
        const acceptArtistTermsCheckbox = document.getElementById('acceptArtistTerms');
        if (!acceptArtistTermsCheckbox || !acceptArtistTermsCheckbox.checked) {
            this.showToast('Sanatçı kullanım şartlarını kabul etmelisiniz!', 'error');
            if (acceptArtistTermsCheckbox) acceptArtistTermsCheckbox.focus();
            return;
        }
        
        const form = e.target.closest('form') || e.target;
        const formData = new FormData(form);
        
        const artistData = {
            artistName: formData.get('artistName'),
            email: formData.get('artistEmail'),
            birthDate: formData.get('artistBirthDate'),
            phone: formData.get('artistPhone'),
            socialMediaLink: formData.get('socialMediaLink'),
            bio: formData.get('artistBio')
        };

        console.log('🎨 Sanatçı verileri:', artistData);
        this.showLoading(form);

        const response = await this.makeApiCall('/api/artist-application', 'POST', artistData);

        this.hideLoading(form);

        if (response.success) {
            this.closeModal('registerModal');
            this.showToast(response.data.message, 'success');
            form.reset();
        } else {
            this.showToast(response.data.message || 'Başvuru gönderilemedi', 'error');
        }
    }

    async handleVerification(e) {
        e.preventDefault();
        console.log('✅ Doğrulama formu gönderiliyor...');
        
        const form = e.target.closest('form') || e.target;
        const email = document.getElementById('emailDisplay').textContent;
        
        // 5 ayrı input'tan kodu topla
        const code1 = document.getElementById('code1').value;
        const code2 = document.getElementById('code2').value;
        const code3 = document.getElementById('code3').value;
        const code4 = document.getElementById('code4').value;
        const code5 = document.getElementById('code5').value;
        const code = code1 + code2 + code3 + code4 + code5;

        if (code.length !== 5) {
            this.showToast('Lütfen 5 haneli kodu tam olarak girin', 'error');
            return;
        }

        console.log('📧 Doğrulama verileri:', {email, code});
        this.showLoading(form);

        const response = await this.makeApiCall('/api/verify-email', 'POST', {
            email: email,
            code: code
        });

        this.hideLoading(form);

        if (response.success) {
            this.closeModal('verificationModal');
            this.showToast(response.data.message, 'success');
            this.openModal('loginModal');
            this.clearCodeInputs();
        } else {
            this.showToast(response.data.message || 'Doğrulama başarısız', 'error');
            this.clearCodeInputs();
        }
    }

    async resendVerificationCode(e) {
        e.preventDefault();
        const email = document.getElementById('emailDisplay').textContent;

        const response = await this.makeApiCall('/api/resend-verification', 'POST', {
            email: email
        });

        if (response.success) {
            this.showToast(response.data.message, 'success');
        } else {
            this.showToast(response.data.message || 'Kod gönderilemedi', 'error');
        }
    }

    logout() {
        this.currentUser = null;
        this.updateUserInterface();
        this.closeUserDropdown();
        this.showToast('Oturum kapatıldı', 'info');
    }

    updateUserInterface() {
        const loginBtn = document.getElementById('loginBtn');
        const userNameDisplay = document.getElementById('userNameDisplay');
        const profileImage = document.getElementById('profileImage');
        const uploadSongBtn = document.getElementById('uploadSongBtn');

        if (this.currentUser) {
            userNameDisplay.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
            profileImage.src = this.currentUser.profileImage;
            uploadSongBtn.style.display = this.currentUser.accountType === 'artist' ? 'flex' : 'none';
        } else {
            userNameDisplay.textContent = 'Giriş Yap';
            profileImage.src = 'assets/profile.png';
            uploadSongBtn.style.display = 'none';
        }
    }

    // Modal Management
    openModal(modalId) {
        console.log('🎭 Modal açılıyor:', modalId);
        const modal = document.getElementById(modalId);
        
        if (!modal) {
            console.error('❌ Modal bulunamadı:', modalId);
            return;
        }
        
        console.log('✅ Modal bulundu, açılıyor...');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Register modal için telefon formatlaması
        if (modalId === 'registerModal') {
            setTimeout(() => {
                this.setupPhoneFormatting();
            }, 200);
        }
        
        // Verification modal için kod input navigation
        if (modalId === 'verificationModal') {
            setTimeout(() => {
                this.setupCodeInputNavigation();
            }, 200);
        }
        
        console.log('✅ Modal açıldı:', modalId);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal?.classList.remove('show');
        document.body.style.overflow = '';
    }

    openProfileModal() {
        if (!this.currentUser) {
            this.openModal('loginModal');
            return;
        }
        
        // Populate profile form
        document.getElementById('profileFirstName').value = this.currentUser.firstName;
        document.getElementById('profileLastName').value = this.currentUser.lastName;
        document.getElementById('profileEmail').value = this.currentUser.email;
        
        this.openModal('profileModal');
    }

    openSettingsModal() {
        if (!this.currentUser) {
            this.openModal('loginModal');
            return;
        }
        this.openModal('settingsModal');
    }

    openCreatePlaylistModal() {
        if (!this.currentUser) {
            this.openModal('loginModal');
            return;
        }
        this.openModal('createPlaylistModal');
    }

    openUploadSongModal() {
        if (!this.currentUser || this.currentUser.accountType !== 'artist') {
            this.showToast('Şarkı yüklemek için sanatçı hesabına ihtiyacınız var', 'error');
            return;
        }
        this.openModal('uploadSongModal');
    }

    openChangePasswordModal() {
        this.closeModal('settingsModal');
        this.openModal('changePasswordModal');
    }

    openVerificationModal(email) {
        document.getElementById('emailDisplay').textContent = email;
        this.openModal('verificationModal');
    }

    showAccountTypeSelection() {
        console.log('🔙 Account type selection gösteriliyor');
        document.getElementById('accountTypeSelection').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('artistForm').style.display = 'none';
    }

    showRegistrationForm(type) {
        console.log('📋 Registration form gösteriliyor:', type);
        document.getElementById('accountTypeSelection').style.display = 'none';
        if (type === 'user') {
            document.getElementById('registerForm').style.display = 'block';
            document.getElementById('artistForm').style.display = 'none';
        } else {
            document.getElementById('registerForm').style.display = 'none';
            document.getElementById('artistForm').style.display = 'block';
        }
        
        // Telefon formatlamasını aktif et
        setTimeout(() => {
            this.setupPhoneFormatting();
        }, 100);
    }

    // Audio Player
    togglePlay() {
        if (!this.currentSong) {
            this.showToast('Önce bir şarkı seçin', 'info');
            return;
        }

        if (this.isPlaying) {
            this.audioElement.pause();
        } else {
            this.audioElement.play();
        }
        
        this.isPlaying = !this.isPlaying;
        this.updatePlayButton();
    }

    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        const icon = playBtn?.querySelector('i');
        if (icon) {
            icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
        }
    }

    previousSong() {
        if (this.currentPlaylist.length === 0) return;
        
        this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.currentPlaylist.length - 1;
        this.loadSong(this.currentPlaylist[this.currentIndex]);
        if (this.isPlaying) this.audioElement.play();
    }

    nextSong() {
        if (this.currentPlaylist.length === 0) return;
        
        if (this.repeatMode === 'one') {
            this.audioElement.currentTime = 0;
            if (this.isPlaying) this.audioElement.play();
            return;
        }
        
        this.currentIndex = this.currentIndex < this.currentPlaylist.length - 1 ? this.currentIndex + 1 : 0;
        this.loadSong(this.currentPlaylist[this.currentIndex]);
        if (this.isPlaying) this.audioElement.play();
    }

    toggleShuffle() {
        this.isShuffled = !this.isShuffled;
        const shuffleBtn = document.getElementById('shuffleBtn');
        shuffleBtn?.classList.toggle('active', this.isShuffled);
        
        if (this.isShuffled) {
            this.shufflePlaylist();
        }
    }

    toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        const repeatBtn = document.getElementById('repeatBtn');
        const icon = repeatBtn?.querySelector('i');
        
        repeatBtn?.classList.toggle('active', this.repeatMode !== 'none');
        
        if (icon) {
            switch (this.repeatMode) {
                case 'one':
                    icon.className = 'fas fa-redo';
                    break;
                case 'all':
                    icon.className = 'fas fa-redo';
                    break;
                default:
                    icon.className = 'fas fa-redo';
                    break;
            }
        }
    }

    setVolume(volume) {
        this.volume = volume;
        this.audioElement.volume = volume;
        this.updateVolumeIcon();
    }

    toggleMute() {
        if (this.audioElement.volume > 0) {
            this.audioElement.volume = 0;
            document.getElementById('volumeSlider').value = 0;
        } else {
            this.audioElement.volume = this.volume;
            document.getElementById('volumeSlider').value = this.volume * 100;
        }
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        const volumeBtn = document.getElementById('volumeBtn');
        const icon = volumeBtn?.querySelector('i');
        
        if (icon) {
            if (this.audioElement.volume === 0) {
                icon.className = 'fas fa-volume-mute';
            } else if (this.audioElement.volume <= 0.5) {
                icon.className = 'fas fa-volume-down';
            } else {
                icon.className = 'fas fa-volume-up';
            }
        }
    }

    loadSong(song) {
        this.currentSong = song;
        this.audioElement.src = song.audioUrl || '';
        this.updateCurrentSongDisplay();
    }

    updateCurrentSongDisplay() {
        if (!this.currentSong) return;
        
        // Update player
        document.querySelector('.song-title').textContent = this.currentSong.title;
        document.querySelector('.song-artist').textContent = this.currentSong.artist;
        
        // Update right sidebar
        document.querySelector('.track-info h4').textContent = this.currentSong.title;
        document.querySelector('.track-info p').textContent = this.currentSong.artist;
    }

    updateProgress() {
        if (!this.audioElement.duration) return;
        
        const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
        const progressFill = document.querySelector('.progress-fill');
        const progressHandle = document.querySelector('.progress-handle');
        const currentTimeEl = document.querySelector('.current-time');
        
        if (progressFill) progressFill.style.width = `${progress}%`;
        if (progressHandle) progressHandle.style.left = `${progress}%`;
        if (currentTimeEl) currentTimeEl.textContent = this.formatTime(this.audioElement.currentTime);
    }

    updateDuration() {
        const totalTimeEl = document.querySelector('.total-time');
        if (totalTimeEl) totalTimeEl.textContent = this.formatTime(this.audioElement.duration);
    }

    seekTo(e) {
        const progressContainer = e.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        const newTime = percentage * this.audioElement.duration;
        
        this.audioElement.currentTime = newTime;
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Search
    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearchResults();
            return;
        }
        
        // Simulate search
        const results = this.songs.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase())
        );
        
        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        // Implementation for displaying search results
        console.log('Search results:', results);
    }

    clearSearchResults() {
        // Implementation for clearing search results
    }

    // Navigation
    goHome() {
        console.log('Navigate to home');
        // Home sayfasına dönüş mantığı
    }

    goBack() {
        console.log('Navigate back');
    }

    goForward() {
        console.log('Navigate forward');
    }

    // Sidebar
    toggleLeftSidebar() {
        const sidebar = document.getElementById('leftSidebar');
        sidebar?.classList.toggle('minimized');
    }

    toggleRightSidebar() {
        const sidebar = document.getElementById('rightSidebar');
        sidebar?.classList.toggle('minimized');
    }

    // Window Controls
    async minimizeWindow() {
        if (window.electronAPI) {
            await window.electronAPI.window.minimize();
        }
    }

    async maximizeWindow() {
        if (window.electronAPI) {
            await window.electronAPI.window.maximize();
            this.updateMaximizeButton();
        }
    }

    async closeWindow() {
        if (window.electronAPI) {
            await window.electronAPI.window.close();
        }
    }

    async updateMaximizeButton() {
        if (window.electronAPI) {
            const isMaximized = await window.electronAPI.window.isMaximized();
            const maximizeBtn = document.querySelector('.window-btn.maximize');
            if (maximizeBtn) {
                maximizeBtn.style.backgroundColor = isMaximized ? '#ff9500' : '#28ca42';
            }
        }
    }

    // Settings
    switchSettingsSection(section) {
        // Hide all sections
        document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.settings-nav-item').forEach(s => s.classList.remove('active'));
        
        // Show selected section
        document.getElementById(`${section}Section`)?.classList.add('active');
        document.querySelector(`[data-section="${section}"]`)?.classList.add('active');
    }

    toggleTwoFactor() {
        if (!this.currentUser.twoFactorEnabled) {
            this.openModal('twoFactorModal');
        } else {
            this.currentUser.twoFactorEnabled = false;
            this.updateTwoFactorStatus();
            this.showToast('İki aşamalı doğrulama kapatıldı', 'info');
        }
    }

    updateTwoFactorStatus() {
        const statusEl = document.getElementById('twoFactorStatus');
        const btnEl = document.getElementById('toggleTwoFactorBtn');
        
        if (this.currentUser?.twoFactorEnabled) {
            statusEl.textContent = 'Açık';
            btnEl.textContent = 'Devre Dışı Bırak';
        } else {
            statusEl.textContent = 'Kapalı';
            btnEl.textContent = 'Etkinleştir';
        }
    }

    // File Uploads
    handleProfileImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewImg = document.getElementById('profilePreviewImage');
                previewImg.src = e.target.result;
                if (this.currentUser) {
                    this.currentUser.profileImage = e.target.result;
                    this.updateUserInterface();
                }
            };
            reader.readAsDataURL(file);
        }
    }

    handlePlaylistImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('playlistImagePreview');
                preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        }
    }

    handleSongCoverUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('songCoverPreview');
                preview.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
            };
            reader.readAsDataURL(file);
        }
    }

    // Playlists
    createPlaylist(name, description, imageUrl) {
        const playlist = {
            id: Date.now(),
            name: name,
            description: description,
            imageUrl: imageUrl,
            songs: [],
            createdAt: new Date(),
            owner: this.currentUser?.email
        };
        
        this.playlists.push(playlist);
        this.updatePlaylistsDisplay();
        this.saveUserData();
        
        return playlist;
    }

    updatePlaylistsDisplay() {
        const musicList = document.getElementById('musicList');
        const existingPlaylists = musicList.querySelectorAll('.playlist-item');
        existingPlaylists.forEach(item => item.remove());
        
        this.playlists.forEach(playlist => {
            const playlistElement = this.createPlaylistElement(playlist);
            musicList.appendChild(playlistElement);
        });
    }

    createPlaylistElement(playlist) {
        const div = document.createElement('div');
        div.className = 'music-item playlist-item';
        div.innerHTML = `
            <div class="item-icon">
                ${playlist.imageUrl ? 
                    `<img src="${playlist.imageUrl}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;">` :
                    '<i class="fas fa-music"></i>'
                }
            </div>
            <div class="item-details">
                <span class="item-name">${playlist.name}</span>
                <span class="item-info">Çalma listesi • ${playlist.songs.length} şarkı</span>
            </div>
        `;
        
        div.addEventListener('click', () => this.openPlaylist(playlist));
        return div;
    }

    openPlaylist(playlist) {
        this.currentPlaylist = playlist.songs;
        this.currentIndex = 0;
        // Update center content to show playlist
    }

    showLikedSongs() {
        this.currentPlaylist = this.likedSongs;
        this.currentIndex = 0;
        // Update center content to show liked songs
    }

    // Utility Functions
    showLoading(element) {
        element.classList.add('loading');
        const submitBtn = element.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Yükleniyor...';
        }
    }

    hideLoading(element) {
        element.classList.remove('loading');
        const submitBtn = element.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = false;
            // Reset button text based on form type
            const form = element.closest('form');
            if (form.id === 'loginForm') submitBtn.textContent = 'Giriş Yap';
            else if (form.id === 'registerForm') submitBtn.textContent = 'Kayıt Ol';
            else if (form.id === 'artistForm') submitBtn.textContent = 'Başvuru Gönder';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const styles = {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10001',
            opacity: '0',
            transform: 'translateY(20px)',
            transition: 'all 0.3s ease',
            maxWidth: '300px',
            fontSize: '14px'
        };
        
        const colors = {
            success: '#1ed760',
            error: '#e22134',
            info: '#1e90ff'
        };
        
        Object.assign(toast.style, styles);
        toast.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    shufflePlaylist() {
        if (this.currentPlaylist.length <= 1) return;
        
        // Fisher-Yates shuffle
        for (let i = this.currentPlaylist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.currentPlaylist[i], this.currentPlaylist[j]] = [this.currentPlaylist[j], this.currentPlaylist[i]];
        }
        
        // Update current index
        this.currentIndex = 0;
    }

    loadSampleData() {
        // Sample songs for demo
        this.songs = [
            {
                id: 1,
                title: 'Örnek Şarkı 1',
                artist: 'Sanatçı 1',
                album: 'Albüm 1',
                duration: '3:45',
                imageUrl: '',
                audioUrl: ''
            },
            {
                id: 2,
                title: 'Örnek Şarkı 2',
                artist: 'Sanatçı 2',
                album: 'Albüm 2',
                duration: '4:12',
                imageUrl: '',
                audioUrl: ''
            }
        ];
        
        this.updateLikedSongsCount();
    }

    updateLikedSongsCount() {
        const countEl = document.getElementById('likedSongsCount');
        if (countEl) {
            countEl.textContent = `📌 Çalma listesi • ${this.likedSongs.length} şarkı`;
        }
    }

    // Data Persistence
    saveUserData() {
        if (this.currentUser) {
            const userData = {
                user: this.currentUser,
                playlists: this.playlists,
                likedSongs: this.likedSongs,
                settings: {
                    volume: this.volume,
                    repeatMode: this.repeatMode,
                    isShuffled: this.isShuffled
                }
            };
            localStorage.setItem('sonataUserData', JSON.stringify(userData));
        }
    }

    loadUserData() {
        const savedData = localStorage.getItem('sonataUserData');
        if (savedData) {
            try {
                const userData = JSON.parse(savedData);
                this.currentUser = userData.user;
                this.playlists = userData.playlists || [];
                this.likedSongs = userData.likedSongs || [];
                
                if (userData.settings) {
                    this.volume = userData.settings.volume || 0.5;
                    this.repeatMode = userData.settings.repeatMode || 'none';
                    this.isShuffled = userData.settings.isShuffled || false;
                }
                
                this.updateUserInterface();
                this.updatePlaylistsDisplay();
                this.updateLikedSongsCount();
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    }

    // Electron Integration Methods
    handleMenuAction(action) {
        switch (action) {
            case 'new-playlist':
                this.openCreatePlaylistModal();
                break;
            case 'upload-song':
                this.openUploadSongModal();
                break;
            case 'profile':
                this.openProfileModal();
                break;
            case 'settings':
                this.openSettingsModal();
                break;
            case 'logout':
                this.logout();
                break;
        }
    }

    handlePlayerAction(action) {
        switch (action) {
            case 'toggle-play':
                this.togglePlay();
                break;
            case 'previous':
                this.previousSong();
                break;
            case 'next':
                this.nextSong();
                break;
            case 'shuffle':
                this.toggleShuffle();
                break;
            case 'repeat':
                this.toggleRepeat();
                break;
        }
    }



    handleKeyboardShortcuts(e) {
        // Prevent default browser shortcuts when focused on input elements
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Space: Play/Pause
        if (e.code === 'Space') {
            e.preventDefault();
            this.togglePlay();
        }
        
        // Arrow keys: Previous/Next
        if (e.ctrlKey || e.metaKey) {
            switch (e.code) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSong();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSong();
                    break;
                case 'KeyN':
                    e.preventDefault();
                    this.openCreatePlaylistModal();
                    break;
                case 'KeyO':
                    e.preventDefault();
                    this.openUploadSongModal();
                    break;
                case 'KeyS':
                    e.preventDefault();
                    this.toggleShuffle();
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.toggleRepeat();
                    break;
                case 'Comma':
                    e.preventDefault();
                    this.openSettingsModal();
                    break;
            }
        }
    }



    async openFileDialog(options) {
        if (window.electronAPI) {
            return await window.electronAPI.dialog.showOpenDialog(options);
        }
        return null;
    }

    async saveFileDialog(options) {
        if (window.electronAPI) {
            return await window.electronAPI.dialog.showSaveDialog(options);
        }
        return null;
    }

    async getAppVersion() {
        if (window.electronAPI) {
            return await window.electronAPI.app.getVersion();
        }
        return '1.0.0';
    }


}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM yüklendi, uygulama başlatılıyor...');
    window.sonataApp = new SonataApp();
    
    // Basit event listener sistemi
    setTimeout(() => {
        setupSimpleEventListeners();
    }, 500);
});

// Basit event listener sistemi
function setupSimpleEventListeners() {
    console.log('🔗 Basit event listener sistemi başlatılıyor...');
    
    // Account type buttons - direct event listeners
    document.addEventListener('click', function(e) {
        // Account type selection
        if (e.target.classList.contains('account-type-btn')) {
            e.preventDefault();
            console.log('👥 Account type clicked:', e.target.dataset.type);
            if (window.sonataApp && window.sonataApp.showRegistrationForm) {
                window.sonataApp.showRegistrationForm(e.target.dataset.type);
            }
        }
        
        // Back buttons (button itself or icon inside)
        if (e.target.id === 'backToTypeSelection' || e.target.id === 'backToTypeSelectionArtist' ||
            e.target.closest('#backToTypeSelection') || e.target.closest('#backToTypeSelectionArtist')) {
            e.preventDefault();
            console.log('⬅️ Back button clicked');
            if (window.sonataApp && window.sonataApp.showAccountTypeSelection) {
                window.sonataApp.showAccountTypeSelection();
            }
        }
        
        // Resend code
        if (e.target.id === 'resendCode') {
            e.preventDefault();
            console.log('🔄 Resend code clicked');
            if (window.sonataApp && window.sonataApp.resendVerificationCode) {
                window.sonataApp.resendVerificationCode(e);
            }
        }
    });
    
    console.log('✅ Basit event listener sistemi kuruldu!');
}

// Handle form submissions
document.addEventListener('submit', (e) => {
    const form = e.target;
    
    if (form.id === 'createPlaylistForm') {
        e.preventDefault();
        const name = form.playlistName.value;
        const description = form.playlistDescription.value;
        const imageInput = form.querySelector('#playlistImageInput');
        const imageUrl = imageInput.files[0] ? URL.createObjectURL(imageInput.files[0]) : '';
        
        if (name.trim()) {
            window.sonataApp.createPlaylist(name, description, imageUrl);
            window.sonataApp.closeModal('createPlaylistModal');
            window.sonataApp.showToast('Çalma listesi oluşturuldu!', 'success');
            form.reset();
            document.getElementById('playlistImagePreview').innerHTML = '<i class="fas fa-music"></i><span>Resim Seçin</span>';
        }
    }
    
    if (form.id === 'uploadSongForm') {
        e.preventDefault();
        window.sonataApp.showLoading(form);
        setTimeout(() => {
            window.sonataApp.hideLoading(form);
            window.sonataApp.closeModal('uploadSongModal');
            window.sonataApp.showToast('Şarkı başarıyla yayınlandı!', 'success');
            form.reset();
        }, 2000);
    }
    
    if (form.id === 'profileForm') {
        e.preventDefault();
        if (window.sonataApp.currentUser) {
            window.sonataApp.currentUser.firstName = form.profileFirstName.value;
            window.sonataApp.currentUser.lastName = form.profileLastName.value;
            window.sonataApp.updateUserInterface();
            window.sonataApp.saveUserData();
            window.sonataApp.closeModal('profileModal');
            window.sonataApp.showToast('Profil bilgileri güncellendi!', 'success');
        }
    }
    
    if (form.id === 'changePasswordForm') {
        e.preventDefault();
        window.sonataApp.showLoading(form);
        setTimeout(() => {
            window.sonataApp.hideLoading(form);
            window.sonataApp.closeModal('changePasswordModal');
            window.sonataApp.showToast('Şifre başarıyla değiştirildi!', 'success');
            form.reset();
        }, 1000);
    }
    
    if (form.id === 'verificationForm') {
        e.preventDefault();
        window.sonataApp.showLoading(form);
        setTimeout(() => {
            window.sonataApp.hideLoading(form);
            window.sonataApp.closeModal('verificationModal');
            window.sonataApp.showToast('E-posta doğrulandı! Giriş yapabilirsiniz.', 'success');
            window.sonataApp.openModal('loginModal');
        }, 1000);
    }
    
    if (form.id === 'twoFactorForm') {
        e.preventDefault();
        if (window.sonataApp.currentUser) {
            window.sonataApp.currentUser.twoFactorEnabled = true;
            window.sonataApp.updateTwoFactorStatus();
            window.sonataApp.saveUserData();
            window.sonataApp.closeModal('twoFactorModal');
            window.sonataApp.showToast('İki aşamalı doğrulama etkinleştirildi!', 'success');
        }
    }
}); 
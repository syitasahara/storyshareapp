export class InstallManager {
    static deferredPrompt = null;
    static isInstalled = false;

    static init() {
        this.setupInstallPrompt();
        this.checkInstallStatus();
        this.setupOnlineOfflineHandlers();
    }

    static setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('Install prompt available');
            
            this.showInstallButton();
            this.trackInstallPrompt();
        });

        // Listen for app installed event
        window.addEventListener('appinstalled', (e) => {
            console.log('App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.trackInstallation();
            
            // Show success message
            this.showInstallMessage('Aplikasi berhasil diinstall! 🎉', 'success');
        });

        // Check various installation indicators
        this.checkInstallStatus();
    }

    static setupOnlineOfflineHandlers() {
        window.addEventListener('online', () => {
            document.documentElement.classList.remove('offline');
            document.documentElement.classList.add('online');
            this.showInstallMessage('Koneksi internet tersedia', 'success', 2000);
        });

        window.addEventListener('offline', () => {
            document.documentElement.classList.remove('online');
            document.documentElement.classList.add('offline');
            this.showInstallMessage('Anda sedang offline', 'info', 3000);
        });

        // Initial status
        if (!navigator.onLine) {
            document.documentElement.classList.add('offline');
        }
    }

    static showInstallButton() {
        // Don't show if already installed or no prompt
        if (this.isInstalled || !this.deferredPrompt) return;

        this.removeExistingInstallButtons();

        const installBtn = this.createInstallButton();
        const navList = document.querySelector('.nav-list');
        
        if (navList) {
            const listItem = document.createElement('li');
            listItem.appendChild(installBtn);
            navList.appendChild(listItem);
        }

        // Also show floating button for mobile
        this.showFloatingInstallButton();
    }

    static createInstallButton() {
        const button = document.createElement('button');
        button.id = 'install-btn';
        button.className = 'install-btn nav-link';
        button.innerHTML = `
            <span class="install-icon">📱</span>
            <span class="install-text">Install App</span>
        `;
        button.title = 'Install ShareYourStory untuk pengalaman lebih baik';

        button.addEventListener('click', async (e) => {
            e.preventDefault();
            await this.promptInstall();
        });

        return button;
    }

    static showFloatingInstallButton() {
        // Remove existing floating button
        const existingFloating = document.getElementById('floating-install-btn');
        if (existingFloating) existingFloating.remove();

        const floatingBtn = document.createElement('button');
        floatingBtn.id = 'floating-install-btn';
        floatingBtn.className = 'floating-install-btn';
        floatingBtn.innerHTML = '📱 Install';
        floatingBtn.title = 'Install Aplikasi';

        floatingBtn.addEventListener('click', async () => {
            await this.promptInstall();
        });

        document.body.appendChild(floatingBtn);

        // Auto hide after 15 seconds
        setTimeout(() => {
            if (floatingBtn.parentElement && !this.isInstalled) {
                floatingBtn.style.opacity = '0';
                setTimeout(() => {
                    if (floatingBtn.parentElement) {
                        floatingBtn.remove();
                    }
                }, 500);
            }
        }, 15000);
    }

    static removeExistingInstallButtons() {
        const existingButtons = document.querySelectorAll('.install-btn, #floating-install-btn');
        existingButtons.forEach(btn => {
            btn.style.opacity = '0';
            setTimeout(() => btn.remove(), 300);
        });
    }

    static hideInstallButton() {
        this.removeExistingInstallButtons();
    }

    static async promptInstall() {
        if (!this.deferredPrompt) {
            this.showInstallMessage('Aplikasi sudah terinstall atau tidak support install prompt', 'info');
            return;
        }

        try {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log(`User response to install prompt: ${outcome}`);
            
            this.deferredPrompt = null;
            
            if (outcome === 'accepted') {
                this.isInstalled = true;
                this.hideInstallButton();
            } else {
                this.showInstallMessage('Installasi dibatalkan. Anda bisa install nanti dari menu Pengaturan.', 'info');
            }
        } catch (error) {
            console.error('Error during install prompt:', error);
            this.showInstallMessage('Gagal menginstall aplikasi', 'error');
        }
    }

    static checkInstallStatus() {
        // Check multiple installation indicators
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const hasReferrer = document.referrer.includes('android-app://');
        const isInstalled = localStorage.getItem('app_installed') === 'true';
        
        this.isInstalled = isStandalone || hasReferrer || isInstalled;
        
        if (this.isInstalled) {
            this.hideInstallButton();
            localStorage.setItem('app_installed', 'true');
        }
    }

    static trackInstallPrompt() {
        // Analytics for install prompt
        console.log('Install prompt shown to user');
        // Here you can add analytics tracking
    }

    static trackInstallation() {
        // Analytics for installation
        localStorage.setItem('app_installed', 'true');
        console.log('App installation tracked');
        // Here you can add analytics tracking
    }

    static showInstallMessage(message, type, duration = 5000) {
        // Remove existing messages
        const existingToasts = document.querySelectorAll('.install-toast');
        existingToasts.forEach(toast => toast.remove());

        const toast = document.createElement('div');
        toast.className = `install-toast install-toast-${type}`;
        toast.textContent = message;
        
        // Add styles
        Object.assign(toast.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            left: '20px',
            maxWidth: '400px',
            margin: '0 auto',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            zIndex: '10000',
            backgroundColor: type === 'success' ? '#10b981' : 
                           type === 'error' ? '#ef4444' : 
                           type === 'info' ? '#3b82f6' : '#6b7280',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            textAlign: 'center',
            fontSize: '14px'
        });
        
        document.body.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.opacity = '0';
                toast.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        }, duration);
    }

    // Method untuk manually trigger install prompt (for testing)
    static async triggerInstallPrompt() {
        if (this.deferredPrompt) {
            await this.promptInstall();
        } else {
            this.showInstallMessage('Install prompt tidak tersedia. Pastikan Anda mengakses dari HTTPS dan memenuhi kriteria PWA.', 'info');
        }
    }

    // Method untuk check PWA capabilities
    static supportsPWA() {
        return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
    }

    // Method untuk check if app is running in standalone mode
    static isRunningStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    InstallManager.init();
    
    // Add CSS for install buttons
    if (!document.querySelector('#install-manager-styles')) {
        const style = document.createElement('style');
        style.id = 'install-manager-styles';
        style.textContent = `
            .install-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }
            
            .install-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            
            .floating-install-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s ease;
                animation: bounce 2s infinite;
            }
            
            .floating-install-btn:hover {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
            
            .install-toast {
                transition: all 0.3s ease;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-5px);
                }
                60% {
                    transform: translateY(-3px);
                }
            }
            
            /* Online/Offline indicators */
            .online-indicator {
                position: fixed;
                top: 10px;
                left: 10px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
                z-index: 1001;
            }
            
            .offline-indicator {
                position: fixed;
                top: 10px;
                left: 10px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ef4444;
                z-index: 1001;
            }
            
            @media (max-width: 768px) {
                .floating-install-btn {
                    bottom: 80px;
                    right: 20px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add online/offline indicator
    const indicator = document.createElement('div');
    indicator.className = navigator.onLine ? 'online-indicator' : 'offline-indicator';
    indicator.title = navigator.onLine ? 'Online' : 'Offline';
    document.body.appendChild(indicator);
});
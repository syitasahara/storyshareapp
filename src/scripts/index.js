import App from './app.js';
import { updateAuthUI, setupDrawer } from './utils/ui-helpers.js';
import { InstallManager } from './utils/install-manager.js';
import { OfflineStorage } from './utils/offline-storage.js';
import '../../src/styles/styles.css';
import '../../src/styles/about.css';
import '../../src/styles/create-story.css';
import '../../src/styles/home-page.css';
import '../../src/styles/auth.css';
import '../../src/styles/settings.css';
import '../../src/styles/story-detail.css';
import '../../src/styles/stories.css';
import '../../src/styles/story-map.css';

// Inisialisasi aplikasi dengan error handling yang lebih baik
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Aplikasi ShareYourStory dimulai...');
    
    try {
        // Inisialisasi storage offline dengan error handling
        try {
            await OfflineStorage.init();
            console.log('Offline storage initialized successfully');
        } catch (storageError) {
            console.warn('Offline storage init failed, attempting recovery:', storageError);
            
            // Try to recover from version errors
            if (storageError.name === 'VersionError') {
                await OfflineStorage.handleVersionError();
            } else {
                console.error('Offline storage unavailable:', storageError);
            }
        }
        
        // Inisialisasi install manager
        InstallManager.init();
        
        // Setup UI dasar
        setupDrawer();
        updateAuthUI();
        
        // Inisialisasi aplikasi utama
        const app = new App({
            content: document.getElementById('main-content'),
            drawerButton: document.getElementById('drawer-button'),
            navigationDrawer: document.getElementById('navigation-drawer')
        });
        
        // Render halaman pertama
        await app.renderPage();
        
        // Event listener untuk perubahan hash
        window.addEventListener('hashchange', async () => {
            await app.renderPage();
            updateAuthUI();
        });
        
        console.log('Aplikasi berhasil diinisialisasi');
        
    } catch (error) {
        console.error('Gagal menginisialisasi aplikasi:', error);
        this.showFatalError(error);
    }
});

// Fungsi untuk menampilkan error fatal
function showFatalError(error) {
    const errorHTML = `
        <div class="fatal-error-container">
            <div class="fatal-error-content">
                <h1>😔 Terjadi Kesalahan</h1>
                <p>Gagal memuat aplikasi. Silakan refresh halaman atau coba lagi nanti.</p>
                <div class="error-details">
                    <details>
                        <summary>Detail Teknis</summary>
                        <pre>${error.message}</pre>
                    </details>
                </div>
                <div class="error-actions">
                    <button onclick="location.reload()" class="btn btn-primary">Refresh Halaman</button>
                    <button onclick="localStorage.clear(); sessionStorage.clear(); location.reload()" class="btn btn-secondary">
                        Clear Data & Refresh
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('main-content').innerHTML = errorHTML;
    
    // Add styles for fatal error
    const style = document.createElement('style');
    style.textContent = `
        .fatal-error-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
            padding: 2rem;
        }
        .fatal-error-content {
            text-align: center;
            max-width: 500px;
        }
        .fatal-error-content h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: #ef4444;
        }
        .error-details {
            margin: 1.5rem 0;
        }
        .error-details details {
            text-align: left;
        }
        .error-details pre {
            background: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            font-size: 0.875rem;
        }
        .error-actions {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }
    `;
    document.head.appendChild(style);
}

// Handler untuk online/offline
window.addEventListener('online', () => {
    document.documentElement.classList.remove('offline');
    console.log('Aplikasi online');
});

window.addEventListener('offline', () => {
    document.documentElement.classList.add('offline');
    console.log('Aplikasi offline');
});

// Global error handler untuk menangkap error yang tidak tertangani
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Export untuk akses global (untuk debugging)
window.ShareYourStory = {
    OfflineStorage,
    InstallManager,
    // Test functions (remove in production)
    testNotification: () => {
        if (window.PushNotificationManager) {
            window.PushNotificationManager.triggerTestNotification();
        }
    },
    testInstall: () => {
        InstallManager.triggerInstallPrompt();
    },
    clearStorage: () => {
        localStorage.clear();
        sessionStorage.clear();
        indexedDB.deleteDatabase('ShareYourStoryDB');
        location.reload();
    }
};
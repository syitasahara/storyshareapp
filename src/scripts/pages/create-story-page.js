import { storyApi } from '../data/api.js';
import { pushManager } from '../utils/notification.js';
// Hapus import yang duplicate, gunakan hanya dari camera.js
import { startCamera, stopCamera, capturePhoto, dataURLtoFile, isCameraSupported } from '../utils/camera.js';

export default class CreateStoryPage {
    constructor() {
        this.selectedLocation = null;
        this.cameraActive = false;
        this.capturedPhoto = null;
        this.currentPhotoSource = 'file';
    }

    async render() {
        const isLoggedIn = !!localStorage.getItem('token');

        if (!isLoggedIn) {
            return `
                <section class="container">
                    <div class="auth-required">
                        <h2>Masuk untuk Menulis Cerita</h2>
                        <p>Anda perlu masuk untuk dapat menulis dan berbagi cerita.</p>
                        <div class="auth-actions">
                            <a href="#/login" class="btn btn-primary">Masuk</a>
                            <a href="#/register" class="btn btn-secondary">Daftar</a>
                        </div>
                    </div>
                </section>
            `;
        }

        return `
            <section class="create-page">
                <div class="container">
                    <h2>Tulis Cerita Baru</h2>
                    <form id="createForm" class="create-form" novalidate>
                        <div class="form-group">
                            <label for="description" class="form-label">Deskripsi Cerita *</label>
                            <textarea 
                                id="description" 
                                name="description" 
                                required 
                                minlength="10"
                                maxlength="1000"
                                class="form-textarea"
                                placeholder="Ceritakan pengalaman menarik Anda..."
                                aria-describedby="description-help"
                            ></textarea>
                            <div id="description-help" class="help-text">
                                Minimal 10 karakter, maksimal 1000 karakter
                            </div>
                            <div id="description-error" class="error-message"></div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Foto Cerita *</label>
                            <div class="upload-options">
                                <label class="upload-option">
                                    <input type="radio" name="photoSource" value="file" checked>
                                    <span>Unggah dari File</span>
                                </label>
                                ${isCameraSupported() ? `
                                    <label class="upload-option">
                                        <input type="radio" name="photoSource" value="camera">
                                        <span>Ambil Foto</span>
                                    </label>
                                ` : ''}
                            </div>

                            <div id="file-upload-section" class="photo-section">
                                <input 
                                    type="file" 
                                    id="photoFile" 
                                    name="photoFile" 
                                    accept="image/*" 
                                    required
                                    aria-describedby="photo-help"
                                >
                                <div id="photo-help" class="help-text">
                                    Format: JPG, PNG, GIF. Maksimal 1MB
                                </div>
                                <div id="file-error" class="error-message"></div>
                            </div>

                            ${isCameraSupported() ? `
                                <div id="camera-section" class="photo-section hidden">
                                    <div class="camera-preview">
                                        <video id="camera-video" autoplay playsinline></video>
                                        <canvas id="camera-canvas" class="hidden"></canvas>
                                        <div id="camera-placeholder" class="camera-placeholder">
                                            <p>Kamera belum diaktifkan</p>
                                        </div>
                                    </div>
                                    <div class="camera-controls">
                                        <button type="button" id="start-camera" class="btn btn-secondary">
                                            📷 Mulai Kamera
                                        </button>
                                        <button type="button" id="capture-photo" class="btn btn-primary hidden">
                                            📸 Ambil Foto
                                        </button>
                                        <button type="button" id="retake-photo" class="btn btn-secondary hidden">
                                            🔁 Ambil Ulang
                                        </button>
                                    </div>
                                    <div id="camera-error" class="error-message"></div>
                                </div>
                            ` : ''}
                        </div>

                        <div class="form-group">
                            <label class="form-label">Lokasi (Opsional)</label>
                            <div class="location-section">
                                <button type="button" id="get-location" class="btn btn-outline">
                                    📍 Dapatkan Lokasi Saat Ini
                                </button>
                                <div class="location-info hidden" id="location-info">
                                    <p>📍 Lokasi berhasil didapatkan</p>
                                </div>
                                <div class="location-coordinates">
                                    <div class="coord-input">
                                        <label for="lat">Latitude</label>
                                        <input type="number" id="lat" name="lat" step="any" class="form-input" placeholder="-6.2088">
                                    </div>
                                    <div class="coord-input">
                                        <label for="lon">Longitude</label>
                                        <input type="number" id="lon" name="lon" step="any" class="form-input" placeholder="106.8456">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" id="cancel-btn" class="btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" class="btn btn-primary">
                                📤 Publikasikan Cerita
                            </button>
                        </div>

                        <div id="status" class="status-message"></div>
                    </form>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.loadCSS();
        await this.setupEventListeners();
    }

    loadCSS() {
        if (!document.querySelector('link[href*="create-story.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/create-story.css';
            document.head.appendChild(link);
        }
    }

    async setupEventListeners() {
        const form = document.getElementById('createForm');
        const cancelBtn = document.getElementById('cancel-btn');
        const getLocationBtn = document.getElementById('get-location');
        const photoSourceRadios = document.querySelectorAll('input[name="photoSource"]');

        // Photo source toggle
        photoSourceRadios.forEach(radio => {
            radio.addEventListener('change', (e) => this.togglePhotoSource(e.target.value));
        });

        // Camera controls
        if (isCameraSupported()) {
            const startCameraBtn = document.getElementById('start-camera');
            const capturePhotoBtn = document.getElementById('capture-photo');
            const retakePhotoBtn = document.getElementById('retake-photo');

            startCameraBtn?.addEventListener('click', () => this.handleStartCamera());
            capturePhotoBtn?.addEventListener('click', () => this.handleCapturePhoto());
            retakePhotoBtn?.addEventListener('click', () => this.handleRetakePhoto());
        }

        // Location
        getLocationBtn?.addEventListener('click', () => this.getCurrentLocation());

        // Form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Cancel button
        cancelBtn?.addEventListener('click', () => {
            if (this.cameraActive) {
                stopCamera();
            }
            window.history.back();
        });

        // Cleanup camera when leaving page
        window.addEventListener('beforeunload', () => {
            if (this.cameraActive) {
                stopCamera();
            }
        });

        // Setup file input validation
        const fileInput = document.getElementById('photoFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.validateFileInput(e.target));
        }
    }

    togglePhotoSource(source) {
        const fileSection = document.getElementById('file-upload-section');
        const cameraSection = document.getElementById('camera-section');
        const fileInput = document.getElementById('photoFile');

        this.currentPhotoSource = source;

        if (source === 'file') {
            fileSection.classList.remove('hidden');
            if (cameraSection) {
                cameraSection.classList.add('hidden');
                if (this.cameraActive) {
                    stopCamera();
                    this.cameraActive = false;
                }
            }
            if (fileInput) {
                fileInput.required = true;
                fileInput.disabled = false;
            }
        } else if (source === 'camera') {
            fileSection.classList.add('hidden');
            if (cameraSection) {
                cameraSection.classList.remove('hidden');
            }
            if (fileInput) {
                fileInput.required = false;
                fileInput.disabled = true;
            }
        }
    }

    validateFileInput(input) {
        const errorElement = document.getElementById('file-error');
        if (!input.files || input.files.length === 0) {
            this.showError('file-error', 'Pilih file foto');
            return false;
        }

        const file = input.files[0];
        const maxSize = 1024 * 1024;

        if (file.size > maxSize) {
            this.showError('file-error', 'Ukuran file maksimal 1MB');
            return false;
        }

        if (!file.type.startsWith('image/')) {
            this.showError('file-error', 'File harus berupa gambar');
            return false;
        }

        this.clearError('file-error');
        return true;
    }

    async handleStartCamera() {
        try {
            const video = document.getElementById('camera-video');
            const startBtn = document.getElementById('start-camera');
            const captureBtn = document.getElementById('capture-photo');
            const placeholder = document.getElementById('camera-placeholder');

            await startCamera(video);
            
            this.cameraActive = true;
            startBtn.classList.add('hidden');
            captureBtn.classList.remove('hidden');
            placeholder.classList.add('hidden');
            video.classList.remove('hidden');
            
        } catch (error) {
            this.showError('camera-error', error.message);
        }
    }

    async handleCapturePhoto() {
        try {
            const video = document.getElementById('camera-video');
            const canvas = document.getElementById('camera-canvas');
            const captureBtn = document.getElementById('capture-photo');
            const retakeBtn = document.getElementById('retake-photo');

            const photoDataUrl = capturePhoto(video, canvas);
            
            this.capturedPhoto = photoDataUrl;
            
            video.classList.add('hidden');
            canvas.classList.remove('hidden');
            
            captureBtn.classList.add('hidden');
            retakeBtn.classList.remove('hidden');
            
            this.clearError('camera-error');
            
        } catch (error) {
            this.showError('camera-error', error.message);
        }
    }

    handleRetakePhoto() {
        const video = document.getElementById('camera-video');
        const canvas = document.getElementById('camera-canvas');
        const captureBtn = document.getElementById('capture-photo');
        const retakeBtn = document.getElementById('retake-photo');

        video.classList.remove('hidden');
        canvas.classList.add('hidden');
        
        captureBtn.classList.remove('hidden');
        retakeBtn.classList.add('hidden');
        
        this.capturedPhoto = null;
    }

    async getCurrentLocation() {
        const statusElement = document.getElementById('status');
        const locationInfo = document.getElementById('location-info');
        
        if (!navigator.geolocation) {
            this.showStatus('Geolocation tidak didukung di browser ini', 'error');
            return;
        }

        try {
            this.showStatus('Mendapatkan lokasi...', 'info');
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                });
            });

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            document.getElementById('lat').value = lat;
            document.getElementById('lon').value = lon;

            this.selectedLocation = { lat, lon };
            locationInfo.classList.remove('hidden');
            this.showStatus('Lokasi berhasil didapatkan', 'success');

        } catch (error) {
            console.error('Error getting location:', error);
            let errorMessage = 'Gagal mendapatkan lokasi';
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Informasi lokasi tidak tersedia.';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Permintaan lokasi timeout.';
                    break;
            }
            
            this.showStatus(errorMessage, 'error');
        }
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const description = formData.get('description');
        const photoSource = this.currentPhotoSource;
        const lat = formData.get('lat') || undefined;
        const lon = formData.get('lon') || undefined;

        if (!description || description.length < 10) {
            this.showStatus('Deskripsi harus minimal 10 karakter', 'error');
            this.showError('description-error', 'Deskripsi harus minimal 10 karakter');
            return;
        }

        if (description.length > 1000) {
            this.showStatus('Deskripsi maksimal 1000 karakter', 'error');
            this.showError('description-error', 'Deskripsi maksimal 1000 karakter');
            return;
        }

        let photoFile;

        if (photoSource === 'file') {
            const fileInput = document.getElementById('photoFile');
            if (!this.validateFileInput(fileInput)) {
                return;
            }
            photoFile = fileInput.files[0];
            
        } else if (photoSource === 'camera') {
            if (!this.capturedPhoto) {
                this.showStatus('Ambil foto terlebih dahulu', 'error');
                this.showError('camera-error', 'Ambil foto terlebih dahulu');
                return;
            }
            photoFile = dataURLtoFile(this.capturedPhoto, 'camera-photo.jpg');
        } else {
            this.showStatus('Pilih sumber foto', 'error');
            return;
        }

        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;

        try {
            submitButton.textContent = 'Mempublikasikan...';
            submitButton.disabled = true;

            this.showStatus('Mengupload cerita...', 'info');

            const result = await storyApi.addStory({
                description,
                photoFile,
                lat,
                lon
            });

            if (!result.error) {
                this.showStatus('Cerita berhasil dipublikasikan!', 'success');
                
                // Trigger notification setelah cerita berhasil dibuat
                await this.triggerNewStoryNotification(description, photoFile, lat, lon);
                
                // Reset form
                event.target.reset();
                if (this.cameraActive) {
                    stopCamera();
                    this.cameraActive = false;
                }
                this.capturedPhoto = null;
                this.selectedLocation = null;

                // Reset photo source to file
                const fileRadio = document.querySelector('input[value="file"]');
                if (fileRadio) {
                    fileRadio.checked = true;
                    this.togglePhotoSource('file');
                }

                // Redirect ke halaman stories setelah 2 detik
                setTimeout(() => {
                    window.location.hash = '/stories';
                }, 2000);

            } else {
                throw new Error(result.message || 'Gagal mempublikasikan cerita');
            }

        } catch (error) {
            console.error('Error publishing story:', error);
            this.showStatus(error.message || 'Gagal mempublikasikan cerita', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    async triggerNewStoryNotification(description, photoFile, lat, lon) {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userName = user.name || 'Seseorang';
            
            const storyData = {
                id: `story-${Date.now()}`,
                name: userName,
                description: description,
                photoUrl: await this.getImageUrl(photoFile),
                createdAt: new Date().toISOString(),
                hasLocation: !!(lat && lon)
            };

            console.log('Triggering notification for new story:', storyData);

            // Kirim notifikasi ke semua subscriber
            await this.sendPushNotificationToSubscribers(storyData);
            
            // Tampilkan local notification untuk pembuat cerita
            await this.showLocalSuccessNotification(storyData);

        } catch (error) {
            console.error('Error triggering notification:', error);
        }
    }

    async sendPushNotificationToSubscribers(storyData) {
        try {
            const pushState = await pushManager.getSubscriptionState();
            
            if (pushState.isSubscribed) {
                await pushManager.showAdvancedNotification(storyData);
            } else {
                await pushManager.showBasicNotification(
                    'Cerita Berhasil Dipublikasikan!',
                    {
                        body: `"${storyData.description.substring(0, 50)}..." berhasil dibagikan`,
                        tag: 'story-created'
                    }
                );
            }
            
        } catch (error) {
            console.error('Error sending push notification:', error);
            this.showFallbackNotification(storyData);
        }
    }

    async showLocalSuccessNotification(storyData) {
        try {
            if (!pushManager.registration) {
                pushManager.registration = await navigator.serviceWorker.ready;
            }

            const options = {
                body: `Cerita Anda "${storyData.description.substring(0, 60)}..." berhasil dipublikasikan dan dapat dilihat oleh pengguna lain.`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: 'story-created-success',
                data: {
                    url: '/#/stories',
                    action: 'view-stories'
                },
                actions: [
                    {
                        action: 'view-stories',
                        title: '📚 Lihat Semua Cerita'
                    },
                    {
                        action: 'view-map',
                        title: '🗺️ Lihat di Peta'
                    }
                ],
                requireInteraction: true
            };

            await pushManager.registration.showNotification(
                '🎉 Cerita Berhasil Dibagikan!',
                options
            );

        } catch (error) {
            console.error('Error showing local success notification:', error);
        }
    }

    showFallbackNotification(storyData) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Cerita Baru Dibagikan!', {
                body: `${storyData.name} membagikan: "${storyData.description.substring(0, 80)}..."`,
                icon: '/icons/icon-192x192.png',
                tag: 'story-fallback'
            });

            notification.onclick = () => {
                window.focus();
                window.location.hash = '/stories';
                notification.close();
            };
        }
    }

    async getImageUrl(photoFile) {
        if (photoFile && typeof photoFile === 'object') {
            return URL.createObjectURL(photoFile);
        }
        return '/icons/icon-512x512.png';
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    showStatus(message, type) {
        const statusElement = document.getElementById('status');
        if (!statusElement) return;

        statusElement.textContent = message;
        statusElement.className = `status-message ${type}`;
        statusElement.style.display = 'block';

        if (type !== 'info') {
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 5000);
        }
    }
}
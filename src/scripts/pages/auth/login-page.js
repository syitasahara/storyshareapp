import { storyApi } from '../../data/api.js';
import { validateEmail, showFormattedDate } from '../../utils/ui-helpers.js';

export default class LoginPage {
    async render() {
        return `
            <section class="auth-page">
                <div class="auth-container">
                    <header class="auth-header">
                        <h1>Masuk ke ShareYourStory</h1>
                        <p>Silakan masuk untuk berbagi cerita Anda</p>
                    </header>
                    
                    <form id="login-form" class="auth-form" novalidate>
                        <div id="form-messages"></div>
                        
                        <div class="form-group">
                            <label for="email" class="form-label">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                required 
                                aria-describedby="email-error"
                                class="form-input"
                                placeholder="masukkan email Anda"
                                autocomplete="email"
                            >
                            <div id="email-error" class="error-message" aria-live="polite"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="password" class="form-label">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                name="password" 
                                required 
                                minlength="8"
                                aria-describedby="password-error"
                                class="form-input"
                                placeholder="masukkan password (minimal 8 karakter)"
                                autocomplete="current-password"
                            >
                            <div id="password-error" class="error-message" aria-live="polite"></div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full">Masuk</button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Belum punya akun? <a href="#/register" class="auth-link">Daftar di sini</a></p>
                        <p class="guest-notice">Atau <a href="#/stories">lanjutkan sebagai tamu</a> untuk melihat cerita</p>
                    </div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        // Load CSS
        this.loadCSS();
        
        const form = document.getElementById('login-form');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        // Event listeners untuk real-time validation
        emailInput.addEventListener('blur', () => this.validateEmail());
        passwordInput.addEventListener('blur', () => this.validatePassword());

        form.addEventListener('submit', (e) => this.handleLogin(e));
    }

    loadCSS() {
        if (!document.querySelector('link[href*="auth.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/auth.css';
            document.head.appendChild(link);
        }
    }

    validateEmail() {
        const email = document.getElementById('email').value;
        const errorElement = document.getElementById('email-error');
        
        if (!email) {
            this.showError('email', 'Email harus diisi');
            return false;
        } else if (!validateEmail(email)) {
            this.showError('email', 'Format email tidak valid');
            return false;
        } else {
            this.clearError('email');
            return true;
        }
    }

    validatePassword() {
        const password = document.getElementById('password').value;
        
        if (!password) {
            this.showError('password', 'Kata sandi harus diisi');
            return false;
        } else if (password.length < 8) {
            this.showError('password', 'Kata sandi minimal 8 karakter');
            return false;
        } else {
            this.clearError('password');
            return true;
        }
    }

    showError(field, message) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(field);
        
        if (errorElement && inputElement) {
            errorElement.textContent = message;
            inputElement.setAttribute('aria-invalid', 'true');
            inputElement.classList.add('error');
        }
    }

    clearError(field) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(field);
        
        if (errorElement && inputElement) {
            errorElement.textContent = '';
            inputElement.setAttribute('aria-invalid', 'false');
            inputElement.classList.remove('error');
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        // Validasi form
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isEmailValid || !isPasswordValid) {
            this.showMessage('Harap perbaiki error di atas', 'error');
            return;
        }

        const formData = new FormData(event.target);
        const credentials = {
            email: formData.get('email'),
            password: formData.get('password'),
        };

        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.textContent = 'Memproses...';
            submitButton.disabled = true;

            const result = await storyApi.login(credentials);
            
            // Simpan token dan user info
            localStorage.setItem('token', result.loginResult.token);
            localStorage.setItem('user', JSON.stringify({
                userId: result.loginResult.userId,
                name: result.loginResult.name,
            }));
            
            storyApi.setToken(result.loginResult.token);
            
            this.showMessage(`Login berhasil! Selamat datang, ${result.loginResult.name}`, 'success');
            
            // Redirect ke halaman stories setelah login berhasil
            setTimeout(() => {
                window.location.hash = '/stories';
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(error.message || 'Login gagal. Periksa email dan password Anda.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    showMessage(message, type) {
        const messagesContainer = document.getElementById('form-messages');
        if (!messagesContainer) return;

        // Hapus pesan sebelumnya
        messagesContainer.innerHTML = '';

        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        messageElement.setAttribute('role', 'alert');
        messageElement.setAttribute('aria-live', 'polite');

        messagesContainer.appendChild(messageElement);

        // Hapus pesan error setelah 5 detik
        if (type === 'error') {
            setTimeout(() => {
                messageElement.remove();
            }, 5000);
        }
    }
}
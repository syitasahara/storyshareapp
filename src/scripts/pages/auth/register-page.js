import { storyApi } from '../../data/api.js';
import { validateEmail } from '../../utils/ui-helpers.js';

export default class RegisterPage {
    async render() {
        return `
            <section class="auth-page">
                <div class="auth-container">
                    <header class="auth-header">
                        <h1>Daftar ShareYourStory</h1>
                        <p>Buat akun untuk mulai berbagi cerita</p>
                    </header>
                    
                    <form id="register-form" class="auth-form" novalidate>
                        <div class="form-group">
                            <label for="name" class="form-label">Nama Lengkap</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                required 
                                aria-describedby="name-error"
                                class="form-input"
                                placeholder="masukkan nama lengkap Anda"
                                autocomplete="name"
                            >
                            <div id="name-error" class="error-message" aria-live="polite"></div>
                        </div>
                        
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
                                placeholder="buat password (minimal 8 karakter)"
                                autocomplete="new-password"
                            >
                            <div id="password-error" class="error-message" aria-live="polite"></div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-full">Daftar</button>
                    </form>
                    
                    <div class="auth-footer">
                        <p>Sudah punya akun? <a href="#/login" class="auth-link">Masuk di sini</a></p>
                    </div>
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.loadCSS();
        
        const form = document.getElementById('register-form');
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        // Event listeners untuk real-time validation
        nameInput.addEventListener('blur', () => this.validateName());
        emailInput.addEventListener('blur', () => this.validateEmail());
        passwordInput.addEventListener('blur', () => this.validatePassword());

        form.addEventListener('submit', (e) => this.handleRegister(e));
    }

    loadCSS() {
        if (!document.querySelector('link[href*="auth.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/auth.css';
            document.head.appendChild(link);
        }
    }

    validateName() {
        const name = document.getElementById('name').value;
        
        if (!name) {
            this.showError('name', 'Nama harus diisi');
            return false;
        } else if (name.length < 3) {
            this.showError('name', 'Nama minimal 3 karakter');
            return false;
        } else {
            this.clearError('name');
            return true;
        }
    }

    validateEmail() {
        const email = document.getElementById('email').value;
        
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
        
        errorElement.textContent = message;
        inputElement.setAttribute('aria-invalid', 'true');
        inputElement.classList.add('error');
    }

    clearError(field) {
        const errorElement = document.getElementById(`${field}-error`);
        const inputElement = document.getElementById(field);
        
        errorElement.textContent = '';
        inputElement.setAttribute('aria-invalid', 'false');
        inputElement.classList.remove('error');
    }

    async handleRegister(event) {
        event.preventDefault();
        
        // Validasi semua field
        const isNameValid = this.validateName();
        const isEmailValid = this.validateEmail();
        const isPasswordValid = this.validatePassword();
        
        if (!isNameValid || !isEmailValid || !isPasswordValid) {
            this.showMessage('Harap perbaiki error di atas', 'error');
            return;
        }

        const formData = new FormData(event.target);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
        };

        const submitButton = event.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        
        try {
            submitButton.textContent = 'Mendaftarkan...';
            submitButton.disabled = true;

            const result = await storyApi.register(userData);
            
            this.showMessage('Pendaftaran berhasil! Silakan masuk.', 'success');
            
            // Redirect ke halaman login setelah 2 detik
            setTimeout(() => {
                window.location.hash = '/login';
            }, 2000);
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage(error.message || 'Pendaftaran gagal. Silakan coba lagi.', 'error');
        } finally {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    showMessage(message, type) {
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.textContent = message;
        messageElement.setAttribute('role', 'alert');
        messageElement.setAttribute('aria-live', 'polite');

        const form = document.getElementById('register-form');
        form.insertBefore(messageElement, form.firstChild);

        // Hapus pesan error setelah 5 detik
        if (type === 'error') {
            setTimeout(() => {
                messageElement.remove();
            }, 5000);
        }
    }
}
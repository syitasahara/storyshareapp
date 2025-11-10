import{v as d,s as m}from"./index-B5PYlZDb.js";class h{async render(){return`
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
        `}async afterRender(){this.loadCSS();const e=document.getElementById("register-form"),r=document.getElementById("name"),t=document.getElementById("email"),a=document.getElementById("password");r.addEventListener("blur",()=>this.validateName()),t.addEventListener("blur",()=>this.validateEmail()),a.addEventListener("blur",()=>this.validatePassword()),e.addEventListener("submit",s=>this.handleRegister(s))}loadCSS(){if(!document.querySelector('link[href*="auth.css"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="/styles/auth.css",document.head.appendChild(e)}}validateName(){const e=document.getElementById("name").value;return e?e.length<3?(this.showError("name","Nama minimal 3 karakter"),!1):(this.clearError("name"),!0):(this.showError("name","Nama harus diisi"),!1)}validateEmail(){const e=document.getElementById("email").value;return e?d(e)?(this.clearError("email"),!0):(this.showError("email","Format email tidak valid"),!1):(this.showError("email","Email harus diisi"),!1)}validatePassword(){const e=document.getElementById("password").value;return e?e.length<8?(this.showError("password","Kata sandi minimal 8 karakter"),!1):(this.clearError("password"),!0):(this.showError("password","Kata sandi harus diisi"),!1)}showError(e,r){const t=document.getElementById(`${e}-error`),a=document.getElementById(e);t.textContent=r,a.setAttribute("aria-invalid","true"),a.classList.add("error")}clearError(e){const r=document.getElementById(`${e}-error`),t=document.getElementById(e);r.textContent="",t.setAttribute("aria-invalid","false"),t.classList.remove("error")}async handleRegister(e){e.preventDefault();const r=this.validateName(),t=this.validateEmail(),a=this.validatePassword();if(!r||!t||!a){this.showMessage("Harap perbaiki error di atas","error");return}const s=new FormData(e.target),l={name:s.get("name"),email:s.get("email"),password:s.get("password")},i=e.target.querySelector('button[type="submit"]'),n=i.textContent;try{i.textContent="Mendaftarkan...",i.disabled=!0;const o=await m.register(l);this.showMessage("Pendaftaran berhasil! Silakan masuk.","success"),setTimeout(()=>{window.location.hash="/login"},2e3)}catch(o){console.error("Registration error:",o),this.showMessage(o.message||"Pendaftaran gagal. Silakan coba lagi.","error")}finally{i.textContent=n,i.disabled=!1}}showMessage(e,r){const t=document.querySelector(".form-message");t&&t.remove();const a=document.createElement("div");a.className=`form-message ${r}`,a.textContent=e,a.setAttribute("role","alert"),a.setAttribute("aria-live","polite");const s=document.getElementById("register-form");s.insertBefore(a,s.firstChild),r==="error"&&setTimeout(()=>{a.remove()},5e3)}}export{h as default};

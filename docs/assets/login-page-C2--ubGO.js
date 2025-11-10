import{v as d,s as o}from"./index-B5PYlZDb.js";class c{async render(){return`
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
        `}async afterRender(){this.loadCSS();const e=document.getElementById("login-form"),s=document.getElementById("email"),a=document.getElementById("password");s.addEventListener("blur",()=>this.validateEmail()),a.addEventListener("blur",()=>this.validatePassword()),e.addEventListener("submit",t=>this.handleLogin(t))}loadCSS(){if(!document.querySelector('link[href*="auth.css"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="/styles/auth.css",document.head.appendChild(e)}}validateEmail(){const e=document.getElementById("email").value;return document.getElementById("email-error"),e?d(e)?(this.clearError("email"),!0):(this.showError("email","Format email tidak valid"),!1):(this.showError("email","Email harus diisi"),!1)}validatePassword(){const e=document.getElementById("password").value;return e?e.length<8?(this.showError("password","Kata sandi minimal 8 karakter"),!1):(this.clearError("password"),!0):(this.showError("password","Kata sandi harus diisi"),!1)}showError(e,s){const a=document.getElementById(`${e}-error`),t=document.getElementById(e);a&&t&&(a.textContent=s,t.setAttribute("aria-invalid","true"),t.classList.add("error"))}clearError(e){const s=document.getElementById(`${e}-error`),a=document.getElementById(e);s&&a&&(s.textContent="",a.setAttribute("aria-invalid","false"),a.classList.remove("error"))}async handleLogin(e){e.preventDefault();const s=this.validateEmail(),a=this.validatePassword();if(!s||!a){this.showMessage("Harap perbaiki error di atas","error");return}const t=new FormData(e.target),l={email:t.get("email"),password:t.get("password")},i=e.target.querySelector('button[type="submit"]'),n=i.textContent;try{i.textContent="Memproses...",i.disabled=!0;const r=await o.login(l);localStorage.setItem("token",r.loginResult.token),localStorage.setItem("user",JSON.stringify({userId:r.loginResult.userId,name:r.loginResult.name})),o.setToken(r.loginResult.token),this.showMessage(`Login berhasil! Selamat datang, ${r.loginResult.name}`,"success"),setTimeout(()=>{window.location.hash="/stories"},1500)}catch(r){console.error("Login error:",r),this.showMessage(r.message||"Login gagal. Periksa email dan password Anda.","error")}finally{i.textContent=n,i.disabled=!1}}showMessage(e,s){const a=document.getElementById("form-messages");if(!a)return;a.innerHTML="";const t=document.createElement("div");t.className=`form-message ${s}`,t.textContent=e,t.setAttribute("role","alert"),t.setAttribute("aria-live","polite"),a.appendChild(t),s==="error"&&setTimeout(()=>{t.remove()},5e3)}}export{c as default};

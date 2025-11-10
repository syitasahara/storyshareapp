import{s as b}from"./index-B5PYlZDb.js";import{p as d}from"./notification-BdzrFDys.js";let u=null,p=!1;async function k(n){try{return u&&h(),u=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment",width:{ideal:1280},height:{ideal:720}},audio:!1}),n.srcObject=u,await n.play(),p=!0,console.log("Camera started successfully"),!0}catch(e){console.error("Error accessing camera:",e);let t="Tidak dapat mengakses kamera. ";throw e.name==="NotAllowedError"?t+="Izin akses kamera ditolak.":e.name==="NotFoundError"?t+="Tidak ada kamera yang ditemukan.":e.name==="NotSupportedError"?t+="Browser tidak mendukung akses kamera.":t+="Pastikan Anda memberikan izin akses kamera.",new Error(t)}}function h(){u&&(console.log("Stopping camera..."),u.getTracks().forEach(n=>{n.stop(),console.log("Camera track stopped:",n.kind)}),u=null),p=!1}function y(n,e){if(!p)throw new Error("Kamera tidak aktif");const t=e.getContext("2d");return e.width=n.videoWidth,e.height=n.videoHeight,t.drawImage(n,0,0,e.width,e.height),console.log("Photo captured successfully"),e.toDataURL("image/jpeg",.8)}function v(n,e){const t=n.split(","),a=t[0].match(/:(.*?);/)[1],i=atob(t[1]);let s=i.length;const o=new Uint8Array(s);for(;s--;)o[s]=i.charCodeAt(s);const r=new File([o],e,{type:a});return console.log("File created from data URL:",r.name,r.size,"bytes"),r}function m(){return!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)}class S{constructor(){this.selectedLocation=null,this.cameraActive=!1,this.capturedPhoto=null,this.currentPhotoSource="file"}async render(){return!localStorage.getItem("token")?`
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
            `:`
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
                                ${m()?`
                                    <label class="upload-option">
                                        <input type="radio" name="photoSource" value="camera">
                                        <span>Ambil Foto</span>
                                    </label>
                                `:""}
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

                            ${m()?`
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
                            `:""}
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
        `}async afterRender(){this.loadCSS(),await this.setupEventListeners()}loadCSS(){if(!document.querySelector('link[href*="create-story.css"]')){const e=document.createElement("link");e.rel="stylesheet",e.href="/styles/create-story.css",document.head.appendChild(e)}}async setupEventListeners(){const e=document.getElementById("createForm"),t=document.getElementById("cancel-btn"),a=document.getElementById("get-location");if(document.querySelectorAll('input[name="photoSource"]').forEach(o=>{o.addEventListener("change",r=>this.togglePhotoSource(r.target.value))}),m()){const o=document.getElementById("start-camera"),r=document.getElementById("capture-photo"),c=document.getElementById("retake-photo");o==null||o.addEventListener("click",()=>this.handleStartCamera()),r==null||r.addEventListener("click",()=>this.handleCapturePhoto()),c==null||c.addEventListener("click",()=>this.handleRetakePhoto())}a==null||a.addEventListener("click",()=>this.getCurrentLocation()),e.addEventListener("submit",o=>this.handleSubmit(o)),t==null||t.addEventListener("click",()=>{this.cameraActive&&h(),window.history.back()}),window.addEventListener("beforeunload",()=>{this.cameraActive&&h()});const s=document.getElementById("photoFile");s&&s.addEventListener("change",o=>this.validateFileInput(o.target))}togglePhotoSource(e){const t=document.getElementById("file-upload-section"),a=document.getElementById("camera-section"),i=document.getElementById("photoFile");this.currentPhotoSource=e,e==="file"?(t.classList.remove("hidden"),a&&(a.classList.add("hidden"),this.cameraActive&&(h(),this.cameraActive=!1)),i&&(i.required=!0,i.disabled=!1)):e==="camera"&&(t.classList.add("hidden"),a&&a.classList.remove("hidden"),i&&(i.required=!1,i.disabled=!0))}validateFileInput(e){if(document.getElementById("file-error"),!e.files||e.files.length===0)return this.showError("file-error","Pilih file foto"),!1;const t=e.files[0],a=1024*1024;return t.size>a?(this.showError("file-error","Ukuran file maksimal 1MB"),!1):t.type.startsWith("image/")?(this.clearError("file-error"),!0):(this.showError("file-error","File harus berupa gambar"),!1)}async handleStartCamera(){try{const e=document.getElementById("camera-video"),t=document.getElementById("start-camera"),a=document.getElementById("capture-photo"),i=document.getElementById("camera-placeholder");await k(e),this.cameraActive=!0,t.classList.add("hidden"),a.classList.remove("hidden"),i.classList.add("hidden"),e.classList.remove("hidden")}catch(e){this.showError("camera-error",e.message)}}async handleCapturePhoto(){try{const e=document.getElementById("camera-video"),t=document.getElementById("camera-canvas"),a=document.getElementById("capture-photo"),i=document.getElementById("retake-photo"),s=y(e,t);this.capturedPhoto=s,e.classList.add("hidden"),t.classList.remove("hidden"),a.classList.add("hidden"),i.classList.remove("hidden"),this.clearError("camera-error")}catch(e){this.showError("camera-error",e.message)}}handleRetakePhoto(){const e=document.getElementById("camera-video"),t=document.getElementById("camera-canvas"),a=document.getElementById("capture-photo"),i=document.getElementById("retake-photo");e.classList.remove("hidden"),t.classList.add("hidden"),a.classList.remove("hidden"),i.classList.add("hidden"),this.capturedPhoto=null}async getCurrentLocation(){document.getElementById("status");const e=document.getElementById("location-info");if(!navigator.geolocation){this.showStatus("Geolocation tidak didukung di browser ini","error");return}try{this.showStatus("Mendapatkan lokasi...","info");const t=await new Promise((s,o)=>{navigator.geolocation.getCurrentPosition(s,o,{enableHighAccuracy:!0,timeout:1e4,maximumAge:6e4})}),a=t.coords.latitude,i=t.coords.longitude;document.getElementById("lat").value=a,document.getElementById("lon").value=i,this.selectedLocation={lat:a,lon:i},e.classList.remove("hidden"),this.showStatus("Lokasi berhasil didapatkan","success")}catch(t){console.error("Error getting location:",t);let a="Gagal mendapatkan lokasi";switch(t.code){case t.PERMISSION_DENIED:a="Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda.";break;case t.POSITION_UNAVAILABLE:a="Informasi lokasi tidak tersedia.";break;case t.TIMEOUT:a="Permintaan lokasi timeout.";break}this.showStatus(a,"error")}}async handleSubmit(e){e.preventDefault();const t=new FormData(e.target),a=t.get("description"),i=this.currentPhotoSource,s=t.get("lat")||void 0,o=t.get("lon")||void 0;if(!a||a.length<10){this.showStatus("Deskripsi harus minimal 10 karakter","error"),this.showError("description-error","Deskripsi harus minimal 10 karakter");return}if(a.length>1e3){this.showStatus("Deskripsi maksimal 1000 karakter","error"),this.showError("description-error","Deskripsi maksimal 1000 karakter");return}let r;if(i==="file"){const l=document.getElementById("photoFile");if(!this.validateFileInput(l))return;r=l.files[0]}else if(i==="camera"){if(!this.capturedPhoto){this.showStatus("Ambil foto terlebih dahulu","error"),this.showError("camera-error","Ambil foto terlebih dahulu");return}r=v(this.capturedPhoto,"camera-photo.jpg")}else{this.showStatus("Pilih sumber foto","error");return}const c=e.target.querySelector('button[type="submit"]'),f=c.textContent;try{c.textContent="Mempublikasikan...",c.disabled=!0,this.showStatus("Mengupload cerita...","info");const l=await b.addStory({description:a,photoFile:r,lat:s,lon:o});if(l.error)throw new Error(l.message||"Gagal mempublikasikan cerita");{this.showStatus("Cerita berhasil dipublikasikan!","success"),await this.triggerNewStoryNotification(a,r,s,o),e.target.reset(),this.cameraActive&&(h(),this.cameraActive=!1),this.capturedPhoto=null,this.selectedLocation=null;const g=document.querySelector('input[value="file"]');g&&(g.checked=!0,this.togglePhotoSource("file")),setTimeout(()=>{window.location.hash="/stories"},2e3)}}catch(l){console.error("Error publishing story:",l),this.showStatus(l.message||"Gagal mempublikasikan cerita","error")}finally{c.textContent=f,c.disabled=!1}}async triggerNewStoryNotification(e,t,a,i){try{const o=JSON.parse(localStorage.getItem("user")||"{}").name||"Seseorang",r={id:`story-${Date.now()}`,name:o,description:e,photoUrl:await this.getImageUrl(t),createdAt:new Date().toISOString(),hasLocation:!!(a&&i)};console.log("Triggering notification for new story:",r),await this.sendPushNotificationToSubscribers(r),await this.showLocalSuccessNotification(r)}catch(s){console.error("Error triggering notification:",s)}}async sendPushNotificationToSubscribers(e){try{(await d.getSubscriptionState()).isSubscribed?await d.showAdvancedNotification(e):await d.showBasicNotification("Cerita Berhasil Dipublikasikan!",{body:`"${e.description.substring(0,50)}..." berhasil dibagikan`,tag:"story-created"})}catch(t){console.error("Error sending push notification:",t),this.showFallbackNotification(e)}}async showLocalSuccessNotification(e){try{d.registration||(d.registration=await navigator.serviceWorker.ready);const t={body:`Cerita Anda "${e.description.substring(0,60)}..." berhasil dipublikasikan dan dapat dilihat oleh pengguna lain.`,icon:"/icons/icon-192x192.png",badge:"/icons/icon-72x72.png",tag:"story-created-success",data:{url:"/#/stories",action:"view-stories"},actions:[{action:"view-stories",title:"📚 Lihat Semua Cerita"},{action:"view-map",title:"🗺️ Lihat di Peta"}],requireInteraction:!0};await d.registration.showNotification("🎉 Cerita Berhasil Dibagikan!",t)}catch(t){console.error("Error showing local success notification:",t)}}showFallbackNotification(e){if("Notification"in window&&Notification.permission==="granted"){const t=new Notification("Cerita Baru Dibagikan!",{body:`${e.name} membagikan: "${e.description.substring(0,80)}..."`,icon:"/icons/icon-192x192.png",tag:"story-fallback"});t.onclick=()=>{window.focus(),window.location.hash="/stories",t.close()}}}async getImageUrl(e){return e&&typeof e=="object"?URL.createObjectURL(e):"/icons/icon-512x512.png"}showError(e,t){const a=document.getElementById(e);a&&(a.textContent=t,a.style.display="block")}clearError(e){const t=document.getElementById(e);t&&(t.textContent="",t.style.display="none")}showStatus(e,t){const a=document.getElementById("status");a&&(a.textContent=e,a.className=`status-message ${t}`,a.style.display="block",t!=="info"&&setTimeout(()=>{a.style.display="none"},5e3))}}export{S as default};

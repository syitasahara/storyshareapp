import{s as a,a as i}from"./index-B5PYlZDb.js";class n{constructor(){this.story=null,this.storyId=null}setStoryId(t){this.storyId=t,console.log("Story ID set to:",this.storyId)}async render(){const t=this.storyId||this.getStoryIdFromUrl();if(console.log("Rendering story detail for ID:",t),!t)return this.getErrorPage("ID cerita tidak valid");try{const s=await a.getStoryDetail(t);if(this.story=s.story,!this.story)throw new Error("Cerita tidak ditemukan");console.log("Story loaded successfully:",this.story)}catch(s){return console.error("Error loading story detail:",s),this.getErrorPage(s.message||"Cerita tidak ditemukan atau telah dihapus.")}return`
            <section class="story-detail-page">
                <div class="container">
                    <article class="story-detail">
                        <header class="story-detail-header">
                            <button class="btn btn-secondary" id="back-btn">
                                ← Kembali
                            </button>
                            <h1 class="story-detail-title">${this.escapeHtml(this.story.name)}</h1>
                            <div class="story-detail-meta">
                                <span class="story-author">Oleh: ${this.escapeHtml(this.story.name)}</span>
                                <span class="story-date">${i(this.story.createdAt)}</span>
                            </div>
                        </header>
                        
                        ${this.story.photoUrl?`
                            <figure class="story-detail-image">
                                <img src="${this.story.photoUrl}" alt="Ilustrasi cerita ${this.escapeHtml(this.story.name)}" loading="lazy">
                                <figcaption>Ilustrasi cerita</figcaption>
                            </figure>
                        `:""}
                        
                        <div class="story-detail-content">
                            ${this.formatStoryContent(this.story.description)}
                        </div>
                        
                        ${this.story.lat&&this.story.lon?`
                            <div class="story-location">
                                <h3>📍 Lokasi Cerita</h3>
                                <p>Latitude: ${this.story.lat}, Longitude: ${this.story.lon}</p>
                                <div class="location-actions">
                                    <a href="#/map?story=${this.story.id}" class="btn btn-outline">Lihat di Peta</a>
                                    <button class="btn btn-secondary" id="copy-coordinates">
                                        Salin Koordinat
                                    </button>
                                </div>
                            </div>
                        `:""}
                        
                        <footer class="story-detail-actions">
                            <div class="action-buttons">
                                <button class="btn-like" aria-label="Suka cerita ini">
                                    <span class="like-icon">❤️</span>
                                    <span>Suka</span>
                                </button>
                                <button class="btn-share" aria-label="Bagikan cerita ini">
                                    <span class="share-icon">🔗</span>
                                    <span>Bagikan</span>
                                </button>
                            </div>
                        </footer>
                    </article>
                </div>
            </section>
        `}getStoryIdFromUrl(){const t=window.location.hash.slice(1);return t.startsWith("/stories/")?t.split("/")[2]:null}escapeHtml(t){return t?t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;"):""}formatStoryContent(t){return t?this.escapeHtml(t).split(`
`).filter(e=>e.trim()).map(e=>`<p>${e}</p>`).join(""):"<p>Tidak ada deskripsi</p>"}async afterRender(){this.loadCSS(),this.setupEventListeners()}loadCSS(){if(!document.querySelector('link[href*="story-detail.css"]')){const t=document.createElement("link");t.rel="stylesheet",t.href="/styles/story-detail.css",document.head.appendChild(t)}}setupEventListeners(){this.setupBackButton(),this.setupLikeButton(),this.setupShareButton(),this.setupCopyCoordinates()}setupBackButton(){const t=document.getElementById("back-btn");t&&(t.addEventListener("click",()=>{window.history.back()}),t.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),t.click())}))}setupLikeButton(){const t=document.querySelector(".btn-like");t&&t.addEventListener("click",()=>{t.classList.toggle("liked"),t.setAttribute("aria-pressed",t.classList.contains("liked")),t.classList.contains("liked")?(t.innerHTML='<span class="like-icon">❤️</span><span>Disukai</span>',this.showToast("Cerita ditambahkan ke favorit","success")):(t.innerHTML='<span class="like-icon">❤️</span><span>Suka</span>',this.showToast("Cerita dihapus dari favorit","info"))})}setupShareButton(){const t=document.querySelector(".btn-share");t&&t.addEventListener("click",async()=>{try{navigator.share?(await navigator.share({title:this.story.name,text:this.story.description.substring(0,100),url:window.location.href}),this.showToast("Cerita berhasil dibagikan","success")):(await navigator.clipboard.writeText(window.location.href),this.showToast("Link cerita berhasil disalin!","success"))}catch(s){s.name!=="AbortError"&&(console.error("Error sharing:",s),this.showToast("Gagal membagikan cerita","error"))}})}setupCopyCoordinates(){const t=document.getElementById("copy-coordinates");t&&this.story.lat&&this.story.lon&&t.addEventListener("click",async()=>{const s=`${this.story.lat}, ${this.story.lon}`;try{await navigator.clipboard.writeText(s),this.showToast("Koordinat berhasil disalin!","success")}catch(e){console.error("Error copying coordinates:",e),this.showToast("Gagal menyalin koordinat","error")}})}showToast(t,s){const e=document.createElement("div");e.className=`toast-message ${s}`,e.textContent=t,e.setAttribute("role","alert"),document.body.appendChild(e),setTimeout(()=>{e.parentNode&&e.remove()},3e3)}getErrorPage(t){return`
            <section class="container error-page">
                <div class="error-content">
                    <h1>Cerita Tidak Ditemukan</h1>
                    <p>${t}</p>
                    <div class="error-actions">
                        <a href="#/stories" class="btn btn-primary">Kembali ke Daftar Cerita</a>
                        <a href="#/" class="btn btn-secondary">Kembali ke Beranda</a>
                    </div>
                </div>
            </section>
        `}}export{n as default};

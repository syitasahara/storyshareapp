import{s as r,a as i}from"./index-B5PYlZDb.js";class h{constructor(){this.stories=[],this.currentPage=1,this.hasMore=!0,this.withLocation=!1}async render(){try{const e=await r.getStories(this.currentPage,20,this.withLocation?1:0);this.stories=e.listStory||[],this.hasMore=(e.listStory||[]).length===20}catch(e){console.error("Error loading stories:",e),this.stories=[]}const t=!!localStorage.getItem("token"),a=JSON.parse(localStorage.getItem("user")||"{}");return`
            <section class="stories-page">
                <div class="container">
                    <div class="page-header">
                        <h1>Kumpulan Cerita</h1>
                        <div class="page-actions">
                            <button class="btn ${this.withLocation?"btn-primary":"btn-secondary"}" id="toggle-location">
                                ${this.withLocation?"🔍 Dengan Lokasi":"🌍 Semua Cerita"}
                            </button>
                            <a href="#/map" class="btn btn-primary">Lihat Peta</a>
                            ${t?`<span class="user-greeting">Halo, ${a.name}</span>
                                       <a href="#/create-story" class="btn btn-primary">Tulis Cerita</a>`:'<a href="#/login" class="btn btn-primary">Masuk untuk Menulis</a>'}
                        </div>
                    </div>
                    
                    ${t?"":`
                        <div class="guest-notice">
                            <p>Anda sedang melihat cerita sebagai tamu. <a href="#/login">Masuk</a> untuk menulis cerita kamu!</p>
                        </div>
                    `}
                    
                    ${this.stories.length===0?`
                        <div class="no-stories">
                            <p>📝 Belum ada cerita yang tersedia.</p>
                            ${t?`
                                <p><a href="#/create-story" class="auth-link">Tulis cerita pertama Anda</a>!</p>
                            `:`
                                <p><a href="#/login" class="auth-link">Masuk</a> atau <a href="#/register" class="auth-link">daftar</a> untuk melihat dan mulai berbagi cerita!</p>
                            `}
                        </div>
                    `:`
                        <div class="stories-grid" role="list" aria-label="Daftar cerita">
                            ${this.stories.map((e,s)=>`
                                <article class="story-card" data-id="${e.id}" role="listitem" tabindex="0">
                                    ${e.photoUrl?`
                                        <div class="story-image">
                                            <img src="${e.photoUrl}" alt="Foto cerita ${e.name}" loading="lazy">
                                            ${e.lat&&e.lon?'<span class="location-badge">📍</span>':""}
                                        </div>
                                    `:""}
                                    <div class="story-header">
                                        <h3 class="story-title">${e.name}</h3>
                                        <span class="story-date">${i(e.createdAt)}</span>
                                    </div>
                                    <p class="story-excerpt">${e.description.substring(0,150)}...</p>
                                    <div class="story-footer">
                                        <span class="story-author">Oleh: ${e.name}</span>
                                        <button class="btn-read-more" aria-label="Baca cerita ${e.name} selengkapnya">
                                            Baca Selengkapnya
                                        </button>
                                    </div>
                                </article>
                            `).join("")}
                        </div>
                    `}
                    
                    ${this.hasMore?`
                        <div class="load-more-container">
                            <button id="load-more" class="btn btn-outline">Muat Lebih Banyak</button>
                        </div>
                    `:""}
                </div>
            </section>
        `}async afterRender(){this.loadCSS(),this.setupEventListeners()}loadCSS(){if(!document.querySelector('link[href*="stories.css"]')){const t=document.createElement("link");t.rel="stylesheet",t.href="/styles/stories.css",document.head.appendChild(t)}}setupEventListeners(){this.setupStoryCards(),this.setupFilterToggle(),this.setupLoadMore()}setupFilterToggle(){const t=document.getElementById("toggle-location");t&&t.addEventListener("click",()=>{this.withLocation=!this.withLocation,this.currentPage=1,this.reloadStories()})}setupLoadMore(){const t=document.getElementById("load-more");t&&t.addEventListener("click",()=>this.loadMoreStories())}setupStoryCards(){document.querySelectorAll(".story-card").forEach(a=>{a.addEventListener("click",e=>{if(e.target.classList.contains("btn-read-more")||e.currentTarget===a){e.preventDefault();const s=a.dataset.id;window.location.hash=`/stories/${s}`}}),a.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();const s=a.dataset.id;window.location.hash=`/stories/${s}`}})})}async reloadStories(){try{const t=await r.getStories(1,20,this.withLocation?1:0);this.stories=t.listStory||[],this.hasMore=(t.listStory||[]).length===20,this.currentPage=1;const a=document.getElementById("main-content");a.innerHTML=await this.render(),await this.afterRender()}catch(t){console.error("Error reloading stories:",t)}}async loadMoreStories(){this.currentPage++;try{const t=document.getElementById("load-more"),a=t.textContent;t.textContent="Memuat...",t.disabled=!0;const s=(await r.getStories(this.currentPage,20,this.withLocation?1:0)).listStory||[];this.stories=[...this.stories,...s],this.hasMore=s.length===20;const o=document.querySelector(".stories-grid");s.forEach(n=>{const l=this.createStoryElement(n);o.appendChild(l)}),this.setupStoryCards(),this.hasMore?(t.textContent=a,t.disabled=!1):t.remove()}catch(t){console.error("Error loading more stories:",t);const a=document.getElementById("load-more");a.textContent="Coba Lagi",a.disabled=!1}}createStoryElement(t){const a=document.createElement("article");return a.className="story-card",a.dataset.id=t.id,a.setAttribute("role","listitem"),a.tabIndex=0,a.innerHTML=`
            ${t.photoUrl?`
                <div class="story-image">
                    <img src="${t.photoUrl}" alt="Foto cerita ${t.name}" loading="lazy">
                    ${t.lat&&t.lon?'<span class="location-badge">📍</span>':""}
                </div>
            `:""}
            <div class="story-header">
                <h3 class="story-title">${t.name}</h3>
                <span class="story-date">${i(t.createdAt)}</span>
            </div>
            <p class="story-excerpt">${t.description.substring(0,150)}...</p>
            <div class="story-footer">
                <span class="story-author">Oleh: ${t.name}</span>
                <button class="btn-read-more" aria-label="Baca cerita ${t.name} selengkapnya">
                    Baca Selengkapnya
                </button>
            </div>
        `,a}}export{h as default};

import{s as r,a as i,d as o}from"./index-B5PYlZDb.js";class d{constructor(){this.stories=[],this.filteredStories=[],this.map=null,this.markers=[],this.currentPopup=null}async render(){try{const t=await r.getStories(1,50,!0);this.stories=t.listStory?t.listStory.filter(e=>e.lat&&e.lon):[],this.filteredStories=this.stories}catch(t){console.error("Error loading stories for map:",t),this.stories=[],this.filteredStories=[]}return`
            <section class="story-map-page">
                <div class="container">
                    <div class="page-header">
                        <h1>Peta Cerita</h1>
                        <div class="map-controls">
                            <div class="search-container">
                                <input 
                                    type="text" 
                                    id="story-search" 
                                    placeholder="Cari cerita berdasarkan nama atau deskripsi..." 
                                    aria-label="Cari cerita"
                                    class="search-input"
                                >
                            </div>
                            <div class="map-stats">
                                <span class="stories-count" id="stories-count">
                                    ${this.stories.length} cerita dengan lokasi
                                </span>
                            </div>
                            <div class="map-actions">
                                <a href="#/stories" class="btn btn-secondary">Lihat Daftar</a>
                                <a href="#/create" class="btn btn-primary">Tulis Cerita</a>
                            </div>
                        </div>
                    </div>
                    
                    <div class="map-layout">
                        <aside class="stories-sidebar" aria-label="Daftar cerita di peta">
                            <div class="sidebar-header">
                                <h2 class="sidebar-title">Daftar Cerita</h2>
                                <button class="btn-toggle-sidebar" aria-label="Sembunyikan sidebar">◀</button>
                            </div>
                            <div class="stories-list" role="list" aria-label="Daftar cerita">
                                ${this.getStoriesList()}
                            </div>
                        </aside>
                        
                        <main class="map-container">
                            <div id="story-map" class="story-map" role="application" aria-label="Peta cerita interaktif">
                                <p class="loading-message">Memuat peta...</p>
                            </div>
                            <div class="map-legend">
                                <div class="legend-item">
                                    <span class="legend-marker default"></span>
                                    <span>Cerita</span>
                                </div>
                                <div class="legend-item">
                                    <span class="legend-marker highlighted"></span>
                                    <span>Dipilih</span>
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            </section>
        `}async afterRender(){this.loadCSS(),await this.initializeMap(),this.setupEventListeners(),this.updateStoriesCount()}loadCSS(){if(!document.querySelector('link[href*="story-map.css"]')){const t=document.createElement("link");t.rel="stylesheet",t.href="/styles/story-map.css",document.head.appendChild(t)}}async initializeMap(){var t;try{const e=document.getElementById("story-map");if(this.map=L.map("story-map").setView([-2.5489,118.0149],5),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors",maxZoom:19}).addTo(this.map),this.filteredStories.forEach(s=>{this.addMarker(s)}),this.markers.length>0){const s=new L.featureGroup(this.markers);this.map.fitBounds(s.getBounds().pad(.1))}(t=e.querySelector(".loading-message"))==null||t.remove()}catch(e){console.error("Error initializing map:",e);const s=document.getElementById("story-map");s.innerHTML=`
                <div class="error-message">
                    <h3>Gagal Memuat Peta</h3>
                    <p>Pastikan koneksi internet Anda stabil dan coba refresh halaman.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Coba Lagi</button>
                </div>
            `}}addMarker(t){const e=L.marker([parseFloat(t.lat),parseFloat(t.lon)]).addTo(this.map).bindPopup(this.createPopupContent(t));return e.storyId=t.id,e.on("click",()=>{this.highlightStory(t.id)}),e.on("popupopen",()=>{this.currentPopup=e,this.highlightStory(t.id)}),this.markers.push(e),e}createPopupContent(t){return`
            <div class="map-popup">
                <h3>${t.name}</h3>
                <p class="popup-date">${i(t.createdAt)}</p>
                <p class="popup-excerpt">${t.description.substring(0,100)}...</p>
                <div class="popup-actions">
                    <a href="#/stories/${t.id}" class="btn btn-primary btn-small">Baca Selengkapnya</a>
                </div>
            </div>
        `}setupEventListeners(){const t=document.getElementById("story-search");t&&t.addEventListener("input",o(s=>{this.filterStories(s.target.value)},300));const e=document.querySelector(".btn-toggle-sidebar");e&&e.addEventListener("click",()=>{const s=document.querySelector(".stories-sidebar");s.classList.toggle("collapsed"),e.textContent=s.classList.contains("collapsed")?"▶":"◀"}),this.attachStoryListListeners()}attachStoryListListeners(){document.querySelectorAll(".story-list-item").forEach(e=>{e.addEventListener("click",()=>{const s=e.dataset.storyId;this.highlightStory(s)}),e.addEventListener("keydown",s=>{if(s.key==="Enter"||s.key===" "){s.preventDefault();const a=e.dataset.storyId;this.highlightStory(a)}})})}filterStories(t){const e=t.toLowerCase().trim();e?this.filteredStories=this.stories.filter(a=>a.name.toLowerCase().includes(e)||a.description.toLowerCase().includes(e)):this.filteredStories=this.stories,this.markers.forEach(a=>this.map.removeLayer(a)),this.markers=[],this.filteredStories.forEach(a=>{this.addMarker(a)});const s=document.querySelector(".stories-list");if(s.innerHTML=this.getStoriesList(),this.updateStoriesCount(),this.attachStoryListListeners(),this.filteredStories.length>0){const a=new L.featureGroup(this.markers);this.map.fitBounds(a.getBounds().pad(.1))}}getStoriesList(){return this.filteredStories.length===0?`
                <div class="no-stories-message">
                    <p>📭</p>
                    <p>Tidak ada cerita yang sesuai dengan pencarian.</p>
                </div>
            `:this.filteredStories.map(t=>`
            <article 
                class="story-list-item" 
                data-story-id="${t.id}"
                tabindex="0"
                role="listitem"
                aria-label="Cerita ${t.name}"
            >
                <div class="list-item-content">
                    <h3 class="story-title">${t.name}</h3>
                    <p class="story-date">${i(t.createdAt)}</p>
                    <p class="story-excerpt">${t.description.substring(0,100)}...</p>
                </div>
                <button class="btn-view-on-map" aria-label="Tampilkan lokasi ${t.name} di peta" data-story-id="${t.id}">
                    📍
                </button>
            </article>
        `).join("")}updateStoriesCount(){const t=document.getElementById("stories-count");t&&(t.textContent=`${this.filteredStories.length} cerita ditemukan`)}highlightStory(t){const e=this.markers.find(s=>s.storyId===t);e&&(this.currentPopup&&this.currentPopup.closePopup(),e.openPopup(),this.currentPopup=e,this.map.panTo(e.getLatLng()),document.querySelectorAll(".story-list-item").forEach(a=>{a.classList.remove("active"),a.dataset.storyId===t&&(a.classList.add("active"),a.scrollIntoView({behavior:"smooth",block:"nearest"}))}))}destroy(){this.map&&this.map.remove()}}export{d as default};

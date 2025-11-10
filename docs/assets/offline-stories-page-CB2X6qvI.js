import{s as i}from"./indexedDB-NkIa9ETn.js";class c{constructor(){this.stories=[],this.currentFilter="all",this.currentSort="newest",this.searchQuery=""}async init(){await this.loadStories(),this.setupEventListeners(),this.render()}async loadStories(){try{this.stories=await i.getAllStories(),this.applyFiltersAndSort()}catch(e){console.error("Error loading stories:",e),this.showMessage("Gagal memuat cerita","error")}}applyFiltersAndSort(){let e=[...this.stories];switch(this.searchQuery&&(e=e.filter(t=>{var a,r;return((a=t.name)==null?void 0:a.toLowerCase().includes(this.searchQuery.toLowerCase()))||((r=t.description)==null?void 0:r.toLowerCase().includes(this.searchQuery.toLowerCase()))})),this.currentFilter){case"unsynced":e=e.filter(t=>!t.isSynced);break;case"withLocation":e=e.filter(t=>t.hasLocation);break;case"offline":e=e.filter(t=>t.offlineId);break}switch(this.currentSort){case"newest":e.sort((t,a)=>new Date(a.createdAt)-new Date(t.createdAt));break;case"oldest":e.sort((t,a)=>new Date(t.createdAt)-new Date(a.createdAt));break;case"name":e.sort((t,a)=>(t.name||"").localeCompare(a.name||""));break}return e}setupEventListeners(){document.addEventListener("click",s=>{s.target.matches(".btn-delete-story")&&this.handleDeleteStory(s.target.dataset.id),s.target.matches(".btn-edit-story")&&this.handleEditStory(s.target.dataset.id),s.target.matches(".btn-sync-story")&&this.handleSyncStory(s.target.dataset.id)});const e=document.getElementById("story-search");e&&e.addEventListener("input",s=>{this.searchQuery=s.target.value,this.render()});const t=document.getElementById("story-filter");t&&t.addEventListener("change",s=>{this.currentFilter=s.target.value,this.render()});const a=document.getElementById("story-sort");a&&a.addEventListener("change",s=>{this.currentSort=s.target.value,this.render()});const r=document.getElementById("create-story-form");r&&r.addEventListener("submit",s=>{s.preventDefault(),this.handleCreateStory()});const n=document.getElementById("sync-all-stories");n&&n.addEventListener("click",()=>{this.handleSyncAll()});const o=document.getElementById("export-stories");o&&o.addEventListener("click",()=>{this.handleExportStories()});const d=document.getElementById("import-stories");d&&d.addEventListener("change",s=>{this.handleImportStories(s.target.files[0])})}async handleCreateStory(){const e=document.getElementById("create-story-form"),t=new FormData(e),a={name:t.get("name"),description:t.get("description"),lat:t.get("lat")||null,lon:t.get("lon")||null,photo:t.get("photo")||null};try{if(!a.name||!a.description){this.showMessage("Nama dan deskripsi harus diisi","error");return}const r=await i.createOfflineStory(a);this.showMessage("Cerita berhasil dibuat dan disimpan offline","success"),e.reset(),await this.loadStories(),this.render(),navigator.onLine&&this.attemptSyncStory(r.offlineId)}catch(r){console.error("Error creating story:",r),this.showMessage("Gagal membuat cerita","error")}}async handleDeleteStory(e){if(confirm("Apakah Anda yakin ingin menghapus cerita ini?"))try{await i.deleteStory(e),this.showMessage("Cerita berhasil dihapus","success"),await this.loadStories(),this.render()}catch(t){console.error("Error deleting story:",t),this.showMessage("Gagal menghapus cerita","error")}}async handleEditStory(e){try{const t=await i.getStory(e);this.showEditForm(t)}catch(t){console.error("Error loading story for edit:",t),this.showMessage("Gagal memuat cerita untuk diedit","error")}}async handleSyncStory(e){try{const t=await i.getStory(e);t&&!t.isSynced?await this.attemptSyncStory(t.offlineId||e):this.showMessage("Cerita sudah tersinkronisasi","info")}catch(t){console.error("Error syncing story:",t),this.showMessage("Gagal menyinkronisasi cerita","error")}}async handleSyncAll(){if(!navigator.onLine){this.showMessage("Tidak ada koneksi internet","error");return}try{this.showMessage("Memulai sinkronisasi...","info");const e=await i.processOfflineSync();e.success?this.showMessage(`Berhasil menyinkronisasi ${e.synced} cerita`,"success"):this.showMessage(`Sinkronisasi gagal: ${e.failed} cerita gagal`,"error"),await this.loadStories(),this.render()}catch(e){console.error("Error syncing all stories:",e),this.showMessage("Gagal menyinkronisasi cerita","error")}}async attemptSyncStory(e){try{const t=await i.simulateApiCall({offlineId:e});if(t.success)await i.markStoryAsSynced(e,t.id),this.showMessage("Cerita berhasil disinkronisasi","success"),await this.loadStories(),this.render();else throw new Error("API call failed")}catch(t){console.error("Sync attempt failed:",t)}}async handleExportStories(){try{const e=await i.exportData(),t=new Blob([JSON.stringify(e,null,2)],{type:"application/json"}),a=URL.createObjectURL(t),r=document.createElement("a");r.href=a,r.download=`stories-backup-${new Date().toISOString().split("T")[0]}.json`,document.body.appendChild(r),r.click(),document.body.removeChild(r),URL.revokeObjectURL(a),this.showMessage("Data berhasil diekspor","success")}catch(e){console.error("Error exporting stories:",e),this.showMessage("Gagal mengekspor data","error")}}async handleImportStories(e){if(e)try{const t=await e.text(),a=JSON.parse(t);if(!a.stories)throw new Error("Format file tidak valid");confirm(`Impor ${a.stories.length} cerita? Data lama akan diganti.`)&&(await i.importData(a),this.showMessage("Data berhasil diimpor","success"),await this.loadStories(),this.render())}catch(t){console.error("Error importing stories:",t),this.showMessage("Gagal mengimpor data","error")}}showEditForm(e){const t=document.createElement("div");t.className="modal",t.innerHTML=`
            <div class="modal-content">
                <h3>Edit Cerita</h3>
                <form id="edit-story-form">
                    <input type="hidden" name="id" value="${e.id}">
                    <div class="form-group">
                        <label>Nama:</label>
                        <input type="text" name="name" value="${e.name||""}" required>
                    </div>
                    <div class="form-group">
                        <label>Deskripsi:</label>
                        <textarea name="description" required>${e.description||""}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Latitude:</label>
                        <input type="number" step="any" name="lat" value="${e.lat||""}">
                    </div>
                    <div class="form-group">
                        <label>Longitude:</label>
                        <input type="number" step="any" name="lon" value="${e.lon||""}">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                        <button type="button" class="btn btn-secondary" id="cancel-edit">Batal</button>
                    </div>
                </form>
            </div>
        `,document.body.appendChild(t),t.querySelector("#edit-story-form").addEventListener("submit",async a=>{a.preventDefault(),await this.handleUpdateStory(a.target),t.remove()}),t.querySelector("#cancel-edit").addEventListener("click",()=>{t.remove()})}async handleUpdateStory(e){const t=new FormData(e),a=t.get("id"),r={name:t.get("name"),description:t.get("description"),lat:t.get("lat")||null,lon:t.get("lon")||null,lastUpdated:new Date().toISOString(),hasLocation:!!(t.get("lat")&&t.get("lon"))};try{const o={...await i.getStory(a),...r};await i.addStory(o),this.showMessage("Cerita berhasil diperbarui","success"),await this.loadStories(),this.render()}catch(n){console.error("Error updating story:",n),this.showMessage("Gagal memperbarui cerita","error")}}render(){const e=document.getElementById("story-manager");if(!e)return;const t=this.applyFiltersAndSort(),a=this.calculateStats();e.innerHTML=`
            <div class="story-manager-container">
                <div class="manager-header">
                    <h2>📖 Manajemen Cerita Offline</h2>
                    <div class="stats-overview">
                        <div class="stat-card">
                            <span class="stat-number">${a.total}</span>
                            <span class="stat-label">Total Cerita</span>
                        </div>
                        <div class="stat-card ${a.unsynced>0?"warning":""}">
                            <span class="stat-number">${a.unsynced}</span>
                            <span class="stat-label">Belum Sync</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${a.withLocation}</span>
                            <span class="stat-label">Dengan Lokasi</span>
                        </div>
                    </div>
                </div>

                <div class="controls-section">
                    <div class="search-filter-row">
                        <div class="search-box">
                            <input type="text" id="story-search" placeholder="Cari cerita..." 
                                   value="${this.searchQuery}">
                        </div>
                        <div class="filter-controls">
                            <select id="story-filter">
                                <option value="all" ${this.currentFilter==="all"?"selected":""}>Semua Cerita</option>
                                <option value="unsynced" ${this.currentFilter==="unsynced"?"selected":""}>Belum Sync</option>
                                <option value="withLocation" ${this.currentFilter==="withLocation"?"selected":""}>Dengan Lokasi</option>
                                <option value="offline" ${this.currentFilter==="offline"?"selected":""}>Dibuat Offline</option>
                            </select>
                            
                            <select id="story-sort">
                                <option value="newest" ${this.currentSort==="newest"?"selected":""}>Terbaru</option>
                                <option value="oldest" ${this.currentSort==="oldest"?"selected":""}>Terlama</option>
                                <option value="name" ${this.currentSort==="name"?"selected":""}>Nama A-Z</option>
                            </select>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button class="btn btn-primary" id="sync-all-stories" 
                                ${navigator.onLine?"":"disabled"}>
                            🔄 Sync Semua
                        </button>
                        <button class="btn btn-secondary" id="export-stories">
                            📤 Export Data
                        </button>
                        <label class="btn btn-secondary">
                            📥 Import Data
                            <input type="file" id="import-stories" accept=".json" style="display: none;">
                        </label>
                    </div>
                </div>

                <!-- Create Story Form -->
                <div class="create-story-section">
                    <h3>➕ Buat Cerita Baru</h3>
                    <form id="create-story-form" class="story-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Nama Cerita *</label>
                                <input type="text" name="name" required placeholder="Masukkan nama cerita">
                            </div>
                            <div class="form-group">
                                <label>Lokasi (Opsional)</label>
                                <div class="location-fields">
                                    <input type="number" step="any" name="lat" placeholder="Latitude">
                                    <input type="number" step="any" name="lon" placeholder="Longitude">
                                </div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Deskripsi Cerita *</label>
                            <textarea name="description" required placeholder="Tulis deskripsi cerita Anda..." rows="3"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">💾 Simpan Cerita (Offline)</button>
                    </form>
                </div>

                <!-- Stories List -->
                <div class="stories-list-section">
                    <h3>📚 Daftar Cerita (${t.length})</h3>
                    
                    ${t.length===0?`
                        <div class="empty-state">
                            <p>${this.searchQuery?"Tidak ada cerita yang sesuai dengan pencarian":"Belum ada cerita"}</p>
                            ${this.searchQuery?"":"<p>Mulailah dengan membuat cerita pertama Anda!</p>"}
                        </div>
                    `:`
                        <div class="stories-grid">
                            ${t.map(r=>this.renderStoryCard(r)).join("")}
                        </div>
                    `}
                </div>
            </div>
        `}renderStoryCard(e){const t=e.isSynced?'<span class="status-badge synced">✅ Tersinkronisasi</span>':'<span class="status-badge unsynced">⏳ Menunggu Sync</span>',a=e.hasLocation?'<div class="location-info">📍 Memiliki lokasi</div>':'<div class="location-info">🌐 Tanpa lokasi</div>',r=e.offlineId?'<span class="badge offline">📱 Dibuat Offline</span>':"";return`
            <div class="story-card ${e.isSynced?"":"unsynced"}">
                <div class="story-header">
                    <h4>${e.name||"Tanpa Judul"}</h4>
                    ${r}
                </div>
                
                <div class="story-content">
                    <p class="story-description">${e.description||"Tidak ada deskripsi"}</p>
                    
                    <div class="story-meta">
                        <div class="meta-item">
                            <strong>Dibuat:</strong> 
                            ${new Date(e.createdAt).toLocaleDateString("id-ID")}
                        </div>
                        ${a}
                        ${t}
                    </div>
                </div>
                
                <div class="story-actions">
                    ${e.isSynced?"":`
                        <button class="btn btn-sm btn-primary btn-sync-story" data-id="${e.id}">
                            🔄 Sync
                        </button>
                    `}
                    
                    <button class="btn btn-sm btn-secondary btn-edit-story" data-id="${e.id}">
                        ✏️ Edit
                    </button>
                    
                    <button class="btn btn-sm btn-danger btn-delete-story" data-id="${e.id}">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        `}calculateStats(){return{total:this.stories.length,unsynced:this.stories.filter(e=>!e.isSynced).length,withLocation:this.stories.filter(e=>e.hasLocation).length,offline:this.stories.filter(e=>e.offlineId).length}}showMessage(e,t="info"){document.querySelectorAll(".message-toast").forEach(n=>n.remove());const r=document.createElement("div");r.className=`message-toast message-${t}`,r.innerHTML=`
            <span>${e}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `,document.body.appendChild(r),setTimeout(()=>{r.parentElement&&r.remove()},5e3)}}class p{constructor(){this.storyManager=new c}async render(){return`
            <section class="offline-stories-page">
                <div class="container">
                    <header class="page-header">
                        <h1>📱 Cerita Offline</h1>
                        <p>Kelola cerita yang disimpan secara offline. Cerita akan otomatis tersinkronisasi ketika koneksi tersedia.</p>
                    </header>
                    
                    <div id="story-manager"></div>
                </div>
            </section>
        `}async afterRender(){this.loadCSS(),await this.storyManager.init(),this.setupOnlineOfflineListeners()}setupOnlineOfflineListeners(){window.addEventListener("online",()=>{this.storyManager.showMessage("Koneksi internet tersedia. Sync otomatis akan dijalankan.","success"),this.storyManager.render()}),window.addEventListener("offline",()=>{this.storyManager.showMessage("Anda sedang offline. Cerita akan disimpan secara lokal.","warning"),this.storyManager.render()})}loadCSS(){if(!document.getElementById("offline-stories-styles")){const e=document.createElement("style");e.id="offline-stories-styles",e.textContent=`
                .offline-stories-page {
                    padding: 2rem 0;
                }
                
                .story-manager-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                .manager-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                }
                
                .manager-header h2 {
                    margin: 0 0 1rem 0;
                    font-size: 2rem;
                }
                
                .stats-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
                
                .stat-card {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: center;
                    backdrop-filter: blur(10px);
                }
                
                .stat-card.warning {
                    background: rgba(255, 193, 7, 0.3);
                }
                
                .stat-number {
                    display: block;
                    font-size: 2rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }
                
                .stat-label {
                    font-size: 0.9rem;
                    opacity: 0.9;
                }
                
                .controls-section {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 2rem;
                }
                
                .search-filter-row {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    flex-wrap: wrap;
                }
                
                .search-box {
                    flex: 1;
                    min-width: 250px;
                }
                
                .search-box input {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                }
                
                .filter-controls {
                    display: flex;
                    gap: 1rem;
                }
                
                .filter-controls select {
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    background: white;
                }
                
                .action-buttons {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                
                .create-story-section {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    margin-bottom: 2rem;
                }
                
                .story-form {
                    margin-top: 1rem;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }
                
                .form-group {
                    margin-bottom: 1rem;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #333;
                }
                
                .form-group input,
                .form-group textarea {
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 1rem;
                    box-sizing: border-box;
                }
                
                .location-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.5rem;
                }
                
                .stories-list-section {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                
                .stories-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                    margin-top: 1rem;
                }
                
                .story-card {
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 1.5rem;
                    transition: all 0.3s ease;
                }
                
                .story-card.unsynced {
                    border-left: 4px solid #ff9800;
                    background: #fff3e0;
                }
                
                .story-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
                
                .story-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 1rem;
                }
                
                .story-header h4 {
                    margin: 0;
                    color: #333;
                    flex: 1;
                }
                
                .badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 500;
                }
                
                .badge.offline {
                    background: #e3f2fd;
                    color: #1976d2;
                }
                
                .story-description {
                    color: #666;
                    line-height: 1.5;
                    margin-bottom: 1rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .story-meta {
                    margin-bottom: 1rem;
                }
                
                .meta-item {
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: #666;
                }
                
                .location-info {
                    color: #4caf50;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                }
                
                .status-badge {
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }
                
                .status-badge.synced {
                    background: #e8f5e8;
                    color: #4caf50;
                }
                
                .status-badge.unsynced {
                    background: #fff3e0;
                    color: #ff9800;
                }
                
                .story-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                
                .btn {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    transition: all 0.3s ease;
                }
                
                .btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .btn-sm {
                    padding: 0.375rem 0.75rem;
                    font-size: 0.8rem;
                }
                
                .btn-primary {
                    background: #007bff;
                    color: white;
                }
                
                .btn-primary:hover:not(:disabled) {
                    background: #0056b3;
                }
                
                .btn-secondary {
                    background: #6c757d;
                    color: white;
                }
                
                .btn-secondary:hover:not(:disabled) {
                    background: #545b62;
                }
                
                .btn-danger {
                    background: #dc3545;
                    color: white;
                }
                
                .btn-danger:hover:not(:disabled) {
                    background: #c82333;
                }
                
                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: #666;
                }
                
                .empty-state p {
                    margin: 0.5rem 0;
                }
                
                /* Modal Styles */
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                }
                
                .modal-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                }
                
                .modal-content h3 {
                    margin-top: 0;
                }
                
                .form-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: flex-end;
                    margin-top: 1.5rem;
                }
                
                /* Message Toast */
                .message-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    z-index: 1001;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    max-width: 400px;
                    animation: slideIn 0.3s ease;
                }
                
                .message-success { background: #4caf50; }
                .message-error { background: #f44336; }
                .message-info { background: #2196f3; }
                .message-warning { background: #ff9800; }
                
                .message-toast button {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.25rem;
                    cursor: pointer;
                    padding: 0;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                /* Responsive Design */
                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .search-filter-row {
                        flex-direction: column;
                    }
                    
                    .filter-controls {
                        flex-direction: column;
                    }
                    
                    .stories-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .action-buttons {
                        flex-direction: column;
                    }
                    
                    .story-actions {
                        flex-direction: column;
                    }
                }
            `,document.head.appendChild(e)}}}export{p as default};

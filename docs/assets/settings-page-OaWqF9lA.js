import{p as s}from"./notification-BdzrFDys.js";import{O as g,I as u}from"./index-B5PYlZDb.js";import{s as r}from"./indexedDB-NkIa9ETn.js";class b{async render(){const t=await s.getSubscriptionState();return await g.getStorageStats(),`
            <section class="settings-page">
                <div class="container">
                    <header class="page-header">
                        <h1>Pengaturan Aplikasi</h1>
                        <p>Kelola preferensi dan fitur aplikasi</p>
                    </header>

                    <div class="settings-sections">
                        <!-- Notifications Section -->
                        <div class="settings-section">
                            <h2>🔔 Push Notifications</h2>
                            
                            <div class="settings-item">
                                <div class="setting-info">
                                    <h3>Status Notifikasi</h3>
                                    <p>Dapatkan pemberitahuan ketika ada cerita baru</p>
                                </div>
                                <label class="toggle-switch">
                                    <input type="checkbox" id="notification-toggle" 
                                           ${t.isSubscribed?"checked":""}
                                           ${!t.supported||t.permission==="denied"?"disabled":""}>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="notification-status">
                                <p>Status: <span id="notification-status" class="status ${t.isSubscribed?"active":"inactive"}">
                                    ${this.getStatusText(t)}
                                </span></p>
                                <p class="help-text" id="notification-help">
                                    ${this.getHelpText(t)}
                                </p>
                            </div>

                            <div class="setting-actions">
                                <button class="btn btn-secondary" id="test-basic-notification"
                                        ${t.supported?"":"disabled"}>
                                    Test Notifikasi Basic
                                </button>
                                <button class="btn btn-secondary" id="test-advanced-notification"
                                        ${t.supported?"":"disabled"}>
                                    Test Notifikasi Advanced
                                </button>
                                <button class="btn btn-primary" id="simulate-new-story"
                                        ${t.supported?"":"disabled"}>
                                    Simulasikan Cerita Baru
                                </button>
                            </div>

                            ${t.supported?"":`
                                <div class="browser-support-warning">
                                    <p>⚠️ Browser Anda tidak mendukung push notifications</p>
                                </div>
                            `}

                            ${t.permission==="denied"?`
                                <div class="permission-warning">
                                    <p>❌ Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.</p>
                                </div>
                            `:""}
                        </div>

                        <!-- Install Section -->
                        <div class="settings-section">
                            <h2>📲 Install Aplikasi</h2>
                            
                            <div class="settings-item">
                                <div class="setting-info">
                                    <h3>Install ke Perangkat</h3>
                                    <p>Dapatkan pengalaman seperti aplikasi native</p>
                                </div>
                                <button class="btn btn-primary" id="settings-install-btn">
                                    Install App
                                </button>
                            </div>

                            <div class="app-info">
                                <div class="info-item">
                                    <strong>Status PWA:</strong> 
                                    <span class="status active">🟢 Siap</span>
                                </div>
                                <div class="info-item">
                                    <strong>Versi:</strong> 2.0.0
                                </div>
                            </div>
                        </div>

                        <!-- Testing Section -->
                        <div class="settings-section">
                            <h2>🧪 Testing & Debug</h2>
                            
                            <div class="setting-actions">
                                <button class="btn btn-secondary" id="debug-push">
                                    Debug Push Notification
                                </button>
                                <button class="btn btn-secondary" id="clear-push-data">
                                    Clear Push Data
                                </button>
                            </div>
                            
                            <div id="debug-output" class="debug-output"></div>
                        </div>
                    </div>
                </div>
            </section>
        `}getStatusText(t){return t.supported?t.permission==="denied"?"❌ Izin ditolak":t.isSubscribed?"🔔 Aktif":"🔕 Nonaktif":"❌ Tidak didukung"}getHelpText(t){return t.supported?t.permission==="denied"?"Izin notifikasi ditolak. Aktifkan di pengaturan browser.":t.isSubscribed?"Anda akan mendapat notifikasi ketika ada cerita baru.":"Aktifkan untuk mendapat notifikasi cerita baru.":"Browser Anda tidak mendukung push notifications."}async afterRender(){this.loadCSS(),this.setupNotificationHandlers(),this.setupInstallButton(),this.setupTestButtons()}setupNotificationHandlers(){const t=document.getElementById("notification-toggle"),e=document.getElementById("test-basic-notification"),i=document.getElementById("test-advanced-notification"),a=document.getElementById("simulate-new-story"),o=document.getElementById("debug-push"),c=document.getElementById("clear-push-data");t&&t.addEventListener("change",async()=>{try{await s.toggleSubscription(),this.showMessage("Pengaturan notifikasi diperbarui","success")}catch(n){console.error("Toggle error:",n),this.showMessage(n.message,"error"),t.checked=!t.checked}}),e&&e.addEventListener("click",async()=>{try{await s.testBasicNotification(),this.showMessage("Notifikasi basic berhasil dikirim","success")}catch(n){this.showMessage(`Gagal: ${n.message}`,"error")}}),i&&i.addEventListener("click",async()=>{try{await s.testAdvancedNotification(),this.showMessage("Notifikasi advanced berhasil dikirim","success")}catch(n){this.showMessage(`Gagal: ${n.message}`,"error")}}),a&&a.addEventListener("click",async()=>{try{await s.simulateNewStory(),this.showMessage("Notifikasi cerita baru disimulasikan","success")}catch(n){this.showMessage(`Gagal: ${n.message}`,"error")}}),o&&o.addEventListener("click",async()=>{const n=await s.debugStatus(),d=document.getElementById("debug-output");d&&(d.innerHTML=`
                        <h4>Debug Information:</h4>
                        <pre>${JSON.stringify(n,null,2)}</pre>
                    `)}),c&&c.addEventListener("click",async()=>{localStorage.removeItem("pushSubscription"),await s.checkSubscription(),this.showMessage("Data push dibersihkan","info")}),window.addEventListener("pushSubscriptionChange",()=>{this.updateNotificationUI()})}async updateNotificationUI(){const t=await s.getSubscriptionState(),e=document.getElementById("notification-toggle"),i=document.getElementById("notification-status"),a=document.getElementById("notification-help");e&&(e.checked=t.isSubscribed,e.disabled=!t.supported||t.permission==="denied"),i&&(i.textContent=this.getStatusText(t),i.className=`status ${t.isSubscribed?"active":"inactive"}`),a&&(a.textContent=this.getHelpText(t))}setupInstallButton(){const t=document.getElementById("settings-install-btn");t&&t.addEventListener("click",()=>{u.triggerInstallPrompt()})}setupTestButtons(){}loadCSS(){if(!document.getElementById("settings-styles")){const t=document.createElement("style");t.id="settings-styles",t.textContent=`
                .settings-page {
                    padding: 2rem 0;
                }
                .settings-sections {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .settings-section {
                    background: white;
                    border-radius: 8px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                .settings-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .setting-info {
                    flex: 1;
                }
                .setting-info h3 {
                    margin: 0 0 0.5rem 0;
                }
                .setting-info p {
                    margin: 0;
                    color: #666;
                }
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                }
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 34px;
                }
                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .toggle-slider {
                    background-color: #2196F3;
                }
                input:disabled + .toggle-slider {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }
                .setting-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                    margin-top: 1rem;
                }
                .notification-status {
                    margin: 1rem 0;
                }
                .status {
                    font-weight: 500;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                }
                .status.active {
                    color: #059669;
                }
                .status.inactive {
                    color: #dc2626;
                }
                .help-text {
                    color: #666;
                    font-size: 0.9rem;
                }
                .browser-support-warning,
                .permission-warning {
                    margin-top: 1rem;
                    padding: 0.75rem;
                    border-radius: 4px;
                    background-color: #fff3cd;
                    color: #856404;
                }
                .app-info {
                    margin-top: 1rem;
                    display: flex;
                    gap: 2rem;
                }
                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .debug-output {
                    margin-top: 1rem;
                    background: #f3f4f6;
                    padding: 1rem;
                    border-radius: 4px;
                    font-family: monospace;
                }
            `,document.head.appendChild(t)}}showMessage(t,e="info"){console.log(`${e.toUpperCase()}: ${t}`)}async syncOfflineData(){try{await r.syncAll(),this.showMessage("Data berhasil disinkronkan","success"),await this.updateDatabaseInfo()}catch(t){console.error("Sync error:",t),this.showMessage("Gagal melakukan sinkronisasi","error")}}async clearStorage(){if(confirm("Yakin ingin menghapus semua data offline?"))try{await r.clear(),this.showMessage("Data offline berhasil dihapus","success"),await this.updateDatabaseInfo()}catch(t){console.error("Clear storage error:",t),this.showMessage("Gagal menghapus data offline","error")}}async logout(){if(confirm("Yakin ingin keluar?"))try{await s.unsubscribe(),await this.clearStorage(),localStorage.removeItem("token"),localStorage.removeItem("user"),window.location.hash="#/",window.location.reload()}catch(t){console.error("Logout error:",t),this.showMessage("Gagal melakukan logout","error")}}async testNotification(t){try{switch(t){case"basic":await s.testBasicNotification(),this.showMessage("Test notifikasi basic berhasil","success");break;case"skilled":await s.testSkilledNotification(),this.showMessage("Test notifikasi skilled berhasil","success");break;case"advanced":await s.testAdvancedNotification(),this.showMessage("Test notifikasi advanced berhasil","success");break;case"simulate":await s.simulateNewStory(),this.showMessage("Simulasi notifikasi cerita baru berhasil","success");break}}catch(e){console.error("Test notification error:",e),this.showMessage(`Gagal mengirim notifikasi test: ${e.message}`,"error")}}async render(){const t=!!localStorage.getItem("token"),e=JSON.parse(localStorage.getItem("user")||"{}");return`
            <section class="settings-page">
                <div class="container">
                    <h1>⚙️ Pengaturan</h1>
                    
                    ${t?`
                        <div class="settings-section">
                            <h2>👤 Informasi Akun</h2>
                            <div class="user-info">
                                <p><strong>Nama:</strong> ${e.name||"Tidak tersedia"}</p>
                                <p><strong>User ID:</strong> ${e.userId||"Tidak tersedia"}</p>
                            </div>
                        </div>
                        
                        <!-- Push Notification Settings - Level Advanced -->
                        <div class="settings-section">
                            <h2>🔔 Push Notifications</h2>
                            <div class="setting-item">
                                <label class="toggle-label">
                                    <input type="checkbox" id="pushToggle">
                                    <span class="toggle-slider"></span>
                                    Aktifkan Push Notifications
                                </label>
                                <p class="setting-description">
                                    Dapatkan notifikasi ketika ada cerita baru atau update penting
                                </p>
                                <div id="pushStatus" class="status-message">
                                    Memuat status notifikasi...
                                </div>
                            </div>
                            
                            <div class="notification-test-buttons">
                                <h3>Test Notifications:</h3>
                                <div class="test-buttons">
                                    <button id="testBasic" class="btn-test btn-test-basic">Test Basic</button>
                                    <button id="testSkilled" class="btn-test btn-test-skilled">Test Skilled</button>
                                    <button id="testAdvanced" class="btn-test btn-test-advanced">Test Advanced</button>
                                    <button id="testSimulate" class="btn-test btn-test-simulate">Simulate Story</button>
                                </div>
                                <p class="test-description">
                                    <strong>Level:</strong> 
                                    <span class="level-basic">Basic</span> - 
                                    <span class="level-skilled">Skilled</span> - 
                                    <span class="level-advanced">Advanced</span>
                                </p>
                            </div>
                        </div>
                        
                        <!-- IndexedDB Settings -->
                        <div class="settings-section">
                            <h2>💾 Penyimpanan Offline</h2>
                            <div class="setting-item">
                                <div class="storage-info">
                                    <h4>Status Penyimpanan:</h4>
                                    <div id="dbInfo" class="db-info">
                                        Memuat informasi database...
                                    </div>
                                </div>
                                
                                <div class="storage-actions">
                                    <button id="syncNow" class="btn btn-primary">
                                        🔄 Sinkronisasi Sekarang
                                    </button>
                                    <button id="clearStorage" class="btn btn-danger">
                                        🗑️ Bersihkan Data Offline
                                    </button>
                                </div>
                                
                                <div class="offline-features">
                                    <h4>Fitur Offline:</h4>
                                    <ul>
                                        <li>✅ Simpan cerita offline</li>
                                        <li>✅ Baca cerita tanpa internet</li>
                                        <li>✅ Sync otomatis saat online</li>
                                        <li>✅ Filter & pencarian offline</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <button id="logout-btn" class="btn btn-danger">🚪 Logout</button>
                        </div>
                    `:`
                        <div class="auth-required">
                            <h2>🔐 Login Diperlukan</h2>
                            <p>Silakan login untuk mengakses pengaturan</p>
                            <div class="auth-actions">
                                <a href="#/login" class="btn btn-primary">Login</a>
                                <a href="#/register" class="btn btn-secondary">Daftar</a>
                            </div>
                        </div>
                    `}
                </div>
            </section>
        `}async afterRender(){this.loadCSS(),await this.setupPushNotification(),await this.setupIndexedDB(),this.setupEventListeners()}async setupPushNotification(){try{await s.init(),await this.updatePushStatus()}catch(t){console.error("Error setting up push notification:",t)}}async updatePushStatus(){try{const t=await s.getSubscriptionState();this.updatePushToggle(t.isSubscribed);const e=document.getElementById("pushStatus");e&&(t.supported?t.permission==="denied"?e.innerHTML='<span class="error">❌ Izin notifikasi ditolak. Silakan ubah di pengaturan browser.</span>':t.isSubscribed?e.innerHTML='<span class="success">✅ Notifikasi diaktifkan</span>':e.innerHTML='<span class="info">🔕 Notifikasi dimatikan</span>':e.innerHTML='<span class="error">❌ Browser tidak mendukung push notification</span>')}catch(t){console.error("Error updating push status:",t)}}updatePushToggle(t){const e=document.getElementById("pushToggle");e&&(e.checked=t)}async setupIndexedDB(){try{await this.updateDatabaseInfo()}catch(t){console.error("Error setting up IndexedDB:",t)}}async updateDatabaseInfo(){try{const t=await r.getDatabaseSize(),e=await r.getUnsyncedStories(),i=document.getElementById("dbInfo");i&&(i.innerHTML=`
                    <div class="db-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Item:</span>
                            <span class="stat-value">${t.totalItems}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Cerita:</span>
                            <span class="stat-value">${t.stories||0}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Menunggu Sync:</span>
                            <span class="stat-value warning">${e.length}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Status:</span>
                            <span class="stat-value ${navigator.onLine?"success":"error"}">
                                ${navigator.onLine?"Online":"Offline"}
                            </span>
                        </div>
                    </div>
                `)}catch(t){console.error("Error updating database info:",t)}}setupEventListeners(){const t=document.getElementById("pushToggle");t&&t.addEventListener("change",async()=>{await this.togglePushNotification()});const e=document.getElementById("testBasic"),i=document.getElementById("testSkilled"),a=document.getElementById("testAdvanced"),o=document.getElementById("testSimulate");e&&e.addEventListener("click",()=>this.testNotification("basic")),i&&i.addEventListener("click",()=>this.testNotification("skilled")),a&&a.addEventListener("click",()=>this.testNotification("advanced")),o&&o.addEventListener("click",()=>this.testNotification("simulate"));const c=document.getElementById("syncNow"),n=document.getElementById("clearStorage"),d=document.getElementById("logout-btn");c&&c.addEventListener("click",()=>this.syncOfflineData()),n&&n.addEventListener("click",()=>this.clearStorage()),d&&d.addEventListener("click",()=>this.logout()),window.addEventListener("online",()=>this.updateDatabaseInfo()),window.addEventListener("offline",()=>this.updateDatabaseInfo()),window.addEventListener("pushSubscriptionChange",l=>{this.updatePushToggle(l.detail.isSubscribed),this.updatePushStatus()})}async togglePushNotification(){const t=document.getElementById("pushToggle");if(t)try{await s.toggleSubscription(),this.showMessage(s.isSubscribed?"Push notification diaktifkan":"Push notification dimatikan","success")}catch(e){console.error("Toggle error:",e),t.checked=!t.checked,this.showMessage("Gagal mengubah pengaturan notifikasi","error")}}async testNotification(t){try{switch(t){case"basic":await s.testBasicNotification(),this.showMessage("Notifikasi basic dikirim","success");break;case"skilled":await s.testSkilledNotification(),this.showMessage("Notifikasi skilled dikirim","success");break;case"advanced":await s.testAdvancedNotification(),this.showMessage("Notifikasi advanced dikirim","success");break;case"simulate":await s.simulateNewStory(),this.showMessage("Notifikasi cerita simulasi dikirim","success");break}}catch(e){console.error("Test notification error:",e),this.showMessage("Gagal mengirim notifikasi test","error")}}async syncOfflineData(){if(!navigator.onLine){this.showMessage("Tidak ada koneksi internet","error");return}try{const t=document.getElementById("syncNow");t&&(t.disabled=!0,t.textContent="Menyinkronisasi..."),this.showMessage("Memulai sinkronisasi data offline...","info"),setTimeout(async()=>{try{const e=await r.getUnsyncedStories();let i=0;for(const a of e)await r.markStoryAsSynced(a.id,`server-${Date.now()}`),i++;i>0?this.showMessage(`Berhasil sync ${i} cerita`,"success"):this.showMessage("Tidak ada data yang perlu disinkronisasi","info")}catch{this.showMessage("Gagal menyinkronisasi data","error")}finally{await this.updateDatabaseInfo();const e=document.getElementById("syncNow");e&&(e.disabled=!1,e.textContent="🔄 Sinkronisasi Sekarang")}},2e3)}catch{this.showMessage("Gagal memulai sinkronisasi","error")}}async clearStorage(){if(confirm("Apakah Anda yakin ingin menghapus semua data offline? Tindakan ini tidak dapat dibatalkan."))try{await r.clearDatabase(),this.showMessage("Data offline berhasil dihapus","success"),await this.updateDatabaseInfo()}catch{this.showMessage("Gagal menghapus data offline","error")}}logout(){localStorage.removeItem("token"),localStorage.removeItem("user"),this.showMessage("Logout berhasil","success"),setTimeout(()=>{window.location.hash="/home"},1e3)}showMessage(t,e){document.querySelectorAll(".message-toast").forEach(o=>o.remove());const a=document.createElement("div");a.className=`message-toast message-${e}`,a.innerHTML=`
            <span>${t}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `,document.body.appendChild(a),setTimeout(()=>{a.parentElement&&a.remove()},5e3)}loadCSS(){if(!document.querySelector("#settings-styles")){const t=document.createElement("style");t.id="settings-styles",t.textContent=`
                .settings-page {
                    padding: 2rem 0;
                    max-width: 800px;
                    margin: 0 auto;
                }
                
                .settings-section {
                    background: white;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    border-left: 4px solid #007bff;
                }
                
                .settings-section h2 {
                    margin-bottom: 1rem;
                    color: #333;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .setting-item {
                    margin-bottom: 1.5rem;
                }
                
                .toggle-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    cursor: pointer;
                    font-weight: 500;
                    margin-bottom: 0.5rem;
                }
                
                .toggle-slider {
                    width: 50px;
                    height: 24px;
                    background: #ccc;
                    border-radius: 24px;
                    position: relative;
                    transition: background 0.3s;
                }
                
                .toggle-slider:before {
                    content: '';
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: white;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.3s;
                }
                
                .toggle-label input:checked + .toggle-slider {
                    background: #4CAF50;
                }
                
                .toggle-label input:checked + .toggle-slider:before {
                    transform: translateX(26px);
                }
                
                .toggle-label input {
                    display: none;
                }
                
                .setting-description {
                    font-size: 0.875rem;
                    color: #666;
                    margin: 0.25rem 0 0 3rem;
                }
                
                .status-message {
                    margin: 0.5rem 0 0 3rem;
                    font-size: 0.875rem;
                }
                
                .status-message .success { color: #4CAF50; }
                .status-message .error { color: #f44336; }
                .status-message .info { color: #2196F3; }
                
                .notification-test-buttons {
                    margin-top: 1.5rem;
                    padding-top: 1.5rem;
                    border-top: 1px solid #eee;
                }
                
                .test-buttons {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    margin: 1rem 0;
                }
                
                .btn-test {
                    padding: 0.5rem 1rem;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: all 0.3s;
                }
                
                .btn-test-basic { background: #e3f2fd; color: #1976d2; }
                .btn-test-skilled { background: #fff3e0; color: #f57c00; }
                .btn-test-advanced { background: #e8f5e8; color: #388e3c; }
                .btn-test-simulate { background: #f3e5f5; color: #7b1fa2; }
                
                .btn-test:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                }
                
                .test-description {
                    font-size: 0.875rem;
                    color: #666;
                }
                
                .level-basic { color: #1976d2; font-weight: 500; }
                .level-skilled { color: #f57c00; font-weight: 500; }
                .level-advanced { color: #388e3c; font-weight: 500; }
                
                .storage-info {
                    margin-bottom: 1rem;
                }
                
                .db-info {
                    margin: 1rem 0;
                }
                
                .db-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin: 1rem 0;
                }
                
                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.75rem;
                    background: #f8f9fa;
                    border-radius: 6px;
                }
                
                .stat-label {
                    font-weight: 500;
                }
                
                .stat-value {
                    font-weight: bold;
                }
                
                .stat-value.warning { color: #ff9800; }
                .stat-value.success { color: #4CAF50; }
                .stat-value.error { color: #f44336; }
                
                .storage-actions {
                    display: flex;
                    gap: 1rem;
                    margin: 1rem 0;
                }
                
                .offline-features ul {
                    list-style: none;
                    padding: 0;
                    margin: 1rem 0;
                }
                
                .offline-features li {
                    padding: 0.25rem 0;
                    color: #666;
                }
                
                .auth-required {
                    text-align: center;
                    padding: 3rem 1rem;
                }
                
                .auth-actions {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    margin-top: 1.5rem;
                }
                
                .message-toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    max-width: 400px;
                    animation: slideIn 0.3s ease;
                }
                
                .message-success { background: #4CAF50; }
                .message-error { background: #f44336; }
                .message-info { background: #2196F3; }
                
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
                
                @media (max-width: 768px) {
                    .settings-page {
                        padding: 1rem;
                    }
                    
                    .test-buttons {
                        flex-direction: column;
                    }
                    
                    .storage-actions {
                        flex-direction: column;
                    }
                    
                    .db-stats {
                        grid-template-columns: 1fr;
                    }
                }
            `,document.head.appendChild(t)}}}export{b as default};

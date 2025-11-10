const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/create-story-page-mrMAkSs8.js","assets/notification-BdzrFDys.js","assets/settings-page-OaWqF9lA.js","assets/indexedDB-NkIa9ETn.js","assets/offline-stories-page-CB2X6qvI.js"])))=>i.map(i=>d[i]);
var L=Object.defineProperty;var x=(a,t,e)=>t in a?L(a,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):a[t]=e;var g=(a,t,e)=>x(a,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function e(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(n){if(n.ep)return;n.ep=!0;const r=e(n);fetch(n.href,r)}})();const _="modulepreload",k=function(a){return"/"+a},v={},d=function(t,e,o){let n=Promise.resolve();if(e&&e.length>0){document.getElementsByTagName("link");const s=document.querySelector("meta[property=csp-nonce]"),i=(s==null?void 0:s.nonce)||(s==null?void 0:s.getAttribute("nonce"));n=Promise.allSettled(e.map(l=>{if(l=k(l),l in v)return;v[l]=!0;const c=l.endsWith(".css"),p=c?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${l}"]${p}`))return;const u=document.createElement("link");if(u.rel=c?"stylesheet":_,c||(u.as="script"),u.crossOrigin="",u.href=l,i&&u.setAttribute("nonce",i),document.head.appendChild(u),c)return new Promise((f,y)=>{u.addEventListener("load",f),u.addEventListener("error",()=>y(new Error(`Unable to preload CSS for ${l}`)))})}))}function r(s){const i=new Event("vite:preloadError",{cancelable:!0});if(i.payload=s,window.dispatchEvent(i),!i.defaultPrevented)throw s}return n.then(s=>{for(const i of s||[])i.status==="rejected"&&r(i.reason);return t().catch(r)})},E={"/":()=>d(()=>import("./home-page-FyXfhFAG.js"),[]),"/home":()=>d(()=>import("./home-page-FyXfhFAG.js"),[]),"/stories":()=>d(()=>import("./stories-page-CdAhlP_D.js"),[]),"/stories/:id":()=>d(()=>import("./story-detail-page-C_EOulCf.js"),[]),"/story/:id":()=>d(()=>import("./story-detail-page-C_EOulCf.js"),[]),"/story-map":()=>d(()=>import("./story-map-page-DBwugw8L.js"),[]),"/map":()=>d(()=>import("./story-map-page-DBwugw8L.js"),[]),"/create-story":()=>d(()=>import("./create-story-page-mrMAkSs8.js"),__vite__mapDeps([0,1])),"/create":()=>d(()=>import("./create-story-page-mrMAkSs8.js"),__vite__mapDeps([0,1])),"/settings":()=>d(()=>import("./settings-page-OaWqF9lA.js"),__vite__mapDeps([2,1,3])),"/about":()=>d(()=>import("./about-page-BhuYumWj.js"),[]),"/auth/login":()=>d(()=>import("./login-page-C2--ubGO.js"),[]),"/login":()=>d(()=>import("./login-page-C2--ubGO.js"),[]),"/auth/register":()=>d(()=>import("./register-page-Bi-PZrxG.js"),[]),"/register":()=>d(()=>import("./register-page-Bi-PZrxG.js"),[]),"/offline-stories":()=>d(()=>import("./offline-stories-page-CB2X6qvI.js"),__vite__mapDeps([4,3]))};function P(){return window.location.hash.slice(1)||"/"}class S{static async start(t){if(document.startViewTransition)return document.startViewTransition(async()=>{await t()});await t()}static createCustomTransition(){if(!document.startViewTransition)return;const t=document.createElement("style");t.textContent=`
            ::view-transition-old(root),
            ::view-transition-new(root) {
                animation-duration: 0.3s;
            }
        `,document.head.appendChild(t)}}class A{constructor({content:t,drawerButton:e,navigationDrawer:o}){this.content=t,this.drawerButton=e,this.navigationDrawer=o,this.currentPage=null,this.setupDrawer()}setupDrawer(){this.drawerButton.addEventListener("click",()=>{const t=this.navigationDrawer.classList.toggle("open");this.drawerButton.setAttribute("aria-expanded",t),this.drawerButton.innerHTML=t?"✕":"☰"}),document.addEventListener("click",t=>{!this.navigationDrawer.contains(t.target)&&!this.drawerButton.contains(t.target)&&this.closeDrawer()}),this.navigationDrawer.querySelectorAll("a").forEach(t=>{t.addEventListener("click",()=>this.closeDrawer())})}closeDrawer(){this.navigationDrawer.classList.remove("open"),this.drawerButton.setAttribute("aria-expanded","false"),this.drawerButton.innerHTML="☰"}async renderPage(){try{const t=P();console.log("Rendering page for URL:",t);const o=Object.keys(E).find(c=>{const p=c.split("/").filter(Boolean),u=t.split("/").filter(Boolean);return p.length!==u.length?!1:p.every((f,y)=>f.startsWith(":")||f===u[y])})||t,n=E[o];if(!n){console.error("Page not found for URL:",t),this.showErrorPage();return}let r;if(typeof n=="function"){const c=n();if(c&&typeof c.then=="function"){const p=await c;r=p.default||p}else r=c||n}else r=n;if(typeof r!="function"){console.error("PageClass is not a constructor:",r),this.showErrorPage();return}console.log("Instantiating page class:",r.name);const s=new r,i=this.content||document.getElementById("main-content");if(!i){console.error("Main content element not found");return}i.innerHTML="";const l=await s.render();l&&(i.innerHTML=l),typeof s.afterRender=="function"&&await s.afterRender(),console.log("Page rendered successfully:",t)}catch(t){console.error("Page rendering error:",t),this.showErrorPage()}}showLoading(){if(this.content.innerHTML=`
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Memuat halaman...</p>
            </div>
        `,!document.querySelector("#loading-styles")){const t=document.createElement("style");t.id="loading-styles",t.textContent=`
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 50vh;
                    gap: 1rem;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-left: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `,document.head.appendChild(t)}}hideLoading(){}updateActiveNav(t){this.navigationDrawer.querySelectorAll(".nav-link").forEach(o=>{o.classList.remove("active");const n=o.getAttribute("href").replace("#","");(t===n||t.startsWith(n)&&n!=="/")&&o.classList.add("active")})}async showNotFound(){await S.start(()=>{this.content.innerHTML=`
                <section class="container error-page">
                    <div class="error-content">
                        <h1>404 - Halaman Tidak Ditemukan</h1>
                        <p>Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
                        <div class="error-actions">
                            <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
                            <a href="#/stories" class="btn btn-secondary">Lihat Cerita</a>
                        </div>
                    </div>
                </section>
            `}),this.setupErrorPageListeners()}async showError(t,e){console.error("Page rendering error:",t);let o="Gagal memuat halaman",n=t.message;t.name==="TypeError"&&t.message.includes("Failed to fetch dynamically imported module")?(o="Koneksi Terputus",n="Aplikasi sedang dalam mode offline. Beberapa fitur mungkin tidak tersedia."):(t.name==="NetworkError"||!navigator.onLine)&&(o="Tidak Ada Koneksi Internet",n="Periksa koneksi internet Anda dan coba lagi."),await S.start(()=>{this.content.innerHTML=`
                <section class="container error-page">
                    <div class="error-content">
                        <h1>${o}</h1>
                        <p>${n}</p>
                        <div class="error-actions">
                            <button onclick="location.reload()" class="btn btn-primary">Refresh Halaman</button>
                            <a href="#/" class="btn btn-secondary">Kembali ke Beranda</a>
                            ${navigator.onLine?"":`
                                <button onclick="this.disabled=true; setTimeout(() => location.reload(), 1000)" class="btn btn-outline">
                                    🔄 Coba Koneksi
                                </button>
                            `}
                        </div>
                        
                    </div>
                </section>
            `}),this.setupErrorPageListeners()}showErrorPage(){const t=this.content||document.getElementById("main-content");if(t){t.innerHTML=`
                <div class="error-page">
                    <h2>Halaman Tidak Ditemukan</h2>
                    <p>Maaf, halaman yang Anda cari tidak tersedia.</p>
                    <button id="error-back-home" class="btn btn-primary">Kembali ke Beranda</button>
                </div>
            `;const e=t.querySelector("#error-back-home");e&&e.addEventListener("click",()=>{window.location.hash="/home"})}}setupErrorPageListeners(){this.content.querySelectorAll(".error-actions .btn, .error-actions a").forEach(e=>{e.getAttribute("href")&&e.addEventListener("click",o=>{o.preventDefault();const n=e.getAttribute("href").replace("#","");window.location.hash=n})})}}const D="https://story-api.dicoding.dev/v1";class T{constructor(){this.token=localStorage.getItem("token")}setToken(t){this.token=t,t?localStorage.setItem("token",t):localStorage.removeItem("token")}async request(t,e={}){const o=`${D}${t}`,n={headers:{"Content-Type":"application/json",...e.headers},...e};this.token&&!t.includes("/guest")&&(n.headers.Authorization=`Bearer ${this.token}`);try{const r=await fetch(o,n),s=await r.json();if(!r.ok)throw new Error(s.message||"Request failed");return s}catch(r){throw console.error("API Request failed:",r),r}}async register({name:t,email:e,password:o}){return this.request("/register",{method:"POST",body:JSON.stringify({name:t,email:e,password:o})})}async login({email:t,password:e}){return this.request("/login",{method:"POST",body:JSON.stringify({email:t,password:e})})}async getStories(t=1,e=20,o=0){return this.request(`/stories?page=${t}&size=${e}&location=${o}`)}async getStoryDetail(t){return this.request(`/stories/${t}`)}async addStory({description:t,photoFile:e,lat:o,lon:n}){const r=new FormData;return r.append("description",t),r.append("photo",e),o&&r.append("lat",o),n&&r.append("lon",n),this.request("/stories",{method:"POST",headers:{Authorization:`Bearer ${this.token}`},body:r})}async addStoryGuest({description:t,photoFile:e,lat:o,lon:n}){const r=new FormData;return r.append("description",t),r.append("photo",e),o&&r.append("lat",o),n&&r.append("lon",n),this.request("/stories/guest",{method:"POST",body:r})}async subscribePush(t){return this.request("/notifications/subscribe",{method:"POST",body:JSON.stringify(t)})}async unsubscribePush(t){return this.request("/notifications/subscribe",{method:"DELETE",body:JSON.stringify({endpoint:t})})}}const B=new T;function b(){const a=localStorage.getItem("token"),t=document.getElementById("auth-nav-item"),e=JSON.parse(localStorage.getItem("user")||"{}");a&&t?(t.innerHTML=`
            <div class="user-menu">
                <span class="user-greeting">Halo, ${e.name}</span>
                <button class="logout-btn" aria-label="Keluar">🚪</button>
            </div>
        `,t.querySelector(".logout-btn").addEventListener("click",R)):t&&(t.innerHTML='<a href="#/login" class="nav-link">Masuk</a>')}function O(){const a=document.getElementById("drawer-button"),t=document.getElementById("navigation-drawer");a&&t&&a.addEventListener("click",()=>{const e=t.classList.toggle("open");a.setAttribute("aria-expanded",e),a.innerHTML=e?"✕":"☰"})}function R(){localStorage.removeItem("token"),localStorage.removeItem("user"),B.setToken(null),b(),window.location.hash="/"}function C(a){const t={year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"};return new Date(a).toLocaleDateString("id-ID",t)}function N(a){return/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a)}function V(a,t){let e;return function(...n){const r=()=>{clearTimeout(e),a(...n)};clearTimeout(e),e=setTimeout(r,t)}}class m{static init(){this.setupInstallPrompt(),this.checkInstallStatus(),this.setupOnlineOfflineHandlers()}static setupInstallPrompt(){window.addEventListener("beforeinstallprompt",t=>{t.preventDefault(),this.deferredPrompt=t,console.log("Install prompt available"),this.showInstallButton(),this.trackInstallPrompt()}),window.addEventListener("appinstalled",t=>{console.log("App installed successfully"),this.isInstalled=!0,this.hideInstallButton(),this.trackInstallation(),this.showInstallMessage("Aplikasi berhasil diinstall! 🎉","success")}),this.checkInstallStatus()}static setupOnlineOfflineHandlers(){window.addEventListener("online",()=>{document.documentElement.classList.remove("offline"),document.documentElement.classList.add("online"),this.showInstallMessage("Koneksi internet tersedia","success",2e3)}),window.addEventListener("offline",()=>{document.documentElement.classList.remove("online"),document.documentElement.classList.add("offline"),this.showInstallMessage("Anda sedang offline","info",3e3)}),navigator.onLine||document.documentElement.classList.add("offline")}static showInstallButton(){if(this.isInstalled||!this.deferredPrompt)return;this.removeExistingInstallButtons();const t=this.createInstallButton(),e=document.querySelector(".nav-list");if(e){const o=document.createElement("li");o.appendChild(t),e.appendChild(o)}this.showFloatingInstallButton()}static createInstallButton(){const t=document.createElement("button");return t.id="install-btn",t.className="install-btn nav-link",t.innerHTML=`
            <span class="install-icon">📱</span>
            <span class="install-text">Install App</span>
        `,t.title="Install ShareYourStory untuk pengalaman lebih baik",t.addEventListener("click",async e=>{e.preventDefault(),await this.promptInstall()}),t}static showFloatingInstallButton(){const t=document.getElementById("floating-install-btn");t&&t.remove();const e=document.createElement("button");e.id="floating-install-btn",e.className="floating-install-btn",e.innerHTML="📱 Install",e.title="Install Aplikasi",e.addEventListener("click",async()=>{await this.promptInstall()}),document.body.appendChild(e),setTimeout(()=>{e.parentElement&&!this.isInstalled&&(e.style.opacity="0",setTimeout(()=>{e.parentElement&&e.remove()},500))},15e3)}static removeExistingInstallButtons(){document.querySelectorAll(".install-btn, #floating-install-btn").forEach(e=>{e.style.opacity="0",setTimeout(()=>e.remove(),300)})}static hideInstallButton(){this.removeExistingInstallButtons()}static async promptInstall(){if(!this.deferredPrompt){this.showInstallMessage("Aplikasi sudah terinstall atau tidak support install prompt","info");return}try{this.deferredPrompt.prompt();const{outcome:t}=await this.deferredPrompt.userChoice;console.log(`User response to install prompt: ${t}`),this.deferredPrompt=null,t==="accepted"?(this.isInstalled=!0,this.hideInstallButton()):this.showInstallMessage("Installasi dibatalkan. Anda bisa install nanti dari menu Pengaturan.","info")}catch(t){console.error("Error during install prompt:",t),this.showInstallMessage("Gagal menginstall aplikasi","error")}}static checkInstallStatus(){const t=window.matchMedia("(display-mode: standalone)").matches,e=document.referrer.includes("android-app://"),o=localStorage.getItem("app_installed")==="true";this.isInstalled=t||e||o,this.isInstalled&&(this.hideInstallButton(),localStorage.setItem("app_installed","true"))}static trackInstallPrompt(){console.log("Install prompt shown to user")}static trackInstallation(){localStorage.setItem("app_installed","true"),console.log("App installation tracked")}static showInstallMessage(t,e,o=5e3){document.querySelectorAll(".install-toast").forEach(s=>s.remove());const r=document.createElement("div");r.className=`install-toast install-toast-${e}`,r.textContent=t,Object.assign(r.style,{position:"fixed",top:"20px",right:"20px",left:"20px",maxWidth:"400px",margin:"0 auto",padding:"12px 20px",borderRadius:"8px",color:"white",zIndex:"10000",backgroundColor:e==="success"?"#10b981":e==="error"?"#ef4444":e==="info"?"#3b82f6":"#6b7280",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",textAlign:"center",fontSize:"14px"}),document.body.appendChild(r),setTimeout(()=>{r.parentNode&&(r.style.opacity="0",r.style.transform="translateY(-20px)",setTimeout(()=>{r.parentNode&&r.remove()},300))},o)}static async triggerInstallPrompt(){this.deferredPrompt?await this.promptInstall():this.showInstallMessage("Install prompt tidak tersedia. Pastikan Anda mengakses dari HTTPS dan memenuhi kriteria PWA.","info")}static supportsPWA(){return"serviceWorker"in navigator&&"BeforeInstallPromptEvent"in window}static isRunningStandalone(){return window.matchMedia("(display-mode: standalone)").matches}}g(m,"deferredPrompt",null),g(m,"isInstalled",!1);document.addEventListener("DOMContentLoaded",()=>{if(m.init(),!document.querySelector("#install-manager-styles")){const t=document.createElement("style");t.id="install-manager-styles",t.textContent=`
            .install-btn {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 1rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.3s ease;
            }
            
            .install-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            }
            
            .floating-install-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 16px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                font-size: 14px;
                font-weight: 600;
                transition: all 0.3s ease;
                animation: bounce 2s infinite;
            }
            
            .floating-install-btn:hover {
                transform: translateY(-2px) scale(1.05);
                box-shadow: 0 6px 20px rgba(0,0,0,0.3);
            }
            
            .install-toast {
                transition: all 0.3s ease;
            }
            
            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-5px);
                }
                60% {
                    transform: translateY(-3px);
                }
            }
            
            /* Online/Offline indicators */
            .online-indicator {
                position: fixed;
                top: 10px;
                left: 10px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #10b981;
                z-index: 1001;
            }
            
            .offline-indicator {
                position: fixed;
                top: 10px;
                left: 10px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #ef4444;
                z-index: 1001;
            }
            
            @media (max-width: 768px) {
                .floating-install-btn {
                    bottom: 80px;
                    right: 20px;
                }
            }
        `,document.head.appendChild(t)}const a=document.createElement("div");a.className=navigator.onLine?"online-indicator":"offline-indicator",a.title=navigator.onLine?"Online":"Offline",document.body.appendChild(a)});const I="ShareYourStoryDB",q=5,h="stories";class w{static async init(){return new Promise((t,e)=>{const o=indexedDB.open(I,q);o.onerror=()=>{console.error("IndexedDB error:",o.error),e(o.error)},o.onsuccess=()=>{this.db=o.result,console.log("IndexedDB initialized successfully with version:",this.db.version),t(this.db)},o.onupgradeneeded=n=>{const r=n.target.result;console.log("Database upgrade needed. Old version:",n.oldVersion,"New version:",n.newVersion),this.handleDatabaseUpgrade(r,n.oldVersion)},o.onblocked=()=>{console.warn("Database upgrade blocked. Please close other tabs using this app.")}})}static handleDatabaseUpgrade(t,e){if(t.objectStoreNames.contains("old_stories")&&t.deleteObjectStore("old_stories"),t.objectStoreNames.contains(h)){const n=event.currentTarget.transaction.objectStore(h);n.indexNames.contains("lastUpdated")||n.createIndex("lastUpdated","lastUpdated",{unique:!1})}else{console.log("Creating new object store:",h);const o=t.createObjectStore(h,{keyPath:"id"});o.createIndex("createdAt","createdAt",{unique:!1}),o.createIndex("hasLocation","hasLocation",{unique:!1}),o.createIndex("isSynced","isSynced",{unique:!1}),o.createIndex("lastUpdated","lastUpdated",{unique:!1})}}static async clearAndRecreate(){return this.db&&this.db.close(),new Promise((t,e)=>{const o=indexedDB.deleteDatabase(I);o.onsuccess=()=>{console.log("Database deleted successfully"),this.db=null,this.init().then(t).catch(e)},o.onerror=()=>{console.error("Error deleting database:",o.error),e(o.error)}})}static async saveStories(t){return this.db||await this.init(),new Promise((e,o)=>{const n=this.db.transaction([h],"readwrite"),r=n.objectStore(h);r.clear(),t.forEach(s=>{const i={...s,hasLocation:!!(s.lat&&s.lon),isSynced:!0,lastUpdated:new Date().toISOString()};r.put(i)}),n.oncomplete=()=>{console.log(`Saved ${t.length} stories to offline storage`),e()},n.onerror=()=>{console.error("Transaction error:",n.error),o(n.error)}})}static async getStories(t={}){return this.db||await this.init(),new Promise((e,o)=>{const s=this.db.transaction([h],"readonly").objectStore(h).getAll();s.onsuccess=()=>{let i=s.result;if(t.unsynced&&(i=i.filter(l=>!l.isSynced)),t.withLocation&&(i=i.filter(l=>l.hasLocation)),t.search){const l=t.search.toLowerCase();i=i.filter(c=>{var p,u;return((p=c.name)==null?void 0:p.toLowerCase().includes(l))||((u=c.description)==null?void 0:u.toLowerCase().includes(l))})}i.sort((l,c)=>new Date(c.createdAt)-new Date(l.createdAt)),e(i)},s.onerror=()=>{console.error("Get stories error:",s.error),o(s.error)}})}static async saveStory(t){return this.db||await this.init(),new Promise((e,o)=>{const r=this.db.transaction([h],"readwrite").objectStore(h),s={...t,id:`offline_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,createdAt:new Date().toISOString(),hasLocation:!!(t.lat&&t.lon),isSynced:!1,offline:!0,lastUpdated:new Date().toISOString()},i=r.add(s);i.onsuccess=()=>{console.log("Story saved for offline sync:",s.id),e(s.id)},i.onerror=()=>{console.error("Save story error:",i.error),o(i.error)}})}static async markStoryAsSynced(t){return this.db||await this.init(),new Promise((e,o)=>{const r=this.db.transaction([h],"readwrite").objectStore(h),s=r.get(t);s.onsuccess=()=>{const i=s.result;if(i){i.isSynced=!0,i.offline=!1,i.lastUpdated=new Date().toISOString();const l=r.put(i);l.onsuccess=()=>{console.log("Story marked as synced:",t),e()},l.onerror=()=>{console.error("Update story error:",l.error),o(l.error)}}else e()},s.onerror=()=>{console.error("Get story error:",s.error),o(s.error)}})}static async getUnsyncedStories(){return this.getStories({unsynced:!0})}static async getStoriesWithLocation(){return this.getStories({withLocation:!0})}static async clearAllData(){return this.db||await this.init(),new Promise((t,e)=>{const r=this.db.transaction([h],"readwrite").objectStore(h).clear();r.onsuccess=()=>{console.log("All offline data cleared"),t()},r.onerror=()=>{console.error("Clear data error:",r.error),e(r.error)}})}static async getStorageStats(){try{this.db||await this.init();const t=await this.getStories(),e=t.filter(n=>n.hasLocation).length,o=t.filter(n=>!n.isSynced).length;return{totalStories:t.length,storiesWithLocation:e,unsyncedStories:o,lastUpdated:t.length>0?new Date(Math.max(...t.map(n=>new Date(n.lastUpdated||n.createdAt)))):null}}catch(t){return console.error("Error getting storage stats:",t),{totalStories:0,storiesWithLocation:0,unsyncedStories:0,lastUpdated:null}}}static async searchStories(t){return this.getStories({search:t})}static isSupported(){return"indexedDB"in window}static async handleVersionError(){return console.warn("Database version conflict detected. Recreating database..."),this.clearAndRecreate()}}g(w,"db",null);document.addEventListener("DOMContentLoaded",async()=>{console.log("Aplikasi ShareYourStory dimulai...");try{try{await w.init(),console.log("Offline storage initialized successfully")}catch(t){console.warn("Offline storage init failed, attempting recovery:",t),t.name==="VersionError"?await w.handleVersionError():console.error("Offline storage unavailable:",t)}m.init(),O(),b();const a=new A({content:document.getElementById("main-content"),drawerButton:document.getElementById("drawer-button"),navigationDrawer:document.getElementById("navigation-drawer")});await a.renderPage(),window.addEventListener("hashchange",async()=>{await a.renderPage(),b()}),console.log("Aplikasi berhasil diinisialisasi")}catch(a){console.error("Gagal menginisialisasi aplikasi:",a),(void 0).showFatalError(a)}});window.addEventListener("online",()=>{document.documentElement.classList.remove("offline"),console.log("Aplikasi online")});window.addEventListener("offline",()=>{document.documentElement.classList.add("offline"),console.log("Aplikasi offline")});window.addEventListener("error",a=>{console.error("Global error:",a.error)});window.addEventListener("unhandledrejection",a=>{console.error("Unhandled promise rejection:",a.reason)});window.ShareYourStory={OfflineStorage:w,InstallManager:m,testNotification:()=>{window.PushNotificationManager&&window.PushNotificationManager.triggerTestNotification()},testInstall:()=>{m.triggerInstallPrompt()},clearStorage:()=>{localStorage.clear(),sessionStorage.clear(),indexedDB.deleteDatabase("ShareYourStoryDB"),location.reload()}};export{m as I,w as O,C as a,V as d,B as s,N as v};

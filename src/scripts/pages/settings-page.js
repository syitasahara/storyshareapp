import { pushManager } from "../utils/notification.js";
import { InstallManager } from "../utils/install-manager.js";
import { OfflineStorage } from "../utils/offline-storage.js";
import { storyDB } from "../utils/indexedDB.js";

export default class SettingsPage {
  async render() {
    const state = await pushManager.getSubscriptionState();
    const dbStats = await OfflineStorage.getStorageStats();
    const isOnline = navigator.onLine;

    return `
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
                                           ${
                                             state.isSubscribed ? "checked" : ""
                                           }
                                           ${
                                             !state.supported ||
                                             state.permission === "denied"
                                               ? "disabled"
                                               : ""
                                           }>
                                    <span class="toggle-slider"></span>
                                </label>
                            </div>

                            <div class="notification-status">
                                <p>Status: <span id="notification-status" class="status ${
                                  state.isSubscribed ? "active" : "inactive"
                                }">
                                    ${this.getStatusText(state)}
                                </span></p>
                                <p class="help-text" id="notification-help">
                                    ${this.getHelpText(state)}
                                </p>
                            </div>

                            <div class="setting-actions">
                                <button class="btn btn-secondary" id="test-basic-notification"
                                        ${!state.supported ? "disabled" : ""}>
                                    Test Notifikasi Basic
                                </button>
                                <button class="btn btn-secondary" id="test-advanced-notification"
                                        ${!state.supported ? "disabled" : ""}>
                                    Test Notifikasi Advanced
                                </button>
                                <button class="btn btn-primary" id="simulate-new-story"
                                        ${!state.supported ? "disabled" : ""}>
                                    Simulasikan Cerita Baru
                                </button>
                            </div>

                            ${
                              !state.supported
                                ? `
                                <div class="browser-support-warning">
                                    <p>⚠️ Browser Anda tidak mendukung push notifications</p>
                                </div>
                            `
                                : ""
                            }

                            ${
                              state.permission === "denied"
                                ? `
                                <div class="permission-warning">
                                    <p>❌ Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.</p>
                                </div>
                            `
                                : ""
                            }
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
        `;
  }

  getStatusText(state) {
    if (!state.supported) return "❌ Tidak didukung";
    if (state.permission === "denied") return "❌ Izin ditolak";
    if (state.isSubscribed) return "🔔 Aktif";
    return "🔕 Nonaktif";
  }

  getHelpText(state) {
    if (!state.supported)
      return "Browser Anda tidak mendukung push notifications.";
    if (state.permission === "denied")
      return "Izin notifikasi ditolak. Aktifkan di pengaturan browser.";
    if (state.isSubscribed)
      return "Anda akan mendapat notifikasi ketika ada cerita baru.";
    return "Aktifkan untuk mendapat notifikasi cerita baru.";
  }

  async afterRender() {
    this.loadCSS();
    this.setupNotificationHandlers();
    this.setupInstallButton();
    this.setupTestButtons();
  }

  setupNotificationHandlers() {
    const toggle = document.getElementById("notification-toggle");
    const testBasicBtn = document.getElementById("test-basic-notification");
    const testAdvancedBtn = document.getElementById(
      "test-advanced-notification"
    );
    const simulateBtn = document.getElementById("simulate-new-story");
    const debugBtn = document.getElementById("debug-push");
    const clearBtn = document.getElementById("clear-push-data");

    // Toggle subscription
    if (toggle) {
      toggle.addEventListener("change", async () => {
        try {
          await pushManager.toggleSubscription();
          this.showMessage("Pengaturan notifikasi diperbarui", "success");
        } catch (error) {
          console.error("Toggle error:", error);
          this.showMessage(error.message, "error");
          // Reset toggle state
          toggle.checked = !toggle.checked;
        }
      });
    }

    // Test buttons
    if (testBasicBtn) {
      testBasicBtn.addEventListener("click", async () => {
        try {
          await pushManager.testBasicNotification();
          this.showMessage("Notifikasi basic berhasil dikirim", "success");
        } catch (error) {
          this.showMessage(`Gagal: ${error.message}`, "error");
        }
      });
    }

    if (testAdvancedBtn) {
      testAdvancedBtn.addEventListener("click", async () => {
        try {
          await pushManager.testAdvancedNotification();
          this.showMessage("Notifikasi advanced berhasil dikirim", "success");
        } catch (error) {
          this.showMessage(`Gagal: ${error.message}`, "error");
        }
      });
    }

    if (simulateBtn) {
      simulateBtn.addEventListener("click", async () => {
        try {
          await pushManager.simulateNewStory();
          this.showMessage("Notifikasi cerita baru disimulasikan", "success");
        } catch (error) {
          this.showMessage(`Gagal: ${error.message}`, "error");
        }
      });
    }

    // Debug buttons
    if (debugBtn) {
      debugBtn.addEventListener("click", async () => {
        const state = await pushManager.debugStatus();
        const debugOutput = document.getElementById("debug-output");
        if (debugOutput) {
          debugOutput.innerHTML = `
                        <h4>Debug Information:</h4>
                        <pre>${JSON.stringify(state, null, 2)}</pre>
                    `;
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", async () => {
        localStorage.removeItem("pushSubscription");
        await pushManager.checkSubscription();
        this.showMessage("Data push dibersihkan", "info");
      });
    }

    // Listen for subscription changes
    window.addEventListener("pushSubscriptionChange", () => {
      this.updateNotificationUI();
    });
  }

  async updateNotificationUI() {
    const state = await pushManager.getSubscriptionState();
    const toggle = document.getElementById("notification-toggle");
    const statusElement = document.getElementById("notification-status");
    const helpElement = document.getElementById("notification-help");

    if (toggle) {
      toggle.checked = state.isSubscribed;
      toggle.disabled = !state.supported || state.permission === "denied";
    }

    if (statusElement) {
      statusElement.textContent = this.getStatusText(state);
      statusElement.className = `status ${
        state.isSubscribed ? "active" : "inactive"
      }`;
    }

    if (helpElement) {
      helpElement.textContent = this.getHelpText(state);
    }
  }

  setupInstallButton() {
    const installBtn = document.getElementById("settings-install-btn");
    if (installBtn) {
      installBtn.addEventListener("click", () => {
        InstallManager.triggerInstallPrompt();
      });
    }
  }

  setupTestButtons() {
    // Add test button functionality here if needed
  }

  loadCSS() {
    if (!document.getElementById("settings-styles")) {
      const style = document.createElement("style");
      style.id = "settings-styles";
      style.textContent = `
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
            `;
      document.head.appendChild(style);
    }
  }

  showMessage(message, type = "info") {
    // Implement message/toast notification system
    console.log(`${type.toUpperCase()}: ${message}`);
  }

  async syncOfflineData() {
    try {
      await storyDB.syncAll();
      this.showMessage("Data berhasil disinkronkan", "success");
      await this.updateDatabaseInfo();
    } catch (error) {
      console.error("Sync error:", error);
      this.showMessage("Gagal melakukan sinkronisasi", "error");
    }
  }

  async clearStorage() {
    if (confirm("Yakin ingin menghapus semua data offline?")) {
      try {
        await storyDB.clear();
        this.showMessage("Data offline berhasil dihapus", "success");
        await this.updateDatabaseInfo();
      } catch (error) {
        console.error("Clear storage error:", error);
        this.showMessage("Gagal menghapus data offline", "error");
      }
    }
  }

  async logout() {
    if (confirm("Yakin ingin keluar?")) {
      try {
        // Clean up before logout
        await pushManager.unsubscribe();
        await this.clearStorage();

        // Clear auth data
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Redirect to home
        window.location.hash = "#/";
        window.location.reload();
      } catch (error) {
        console.error("Logout error:", error);
        this.showMessage("Gagal melakukan logout", "error");
      }
    }
  }

  async testNotification(type) {
    try {
      switch (type) {
        case "basic":
          await pushManager.testBasicNotification();
          this.showMessage("Test notifikasi basic berhasil", "success");
          break;

        case "skilled":
          await pushManager.testSkilledNotification();
          this.showMessage("Test notifikasi skilled berhasil", "success");
          break;

        case "advanced":
          await pushManager.testAdvancedNotification();
          this.showMessage("Test notifikasi advanced berhasil", "success");
          break;

        case "simulate":
          await pushManager.simulateNewStory();
          this.showMessage(
            "Simulasi notifikasi cerita baru berhasil",
            "success"
          );
          break;
      }
    } catch (error) {
      console.error("Test notification error:", error);
      this.showMessage(
        `Gagal mengirim notifikasi test: ${error.message}`,
        "error"
      );
    }
  }
  async render() {
    const isLoggedIn = !!localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return `
            <section class="settings-page">
                <div class="container">
                    <h1>⚙️ Pengaturan</h1>
                    
                    ${
                      isLoggedIn
                        ? `
                        <div class="settings-section">
                            <h2>👤 Informasi Akun</h2>
                            <div class="user-info">
                                <p><strong>Nama:</strong> ${
                                  user.name || "Tidak tersedia"
                                }</p>
                                <p><strong>User ID:</strong> ${
                                  user.userId || "Tidak tersedia"
                                }</p>
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
                    `
                        : `
                        <div class="auth-required">
                            <h2>🔐 Login Diperlukan</h2>
                            <p>Silakan login untuk mengakses pengaturan</p>
                            <div class="auth-actions">
                                <a href="#/login" class="btn btn-primary">Login</a>
                                <a href="#/register" class="btn btn-secondary">Daftar</a>
                            </div>
                        </div>
                    `
                    }
                </div>
            </section>
        `;
  }

  async afterRender() {
    this.loadCSS();
    await this.setupPushNotification();
    await this.setupIndexedDB();
    this.setupEventListeners();
  }

  async setupPushNotification() {
    try {
      await pushManager.init();
      await this.updatePushStatus();
    } catch (error) {
      console.error("Error setting up push notification:", error);
    }
  }

  async updatePushStatus() {
    try {
      const state = await pushManager.getSubscriptionState();
      this.updatePushToggle(state.isSubscribed);

      const statusElement = document.getElementById("pushStatus");
      if (statusElement) {
        if (!state.supported) {
          statusElement.innerHTML =
            '<span class="error">❌ Browser tidak mendukung push notification</span>';
        } else if (state.permission === "denied") {
          statusElement.innerHTML =
            '<span class="error">❌ Izin notifikasi ditolak. Silakan ubah di pengaturan browser.</span>';
        } else if (state.isSubscribed) {
          statusElement.innerHTML =
            '<span class="success">✅ Notifikasi diaktifkan</span>';
        } else {
          statusElement.innerHTML =
            '<span class="info">🔕 Notifikasi dimatikan</span>';
        }
      }
    } catch (error) {
      console.error("Error updating push status:", error);
    }
  }

  updatePushToggle(isSubscribed) {
    const toggleBtn = document.getElementById("pushToggle");
    if (toggleBtn) {
      toggleBtn.checked = isSubscribed;
    }
  }

  async setupIndexedDB() {
    try {
      await this.updateDatabaseInfo();
    } catch (error) {
      console.error("Error setting up IndexedDB:", error);
    }
  }

  async updateDatabaseInfo() {
    try {
      const dbSize = await storyDB.getDatabaseSize();
      const unsyncedStories = await storyDB.getUnsyncedStories();

      const dbInfoElement = document.getElementById("dbInfo");
      if (dbInfoElement) {
        dbInfoElement.innerHTML = `
                    <div class="db-stats">
                        <div class="stat-item">
                            <span class="stat-label">Total Item:</span>
                            <span class="stat-value">${dbSize.totalItems}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Cerita:</span>
                            <span class="stat-value">${
                              dbSize.stories || 0
                            }</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Menunggu Sync:</span>
                            <span class="stat-value warning">${
                              unsyncedStories.length
                            }</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Status:</span>
                            <span class="stat-value ${
                              navigator.onLine ? "success" : "error"
                            }">
                                ${navigator.onLine ? "Online" : "Offline"}
                            </span>
                        </div>
                    </div>
                `;
      }
    } catch (error) {
      console.error("Error updating database info:", error);
    }
  }

  setupEventListeners() {
    // Push Notification Toggle
    const pushToggle = document.getElementById("pushToggle");
    if (pushToggle) {
      pushToggle.addEventListener("change", async () => {
        await this.togglePushNotification();
      });
    }

    // Test Notification Buttons
    const testBasic = document.getElementById("testBasic");
    const testSkilled = document.getElementById("testSkilled");
    const testAdvanced = document.getElementById("testAdvanced");
    const testSimulate = document.getElementById("testSimulate");

    if (testBasic)
      testBasic.addEventListener("click", () => this.testNotification("basic"));
    if (testSkilled)
      testSkilled.addEventListener("click", () =>
        this.testNotification("skilled")
      );
    if (testAdvanced)
      testAdvanced.addEventListener("click", () =>
        this.testNotification("advanced")
      );
    if (testSimulate)
      testSimulate.addEventListener("click", () =>
        this.testNotification("simulate")
      );

    // IndexedDB Actions
    const syncBtn = document.getElementById("syncNow");
    const clearBtn = document.getElementById("clearStorage");
    const logoutBtn = document.getElementById("logout-btn");

    if (syncBtn)
      syncBtn.addEventListener("click", () => this.syncOfflineData());
    if (clearBtn) clearBtn.addEventListener("click", () => this.clearStorage());
    if (logoutBtn) logoutBtn.addEventListener("click", () => this.logout());

    // Online/Offline listeners
    window.addEventListener("online", () => this.updateDatabaseInfo());
    window.addEventListener("offline", () => this.updateDatabaseInfo());

    // Push subscription change listener
    window.addEventListener("pushSubscriptionChange", (event) => {
      this.updatePushToggle(event.detail.isSubscribed);
      this.updatePushStatus();
    });
  }

  async togglePushNotification() {
    const toggleBtn = document.getElementById("pushToggle");
    if (!toggleBtn) return;

    try {
      await pushManager.toggleSubscription();
      this.showMessage(
        pushManager.isSubscribed
          ? "Push notification diaktifkan"
          : "Push notification dimatikan",
        "success"
      );
    } catch (error) {
      console.error("Toggle error:", error);
      toggleBtn.checked = !toggleBtn.checked;
      this.showMessage("Gagal mengubah pengaturan notifikasi", "error");
    }
  }

  async testNotification(type) {
    try {
      switch (type) {
        case "basic":
          await pushManager.testBasicNotification();
          this.showMessage("Notifikasi basic dikirim", "success");
          break;
        case "skilled":
          await pushManager.testSkilledNotification();
          this.showMessage("Notifikasi skilled dikirim", "success");
          break;
        case "advanced":
          await pushManager.testAdvancedNotification();
          this.showMessage("Notifikasi advanced dikirim", "success");
          break;
        case "simulate":
          await pushManager.simulateNewStory();
          this.showMessage("Notifikasi cerita simulasi dikirim", "success");
          break;
      }
    } catch (error) {
      console.error("Test notification error:", error);
      this.showMessage("Gagal mengirim notifikasi test", "error");
    }
  }

  async syncOfflineData() {
    if (!navigator.onLine) {
      this.showMessage("Tidak ada koneksi internet", "error");
      return;
    }

    try {
      const syncBtn = document.getElementById("syncNow");
      if (syncBtn) {
        syncBtn.disabled = true;
        syncBtn.textContent = "Menyinkronisasi...";
      }

      this.showMessage("Memulai sinkronisasi data offline...", "info");

      // Simulate sync process
      setTimeout(async () => {
        try {
          const unsyncedStories = await storyDB.getUnsyncedStories();
          let syncedCount = 0;

          // Simulate API calls
          for (const story of unsyncedStories) {
            // Mark as synced (simulate successful API call)
            await storyDB.markStoryAsSynced(story.id, `server-${Date.now()}`);
            syncedCount++;
          }

          if (syncedCount > 0) {
            this.showMessage(`Berhasil sync ${syncedCount} cerita`, "success");
          } else {
            this.showMessage(
              "Tidak ada data yang perlu disinkronisasi",
              "info"
            );
          }
        } catch (error) {
          this.showMessage("Gagal menyinkronisasi data", "error");
        } finally {
          await this.updateDatabaseInfo();
          const syncBtn = document.getElementById("syncNow");
          if (syncBtn) {
            syncBtn.disabled = false;
            syncBtn.textContent = "🔄 Sinkronisasi Sekarang";
          }
        }
      }, 2000);
    } catch (error) {
      this.showMessage("Gagal memulai sinkronisasi", "error");
    }
  }

  async clearStorage() {
    if (
      confirm(
        "Apakah Anda yakin ingin menghapus semua data offline? Tindakan ini tidak dapat dibatalkan."
      )
    ) {
      try {
        await storyDB.clearDatabase();
        this.showMessage("Data offline berhasil dihapus", "success");
        await this.updateDatabaseInfo();
      } catch (error) {
        this.showMessage("Gagal menghapus data offline", "error");
      }
    }
  }

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.showMessage("Logout berhasil", "success");
    setTimeout(() => {
      window.location.hash = "/home";
    }, 1000);
  }

  showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message-toast");
    existingMessages.forEach((msg) => msg.remove());

    const messageEl = document.createElement("div");
    messageEl.className = `message-toast message-${type}`;
    messageEl.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;

    document.body.appendChild(messageEl);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentElement) {
        messageEl.remove();
      }
    }, 5000);
  }

  loadCSS() {
    if (!document.querySelector("#settings-styles")) {
      const style = document.createElement("style");
      style.id = "settings-styles";
      style.textContent = `
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
            `;
      document.head.appendChild(style);
    }
  }
}

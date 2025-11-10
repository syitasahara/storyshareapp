import { storyApi } from "../data/api.js";

const VAPID_PUBLIC_KEY =
  "BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk";

export class PushNotificationManager {
  constructor() {
    this.isSubscribed = false;
    this.subscription = null;
    this.registration = null;
    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return true;

    if (!this.supportsPush()) {
      console.warn("Push notifications not supported");
      return false;
    }

    try {
      // Wait for service worker to be ready
      if (!navigator.serviceWorker.controller) {
        console.log("Waiting for service worker registration...");
        await new Promise((resolve) => {
          if (navigator.serviceWorker.controller) {
            resolve();
          } else {
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              resolve
            );
          }
        });
      }

      this.registration = await navigator.serviceWorker.ready;
      console.log("Service worker ready:", this.registration);

      // Check existing subscription
      await this.checkSubscription();

      // Setup event listeners
      this.setupEventListeners();

      this.isInitialized = true;
      console.log("Push notification manager initialized successfully");

      return true;
    } catch (error) {
      console.error("Push notification init error:", error);
      return false;
    }
  }

  supportsPush() {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    console.log("Push support check:", supported);
    return supported;
  }

  async checkSubscription() {
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.ready;
      }

      this.subscription = await this.registration.pushManager.getSubscription();
      this.isSubscribed = !!this.subscription;

      console.log("Subscription check - subscribed:", this.isSubscribed);
      console.log("Current subscription:", this.subscription);

      return this.isSubscribed;
    } catch (error) {
      console.error("Error checking subscription:", error);
      this.isSubscribed = false;
      return false;
    }
  }

  async requestPermission() {
    if (!("Notification" in window)) {
      throw new Error("Browser tidak mendukung notifikasi");
    }

    console.log("Current notification permission:", Notification.permission);

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      throw new Error(
        "Izin notifikasi telah ditolak. Silakan aktifkan di pengaturan browser."
      );
    }

    const permission = await Notification.requestPermission();
    console.log("Notification permission result:", permission);

    return permission === "granted";
  }

  async subscribeToPush() {
    console.log("Starting push subscription...");

    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }

    const permissionGranted = await this.requestPermission();
    if (!permissionGranted) {
      throw new Error("Izin notifikasi ditolak");
    }

    try {
      // Convert VAPID key
      const applicationServerKey = this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      console.log("Application server key converted");

      // Subscribe to push
      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log("Push subscription successful:", this.subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(this.subscription);

      // Update state
      this.isSubscribed = true;
      this.onSubscriptionChange(true);

      console.log("Push notification subscribed successfully");
      return this.subscription;
    } catch (error) {
      console.error("Subscribe error:", error);

      if (error.name === "NotAllowedError") {
        throw new Error("Izin notifikasi ditolak oleh browser");
      } else if (error.name === "AbortError") {
        throw new Error("Proses subscribe dibatalkan");
      } else {
        throw new Error(`Gagal subscribe: ${error.message}`);
      }
    }
  }

  async sendSubscriptionToServer(subscription) {
    try {
      console.log("Sending subscription to server...");

      // Prepare subscription data sesuai format API Dicoding
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.toJSON().keys.p256dh,
          auth: subscription.toJSON().keys.auth,
        },
      };

      console.log("Subscription data to send:", subscriptionData);

      // Get user token
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No user token found, skipping server registration");
        return;
      }

      // Send to Dicoding API
      const result = await storyApi.subscribePush(subscriptionData);
      console.log("Server subscription response:", result);

      // Simpan subscription di localStorage untuk backup
      localStorage.setItem("pushSubscription", JSON.stringify(subscription));
    } catch (error) {
      console.error("Error sending subscription to server:", error);
      // Tetap lanjutkan meskipun gagal kirim ke server
    }
  }

  async unsubscribeFromPush() {
    console.log("Starting push unsubscribe...");

    if (!this.subscription) {
      console.log("No subscription to unsubscribe from");
      return true;
    }

    try {
      const success = await this.subscription.unsubscribe();
      console.log("Unsubscribe result:", success);

      if (success) {
        // Hapus dari server
        await this.removeSubscriptionFromServer();

        // Hapus dari localStorage
        localStorage.removeItem("pushSubscription");

        // Reset state
        this.subscription = null;
        this.isSubscribed = false;
        this.onSubscriptionChange(false);

        console.log("Push notification unsubscribed successfully");
      }
      return success;
    } catch (error) {
      console.error("Unsubscribe error:", error);
      throw error;
    }
  }

  async removeSubscriptionFromServer() {
    try {
      const token = localStorage.getItem("token");
      if (!token || !this.subscription) return;

      await storyApi.unsubscribePush(this.subscription.endpoint);
      console.log("Subscription removed from server");
    } catch (error) {
      console.error("Error removing subscription from server:", error);
    }
  }

  async toggleSubscription() {
    console.log("Toggling push subscription...");

    if (this.isSubscribed) {
      await this.unsubscribeFromPush();
    } else {
      await this.subscribeToPush();
    }

    return this.isSubscribed;
  }

  async getSubscriptionState() {
    await this.checkSubscription();
    return {
      isSubscribed: this.isSubscribed,
      permission: Notification.permission,
      supported: this.supportsPush(),
      subscription: this.subscription,
    };
  }

  // ========== LEVEL BASIC: Basic Notification ==========
  async showBasicNotification(title, options = {}) {
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }

    const defaultOptions = {
      body: "Ada cerita baru yang menunggu untuk dibaca!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      tag: "basic-notification",
    };

    await this.registration.showNotification(title, {
      ...defaultOptions,
      ...options,
    });
  }

  // ========== LEVEL SKILLED: Dynamic Notification ==========
  async showDynamicNotification(notificationData) {
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }

    const options = {
      body: notificationData.body || "Cerita baru tersedia",
      icon: notificationData.icon || "/icons/icon-192x192.png",
      image: notificationData.image || null,
      badge: "/icons/icon-72x72.png",
      tag: notificationData.tag || `story-${Date.now()}`,
      data: {
        url: notificationData.url || "/#/stories",
        storyId: notificationData.storyId,
        action: "view",
      },
      actions: [
        {
          action: "view",
          title: "📖 Baca Cerita",
        },
        {
          action: "dismiss",
          title: "❌ Tutup",
        },
      ],
      vibrate: [100, 50, 100],
      requireInteraction: true,
    };

    await this.registration.showNotification(
      notificationData.title || "ShareYourStory",
      options
    );
  }

  // ========== LEVEL ADVANCED: Advanced Notification dengan Actions ==========
  async showAdvancedNotification(storyData) {
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }

    const title = `Cerita Baru dari ${storyData.name}`;
    const body = storyData.description
      ? `${storyData.description.substring(0, 100)}...`
      : "Cerita baru telah dipublikasikan";

    const options = {
      body: body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      image: storyData.photoUrl || null,
      tag: `story-${storyData.id}`,
      data: {
        url: `/#/stories/${storyData.id}`,
        storyId: storyData.id,
        action: "view",
      },
      actions: [
        {
          action: "view",
          title: "👁️ Lihat Detail",
        },
        {
          action: "share",
          title: "🔗 Bagikan",
        },
        {
          action: "dismiss",
          title: "❌ Tutup",
        },
      ],
      vibrate: [200, 100, 200],
      requireInteraction: true,
      timestamp: new Date(storyData.createdAt).getTime(),
    };

    await this.registration.showNotification(title, options);
  }

  // ========== TEST METHODS ==========
  async testBasicNotification() {
    try {
      await this.showBasicNotification("Test Notifikasi Basic", {
        body: "Ini adalah notifikasi test level basic dari ShareYourStory",
        tag: "test-basic",
      });
      console.log("Basic notification test successful");
    } catch (error) {
      console.error("Basic notification test failed:", error);
      throw error;
    }
  }

  async testSkilledNotification() {
    try {
      const storyData = {
        title: "Test Notifikasi Dinamis",
        body: "Ini adalah notifikasi dengan konten dinamis dan actions",
        tag: "test-skilled",
        storyId: "test-123",
        url: "/#/stories",
      };
      await this.showDynamicNotification(storyData);
      console.log("Skilled notification test successful");
    } catch (error) {
      console.error("Skilled notification test failed:", error);
      throw error;
    }
  }

  async testAdvancedNotification() {
    try {
      const storyData = {
        id: "test-advanced-123",
        name: "John Doe",
        description:
          "Ini adalah cerita test yang menunjukkan fitur notifikasi advanced dengan multiple actions dan navigasi ke detail cerita.",
        photoUrl: "/icons/icon-512x512.png",
        createdAt: new Date().toISOString(),
      };
      await this.showAdvancedNotification(storyData);
      console.log("Advanced notification test successful");
    } catch (error) {
      console.error("Advanced notification test failed:", error);
      throw error;
    }
  }

  // Simulate new story from server
  async simulateNewStory() {
    const stories = [
      {
        id: "story-" + Date.now(),
        name: "Travel Blogger",
        description:
          "Pengalaman seru menjelajahi gunung tertinggi di Jawa Barat dengan pemandangan yang menakjubkan...",
        photoUrl: "/icons/icon-512x512.png",
        createdAt: new Date().toISOString(),
      },
      {
        id: "story-" + (Date.now() + 1),
        name: "Food Explorer",
        description:
          "Mencicipi makanan tradisional yang lezat dari berbagai daerah Indonesia...",
        photoUrl: "/icons/icon-512x512.png",
        createdAt: new Date().toISOString(),
      },
    ];

    const randomStory = stories[Math.floor(Math.random() * stories.length)];
    await this.showAdvancedNotification(randomStory);
  }

  // ========== UI MANAGEMENT ==========
  updateUI() {
    // Update toggle button di settings page
    const toggleBtn = document.getElementById("notification-toggle");
    if (toggleBtn) {
      toggleBtn.checked = this.isSubscribed;
      toggleBtn.disabled = false;
    }

    // Update status display
    this.updateStatusDisplay();
  }

  updateStatusDisplay() {
    const statusElement = document.getElementById("notification-status");
    if (!statusElement) return;

    if (!this.supportsPush()) {
      statusElement.innerHTML =
        '<span class="status inactive">❌ Browser tidak mendukung</span>';
    } else if (Notification.permission === "denied") {
      statusElement.innerHTML =
        '<span class="status inactive">❌ Izin ditolak</span>';
    } else if (this.isSubscribed) {
      statusElement.innerHTML =
        '<span class="status active">🔔 Notifikasi aktif</span>';
    } else {
      statusElement.innerHTML =
        '<span class="status inactive">🔕 Notifikasi nonaktif</span>';
    }
  }

  setupEventListeners() {
    // Listen for online/offline events
    window.addEventListener("online", () => {
      if (this.isSubscribed && this.subscription) {
        this.syncSubscription();
      }
    });

    // Listen for subscription changes from other tabs
    window.addEventListener("storage", (event) => {
      if (event.key === "pushSubscription") {
        this.checkSubscription();
      }
    });
  }

  async syncSubscription() {
    if (this.isSubscribed && this.subscription) {
      try {
        await this.sendSubscriptionToServer(this.subscription);
        console.log("Push subscription synced with server");
      } catch (error) {
        console.error("Failed to sync push subscription:", error);
      }
    }
  }

  onSubscriptionChange(isSubscribed) {
    console.log("Subscription changed:", isSubscribed);

    // Dispatch custom event
    const event = new CustomEvent("pushSubscriptionChange", {
      detail: { isSubscribed, subscription: this.subscription },
    });
    window.dispatchEvent(event);

    // Update UI
    this.updateUI();
  }

  urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Debug method untuk mengecek status
  async debugStatus() {
    const state = await this.getSubscriptionState();
    console.log("=== PUSH NOTIFICATION DEBUG INFO ===");
    console.log("Supported:", state.supported);
    console.log("Permission:", state.permission);
    console.log("Subscribed:", state.isSubscribed);
    console.log("Subscription:", state.subscription);
    console.log("Service Worker:", this.registration);
    console.log("====================================");
    return state;
  }

  // ========== BROADCAST NOTIFICATION ==========
  // Method untuk mengirim notifikasi ke semua user tentang cerita baru
  async broadcastNewStory(storyData) {
    try {
      console.log("Broadcasting new story notification:", storyData);

      // Di production, ini akan mengirim ke server untuk broadcast ke semua subscriber
      // Untuk sekarang kita simulasi dengan local notification yang lebih advance

      const notificationData = {
        title: `📖 Cerita Baru dari ${storyData.name}`,
        body: this.formatStoryDescription(storyData.description),
        image: storyData.photoUrl || "/icons/icon-512x512.png",
        tag: `broadcast-${storyData.id}`,
        data: {
          url: `/#/stories/${storyData.id}`,
          storyId: storyData.id,
          action: "view-detail",
        },
        actions: [
          {
            action: "view-detail",
            title: "👁️ Lihat Detail",
          },
          {
            action: "view-all",
            title: "📚 Semua Cerita",
          },
          {
            action: "dismiss",
            title: "❌ Tutup",
          },
        ],
      };

      await this.showBroadcastNotification(notificationData);
    } catch (error) {
      console.error("Error broadcasting story:", error);
      throw error;
    }
  }

  // Format description untuk notifikasi
  formatStoryDescription(description) {
    if (!description) return "Cerita baru telah dibagikan";

    const truncated =
      description.length > 100
        ? description.substring(0, 100) + "..."
        : description;

    return truncated;
  }

  // Tampilkan broadcast notification
  async showBroadcastNotification(notificationData) {
    if (!this.registration) {
      this.registration = await navigator.serviceWorker.ready;
    }

    const options = {
      body: notificationData.body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      image: notificationData.image,
      tag: notificationData.tag,
      data: notificationData.data,
      actions: notificationData.actions,
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      timestamp: Date.now(),
    };

    await this.registration.showNotification(notificationData.title, options);
  }

  // ========== REAL-TIME NOTIFICATION SIMULATION ==========
  // Simulasi notifikasi real-time dari server
  async simulateRealTimeNotification() {
    const stories = [
      {
        id: "realtime-" + Date.now(),
        name: "Petualang Handal",
        description:
          "Baru saja menyelesaikan pendakian ke puncak gunung dengan pemandangan yang luar biasa indah! ☀️🏔️",
        photoUrl: "/icons/icon-512x512.png",
        createdAt: new Date().toISOString(),
      },
      {
        id: "realtime-" + (Date.now() + 1),
        name: "Food Vlogger",
        description:
          "Mencoba resep tradisional keluarga yang diwariskan turun-temurun. Rasanya autentik dan penuh kenangan! 🍲❤️",
        photoUrl: "/icons/icon-512x512.png",
        createdAt: new Date().toISOString(),
      },
      {
        id: "realtime-" + (Date.now() + 2),
        name: "Travel Blogger",
        description:
          "Menemukan hidden gem di pedesaan dengan budaya lokal yang masih sangat terjaga. Pengalaman yang tak terlupakan! 🌄✨",
        photoUrl: "/icons/icon-512x512.png",
        createdAt: new Date().toISOString(),
      },
    ];

    const randomStory = stories[Math.floor(Math.random() * stories.length)];
    await this.broadcastNewStory(randomStory);
  }
}

// Export singleton instance
export const pushManager = new PushNotificationManager();

// Auto-initialize ketika DOM ready
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initializing push notification manager...");
    await pushManager.init();
  });
}

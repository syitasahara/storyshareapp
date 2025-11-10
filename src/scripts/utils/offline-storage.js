// Simple IndexedDB utility for offline storage
const DB_NAME = "ShareYourStoryDB";
const DB_VERSION = 5; // Increased version number
const STORE_NAME = "stories";

export class OfflineStorage {
  static db = null;

  static async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error("IndexedDB error:", request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log(
          "IndexedDB initialized successfully with version:",
          this.db.version
        );
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log(
          "Database upgrade needed. Old version:",
          event.oldVersion,
          "New version:",
          event.newVersion
        );

        // Handle database upgrades
        this.handleDatabaseUpgrade(db, event.oldVersion);
      };

      request.onblocked = () => {
        console.warn(
          "Database upgrade blocked. Please close other tabs using this app."
        );
      };
    });
  }

  static handleDatabaseUpgrade(db, oldVersion) {
    // Delete old object stores if they exist
    if (db.objectStoreNames.contains("old_stories")) {
      db.deleteObjectStore("old_stories");
    }

    // Create new object store if it doesn't exist
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      console.log("Creating new object store:", STORE_NAME);
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt", { unique: false });
      store.createIndex("hasLocation", "hasLocation", { unique: false });
      store.createIndex("isSynced", "isSynced", { unique: false });
      store.createIndex("lastUpdated", "lastUpdated", { unique: false });
    } else {
      // Update existing store if needed
      const transaction = event.currentTarget.transaction;
      const store = transaction.objectStore(STORE_NAME);

      // Add new indexes if they don't exist
      if (!store.indexNames.contains("lastUpdated")) {
        store.createIndex("lastUpdated", "lastUpdated", { unique: false });
      }
    }
  }

  static async clearAndRecreate() {
    if (this.db) {
      this.db.close();
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);

      request.onsuccess = () => {
        console.log("Database deleted successfully");
        this.db = null;
        this.init().then(resolve).catch(reject);
      };

      request.onerror = () => {
        console.error("Error deleting database:", request.error);
        reject(request.error);
      };
    });
  }

  static async saveStories(stories) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      // Clear existing stories first to avoid duplicates
      store.clear();

      stories.forEach((story) => {
        // Add metadata for offline storage
        const offlineStory = {
          ...story,
          hasLocation: !!(story.lat && story.lon),
          isSynced: true, // Stories from API are already synced
          lastUpdated: new Date().toISOString(),
        };
        store.put(offlineStory);
      });

      transaction.oncomplete = () => {
        console.log(`Saved ${stories.length} stories to offline storage`);
        resolve();
      };

      transaction.onerror = () => {
        console.error("Transaction error:", transaction.error);
        reject(transaction.error);
      };
    });
  }

  static async getStories(filters = {}) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let stories = request.result;

        // Apply filters
        if (filters.unsynced) {
          stories = stories.filter((story) => !story.isSynced);
        }

        if (filters.withLocation) {
          stories = stories.filter((story) => story.hasLocation);
        }

        if (filters.search) {
          const term = filters.search.toLowerCase();
          stories = stories.filter(
            (story) =>
              story.name?.toLowerCase().includes(term) ||
              story.description?.toLowerCase().includes(term)
          );
        }

        // Sort by creation date (newest first)
        stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        resolve(stories);
      };

      request.onerror = () => {
        console.error("Get stories error:", request.error);
        reject(request.error);
      };
    });
  }

  static async saveStory(storyData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const story = {
        ...storyData,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        hasLocation: !!(storyData.lat && storyData.lon),
        isSynced: false, // Mark as unsynced
        offline: true,
        lastUpdated: new Date().toISOString(),
      };

      const request = store.add(story);

      request.onsuccess = () => {
        console.log("Story saved for offline sync:", story.id);
        resolve(story.id);
      };

      request.onerror = () => {
        console.error("Save story error:", request.error);
        reject(request.error);
      };
    });
  }

  static async markStoryAsSynced(storyId) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const getRequest = store.get(storyId);

      getRequest.onsuccess = () => {
        const story = getRequest.result;
        if (story) {
          story.isSynced = true;
          story.offline = false;
          story.lastUpdated = new Date().toISOString();

          const updateRequest = store.put(story);

          updateRequest.onsuccess = () => {
            console.log("Story marked as synced:", storyId);
            resolve();
          };

          updateRequest.onerror = () => {
            console.error("Update story error:", updateRequest.error);
            reject(updateRequest.error);
          };
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => {
        console.error("Get story error:", getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  static async getUnsyncedStories() {
    return this.getStories({ unsynced: true });
  }

  static async getStoriesWithLocation() {
    return this.getStories({ withLocation: true });
  }

  static async clearAllData() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log("All offline data cleared");
        resolve();
      };

      request.onerror = () => {
        console.error("Clear data error:", request.error);
        reject(request.error);
      };
    });
  }

  static async getStorageStats() {
    try {
      if (!this.db) await this.init();

      const stories = await this.getStories();
      const storiesWithLocation = stories.filter(
        (story) => story.hasLocation
      ).length;
      const unsyncedStories = stories.filter((story) => !story.isSynced).length;

      return {
        totalStories: stories.length,
        storiesWithLocation,
        unsyncedStories,
        lastUpdated:
          stories.length > 0
            ? new Date(
                Math.max(
                  ...stories.map((s) => new Date(s.lastUpdated || s.createdAt))
                )
              )
            : null,
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {
        totalStories: 0,
        storiesWithLocation: 0,
        unsyncedStories: 0,
        lastUpdated: null,
      };
    }
  }

  static async searchStories(query) {
    return this.getStories({ search: query });
  }

  // Utility method to check if IndexedDB is supported
  static isSupported() {
    return "indexedDB" in window;
  }

  // Method to handle database version conflicts
  static async handleVersionError() {
    console.warn("Database version conflict detected. Recreating database...");
    return this.clearAndRecreate();
  }
}

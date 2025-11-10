const DB_NAME = 'ShareYourStoryDB';
const DB_VERSION = 6; // Increased version for new features
const STORE_STORIES = 'stories';
const STORE_OUTBOX = 'outbox';
const STORE_SETTINGS = 'settings';
const STORE_DRAFTS = 'drafts';

export class StoryDB {
    static async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('IndexedDB open error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                console.log('IndexedDB opened successfully');
                const db = request.result;
                
                // Handle database version change
                db.onversionchange = () => {
                    db.close();
                    console.log('Database is outdated, please reload the page.');
                };
                
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                console.log('Database upgrade needed from version', event.oldVersion, 'to', DB_VERSION);

                // Create/upgrade stories store dengan indexes lengkap
                if (!db.objectStoreNames.contains(STORE_STORIES)) {
                    console.log('Creating stories store');
                    const store = db.createObjectStore(STORE_STORIES, { keyPath: 'id' });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('description', 'description', { unique: false });
                    store.createIndex('isSynced', 'isSynced', { unique: false });
                    store.createIndex('hasLocation', 'hasLocation', { unique: false });
                    store.createIndex('lastUpdated', 'lastUpdated', { unique: false });
                    store.createIndex('offlineId', 'offlineId', { unique: true });
                } else {
                    // Update existing store
                    const transaction = event.currentTarget.transaction;
                    const store = transaction.objectStore(STORE_STORIES);
                    
                    // Add new indexes if they don't exist
                    if (!store.indexNames.contains('offlineId')) {
                        store.createIndex('offlineId', 'offlineId', { unique: true });
                    }
                }

                // Create/upgrade outbox store untuk offline submissions
                if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
                    console.log('Creating outbox store');
                    const outboxStore = db.createObjectStore(STORE_OUTBOX, { 
                        keyPath: 'id',
                        autoIncrement: true 
                    });
                    outboxStore.createIndex('createdAt', 'createdAt', { unique: false });
                    outboxStore.createIndex('status', 'status', { unique: false });
                    outboxStore.createIndex('retryCount', 'retryCount', { unique: false });
                    outboxStore.createIndex('type', 'type', { unique: false });
                }

                // Create settings store
                if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
                    console.log('Creating settings store');
                    const settingsStore = db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
                }

                // Create drafts store
                if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
                    console.log('Creating drafts store');
                    const draftsStore = db.createObjectStore(STORE_DRAFTS, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    draftsStore.createIndex('createdAt', 'createdAt', { unique: false });
                    draftsStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                    draftsStore.createIndex('title', 'title', { unique: false });
                }
            };

            request.onblocked = () => {
                console.warn('Database upgrade blocked. Please close other tabs using this app.');
                reject(new Error('Database upgrade blocked'));
            };
        });
    }

    // ========== BASIC CRUD OPERATIONS ========== //

    static async addStory(story) {
        try {
            const db = await this.init();
            return new Promise((resolve, reject) => {
                const tx = db.transaction([STORE_STORIES], 'readwrite');
                const store = tx.objectStore(STORE_STORIES);
                
                // Add metadata
                const storyWithMeta = {
                    ...story,
                    lastUpdated: new Date().toISOString(),
                    isSynced: story.isSynced || false,
                    hasLocation: !!(story.lat && story.lon),
                    offlineId: story.offlineId || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                };
                
                const request = store.put(storyWithMeta);
                
                request.onsuccess = () => {
                    console.log('Story added to IndexedDB:', storyWithMeta.id || storyWithMeta.offlineId);
                    resolve(request.result);
                };
                
                request.onerror = (e) => {
                    console.error('Add story error:', e);
                    reject(new Error('Failed to add story to database'));
                };
            });
        } catch (error) {
            console.error('Database operation failed:', error);
            throw error;
        }
    }

    static async getStory(id) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_STORIES], 'readonly');
            const request = tx.objectStore(STORE_STORIES).get(id);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => {
                console.error('Get story error:', e);
                reject(new Error('Failed to retrieve story'));
            };
        });
    }

    static async getAllStories() {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_STORIES], 'readonly');
            const request = tx.objectStore(STORE_STORIES).getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => {
                console.error('Get all stories error:', e);
                reject(new Error('Failed to retrieve stories'));
            };
        });
    }

    static async deleteStory(id) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_STORIES], 'readwrite');
            const request = tx.objectStore(STORE_STORIES).delete(id);
            
            request.onsuccess = () => {
                console.log('Story deleted from IndexedDB:', id);
                resolve(true);
            };
            
            request.onerror = (e) => {
                console.error('Delete story error:', e);
                reject(new Error('Failed to delete story'));
            };
        });
    }

    // ========== SKILLED FEATURES: SEARCH, FILTER, SORT ========== //

    static async searchStories(query) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_STORIES], 'readonly');
            const store = tx.objectStore(STORE_STORIES);
            const request = store.getAll();

            request.onsuccess = () => {
                const stories = request.result;
                const searchLower = query.toLowerCase();
                
                const filtered = stories.filter(story => 
                    story.name?.toLowerCase().includes(searchLower) ||
                    story.description?.toLowerCase().includes(searchLower)
                );
                
                resolve(filtered);
            };
            request.onerror = (e) => {
                console.error('Search stories error:', e);
                reject(new Error('Failed to search stories'));
            };
        });
    }

    static async filterStories(filters = {}) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_STORIES], 'readonly');
            const store = tx.objectStore(STORE_STORIES);
            const request = store.getAll();

            request.onsuccess = () => {
                let stories = request.result;

                // Apply filters
                if (filters.isSynced !== undefined) {
                    stories = stories.filter(story => story.isSynced === filters.isSynced);
                }

                if (filters.hasLocation !== undefined) {
                    stories = stories.filter(story => story.hasLocation === filters.hasLocation);
                }

                if (filters.offlineOnly) {
                    stories = stories.filter(story => story.offlineId);
                }

                if (filters.dateRange) {
                    const { start, end } = filters.dateRange;
                    stories = stories.filter(story => {
                        const storyDate = new Date(story.createdAt);
                        return (!start || storyDate >= new Date(start)) && 
                               (!end || storyDate <= new Date(end));
                    });
                }

                resolve(stories);
            };
            request.onerror = (e) => {
                console.error('Filter stories error:', e);
                reject(new Error('Failed to filter stories'));
            };
        });
    }

    static async sortStories(sortBy = 'createdAt', sortOrder = 'desc') {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_STORIES], 'readonly');
            const store = tx.objectStore(STORE_STORIES);
            const request = store.getAll();

            request.onsuccess = () => {
                let stories = request.result;

                stories.sort((a, b) => {
                    let aVal = a[sortBy];
                    let bVal = b[sortBy];

                    // Handle date sorting
                    if (sortBy.includes('At')) {
                        aVal = new Date(aVal).getTime();
                        bVal = new Date(bVal).getTime();
                    }

                    // Handle string sorting
                    if (typeof aVal === 'string') {
                        aVal = aVal.toLowerCase();
                        bVal = bVal.toLowerCase();
                    }

                    if (sortOrder === 'asc') {
                        return aVal > bVal ? 1 : -1;
                    } else {
                        return aVal < bVal ? 1 : -1;
                    }
                });

                resolve(stories);
            };
            request.onerror = (e) => {
                console.error('Sort stories error:', e);
                reject(new Error('Failed to sort stories'));
            };
        });
    }

    // ========== ADVANCED FEATURES: OFFLINE SYNC ========== //

    static async getUnsyncedStories() {
        return this.filterStories({ isSynced: false });
    }

    static async markStoryAsSynced(offlineId, serverId) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_STORIES], 'readwrite');
            const store = tx.objectStore(STORE_STORIES);
            
            // Cari story berdasarkan offlineId
            const index = store.index('offlineId');
            const request = index.get(offlineId);
            
            request.onsuccess = () => {
                const story = request.result;
                if (story) {
                    story.isSynced = true;
                    story.serverId = serverId;
                    story.lastUpdated = new Date().toISOString();
                    
                    const updateRequest = store.put(story);
                    updateRequest.onsuccess = () => {
                        console.log('Story marked as synced:', offlineId, '->', serverId);
                        resolve(story);
                    };
                    updateRequest.onerror = (e) => {
                        console.error('Update story error:', e);
                        reject(new Error('Failed to update story'));
                    };
                } else {
                    reject(new Error('Story not found with offlineId: ' + offlineId));
                }
            };
            request.onerror = (e) => {
                console.error('Get story for sync error:', e);
                reject(new Error('Failed to retrieve story for sync'));
            };
        });
    }

    static async syncWithAPI(apiStories) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_STORIES], 'readwrite');
            const store = tx.objectStore(STORE_STORIES);

            // Get all current stories
            const request = store.getAll();
            request.onsuccess = async () => {
                const currentStories = request.result;
                const currentIds = new Set(currentStories.map(s => s.id));
                const apiIds = new Set(apiStories.map(s => s.id));

                try {
                    let added = 0;
                    let updated = 0;

                    // Add or update stories from API
                    for (const apiStory of apiStories) {
                        const existingStory = currentStories.find(s => s.id === apiStory.id);
                        
                        if (existingStory) {
                            // Update existing story
                            const updatedStory = {
                                ...existingStory,
                                ...apiStory,
                                isSynced: true,
                                lastUpdated: new Date().toISOString()
                            };
                            await store.put(updatedStory);
                            updated++;
                        } else {
                            // Add new story
                            const newStory = {
                                ...apiStory,
                                isSynced: true,
                                lastUpdated: new Date().toISOString(),
                                hasLocation: !!(apiStory.lat && apiStory.lon)
                            };
                            await store.put(newStory);
                            added++;
                        }
                    }

                    // Remove stories not in API (except unsynced local stories)
                    let removed = 0;
                    for (const currentStory of currentStories) {
                        if (!apiIds.has(currentStory.id) && currentStory.isSynced) {
                            await store.delete(currentStory.id);
                            removed++;
                        }
                    }

                    resolve({ added, updated, removed });
                } catch (error) {
                    reject(error);
                }
            };
            request.onerror = (e) => {
                console.error('Sync with API error:', e);
                reject(new Error('Failed to sync with API'));
            };
        });
    }

    // ========== OFFLINE STORY CREATION ========== //

    static async createOfflineStory(storyData) {
        try {
            const offlineStory = {
                ...storyData,
                id: `offline_${Date.now()}`,
                offlineId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
                isSynced: false,
                hasLocation: !!(storyData.lat && storyData.lon),
                lastUpdated: new Date().toISOString()
            };

            // Simpan ke stories store
            await this.addStory(offlineStory);

            // Juga simpan ke outbox untuk background sync
            await this.addToOutbox({
                type: 'story',
                data: offlineStory,
                createdAt: new Date().toISOString(),
                status: 'pending',
                retryCount: 0
            });

            console.log('Offline story created:', offlineStory.offlineId);
            return offlineStory;

        } catch (error) {
            console.error('Failed to create offline story:', error);
            throw error;
        }
    }

    // ========== OUTBOX MANAGEMENT ========== //

    static async addToOutbox(item) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_OUTBOX], 'readwrite');
            const store = tx.objectStore(STORE_OUTBOX);
            
            const outboxItem = {
                ...item,
                createdAt: item.createdAt || new Date().toISOString(),
                status: item.status || 'pending',
                retryCount: item.retryCount || 0,
                lastRetry: item.lastRetry || null
            };
            
            const request = store.add(outboxItem);
            
            request.onsuccess = () => {
                console.log('Added to outbox:', request.result);
                resolve(request.result);
            };
            
            request.onerror = (e) => {
                console.error('Add to outbox error:', e);
                reject(new Error('Failed to add to outbox'));
            };
        });
    }

    static async getOutboxItems(status = null) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_OUTBOX], 'readonly');
            const store = tx.objectStore(STORE_OUTBOX);
            const request = store.getAll();

            request.onsuccess = () => {
                let items = request.result;
                
                if (status) {
                    items = items.filter(item => item.status === status);
                }
                
                // Sort by creation date (oldest first for retry)
                items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                
                resolve(items);
            };
            
            request.onerror = (e) => {
                console.error('Get outbox items error:', e);
                reject(new Error('Failed to get outbox items'));
            };
        });
    }

    static async updateOutboxItem(id, updates) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_OUTBOX], 'readwrite');
            const store = tx.objectStore(STORE_OUTBOX);
            
            // Get current item first
            const getRequest = store.get(id);
            
            getRequest.onsuccess = () => {
                const item = getRequest.result;
                if (!item) {
                    reject(new Error('Outbox item not found'));
                    return;
                }
                
                const updatedItem = {
                    ...item,
                    ...updates,
                    lastUpdated: new Date().toISOString()
                };
                
                const updateRequest = store.put(updatedItem);
                
                updateRequest.onsuccess = () => resolve(updatedItem);
                updateRequest.onerror = (e) => {
                    console.error('Update outbox item error:', e);
                    reject(new Error('Failed to update outbox item'));
                };
            };
            
            getRequest.onerror = (e) => {
                console.error('Get outbox item for update error:', e);
                reject(new Error('Failed to retrieve outbox item'));
            };
        });
    }

    static async removeFromOutbox(id) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_OUTBOX], 'readwrite');
            const request = tx.objectStore(STORE_OUTBOX).delete(id);
            
            request.onsuccess = () => {
                console.log('Removed from outbox:', id);
                resolve(true);
            };
            
            request.onerror = (e) => {
                console.error('Remove from outbox error:', e);
                reject(new Error('Failed to remove from outbox'));
            };
        });
    }

    // ========== DRAFTS MANAGEMENT ========== //

    static async saveDraft(draftData) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_DRAFTS], 'readwrite');
            const store = tx.objectStore(STORE_DRAFTS);
            
            const draft = {
                ...draftData,
                createdAt: draftData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            const request = store.put(draft);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = (e) => {
                console.error('Save draft error:', e);
                reject(new Error('Failed to save draft'));
            };
        });
    }

    static async getDrafts() {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_DRAFTS], 'readonly');
            const request = tx.objectStore(STORE_DRAFTS).getAll();
            
            request.onsuccess = () => {
                const drafts = request.result;
                // Sort by update date (newest first)
                drafts.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                resolve(drafts);
            };
            
            request.onerror = (e) => {
                console.error('Get drafts error:', e);
                reject(new Error('Failed to get drafts'));
            };
        });
    }

    static async deleteDraft(id) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_DRAFTS], 'readwrite');
            const request = tx.objectStore(STORE_DRAFTS).delete(id);
            
            request.onsuccess = () => resolve(true);
            request.onerror = (e) => {
                console.error('Delete draft error:', e);
                reject(new Error('Failed to delete draft'));
            };
        });
    }

    // ========== SETTINGS MANAGEMENT ========== //

    static async saveSetting(key, value) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_SETTINGS], 'readwrite');
            const request = tx.objectStore(STORE_SETTINGS).put({ key, value });
            
            request.onsuccess = () => resolve(true);
            request.onerror = (e) => {
                console.error('Save setting error:', e);
                reject(new Error('Failed to save setting'));
            };
        });
    }

    static async getSetting(key, defaultValue = null) {
        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_SETTINGS], 'readonly');
            const request = tx.objectStore(STORE_SETTINGS).get(key);
            
            request.onsuccess = () => resolve(request.result?.value || defaultValue);
            request.onerror = (e) => {
                console.error('Get setting error:', e);
                reject(new Error('Failed to get setting'));
            };
        });
    }

    // ========== UTILITY METHODS ========== //

    static async getDatabaseSize() {
        const db = await this.init();
        return new Promise((resolve) => {
            const tx = db.transaction([
                STORE_STORIES, 
                STORE_OUTBOX, 
                STORE_SETTINGS, 
                STORE_DRAFTS
            ], 'readonly');
            
            const stores = [
                tx.objectStore(STORE_STORIES),
                tx.objectStore(STORE_OUTBOX),
                tx.objectStore(STORE_SETTINGS),
                tx.objectStore(STORE_DRAFTS)
            ];
            
            let totalCount = 0;
            let completed = 0;
            
            stores.forEach(store => {
                const request = store.count();
                request.onsuccess = () => {
                    totalCount += request.result;
                    completed++;
                    
                    if (completed === stores.length) {
                        resolve({
                            totalItems: totalCount,
                            stories: stores[0].count,
                            outbox: stores[1].count,
                            settings: stores[2].count,
                            drafts: stores[3].count
                        });
                    }
                };
                
                request.onerror = () => {
                    completed++;
                    if (completed === stores.length) {
                        resolve({ totalItems: totalCount, error: true });
                    }
                };
            });
        });
    }

    static async clearDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(DB_NAME);
            
            request.onsuccess = () => {
                console.log('Database cleared successfully');
                resolve();
            };
            
            request.onerror = () => {
                console.error('Error clearing database:', request.error);
                reject(request.error);
            };
            
            request.onblocked = () => {
                console.warn('Database deletion blocked');
                reject(new Error('Database deletion blocked by other tabs'));
            };
        });
    }

    static async exportData() {
        const stories = await this.getAllStories();
        const outbox = await this.getOutboxItems();
        const drafts = await this.getDrafts();
        
        return {
            exportDate: new Date().toISOString(),
            stories,
            outbox,
            drafts,
            totalItems: stories.length + outbox.length + drafts.length
        };
    }

    static async importData(data) {
        if (!data.stories) return;

        const db = await this.init();
        return new Promise((resolve, reject) => {
            const tx = db.transaction([STORE_STORIES], 'readwrite');
            const store = tx.objectStore(STORE_STORIES);

            // Clear existing data
            store.clear();

            // Add imported stories
            let completed = 0;
            const total = data.stories.length;
            
            if (total === 0) {
                resolve({ imported: 0 });
                return;
            }

            for (const story of data.stories) {
                const request = store.add(story);
                request.onsuccess = () => {
                    completed++;
                    if (completed === total) {
                        resolve({ imported: completed });
                    }
                };
                request.onerror = () => reject(new Error('Failed to import story'));
            }
        });
    }

    // ========== SYNC MANAGEMENT ========== //

    static async processOfflineSync() {
        try {
            const unsyncedStories = await this.getUnsyncedStories();
            const pendingOutbox = await this.getOutboxItems('pending');
            
            console.log(`Starting sync: ${unsyncedStories.length} unsynced stories, ${pendingOutbox.length} pending outbox items`);
            
            let syncedCount = 0;
            let failedCount = 0;

            // Process unsynced stories
            for (const story of unsyncedStories) {
                try {
                    // Simulate API call - in real implementation, this would be actual fetch
                    await this.simulateApiCall(story);
                    
                    // Mark as synced
                    await this.markStoryAsSynced(story.offlineId, `server_${Date.now()}`);
                    syncedCount++;
                    
                } catch (error) {
                    console.error('Failed to sync story:', story.offlineId, error);
                    failedCount++;
                }
            }

            // Process outbox items
            for (const item of pendingOutbox) {
                try {
                    // Process different types of outbox items
                    if (item.type === 'story') {
                        await this.simulateApiCall(item.data);
                        await this.updateOutboxItem(item.id, { status: 'completed' });
                        syncedCount++;
                    }
                } catch (error) {
                    console.error('Failed to process outbox item:', item.id, error);
                    
                    // Update retry count
                    await this.updateOutboxItem(item.id, {
                        retryCount: item.retryCount + 1,
                        lastRetry: new Date().toISOString(),
                        status: item.retryCount >= 3 ? 'failed' : 'pending'
                    });
                    failedCount++;
                }
            }

            return {
                success: true,
                synced: syncedCount,
                failed: failedCount,
                total: syncedCount + failedCount
            };

        } catch (error) {
            console.error('Sync process failed:', error);
            return {
                success: false,
                error: error.message,
                synced: 0,
                failed: 0,
                total: 0
            };
        }
    }

    // Simulate API call for demo purposes
    static async simulateApiCall(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure
                if (Math.random() > 0.2) { // 80% success rate
                    resolve({ success: true, id: `server_${Date.now()}` });
                } else {
                    reject(new Error('Simulated API failure'));
                }
            }, 1000);
        });
    }
}

// Export singleton instance dengan error handling
export const storyDB = {
    async init() {
        try {
            return await StoryDB.init();
        } catch (error) {
            console.error('Failed to initialize database:', error);
            throw error;
        }
    },

    // Basic CRUD
    async addStory(story) { return StoryDB.addStory(story); },
    async getStory(id) { return StoryDB.getStory(id); },
    async getAllStories() { return StoryDB.getAllStories(); },
    async deleteStory(id) { return StoryDB.deleteStory(id); },

    // Skilled Features
    async searchStories(query) { return StoryDB.searchStories(query); },
    async filterStories(filters) { return StoryDB.filterStories(filters); },
    async sortStories(sortBy, sortOrder) { return StoryDB.sortStories(sortBy, sortOrder); },

    // Advanced Features
    async getUnsyncedStories() { return StoryDB.getUnsyncedStories(); },
    async markStoryAsSynced(offlineId, serverId) { return StoryDB.markStoryAsSynced(offlineId, serverId); },
    async syncWithAPI(apiStories) { return StoryDB.syncWithAPI(apiStories); },
    async createOfflineStory(storyData) { return StoryDB.createOfflineStory(storyData); },
    async processOfflineSync() { return StoryDB.processOfflineSync(); },

    // Outbox Management
    async addToOutbox(item) { return StoryDB.addToOutbox(item); },
    async getOutboxItems(status) { return StoryDB.getOutboxItems(status); },
    async updateOutboxItem(id, updates) { return StoryDB.updateOutboxItem(id, updates); },
    async removeFromOutbox(id) { return StoryDB.removeFromOutbox(id); },

    // Drafts Management
    async saveDraft(draftData) { return StoryDB.saveDraft(draftData); },
    async getDrafts() { return StoryDB.getDrafts(); },
    async deleteDraft(id) { return StoryDB.deleteDraft(id); },

    // Settings Management
    async saveSetting(key, value) { return StoryDB.saveSetting(key, value); },
    async getSetting(key, defaultValue) { return StoryDB.getSetting(key, defaultValue); },

    // Utility Methods
    async getDatabaseSize() { return StoryDB.getDatabaseSize(); },
    async clearDatabase() { return StoryDB.clearDatabase(); },
    async exportData() { return StoryDB.exportData(); },
    async importData(data) { return StoryDB.importData(data); }
};
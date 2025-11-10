import { storyDB } from '../utils/indexedDB.js';

export class StoryManager {
    constructor() {
        this.stories = [];
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';
    }

    async init() {
        await this.loadStories();
        this.setupEventListeners();
        this.render();
    }

    async loadStories() {
        try {
            this.stories = await storyDB.getAllStories();
            this.applyFiltersAndSort();
        } catch (error) {
            console.error('Error loading stories:', error);
            this.showMessage('Gagal memuat cerita', 'error');
        }
    }

    applyFiltersAndSort() {
        let filteredStories = [...this.stories];

        // Apply search filter
        if (this.searchQuery) {
            filteredStories = filteredStories.filter(story => 
                story.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                story.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }

        // Apply status filter
        switch (this.currentFilter) {
            case 'unsynced':
                filteredStories = filteredStories.filter(story => !story.isSynced);
                break;
            case 'withLocation':
                filteredStories = filteredStories.filter(story => story.hasLocation);
                break;
            case 'offline':
                filteredStories = filteredStories.filter(story => story.offlineId);
                break;
            case 'all':
            default:
                // No additional filtering
                break;
        }

        // Apply sorting
        switch (this.currentSort) {
            case 'newest':
                filteredStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                filteredStories.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'name':
                filteredStories.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
                break;
        }

        return filteredStories;
    }

    setupEventListeners() {
        // Delegated event listeners for dynamic content
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-delete-story')) {
                this.handleDeleteStory(e.target.dataset.id);
            }
            if (e.target.matches('.btn-edit-story')) {
                this.handleEditStory(e.target.dataset.id);
            }
            if (e.target.matches('.btn-sync-story')) {
                this.handleSyncStory(e.target.dataset.id);
            }
        });

        // Search functionality
        const searchInput = document.getElementById('story-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.render();
            });
        }

        // Filter functionality
        const filterSelect = document.getElementById('story-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.render();
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('story-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.render();
            });
        }

        // Create story form
        const createForm = document.getElementById('create-story-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateStory();
            });
        }

        // Sync all button
        const syncAllBtn = document.getElementById('sync-all-stories');
        if (syncAllBtn) {
            syncAllBtn.addEventListener('click', () => {
                this.handleSyncAll();
            });
        }

        // Export/Import buttons
        const exportBtn = document.getElementById('export-stories');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.handleExportStories();
            });
        }

        const importBtn = document.getElementById('import-stories');
        if (importBtn) {
            importBtn.addEventListener('change', (e) => {
                this.handleImportStories(e.target.files[0]);
            });
        }
    }

    async handleCreateStory() {
        const form = document.getElementById('create-story-form');
        const formData = new FormData(form);
        
        const storyData = {
            name: formData.get('name'),
            description: formData.get('description'),
            lat: formData.get('lat') || null,
            lon: formData.get('lon') || null,
            photo: formData.get('photo') || null
        };

        try {
            // Validate required fields
            if (!storyData.name || !storyData.description) {
                this.showMessage('Nama dan deskripsi harus diisi', 'error');
                return;
            }

            // Create story (offline first)
            const story = await storyDB.createOfflineStory(storyData);
            
            this.showMessage('Cerita berhasil dibuat dan disimpan offline', 'success');
            form.reset();
            
            // Reload stories
            await this.loadStories();
            this.render();

            // Try to sync if online
            if (navigator.onLine) {
                this.attemptSyncStory(story.offlineId);
            }

        } catch (error) {
            console.error('Error creating story:', error);
            this.showMessage('Gagal membuat cerita', 'error');
        }
    }

    async handleDeleteStory(storyId) {
        if (!confirm('Apakah Anda yakin ingin menghapus cerita ini?')) {
            return;
        }

        try {
            await storyDB.deleteStory(storyId);
            this.showMessage('Cerita berhasil dihapus', 'success');
            await this.loadStories();
            this.render();
        } catch (error) {
            console.error('Error deleting story:', error);
            this.showMessage('Gagal menghapus cerita', 'error');
        }
    }

    async handleEditStory(storyId) {
        try {
            const story = await storyDB.getStory(storyId);
            this.showEditForm(story);
        } catch (error) {
            console.error('Error loading story for edit:', error);
            this.showMessage('Gagal memuat cerita untuk diedit', 'error');
        }
    }

    async handleSyncStory(storyId) {
        try {
            const story = await storyDB.getStory(storyId);
            if (story && !story.isSynced) {
                await this.attemptSyncStory(story.offlineId || storyId);
            } else {
                this.showMessage('Cerita sudah tersinkronisasi', 'info');
            }
        } catch (error) {
            console.error('Error syncing story:', error);
            this.showMessage('Gagal menyinkronisasi cerita', 'error');
        }
    }

    async handleSyncAll() {
        if (!navigator.onLine) {
            this.showMessage('Tidak ada koneksi internet', 'error');
            return;
        }

        try {
            this.showMessage('Memulai sinkronisasi...', 'info');
            
            const result = await storyDB.processOfflineSync();
            
            if (result.success) {
                this.showMessage(
                    `Berhasil menyinkronisasi ${result.synced} cerita`, 
                    'success'
                );
            } else {
                this.showMessage(
                    `Sinkronisasi gagal: ${result.failed} cerita gagal`, 
                    'error'
                );
            }
            
            await this.loadStories();
            this.render();
            
        } catch (error) {
            console.error('Error syncing all stories:', error);
            this.showMessage('Gagal menyinkronisasi cerita', 'error');
        }
    }

    async attemptSyncStory(offlineId) {
        try {
            // Simulate API call - replace with actual API integration
            const apiResult = await storyDB.simulateApiCall({ offlineId });
            
            if (apiResult.success) {
                await storyDB.markStoryAsSynced(offlineId, apiResult.id);
                this.showMessage('Cerita berhasil disinkronisasi', 'success');
                await this.loadStories();
                this.render();
            } else {
                throw new Error('API call failed');
            }
        } catch (error) {
            console.error('Sync attempt failed:', error);
            // Story remains in unsynced state, will retry later
        }
    }

    async handleExportStories() {
        try {
            const data = await storyDB.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `stories-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Data berhasil diekspor', 'success');
        } catch (error) {
            console.error('Error exporting stories:', error);
            this.showMessage('Gagal mengekspor data', 'error');
        }
    }

    async handleImportStories(file) {
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.stories) {
                throw new Error('Format file tidak valid');
            }

            if (confirm(`Impor ${data.stories.length} cerita? Data lama akan diganti.`)) {
                await storyDB.importData(data);
                this.showMessage('Data berhasil diimpor', 'success');
                await this.loadStories();
                this.render();
            }
        } catch (error) {
            console.error('Error importing stories:', error);
            this.showMessage('Gagal mengimpor data', 'error');
        }
    }

    showEditForm(story) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Edit Cerita</h3>
                <form id="edit-story-form">
                    <input type="hidden" name="id" value="${story.id}">
                    <div class="form-group">
                        <label>Nama:</label>
                        <input type="text" name="name" value="${story.name || ''}" required>
                    </div>
                    <div class="form-group">
                        <label>Deskripsi:</label>
                        <textarea name="description" required>${story.description || ''}</textarea>
                    </div>
                    <div class="form-group">
                        <label>Latitude:</label>
                        <input type="number" step="any" name="lat" value="${story.lat || ''}">
                    </div>
                    <div class="form-group">
                        <label>Longitude:</label>
                        <input type="number" step="any" name="lon" value="${story.lon || ''}">
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                        <button type="button" class="btn btn-secondary" id="cancel-edit">Batal</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        modal.querySelector('#edit-story-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUpdateStory(e.target);
            modal.remove();
        });

        // Handle cancel
        modal.querySelector('#cancel-edit').addEventListener('click', () => {
            modal.remove();
        });
    }

    async handleUpdateStory(form) {
        const formData = new FormData(form);
        const storyId = formData.get('id');
        
        const updates = {
            name: formData.get('name'),
            description: formData.get('description'),
            lat: formData.get('lat') || null,
            lon: formData.get('lon') || null,
            lastUpdated: new Date().toISOString(),
            hasLocation: !!(formData.get('lat') && formData.get('lon'))
        };

        try {
            const existingStory = await storyDB.getStory(storyId);
            const updatedStory = { ...existingStory, ...updates };
            
            await storyDB.addStory(updatedStory);
            this.showMessage('Cerita berhasil diperbarui', 'success');
            await this.loadStories();
            this.render();
        } catch (error) {
            console.error('Error updating story:', error);
            this.showMessage('Gagal memperbarui cerita', 'error');
        }
    }

    render() {
        const container = document.getElementById('story-manager');
        if (!container) return;

        const filteredStories = this.applyFiltersAndSort();
        const stats = this.calculateStats();

        container.innerHTML = `
            <div class="story-manager-container">
                <div class="manager-header">
                    <h2>📖 Manajemen Cerita Offline</h2>
                    <div class="stats-overview">
                        <div class="stat-card">
                            <span class="stat-number">${stats.total}</span>
                            <span class="stat-label">Total Cerita</span>
                        </div>
                        <div class="stat-card ${stats.unsynced > 0 ? 'warning' : ''}">
                            <span class="stat-number">${stats.unsynced}</span>
                            <span class="stat-label">Belum Sync</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">${stats.withLocation}</span>
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
                                <option value="all" ${this.currentFilter === 'all' ? 'selected' : ''}>Semua Cerita</option>
                                <option value="unsynced" ${this.currentFilter === 'unsynced' ? 'selected' : ''}>Belum Sync</option>
                                <option value="withLocation" ${this.currentFilter === 'withLocation' ? 'selected' : ''}>Dengan Lokasi</option>
                                <option value="offline" ${this.currentFilter === 'offline' ? 'selected' : ''}>Dibuat Offline</option>
                            </select>
                            
                            <select id="story-sort">
                                <option value="newest" ${this.currentSort === 'newest' ? 'selected' : ''}>Terbaru</option>
                                <option value="oldest" ${this.currentSort === 'oldest' ? 'selected' : ''}>Terlama</option>
                                <option value="name" ${this.currentSort === 'name' ? 'selected' : ''}>Nama A-Z</option>
                            </select>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button class="btn btn-primary" id="sync-all-stories" 
                                ${!navigator.onLine ? 'disabled' : ''}>
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
                    <h3>📚 Daftar Cerita (${filteredStories.length})</h3>
                    
                    ${filteredStories.length === 0 ? `
                        <div class="empty-state">
                            <p>${this.searchQuery ? 'Tidak ada cerita yang sesuai dengan pencarian' : 'Belum ada cerita'}</p>
                            ${!this.searchQuery ? '<p>Mulailah dengan membuat cerita pertama Anda!</p>' : ''}
                        </div>
                    ` : `
                        <div class="stories-grid">
                            ${filteredStories.map(story => this.renderStoryCard(story)).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderStoryCard(story) {
        const syncStatus = story.isSynced ? 
            '<span class="status-badge synced">✅ Tersinkronisasi</span>' : 
            '<span class="status-badge unsynced">⏳ Menunggu Sync</span>';
        
        const locationInfo = story.hasLocation ? 
            `<div class="location-info">📍 Memiliki lokasi</div>` : 
            '<div class="location-info">🌐 Tanpa lokasi</div>';
        
        const offlineBadge = story.offlineId ? 
            '<span class="badge offline">📱 Dibuat Offline</span>' : '';

        return `
            <div class="story-card ${!story.isSynced ? 'unsynced' : ''}">
                <div class="story-header">
                    <h4>${story.name || 'Tanpa Judul'}</h4>
                    ${offlineBadge}
                </div>
                
                <div class="story-content">
                    <p class="story-description">${story.description || 'Tidak ada deskripsi'}</p>
                    
                    <div class="story-meta">
                        <div class="meta-item">
                            <strong>Dibuat:</strong> 
                            ${new Date(story.createdAt).toLocaleDateString('id-ID')}
                        </div>
                        ${locationInfo}
                        ${syncStatus}
                    </div>
                </div>
                
                <div class="story-actions">
                    ${!story.isSynced ? `
                        <button class="btn btn-sm btn-primary btn-sync-story" data-id="${story.id}">
                            🔄 Sync
                        </button>
                    ` : ''}
                    
                    <button class="btn btn-sm btn-secondary btn-edit-story" data-id="${story.id}">
                        ✏️ Edit
                    </button>
                    
                    <button class="btn btn-sm btn-danger btn-delete-story" data-id="${story.id}">
                        🗑️ Hapus
                    </button>
                </div>
            </div>
        `;
    }

    calculateStats() {
        return {
            total: this.stories.length,
            unsynced: this.stories.filter(s => !s.isSynced).length,
            withLocation: this.stories.filter(s => s.hasLocation).length,
            offline: this.stories.filter(s => s.offlineId).length
        };
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message-toast');
        existingMessages.forEach(msg => msg.remove());

        const messageEl = document.createElement('div');
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
}
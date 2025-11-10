import { storyApi } from '../data/api.js';
import { showFormattedDate, debounce } from '../utils/ui-helpers.js';

export default class StoryMapPage {
    constructor() {
        this.stories = [];
        this.filteredStories = [];
        this.map = null;
        this.markers = [];
        this.currentPopup = null;
    }

    async render() {
        try {
            const response = await storyApi.getStories(1, 50, true);
            this.stories = response.listStory ? response.listStory.filter(story => story.lat && story.lon) : [];
            this.filteredStories = this.stories;
        } catch (error) {
            console.error('Error loading stories for map:', error);
            this.stories = [];
            this.filteredStories = [];
        }

        return `
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
        `;
    }

    async afterRender() {
        this.loadCSS();
        await this.initializeMap();
        this.setupEventListeners();
        this.updateStoriesCount();
    }

    loadCSS() {
        if (!document.querySelector('link[href*="story-map.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/story-map.css';
            document.head.appendChild(link);
        }
    }

    async initializeMap() {
        try {
            const mapContainer = document.getElementById('story-map');
            
            // Initialize Leaflet map
            this.map = L.map('story-map').setView([-2.5489, 118.0149], 5); // Center on Indonesia
            
            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            // Add markers for each story
            this.filteredStories.forEach(story => {
                this.addMarker(story);
            });

            // Fit map to show all markers
            if (this.markers.length > 0) {
                const group = new L.featureGroup(this.markers);
                this.map.fitBounds(group.getBounds().pad(0.1));
            }

            // Remove loading message
            mapContainer.querySelector('.loading-message')?.remove();

        } catch (error) {
            console.error('Error initializing map:', error);
            const mapContainer = document.getElementById('story-map');
            mapContainer.innerHTML = `
                <div class="error-message">
                    <h3>Gagal Memuat Peta</h3>
                    <p>Pastikan koneksi internet Anda stabil dan coba refresh halaman.</p>
                    <button onclick="location.reload()" class="btn btn-primary">Coba Lagi</button>
                </div>
            `;
        }
    }

    addMarker(story) {
        const marker = L.marker([parseFloat(story.lat), parseFloat(story.lon)])
            .addTo(this.map)
            .bindPopup(this.createPopupContent(story));

        marker.storyId = story.id;

        marker.on('click', () => {
            this.highlightStory(story.id);
        });

        marker.on('popupopen', () => {
            this.currentPopup = marker;
            this.highlightStory(story.id);
        });

        this.markers.push(marker);
        return marker;
    }

    createPopupContent(story) {
        return `
            <div class="map-popup">
                <h3>${story.name}</h3>
                <p class="popup-date">${showFormattedDate(story.createdAt)}</p>
                <p class="popup-excerpt">${story.description.substring(0, 100)}...</p>
                <div class="popup-actions">
                    <a href="#/stories/${story.id}" class="btn btn-primary btn-small">Baca Selengkapnya</a>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const searchInput = document.getElementById('story-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.filterStories(e.target.value);
            }, 300));
        }

        const toggleBtn = document.querySelector('.btn-toggle-sidebar');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const sidebar = document.querySelector('.stories-sidebar');
                sidebar.classList.toggle('collapsed');
                toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
            });
        }

        this.attachStoryListListeners();
    }

    attachStoryListListeners() {
        const storyItems = document.querySelectorAll('.story-list-item');
        storyItems.forEach(item => {
            item.addEventListener('click', () => {
                const storyId = item.dataset.storyId;
                this.highlightStory(storyId);
            });

            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const storyId = item.dataset.storyId;
                    this.highlightStory(storyId);
                }
            });
        });
    }

    filterStories(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            this.filteredStories = this.stories;
        } else {
            this.filteredStories = this.stories.filter(story => 
                story.name.toLowerCase().includes(term) ||
                story.description.toLowerCase().includes(term)
            );
        }

        // Clear existing markers
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
        
        // Add filtered markers
        this.filteredStories.forEach(story => {
            this.addMarker(story);
        });

        // Update stories list
        const storiesList = document.querySelector('.stories-list');
        storiesList.innerHTML = this.getStoriesList();

        this.updateStoriesCount();
        this.attachStoryListListeners();

        // Fit map to filtered markers
        if (this.filteredStories.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    getStoriesList() {
        if (this.filteredStories.length === 0) {
            return `
                <div class="no-stories-message">
                    <p>📭</p>
                    <p>Tidak ada cerita yang sesuai dengan pencarian.</p>
                </div>
            `;
        }

        return this.filteredStories.map(story => `
            <article 
                class="story-list-item" 
                data-story-id="${story.id}"
                tabindex="0"
                role="listitem"
                aria-label="Cerita ${story.name}"
            >
                <div class="list-item-content">
                    <h3 class="story-title">${story.name}</h3>
                    <p class="story-date">${showFormattedDate(story.createdAt)}</p>
                    <p class="story-excerpt">${story.description.substring(0, 100)}...</p>
                </div>
                <button class="btn-view-on-map" aria-label="Tampilkan lokasi ${story.name} di peta" data-story-id="${story.id}">
                    📍
                </button>
            </article>
        `).join('');
    }

    updateStoriesCount() {
        const countElement = document.getElementById('stories-count');
        if (countElement) {
            countElement.textContent = `${this.filteredStories.length} cerita ditemukan`;
        }
    }

    highlightStory(storyId) {
        // Find the marker for this story
        const marker = this.markers.find(m => m.storyId === storyId);
        if (marker) {
            // Close any existing popup
            if (this.currentPopup) {
                this.currentPopup.closePopup();
            }
            
            // Open popup for this marker
            marker.openPopup();
            this.currentPopup = marker;
            
            // Pan to marker
            this.map.panTo(marker.getLatLng());
            
            // Highlight in sidebar
            const listItems = document.querySelectorAll('.story-list-item');
            listItems.forEach(item => {
                item.classList.remove('active');
                if (item.dataset.storyId === storyId) {
                    item.classList.add('active');
                    item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            });
        }
    }

    // Cleanup when leaving page
    destroy() {
        if (this.map) {
            this.map.remove();
        }
    }
}
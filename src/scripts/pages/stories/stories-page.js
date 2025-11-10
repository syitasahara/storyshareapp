import { storyApi } from '../../data/api.js';
import { showFormattedDate } from '../../utils/ui-helpers.js';

export default class StoriesPage {
    constructor() {
        this.stories = [];
        this.currentPage = 1;
        this.hasMore = true;
        this.withLocation = false;
    }

    async render() {
        try {
            // Load stories dari API
            const response = await storyApi.getStories(this.currentPage, 20, this.withLocation ? 1 : 0);
            this.stories = response.listStory || [];
            this.hasMore = (response.listStory || []).length === 20;
        } catch (error) {
            console.error('Error loading stories:', error);
            this.stories = [];
        }

        const isLoggedIn = !!localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        return `
            <section class="stories-page">
                <div class="container">
                    <div class="page-header">
                        <h1>Kumpulan Cerita</h1>
                        <div class="page-actions">
                            <button class="btn ${this.withLocation ? 'btn-primary' : 'btn-secondary'}" id="toggle-location">
                                ${this.withLocation ? '🔍 Dengan Lokasi' : '🌍 Semua Cerita'}
                            </button>
                            <a href="#/map" class="btn btn-primary">Lihat Peta</a>
                            ${
                                isLoggedIn
                                    ? `<span class="user-greeting">Halo, ${user.name}</span>
                                       <a href="#/create-story" class="btn btn-primary">Tulis Cerita</a>`
                                    : `<a href="#/login" class="btn btn-primary">Masuk untuk Menulis</a>`
                            }
                        </div>
                    </div>
                    
                    ${!isLoggedIn ? `
                        <div class="guest-notice">
                            <p>Anda sedang melihat cerita sebagai tamu. <a href="#/login">Masuk</a> untuk menulis cerita kamu!</p>
                        </div>
                    ` : ''}
                    
                    ${this.stories.length === 0 ? `
                        <div class="no-stories">
                            <p>📝 Belum ada cerita yang tersedia.</p>
                            ${!isLoggedIn ? `
                                <p><a href="#/login" class="auth-link">Masuk</a> atau <a href="#/register" class="auth-link">daftar</a> untuk melihat dan mulai berbagi cerita!</p>
                            ` : `
                                <p><a href="#/create-story" class="auth-link">Tulis cerita pertama Anda</a>!</p>
                            `}
                        </div>
                    ` : `
                        <div class="stories-grid" role="list" aria-label="Daftar cerita">
                            ${this.stories.map((story, index) => `
                                <article class="story-card" data-id="${story.id}" role="listitem" tabindex="0">
                                    ${story.photoUrl ? `
                                        <div class="story-image">
                                            <img src="${story.photoUrl}" alt="Foto cerita ${story.name}" loading="lazy">
                                            ${story.lat && story.lon ? '<span class="location-badge">📍</span>' : ''}
                                        </div>
                                    ` : ''}
                                    <div class="story-header">
                                        <h3 class="story-title">${story.name}</h3>
                                        <span class="story-date">${showFormattedDate(story.createdAt)}</span>
                                    </div>
                                    <p class="story-excerpt">${story.description.substring(0, 150)}...</p>
                                    <div class="story-footer">
                                        <span class="story-author">Oleh: ${story.name}</span>
                                        <button class="btn-read-more" aria-label="Baca cerita ${story.name} selengkapnya">
                                            Baca Selengkapnya
                                        </button>
                                    </div>
                                </article>
                            `).join('')}
                        </div>
                    `}
                    
                    ${this.hasMore ? `
                        <div class="load-more-container">
                            <button id="load-more" class="btn btn-outline">Muat Lebih Banyak</button>
                        </div>
                    ` : ''}
                </div>
            </section>
        `;
    }

    async afterRender() {
        this.loadCSS();
        this.setupEventListeners();
    }

    loadCSS() {
        if (!document.querySelector('link[href*="stories.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/styles/stories.css';
            document.head.appendChild(link);
        }
    }

    setupEventListeners() {
        this.setupStoryCards();
        this.setupFilterToggle();
        this.setupLoadMore();
    }

    setupFilterToggle() {
        const toggleBtn = document.getElementById('toggle-location');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.withLocation = !this.withLocation;
                this.currentPage = 1;
                this.reloadStories();
            });
        }
    }

    setupLoadMore() {
        const loadMoreBtn = document.getElementById('load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreStories());
        }
    }

    setupStoryCards() {
        const storyCards = document.querySelectorAll('.story-card');
        storyCards.forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn-read-more') || e.currentTarget === card) {
                    e.preventDefault();
                    const storyId = card.dataset.id;
                    window.location.hash = `/stories/${storyId}`;
                }
            });

            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const storyId = card.dataset.id;
                    window.location.hash = `/stories/${storyId}`;
                }
            });
        });
    }

    async reloadStories() {
        try {
            const response = await storyApi.getStories(1, 20, this.withLocation ? 1 : 0);
            this.stories = response.listStory || [];
            this.hasMore = (response.listStory || []).length === 20;
            this.currentPage = 1;
            
            // Re-render komponen
            const app = document.getElementById('main-content');
            app.innerHTML = await this.render();
            await this.afterRender();
        } catch (error) {
            console.error('Error reloading stories:', error);
        }
    }

    async loadMoreStories() {
        this.currentPage++;

        try {
            const loadMoreBtn = document.getElementById('load-more');
            const originalText = loadMoreBtn.textContent;

            loadMoreBtn.textContent = 'Memuat...';
            loadMoreBtn.disabled = true;

            const response = await storyApi.getStories(this.currentPage, 20, this.withLocation ? 1 : 0);
            const newStories = response.listStory || [];

            this.stories = [...this.stories, ...newStories];
            this.hasMore = newStories.length === 20;

            const storiesGrid = document.querySelector('.stories-grid');
            newStories.forEach(story => {
                const storyElement = this.createStoryElement(story);
                storiesGrid.appendChild(storyElement);
            });

            this.setupStoryCards();

            if (!this.hasMore) {
                loadMoreBtn.remove();
            } else {
                loadMoreBtn.textContent = originalText;
                loadMoreBtn.disabled = false;
            }
        } catch (error) {
            console.error('Error loading more stories:', error);
            const loadMoreBtn = document.getElementById('load-more');
            loadMoreBtn.textContent = 'Coba Lagi';
            loadMoreBtn.disabled = false;
        }
    }

    createStoryElement(story) {
        const element = document.createElement('article');
        element.className = 'story-card';
        element.dataset.id = story.id;
        element.setAttribute('role', 'listitem');
        element.tabIndex = 0;

        element.innerHTML = `
            ${story.photoUrl ? `
                <div class="story-image">
                    <img src="${story.photoUrl}" alt="Foto cerita ${story.name}" loading="lazy">
                    ${story.lat && story.lon ? '<span class="location-badge">📍</span>' : ''}
                </div>
            ` : ''}
            <div class="story-header">
                <h3 class="story-title">${story.name}</h3>
                <span class="story-date">${showFormattedDate(story.createdAt)}</span>
            </div>
            <p class="story-excerpt">${story.description.substring(0, 150)}...</p>
            <div class="story-footer">
                <span class="story-author">Oleh: ${story.name}</span>
                <button class="btn-read-more" aria-label="Baca cerita ${story.name} selengkapnya">
                    Baca Selengkapnya
                </button>
            </div>
        `;

        return element;
    }
}
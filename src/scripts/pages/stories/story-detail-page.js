import { storyApi } from "../../data/api.js";
import { showFormattedDate } from "../../utils/ui-helpers.js";

export default class StoryDetailPage {
  constructor() {
    this.story = null;
    this.storyId = null;
  }

  // Method untuk set story ID dari route parameters
  setStoryId(id) {
    this.storyId = id;
    console.log("Story ID set to:", this.storyId);
  }

  async render() {
    // Gunakan storyId yang sudah diset atau ambil dari URL
    const storyId = this.storyId || this.getStoryIdFromUrl();
    console.log("Rendering story detail for ID:", storyId);

    if (!storyId) {
      return this.getErrorPage("ID cerita tidak valid");
    }

    try {
      const response = await storyApi.getStoryDetail(storyId);
      this.story = response.story;

      if (!this.story) {
        throw new Error("Cerita tidak ditemukan");
      }

      console.log("Story loaded successfully:", this.story);
    } catch (error) {
      console.error("Error loading story detail:", error);
      return this.getErrorPage(
        error.message || "Cerita tidak ditemukan atau telah dihapus."
      );
    }

    return `
            <section class="story-detail-page">
                <div class="container">
                    <article class="story-detail">
                        <header class="story-detail-header">
                            <button class="btn btn-secondary" id="back-btn">
                                ← Kembali
                            </button>
                            <h1 class="story-detail-title">${this.escapeHtml(
                              this.story.name
                            )}</h1>
                            <div class="story-detail-meta">
                                <span class="story-author">Oleh: ${this.escapeHtml(
                                  this.story.name
                                )}</span>
                                <span class="story-date">${showFormattedDate(
                                  this.story.createdAt
                                )}</span>
                            </div>
                        </header>
                        
                        ${
                          this.story.photoUrl
                            ? `
                            <figure class="story-detail-image">
                                <img src="${
                                  this.story.photoUrl
                                }" alt="Ilustrasi cerita ${this.escapeHtml(
                                this.story.name
                              )}" loading="lazy">
                                <figcaption>Ilustrasi cerita</figcaption>
                            </figure>
                        `
                            : ""
                        }
                        
                        <div class="story-detail-content">
                            ${this.formatStoryContent(this.story.description)}
                        </div>
                        
                        ${
                          this.story.lat && this.story.lon
                            ? `
                            <div class="story-location">
                                <h3>📍 Lokasi Cerita</h3>
                                <p>Latitude: ${this.story.lat}, Longitude: ${this.story.lon}</p>
                                <div class="location-actions">
                                    <a href="#/map?story=${this.story.id}" class="btn btn-outline">Lihat di Peta</a>
                                    <button class="btn btn-secondary" id="copy-coordinates">
                                        Salin Koordinat
                                    </button>
                                </div>
                            </div>
                        `
                            : ""
                        }
                        
                        <footer class="story-detail-actions">
                            <div class="action-buttons">
                                <button class="btn-like" aria-label="Suka cerita ini">
                                    <span class="like-icon">❤️</span>
                                    <span>Suka</span>
                                </button>
                                <button class="btn-share" aria-label="Bagikan cerita ini">
                                    <span class="share-icon">🔗</span>
                                    <span>Bagikan</span>
                                </button>
                            </div>
                        </footer>
                    </article>
                </div>
            </section>
        `;
  }

  getStoryIdFromUrl() {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith("/stories/")) {
      const segments = hash.split("/");
      return segments[2];
    }
    return null;
  }

  escapeHtml(unsafe) {
    if (!unsafe) return "";
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  formatStoryContent(description) {
    if (!description) return "<p>Tidak ada deskripsi</p>";

    const escapedDescription = this.escapeHtml(description);

    return escapedDescription
      .split("\n")
      .filter((paragraph) => paragraph.trim())
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join("");
  }

  async afterRender() {
    this.loadCSS();
    this.setupEventListeners();
  }

  loadCSS() {
    if (!document.querySelector('link[href*="story-detail.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/styles/story-detail.css";
      document.head.appendChild(link);
    }
  }

  setupEventListeners() {
    this.setupBackButton();
    this.setupLikeButton();
    this.setupShareButton();
    this.setupCopyCoordinates();
  }

  setupBackButton() {
    const backBtn = document.getElementById("back-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.history.back();
      });

      backBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          backBtn.click();
        }
      });
    }
  }

  setupLikeButton() {
    const likeBtn = document.querySelector(".btn-like");
    if (likeBtn) {
      likeBtn.addEventListener("click", () => {
        likeBtn.classList.toggle("liked");
        likeBtn.setAttribute(
          "aria-pressed",
          likeBtn.classList.contains("liked")
        );

        if (likeBtn.classList.contains("liked")) {
          likeBtn.innerHTML =
            '<span class="like-icon">❤️</span><span>Disukai</span>';
          this.showToast("Cerita ditambahkan ke favorit", "success");
        } else {
          likeBtn.innerHTML =
            '<span class="like-icon">❤️</span><span>Suka</span>';
          this.showToast("Cerita dihapus dari favorit", "info");
        }
      });
    }
  }

  setupShareButton() {
    const shareBtn = document.querySelector(".btn-share");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        try {
          if (navigator.share) {
            await navigator.share({
              title: this.story.name,
              text: this.story.description.substring(0, 100),
              url: window.location.href,
            });
            this.showToast("Cerita berhasil dibagikan", "success");
          } else {
            await navigator.clipboard.writeText(window.location.href);
            this.showToast("Link cerita berhasil disalin!", "success");
          }
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Error sharing:", error);
            this.showToast("Gagal membagikan cerita", "error");
          }
        }
      });
    }
  }

  setupCopyCoordinates() {
    const copyBtn = document.getElementById("copy-coordinates");
    if (copyBtn && this.story.lat && this.story.lon) {
      copyBtn.addEventListener("click", async () => {
        const coordinates = `${this.story.lat}, ${this.story.lon}`;
        try {
          await navigator.clipboard.writeText(coordinates);
          this.showToast("Koordinat berhasil disalin!", "success");
        } catch (error) {
          console.error("Error copying coordinates:", error);
          this.showToast("Gagal menyalin koordinat", "error");
        }
      });
    }
  }

  showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast-message ${type}`;
    toast.textContent = message;
    toast.setAttribute("role", "alert");

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  }

  getErrorPage(message) {
    return `
            <section class="container error-page">
                <div class="error-content">
                    <h1>Cerita Tidak Ditemukan</h1>
                    <p>${message}</p>
                    <div class="error-actions">
                        <a href="#/stories" class="btn btn-primary">Kembali ke Daftar Cerita</a>
                        <a href="#/" class="btn btn-secondary">Kembali ke Beranda</a>
                    </div>
                </div>
            </section>
        `;
  }
}

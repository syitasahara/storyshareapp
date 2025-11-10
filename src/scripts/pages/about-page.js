export default class AboutPage {
  async render() {
    return `
            <section class="about-page">
                <div class="container">
                    <header class="about-hero">
                        <h1>Tentang ShareYourStory</h1>
                        <p>Platform untuk berbagi cerita inspiratif dan pengalaman hidup yang berharga</p>
                    </header>

                    <div class="about-content">
                        <div class="about-section">
                            <h2>Visi & Misi Kami</h2>
                            <p>Kami percaya bahwa setiap cerita memiliki kekuatan untuk mengubah perspektif, memberikan harapan, dan menciptakan koneksi antar manusia. Melalui platform ini, kami ingin menciptakan komunitas yang saling mendukung dengan berbagi pengalaman hidup yang berharga.</p>
                        </div>

                        <div class="values-section">
                            <h2>Nilai-Nilai Kami</h2>
                            <div class="values-grid">
                                <div class="value-card">
                                    <div class="value-icon">📖</div>
                                    <h3>Berbagi Cerita</h3>
                                    <p>Memberikan ruang aman untuk berbagi pengalaman pribadi tanpa takut dihakimi.</p>
                                </div>
                                <div class="value-card">
                                    <div class="value-icon">🤝</div>
                                    <h3>Membangun Komunitas</h3>
                                    <p>Menciptakan jaringan dukungan yang saling menguatkan dan menginspirasi.</p>
                                </div>
                                <div class="value-card">
                                    <div class="value-icon">💡</div>
                                    <h3>Memberi Inspirasi</h3>
                                    <p>Menginspirasi orang lain melalui kisah-kisah nyata yang penuh makna.</p>
                                </div>
                                <div class="value-card">
                                    <div class="value-icon">🔒</div>
                                    <h3>Privasi & Keamanan</h3>
                                    <p>Menjaga privasi dan keamanan data pengguna dengan standar tertinggi.</p>
                                </div>
                            </div>
                        </div>

                        <div class="features-section">
                            <h2>Fitur Unggulan</h2>
                            <div class="features-list">
                                <div class="feature-item">
                                    <h3>📝 Tulis Cerita</h3>
                                    <p>Bagikan pengalaman hidup Anda dengan mudah melalui editor yang user-friendly</p>
                                </div>
                                <div class="feature-item">
                                    <h3>🗺️ Peta Interaktif</h3>
                                    <p>Lihat cerita berdasarkan lokasi di peta digital yang menarik</p>
                                </div>
                                <div class="feature-item">
                                    <h3>📱 Akses Offline</h3>
                                    <p>Baca cerita favorit Anda bahkan tanpa koneksi internet</p>
                                </div>
                                <div class="feature-item">
                                    <h3>🔔 Notifikasi</h3>
                                    <p>Dapatkan pemberitahuan ketika ada cerita baru yang menarik</p>
                                </div>
                                <div class="feature-item">
                                    <h3>🌐 Progressive Web App</h3>
                                    <p>Nikmati pengalaman seperti aplikasi native di perangkat Anda</p>
                                </div>
                                <div class="feature-item">
                                    <h3>♿ Aksesibilitas</h3>
                                    <p>Dirancang untuk dapat diakses oleh semua pengguna</p>
                                </div>
                            </div>
                        </div>

                        <div class="tech-stack">
                            <h2>Teknologi yang Digunakan</h2>
                            <div class="tech-grid">
                                <div class="tech-item">
                                    <span class="tech-name">HTML5</span>
                                    <span class="tech-desc">Struktur semantik modern</span>
                                </div>
                                <div class="tech-item">
                                    <span class="tech-name">CSS3</span>
                                    <span class="tech-desc">Styling responsif dan modern</span>
                                </div>
                                <div class="tech-item">
                                    <span class="tech-name">JavaScript ES6+</span>
                                    <span class="tech-desc">Interaktivitas dan logika aplikasi</span>
                                </div>
                                <div class="tech-item">
                                    <span class="tech-name">Leaflet.js</span>
                                    <span class="tech-desc">Peta interaktif</span>
                                </div>
                                <div class="tech-item">
                                    <span class="tech-name">IndexedDB</span>
                                    <span class="tech-desc">Penyimpanan data offline</span>
                                </div>
                                <div class="tech-item">
                                    <span class="tech-name">Service Worker</span>
                                    <span class="tech-desc">Cache dan notifikasi push</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="cta-section">
                        <h2>Mulai Berbagi Ceritamu</h2>
                        <p>Bergabunglah dengan komunitas kami dan bagikan pengalaman hidup yang dapat menginspirasi orang lain.</p>
                        <div class="cta-actions">
                            <a href="#/register" class="btn btn-primary">Daftar Sekarang</a>
                            <a href="#/stories" class="btn btn-secondary">Jelajahi Cerita</a>
                        </div>
                    </div>
                </div>
            </section>
        `;
  }

  async afterRender() {
    this.loadCSS();
    this.setupEventListeners();
  }

  loadCSS() {
    if (!document.querySelector('link[href*="about.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/styles/about.css";
      document.head.appendChild(link);
    }
  }

  setupEventListeners() {
    // Setup animations for value cards
    this.setupScrollAnimations();

    // Setup CTA buttons
    const ctaButtons = document.querySelectorAll(".cta-actions .btn");
    ctaButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const href = button.getAttribute("href");
        window.location.hash = href;
      });
    });
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(
      ".value-card, .feature-item, .tech-item"
    );
    animatedElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });
  }
}

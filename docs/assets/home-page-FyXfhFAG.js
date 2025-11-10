class r{async render(){const a=!!localStorage.getItem("token");return JSON.parse(localStorage.getItem("user")||"{}"),`
            <section class="container">
                <div class="hero-section">
                    <div class="hero-content">
                        <h1>Selamat Datang di ShareYourStory</h1>
                        <p>Platform untuk berbagi cerita inspiratif dan pengalaman hidup yang berharga. Mari berbagi dan menginspirasi satu sama lain.</p>
                        
                        <div class="hero-actions">
                            ${a?`
                                <a href="#/create" class="btn btn-primary">Tulis Cerita Baru</a>
                                <a href="#/stories" class="btn btn-secondary">Lihat Cerita Lain</a>
                            `:`
                                <a href="#/register" class="btn btn-primary">Daftar Sekarang</a>
                                <a href="#/login" class="btn btn-secondary">Masuk</a>
                                <a href="#/stories" class="btn btn-outline">Jelajahi sebagai Tamu</a>
                            `}
                        </div>
                    </div>
                    
                    <div class="hero-image">
                        <img src="/images/hero-story.svg" alt="People sharing stories" loading="lazy">
                    </div>
                </div>

                <div class="features-section">
                    <h2>Mengapa Memilih ShareYourStory?</h2>
                    <div class="features-grid">
                        <div class="feature-card">
                            <div class="feature-icon">📖</div>
                            <h3>Berbagi Cerita</h3>
                            <p>Bagikan pengalaman hidup Anda yang dapat menginspirasi orang lain</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🗺️</div>
                            <h3>Peta Interaktif</h3>
                            <p>Lihat cerita berdasarkan lokasi di peta digital yang interaktif</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📱</div>
                            <h3>Akses Offline</h3>
                            <p>Baca cerita favorit Anda bahkan tanpa koneksi internet</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">🔔</div>
                            <h3>Notifikasi</h3>
                            <p>Dapatkan pemberitahuan ketika ada cerita baru yang menarik</p>
                        </div>
                    </div>
                </div>

                ${a?`
                    <div class="quick-actions">
                        <h2>Mulai Berbagi</h2>
                        <div class="action-cards">
                            <a href="#/create" class="action-card">
                                <div class="action-icon">✍️</div>
                                <h3>Tulis Cerita</h3>
                                <p>Bagikan pengalaman menarik Anda</p>
                            </a>
                            <a href="#/map" class="action-card">
                                <div class="action-icon">🗺️</div>
                                <h3>Lihat Peta</h3>
                                <p>Jelajahi cerita berdasarkan lokasi</p>
                            </a>
                            <a href="#/stories" class="action-card">
                                <div class="action-icon">📚</div>
                                <h3>Baca Cerita</h3>
                                <p>Temukan inspirasi dari cerita lain</p>
                            </a>
                        </div>
                    </div>
                `:""}
            </section>
        `}async afterRender(){this.addHomeStyles()}addHomeStyles(){document.head.insertAdjacentHTML("beforeend",`
            <style>
                .hero-section {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 3rem;
                    align-items: center;
                    padding: 3rem 0;
                    min-height: 60vh;
                }

                .hero-content h1 {
                    font-size: 3rem;
                    font-weight: bold;
                    margin-bottom: 1.5rem;
                    color: var(--text-primary);
                    line-height: 1.2;
                }

                .hero-content p {
                    font-size: 1.25rem;
                    color: var(--text-secondary);
                    margin-bottom: 2rem;
                    line-height: 1.6;
                }

                .hero-actions {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .hero-image img {
                    width: 100%;
                    height: auto;
                    border-radius: 1rem;
                }

                .features-section {
                    padding: 4rem 0;
                    text-align: center;
                }

                .features-section h2 {
                    font-size: 2.5rem;
                    margin-bottom: 3rem;
                    color: var(--text-primary);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 2rem;
                }

                .feature-card {
                    padding: 2rem;
                    background: var(--background-color);
                    border-radius: 1rem;
                    box-shadow: var(--shadow);
                    transition: transform 0.3s ease;
                }

                .feature-card:hover {
                    transform: translateY(-5px);
                }

                .feature-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .feature-card h3 {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                }

                .feature-card p {
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                .quick-actions {
                    padding: 3rem 0;
                }

                .quick-actions h2 {
                    font-size: 2rem;
                    margin-bottom: 2rem;
                    text-align: center;
                    color: var(--text-primary);
                }

                .action-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                }

                .action-card {
                    display: block;
                    padding: 2rem;
                    background: var(--background-color);
                    border-radius: 1rem;
                    box-shadow: var(--shadow);
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.3s ease;
                    text-align: center;
                }

                .action-card:hover {
                    transform: translateY(-3px);
                    box-shadow: var(--shadow-lg);
                    background: var(--primary-color);
                    color: white;
                }

                .action-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }

                .action-card h3 {
                    font-size: 1.25rem;
                    margin-bottom: 0.5rem;
                }

                .action-card p {
                    font-size: 0.875rem;
                    opacity: 0.8;
                }

                @media (max-width: 768px) {
                    .hero-section {
                        grid-template-columns: 1fr;
                        text-align: center;
                        gap: 2rem;
                    }

                    .hero-content h1 {
                        font-size: 2rem;
                    }

                    .hero-content p {
                        font-size: 1.125rem;
                    }

                    .hero-actions {
                        justify-content: center;
                    }

                    .features-section h2 {
                        font-size: 2rem;
                    }
                }
            </style>
        `)}}export{r as default};

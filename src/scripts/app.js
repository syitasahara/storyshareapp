import routes from "./routes/routes.js";
import { getActiveRoute } from "./routes/url-parser.js";
import { ViewTransition } from "./utils/transition.js";

class App {
  constructor({ content, drawerButton, navigationDrawer }) {
    this.content = content;
    this.drawerButton = drawerButton;
    this.navigationDrawer = navigationDrawer;
    this.currentPage = null;

    this.setupDrawer();
  }

  setupDrawer() {
    this.drawerButton.addEventListener("click", () => {
      const isExpanded = this.navigationDrawer.classList.toggle("open");
      this.drawerButton.setAttribute("aria-expanded", isExpanded);
      this.drawerButton.innerHTML = isExpanded ? "✕" : "☰";
    });

    document.addEventListener("click", (event) => {
      if (
        !this.navigationDrawer.contains(event.target) &&
        !this.drawerButton.contains(event.target)
      ) {
        this.closeDrawer();
      }
    });

    this.navigationDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => this.closeDrawer());
    });
  }

  closeDrawer() {
    this.navigationDrawer.classList.remove("open");
    this.drawerButton.setAttribute("aria-expanded", "false");
    this.drawerButton.innerHTML = "☰";
  }

  async renderPage() {
    try {
      // Determine the active route path (hash-based)
      const activePath = getActiveRoute();
      console.log("Rendering page for URL:", activePath);

      // Find a matching route key from the routes map (support :id tokens)
      const routeKeys = Object.keys(routes);
      const matchKey =
        routeKeys.find((key) => {
          const keySeg = key.split("/").filter(Boolean);
          const pathSeg = activePath.split("/").filter(Boolean);
          if (keySeg.length !== pathSeg.length) return false;
          return keySeg.every(
            (ks, idx) => ks.startsWith(":") || ks === pathSeg[idx]
          );
        }) || activePath;

      const pageModule = routes[matchKey];

      if (!pageModule) {
        console.error("Page not found for URL:", activePath);
        this.showErrorPage();
        return;
      }

      let PageClass;

      // Handle different types of exports
      if (typeof pageModule === "function") {
        // Could be a dynamic import function or a function that returns a class
        const result = pageModule();
        if (result && typeof result.then === "function") {
          const module = await result;
          PageClass = module.default || module;
        } else {
          // Function returned a class directly
          PageClass = result || pageModule;
        }
      } else {
        // Direct class value
        PageClass = pageModule;
      }

      // Validate that PageClass is a constructor
      if (typeof PageClass !== "function") {
        console.error("PageClass is not a constructor:", PageClass);
        this.showErrorPage();
        return;
      }

      console.log("Instantiating page class:", PageClass.name);
      const page = new PageClass();
      const content = this.content || document.getElementById("main-content");

      if (!content) {
        console.error("Main content element not found");
        return;
      }

      // Clear previous content
      content.innerHTML = "";

      // Render page content
      const pageContent = await page.render();
      if (pageContent) {
        content.innerHTML = pageContent;
      }

      // Call afterRender if exists
      if (typeof page.afterRender === "function") {
        await page.afterRender();
      }

      console.log("Page rendered successfully:", activePath);
    } catch (error) {
      console.error("Page rendering error:", error);
      this.showErrorPage();
    }
  }

  showLoading() {
    this.content.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Memuat halaman...</p>
            </div>
        `;

    if (!document.querySelector("#loading-styles")) {
      const style = document.createElement("style");
      style.id = "loading-styles";
      style.textContent = `
                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 50vh;
                    gap: 1rem;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f4f6;
                    border-left: 4px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
      document.head.appendChild(style);
    }
  }

  hideLoading() {
    // Loading akan digantikan oleh konten halaman
  }

  updateActiveNav(currentRoute) {
    const navLinks = this.navigationDrawer.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.classList.remove("active");
      const linkHref = link.getAttribute("href").replace("#", "");

      if (
        currentRoute === linkHref ||
        (currentRoute.startsWith(linkHref) && linkHref !== "/")
      ) {
        link.classList.add("active");
      }
    });
  }

  async showNotFound() {
    await ViewTransition.start(() => {
      this.content.innerHTML = `
                <section class="container error-page">
                    <div class="error-content">
                        <h1>404 - Halaman Tidak Ditemukan</h1>
                        <p>Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
                        <div class="error-actions">
                            <a href="#/" class="btn btn-primary">Kembali ke Beranda</a>
                            <a href="#/stories" class="btn btn-secondary">Lihat Cerita</a>
                        </div>
                    </div>
                </section>
            `;
    });

    this.setupErrorPageListeners();
  }

  async showError(error, route) {
    console.error("Page rendering error:", error);

    let errorMessage = "Gagal memuat halaman";
    let errorDetails = error.message;

    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch dynamically imported module")
    ) {
      errorMessage = "Koneksi Terputus";
      errorDetails =
        "Aplikasi sedang dalam mode offline. Beberapa fitur mungkin tidak tersedia.";
    } else if (error.name === "NetworkError" || !navigator.onLine) {
      errorMessage = "Tidak Ada Koneksi Internet";
      errorDetails = "Periksa koneksi internet Anda dan coba lagi.";
    }

    await ViewTransition.start(() => {
      this.content.innerHTML = `
                <section class="container error-page">
                    <div class="error-content">
                        <h1>${errorMessage}</h1>
                        <p>${errorDetails}</p>
                        <div class="error-actions">
                            <button onclick="location.reload()" class="btn btn-primary">Refresh Halaman</button>
                            <a href="#/" class="btn btn-secondary">Kembali ke Beranda</a>
                            ${
                              !navigator.onLine
                                ? `
                                <button onclick="this.disabled=true; setTimeout(() => location.reload(), 1000)" class="btn btn-outline">
                                    🔄 Coba Koneksi
                                </button>
                            `
                                : ""
                            }
                        </div>
                        ${
                          process.env.NODE_ENV === "development"
                            ? `
                            <details class="error-details">
                                <summary>Detail Teknis (Development)</summary>
                                <pre>${error.stack}</pre>
                                <p><strong>Route:</strong> ${route}</p>
                            </details>
                        `
                            : ""
                        }
                    </div>
                </section>
            `;
    });

    this.setupErrorPageListeners();
  }

  showErrorPage() {
    const content = this.content || document.getElementById("main-content");
    if (content) {
      content.innerHTML = `
                <div class="error-page">
                    <h2>Halaman Tidak Ditemukan</h2>
                    <p>Maaf, halaman yang Anda cari tidak tersedia.</p>
                    <button id="error-back-home" class="btn btn-primary">Kembali ke Beranda</button>
                </div>
            `;

      const btn = content.querySelector("#error-back-home");
      if (btn) {
        btn.addEventListener("click", () => {
          window.location.hash = "/home";
        });
      }
    }
  }

  setupErrorPageListeners() {
    const buttons = this.content.querySelectorAll(
      ".error-actions .btn, .error-actions a"
    );
    buttons.forEach((button) => {
      if (button.getAttribute("href")) {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          const href = button.getAttribute("href").replace("#", "");
          window.location.hash = href;
        });
      }
    });
  }
}

export default App;

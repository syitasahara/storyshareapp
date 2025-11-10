import { storyApi } from "../data/api.js";

export function updateAuthUI() {
  const token = localStorage.getItem("token");
  const authNavItem = document.getElementById("auth-nav-item");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (token && authNavItem) {
    authNavItem.innerHTML = `
            <div class="user-menu">
                <span class="user-greeting">Halo, ${user.name}</span>
                <button class="logout-btn" aria-label="Keluar">🚪</button>
            </div>
        `;

    const logoutBtn = authNavItem.querySelector(".logout-btn");
    logoutBtn.addEventListener("click", handleLogout);
  } else if (authNavItem) {
    authNavItem.innerHTML = '<a href="#/login" class="nav-link">Masuk</a>';
  }
}

export function setupDrawer() {
  const drawerButton = document.getElementById("drawer-button");
  const navigationDrawer = document.getElementById("navigation-drawer");

  if (drawerButton && navigationDrawer) {
    drawerButton.addEventListener("click", () => {
      const isExpanded = navigationDrawer.classList.toggle("open");
      drawerButton.setAttribute("aria-expanded", isExpanded);
      drawerButton.innerHTML = isExpanded ? "✕" : "☰";
    });
  }
}

function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  storyApi.setToken(null);
  updateAuthUI();
  window.location.hash = "/";
}

export function showFormattedDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("id-ID", options);
}

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

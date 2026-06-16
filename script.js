// ============================================
// LOGIN SYSTEM & AUTHENTICATION (LOCAL BACKEND)
// ============================================

// URL BACKEND PRODUCTION - VERCEL
const API_URL = "https://profile-backend-phi.vercel.app";

// Fungsi async untuk login ke backend Railway
const loginKeBackend = async (username, password) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message:
        "Gagal terhubung ke server cloud. Pastikan server backend online.",
    };
  }
};

// Fungsi async untuk register ke backend Railway
const registerKeBackend = async (username, password, confirmPassword) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, confirmPassword }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message:
        "Gagal terhubung ke server cloud. Pastikan server backend online.",
    };
  }
};

// Fungsi untuk menampilkan pesan login/register
const showAuthMessage = (elementId, message, isError = true) => {
  const messageEl = document.getElementById(elementId);
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `login-message ${isError ? "error" : "success"}`;
  }
};

// Toggle antara Login dan Register dengan smooth transition
const toggleAuthForms = () => {
  const loginWrapper = document.getElementById("loginForm-wrapper");
  const registerWrapper = document.getElementById("registerForm-wrapper");
  const toggleToRegister = document.getElementById("toggleToRegister");
  const toggleToLogin = document.getElementById("toggleToLogin");

  if (!loginWrapper || !registerWrapper) return;

  if (toggleToRegister) {
    toggleToRegister.addEventListener("click", (e) => {
      e.preventDefault();
      loginWrapper.style.opacity = "0";
      loginWrapper.style.transform = "translateY(20px)";

      setTimeout(() => {
        loginWrapper.style.display = "none";
        registerWrapper.style.display = "block";
        registerWrapper.style.opacity = "0";
        registerWrapper.style.transform = "translateY(20px)";

        setTimeout(() => {
          registerWrapper.style.opacity = "1";
          registerWrapper.style.transform = "translateY(0)";
        }, 10);

        const registerForm = document.getElementById("registerForm");
        if (registerForm) registerForm.reset();
        const registerMessage = document.getElementById("registerMessage");
        if (registerMessage) registerMessage.textContent = "";
      }, 300);
    });
  }

  if (toggleToLogin) {
    toggleToLogin.addEventListener("click", (e) => {
      e.preventDefault();
      registerWrapper.style.opacity = "0";
      registerWrapper.style.transform = "translateY(20px)";

      setTimeout(() => {
        registerWrapper.style.display = "none";
        loginWrapper.style.display = "block";
        loginWrapper.style.opacity = "0";
        loginWrapper.style.transform = "translateY(20px)";

        setTimeout(() => {
          loginWrapper.style.opacity = "1";
          loginWrapper.style.transform = "translateY(0)";
        }, 10);

        const loginForm = document.getElementById("loginForm");
        if (loginForm) loginForm.reset();
        const loginMessage = document.getElementById("loginMessage");
        if (loginMessage) loginMessage.textContent = "";
      }, 300);
    });
  }

  loginWrapper.style.transition = "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
  registerWrapper.style.transition =
    "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)";
};

// Setup login form handler
const setupLoginForm = () => {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("login-username").value.trim();
    const password = document.getElementById("login-password").value.trim();

    if (!username || !password) {
      showAuthMessage(
        "loginMessage",
        "Username dan password harus diisi!",
        true,
      );
      return;
    }

    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = "Sedang masuk...";

    const result = await loginKeBackend(username, password);

    if (result.success) {
      showAuthMessage(
        "loginMessage",
        "Login berhasil! Memuat halaman...",
        false,
      );
      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("userInfo", JSON.stringify(result.user));

      setTimeout(() => {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("main-wrapper").style.display = "block";

        revealOnScroll();
        muatArtikel();
      }, 500);
    } else {
      showAuthMessage("loginMessage", result.message || "Login gagal!", true);
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
      document.getElementById("login-password").value = "";
    }
  });
};

// Setup register form handler
const setupRegisterForm = () => {
  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("register-username").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const confirmPassword = document
      .getElementById("register-confirm")
      .value.trim();

    if (!username || !password || !confirmPassword) {
      showAuthMessage("registerMessage", "Semua field harus diisi!", true);
      return;
    }

    if (password.length < 6) {
      showAuthMessage("registerMessage", "Password minimal 6 karakter!", true);
      return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerText;
    submitBtn.disabled = true;
    submitBtn.innerText = "Sedang daftar...";

    const result = await registerKeBackend(username, password, confirmPassword);

    if (result.success) {
      showAuthMessage(
        "registerMessage",
        result.message || "Pendaftaran sukses!",
        false,
      );
      registerForm.reset();

      setTimeout(() => {
        document.getElementById("registerForm-wrapper").style.display = "none";
        document.getElementById("loginForm-wrapper").style.display = "block";
        document.getElementById("login-username").focus();
      }, 2000);
    } else {
      showAuthMessage(
        "registerMessage",
        result.message || "Pendaftaran gagal!",
        true,
      );
      submitBtn.disabled = false;
      submitBtn.innerText = originalText;
    }
  });
};

// Setup logout button
const setupLogoutBtn = () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Yakin ingin logout?")) {
        sessionStorage.removeItem("isLoggedIn");
        sessionStorage.removeItem("userInfo");
        location.reload();
      }
    });
  }
};

// Cek status login saat page load
const checkLoginStatus = () => {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const loginContainer = document.getElementById("login-container");
  const mainWrapper = document.getElementById("main-wrapper");
  const pwaLanding = document.getElementById("pwa-landing");

  if (isLoggedIn) {
    if (loginContainer) loginContainer.style.display = "none";
    if (pwaLanding) pwaLanding.style.display = "none";
    if (mainWrapper) mainWrapper.style.display = "block";
  } else {
    if (pwaLanding) pwaLanding.style.display = "flex";
    if (loginContainer) loginContainer.style.display = "none";
    if (mainWrapper) mainWrapper.style.display = "none";
  }
};

// Setup tombol Masuk di PWA Landing
const setupPWALanding = () => {
  const pwaLoginBtn = document.getElementById("pwa-login-btn");
  const pwaLanding = document.getElementById("pwa-landing");
  const loginContainer = document.getElementById("login-container");

  if (pwaLoginBtn) {
    pwaLoginBtn.addEventListener("click", () => {
      if (pwaLanding) pwaLanding.style.display = "none";
      if (loginContainer) loginContainer.style.display = "flex";
    });
  }
};

// ============================================
// MAIN PAGE FUNCTIONALITY
// ============================================

// Mobile menu toggle
const hamburger = document.querySelector(".hamburger");
const menu = document.querySelector(".menu");

if (hamburger && menu) {
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    menu.classList.toggle("active");
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      menu.classList.remove("active");
    });
  });
}

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      });
    }
  });
});

// Header scroll effect
const header = document.querySelector(".header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    header.style.padding = "0.5rem 0";
    header.style.background = "rgba(15, 23, 42, 0.95)";
    header.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.3)";
  } else {
    header.style.padding = "1.2rem 0";
    header.style.background = "rgba(15, 23, 42, 0.8)";
    header.style.boxShadow = "none";
  }
});

// Simple Scroll Reveal Animation
const revealElements = document.querySelectorAll(
  ".section, .profile-card, .skill-card, .project-showcase",
);

const revealOnScroll = () => {
  const triggerBottom = window.innerHeight * 0.85;

  revealElements.forEach((el) => {
    const top = el.getBoundingClientRect().top;
    if (top < triggerBottom) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }
  });
};

revealElements.forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "all 0.8s ease-out";
});

window.addEventListener("scroll", revealOnScroll);

// Form Submission Mockup
const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector(".submit-btn");
    const originalText = submitBtn.innerText;

    submitBtn.innerText = "Mengirim...";
    submitBtn.disabled = true;

    setTimeout(() => {
      alert(
        "Pesan Anda telah berhasil terkirim! Terima kasih telah menghubungi saya.",
      );
      submitBtn.innerText = originalText;
      submitBtn.disabled = false;
      contactForm.reset();
    }, 1500);
  });
}

// Active link highlighting on scroll
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".menu a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (pageYOffset >= sectionTop - 100) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href").includes(current)) {
      link.classList.add("active");
    }
  });
});
// Load articles from Backend (Database Lokal)
const muatArtikel = async () => {
  const container = document.getElementById("daftarArtikelProfil");
  if (!container) return;

  try {
    container.innerHTML =
      '<div style="color: #94a3b8; text-align: center; padding: 20px;"><p>Memuat artikel dari server...</p></div>';

    const response = await fetch(`${API_URL}/api/articles`);
    const result = await response.json(); // Mengubah nama variabel agar lebih jelas

    // Cek sesuai format respons dari backend lokal kamu (result.data)
    if (!result.success || !result.data || result.data.length === 0) {
      container.innerHTML = `
        <div class="no-articles-msg">
          <p>Belum ada artikel yang dipublikasikan.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    // Tampilkan maksimal 6 artikel terbaru dari array result.data
    const displayData = result.data.slice(0, 6);

    displayData.forEach((item) => {
      const card = document.createElement("div");
      card.className = "article-card";

      const tglMentah = item.created_at || item.id;
      const date = new Date(tglMentah).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      card.innerHTML = `
        <span class="date">${date}</span>
        <h3>${item.judul}</h3>
        <p>${item.konten}</p>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error("Gagal memuat artikel profil:", error);
    container.innerHTML =
      '<div style="color: #ef4444; text-align: center; padding: 20px;"><p>Gagal mengambil artikel dari database.</p></div>';
  }
};

// ============================================
// MAP & SERVICE WORKER (Tugas Pertemuan 12)
// ============================================

// Fungsi untuk memuat peta
const loadMapLocation = async () => {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) return;

  // Koordinat default: Rumah Brilian di Karangduwur, Kebumen, Jawa Tengah
  const DEFAULT_LAT = -7.7598799;
  const DEFAULT_LNG = 109.4117840;
  const DEFAULT_LABEL = "Karangduwur, Ayah, Kebumen, Jawa Tengah";

  let lat = DEFAULT_LAT;
  let lng = DEFAULT_LNG;
  let label = DEFAULT_LABEL;

  try {
    const response = await fetch(`${API_URL}/api/auth/users`);
    const result = await response.json();
    
    if (result.success && result.data && result.data.length > 0) {
      const user = result.data[0];
      if (user.latitude && user.longitude &&
          parseFloat(user.latitude) !== -6.200000) {
        lat = parseFloat(user.latitude);
        lng = parseFloat(user.longitude);
        label = `Lokasi: ${user.username}`;
      }
    }
  } catch (error) {
    console.warn("Gagal ambil koordinat dari DB, pakai koordinat default:", error);
  }

  // Inisialisasi Leaflet Map
  const map = L.map('map').setView([lat, lng], 15);
  
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  L.marker([lat, lng]).addTo(map)
    .bindPopup(`<b>📍 ${label}</b><br>Lat: ${lat}<br>Lng: ${lng}`)
    .openPopup();
};

// Fungsi Registrasi Service Worker & Push Notification
const setupServiceWorker = () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('sw.js')
      .then((swReg) => {
        console.log('Service Worker berhasil didaftarkan!', swReg);
        // Meminta Izin Notifikasi
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('Izin Notifikasi Diberikan!');
          }
        });
      })
      .catch((error) => console.error('Gagal daftar Service Worker:', error));
  }
};

// Initial calls
window.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
  setupPWALanding();
  toggleAuthForms();
  setupLoginForm();
  setupRegisterForm();
  setupLogoutBtn();
  revealOnScroll();
  muatArtikel();
  setupServiceWorker();
  
  // Karena map butuh div yang visible, lebih baik loadMapLocation dipanggil
  // setelah UI dipastikan terbuka jika menggunakan hide/show div
  setTimeout(() => {
    loadMapLocation();
  }, 1000);
});

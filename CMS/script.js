// ============================================
// CMS DASHBOARD - ARTIKEL MANAGEMENT (CONNECTED TO RAILWAY)
// ============================================

// URL BACKEND PRODUCTION - VERCEL
const API_URL = "https://profile-backend-phi.vercel.app";

// ============================================
// 🔔 TOAST NOTIFICATION SYSTEM
// ============================================
const TOAST_ICONS = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

/**
 * Tampilkan toast notification
 * @param {string} message - Pesan yang ditampilkan
 * @param {'success'|'error'|'warning'|'info'} type - Jenis notifikasi
 * @param {number} duration - Durasi dalam ms (default 3500)
 */
function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type]}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" aria-label="Tutup">✕</button>
    <div class="toast-progress"></div>
  `;

  // Close button
  toast.querySelector(".toast-close").addEventListener("click", () => dismissToast(toast));

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("toast-visible"));
  });

  // Progress bar animation
  const progress = toast.querySelector(".toast-progress");
  progress.style.transition = `width ${duration}ms linear`;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { progress.style.width = "0%"; });
  });

  // Auto dismiss
  const timer = setTimeout(() => dismissToast(toast), duration);
  toast._timer = timer;

  // Pause on hover
  toast.addEventListener("mouseenter", () => {
    clearTimeout(toast._timer);
    progress.style.transitionDuration = "0s";
  });
  toast.addEventListener("mouseleave", () => {
    const remaining = (parseFloat(getComputedStyle(progress).width) / toast.offsetWidth) * duration;
    progress.style.transitionDuration = `${remaining}ms`;
    progress.style.width = "0%";
    toast._timer = setTimeout(() => dismissToast(toast), remaining);
  });
}

function dismissToast(toast) {
  clearTimeout(toast._timer);
  toast.classList.remove("toast-visible");
  toast.classList.add("toast-hiding");
  toast.addEventListener("transitionend", () => toast.remove(), { once: true });
}

// ============================================
// 🗔 CUSTOM CONFIRM MODAL
// ============================================
/**
 * Tampilkan modal konfirmasi (pengganti confirm() bawaan browser)
 * @param {string} message - Pesan konfirmasi
 * @param {string} title - Judul modal (opsional)
 * @param {'danger'|'warning'|'info'} tone - Warna tombol OK
 * @returns {Promise<boolean>}
 */
function showConfirm(message, title = "Konfirmasi", tone = "danger") {
  return new Promise((resolve) => {
    const overlay = document.getElementById("confirm-overlay");
    const titleEl = document.getElementById("confirm-title");
    const messageEl = document.getElementById("confirm-message");
    const iconEl = document.getElementById("confirm-icon");
    const okBtn = document.getElementById("confirm-ok-btn");
    const cancelBtn = document.getElementById("confirm-cancel-btn");

    const toneMap = {
      danger: { icon: "🗑️", okClass: "btn-confirm-ok btn-confirm-danger" },
      warning: { icon: "⚠️", okClass: "btn-confirm-ok btn-confirm-warning" },
      info: { icon: "ℹ️", okClass: "btn-confirm-ok btn-confirm-info" },
    };

    const config = toneMap[tone] || toneMap.danger;
    iconEl.textContent = config.icon;
    titleEl.textContent = title;
    messageEl.textContent = message;
    okBtn.className = config.okClass;

    overlay.style.display = "flex";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add("confirm-visible"));
    });

    const cleanup = (result) => {
      overlay.classList.remove("confirm-visible");
      setTimeout(() => { overlay.style.display = "none"; }, 250);
      okBtn.removeEventListener("click", onOk);
      cancelBtn.removeEventListener("click", onCancel);
      overlay.removeEventListener("click", onOverlayClick);
      resolve(result);
    };

    const onOk = () => cleanup(true);
    const onCancel = () => cleanup(false);
    const onOverlayClick = (e) => { if (e.target === overlay) cleanup(false); };

    okBtn.addEventListener("click", onOk);
    cancelBtn.addEventListener("click", onCancel);
    overlay.addEventListener("click", onOverlayClick);
  });
}

// ============================================
// CEK LOGIN STATUS & TAMPILKAN SECTION YANG SESUAI
// ============================================
function checkCMSLogin() {
  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
  const loginSection = document.getElementById("cms-login-section");
  const dashboardSection = document.getElementById("cms-dashboard-section");

  if (isLoggedIn) {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    renderAplikasi();
  } else {
    loginSection.style.display = "flex";
    dashboardSection.style.display = "none";
  }
}

// ============================================
// SETUP FORM LOGIN CMS
// ============================================
function setupCMSLoginForm() {
  const cmsLoginForm = document.getElementById("cmsLoginForm");
  if (!cmsLoginForm) return;

  // Toggle show/hide password
  const togglePwBtn = document.getElementById("togglePassword");
  const pwInput = document.getElementById("cms-password");
  if (togglePwBtn && pwInput) {
    togglePwBtn.addEventListener("click", () => {
      if (pwInput.type === "password") {
        pwInput.type = "text";
        togglePwBtn.textContent = "🙈";
      } else {
        pwInput.type = "password";
        togglePwBtn.textContent = "👁";
      }
    });
  }

  cmsLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("cms-username").value.trim();
    const password = document.getElementById("cms-password").value.trim();
    const messageEl = document.getElementById("cmsLoginMessage");
    const loginBtn = document.getElementById("cmsLoginBtn");

    if (!username || !password) {
      messageEl.textContent = "Username dan password harus diisi!";
      messageEl.className = "cms-login-message error";
      return;
    }

    // Loading state
    loginBtn.disabled = true;
    loginBtn.textContent = "Sedang masuk...";
    messageEl.textContent = "";
    messageEl.className = "cms-login-message";

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        messageEl.textContent = "Login berhasil! Memuat dashboard...";
        messageEl.className = "cms-login-message success";

        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userInfo", JSON.stringify(data.user));

        setTimeout(() => {
          document.getElementById("cms-login-section").style.display = "none";
          const dashboardSection = document.getElementById("cms-dashboard-section");
          dashboardSection.style.display = "block";
          dashboardSection.style.opacity = "0";
          dashboardSection.style.transform = "translateY(20px)";
          dashboardSection.style.transition = "all 0.4s ease";
          setTimeout(() => {
            dashboardSection.style.opacity = "1";
            dashboardSection.style.transform = "translateY(0)";
          }, 10);
          renderAplikasi();
          showToast(`Selamat datang, ${username}! 👋`, "success");
        }, 600);
      } else {
        messageEl.textContent = data.message || "Login gagal! Cek username/password.";
        messageEl.className = "cms-login-message error";
        loginBtn.disabled = false;
        loginBtn.textContent = "Masuk ke Dashboard";
        document.getElementById("cms-password").value = "";
      }
    } catch (error) {
      console.error("Login error:", error);
      messageEl.textContent = "Gagal terhubung ke server. Coba lagi.";
      messageEl.className = "cms-login-message error";
      loginBtn.disabled = false;
      loginBtn.textContent = "Masuk ke Dashboard";
    }
  });
}

// ============================================
// SETUP FORM REGISTER CMS
// ============================================
function setupCMSRegisterForm() {
  const cmsRegisterForm = document.getElementById("cmsRegisterForm");
  if (!cmsRegisterForm) return;

  cmsRegisterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("reg-username").value.trim();
    const password = document.getElementById("reg-password").value.trim();
    const confirmPassword = document.getElementById("reg-confirm").value.trim();
    const messageEl = document.getElementById("cmsRegisterMessage");
    const regBtn = document.getElementById("cmsRegisterBtn");

    if (!username || !password || !confirmPassword) {
      messageEl.textContent = "Semua field harus diisi!";
      messageEl.className = "cms-login-message error";
      return;
    }

    if (password.length < 6) {
      messageEl.textContent = "Password minimal 6 karakter!";
      messageEl.className = "cms-login-message error";
      return;
    }

    if (password !== confirmPassword) {
      messageEl.textContent = "Konfirmasi password tidak cocok!";
      messageEl.className = "cms-login-message error";
      return;
    }

    // Loading state
    regBtn.disabled = true;
    regBtn.textContent = "Sedang mendaftar...";
    messageEl.textContent = "";
    messageEl.className = "cms-login-message";

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, confirmPassword }),
      });

      const data = await response.json();

      if (data.success) {
        messageEl.textContent = data.message || "Pendaftaran sukses! Silakan login.";
        messageEl.className = "cms-login-message success";
        cmsRegisterForm.reset();

        setTimeout(() => {
          document.getElementById("cms-register-box").style.display = "none";
          document.getElementById("cms-login-box").style.display = "block";
          document.getElementById("cms-username").value = username;
          document.getElementById("cms-username").focus();
          messageEl.textContent = "";
        }, 2000);
      } else {
        messageEl.textContent = data.message || "Pendaftaran gagal!";
        messageEl.className = "cms-login-message error";
        regBtn.disabled = false;
        regBtn.textContent = "Daftar Sekarang";
      }
    } catch (error) {
      console.error("Register error:", error);
      messageEl.textContent = "Gagal terhubung ke server. Coba lagi.";
      messageEl.className = "cms-login-message error";
      regBtn.disabled = false;
      regBtn.textContent = "Daftar Sekarang";
    }
  });
}

// ============================================
// SETUP TOGGLE LOGIN/REGISTER
// ============================================
function setupToggleForms() {
  const showRegister = document.getElementById("showRegister");
  const showLogin = document.getElementById("showLogin");
  const loginBox = document.getElementById("cms-login-box");
  const registerBox = document.getElementById("cms-register-box");

  if (showRegister && showLogin && loginBox && registerBox) {
    showRegister.addEventListener("click", (e) => {
      e.preventDefault();
      loginBox.style.display = "none";
      registerBox.style.display = "block";
    });

    showLogin.addEventListener("click", (e) => {
      e.preventDefault();
      registerBox.style.display = "none";
      loginBox.style.display = "block";
    });
  }
}

// ============================================
// Validasi Form
// ============================================
function validasi(data) {
  let lulus = true;
  document.querySelectorAll(".pesan-error").forEach((e) => (e.innerText = ""));

  if (!data.judul || data.judul.trim() === "") {
    document.getElementById("errorJudul").innerText = "Judul tidak boleh kosong!";
    lulus = false;
  }
  if (!data.konten || data.konten.trim() === "") {
    document.getElementById("errorKonten").innerText = "Konten artikel masih kosong!";
    lulus = false;
  }

  return lulus;
}

// ============================================
// Display & Render Data (Ambil dari Database Cloud)
// ============================================
async function renderAplikasi() {
  const wadah = document.getElementById("wadahArtikel");
  if (!wadah) return;

  wadah.innerHTML =
    '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 40px;">Memuat data dari server...</p>';

  try {
    const respon = await fetch(`${API_URL}/api/articles`);
    let artikelDariServer = await respon.json();

    if (artikelDariServer && !Array.isArray(artikelDariServer) && artikelDariServer.data) {
      artikelDariServer = artikelDariServer.data;
    }

    wadah.innerHTML = "";

    if (!artikelDariServer || artikelDariServer.length === 0) {
      wadah.innerHTML =
        '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 40px;">Belum ada artikel. Silakan tambahkan artikel baru di atas.</p>';
      return;
    }

    artikelDariServer.forEach((item) => {
      const tglMentah = item.created_at || item.id;
      const date = new Date(tglMentah).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const kartu = document.createElement("div");
      kartu.className = "kartu";
      kartu.innerHTML = `
            <span class="badge">Artikel</span>
            <span class="date-badge">${date}</span>
            <h4>${item.judul}</h4>
            <p>${item.konten.substring(0, 100)}${item.konten.length > 100 ? "..." : ""}</p>
            <div class="aksi-kartu">
                <button onclick="siapkanUpdate('${item.id}', '${encodeURIComponent(item.judul)}', '${encodeURIComponent(item.konten)}')" class="btn-edit">Edit</button>
                <button onclick="hapusData('${item.id}')" class="btn-hapus">Hapus</button>
            </div>
        `;
      wadah.appendChild(kartu);
    });
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    wadah.innerHTML =
      '<p style="color: #ef4444; grid-column: 1/-1; text-align: center; padding: 40px;">Gagal tersambung ke server backend!</p>';
    showToast("Gagal memuat artikel dari server.", "error");
  }
}

// ============================================
// CRUD Operations (Kirim/Ubah/Hapus ke Server)
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formArtikel");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("artikelId").value;
      const payload = {
        judul: document.getElementById("judul").value.trim(),
        konten: document.getElementById("konten").value.trim(),
      };

      if (!validasi(payload)) return;

      const tombolSimpan = document.getElementById("tombolSimpan");
      const originalText = tombolSimpan.textContent;
      tombolSimpan.disabled = true;
      tombolSimpan.textContent = "Menyimpan...";

      try {
        let respon;
        if (id) {
          respon = await fetch(`${API_URL}/api/articles/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } else {
          respon = await fetch(`${API_URL}/api/articles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        }

        if (respon.ok) {
          resetFormulir();
          renderAplikasi();
          showToast(
            id ? "Artikel berhasil diupdate! ✏️" : "Artikel baru berhasil disimpan! 🎉",
            "success"
          );
        } else {
          showToast("Gagal menyimpan artikel ke server.", "error");
        }
      } catch (error) {
        console.error("Error saat menyimpan:", error);
        showToast("Terjadi kesalahan koneksi ke server.", "error");
      } finally {
        tombolSimpan.disabled = false;
        tombolSimpan.textContent = originalText;
      }
    });
  }

  const tombolBatal = document.getElementById("tombolBatal");
  if (tombolBatal) {
    tombolBatal.addEventListener("click", resetFormulir);
  }

  checkCMSLogin();
  setupCMSLoginForm();
  setupCMSRegisterForm();
  setupToggleForms();
});

// HAPUS DATA dari Server
window.hapusData = async (id) => {
  const konfirmasi = await showConfirm(
    "Artikel ini akan dihapus permanen dari database dan tidak bisa dikembalikan.",
    "Hapus Artikel?",
    "danger"
  );

  if (!konfirmasi) return;

  try {
    const respon = await fetch(`${API_URL}/api/articles/${id}`, {
      method: "DELETE",
    });

    if (respon.ok) {
      renderAplikasi();
      showToast("Artikel berhasil dihapus.", "success");
    } else {
      showToast("Gagal menghapus artikel dari server.", "error");
    }
  } catch (error) {
    console.error("Error saat menghapus:", error);
    showToast("Gagal tersambung ke server.", "error");
  }
};

// SIAPKAN FORM UNTUK EDIT
window.siapkanUpdate = (id, judulTerencode, kontenTerencode) => {
  document.getElementById("artikelId").value = id;
  document.getElementById("judul").value = decodeURIComponent(judulTerencode);
  document.getElementById("konten").value = decodeURIComponent(kontenTerencode);

  document.getElementById("tombolSimpan").innerText = "Simpan Perubahan";
  document.getElementById("tombolBatal").style.display = "inline-block";

  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("Mode edit aktif. Ubah konten lalu klik Simpan.", "info", 4000);
};

function resetFormulir() {
  const form = document.getElementById("formArtikel");
  if (form) form.reset();
  document.getElementById("artikelId").value = "";
  document.getElementById("tombolSimpan").innerText = "Simpan Artikel";
  document.getElementById("tombolBatal").style.display = "none";
}

window.logoutAdmin = async () => {
  const konfirmasi = await showConfirm(
    "Anda akan keluar dari dashboard CMS. Session akan diakhiri.",
    "Logout?",
    "warning"
  );

  if (!konfirmasi) return;

  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("userInfo");
  document.getElementById("cms-dashboard-section").style.display = "none";
  document.getElementById("cms-login-section").style.display = "flex";
  document.getElementById("cmsLoginForm").reset();
  document.getElementById("cmsLoginMessage").textContent = "";
  showToast("Anda telah berhasil logout.", "info");
};

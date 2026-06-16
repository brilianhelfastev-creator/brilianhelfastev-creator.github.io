// ============================================
// CMS DASHBOARD - ARTIKEL MANAGEMENT (CONNECTED TO RAILWAY)
// ============================================

// URL BACKEND PRODUCTION - VERCEL
const API_URL = "https://profile-backend-phi.vercel.app";

// Proteksi halaman: cek apakah user sudah login
if (sessionStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "../index.html"; // kembali ke halaman utama jika belum login
}

// ============================================
// Data & Elements
// ============================================
const form = document.getElementById("formArtikel");
const wadah = document.getElementById("wadahArtikel");

// ============================================
// Validasi Form
// ============================================
function validasi(data) {
  let lulus = true;
  document.querySelectorAll(".pesan-error").forEach((e) => (e.innerText = ""));

  if (!data.judul || data.judul.trim() === "") {
    document.getElementById("errorJudul").innerText =
      "Judul tidak boleh kosong!";
    lulus = false;
  }
  if (!data.konten || data.konten.trim() === "") {
    document.getElementById("errorKonten").innerText =
      "Konten artikel masih kosong!";
    lulus = false;
  }

  return lulus;
}

// ============================================
// Display & Render Data (Ambil dari Database Cloud)
// ============================================
async function renderAplikasi() {
  wadah.innerHTML =
    '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 40px;">Memuat data dari server...</p>';

  try {
    // Ambil data dari backend lokal
    const respon = await fetch(`${API_URL}/api/articles`);
    let artikelDariServer = await respon.json();
    
    // Sesuaikan format data jika dibungkus dalam properti 'data'
    if (artikelDariServer && !Array.isArray(artikelDariServer) && artikelDariServer.data) {
      artikelDariServer = artikelDariServer.data;
    }

    wadah.innerHTML = "";

    if (!artikelDariServer || artikelDariServer.length === 0) {
      wadah.innerHTML =
        '<p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 40px;">Belum ada artikel. Silakan tambahkan artikel baru di atas.</p>';
      return;
    }

    // Tampilkan artikel
    artikelDariServer.forEach((item) => {
      // Menangani format tanggal dari database (created_at atau id)
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
  }
}

// ============================================
// CRUD Operations (Kirim/Ubah/Hapus ke Server)
// ============================================

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("artikelId").value;
  const payload = {
    judul: document.getElementById("judul").value.trim(),
    konten: document.getElementById("konten").value.trim(),
  };

  if (!validasi(payload)) return;

  try {
    let respon;
    if (id) {
      // UPDATE DATA (PUT) ke Server
      respon = await fetch(`${API_URL}/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      // TAMBAH DATA BARU (POST) ke Server
      respon = await fetch(`${API_URL}/api/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (respon.ok) {
      resetFormulir();
      renderAplikasi();
      alert(
        id
          ? "Artikel berhasil diupdate di database cloud!"
          : "Artikel berhasil disimpan ke database cloud!",
      );
    } else {
      alert("Gagal menyimpan ke server backend.");
    }
  } catch (error) {
    console.error("Error saat menyimpan:", error);
    alert("Terjadi kesalahan koneksi ke server.");
  }
});

// HAPUS DATA dari Server
window.hapusData = async (id) => {
  if (confirm("Yakin ingin menghapus artikel ini dari database cloud?")) {
    try {
      const respon = await fetch(`${API_URL}/api/articles/${id}`, {
        method: "DELETE",
      });

      if (respon.ok) {
        renderAplikasi();
        alert("Artikel berhasil dihapus!");
      } else {
        alert("Gagal menghapus data di server.");
      }
    } catch (error) {
      console.error("Error saat menghapus:", error);
      alert("Gagal tersambung ke server.");
    }
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
};

function resetFormulir() {
  form.reset();
  document.getElementById("artikelId").value = "";
  document.getElementById("tombolSimpan").innerText = "Simpan Artikel";
  document.getElementById("tombolBatal").style.display = "none";
}

// ============================================
// Event Listeners & Init
// ============================================
document.getElementById("tombolBatal").addEventListener("click", resetFormulir);

window.logoutAdmin = () => {
  if (confirm("Apakah Anda yakin ingin keluar?")) {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("userInfo");
    window.location.href = "../index.html";
  }
};

// Jalankan aplikasi langsung panggil server cloud
renderAplikasi();

// Variable untuk menangkap event instalasi
let deferredPrompt;
const installBtn = document.getElementById('pwa-install-btn');

// 1. Tangkap event 'beforeinstallprompt' dari browser
window.addEventListener('beforeinstallprompt', (e) => {
  // Mencegah Chrome memunculkan prompt instalasi bawaan
  e.preventDefault();
  // Simpan event tersebut
  deferredPrompt = e;
  // Tampilkan tombol instalasi kustom
  if (installBtn) installBtn.style.display = 'block';
});

// 2. Tambahkan event listener klik pada tombol instalasi kustom
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      // Tampilkan prompt instalasi PWA
      deferredPrompt.prompt();
      // Tunggu respons user
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to install: ${outcome}`);
      // Reset event
      deferredPrompt = null;
      // Sembunyikan tombol setelah instalasi
      installBtn.style.display = 'none';
    }
  });
}

// 3. Event listener saat PWA sudah berhasil diinstal
window.addEventListener('appinstalled', (e) => {
  console.log('PWA was installed successfully.');
  // Sembunyikan tombol setelah instalasi
  if (installBtn) installBtn.style.display = 'none';
});

// 4. Mendaftarkan Service Worker agar PWA valid
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then((reg) => console.log('Service Worker Registered.', reg))
    .catch((err) => console.log('Service Worker registration failed: ', err));
}

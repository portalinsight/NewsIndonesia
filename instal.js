// install.js - Banner Install Aplikasi untuk INSIGHT NEWS INDONESIA
(function() {
    // Cegah duplikasi jika script dijalankan dua kali
    if (window.__installBannerLoaded) return;
    window.__installBannerLoaded = true;

    let deferredPrompt = null;
    let bannerElement = null;

    // Fungsi membuat elemen banner
    function createBanner() {
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
            padding: 16px 20px;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.2);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 9999;
            display: none;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            border-top: 2px solid #ffcc00;
        `;
        
        banner.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                <span style="font-size: 28px;">📱</span>
                <div>
                    <strong style="font-size: 1.1rem;">INSIGHT NEWS INDONESIA</strong>
                    <p style="margin: 4px 0 0; font-size: 0.85rem; opacity: 0.9;">Install aplikasi berita kami untuk akses lebih cepat & notifikasi eksklusif.</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
                <button id="installBtn" style="background-color: #ffcc00; color: #1e3c72; border: none; padding: 8px 18px; border-radius: 40px; font-weight: bold; cursor: pointer; font-size: 0.9rem;">Install Sekarang</button>
                <button id="closeBannerBtn" style="background: transparent; color: white; border: 1px solid rgba(255,255,255,0.5); padding: 8px 16px; border-radius: 40px; cursor: pointer; font-size: 0.85rem;">Tutup</button>
            </div>
        `;
        
        document.body.appendChild(banner);
        return banner;
    }

    // Tampilkan banner
    function showBanner() {
        if (bannerElement) {
            bannerElement.style.display = 'flex';
        }
    }

    // Sembunyikan banner dan simpan ke localStorage
    function hideBanner() {
        if (bannerElement) {
            bannerElement.style.display = 'none';
            localStorage.setItem('pwaInstallBannerClosed', 'true');
        }
    }

    // Inisialisasi event listener
    function initBannerEvents() {
        const installBtn = document.getElementById('installBtn');
        const closeBtn = document.getElementById('closeBannerBtn');
        
        if (installBtn) {
            installBtn.addEventListener('click', async function() {
                if (deferredPrompt) {
                    // Munculkan dialog install native
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    console.log(`Hasil install PWA: ${outcome}`);
                    deferredPrompt = null;
                    hideBanner();
                } else {
                    // Fallback manual jika tidak ada prompt
                    alert('Untuk menginstall aplikasi:\n• Android: Buka menu browser → "Install app" / "Add to Home Screen"\n• iPhone: Buka Share → "Add to Home Screen"');
                    hideBanner();
                }
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', hideBanner);
        }
    }

    // Cek apakah banner sudah pernah ditutup
    function isBannerClosed() {
        return localStorage.getItem('pwaInstallBannerClosed') === 'true';
    }

    // Main execution
    function main() {
        // Buat banner terlebih dahulu
        bannerElement = createBanner();
        
        // Jika banner sudah pernah ditutup, jangan tampilkan
        if (isBannerClosed()) return;
        
        // Tangkap event beforeinstallprompt (PWA)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            showBanner();
        });
        
        // Fallback: jika dalam 3 detik tidak ada event beforeinstallprompt (misal browser tidak support atau sudah terinstall), tetap tampilkan banner untuk panduan manual
        setTimeout(() => {
            if (!deferredPrompt && bannerElement && !isBannerClosed()) {
                showBanner();
            }
        }, 3000);
        
        // Inisialisasi tombol setelah banner masuk ke DOM
        setTimeout(initBannerEvents, 100);
    }

    // Jalankan setelah DOM siap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', main);
    } else {
        main();
    }
})();

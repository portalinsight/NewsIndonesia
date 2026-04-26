// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDC8hsDbX3qb9XLY7H2ChdXK6AxRPXD2q0",
    authDomain: "dataku-40827.firebaseapp.com",
    databaseURL: "https://dataku-40827-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dataku-40827",
    storageBucket: "dataku-40827.firebasestorage.app"
};
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let allNews = [];
let currentPage = 1;
const itemsPerPage = 9;

// Helper functions
function escapeHtml(s) { if (!s) return ''; return s.replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }
function formatDate(d) { if (!d) return 'Baru saja'; const diff = Math.floor((new Date() - new Date(d))/(1000*3600)); if(diff<1) return 'Baru saja'; if(diff<24) return `${diff} jam lalu`; return new Date(d).toLocaleDateString('id-ID'); }
function formatNumber(n) { if(n>=1e6) return (n/1e6).toFixed(1)+'M'; if(n>=1e3) return (n/1e3).toFixed(1)+'K'; return n?.toString()||'0'; }
function getCategoryLabel(cat) { const labels={breaking:'BREAKING',trending:'TRENDING',hot:'HOT',politik:'POLITIK',daerah:'DAERAH',ekonomi:'EKONOMI'}; return labels[cat]||cat.toUpperCase(); }

async function loadNews() {
    const snapshot = await database.ref('news').once('value');
    const data = snapshot.val();
    if (data) {
        allNews = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        allNews.sort((a,b) => new Date(b.date) - new Date(a.date));
    } else {
        allNews = [];
    }
    return allNews;
}

// Render untuk halaman beranda (index.html) – lengkap dengan hero, horizontal, dll
async function initHome() {
    await loadNews();
    renderHero();
    renderHorizontal();
    renderBreakingTicker();
    renderNewsGrid('newsGrid', null, 1);
    renderSidebar();
    updateDateTime();
    setInterval(updateDateTime, 60000);
}

// Render untuk halaman kategori (breaking, trending, hot, politik, daerah, ekonomi)
async function initCategory(category) {
    await loadNews();
    renderNewsGrid('newsGrid', category, 1);
    renderSidebar();
    updateDateTime();
    setInterval(updateDateTime, 60000);
}

function renderHero() {
    const heroMain = document.getElementById('heroMain');
    const heroSide = document.getElementById('heroSide');
    if (!heroMain) return;
    const breaking = allNews.filter(n => n.category === 'breaking' && !n.isShort).slice(0,4);
    const main = breaking[0];
    const side = breaking.slice(1,3);
    if (main) {
        heroMain.innerHTML = `<img src="${main.image || 'https://picsum.photos/800/450'}" onerror="this.src='https://picsum.photos/800/450'"><div class="hero-content"><span class="hero-category">BREAKING NEWS</span><div class="hero-title">${escapeHtml(main.title)}</div></div>`;
        heroMain.onclick = () => location.href = `detail.html?id=${main.id}`;
    } else {
        heroMain.innerHTML = '<div style="background:#334155;height:100%;display:flex;align-items:center;justify-content:center">Tidak ada breaking</div>';
    }
    if (heroSide) {
        if (side.length) heroSide.innerHTML = side.map(n => `<div class="hero-side-item" onclick="location.href='detail.html?id=${n.id}'"><img src="${n.image || 'https://picsum.photos/100/80'}" onerror="this.src='https://picsum.photos/100/80'"><h4>${escapeHtml(n.title)}</h4></div>`).join('');
        else heroSide.innerHTML = '<div style="padding:20px;text-align:center">Tidak ada breaking</div>';
    }
}

function renderHorizontal() {
    const container = document.getElementById('horizontalTrending');
    if (!container) return;
    const trending = allNews.filter(n => n.category === 'trending' && !n.isShort).slice(0,10);
    if (!trending.length) { container.innerHTML = '<div>Tidak ada trending</div>'; return; }
    container.innerHTML = trending.map(n => `<div class="h-scroll-card" onclick="location.href='detail.html?id=${n.id}'"><img src="${n.image || 'https://picsum.photos/280/150'}" onerror="this.src='https://picsum.photos/280/150'"><div class="card-content"><span class="category category-${n.category}">${getCategoryLabel(n.category)}</span><div class="title">${escapeHtml(n.title)}</div></div></div>`).join('');
}

function renderBreakingTicker() {
    const ticker = document.getElementById('tickerContent');
    if (!ticker) return;
    const breaking = allNews.filter(n => n.category === 'breaking' && !n.isShort).slice(0,8);
    if (breaking.length) ticker.innerHTML = breaking.map(n => `<span onclick="location.href='detail.html?id=${n.id}'">🔴 ${escapeHtml(n.title)}</span>`).join('');
    else ticker.innerHTML = '<span>🔴 Tidak ada breaking news</span>';
}

function renderNewsGrid(containerId, category = null, page = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;
    let filtered = category ? allNews.filter(n => n.category === category && !n.isShort) : allNews.filter(n => !n.isShort);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const start = (page - 1) * itemsPerPage;
    const paginated = filtered.slice(start, start + itemsPerPage);
    if (paginated.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:60px">Belum ada berita di kategori ini</div>';
        document.getElementById('pagination') && (document.getElementById('pagination').innerHTML = '');
        return;
    }
    container.innerHTML = paginated.map(n => `
        <div class="news-card" onclick="location.href='detail.html?id=${n.id}'">
            <img src="${n.image || 'https://picsum.photos/400/250'}" onerror="this.src='https://picsum.photos/400/250'">
            <div class="card-content">
                <span class="category category-${n.category}">${getCategoryLabel(n.category)}</span>
                <div class="title">${escapeHtml(n.title)}</div>
                <div class="date"><span><i class="far fa-clock"></i> ${formatDate(n.date)}</span><span><i class="far fa-eye"></i> ${formatNumber(n.views)}</span></div>
            </div>
        </div>
    `).join('');
    const counter = document.getElementById('newsCounter');
    if (counter) counter.innerHTML = `<div class="news-counter">Menampilkan ${start+1} - ${Math.min(start+itemsPerPage, filtered.length)} dari ${filtered.length} berita</div>`;
    renderPagination(totalPages, page, category);
}

function renderPagination(totalPages, currentPage, category) {
    const container = document.getElementById('pagination');
    if (!container) return;
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let html = `<div class="pagination-item ${currentPage === 1 ? 'disabled' : ''}" onclick="goToPage(${currentPage-1}, '${category}')">Sebelumnya</div>`;
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage-2 && i <= currentPage+2)) {
            html += `<div class="pagination-item ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i}, '${category}')">${i}</div>`;
        } else if (i === currentPage-3 || i === currentPage+3) {
            html += `<span class="pagination-dots">...</span>`;
        }
    }
    html += `<div class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}" onclick="goToPage(${currentPage+1}, '${category}')">Berikutnya</div>`;
    container.innerHTML = html;
}

function goToPage(page, category) {
    currentPage = page;
    renderNewsGrid('newsGrid', category === 'null' ? null : category, page);
    document.getElementById('newsGrid')?.scrollIntoView({ behavior: 'smooth' });
}

function renderSidebar() {
    const trending = [...allNews.filter(n => !n.isShort)].sort((a,b) => b.views - a.views).slice(0,5);
    const hot = allNews.filter(n => n.category === 'hot' && !n.isShort).slice(0,5);
    const trendingList = document.getElementById('trendingList');
    const hotList = document.getElementById('hotList');
    if (trendingList) trendingList.innerHTML = trending.map((n,i) => `<li onclick="location.href='detail.html?id=${n.id}'"><div class="trending-number">${i+1}</div><div>${escapeHtml(n.title)}</div></li>`).join('');
    if (hotList) hotList.innerHTML = hot.map(n => `<li onclick="location.href='detail.html?id=${n.id}'"><div class="trending-number"><i class="fas fa-fire"></i></div><div>${escapeHtml(n.title)}</div></li>`).join('');
}

function updateDateTime() {
    const el = document.getElementById('datetime');
    if (el) el.innerHTML = new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' });
}

// Dark mode
function initDarkMode() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark');
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) icon.className = 'fas fa-sun';
    }
}
function toggleDarkMode() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    const icon = document.querySelector('#darkModeToggle i');
    if (isDark) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('darkMode', 'disabled');
    }
}
document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);
initDarkMode();

// Deteksi halaman dan jalankan init yang sesuai
window.goToPage = goToPage;
window.initHome = initHome;
window.initCategory = initCategory;


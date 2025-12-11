// Navigation
function navigate(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById('mainNav').classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleNav() {
    document.getElementById('mainNav').classList.toggle('active');
}

function toggleDropdown(e) {
    if (window.innerWidth <= 968) {
        e.preventDefault();
        e.target.closest('.nav-dropdown').classList.toggle('active');
    }
}

// CURSOR STARS EFFECT
const starsContainer = document.getElementById('cursor-stars');
let mouseX = 0;
let mouseY = 0;
let lastStarTime = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Créer une étoile toutes les 50ms
    const now = Date.now();
    if (now - lastStarTime > 50) {
        createStar(mouseX, mouseY);
        lastStarTime = now;
    }
});

function createStar(x, y) {
    const star = document.createElement('div');
    star.className = 'cursor-star';
    star.style.left = x + 'px';
    star.style.top = y + 'px';
    starsContainer.appendChild(star);
    
    // Supprimer l'étoile après l'animation
    setTimeout(() => {
        star.remove();
    }, 800);
}

// Unlock Gifts
function unlockGifts() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('gifts-content').style.display = 'block';
    setTimeout(() => loadGifts(), 500);
}

// Variables
let allGifts = [];
let currentFilter = 'all';
let currentView = 'grid';

// Load Gifts
function loadGifts() {
    if (typeof window.tiktokRealGifts === 'undefined') {
        document.addEventListener('giftsLoaded', () => loadGifts());
        return;
    }
    
    allGifts = window.tiktokRealGifts;
    document.getElementById('giftsCount').textContent = allGifts.length;
    document.getElementById('loading').style.display = 'none';
    displayGifts();
}

// Display Gifts
function displayGifts() {
    const grid = document.getElementById('giftsGrid');
    grid.innerHTML = '';
    
    let filtered = allGifts;
    
    // Filter by category
    if (currentFilter !== 'all') {
        filtered = allGifts.filter(gift => {
            const d = gift.diamonds;
            switch(currentFilter) {
                case 'common': return d >= 1 && d <= 99;
                case 'rare': return d >= 100 && d <= 999;
                case 'epic': return d >= 1000 && d <= 9999;
                case 'legendary': return d >= 10000 && d <= 19999;
                case 'mythic': return d >= 20000;
                default: return true;
            }
        });
    }
    
    // Filter by search
    const search = document.getElementById('searchInput').value.toLowerCase();
    if (search) {
        filtered = filtered.filter(gift => 
            gift.name.toLowerCase().includes(search)
        );
    }
    
    // Display
    filtered.forEach(gift => {
        const card = document.createElement('div');
        card.className = 'gift-card';
        card.innerHTML = `
            <img src="${gift.image}" alt="${gift.name}" class="gift-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22%3E%3Crect fill=%22%23E63946%22 width=%2280%22 height=%2280%22/%3E%3Ctext x=%2240%22 y=%2240%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2230%22 fill=%22white%22%3E🎁%3C/text%3E%3C/svg%3E'">
            <div class="gift-name">${gift.name}</div>
            <div class="gift-price">${gift.diamonds} 💎</div>
        `;
        grid.appendChild(card);
    });
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 4rem 0;">Aucun cadeau trouvé</p>';
    }
}

// Search
function searchGifts() {
    displayGifts();
}

// Filter
function filterByCategory(category) {
    currentFilter = category;
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });
    
    displayGifts();
}

// View Toggle
function setView(view) {
    currentView = view;
    const grid = document.getElementById('giftsGrid');
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
    if (view === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
}

// Init
window.addEventListener('load', () => {
    document.querySelectorAll('.logo-img, .hero-logo, .footer-logo').forEach(img => {
        img.src = 'logo.png';
    });
});

console.log('🎮 ZYNGAAA CREATOR - System Online ⭐');

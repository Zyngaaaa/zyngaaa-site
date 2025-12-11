// ================================================================
// ZYNGAAA CREATOR - FRONTEND
// ================================================================

// Configuration
const AUTH_BACKEND = 'http://localhost:3000'; // Change en prod !

// Navigation
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    // Fermer le menu mobile
    document.getElementById('mainNav').classList.remove('active');
    
    // Check auth si on va sur la page gifts
    if (page === 'gifts') {
        checkAuth();
    }
}

// Toggle mobile nav
function toggleNav() {
    document.getElementById('mainNav').classList.toggle('active');
}

// Toggle dropdown
function toggleDropdown() {
    const dropdown = document.querySelector('.nav-dropdown');
    dropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
        document.querySelector('.nav-dropdown')?.classList.remove('active');
    }
});

// === AUTHENTIFICATION ===

// Redirect to Discord OAuth2
function redirectToDiscordAuth() {
    window.location.href = `${AUTH_BACKEND}/auth/login`;
}

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch(`${AUTH_BACKEND}/auth/check`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.authenticated) {
            unlockGifts(data.user);
        }
    } catch (error) {
        console.error('Erreur vérification auth:', error);
    }
}

// Unlock gifts page
function unlockGifts(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('gifts-content').style.display = 'block';
    
    // Afficher le nom de l'user (optionnel)
    if (user && user.username) {
        console.log(`✅ Connecté en tant que ${user.username}`);
    }
    
    setTimeout(() => loadGifts(), 500);
}

// Logout
async function logout() {
    try {
        await fetch(`${AUTH_BACKEND}/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        location.reload();
    } catch (error) {
        console.error('Erreur déconnexion:', error);
    }
}

// Handle OAuth callback
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const authError = urlParams.get('error');
    
    if (authStatus === 'success') {
        // Rediriger vers la page gifts
        navigate('gifts');
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authError) {
        let errorMsg = 'Erreur d\'authentification';
        if (authError === 'not_in_guild') {
            errorMsg = '❌ Tu dois être membre du serveur Discord Zyngaaa Community pour accéder aux cadeaux TikTok !\n\n🔗 Rejoins-nous : https://discord.gg/ceUBr7Cu';
        } else if (authError === 'no_code') {
            errorMsg = '❌ Erreur : Code d\'autorisation manquant';
        } else if (authError === 'auth_failed') {
            errorMsg = '❌ Erreur lors de l\'authentification. Réessaye.';
        }
        alert(errorMsg);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Check auth si on est sur la page gifts
    const hash = window.location.hash.substring(1);
    if (hash === 'gifts' || document.getElementById('gifts').classList.contains('active')) {
        checkAuth();
    }
});

// === GIFTS PAGE ===

let allGifts = [];
let currentView = 'grid';
let currentFilter = 'all';

function loadGifts() {
    if (typeof window.tiktokRealGifts === 'undefined') {
        console.error('Gifts data not loaded');
        return;
    }
    
    allGifts = window.tiktokRealGifts;
    displayGifts(allGifts);
    updateCount(allGifts.length);
}

function displayGifts(gifts) {
    const container = document.getElementById('gifts-grid');
    container.innerHTML = '';
    container.className = `gifts-${currentView}`;
    
    gifts.forEach(gift => {
        const giftCard = document.createElement('div');
        giftCard.className = 'gift-card';
        
        giftCard.innerHTML = `
            <div class="gift-image">
                <img src="${gift.image}" alt="${gift.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2250%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23666%22 font-size=%2212%22>🎁</text></svg>'">
            </div>
            <div class="gift-info">
                <div class="gift-name">${gift.name}</div>
                <div class="gift-price">💎 ${gift.diamonds.toLocaleString()}</div>
            </div>
        `;
        
        container.appendChild(giftCard);
    });
}

function searchGifts() {
    const query = document.getElementById('search-input').value.toLowerCase();
    let filtered = allGifts;
    
    if (query) {
        filtered = allGifts.filter(gift => 
            gift.name.toLowerCase().includes(query)
        );
    }
    
    filtered = applyPriceFilter(filtered);
    displayGifts(filtered);
    updateCount(filtered.length);
}

function filterByPrice(filter) {
    currentFilter = filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    let filtered = applyPriceFilter(allGifts);
    
    const query = document.getElementById('search-input').value.toLowerCase();
    if (query) {
        filtered = filtered.filter(gift => 
            gift.name.toLowerCase().includes(query)
        );
    }
    
    displayGifts(filtered);
    updateCount(filtered.length);
}

function applyPriceFilter(gifts) {
    if (currentFilter === 'all') return gifts;
    
    const ranges = {
        '1-99': [1, 99],
        '100-999': [100, 999],
        '1k-9.9k': [1000, 9999],
        '10k-19.9k': [10000, 19999],
        '20k+': [20000, Infinity]
    };
    
    const [min, max] = ranges[currentFilter];
    return gifts.filter(gift => gift.diamonds >= min && gift.diamonds <= max);
}

function toggleView() {
    currentView = currentView === 'grid' ? 'list' : 'grid';
    const btn = event.target.closest('button');
    btn.textContent = currentView === 'grid' ? '☰ Liste' : '⊞ Grille';
    displayGifts(applyPriceFilter(allGifts));
}

function updateCount(count) {
    document.getElementById('giftsCount').textContent = count;
}

// === CURSOR STARS ===

let lastStarTime = 0;
const starThrottle = 50;

document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastStarTime < starThrottle) return;
    lastStarTime = now;
    
    createStar(e.pageX, e.pageY);
});

function createStar(x, y) {
    const star = document.createElement('div');
    star.className = 'cursor-star';
    star.style.left = x + 'px';
    star.style.top = y + 'px';
    
    document.getElementById('cursor-stars').appendChild(star);
    
    setTimeout(() => {
        star.remove();
    }, 800);
}

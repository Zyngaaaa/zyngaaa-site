// ================================================================
// ZYNGAAA CREATOR - FRONTEND
// ================================================================

// Configuration
const BOT_API = 'http://game01.octoheberg.fr:3013';

// Clé de stockage
const SESSION_KEY = 'zyngaaa_auth_token';

// Navigation
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    document.getElementById('mainNav').classList.remove('active');
    
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

// === AUTHENTIFICATION DISCORD ===

// Redirect to Discord OAuth2
function redirectToDiscordAuth() {
    window.location.href = `${BOT_API}/auth/login`;
}

// Check authentication status
async function checkAuth() {
    const token = localStorage.getItem(SESSION_KEY);
    
    if (!token) {
        // Pas de token, afficher le bouton de connexion
        return;
    }
    
    try {
        const response = await fetch(`${BOT_API}/api/check-auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
        
        const data = await response.json();
        
        if (data.authenticated) {
            unlockGifts({ username: data.username });
        } else {
            // Session invalide, supprimer le token
            localStorage.removeItem(SESSION_KEY);
        }
    } catch (error) {
        console.error('Erreur vérification auth:', error);
    }
}

// Unlock gifts page
function unlockGifts(user) {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('gifts-content').style.display = 'block';
    
    // Message de bienvenue
    if (user && user.username) {
        console.log(`✅ Connecté en tant que ${user.username}`);
        
        const welcomeMsg = document.createElement('div');
        welcomeMsg.style.cssText = 'position: fixed; top: 80px; right: 20px; background: linear-gradient(135deg, #ff006e, #8b00ff); padding: 15px 25px; border-radius: 10px; color: white; font-weight: bold; z-index: 9999; box-shadow: 0 8px 32px rgba(0,0,0,0.3);';
        welcomeMsg.innerHTML = `👋 Bienvenue ${user.username} !`;
        document.body.appendChild(welcomeMsg);
        
        setTimeout(() => {
            welcomeMsg.style.opacity = '0';
            welcomeMsg.style.transition = 'opacity 0.5s';
            setTimeout(() => welcomeMsg.remove(), 500);
        }, 3000);
    }
    
    setTimeout(() => loadGifts(), 500);
}

// Logout
async function logout() {
    const token = localStorage.getItem(SESSION_KEY);
    
    try {
        await fetch(`${BOT_API}/api/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })
        });
    } catch (error) {
        console.error('Erreur déconnexion:', error);
    }
    
    localStorage.removeItem(SESSION_KEY);
    location.reload();
}

// Handle OAuth callback
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const authError = urlParams.get('error');
    const token = urlParams.get('token');
    
    if (authStatus === 'success' && token) {
        // Sauvegarder le token
        localStorage.setItem(SESSION_KEY, token);
        
        // Nettoyer l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Rediriger vers la page gifts
        navigate('gifts');
    } else if (authError) {
        let errorMsg = 'Erreur d\'authentification';
        
        if (authError === 'not_in_guild') {
            errorMsg = '❌ Tu dois être membre du serveur Discord Zyngaaa Community pour accéder aux cadeaux TikTok !\n\n🔗 Rejoins-nous : https://discord.gg/ceUBr7Cu';
        } else if (authError === 'no_code') {
            errorMsg = '❌ Erreur : Code d\'autorisation manquant';
        } else if (authError === 'auth_failed') {
            errorMsg = '❌ Erreur lors de l\'authentification. Réessaye.';
        } else if (authError === 'invalid_state') {
            errorMsg = '❌ Erreur de sécurité. Réessaye.';
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
    
    // Masquer le loading
    document.getElementById('loading').style.display = 'none';
}

function displayGifts(gifts) {
    const container = document.getElementById('giftsGrid');
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
    const query = document.getElementById('searchInput').value.toLowerCase();
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

function filterByCategory(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === category) {
            btn.classList.add('active');
        }
    });
    
    let filtered = applyPriceFilter(allGifts);
    
    const query = document.getElementById('searchInput').value.toLowerCase();
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
        'common': [1, 99],
        'rare': [100, 999],
        'epic': [1000, 9999],
        'legendary': [10000, 19999],
        'mythic': [20000, Infinity]
    };
    
    const [min, max] = ranges[currentFilter];
    return gifts.filter(gift => gift.diamonds >= min && gift.diamonds <= max);
}

function setView(view) {
    currentView = view;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.view === view) {
            btn.classList.add('active');
        }
    });
    
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

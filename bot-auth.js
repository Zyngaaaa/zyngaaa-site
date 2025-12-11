// ================================================================
// CODE D'AUTHENTIFICATION À AJOUTER À TON BOT DISCORD
// ================================================================

const express = require('express');
const session = require('express-session');
const axios = require('axios');
const cors = require('cors');

// === CONFIGURATION ===
const AUTH_PORT = process.env.AUTH_PORT || 3000;
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/callback';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const SESSION_SECRET = process.env.SESSION_SECRET || 'zyngaaa-ultra-secret-key';

// === EXPRESS APP ===
const app = express();

app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    }
}));

// === ROUTES D'AUTHENTIFICATION ===

// 1. Redirection vers Discord OAuth2
app.get('/auth/login', (req, res) => {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    res.redirect(authUrl);
});

// 2. Callback Discord
app.get('/callback', async (req, res) => {
    const { code } = req.query;
    
    if (!code) {
        return res.redirect(`${FRONTEND_URL}?error=no_code`);
    }
    
    try {
        // Échanger le code contre un access token
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: DISCORD_REDIRECT_URI
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        const { access_token } = tokenResponse.data;
        
        // Récupérer les infos de l'utilisateur
        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const user = userResponse.data;
        
        // Vérifier si l'utilisateur est dans le serveur
        const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
            headers: {
                Authorization: `Bearer ${access_token}`
            }
        });
        
        const guilds = guildsResponse.data;
        const isInGuild = guilds.some(guild => guild.id === DISCORD_GUILD_ID);
        
        if (!isInGuild) {
            return res.redirect(`${FRONTEND_URL}?error=not_in_guild`);
        }
        
        // Sauvegarder l'utilisateur en session
        req.session.user = {
            id: user.id,
            username: user.username,
            discriminator: user.discriminator,
            avatar: user.avatar,
            authenticated: true
        };
        
        // Rediriger vers le frontend
        res.redirect(`${FRONTEND_URL}?auth=success`);
        
    } catch (error) {
        console.error('Erreur OAuth2:', error.response?.data || error.message);
        res.redirect(`${FRONTEND_URL}?error=auth_failed`);
    }
});

// 3. Vérifier l'authentification
app.get('/auth/check', (req, res) => {
    if (req.session.user && req.session.user.authenticated) {
        res.json({
            authenticated: true,
            user: {
                username: req.session.user.username,
                id: req.session.user.id,
                avatar: req.session.user.avatar
            }
        });
    } else {
        res.json({
            authenticated: false
        });
    }
});

// 4. Déconnexion
app.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Erreur lors de la déconnexion' });
        }
        res.json({ success: true });
    });
});

// === DÉMARRAGE DU SERVEUR ===
function startAuthServer() {
    app.listen(AUTH_PORT, () => {
        console.log(`🔐 Serveur d'authentification démarré sur le port ${AUTH_PORT}`);
        console.log(`📍 Callback URL: ${DISCORD_REDIRECT_URI}`);
        console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
    });
}

// === EXPORT ===
module.exports = { startAuthServer };

// Si tu lances ce fichier directement
if (require.main === module) {
    startAuthServer();
}

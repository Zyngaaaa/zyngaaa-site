# 🔥 INTÉGRATION DANS TON BOT

Guide pour ajouter l'auth OAuth2 à ton bot existant ! 🎯

---

## 📝 ÉTAPE 1 : AJOUTER LES DÉPENDANCES

### Dans ton package.json, ajoute :
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "axios": "^1.6.0",
    "cors": "^2.8.5"
  }
}
```

### Puis installe :
```bash
npm install
```

---

## 📝 ÉTAPE 2 : AJOUTER AU .ENV

### Modifie ton fichier .env :
```env
# === DÉJÀ PRÉSENT ===
DISCORD_TOKEN=MTQzNDU2ODM4NzU4MDkyMzk0NA.GScTis....
CLIENT_ID=1434568387580923944
GUILD_ID=1325639972249796629

# === À AJOUTER ===
# Client Secret de ton application Discord
DISCORD_CLIENT_SECRET=ton_client_secret_ici

# URL de callback (doit être dans Discord Developer Portal)
DISCORD_REDIRECT_URI=http://localhost:3000/callback

# URL du site web
FRONTEND_URL=http://localhost:8080

# Port du serveur d'auth
AUTH_PORT=3000

# Secret pour les sessions
SESSION_SECRET=change-moi-en-production-zyngaaa
```

---

## 📝 ÉTAPE 3 : RÉCUPÉRER LE CLIENT SECRET

### 1. Va sur Discord Developer Portal
👉 https://discord.com/developers/applications

### 2. Trouve ton application
- Elle doit déjà exister (CLIENT_ID: 1434568387580923944)

### 3. Va dans OAuth2 → General
- Clique sur **"Reset Secret"**
- Copie le secret → Met-le dans `.env`

### 4. Ajoute la Redirect URI
- Section **"Redirects"**
- Ajoute : `http://localhost:3000/callback`
- **Save Changes**

---

## 📝 ÉTAPE 4 : AJOUTER LE FICHIER AUTH

### Copie le fichier src-auth.js dans ton projet :
```bash
cp src-auth.js /chemin/vers/ton/bot/src/auth.js
```

---

## 📝 ÉTAPE 5 : MODIFIER TON index.js

### À la ligne 18 (après `require("./db");`), ajoute :
```javascript
require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Partials,
    Events,
    PermissionsBitField,
    EmbedBuilder,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require("discord.js");

const { loadCommands } = require("./handlers/loadCommands");
require("./db");

// === AJOUT ICI ===
const { startAuthServer } = require("./auth");
// =================

/* ─────────────────── CLIENT ─────────────────── */

const client = new Client({
    // ...
});
```

### À la ligne 65 (après le console.log du ready), ajoute :
```javascript
client.once(Events.ClientReady, (c) => {
    console.log(`🔗 Connecté en tant que ${c.user.tag}`);
    
    // === AJOUT ICI ===
    startAuthServer();
    // =================
});
```

---

## 📝 ÉTAPE 6 : TESTE !

### 1. Démarre ton bot
```bash
node src/index.js
```

Tu devrais voir :
```
🔗 Connecté en tant que TonBot#1234
🔐 Serveur d'authentification sur le port 3000
📍 Callback: http://localhost:3000/callback
🌐 Frontend: http://localhost:8080
```

### 2. Ouvre le site web
```bash
# Dans un autre terminal
cd /chemin/vers/le/site
python -m http.server 8080
```

### 3. Teste l'auth
1. Va sur http://localhost:8080
2. Clique sur TikTok → Cadeaux TikTok
3. Clique sur "Se connecter avec Discord"
4. Popup Discord → Autoriser
5. Tu es redirigé → **Cadeaux débloqués ! 🎉**

---

## 🚀 DÉPLOIEMENT

### En production :

#### 1. Met à jour le .env :
```env
DISCORD_REDIRECT_URI=https://ton-domaine.com/callback
FRONTEND_URL=https://ton-site.com
NODE_ENV=production
SESSION_SECRET=un-secret-ultra-secure-change-moi
```

#### 2. Ajoute dans Discord Developer Portal :
- OAuth2 → Redirects
- Ajoute : `https://ton-domaine.com/callback`

#### 3. Modifie script.js du site (ligne 8) :
```javascript
const AUTH_BACKEND = 'https://ton-domaine.com';
```

---

## ✅ CHECKLIST

- [ ] Dépendances installées (`npm install`)
- [ ] CLIENT_SECRET ajouté au .env
- [ ] Redirect URI configurée dans Discord
- [ ] Fichier auth.js copié dans /src/
- [ ] index.js modifié (2 lignes ajoutées)
- [ ] Bot démarré
- [ ] Site web ouvert
- [ ] Test d'auth réussi

---

## 🐛 PROBLÈMES ?

### "Invalid redirect_uri"
➜ Vérifie que l'URL est bien ajoutée dans Discord Developer Portal

### "not_in_guild"
➜ L'user n'est pas sur ton serveur Discord

### Port déjà utilisé
➜ Change AUTH_PORT dans .env (ex: 3001)

### CORS Error
➜ Vérifie FRONTEND_URL dans .env

---

**🔥 TON BOT GÈRE MAINTENANT L'AUTH ! 🔥**
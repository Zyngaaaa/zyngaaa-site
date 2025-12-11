# 🌐 ZYNGAAA SITE - GitHub Pages

## 📦 Contenu

✅ Site web complet  
✅ OAuth2 Discord configuré  
✅ Design moderne et responsive  

## 🚀 Installation sur GitHub Pages

### 1. Upload sur GitHub

Tu as créé le repo : `Zyngaaaa/zyngaaa-site`

Maintenant upload **TOUS** ces fichiers :
- `index.html`
- `script.js` (déjà configuré avec l'URL du bot)
- `style.css`
- `tiktok-gifts.js`
- `logo.png`

**Depuis GitHub.com** :
1. Va dans ton repo
2. Clique sur "uploading an existing file"
3. Glisse-dépose les 5 fichiers
4. Commit changes

### 2. Activer GitHub Pages

1. **Settings** → **Pages**
2. **Source** : `main` branch
3. **Save**

### 3. Configurer ton domaine

**A. Dans GitHub** :
1. Toujours dans **Settings** → **Pages**
2. Sous **Custom domain** : `zyngaaacréator.fr`
3. **Save**
4. Coche **Enforce HTTPS** (attends quelques minutes)

**B. Chez ton registrar DNS** :

Ajoute ces records :

**Type A** :
```
@ → 185.199.108.153
@ → 185.199.109.153
@ → 185.199.110.153
@ → 185.199.111.153
```

**Type CNAME** :
```
www → Zyngaaaa.github.io
```

### 4. Attendre

Attends 10-30 minutes que les DNS se propagent.

## 🎉 Ton site sera sur :

**https://zyngaaacréator.fr**

## ⚙️ Configuration

Le fichier `script.js` est déjà configuré avec :
```javascript
const BOT_API = 'http://game01.octoheberg.fr:3013';
```

## 🔗 Liens importants

- Site : https://zyngaaacréator.fr
- Bot API : http://game01.octoheberg.fr:3013
- Discord : https://discord.gg/ceUBr7Cu

## ✅ Comment ça marche

1. L'utilisateur clique sur "Se connecter avec Discord"
2. Il est redirigé vers Discord OAuth2
3. Il autorise l'application
4. Discord le renvoie sur le bot
5. Le bot vérifie qu'il est membre du serveur
6. Le bot crée une session et redirige vers le site
7. L'utilisateur voit les cadeaux TikTok ! 🎁

## 📝 Note

Pas besoin de modifier quoi que ce soit, tout est déjà configuré ! 😊

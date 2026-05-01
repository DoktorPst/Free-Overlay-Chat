# 🩸 Blood Chat — Diablo Edition

## 🔥 Présentation
**Blood Chat — Diablo Edition** est un widget de chat overlay avancé pour stream (Twitch / OBS), conçu pour transformer un chat classique en expérience visuelle immersive inspirée de l’univers Diablo.

---

## 🖼️ Aperçu

![Preview 1](https://i.ibb.co/HpR2YvqP/image.png)
![Preview 2](https://i.ibb.co/hnbSV2K/image.png)

---

## ⚙️ Fonctionnement

Le projet repose sur 4 composants principaux :

- `HTML.html` → Structure du widget  
- `CSS.css` → Design + animations + effets visuels  
- `JS.js` → Logique dynamique du chat  
- `FIELDS.json` → Configuration complète  

---

## 🧠 Logique technique

### 📩 Injection des messages
Chaque message :
- est filtré (bots, commandes…)
- est analysé (viewer, sub, mod, VIP…)
- est injecté dynamiquement dans le chat

---

### 🎨 Rendu visuel
Chaque message génère :
- une bulle stylisée
- des effets de sang dynamiques (SVG)
- une animation d’entrée et sortie
- un style spécifique selon le rôle utilisateur

---

### ✨ Effets spéciaux

- 🔴 Sang dynamique (couleur selon badge)
- 💥 Flash si mention du streamer
- ⭐ Effet premier message
- 🌪️ Shake si chat actif
- 🔥 Flammes, braises, runes animées
- 👻 Mode idle (messages fantômes)

---

### 👁️ Gestion de visibilité
Le widget :
- apparaît à l’arrivée d’un message
- disparaît après inactivité
- affiche un mode idle visuel

---

## 🎛️ Personnalisation

Tout est configurable dans `FIELDS.json`

### 🎨 Visuel
- Couleurs (fond, texte, sang)
- Opacité
- Taille du widget
- Typographie

### 🩸 Effets
- Intensité du sang
- Animations
- Effets spéciaux (flash, shake…)

### 🔥 Ambiance Diablo
- Flammes
- Braises
- Drips
- Runes

### 📐 Layout
- Nombre de messages
- Espacement
- Taille du chat

---

## 🚀 Installation (méthode correcte)

### 1. Aller sur StreamElements
- Connecte-toi sur ton compte StreamElements
- Va dans **Overlays**

---

### 2. Créer un overlay
- Clique sur **New Overlay**
- Choisis ta résolution
- Ouvre l’éditeur

---

### 3. Ajouter un widget custom
- Clique sur **Add Widget**
- Choisis **Custom Widget**

---

### 4. Importer les fichiers du projet

Dans le widget :

- Onglet **HTML** → colle le contenu de `HTML.html`  
- Onglet **CSS** → colle le contenu de `CSS.css`  
- Onglet **JS** → colle le contenu de `JS.js`  
- Onglet **Fields** → colle le contenu de `FIELDS.json`  

---

### 5. Sauvegarder
- Clique sur **Done**
- Sauvegarde l’overlay

---

### 6. Ajouter dans OBS
- Copie l’URL de l’overlay
- Ajoute une **source navigateur** dans OBS
- Colle l’URL

---

## 💡 Points forts

- Ultra personnalisable
- Effets visuels uniques
- Réactif au comportement du chat
- Direction artistique immersive (Diablo)

---

## ⚠️ Limitations

- Fonctionne uniquement via StreamElements
- Peut être gourmand si beaucoup d’effets activés

---

## 📌 Conclusion

Ce projet transforme le chat en élément visuel central du stream.

Ce n’est pas un simple overlay, c’est une **expérience interactive immersive**.

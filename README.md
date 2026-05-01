# 🩸 Blood Chat — Diablo Edition

## 🔥 Présentation
**Blood Chat — Diablo Edition** est un widget de chat overlay avancé pour stream (Twitch / OBS), conçu pour transformer un chat classique en expérience visuelle immersive inspirée de l’univers Diablo.

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
- un style selon le rôle utilisateur

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

## 🧩 Structure

- Header → Titre + décor
- Bannière → Nom de chaîne
- Body → Zone chat
- Footer → Flammes + effets

---

## 🚀 Installation

1. Upload les fichiers dans le repo
2. Connecter le widget à StreamElements / OBS
3. Configurer `FIELDS.json`
4. Ajouter en source navigateur dans OBS

---

## 💡 Points forts

- Ultra personnalisable
- Effets visuels uniques
- Réactif au comportement du chat
- Direction artistique cohérente

---

## ⚠️ Limitations

- Dépend d’un environnement streaming (StreamElements / OBS)
- Peut être gourmand si beaucoup d’effets activés

---

## 📌 Conclusion

Ce projet transforme le chat en élément visuel central du stream.

Ce n’est pas un overlay classique, c’est une **expérience interactive immersive**.

---

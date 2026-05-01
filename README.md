🩸 Blood Chat — Diablo Edition
🔥 Présentation

Blood Chat — Diablo Edition est un widget de chat overlay avancé pour stream (type Twitch / OBS), avec une direction artistique dark fantasy inspirée de Diablo.

Objectif : transformer un chat classique en expérience visuelle immersive, réactive et personnalisable.

⚙️ Fonctionnement global

Le projet repose sur 4 blocs :

HTML → structure du widget
CSS → design, animations, effets visuels
JavaScript → logique dynamique du chat
FIELDS.json → configuration complète utilisateur

👉 Le widget reçoit des messages (via StreamElements / Streamlabs) et les transforme en éléments visuels animés.

🧠 Logique technique
1. Injection des messages

Chaque message entrant :

est filtré (bots, commandes, longueur)
reçoit un type (viewer, sub, mod, VIP, broadcaster)
est injecté dans le DOM (chat-list)

👉 Géré dans le JS (addMessage)

2. Rendu visuel dynamique

Chaque message génère :

une bulle stylisée
des effets de sang SVG procéduraux
une animation d’entrée / sortie
des variations selon le badge utilisateur

👉 Système de rendu + génération visuelle dans le JS + CSS

3. Système d’effets avancés

Le widget intègre plusieurs mécaniques temps réel :

🔴 Sang dynamique (couleur selon rôle)
💥 Flash si mention du streamer
⭐ Effet spécial premier message
🌪️ Shake si chat actif
🔥 Flammes, braises, runes animées
👻 Mode idle (messages fantômes)

👉 Piloté par des conditions runtime (activité, contenu message)

4. Gestion de visibilité

Le widget :

apparaît quand un message arrive
disparaît après inactivité
passe en mode “idle visuel”

👉 Système d’état (isVisible, idleCycle) dans le JS

🎛️ Personnalisation (FIELDS.json)

Le cœur du projet.

Tu peux configurer :

🎨 Visuel
couleurs (fond, texte, sang)
opacité
taille du widget
typographie
🩸 Effets
intensité du sang
animations entrée / sortie
effets spéciaux (shake, flash…)
🔥 Ambiance Diablo
flammes
braises
drips
runes
👁️ Comportement
durée de vie des messages
nombre max affiché
gestion idle

👉 Tout est modifiable sans toucher au code

🧩 Structure du widget
Header → titre + décor
Bannière → nom de chaîne
Body → zone chat
Footer → flammes + effets

👉 Layout complet défini en HTML

🚀 Installation
Upload les fichiers sur ton repo
Connecte le widget à StreamElements / OBS
Configure via FIELDS.json
Ajoute la source navigateur dans OBS
💡 Points forts
Ultra personnalisable
Effets visuels uniques (pas un chat classique)
Réactif au comportement du chat
Direction artistique cohérente (Diablo)
⚠️ À savoir
Projet orienté overlay streaming
Nécessite un environnement type StreamElements
Peut être gourmand si trop d’effets activés

# Muzungu Capital — 3D-Website

Interaktive One-Page-Website für [Muzungu Capital](https://muzungu-capital.com)
mit Three.js-3D-Hintergrund und Portfolio-Übersicht.

## Features

- **3D-Partikelszene (Three.js):** Eine Partikel-Sphäre mit Drahtgitter-Kern
  morpht beim Scrollen zu einer animierten Wellen-Ebene; die Kamera fährt mit
  und reagiert auf die Maus.
- **3D-Tilt-Karten:** Portfolio- und Fokus-Karten kippen in Echtzeit zur
  Mausposition, inkl. Licht-Glow.
- **Scroll-Reveal & Zähler-Animationen** via IntersectionObserver.
- **Responsiv** mit mobilem Fullscreen-Menü und reduzierter Partikelzahl
  auf kleinen Geräten.
- **Barrierefrei:** respektiert `prefers-reduced-motion`, funktioniert auch
  ohne WebGL (Canvas wird dann ausgeblendet).
- **Kein Build-Schritt:** reines HTML/CSS/JS, Three.js per CDN-Importmap.

## Struktur

```
index.html      Inhalt & Sektionen (Hero, Über uns, Fokus, Portfolio, Ansatz, Kontakt)
css/style.css   Design-System, Layout, Animationen
js/scene.js     Three.js-Hintergrundszene
js/main.js      Nav, Reveal, Zähler, Tilt-Effekte
```

## Lokal starten

Wegen ES-Modulen wird ein lokaler Server benötigt:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 öffnen
```

Die Seite ist statisch und kann direkt z. B. über GitHub Pages, Netlify
oder Vercel deployt werden.

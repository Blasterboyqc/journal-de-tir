# Journal de Tir PLB — PWA

Journal de tir électronique pour le Prolongement Ligne Bleue (PLB) — Métro de Montréal.

## Déploiement

### Vercel (recommandé)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
Glissez-déposez le dossier du projet sur [netlify.com/drop](https://app.netlify.com/drop)

### Serveur local (développement)
```bash
npx serve .
```

## Structure
```
journal-tir/
├── index.html          # Application principale
├── css/style.css       # Styles dark mode
├── js/
│   ├── app.js          # Logique principale
│   ├── parser.js       # Parseur de plans PDF
│   ├── schematic.js    # Générateur SVG
│   └── pdf-import.js   # Import PDF.js
├── lib/
│   ├── pdf.min.mjs     # PDF.js 4.0.379
│   └── pdf.worker.min.mjs
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
└── icons/              # Icônes PWA
```

## Conformité légale
- **E-22, r.1** — Règlement sur les explosifs (Québec)
- **CSTC S-2.1, r.4** — Code de sécurité pour les travaux de construction
- **LCCJTI C-1.1** — Cadre juridique des technologies de l'information
- **DORS/2013-211** — Règlement sur les explosifs (fédéral)

## Fonctionnalités
- 📱 PWA installable sur Android/iOS
- 📴 Fonctionne hors ligne (Service Worker)
- 📄 Import PDF de plans de sautage (PDF.js)
- 📐 Schéma de tir SVG automatique
- 💾 Sauvegarde localStorage + export JSON
- ✍️ Signatures électroniques (LCCJTI)
- 🔐 Piste d'audit SHA-256
- 🖨️ Export PDF (impression navigateur)

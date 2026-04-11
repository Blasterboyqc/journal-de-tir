# 💥 Journal de Tir — Application PWA pour boutefeux québécois

> **Fait par un boutefeu, pour les boutefeux.**

Application Progressive Web App (PWA) pour la documentation et gestion des journaux de tir au Québec. Conforme au Règlement E-22 sur les explosifs.

## 🇨🇦 À propos

Journal de Tir est la première application mobile conçue spécifiquement pour les **boutefeux québécois** :
- ✅ **100% en français québécois** — toute l'interface
- ✅ **Conforme E-22 / CSTC / CNESST** — formulaires réglementaires
- ✅ **Mode hors-ligne** — fonctionne sans connexion internet
- ✅ **Données locales** — tout reste sur votre appareil (IndexedDB)
- ✅ **Installable** — "Ajouter à l'écran d'accueil" sur iOS et Android

## 🛠️ Stack technique

- **SvelteKit** — Framework web moderne
- **Tailwind CSS** — Styles utilitaires
- **Dexie.js** — IndexedDB (stockage offline)
- **jsPDF** — Génération PDF côté client
- **@sveltejs/adapter-static** — Build statique pour Vercel

## 📱 Fonctionnalités

1. **Tableau de bord** — Statistiques rapides, journaux récents
2. **Profil boutefeu** — Certificat CSTC, permis SQ, employeur
3. **Journal de tir** — Formulaire complet conforme E-22 :
   - Identification du chantier
   - Identification du boutefeu et permis
   - Conditions météo et géologie
   - Plan de forage (espacement, fardeau, profondeur...)
   - Explosifs et détonateurs (tableau multi-lignes)
   - Mesures de sécurité (checklist)
   - Résultats du tir et observations
   - Signature électronique
4. **Historique** — Liste, recherche et filtre par statut
5. **Export PDF** — Journal complet en PDF professionnel

## 🚀 Développement

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
```

## 📋 Réglementation

- [Loi sur les explosifs E-22 — LégisQuébec](https://legisquebec.gouv.qc.ca/fr/ShowDoc/cr/e-22,%20r.%201)
- [Règlement CSTC — CNESST](https://www.cnesst.gouv.qc.ca)
- [CCQ — Métier boutefeu-foreur](https://releve.ccq.org/fr-CA/metiers/boutefeu-foreur)

---

*Développé par Raphaël — Boutefeu, PLB Metro Montréal*

import{$ as e,B as t,C as n,E as r,F as i,H as a,J as o,L as s,M as c,N as l,Q as u,R as d,T as f,U as p,V as m,Y as h,_ as g,a as _,b as v,c as y,d as b,g as ee,h as x,l as S,o as C,r as w,u as T,v as E,w as D,x as O,y as k,z as A}from"./J7tXCfCn.js";import"./CT0T0Gak.js";import{o as te}from"./BfYHUnu2.js";var j=O(`<div style="font-size: 13px; color: var(--text); padding: 6px 0;"> </div>`),M=O(`<input type="text" placeholder="ex: 2.5m SOL / 8.5m ROC" style="font-size: 12px;"/>`),N=O(`<div style="font-size: 13px; color: var(--text); padding: 6px 0;"> </div>`),P=O(`<input type="text" placeholder="ex: Emulite 100, 70mm" style="font-size: 12px;"/>`),F=O(`<div style="
              display: flex; align-items: center; gap: 4px;
              padding: 2px 0;
            "><span style="color: var(--accent2);">•</span> <span style="color: var(--text2); font-size: 10px;"> </span></div>`),I=O(`<div style="font-size: 10px; color: var(--text3); font-style: italic; padding: 4px 0;">Couches ↓</div>`),L=O(`<div style="font-size: 12px; color: var(--text2);"> </div>`),ne=O(`<input type="text" placeholder="ex: 2.5m pierre nette" style="font-size: 12px;"/>`),re=O(`<div style="font-size: 12px; color: var(--text2);"> </div>`),ie=O(`<input type="text" placeholder="ex: 3×500g Emulite, détonateur 500ms" style="font-size: 12px;"/>`),ae=O(`<div style="margin-bottom: 8px;"><label style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">Étiquettes de couches (une par ligne)</label> <textarea placeholder="Mort terrain Roc fracturé Roc sain Sous-forage" rows="4" style="font-size: 11px; min-height: 72px;"></textarea></div>`),R=O(`<span style="font-size: 12px; color: var(--text);"> </span> <span style="color: var(--text3);">à</span> <span style="font-size: 12px; color: var(--text);"> </span>`,1),z=O(`<input type="text" placeholder="de" style="width: 56px; font-size: 12px; text-align: center;"/> <span style="color: var(--text3);">à</span> <input type="text" placeholder="à" style="width: 56px; font-size: 12px; text-align: center;"/>`,1),B=O(`<div style="
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  font-size: 12px;
"><div style="
    background: var(--card2);
    border-bottom: 1px solid var(--border);
    padding: 8px 10px;
    font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px;
  "> </div> <div style="padding: 10px;"><div style="margin-bottom: 8px;"><label style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">Profondeur des forages: SOL/ROC (incluant mort terrain)</label> <!></div> <div style="margin-bottom: 10px;"><label style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">Chargement-Type</label> <!></div> <div style="display: flex; gap: 8px; margin-bottom: 10px;"><div style="
        flex: 1; display: flex; flex-direction: column; justify-content: space-between;
        min-height: 140px;
        font-size: 10px; color: var(--text3);
        padding: 4px 0;
      "><!></div> <div style="
        width: 56px; flex-shrink: 0;
        border: 2px solid var(--border2);
        border-radius: 0 0 4px 4px;
        border-top: none;
        min-height: 140px;
        position: relative;
        background: linear-gradient(to bottom,
          rgba(79,110,247,0.08) 0%,
          rgba(79,110,247,0.05) 30%,
          rgba(231,76,60,0.12) 60%,
          rgba(243,156,18,0.1) 100%
        );
        overflow: hidden;
      "><div style="
          position: absolute; top: 0; left: 0; right: 0;
          text-align: center; font-size: 9px; font-weight: 700;
          color: var(--text3); padding: 3px 0;
          border-bottom: 1px dashed var(--border2);
          background: rgba(0,0,0,0.2);
          text-transform: uppercase; letter-spacing: 0.3px;
        ">SOL</div> <div style="
          position: absolute; left: 0; right: 0; top: 30%;
          border-top: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
        "><span style="font-size: 8px; color: var(--text3); background: var(--card); padding: 0 3px;">ROC</span></div> <div style="
          position: absolute; left: 0; right: 0; top: 80%;
          border-top: 2px solid rgba(231,76,60,0.7);
          display: flex; align-items: center; justify-content: center;
        "><span style="font-size: 8px; color: #e74c3c; background: var(--card); padding: 0 3px; font-weight: 700;">FOND</span></div> <div style="
          position: absolute; left: 50%; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, var(--accent) 0%, var(--accent) 78%, #e74c3c 78%, #e74c3c 100%);
          transform: translateX(-50%);
          opacity: 0.6;
        "></div></div></div> <div style="
      color: #e74c3c; font-size: 10px; font-weight: 700;
      text-align: center; margin-bottom: 8px; letter-spacing: 0.5px;
    ">— FRONT DE TAILLE —</div> <div style="margin-bottom: 6px;"><label style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">Bourre / Espaceurs</label> <!></div> <div style="margin-bottom: 8px;"><label style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">Explosifs / Amorces</label> <!></div> <!> <div style="
      display: flex; align-items: center; gap: 8px;
      border-top: 1px solid var(--border); padding-top: 8px;
    "><span style="font-size: 11px; color: var(--text3); font-weight: 600; white-space: nowrap;">Trous n°:</span> <!></div></div></div>`);function oe(t,n){h(n,!0);let a=_(n,`schema`,15),l=_(n,`readonly`,3,!1),f=p(()=>a().couches?a().couches.split(`
`).filter(e=>e.trim()):[]);var m=B(),b=s(m),C=s(b);e(b);var w=A(b,2),D=s(w),O=s(D),te=A(O,2),oe=t=>{var n=j(),r=s(n,!0);e(n),c(()=>E(r,a().profondeur_sol_roc||`—`)),k(t,n)},se=e=>{var t=M();S(t),c(()=>T(t,`id`,`prof_${n.index??``}`)),y(t,()=>a().profondeur_sol_roc,e=>a(a().profondeur_sol_roc=e,!0)),k(e,t)};g(te,e=>{l()?e(oe):e(se,-1)}),e(D);var ce=A(D,2),le=s(ce),ue=A(le,2),de=t=>{var n=N(),r=s(n,!0);e(n),c(()=>E(r,a().chargement_type||`—`)),k(t,n)},fe=e=>{var t=P();S(t),c(()=>T(t,`id`,`ct_${n.index??``}`)),y(t,()=>a().chargement_type,e=>a(a().chargement_type=e,!0)),k(e,t)};g(ue,e=>{l()?e(de):e(fe,-1)}),e(ce);var pe=A(ce,2),me=s(pe),he=s(me),ge=t=>{var n=v();x(d(n),17,()=>r(f),ee,(t,n)=>{var i=F(),a=A(s(i),2),o=s(a,!0);e(a),e(i),c(()=>E(o,r(n))),k(t,i)}),k(t,n)},_e=e=>{k(e,I())};g(he,e=>{r(f).length>0?e(ge):l()||e(_e,1)}),e(me),u(2),e(pe);var ve=A(pe,4),ye=s(ve),be=A(ye,2),xe=t=>{var n=L(),r=s(n,!0);e(n),c(()=>E(r,a().bourre||`—`)),k(t,n)},Se=e=>{var t=ne();S(t),c(()=>T(t,`id`,`bourre_${n.index??``}`)),y(t,()=>a().bourre,e=>a(a().bourre=e,!0)),k(e,t)};g(be,e=>{l()?e(xe):e(Se,-1)}),e(ve);var Ce=A(ve,2),we=s(Ce),Te=A(we,2),Ee=t=>{var n=re(),r=s(n,!0);e(n),c(()=>E(r,a().explosifs_amorces||`—`)),k(t,n)},De=e=>{var t=ie();S(t),c(()=>T(t,`id`,`expl_${n.index??``}`)),y(t,()=>a().explosifs_amorces,e=>a(a().explosifs_amorces=e,!0)),k(e,t)};g(Te,e=>{l()?e(Ee):e(De,-1)}),e(Ce);var V=A(Ce,2),H=t=>{var r=ae(),o=s(r),l=A(o,2);i(l),e(r),c(()=>{T(o,`for`,`couches_${n.index??``}`),T(l,`id`,`couches_${n.index??``}`)}),y(l,()=>a().couches,e=>a(a().couches=e,!0)),k(t,r)};g(V,e=>{l()||e(H)});var U=A(V,2),W=A(s(U),2),G=t=>{var n=R(),r=d(n),i=s(r,!0);e(r);var o=A(r,4),l=s(o,!0);e(o),c(()=>{E(i,a().trous_de||`___`),E(l,a().trous_a||`___`)}),k(t,n)},K=e=>{var t=z(),n=d(t);S(n);var r=A(n,4);S(r),y(n,()=>a().trous_de,e=>a(a().trous_de=e,!0)),y(r,()=>a().trous_a,e=>a(a().trous_a=e,!0)),k(e,t)};g(W,e=>{l()?e(G):e(K,-1)}),e(U),e(w),e(m),c(()=>{E(C,`Schéma #${n.index+1} — Disposition des trous de mine / Séquence de mise à feu`),T(O,`for`,`prof_${n.index??``}`),T(le,`for`,`ct_${n.index??``}`),T(ye,`for`,`bourre_${n.index??``}`),T(we,`for`,`expl_${n.index??``}`)}),k(t,m),o()}var se=O(`<div style="margin-top: 4px; font-size: 11px; color: var(--text3);" class="svelte-118nmc4">→ Ajoutez votre clé API dans l'onglet <strong class="svelte-118nmc4">Profil</strong></div>`),ce=O(`<div style="
        padding: 8px 10px; background: var(--red-dim); border: 1px solid var(--red);
        border-radius: 6px; font-size: 12px; color: var(--red); margin-bottom: 10px;
      " class="svelte-118nmc4"> <!></div>`),le=O(`<div style="
        padding: 12px; text-align: center;
        background: var(--card); border: 1px solid var(--border); border-radius: 6px;
        font-size: 12px; color: var(--text2);
      " class="svelte-118nmc4">⏳ Analyse en cours avec Gemini...</div>`),ue=O(`<label style="
        display: block; padding: 14px;
        background: var(--card); border: 2px dashed var(--border2); border-radius: 8px;
        text-align: center; cursor: pointer; font-size: 13px; color: var(--text3);
        transition: border-color 0.2s;
      " class="svelte-118nmc4">📷 Appuyez pour prendre ou sélectionner une photo <input type="file" accept="image/*" style="display: none;" class="svelte-118nmc4"/></label>`),de=O(`<div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px; margin-bottom: 10px;
  " class="svelte-118nmc4"><div style="font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 8px;" class="svelte-118nmc4">📸 Importer une photo du plan de tir</div> <div style="font-size: 11px; color: var(--text3); margin-bottom: 10px; line-height: 1.5;" class="svelte-118nmc4">Prenez une photo de votre plan papier. L'IA Gemini extraira les trous et délais automatiquement.</div> <!> <!></div>`),fe=O(`<button class="svelte-118nmc4"><div style="font-size: 18px; margin-bottom: 4px;" class="svelte-118nmc4"> </div> <div style="font-size: 12px;" class="svelte-118nmc4"> </div> <div style="font-size: 10px; color: var(--text3); font-weight: 400; margin-top: 1px;" class="svelte-118nmc4"> </div></button>`),pe=O(`<div class="svelte-118nmc4"><label for="tpl-rows" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Rangées</label> <input id="tpl-rows" type="number" min="1" max="20" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div>`),me=O(`<div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px; margin-bottom: 10px;
  " class="svelte-118nmc4"><div style="font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 10px;" class="svelte-118nmc4">📐 Choisir un gabarit de patron</div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px;" class="svelte-118nmc4"></div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;" class="svelte-118nmc4"><!> <div class="svelte-118nmc4"><label for="tpl-cols" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4"> </label> <input id="tpl-cols" type="number" min="1" max="20" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div> <div class="svelte-118nmc4"><label for="tpl-spacing" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Espacement (m)</label> <input id="tpl-spacing" type="number" min="0.1" step="0.1" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div> <div class="svelte-118nmc4"><label for="tpl-fardeau" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Fardeau (m)</label> <input id="tpl-fardeau" type="number" min="0.1" step="0.1" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div> <div class="svelte-118nmc4"><label for="tpl-delay" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Délai de base (ms)</label> <input id="tpl-delay" type="number" min="0" step="5" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div></div> <button style="
        width: 100%; padding: 13px; border-radius: 8px; font-size: 14px; font-weight: 700;
        background: var(--accent); color: #fff; border: none; cursor: pointer; font-family: inherit;
      " class="svelte-118nmc4">✨ Générer le patron</button></div>`),he=O(`<div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;" class="svelte-118nmc4"><button class="svelte-118nmc4">📸 Photo IA</button> <button class="svelte-118nmc4">📐 Gabarit</button> <button class="svelte-118nmc4">👆 Manuel</button></div> <!> <!>`,1),ge=O(`<div style="
      background: #f5c518; color: #000; padding: 10px 14px; border-radius: 8px;
      margin-bottom: 8px; font-size: 13px; font-weight: 700; text-align: center;
    " class="svelte-118nmc4">📍 Touchez le nouvel emplacement pour déplacer le trou <button style="
          margin-left: 10px; padding: 4px 10px; border-radius: 6px; font-size: 12px;
          background: rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.3); color: #000;
          cursor: pointer; font-family: inherit; font-weight: 600;
        " class="svelte-118nmc4">Annuler</button></div>`),_e=O(`<div class="svelte-118nmc4"></div>`),ve=O(`<div style="
        position: absolute; inset: 0;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        pointer-events: none;
      " class="svelte-118nmc4"><div style="font-size: 28px; margin-bottom: 8px; opacity: 0.3;" class="svelte-118nmc4">💥</div> <div style="font-size: 13px; color: var(--text3); opacity: 0.6; text-align: center; padding: 0 20px;" class="svelte-118nmc4">Touchez pour placer des trous<br class="svelte-118nmc4"/>ou choisissez un gabarit ci-dessus</div></div>`),ye=O(`<span style="color: var(--accent2);" class="svelte-118nmc4"> </span>`),be=O(`<span class="svelte-118nmc4">· Touchez un trou pour le modifier</span>`),xe=O(`<div style="
      display: flex; align-items: center; gap: 6px;
      padding: 6px 4px; font-size: 11px; color: var(--text3);
    " class="svelte-118nmc4"><span class="svelte-118nmc4"> </span> <!></div>`),Se=O(`<div style="
    display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;
  " class="svelte-118nmc4"><button title="Ajouter un trou au centre" style="
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border); color: var(--text2);
        cursor: pointer; font-family: inherit; text-align: center;
      " class="svelte-118nmc4">➕ Trou</button> <button title="Renuméroter tous les trous" class="svelte-118nmc4">🔢 Numéros</button> <button title="Délais automatiques (+25ms par trou)" class="svelte-118nmc4">🔄 Délais</button> <button title="Annuler" class="svelte-118nmc4">↩ Annuler</button> <button title="Effacer tout" class="svelte-118nmc4">🗑️ Vider</button></div>`),Ce=O(`<button style="
              flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
              background: var(--red-dim); border: 1px solid var(--red); color: var(--red);
              cursor: pointer; font-family: inherit; text-align: center;
            " class="svelte-118nmc4">🗑️ Supprimer</button>`),we=O(`<button style="
              flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
              background: var(--red); border: none; color: #fff;
              cursor: pointer; font-family: inherit; text-align: center;
            " class="svelte-118nmc4">⚠️ Confirmer</button> <button style="
              padding: 12px 10px; border-radius: 10px; font-size: 13px; font-weight: 600;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit;
            " class="svelte-118nmc4">✕</button>`,1),Te=O(`<div role="dialog" aria-modal="true" aria-label="Modifier le trou" style="
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 300;
      background: var(--card);
      border-top: 2px solid var(--border2);
      border-radius: 20px 20px 0 0;
      padding: 0 0 env(safe-area-inset-bottom, 0);
      box-shadow: 0 -8px 40px rgba(0,0,0,0.6);
      max-height: 80vh;
      overflow-y: auto;
    " class="svelte-118nmc4"><div style="
      width: 40px; height: 4px; background: var(--border2); border-radius: 2px;
      margin: 10px auto 0;
    " class="svelte-118nmc4"></div> <div style="
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px 8px;
      border-bottom: 1px solid var(--border);
    " class="svelte-118nmc4"><div style="font-size: 16px; font-weight: 800; color: var(--text);" class="svelte-118nmc4"> </div> <button style="
          background: var(--card2); border: 1px solid var(--border);
          border-radius: 20px; padding: 5px 12px;
          font-size: 13px; font-weight: 600; color: var(--text2);
          cursor: pointer; font-family: inherit;
        " class="svelte-118nmc4">✕ Fermer</button></div> <div style="padding: 14px 16px;" class="svelte-118nmc4"><div style="margin-bottom: 14px;" class="svelte-118nmc4"><div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;" class="svelte-118nmc4">Délai (ms)</div> <div style="display: flex; align-items: center; gap: 8px;" class="svelte-118nmc4"><button style="
              padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 800;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit; min-width: 52px;
            " class="svelte-118nmc4">−25</button> <button style="
              padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 800;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit; min-width: 44px;
            " class="svelte-118nmc4">−5</button> <input type="number" min="0" step="1" style="
              flex: 1; text-align: center;
              padding: 12px 8px; border-radius: 10px;
              background: var(--card2); border: 2px solid var(--accent);
              color: var(--text); font-size: 22px; font-weight: 800;
              font-family: inherit;
            " class="svelte-118nmc4"/> <button style="
              padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 800;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit; min-width: 44px;
            " class="svelte-118nmc4">+5</button> <button style="
              padding: 10px 14px; border-radius: 10px; font-size: 14px; font-weight: 800;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit; min-width: 52px;
            " class="svelte-118nmc4">+25</button></div></div> <div style="margin-bottom: 16px;" class="svelte-118nmc4"><div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;" class="svelte-118nmc4">Étiquette / Numéro</div> <input type="text" maxlength="6" style="
            width: 100%; padding: 12px 14px; border-radius: 10px;
            background: var(--card2); border: 1px solid var(--border);
            color: var(--text); font-size: 18px; font-weight: 700;
            font-family: inherit; box-sizing: border-box;
          " class="svelte-118nmc4"/></div> <div style="display: flex; gap: 8px;" class="svelte-118nmc4"><button style="
            flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
            background: var(--card2); border: 1px solid var(--border); color: var(--text2);
            cursor: pointer; font-family: inherit; text-align: center;
          " class="svelte-118nmc4">📍 Déplacer</button> <!></div></div></div>`),Ee=O(`<div style="width: 100%;" class="svelte-118nmc4"><!> <!> <div class="svelte-118nmc4"><canvas style="display: block; width: 100%; touch-action: none;" class="svelte-118nmc4"></canvas> <!> <!></div> <!> <!></div> <!>`,1);function De(n,i){h(i,!0);let u=_(i,`holes`,31,()=>t([])),T=_(i,`connections`,31,()=>t([])),O=_(i,`dataurl`,15,``),j=_(i,`readonly`,3,!1),M=a(`none`),N=a(null),P=a(null),F=a(!1),I=a(!1),L=a(null),ne=a(0),re=a(0),ie=a(!1),ae=null,R=a(`grille`),z=a(3),B=a(4),oe=a(3.5),De=a(3),V=a(25),H=a(!1),U=a(``),W=a(null),G=[],K,q,Oe=p(()=>u().length>0?Math.max(...u().map(e=>e.id))+1:1),J=a(!1);function Y(){G.push({holes:u().map(e=>({...e})),connections:T().map(e=>({...e}))}),G.length>20&&G.shift()}function ke(){if(G.length===0)return;let e=G.pop();u(e.holes),T(e.connections),Z()}function Ae(){confirm(`Effacer tous les trous?`)&&(Y(),u([]),T([]),Z())}function je(){Y(),u(u().map((e,t)=>({...e,label:String(t+1)}))),Z()}function Me(){Y(),u(u().map((e,t)=>({...e,delay_ms:t*25}))),Z()}let Ne=`#f5c518`;function Pe(){if(!q)return{w:300,h:200};let e=q.clientWidth;return{w:e,h:Math.round(2/3*e)}}function Fe(){if(!K||!q)return;let e=window.devicePixelRatio||1,{w:t,h:n}=Pe();K.width=Math.round(t*e),K.height=Math.round(n*e),K.style.width=`${t}px`,K.style.height=`${n}px`,K.getContext(`2d`).scale(e,e),X()}function X(){if(!K)return;let e=K.getContext(`2d`),t=window.devicePixelRatio||1,n=K.width/t,i=K.height/t;e.fillStyle=`#0f1117`,e.fillRect(0,0,n,i),e.strokeStyle=`rgba(255,255,255,0.07)`,e.lineWidth=.5;for(let t=0;t<=n;t+=24)e.beginPath(),e.moveTo(t,0),e.lineTo(t,i),e.stroke();for(let t=0;t<=i;t+=24)e.beginPath(),e.moveTo(0,t),e.lineTo(n,t),e.stroke();r(I)&&(e.strokeStyle=Ne,e.lineWidth=3,e.strokeRect(2,2,n-4,i-4)),e.setLineDash([4,4]),e.strokeStyle=`rgba(160,168,204,0.5)`,e.lineWidth=1.5;for(let t of T()){let r=u().find(e=>e.id===t.from),a=u().find(e=>e.id===t.to);r&&a&&(e.beginPath(),e.moveTo(r.x*n,r.y*i),e.lineTo(a.x*n,a.y*i),e.stroke())}e.setLineDash([]);for(let t of u()){let a=t.x*n,o=t.y*i,s=t.id===r(N)||t.id===r(L),c=r(I)&&t.id===r(L);s&&(e.shadowColor=c?Ne:`#6c84f8`,e.shadowBlur=16),e.beginPath(),e.arc(a,o,22,0,Math.PI*2),e.fillStyle=s?`#6c84f8`:`#4f6ef7`,e.fill(),e.strokeStyle=c?Ne:s?`#ffffff`:`rgba(255,255,255,0.3)`,e.lineWidth=s?3:1.5,e.stroke(),e.shadowBlur=0,e.shadowColor=`transparent`,e.fillStyle=`#ffffff`,e.font=`bold ${t.label.length>2?`12`:`14`}px system-ui, sans-serif`,e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(t.label,a,o),t.delay_ms>=0&&(e.fillStyle=`rgba(220,228,255,0.9)`,e.font=`bold 11px system-ui, sans-serif`,e.textAlign=`center`,e.textBaseline=`top`,e.fillText(`${t.delay_ms}ms`,a,o+22+4))}e.textBaseline=`alphabetic`}function Z(){X(),K&&O(K.toDataURL(`image/png`))}function Ie(e,t){let n=K.getBoundingClientRect();return{nx:(e-n.left)/n.width,ny:(t-n.top)/n.height}}function Le(e,t){let{w:n,h:r}=Pe(),i=e*n,a=t*r;for(let e=u().length-1;e>=0;e--){let t=u()[e].x*n,o=u()[e].y*r;if(Math.hypot(i-t,a-o)<=32)return u()[e]}return null}function Re(e,t){let n=K.getBoundingClientRect();m(ne,e-n.left),m(re,t-n.top),m(ie,!0),ae&&clearTimeout(ae),ae=setTimeout(()=>{m(ie,!1)},400)}function ze(e){j()||e.preventDefault()}function Be(e){if(j())return;let{nx:t,ny:n}=Ie(e.clientX,e.clientY),i=Le(t,n);if(r(I)&&r(L)!==null){if(i&&i.id!==r(L))return;Y();let a=e=>Math.max(.02,Math.min(.98,e));u(u().map(e=>e.id===r(L)?{...e,x:a(t),y:a(n)}:e)),Re(e.clientX,e.clientY),m(I,!1),m(L,null);let o=u().find(e=>e.id===r(P)?.id);o&&(m(P,{...o},!0),m(F,!0)),Z();return}if(i)r(P)&&r(P).id===i.id&&r(F)?He():Ve(i);else{if(r(F)){He();return}Re(e.clientX,e.clientY),Ue(t,n)}X()}function Ve(e){m(N,e.id,!0),m(P,{...e},!0),m(F,!0),m(J,!1),X()}function He(){m(F,!1),m(P,null),m(N,null),m(I,!1),m(L,null),m(J,!1),X()}function Ue(e,t){Y();let n=r(Oe),i={id:n,x:e,y:t,delay_ms:u().length>0?u()[u().length-1].delay_ms+25:0,label:String(n)};u().length>0&&T([...T(),{from:u()[u().length-1].id,to:n}]),u([...u(),i]),m(N,n,!0),m(P,{...i},!0),m(F,!0),m(J,!1),Z()}function We(){q&&Ue(.5,.5)}function Ge(){r(P)&&(Y(),u(u().map(e=>e.id===r(P).id?{...r(P)}:e)),Z(),m(N,r(P).id,!0))}function Ke(e){r(P)&&(m(P,{...r(P),delay_ms:Math.max(0,r(P).delay_ms+e)},!0),Ge())}function qe(){r(P)&&(m(L,r(P).id,!0),m(I,!0),m(F,!1),X())}function Je(){m(J,!0)}function Ye(){if(!r(P))return;Y();let e=r(P).id;u(u().filter(t=>t.id!==e)),T(T().filter(t=>t.from!==e&&t.to!==e)),He(),Z()}function Xe(){Y();let e=[],t=[],n=Math.max(1,Math.min(20,r(z))),i=Math.max(1,Math.min(20,r(B))),a=Math.max(0,r(V));function o(e,t,n,r){return{id:e,x:Math.max(.05,Math.min(.95,t)),y:Math.max(.05,Math.min(.95,n)),delay_ms:r*a,label:String(e)}}let s=1,c=0;if(r(R)===`ligne`)for(let n=0;n<i;n++){let r=i===1?.5:.1+n/(i-1)*.8;e.push(o(s,r,.5,c)),s>1&&t.push({from:s-1,to:s}),s++,c++}else if(r(R)===`grille`)for(let r=0;r<n;r++)for(let a=0;a<i;a++){let l=i===1?.5:.1+a/(i-1)*.8,u=n===1?.5:.1+r/(n-1)*.8;e.push(o(s,l,u,c)),a>0&&t.push({from:s-1,to:s}),s++,c++}else if(r(R)===`vcut`){let r=Math.max(2,n);for(let t=0;t<r;t++){let n=.15+t/(r-1)*.7,i=.45-t/(r-1)*.35;e.push(o(s,i,n,c)),s++,c++;let a=.55+t/(r-1)*.35;e.push(o(s,a,n,c)),s++,c++}for(let n=1;n<e.length;n++)t.push({from:e[n-1].id,to:e[n].id})}else if(r(R)===`echelon`){let r=i;for(let i=0;i<n;i++){let a=n===1?.5:.1+i/(n-1)*.8,l=i%2==1&&r>1?.4/(r-1):0;for(let n=0;n<r;n++){let i=r===1?.5:.1+l+n/(r-1)*(.8-l*2);e.push(o(s,i,a,c)),n>0&&t.push({from:s-1,to:s}),s++,c++}}}u(e),T(t),m(M,`none`),Z()}async function Ze(e){let t=e.target.files?.[0];if(t){m(U,``),m(H,!0);try{let e=(await te())?.gemini_api_key||``;if(!e){m(U,`Configure ta clé Gemini dans Profil`),m(H,!1);return}let n=await Qe(t),r=t.type||`image/jpeg`,i=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${e}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({contents:[{parts:[{text:`Analyze this blast drill pattern image. Extract all drill holes with their positions and timing delays.
Return JSON only (no markdown): { "holes": [{"x": 0-1, "y": 0-1, "delay_ms": number, "label": "string"}] }
x=0 is left, x=1 is right, y=0 is top, y=1 is bottom.
If delays are visible, include them. If not, set delay_ms to -1.
Normalize positions to 0-1 range based on the image boundaries.`},{inlineData:{mimeType:r,data:n}}]}]})});if(!i.ok){let e=await i.json().catch(()=>({}));throw Error(e?.error?.message||`Erreur API: ${i.status}`)}let a=((await i.json())?.candidates?.[0]?.content?.parts?.[0]?.text||``).match(/\{[\s\S]*\}/);if(!a)throw Error(`Réponse invalide de Gemini`);let o=JSON.parse(a[0]);if(!o.holes||!Array.isArray(o.holes))throw Error(`Format de réponse inattendu`);Y();let s=o.holes.map((e,t)=>({id:t+1,x:Math.max(.05,Math.min(.95,Number(e.x)||.5)),y:Math.max(.05,Math.min(.95,Number(e.y)||.5)),delay_ms:Number(e.delay_ms)>=0?Number(e.delay_ms):0,label:e.label?String(e.label):String(t+1)})),c=[];for(let e=1;e<s.length;e++)c.push({from:s[e-1].id,to:s[e].id});u(s),T(c),m(M,`none`),Z()}catch(e){m(U,e?.message||`Erreur lors de l'importation`,!0)}finally{m(H,!1),r(W)&&(r(W).value=``)}}}function Qe(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{let e=r.result;t(e.split(`,`)[1])},r.onerror=n,r.readAsDataURL(e)})}w(()=>{let e=new ResizeObserver(()=>Fe());return q&&e.observe(q),Fe(),()=>e.disconnect()}),l(()=>{u(),T(),X()}),l(()=>{r(N),r(I),X()}),l(()=>{K&&u().length>0&&!O()&&Z()});var $e=Ee(),et=d($e),tt=s(et),nt=t=>{var n=he(),i=d(n),a=s(i),o=A(a,2),l=A(o,2);e(i);var u=A(i,2),f=t=>{var n=de(),i=A(s(n),4),a=t=>{var n=ce(),i=s(n),a=A(i),o=e=>{k(e,se())},l=p(()=>r(U).includes(`Gemini`));g(a,e=>{r(l)&&e(o)}),e(n),c(()=>E(i,`⚠️ ${r(U)??``} `)),k(t,n)};g(i,e=>{r(U)&&e(a)});var o=A(i,2),l=e=>{k(e,le())},u=t=>{var n=ue(),i=A(s(n));C(i,e=>m(W,e),()=>r(W)),e(n),D(`change`,i,Ze),k(t,n)};g(o,e=>{r(H)?e(l):e(u,-1)}),e(n),k(t,n)};g(u,e=>{r(M)===`photo`&&e(f)});var h=A(u,2),_=t=>{var n=me(),i=A(s(n),2);x(i,20,()=>[{id:`ligne`,icon:`─`,label:`Ligne droite`,desc:`1 rangée`},{id:`grille`,icon:`⊞`,label:`Grille`,desc:`Rectangulaire`},{id:`vcut`,icon:`∨`,label:`V-cut / Bouchon`,desc:`Coupe en V`},{id:`echelon`,icon:`≋`,label:`Échelon`,desc:`Rangées décalées`}],ee,(t,n)=>{var i=fe(),a=s(i),o=s(a,!0);e(a);var l=A(a,2),u=s(l,!0);e(l);var d=A(l,2),f=s(d,!0);e(d),e(i),c(()=>{b(i,`
            padding: 10px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;
            cursor: pointer; font-family: inherit; border: 1px solid; text-align: center;
            ${r(R)===n.id?`background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);`:`background: var(--card); border-color: var(--border); color: var(--text2);`}
          `),E(o,n.icon),E(u,n.label),E(f,n.desc)}),D(`click`,i,()=>m(R,n.id,!0)),k(t,i)}),e(i);var a=A(i,2),o=s(a),l=t=>{var n=pe(),i=A(s(n),2);S(i),e(n),y(i,()=>r(z),e=>m(z,e)),k(t,n)};g(o,e=>{r(R)!==`ligne`&&e(l)});var u=A(o,2),d=s(u),f=s(d,!0);e(d);var p=A(d,2);S(p),e(u);var h=A(u,2),_=A(s(h),2);S(_),e(h);var v=A(h,2),C=A(s(v),2);S(C),e(v);var w=A(v,2),T=A(s(w),2);S(T),e(w),e(a);var O=A(a,2);e(n),c(()=>E(f,r(R)===`ligne`?`Nb trous`:`Trous/rangée`)),y(p,()=>r(B),e=>m(B,e)),y(_,()=>r(oe),e=>m(oe,e)),y(C,()=>r(De),e=>m(De,e)),y(T,()=>r(V),e=>m(V,e)),D(`click`,O,Xe),k(t,n)};g(h,e=>{r(M)===`template`&&e(_)}),c(()=>{b(a,`
        flex: 1; min-width: 90px;
        padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; font-family: inherit; border: 1px solid;
        text-align: center;
        ${r(M)===`photo`?`background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);`:`background: var(--card2); border-color: var(--border); color: var(--text2);`}
      `),b(o,`
        flex: 1; min-width: 90px;
        padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; font-family: inherit; border: 1px solid;
        text-align: center;
        ${r(M)===`template`?`background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);`:`background: var(--card2); border-color: var(--border); color: var(--text2);`}
      `),b(l,`
        flex: 1; min-width: 90px;
        padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; font-family: inherit; border: 1px solid;
        text-align: center;
        ${r(M)===`none`?`background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);`:`background: var(--card2); border-color: var(--border); color: var(--text2);`}
      `)}),D(`click`,a,()=>m(M,r(M)===`photo`?`none`:`photo`,!0)),D(`click`,o,()=>m(M,r(M)===`template`?`none`:`template`,!0)),D(`click`,l,()=>{m(M,`none`)}),k(t,n)};g(tt,e=>{j()||e(nt)});var rt=A(tt,2),it=t=>{var n=ge(),r=A(s(n));e(n),D(`click`,r,()=>{m(I,!1),m(L,null),m(F,!0),X()}),k(t,n)};g(rt,e=>{r(I)&&e(it)});var Q=A(rt,2),$=s(Q);C($,e=>K=e,()=>K);var at=A($,2),ot=e=>{var t=_e();c(()=>b(t,`
        position: absolute;
        left: ${r(ne)-20}px;
        top: ${r(re)-20}px;
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        pointer-events: none;
        animation: ripple-anim 0.4s ease-out forwards;
      `)),k(e,t)};g(at,e=>{r(ie)&&e(ot)});var st=A(at,2),ct=e=>{k(e,ve())};g(st,e=>{u().length===0&&!j()&&!r(I)&&e(ct)}),e(Q),C(Q,e=>q=e,()=>q);var lt=A(Q,2),ut=t=>{var n=xe(),i=s(n),a=s(i);e(i);var o=A(i,2),l=t=>{var n=v();x(d(n),17,()=>u().filter(e=>e.id===r(N)),ee,(t,n)=>{var i=ye(),a=s(i);e(i),c(()=>E(a,`· Trou ${r(n).label??``} — panneau ouvert`)),k(t,i)}),k(t,n)},f=e=>{k(e,be())};g(o,e=>{r(N)!==null&&r(F)?e(l):j()||e(f,1)}),e(n),c(()=>E(a,`${u().length??``} trou${u().length>1?`s`:``}`)),k(t,n)};g(lt,e=>{u().length>0&&!r(I)&&e(ut)});var dt=A(lt,2),ft=t=>{var n=Se(),r=s(n),i=A(r,2),a=A(i,2),o=A(a,2),l=A(o,2);e(n),c(()=>{i.disabled=u().length===0,b(i,`
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border);
        color: ${u().length===0?`var(--text3)`:`var(--text2)`};
        cursor: ${u().length===0?`default`:`pointer`}; font-family: inherit; text-align: center;
      `),a.disabled=u().length===0,b(a,`
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border);
        color: ${u().length===0?`var(--text3)`:`var(--text2)`};
        cursor: ${u().length===0?`default`:`pointer`}; font-family: inherit; text-align: center;
      `),o.disabled=G.length===0,b(o,`
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border);
        color: ${G.length===0?`var(--text3)`:`var(--text2)`};
        cursor: ${G.length===0?`default`:`pointer`}; font-family: inherit; text-align: center;
      `),l.disabled=u().length===0,b(l,`
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--red-dim); border: 1px solid var(--red);
        color: ${u().length===0?`var(--text3)`:`var(--red)`};
        cursor: ${u().length===0?`default`:`pointer`}; font-family: inherit; text-align: center;
      `)}),D(`click`,r,We),D(`click`,i,je),D(`click`,a,Me),D(`click`,o,ke),D(`click`,l,Ae),k(t,n)};g(dt,e=>{!j()&&!r(I)&&e(ft)}),e(et);var pt=A(et,2),mt=t=>{var n=Te(),i=A(s(n),2),a=s(i),o=s(a);e(a);var l=A(a,2);e(i);var u=A(i,2),f=s(u),p=A(s(f),2),h=s(p),_=A(h,2),v=A(_,2);S(v);var b=A(v,2),ee=A(b,2);e(p),e(f);var x=A(f,2),C=A(s(x),2);S(C),e(x);var w=A(x,2),T=s(w),O=A(T,2),te=e=>{var t=Ce();D(`click`,t,Je),k(e,t)},j=e=>{var t=we(),n=d(t),r=A(n,2);D(`click`,n,Ye),D(`click`,r,()=>m(J,!1)),k(e,t)};g(O,e=>{r(J)?e(j,-1):e(te)}),e(w),e(u),e(n),c(()=>E(o,`✏️ Trou ${r(P).label??``}`)),D(`click`,l,He),D(`click`,h,()=>Ke(-25)),D(`click`,_,()=>Ke(-5)),D(`input`,v,Ge),y(v,()=>r(P).delay_ms,e=>r(P).delay_ms=e),D(`click`,b,()=>Ke(5)),D(`click`,ee,()=>Ke(25)),D(`input`,C,Ge),y(C,()=>r(P).label,e=>r(P).label=e),D(`click`,T,qe),k(t,n)};g(pt,e=>{r(F)&&r(P)&&!j()&&e(mt)}),c(()=>b(Q,`
      position: relative; width: 100%; border-radius: 8px; overflow: hidden;
      border: ${r(I)?`2px solid #f5c518`:`1px solid var(--border)`};
      cursor: ${j()?`default`:r(I)?`crosshair`:`pointer`};
      touch-action: none;
    `)),D(`pointerdown`,$,function(...e){(j()?void 0:ze)?.apply(this,e)}),D(`pointerup`,$,function(...e){(j()?void 0:Be)?.apply(this,e)}),f(`pointercancel`,$,function(...e){(j()?void 0:Be)?.apply(this,e)}),k(n,$e),o()}n([`click`,`change`,`pointerdown`,`pointerup`,`input`]);export{oe as n,De as t};
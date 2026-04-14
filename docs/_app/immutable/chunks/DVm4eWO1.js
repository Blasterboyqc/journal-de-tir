import{$ as e,B as t,C as n,E as r,F as i,H as a,J as o,L as s,M as c,N as l,Q as u,R as d,T as f,U as p,V as m,Y as h,_ as g,a as _,b as v,c as y,d as b,g as ee,h as x,l as S,o as C,r as w,u as T,v as E,w as D,x as O,y as k,z as A}from"./J7tXCfCn.js";import"./CT0T0Gak.js";import{o as te}from"./BfYHUnu2.js";var j=O(`<div style="font-size: 13px; color: var(--text); padding: 6px 0;"> </div>`),M=O(`<input type="text" placeholder="ex: 2.5m SOL / 8.5m ROC" style="font-size: 12px;"/>`),N=O(`<div style="font-size: 13px; color: var(--text); padding: 6px 0;"> </div>`),P=O(`<input type="text" placeholder="ex: Emulite 100, 70mm" style="font-size: 12px;"/>`),F=O(`<div style="
              display: flex; align-items: center; gap: 4px;
              padding: 2px 0;
            "><span style="color: var(--accent2);">•</span> <span style="color: var(--text2); font-size: 10px;"> </span></div>`),I=O(`<div style="font-size: 10px; color: var(--text3); font-style: italic; padding: 4px 0;">Couches ↓</div>`),L=O(`<div style="font-size: 12px; color: var(--text2);"> </div>`),ne=O(`<input type="text" placeholder="ex: 2.5m pierre nette" style="font-size: 12px;"/>`),re=O(`<div style="font-size: 12px; color: var(--text2);"> </div>`),ie=O(`<input type="text" placeholder="ex: 3×500g Emulite, détonateur 500ms" style="font-size: 12px;"/>`),ae=O(`<div style="margin-bottom: 8px;"><label style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">Étiquettes de couches (une par ligne)</label> <textarea placeholder="Mort terrain Roc fracturé Roc sain Sous-forage" rows="4" style="font-size: 11px; min-height: 72px;"></textarea></div>`),R=O(`<span style="font-size: 12px; color: var(--text);"> </span> <span style="color: var(--text3);">à</span> <span style="font-size: 12px; color: var(--text);"> </span>`,1),oe=O(`<input type="text" placeholder="de" style="width: 56px; font-size: 12px; text-align: center;"/> <span style="color: var(--text3);">à</span> <input type="text" placeholder="à" style="width: 56px; font-size: 12px; text-align: center;"/>`,1),se=O(`<div style="
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
    "><span style="font-size: 11px; color: var(--text3); font-weight: 600; white-space: nowrap;">Trous n°:</span> <!></div></div></div>`);function ce(t,n){h(n,!0);let a=_(n,`schema`,15),l=_(n,`readonly`,3,!1),f=p(()=>a().couches?a().couches.split(`
`).filter(e=>e.trim()):[]);var m=se(),b=s(m),C=s(b);e(b);var w=A(b,2),D=s(w),O=s(D),te=A(O,2),ce=t=>{var n=j(),r=s(n,!0);e(n),c(()=>E(r,a().profondeur_sol_roc||`—`)),k(t,n)},le=e=>{var t=M();S(t),c(()=>T(t,`id`,`prof_${n.index??``}`)),y(t,()=>a().profondeur_sol_roc,e=>a(a().profondeur_sol_roc=e,!0)),k(e,t)};g(te,e=>{l()?e(ce):e(le,-1)}),e(D);var z=A(D,2),ue=s(z),de=A(ue,2),fe=t=>{var n=N(),r=s(n,!0);e(n),c(()=>E(r,a().chargement_type||`—`)),k(t,n)},pe=e=>{var t=P();S(t),c(()=>T(t,`id`,`ct_${n.index??``}`)),y(t,()=>a().chargement_type,e=>a(a().chargement_type=e,!0)),k(e,t)};g(de,e=>{l()?e(fe):e(pe,-1)}),e(z);var me=A(z,2),he=s(me),ge=s(he),_e=t=>{var n=v();x(d(n),17,()=>r(f),ee,(t,n)=>{var i=F(),a=A(s(i),2),o=s(a,!0);e(a),e(i),c(()=>E(o,r(n))),k(t,i)}),k(t,n)},ve=e=>{k(e,I())};g(ge,e=>{r(f).length>0?e(_e):l()||e(ve,1)}),e(he),u(2),e(me);var ye=A(me,4),be=s(ye),xe=A(be,2),Se=t=>{var n=L(),r=s(n,!0);e(n),c(()=>E(r,a().bourre||`—`)),k(t,n)},Ce=e=>{var t=ne();S(t),c(()=>T(t,`id`,`bourre_${n.index??``}`)),y(t,()=>a().bourre,e=>a(a().bourre=e,!0)),k(e,t)};g(xe,e=>{l()?e(Se):e(Ce,-1)}),e(ye);var we=A(ye,2),Te=s(we),Ee=A(Te,2),De=t=>{var n=re(),r=s(n,!0);e(n),c(()=>E(r,a().explosifs_amorces||`—`)),k(t,n)},Oe=e=>{var t=ie();S(t),c(()=>T(t,`id`,`expl_${n.index??``}`)),y(t,()=>a().explosifs_amorces,e=>a(a().explosifs_amorces=e,!0)),k(e,t)};g(Ee,e=>{l()?e(De):e(Oe,-1)}),e(we);var B=A(we,2),V=t=>{var r=ae(),o=s(r),l=A(o,2);i(l),e(r),c(()=>{T(o,`for`,`couches_${n.index??``}`),T(l,`id`,`couches_${n.index??``}`)}),y(l,()=>a().couches,e=>a(a().couches=e,!0)),k(t,r)};g(B,e=>{l()||e(V)});var H=A(B,2),U=A(s(H),2),W=t=>{var n=R(),r=d(n),i=s(r,!0);e(r);var o=A(r,4),l=s(o,!0);e(o),c(()=>{E(i,a().trous_de||`___`),E(l,a().trous_a||`___`)}),k(t,n)},G=e=>{var t=oe(),n=d(t);S(n);var r=A(n,4);S(r),y(n,()=>a().trous_de,e=>a(a().trous_de=e,!0)),y(r,()=>a().trous_a,e=>a(a().trous_a=e,!0)),k(e,t)};g(U,e=>{l()?e(W):e(G,-1)}),e(H),e(w),e(m),c(()=>{E(C,`Schéma #${n.index+1} — Disposition des trous de mine / Séquence de mise à feu`),T(O,`for`,`prof_${n.index??``}`),T(ue,`for`,`ct_${n.index??``}`),T(be,`for`,`bourre_${n.index??``}`),T(Te,`for`,`expl_${n.index??``}`)}),k(t,m),o()}var le=O(`<div style="margin-top: 4px; font-size: 11px; color: var(--text3);" class="svelte-118nmc4">→ Ajoutez votre clé API dans l'onglet <strong class="svelte-118nmc4">Profil</strong></div>`),z=O(`<div style="
        padding: 8px 10px; background: var(--red-dim); border: 1px solid var(--red);
        border-radius: 6px; font-size: 12px; color: var(--red); margin-bottom: 10px;
      " class="svelte-118nmc4"> <!></div>`),ue=O(`<div style="
        padding: 12px; text-align: center;
        background: var(--card); border: 1px solid var(--border); border-radius: 6px;
        font-size: 12px; color: var(--text2);
      " class="svelte-118nmc4">⏳ Analyse en cours avec Gemini...</div>`),de=O(`<label style="
        display: block; padding: 14px;
        background: var(--card); border: 2px dashed var(--border2); border-radius: 8px;
        text-align: center; cursor: pointer; font-size: 13px; color: var(--text3);
        transition: border-color 0.2s;
      " class="svelte-118nmc4">📷 Appuyez pour prendre ou sélectionner une photo <input type="file" accept="image/*" style="display: none;" class="svelte-118nmc4"/></label>`),fe=O(`<div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px; margin-bottom: 10px;
  " class="svelte-118nmc4"><div style="font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 8px;" class="svelte-118nmc4">📸 Importer une photo du plan de tir</div> <div style="font-size: 11px; color: var(--text3); margin-bottom: 10px; line-height: 1.5;" class="svelte-118nmc4">Prenez une photo de votre plan papier. L'IA Gemini extraira les trous et délais automatiquement.</div> <!> <!></div>`),pe=O(`<button class="svelte-118nmc4"><div style="font-size: 18px; margin-bottom: 4px;" class="svelte-118nmc4"> </div> <div style="font-size: 12px;" class="svelte-118nmc4"> </div> <div style="font-size: 10px; color: var(--text3); font-weight: 400; margin-top: 1px;" class="svelte-118nmc4"> </div></button>`),me=O(`<div class="svelte-118nmc4"><label for="tpl-rows" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Rangées</label> <input id="tpl-rows" type="number" min="1" max="20" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div>`),he=O(`<div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px; margin-bottom: 10px;
  " class="svelte-118nmc4"><div style="font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 10px;" class="svelte-118nmc4">📐 Choisir un gabarit de patron</div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px;" class="svelte-118nmc4"></div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;" class="svelte-118nmc4"><!> <div class="svelte-118nmc4"><label for="tpl-cols" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4"> </label> <input id="tpl-cols" type="number" min="1" max="20" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div> <div class="svelte-118nmc4"><label for="tpl-spacing" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Espacement (m)</label> <input id="tpl-spacing" type="number" min="0.1" step="0.1" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div> <div class="svelte-118nmc4"><label for="tpl-fardeau" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Fardeau (m)</label> <input id="tpl-fardeau" type="number" min="0.1" step="0.1" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div> <div class="svelte-118nmc4"><label for="tpl-delay" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Délai de base (ms)</label> <input id="tpl-delay" type="number" min="0" step="5" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div></div> <button style="
        width: 100%; padding: 13px; border-radius: 8px; font-size: 14px; font-weight: 700;
        background: var(--accent); color: #fff; border: none; cursor: pointer; font-family: inherit;
      " class="svelte-118nmc4">✨ Générer le patron</button></div>`),ge=O(`<div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;" class="svelte-118nmc4"><button class="svelte-118nmc4">📸 Photo IA</button> <button class="svelte-118nmc4">📐 Gabarit</button> <button class="svelte-118nmc4">👆 Manuel</button></div> <!> <!>`,1),_e=O(`<div style="
      background: #f5c518; color: #000; padding: 10px 14px; border-radius: 8px;
      margin-bottom: 8px; font-size: 13px; font-weight: 700; text-align: center;
    " class="svelte-118nmc4">📍 Touchez le nouvel emplacement pour déplacer le trou <button style="
          margin-left: 10px; padding: 4px 10px; border-radius: 6px; font-size: 12px;
          background: rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.3); color: #000;
          cursor: pointer; font-family: inherit; font-weight: 600;
        " class="svelte-118nmc4">Annuler</button></div>`),ve=O(`<div class="svelte-118nmc4"></div>`),ye=O(`<div style="
        position: absolute; inset: 0;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        pointer-events: none;
      " class="svelte-118nmc4"><div style="font-size: 28px; margin-bottom: 8px; opacity: 0.3;" class="svelte-118nmc4">💥</div> <div style="font-size: 13px; color: var(--text3); opacity: 0.6; text-align: center; padding: 0 20px;" class="svelte-118nmc4">Touchez pour placer des trous<br class="svelte-118nmc4"/>ou choisissez un gabarit ci-dessus</div></div>`),be=O(`<span style="color: var(--accent2);" class="svelte-118nmc4"> </span>`),xe=O(`<span class="svelte-118nmc4">· Touchez un trou pour le modifier</span>`),Se=O(`<div style="
      display: flex; align-items: center; gap: 6px;
      padding: 6px 4px; font-size: 11px; color: var(--text3);
    " class="svelte-118nmc4"><span class="svelte-118nmc4"> </span> <!></div>`),Ce=O(`<div style="
    display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;
  " class="svelte-118nmc4"><button title="Ajouter un trou au centre" style="
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border); color: var(--text2);
        cursor: pointer; font-family: inherit; text-align: center;
      " class="svelte-118nmc4">➕ Trou</button> <button title="Renuméroter tous les trous" class="svelte-118nmc4">🔢 Numéros</button> <button title="Délais automatiques (+25ms par trou)" class="svelte-118nmc4">🔄 Délais</button> <button title="Annuler" class="svelte-118nmc4">↩ Annuler</button> <button title="Effacer tout" class="svelte-118nmc4">🗑️ Vider</button></div>`),we=O(`<button style="
              flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
              background: var(--red-dim); border: 1px solid var(--red); color: var(--red);
              cursor: pointer; font-family: inherit; text-align: center;
            " class="svelte-118nmc4">🗑️ Supprimer</button>`),Te=O(`<button style="
              flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
              background: var(--red); border: none; color: #fff;
              cursor: pointer; font-family: inherit; text-align: center;
            " class="svelte-118nmc4">⚠️ Confirmer</button> <button style="
              padding: 12px 10px; border-radius: 10px; font-size: 13px; font-weight: 600;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit;
            " class="svelte-118nmc4">✕</button>`,1),Ee=O(`<div role="dialog" aria-modal="true" aria-label="Modifier le trou" style="
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
          " class="svelte-118nmc4">📍 Déplacer</button> <!></div></div></div>`),De=O(`<div style="width: 100%;" class="svelte-118nmc4"><!> <!> <div class="svelte-118nmc4"><canvas style="display: block; width: 100%; touch-action: none;" class="svelte-118nmc4"></canvas> <!> <!></div> <!> <!></div> <!>`,1);function Oe(n,i){h(i,!0);let u=_(i,`holes`,31,()=>t([])),T=_(i,`connections`,31,()=>t([])),O=_(i,`dataurl`,15,``),j=_(i,`readonly`,3,!1),M=a(`none`),N=a(null),P=a(null),F=a(!1),I=a(!1),L=a(null),ne=a(0),re=a(0),ie=a(!1),ae=null,R=a(`grille`),oe=a(3),se=a(4),ce=a(3.5),Oe=a(3),B=a(25),V=a(!1),H=a(``),U=a(null),W=[],G,K,ke=p(()=>u().length>0?Math.max(...u().map(e=>e.id))+1:1),q=a(!1);function J(){W.push({holes:u().map(e=>({...e})),connections:T().map(e=>({...e}))}),W.length>20&&W.shift()}function Ae(){if(W.length===0)return;let e=W.pop();u(e.holes),T(e.connections),Z()}function je(){confirm(`Effacer tous les trous?`)&&(J(),u([]),T([]),Z())}function Me(){J(),u(u().map((e,t)=>({...e,label:String(t+1)}))),Z()}function Ne(){J(),u(u().map((e,t)=>({...e,delay_ms:t*25}))),Z()}let Pe=`#f5c518`,Y=[`#888888`,`#00cccc`,`#22aa22`,`#cccc00`,`#cc8833`],Fe=[`Bouchon`,`Anneau int.`,`Production`,`Contour`,`Bordure`],Ie=[.15,.3,.55,.8,1];function Le(e,t){if(t<=0)return 2;let n=e/t;for(let e=0;e<Ie.length;e++)if(n<=Ie[e])return e;return Ie.length-1}function Re(e,t,n){return n?`#f5c518`:Y[e]??Y[2]}function ze(){if(!K)return{w:300,h:200};let e=K.clientWidth;return{w:e,h:Math.round(2/3*e)}}function Be(){if(!G||!K)return;let e=window.devicePixelRatio||1,{w:t,h:n}=ze();G.width=Math.round(t*e),G.height=Math.round(n*e),G.style.width=`${t}px`,G.style.height=`${n}px`,G.getContext(`2d`).scale(e,e),X()}function Ve(e){if(e.length<3)return e;let t=[...e].sort((e,t)=>e.x===t.x?e.y-t.y:e.x-t.x),n=(e,t,n)=>(t.x-e.x)*(n.y-e.y)-(t.y-e.y)*(n.x-e.x),r=[];for(let e of t){for(;r.length>=2&&n(r[r.length-2],r[r.length-1],e)<=0;)r.pop();r.push(e)}let i=[];for(let e=t.length-1;e>=0;e--){let r=t[e];for(;i.length>=2&&n(i[i.length-2],i[i.length-1],r)<=0;)i.pop();i.push(r)}return i.pop(),r.pop(),r.concat(i)}function X(){if(!G)return;let e=G.getContext(`2d`),t=window.devicePixelRatio||1,n=G.width/t,i=G.height/t,a=u().length>0?Math.max(...u().map(e=>e.delay_ms)):0,o=Math.max(7,Math.min(11,n/50)),s=Math.max(5,o-2);e.fillStyle=`#0f1117`,e.fillRect(0,0,n,i),e.strokeStyle=`rgba(255,255,255,0.06)`,e.lineWidth=.5;for(let t=0;t<=n;t+=28)e.beginPath(),e.moveTo(t,0),e.lineTo(t,i),e.stroke();for(let t=0;t<=i;t+=28)e.beginPath(),e.moveTo(0,t),e.lineTo(n,t),e.stroke();if(r(I)&&(e.strokeStyle=Pe,e.lineWidth=3,e.strokeRect(2,2,n-4,i-4)),u().length>=3){let t=Y.map(()=>[]);for(let e of u())t[Le(e.delay_ms,a)].push({x:e.x*n,y:e.y*i});e.setLineDash([6,4]);for(let n=0;n<t.length;n++){let r=t[n];if(r.length<3)continue;let i=Ve(r);if(i.length<3)continue;let a=i.reduce((e,t)=>e+t.x,0)/i.length,s=i.reduce((e,t)=>e+t.y,0)/i.length,c=o+6,l=i.map(e=>{let t=e.x-a,n=e.y-s,r=Math.hypot(t,n)||1;return{x:e.x+t/r*c,y:e.y+n/r*c}});e.beginPath(),e.moveTo(l[0].x,l[0].y);for(let t=1;t<l.length;t++)e.lineTo(l[t].x,l[t].y);e.closePath(),e.strokeStyle=Y[n]+`66`,e.lineWidth=1.5,e.stroke()}e.setLineDash([])}for(let t of u()){let c=t.x*n,l=t.y*i,u=t.id===r(N)||t.id===r(L),d=r(I)&&t.id===r(L),f=Le(t.delay_ms,a),p=Re(f,u,d),m=f===0?s:o;if(u&&(e.shadowColor=d?Pe:p,e.shadowBlur=14),e.beginPath(),e.arc(c,l,m,0,Math.PI*2),e.fillStyle=u?p:d?`#f5c518`:p,e.fill(),e.strokeStyle=d?Pe:u?`#ffffff`:`rgba(0,0,0,0.55)`,e.lineWidth=u?2.5:1.2,e.stroke(),e.shadowBlur=0,e.shadowColor=`transparent`,t.delay_ms>=0){let n=String(t.delay_ms),r=n.length>3?9:10;e.fillStyle=`#e8e8e8`,e.font=`bold ${r}px system-ui, sans-serif`,e.textAlign=`left`,e.textBaseline=`middle`,e.fillText(n,c+m+4,l)}}if(u().length>0){let t=[...new Set(u().map(e=>Le(e.delay_ms,a)))].sort(),r=n-8,o=i-10-t.length*14;e.font=`bold 9px system-ui, sans-serif`,e.textAlign=`right`,e.textBaseline=`middle`;for(let n=t.length-1;n>=0;n--){let i=t[n],a=o+n*14;e.beginPath(),e.arc(r-40,a,4,0,Math.PI*2),e.fillStyle=Y[i],e.fill(),e.strokeStyle=`rgba(0,0,0,0.5)`,e.lineWidth=.8,e.stroke(),e.fillStyle=`rgba(220,220,220,0.85)`,e.fillText(Fe[i],r-48,a)}}e.textBaseline=`alphabetic`,e.textAlign=`left`}function Z(){X(),G&&O(G.toDataURL(`image/png`))}function He(e,t){let n=G.getBoundingClientRect();return{nx:(e-n.left)/n.width,ny:(t-n.top)/n.height}}function Ue(e,t){let{w:n,h:r}=ze(),i=e*n,a=t*r,o=Math.max(7,Math.min(11,n/50))+14;for(let e=u().length-1;e>=0;e--){let t=u()[e].x*n,s=u()[e].y*r;if(Math.hypot(i-t,a-s)<=o)return u()[e]}return null}function We(e,t){let n=G.getBoundingClientRect();m(ne,e-n.left),m(re,t-n.top),m(ie,!0),ae&&clearTimeout(ae),ae=setTimeout(()=>{m(ie,!1)},400)}function Ge(e){j()||e.preventDefault()}function Ke(e){if(j())return;let{nx:t,ny:n}=He(e.clientX,e.clientY),i=Ue(t,n);if(r(I)&&r(L)!==null){if(i&&i.id!==r(L))return;J();let a=e=>Math.max(.02,Math.min(.98,e));u(u().map(e=>e.id===r(L)?{...e,x:a(t),y:a(n)}:e)),We(e.clientX,e.clientY),m(I,!1),m(L,null);let o=u().find(e=>e.id===r(P)?.id);o&&(m(P,{...o},!0),m(F,!0)),Z();return}if(i)r(P)&&r(P).id===i.id&&r(F)?Je():qe(i);else{if(r(F)){Je();return}We(e.clientX,e.clientY),Ye(t,n)}X()}function qe(e){m(N,e.id,!0),m(P,{...e},!0),m(F,!0),m(q,!1),X()}function Je(){m(F,!1),m(P,null),m(N,null),m(I,!1),m(L,null),m(q,!1),X()}function Ye(e,t){J();let n=r(ke),i={id:n,x:e,y:t,delay_ms:u().length>0?u()[u().length-1].delay_ms+25:0,label:String(n)};u().length>0&&T([...T(),{from:u()[u().length-1].id,to:n}]),u([...u(),i]),m(N,n,!0),m(P,{...i},!0),m(F,!0),m(q,!1),Z()}function Xe(){K&&Ye(.5,.5)}function Ze(){r(P)&&(J(),u(u().map(e=>e.id===r(P).id?{...r(P)}:e)),Z(),m(N,r(P).id,!0))}function Qe(e){r(P)&&(m(P,{...r(P),delay_ms:Math.max(0,r(P).delay_ms+e)},!0),Ze())}function $e(){r(P)&&(m(L,r(P).id,!0),m(I,!0),m(F,!1),X())}function et(){m(q,!0)}function tt(){if(!r(P))return;J();let e=r(P).id;u(u().filter(t=>t.id!==e)),T(T().filter(t=>t.from!==e&&t.to!==e)),Je(),Z()}function nt(){J();let e=[],t=[],n=Math.max(1,Math.min(20,r(oe))),i=Math.max(1,Math.min(20,r(se))),a=Math.max(0,r(B));function o(e,t,n,r){return{id:e,x:Math.max(.05,Math.min(.95,t)),y:Math.max(.05,Math.min(.95,n)),delay_ms:r*a,label:String(e)}}let s=1,c=0;if(r(R)===`ligne`)for(let n=0;n<i;n++){let r=i===1?.5:.1+n/(i-1)*.8;e.push(o(s,r,.5,c)),s>1&&t.push({from:s-1,to:s}),s++,c++}else if(r(R)===`grille`)for(let r=0;r<n;r++)for(let a=0;a<i;a++){let l=i===1?.5:.1+a/(i-1)*.8,u=n===1?.5:.1+r/(n-1)*.8;e.push(o(s,l,u,c)),a>0&&t.push({from:s-1,to:s}),s++,c++}else if(r(R)===`vcut`){let r=Math.max(2,n);for(let t=0;t<r;t++){let n=.15+t/(r-1)*.7,i=.45-t/(r-1)*.35;e.push(o(s,i,n,c)),s++,c++;let a=.55+t/(r-1)*.35;e.push(o(s,a,n,c)),s++,c++}for(let n=1;n<e.length;n++)t.push({from:e[n-1].id,to:e[n].id})}else if(r(R)===`echelon`){let r=i;for(let i=0;i<n;i++){let a=n===1?.5:.1+i/(n-1)*.8,l=i%2==1&&r>1?.4/(r-1):0;for(let n=0;n<r;n++){let i=r===1?.5:.1+l+n/(r-1)*(.8-l*2);e.push(o(s,i,a,c)),n>0&&t.push({from:s-1,to:s}),s++,c++}}}u(e),T(t),m(M,`none`),Z()}async function rt(e){let t=e.target.files?.[0];if(t){m(H,``),m(V,!0);try{let e=(await te())?.gemini_api_key||``;if(!e){m(H,`Configure ta clé Gemini dans Profil`),m(V,!1);return}let n=await it(t),r=t.type||`image/jpeg`,i=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${e}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({contents:[{parts:[{text:`Analyze this blast drill pattern image. Extract all drill holes with their positions and timing delays.
Return JSON only (no markdown): { "holes": [{"x": 0-1, "y": 0-1, "delay_ms": number, "label": "string"}] }
x=0 is left, x=1 is right, y=0 is top, y=1 is bottom.
If delays are visible, include them. If not, set delay_ms to -1.
Normalize positions to 0-1 range based on the image boundaries.`},{inlineData:{mimeType:r,data:n}}]}]})});if(!i.ok){let e=await i.json().catch(()=>({}));throw Error(e?.error?.message||`Erreur API: ${i.status}`)}let a=((await i.json())?.candidates?.[0]?.content?.parts?.[0]?.text||``).match(/\{[\s\S]*\}/);if(!a)throw Error(`Réponse invalide de Gemini`);let o=JSON.parse(a[0]);if(!o.holes||!Array.isArray(o.holes))throw Error(`Format de réponse inattendu`);J();let s=o.holes.map((e,t)=>({id:t+1,x:Math.max(.05,Math.min(.95,Number(e.x)||.5)),y:Math.max(.05,Math.min(.95,Number(e.y)||.5)),delay_ms:Number(e.delay_ms)>=0?Number(e.delay_ms):0,label:e.label?String(e.label):String(t+1)})),c=[];for(let e=1;e<s.length;e++)c.push({from:s[e-1].id,to:s[e].id});u(s),T(c),m(M,`none`),Z()}catch(e){m(H,e?.message||`Erreur lors de l'importation`,!0)}finally{m(V,!1),r(U)&&(r(U).value=``)}}}function it(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{let e=r.result;t(e.split(`,`)[1])},r.onerror=n,r.readAsDataURL(e)})}w(()=>{let e=new ResizeObserver(()=>Be());return K&&e.observe(K),Be(),()=>e.disconnect()}),l(()=>{u(),T(),X()}),l(()=>{r(N),r(I),X()}),l(()=>{G&&u().length>0&&!O()&&Z()});var at=De(),ot=d(at),st=s(ot),ct=t=>{var n=ge(),i=d(n),a=s(i),o=A(a,2),l=A(o,2);e(i);var u=A(i,2),f=t=>{var n=fe(),i=A(s(n),4),a=t=>{var n=z(),i=s(n),a=A(i),o=e=>{k(e,le())},l=p(()=>r(H).includes(`Gemini`));g(a,e=>{r(l)&&e(o)}),e(n),c(()=>E(i,`⚠️ ${r(H)??``} `)),k(t,n)};g(i,e=>{r(H)&&e(a)});var o=A(i,2),l=e=>{k(e,ue())},u=t=>{var n=de(),i=A(s(n));C(i,e=>m(U,e),()=>r(U)),e(n),D(`change`,i,rt),k(t,n)};g(o,e=>{r(V)?e(l):e(u,-1)}),e(n),k(t,n)};g(u,e=>{r(M)===`photo`&&e(f)});var h=A(u,2),_=t=>{var n=he(),i=A(s(n),2);x(i,20,()=>[{id:`ligne`,icon:`─`,label:`Ligne droite`,desc:`1 rangée`},{id:`grille`,icon:`⊞`,label:`Grille`,desc:`Rectangulaire`},{id:`vcut`,icon:`∨`,label:`V-cut / Bouchon`,desc:`Coupe en V`},{id:`echelon`,icon:`≋`,label:`Échelon`,desc:`Rangées décalées`}],ee,(t,n)=>{var i=pe(),a=s(i),o=s(a,!0);e(a);var l=A(a,2),u=s(l,!0);e(l);var d=A(l,2),f=s(d,!0);e(d),e(i),c(()=>{b(i,`
            padding: 10px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;
            cursor: pointer; font-family: inherit; border: 1px solid; text-align: center;
            ${r(R)===n.id?`background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);`:`background: var(--card); border-color: var(--border); color: var(--text2);`}
          `),E(o,n.icon),E(u,n.label),E(f,n.desc)}),D(`click`,i,()=>m(R,n.id,!0)),k(t,i)}),e(i);var a=A(i,2),o=s(a),l=t=>{var n=me(),i=A(s(n),2);S(i),e(n),y(i,()=>r(oe),e=>m(oe,e)),k(t,n)};g(o,e=>{r(R)!==`ligne`&&e(l)});var u=A(o,2),d=s(u),f=s(d,!0);e(d);var p=A(d,2);S(p),e(u);var h=A(u,2),_=A(s(h),2);S(_),e(h);var v=A(h,2),C=A(s(v),2);S(C),e(v);var w=A(v,2),T=A(s(w),2);S(T),e(w),e(a);var O=A(a,2);e(n),c(()=>E(f,r(R)===`ligne`?`Nb trous`:`Trous/rangée`)),y(p,()=>r(se),e=>m(se,e)),y(_,()=>r(ce),e=>m(ce,e)),y(C,()=>r(Oe),e=>m(Oe,e)),y(T,()=>r(B),e=>m(B,e)),D(`click`,O,nt),k(t,n)};g(h,e=>{r(M)===`template`&&e(_)}),c(()=>{b(a,`
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
      `)}),D(`click`,a,()=>m(M,r(M)===`photo`?`none`:`photo`,!0)),D(`click`,o,()=>m(M,r(M)===`template`?`none`:`template`,!0)),D(`click`,l,()=>{m(M,`none`)}),k(t,n)};g(st,e=>{j()||e(ct)});var lt=A(st,2),ut=t=>{var n=_e(),r=A(s(n));e(n),D(`click`,r,()=>{m(I,!1),m(L,null),m(F,!0),X()}),k(t,n)};g(lt,e=>{r(I)&&e(ut)});var Q=A(lt,2),$=s(Q);C($,e=>G=e,()=>G);var dt=A($,2),ft=e=>{var t=ve();c(()=>b(t,`
        position: absolute;
        left: ${r(ne)-20}px;
        top: ${r(re)-20}px;
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        pointer-events: none;
        animation: ripple-anim 0.4s ease-out forwards;
      `)),k(e,t)};g(dt,e=>{r(ie)&&e(ft)});var pt=A(dt,2),mt=e=>{k(e,ye())};g(pt,e=>{u().length===0&&!j()&&!r(I)&&e(mt)}),e(Q),C(Q,e=>K=e,()=>K);var ht=A(Q,2),gt=t=>{var n=Se(),i=s(n),a=s(i);e(i);var o=A(i,2),l=t=>{var n=v();x(d(n),17,()=>u().filter(e=>e.id===r(N)),ee,(t,n)=>{var i=be(),a=s(i);e(i),c(()=>E(a,`· Trou ${r(n).label??``} — panneau ouvert`)),k(t,i)}),k(t,n)},f=e=>{k(e,xe())};g(o,e=>{r(N)!==null&&r(F)?e(l):j()||e(f,1)}),e(n),c(()=>E(a,`${u().length??``} trou${u().length>1?`s`:``}`)),k(t,n)};g(ht,e=>{u().length>0&&!r(I)&&e(gt)});var _t=A(ht,2),vt=t=>{var n=Ce(),r=s(n),i=A(r,2),a=A(i,2),o=A(a,2),l=A(o,2);e(n),c(()=>{i.disabled=u().length===0,b(i,`
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
      `),o.disabled=W.length===0,b(o,`
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border);
        color: ${W.length===0?`var(--text3)`:`var(--text2)`};
        cursor: ${W.length===0?`default`:`pointer`}; font-family: inherit; text-align: center;
      `),l.disabled=u().length===0,b(l,`
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--red-dim); border: 1px solid var(--red);
        color: ${u().length===0?`var(--text3)`:`var(--red)`};
        cursor: ${u().length===0?`default`:`pointer`}; font-family: inherit; text-align: center;
      `)}),D(`click`,r,Xe),D(`click`,i,Me),D(`click`,a,Ne),D(`click`,o,Ae),D(`click`,l,je),k(t,n)};g(_t,e=>{!j()&&!r(I)&&e(vt)}),e(ot);var yt=A(ot,2),bt=t=>{var n=Ee(),i=A(s(n),2),a=s(i),o=s(a);e(a);var l=A(a,2);e(i);var u=A(i,2),f=s(u),p=A(s(f),2),h=s(p),_=A(h,2),v=A(_,2);S(v);var b=A(v,2),ee=A(b,2);e(p),e(f);var x=A(f,2),C=A(s(x),2);S(C),e(x);var w=A(x,2),T=s(w),O=A(T,2),te=e=>{var t=we();D(`click`,t,et),k(e,t)},j=e=>{var t=Te(),n=d(t),r=A(n,2);D(`click`,n,tt),D(`click`,r,()=>m(q,!1)),k(e,t)};g(O,e=>{r(q)?e(j,-1):e(te)}),e(w),e(u),e(n),c(()=>E(o,`✏️ Trou ${r(P).label??``}`)),D(`click`,l,Je),D(`click`,h,()=>Qe(-25)),D(`click`,_,()=>Qe(-5)),D(`input`,v,Ze),y(v,()=>r(P).delay_ms,e=>r(P).delay_ms=e),D(`click`,b,()=>Qe(5)),D(`click`,ee,()=>Qe(25)),D(`input`,C,Ze),y(C,()=>r(P).label,e=>r(P).label=e),D(`click`,T,$e),k(t,n)};g(yt,e=>{r(F)&&r(P)&&!j()&&e(bt)}),c(()=>b(Q,`
      position: relative; width: 100%; border-radius: 8px; overflow: hidden;
      border: ${r(I)?`2px solid #f5c518`:`1px solid var(--border)`};
      cursor: ${j()?`default`:r(I)?`crosshair`:`pointer`};
      touch-action: none;
    `)),D(`pointerdown`,$,function(...e){(j()?void 0:Ge)?.apply(this,e)}),D(`pointerup`,$,function(...e){(j()?void 0:Ke)?.apply(this,e)}),f(`pointercancel`,$,function(...e){(j()?void 0:Ke)?.apply(this,e)}),k(n,at),o()}n([`click`,`change`,`pointerdown`,`pointerup`,`input`]);export{ce as n,Oe as t};
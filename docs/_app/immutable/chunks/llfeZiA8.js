import{$ as e,B as t,C as n,E as r,F as i,H as a,J as o,L as s,M as c,N as l,Q as u,R as d,T as f,U as p,V as m,Y as h,_ as g,a as _,b as v,c as y,d as b,g as x,h as S,l as C,o as w,r as T,u as E,v as D,w as O,x as k,y as A,z as j}from"./J7tXCfCn.js";import"./CT0T0Gak.js";import{o as ee}from"./BfYHUnu2.js";var M=k(`<div style="font-size: 13px; color: var(--text); padding: 6px 0;"> </div>`),N=k(`<input type="text" placeholder="ex: 2.5m SOL / 8.5m ROC" style="font-size: 12px;"/>`),P=k(`<div style="font-size: 13px; color: var(--text); padding: 6px 0;"> </div>`),F=k(`<input type="text" placeholder="ex: Emulite 100, 70mm" style="font-size: 12px;"/>`),I=k(`<div style="
              display: flex; align-items: center; gap: 4px;
              padding: 2px 0;
            "><span style="color: var(--accent2);">•</span> <span style="color: var(--text2); font-size: 10px;"> </span></div>`),L=k(`<div style="font-size: 10px; color: var(--text3); font-style: italic; padding: 4px 0;">Couches ↓</div>`),R=k(`<div style="font-size: 12px; color: var(--text2);"> </div>`),te=k(`<input type="text" placeholder="ex: 2.5m pierre nette" style="font-size: 12px;"/>`),ne=k(`<div style="font-size: 12px; color: var(--text2);"> </div>`),re=k(`<input type="text" placeholder="ex: 3×500g Emulite, détonateur 500ms" style="font-size: 12px;"/>`),ie=k(`<div style="margin-bottom: 8px;"><label style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">Étiquettes de couches (une par ligne)</label> <textarea placeholder="Mort terrain Roc fracturé Roc sain Sous-forage" rows="4" style="font-size: 11px; min-height: 72px;"></textarea></div>`),z=k(`<span style="font-size: 12px; color: var(--text);"> </span> <span style="color: var(--text3);">à</span> <span style="font-size: 12px; color: var(--text);"> </span>`,1),ae=k(`<input type="text" placeholder="de" style="width: 56px; font-size: 12px; text-align: center;"/> <span style="color: var(--text3);">à</span> <input type="text" placeholder="à" style="width: 56px; font-size: 12px; text-align: center;"/>`,1),oe=k(`<div style="
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
    "><span style="font-size: 11px; color: var(--text3); font-weight: 600; white-space: nowrap;">Trous n°:</span> <!></div></div></div>`);function se(t,n){h(n,!0);let a=_(n,`schema`,15),l=_(n,`readonly`,3,!1),f=p(()=>a().couches?a().couches.split(`
`).filter(e=>e.trim()):[]);var m=oe(),b=s(m),w=s(b);e(b);var T=j(b,2),O=s(T),k=s(O),ee=j(k,2),se=t=>{var n=M(),r=s(n,!0);e(n),c(()=>D(r,a().profondeur_sol_roc||`—`)),A(t,n)},ce=e=>{var t=N();C(t),c(()=>E(t,`id`,`prof_${n.index??``}`)),y(t,()=>a().profondeur_sol_roc,e=>a(a().profondeur_sol_roc=e,!0)),A(e,t)};g(ee,e=>{l()?e(se):e(ce,-1)}),e(O);var le=j(O,2),ue=s(le),de=j(ue,2),fe=t=>{var n=P(),r=s(n,!0);e(n),c(()=>D(r,a().chargement_type||`—`)),A(t,n)},pe=e=>{var t=F();C(t),c(()=>E(t,`id`,`ct_${n.index??``}`)),y(t,()=>a().chargement_type,e=>a(a().chargement_type=e,!0)),A(e,t)};g(de,e=>{l()?e(fe):e(pe,-1)}),e(le);var me=j(le,2),he=s(me),ge=s(he),_e=t=>{var n=v();S(d(n),17,()=>r(f),x,(t,n)=>{var i=I(),a=j(s(i),2),o=s(a,!0);e(a),e(i),c(()=>D(o,r(n))),A(t,i)}),A(t,n)},ve=e=>{A(e,L())};g(ge,e=>{r(f).length>0?e(_e):l()||e(ve,1)}),e(he),u(2),e(me);var ye=j(me,4),be=s(ye),xe=j(be,2),Se=t=>{var n=R(),r=s(n,!0);e(n),c(()=>D(r,a().bourre||`—`)),A(t,n)},Ce=e=>{var t=te();C(t),c(()=>E(t,`id`,`bourre_${n.index??``}`)),y(t,()=>a().bourre,e=>a(a().bourre=e,!0)),A(e,t)};g(xe,e=>{l()?e(Se):e(Ce,-1)}),e(ye);var we=j(ye,2),Te=s(we),Ee=j(Te,2),De=t=>{var n=ne(),r=s(n,!0);e(n),c(()=>D(r,a().explosifs_amorces||`—`)),A(t,n)},Oe=e=>{var t=re();C(t),c(()=>E(t,`id`,`expl_${n.index??``}`)),y(t,()=>a().explosifs_amorces,e=>a(a().explosifs_amorces=e,!0)),A(e,t)};g(Ee,e=>{l()?e(De):e(Oe,-1)}),e(we);var ke=j(we,2),Ae=t=>{var r=ie(),o=s(r),l=j(o,2);i(l),e(r),c(()=>{E(o,`for`,`couches_${n.index??``}`),E(l,`id`,`couches_${n.index??``}`)}),y(l,()=>a().couches,e=>a(a().couches=e,!0)),A(t,r)};g(ke,e=>{l()||e(Ae)});var B=j(ke,2),V=j(s(B),2),H=t=>{var n=z(),r=d(n),i=s(r,!0);e(r);var o=j(r,4),l=s(o,!0);e(o),c(()=>{D(i,a().trous_de||`___`),D(l,a().trous_a||`___`)}),A(t,n)},U=e=>{var t=ae(),n=d(t);C(n);var r=j(n,4);C(r),y(n,()=>a().trous_de,e=>a(a().trous_de=e,!0)),y(r,()=>a().trous_a,e=>a(a().trous_a=e,!0)),A(e,t)};g(V,e=>{l()?e(H):e(U,-1)}),e(B),e(T),e(m),c(()=>{D(w,`Schéma #${n.index+1} — Disposition des trous de mine / Séquence de mise à feu`),E(k,`for`,`prof_${n.index??``}`),E(ue,`for`,`ct_${n.index??``}`),E(be,`for`,`bourre_${n.index??``}`),E(Te,`for`,`expl_${n.index??``}`)}),A(t,m),o()}var ce=k(`<div style="margin-top: 4px; font-size: 11px; color: var(--text3);" class="svelte-118nmc4">→ Ajoutez votre clé API dans l'onglet <strong class="svelte-118nmc4">Profil</strong></div>`),le=k(`<div style="
        padding: 8px 10px; background: var(--red-dim); border: 1px solid var(--red);
        border-radius: 6px; font-size: 12px; color: var(--red); margin-bottom: 10px;
      " class="svelte-118nmc4"> <!></div>`),ue=k(`<div style="
        padding: 12px; text-align: center;
        background: var(--card); border: 1px solid var(--border); border-radius: 6px;
        font-size: 12px; color: var(--text2);
      " class="svelte-118nmc4">⏳ Analyse en cours avec Gemini...</div>`),de=k(`<label style="
        display: block; padding: 14px;
        background: var(--card); border: 2px dashed var(--border2); border-radius: 8px;
        text-align: center; cursor: pointer; font-size: 13px; color: var(--text3);
        transition: border-color 0.2s;
      " class="svelte-118nmc4">📷 Appuyez pour prendre ou sélectionner une photo <input type="file" accept="image/*" style="display: none;" class="svelte-118nmc4"/></label>`),fe=k(`<div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px; margin-bottom: 10px;
  " class="svelte-118nmc4"><div style="font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 8px;" class="svelte-118nmc4">📸 Importer une photo du plan de tir</div> <div style="font-size: 11px; color: var(--text3); margin-bottom: 10px; line-height: 1.5;" class="svelte-118nmc4">Prenez une photo de votre plan papier. L'IA Gemini extraira les trous et délais automatiquement.</div> <!> <!></div>`),pe=k(`<button class="svelte-118nmc4"><div style="font-size: 18px; margin-bottom: 4px;" class="svelte-118nmc4"> </div> <div style="font-size: 12px;" class="svelte-118nmc4"> </div> <div style="font-size: 10px; color: var(--text3); font-weight: 400; margin-top: 1px;" class="svelte-118nmc4"> </div></button>`),me=k(`<div class="svelte-118nmc4"><label for="tpl-rows" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Rangées</label> <input id="tpl-rows" type="number" min="1" max="20" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div>`),he=k(`<div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: 8px;
    padding: 12px; margin-bottom: 10px;
  " class="svelte-118nmc4"><div style="font-size: 12px; font-weight: 700; color: var(--text2); margin-bottom: 10px;" class="svelte-118nmc4">📐 Choisir un gabarit de patron</div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 12px;" class="svelte-118nmc4"></div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;" class="svelte-118nmc4"><!> <div class="svelte-118nmc4"><label for="tpl-cols" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4"> </label> <input id="tpl-cols" type="number" min="1" max="20" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div> <div class="svelte-118nmc4"><label for="tpl-spacing" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Espacement (m)</label> <input id="tpl-spacing" type="number" min="0.1" step="0.1" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div> <div class="svelte-118nmc4"><label for="tpl-fardeau" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Fardeau (m)</label> <input id="tpl-fardeau" type="number" min="0.1" step="0.1" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div> <div class="svelte-118nmc4"><label for="tpl-delay" style="font-size: 10px; font-weight: 700; color: var(--text3); display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.4px;" class="svelte-118nmc4">Délai de base (ms)</label> <input id="tpl-delay" type="number" min="0" step="5" style="width: 100%; padding: 8px 10px; background: var(--card); border: 1px solid var(--border); border-radius: 6px; color: var(--text); font-size: 15px; font-family: inherit;" class="svelte-118nmc4"/></div></div> <button style="
        width: 100%; padding: 13px; border-radius: 8px; font-size: 14px; font-weight: 700;
        background: var(--accent); color: #fff; border: none; cursor: pointer; font-family: inherit;
      " class="svelte-118nmc4">✨ Générer le patron</button></div>`),ge=k(`<div style="display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap;" class="svelte-118nmc4"><button class="svelte-118nmc4">📸 Photo IA</button> <button class="svelte-118nmc4">📐 Gabarit</button> <button class="svelte-118nmc4">👆 Manuel</button></div> <!> <!>`,1),_e=k(`<div style="
      background: #f5c518; color: #000; padding: 10px 14px; border-radius: 8px;
      margin-bottom: 8px; font-size: 13px; font-weight: 700; text-align: center;
    " class="svelte-118nmc4">📍 Touchez le nouvel emplacement pour déplacer le trou <button style="
          margin-left: 10px; padding: 4px 10px; border-radius: 6px; font-size: 12px;
          background: rgba(0,0,0,0.15); border: 1px solid rgba(0,0,0,0.3); color: #000;
          cursor: pointer; font-family: inherit; font-weight: 600;
        " class="svelte-118nmc4">Annuler</button></div>`),ve=k(`<div class="svelte-118nmc4"></div>`),ye=k(`<div style="
        position: absolute; inset: 0;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        pointer-events: none;
      " class="svelte-118nmc4"><div style="font-size: 28px; margin-bottom: 8px; opacity: 0.3;" class="svelte-118nmc4">💥</div> <div style="font-size: 13px; color: var(--text3); opacity: 0.6; text-align: center; padding: 0 20px;" class="svelte-118nmc4">Touchez pour placer des trous<br class="svelte-118nmc4"/>ou choisissez un gabarit ci-dessus</div></div>`),be=k(`<span style="color: var(--accent2);" class="svelte-118nmc4"> </span>`),xe=k(`<span class="svelte-118nmc4">· Touchez un trou pour le modifier</span>`),Se=k(`<div style="
      display: flex; align-items: center; gap: 6px;
      padding: 6px 4px; font-size: 11px; color: var(--text3);
    " class="svelte-118nmc4"><span class="svelte-118nmc4"> </span> <!></div>`),Ce=k(`<span style="display: flex; align-items: center; gap: 4px;" class="svelte-118nmc4"><span class="svelte-118nmc4"></span> <span class="svelte-118nmc4"> </span></span>`),we=k(`<div style="
      display: flex; flex-wrap: wrap; gap: 6px 10px; padding: 4px 4px 6px;
      font-size: 10px; color: var(--text3);
    " class="svelte-118nmc4"></div>`),Te=k(`<div style="
    display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;
  " class="svelte-118nmc4"><button title="Ajouter un trou au centre" style="
        flex: 1; min-width: 60px;
        padding: 9px 6px; border-radius: 8px; font-size: 11px; font-weight: 600;
        background: var(--card2); border: 1px solid var(--border); color: var(--text2);
        cursor: pointer; font-family: inherit; text-align: center;
      " class="svelte-118nmc4">➕ Trou</button> <button title="Renuméroter tous les trous" class="svelte-118nmc4">🔢 Numéros</button> <button title="Délais automatiques (+25ms par trou)" class="svelte-118nmc4">🔄 Délais</button> <button title="Annuler" class="svelte-118nmc4">↩ Annuler</button> <button title="Effacer tout" class="svelte-118nmc4">🗑️ Vider</button></div>`),Ee=k(`<button style="
              flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
              background: var(--red-dim); border: 1px solid var(--red); color: var(--red);
              cursor: pointer; font-family: inherit; text-align: center;
            " class="svelte-118nmc4">🗑️ Supprimer</button>`),De=k(`<button style="
              flex: 1; padding: 12px 8px; border-radius: 10px; font-size: 13px; font-weight: 700;
              background: var(--red); border: none; color: #fff;
              cursor: pointer; font-family: inherit; text-align: center;
            " class="svelte-118nmc4">⚠️ Confirmer</button> <button style="
              padding: 12px 10px; border-radius: 10px; font-size: 13px; font-weight: 600;
              background: var(--card2); border: 1px solid var(--border); color: var(--text2);
              cursor: pointer; font-family: inherit;
            " class="svelte-118nmc4">✕</button>`,1),Oe=k(`<div role="dialog" aria-modal="true" aria-label="Modifier le trou" style="
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
          " class="svelte-118nmc4">📍 Déplacer</button> <!></div></div></div>`),ke=k(`<div style="width: 100%;" class="svelte-118nmc4"><!> <!> <div class="svelte-118nmc4"><canvas style="display: block; width: 100%; touch-action: none;" class="svelte-118nmc4"></canvas> <!> <!></div> <!> <!> <!></div> <!>`,1);function Ae(n,i){h(i,!0);let u=_(i,`holes`,31,()=>t([])),E=_(i,`connections`,31,()=>t([])),k=_(i,`dataurl`,15,``),M=_(i,`readonly`,3,!1),N=a(`none`),P=a(null),F=a(null),I=a(!1),L=a(!1),R=a(null),te=a(0),ne=a(0),re=a(!1),ie=null,z=a(`grille`),ae=a(3),oe=a(4),se=a(3.5),Ae=a(3),B=a(25),V=a(!1),H=a(``),U=a(null),W=[],G,K,je=p(()=>u().length>0?Math.max(...u().map(e=>e.id))+1:1),q=a(!1);function J(){W.push({holes:u().map(e=>({...e})),connections:E().map(e=>({...e}))}),W.length>20&&W.shift()}function Me(){if(W.length===0)return;let e=W.pop();u(e.holes),E(e.connections),Z()}function Ne(){confirm(`Effacer tous les trous?`)&&(J(),u([]),E([]),Z())}function Pe(){J(),u(u().map((e,t)=>({...e,label:String(t+1)}))),Z()}function Fe(){J(),u(u().map((e,t)=>({...e,delay_ms:t*25}))),Z()}let Ie=`#e65100`,Y=[`#757575`,`#00838f`,`#388e3c`,`#f9a825`,`#bf360c`],Le=[`#9e9e9e`,`#00acc1`,`#43a047`,`#fdd835`,`#e64a19`],Re=[`Bouchon`,`Anneau int.`,`Production`,`Contour`,`Bordure`],ze=[.15,.3,.55,.8,1],Be=a(t([]));function Ve(e,t){if(t<=0)return 2;let n=e/t;for(let e=0;e<ze.length;e++)if(n<=ze[e])return e;return ze.length-1}function He(e,t,n){return n?Ie:Le[e]??Le[2]}function Ue(e,t){return e>120?Math.max(3,Math.min(5,t/100)):e>80?Math.max(4,Math.min(6,t/80)):e>50?Math.max(5,Math.min(7,t/70)):e>20?Math.max(6,Math.min(8,t/60)):Math.max(8,Math.min(11,t/50))}function We(e){return e>120?7:e>80?8:e>50||e>20?9:10}function Ge(){if(!K)return{w:300,h:200};let e=K.clientWidth;return{w:e,h:Math.round(2/3*e)}}function Ke(){if(!G||!K)return;let e=window.devicePixelRatio||1,{w:t,h:n}=Ge();G.width=Math.round(t*e),G.height=Math.round(n*e),G.style.width=`${t}px`,G.style.height=`${n}px`,G.getContext(`2d`).scale(e,e),X()}function qe(e,t,n){return(t.x-e.x)*(n.y-e.y)-(t.y-e.y)*(n.x-e.x)}function Je(e){if(e.length<3)return[...e];let t=[...e].sort((e,t)=>e.x===t.x?e.y-t.y:e.x-t.x),n=[];for(let e of t){for(;n.length>=2&&qe(n[n.length-2],n[n.length-1],e)<=0;)n.pop();n.push(e)}let r=[];for(let e=t.length-1;e>=0;e--){let n=t[e];for(;r.length>=2&&qe(r[r.length-2],r[r.length-1],n)<=0;)r.pop();r.push(n)}return r.pop(),n.pop(),[...n,...r]}function Ye(e,t){if(e.length===0)return e;let n=e.reduce((e,t)=>e+t.x,0)/e.length,r=e.reduce((e,t)=>e+t.y,0)/e.length;return e.map(e=>{let i=e.x-n,a=e.y-r,o=Math.hypot(i,a)||1;return{x:e.x+i/o*t,y:e.y+a/o*t}})}function Xe(e,t){if(t.length<2)return;if(t.length===2){e.beginPath(),e.moveTo(t[0].x,t[0].y),e.lineTo(t[1].x,t[1].y),e.closePath();return}let n=t.length;e.beginPath();for(let r=0;r<n;r++){let i=t[(r-1+n)%n],a=t[r],o=t[(r+1)%n],s=t[(r+2)%n];r===0&&e.moveTo(a.x,a.y);let c=a.x+(o.x-i.x)/6,l=a.y+(o.y-i.y)/6,u=o.x-(s.x-a.x)/6,d=o.y-(s.y-a.y)/6;e.bezierCurveTo(c,l,u,d,o.x,o.y)}e.closePath()}function X(){if(!G)return;let e=G.getContext(`2d`),t=window.devicePixelRatio||1,n=G.width/t,i=G.height/t,a=u().length>0?Math.max(...u().map(e=>e.delay_ms)):0,o=Ue(u().length,n),s=Math.max(3,Math.round(o*.75)),c=We(u().length);e.fillStyle=`#f8f9fa`,e.fillRect(0,0,n,i),e.strokeStyle=`rgba(0,0,0,0.07)`,e.lineWidth=.5;for(let t=0;t<=n;t+=28)e.beginPath(),e.moveTo(t,0),e.lineTo(t,i),e.stroke();for(let t=0;t<=i;t+=28)e.beginPath(),e.moveTo(0,t),e.lineTo(n,t),e.stroke();if(u().length>=2){let t=new Map;for(let e of u()){let r=Ve(e.delay_ms,a);t.has(r)||t.set(r,[]),t.get(r).push({x:e.x*n,y:e.y*i})}let r=[...t.keys()].sort((e,t)=>t-e);for(let n of r){let r=t.get(n);if(r.length<2)continue;let i=Y[n]??Y[2],a=Ye(Je(r),o+5);e.save(),Xe(e,a),e.fillStyle=i+`18`,e.fill(),e.restore(),e.save(),Xe(e,a),e.strokeStyle=i,e.lineWidth=u().length>80?1.2:1.8,e.setLineDash([]),e.stroke(),e.restore()}}if(u().length>=2){let t=o+14,r=Math.min(...u().map(e=>e.x*n))-t,a=Math.max(...u().map(e=>e.x*n))+t,s=Math.min(...u().map(e=>e.y*i))-t,c=Math.max(...u().map(e=>e.y*i))+t;e.strokeStyle=`#2e7d32`,e.lineWidth=1.5,e.setLineDash([6,3]),e.strokeRect(Math.max(4,r),Math.max(4,s),Math.min(n-8,a)-Math.max(4,r),Math.min(i-8,c)-Math.max(4,s)),e.setLineDash([])}r(L)&&(e.strokeStyle=Ie,e.lineWidth=3,e.setLineDash([]),e.strokeRect(2,2,n-4,i-4));for(let t of u()){let c=t.x*n,l=t.y*i,u=t.id===r(P)||t.id===r(R),d=r(L)&&t.id===r(R),f=Ve(t.delay_ms,a),p=He(f,u,d),m=d?Ie:Y[f]??Y[2],h=f===0?s:o;u&&(e.shadowColor=d?Ie:Y[f]??Y[2],e.shadowBlur=10),e.beginPath(),e.arc(c,l,h,0,Math.PI*2),e.fillStyle=d?`#ff5722`:p,e.fill(),e.strokeStyle=u?`#1a1a1a`:m,e.lineWidth=u?2.5:1.5,e.stroke(),e.shadowBlur=0,e.shadowColor=`transparent`}let l=[];e.font=`bold ${c}px system-ui, sans-serif`,e.textBaseline=`middle`;for(let t of u()){if(t.delay_ms<0)continue;let r=t.x*n,u=t.y*i,d=Ve(t.delay_ms,a),f=d===0?s:o,p=String(t.delay_ms),m=e.measureText(p).width+4,h=c+4,g=[{x:r+f+3,y:u},{x:r-f-3-m,y:u},{x:r-m/2,y:u-f-3-h/2},{x:r-m/2,y:u+f+3+h/2}],_=null;for(let e of g){let t={x:e.x-2,y:e.y-h/2-2,w:m+2,h:h+2};if(!(t.x<2||t.x+t.w>n-2||t.y<2||t.y+t.h>i-2)&&!l.some(e=>t.x<e.x+e.w&&t.x+t.w>e.x&&t.y<e.y+e.h&&t.y+t.h>e.y)){_=e,l.push(t);break}}_||(_=g[0],l.push({x:_.x-2,y:_.y-h/2-2,w:m+2,h:h+2}));let v=_.x,y=_.y;e.fillStyle=Y[d]??Y[2],e.textAlign=`left`,e.fillText(p,v,y)}e.textBaseline=`alphabetic`,e.textAlign=`left`,u().length>0?m(Be,[...new Set(u().map(e=>Ve(e.delay_ms,a)))].sort(),!0):m(Be,[],!0)}function Z(){X(),G&&k(G.toDataURL(`image/png`))}function Ze(e,t){let n=G.getBoundingClientRect();return{nx:(e-n.left)/n.width,ny:(t-n.top)/n.height}}function Qe(e,t){let{w:n,h:r}=Ge(),i=e*n,a=t*r,o=Ue(u().length,n),s=Math.max(o+14,20);for(let e=u().length-1;e>=0;e--){let t=u()[e].x*n,o=u()[e].y*r;if(Math.hypot(i-t,a-o)<=s)return u()[e]}return null}function $e(e,t){let n=G.getBoundingClientRect();m(te,e-n.left),m(ne,t-n.top),m(re,!0),ie&&clearTimeout(ie),ie=setTimeout(()=>{m(re,!1)},400)}function et(e){M()||e.preventDefault()}function tt(e){if(M())return;let{nx:t,ny:n}=Ze(e.clientX,e.clientY),i=Qe(t,n);if(r(L)&&r(R)!==null){if(i&&i.id!==r(R))return;J();let a=e=>Math.max(.02,Math.min(.98,e));u(u().map(e=>e.id===r(R)?{...e,x:a(t),y:a(n)}:e)),$e(e.clientX,e.clientY),m(L,!1),m(R,null);let o=u().find(e=>e.id===r(F)?.id);o&&(m(F,{...o},!0),m(I,!0)),Z();return}if(i)r(F)&&r(F).id===i.id&&r(I)?rt():nt(i);else{if(r(I)){rt();return}$e(e.clientX,e.clientY),it(t,n)}X()}function nt(e){m(P,e.id,!0),m(F,{...e},!0),m(I,!0),m(q,!1),X()}function rt(){m(I,!1),m(F,null),m(P,null),m(L,!1),m(R,null),m(q,!1),X()}function it(e,t){J();let n=r(je),i={id:n,x:e,y:t,delay_ms:u().length>0?u()[u().length-1].delay_ms+25:0,label:String(n)};u().length>0&&E([...E(),{from:u()[u().length-1].id,to:n}]),u([...u(),i]),m(P,n,!0),m(F,{...i},!0),m(I,!0),m(q,!1),Z()}function at(){K&&it(.5,.5)}function ot(){r(F)&&(J(),u(u().map(e=>e.id===r(F).id?{...r(F)}:e)),Z(),m(P,r(F).id,!0))}function st(e){r(F)&&(m(F,{...r(F),delay_ms:Math.max(0,r(F).delay_ms+e)},!0),ot())}function ct(){r(F)&&(m(R,r(F).id,!0),m(L,!0),m(I,!1),X())}function lt(){m(q,!0)}function ut(){if(!r(F))return;J();let e=r(F).id;u(u().filter(t=>t.id!==e)),E(E().filter(t=>t.from!==e&&t.to!==e)),rt(),Z()}function dt(){J();let e=[],t=[],n=Math.max(1,Math.min(20,r(ae))),i=Math.max(1,Math.min(20,r(oe))),a=Math.max(0,r(B));function o(e,t,n,r){return{id:e,x:Math.max(.05,Math.min(.95,t)),y:Math.max(.05,Math.min(.95,n)),delay_ms:r*a,label:String(e)}}let s=1,c=0;if(r(z)===`ligne`)for(let n=0;n<i;n++){let r=i===1?.5:.1+n/(i-1)*.8;e.push(o(s,r,.5,c)),s>1&&t.push({from:s-1,to:s}),s++,c++}else if(r(z)===`grille`)for(let r=0;r<n;r++)for(let a=0;a<i;a++){let l=i===1?.5:.1+a/(i-1)*.8,u=n===1?.5:.1+r/(n-1)*.8;e.push(o(s,l,u,c)),a>0&&t.push({from:s-1,to:s}),s++,c++}else if(r(z)===`vcut`){let r=Math.max(2,n);for(let t=0;t<r;t++){let n=.15+t/(r-1)*.7,i=.45-t/(r-1)*.35;e.push(o(s,i,n,c)),s++,c++;let a=.55+t/(r-1)*.35;e.push(o(s,a,n,c)),s++,c++}for(let n=1;n<e.length;n++)t.push({from:e[n-1].id,to:e[n].id})}else if(r(z)===`echelon`){let r=i;for(let i=0;i<n;i++){let a=n===1?.5:.1+i/(n-1)*.8,l=i%2==1&&r>1?.4/(r-1):0;for(let n=0;n<r;n++){let i=r===1?.5:.1+l+n/(r-1)*(.8-l*2);e.push(o(s,i,a,c)),n>0&&t.push({from:s-1,to:s}),s++,c++}}}u(e),E(t),m(N,`none`),Z()}async function ft(e){let t=e.target.files?.[0];if(t){m(H,``),m(V,!0);try{let e=(await ee())?.gemini_api_key||``;if(!e){m(H,`Configure ta clé Gemini dans Profil`),m(V,!1);return}let n=await pt(t),r=t.type||`image/jpeg`,i=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${e}`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({contents:[{parts:[{text:`Analyze this blast drill pattern image. Extract all drill holes with their positions and timing delays.
Return JSON only (no markdown): { "holes": [{"x": 0-1, "y": 0-1, "delay_ms": number, "label": "string"}] }
x=0 is left, x=1 is right, y=0 is top, y=1 is bottom.
If delays are visible, include them. If not, set delay_ms to -1.
Normalize positions to 0-1 range based on the image boundaries.`},{inlineData:{mimeType:r,data:n}}]}]})});if(!i.ok){let e=await i.json().catch(()=>({}));throw Error(e?.error?.message||`Erreur API: ${i.status}`)}let a=((await i.json())?.candidates?.[0]?.content?.parts?.[0]?.text||``).match(/\{[\s\S]*\}/);if(!a)throw Error(`Réponse invalide de Gemini`);let o=JSON.parse(a[0]);if(!o.holes||!Array.isArray(o.holes))throw Error(`Format de réponse inattendu`);J();let s=o.holes.map((e,t)=>({id:t+1,x:Math.max(.05,Math.min(.95,Number(e.x)||.5)),y:Math.max(.05,Math.min(.95,Number(e.y)||.5)),delay_ms:Number(e.delay_ms)>=0?Number(e.delay_ms):0,label:e.label?String(e.label):String(t+1)})),c=[];for(let e=1;e<s.length;e++)c.push({from:s[e-1].id,to:s[e].id});u(s),E(c),m(N,`none`),Z()}catch(e){m(H,e?.message||`Erreur lors de l'importation`,!0)}finally{m(V,!1),r(U)&&(r(U).value=``)}}}function pt(e){return new Promise((t,n)=>{let r=new FileReader;r.onload=()=>{let e=r.result;t(e.split(`,`)[1])},r.onerror=n,r.readAsDataURL(e)})}T(()=>{let e=new ResizeObserver(()=>Ke());return K&&e.observe(K),Ke(),()=>e.disconnect()}),l(()=>{u(),E(),X()}),l(()=>{r(P),r(L),X()}),l(()=>{G&&u().length>0&&!k()&&Z()});var mt=ke(),ht=d(mt),gt=s(ht),_t=t=>{var n=ge(),i=d(n),a=s(i),o=j(a,2),l=j(o,2);e(i);var u=j(i,2),f=t=>{var n=fe(),i=j(s(n),4),a=t=>{var n=le(),i=s(n),a=j(i),o=e=>{A(e,ce())},l=p(()=>r(H).includes(`Gemini`));g(a,e=>{r(l)&&e(o)}),e(n),c(()=>D(i,`⚠️ ${r(H)??``} `)),A(t,n)};g(i,e=>{r(H)&&e(a)});var o=j(i,2),l=e=>{A(e,ue())},u=t=>{var n=de(),i=j(s(n));w(i,e=>m(U,e),()=>r(U)),e(n),O(`change`,i,ft),A(t,n)};g(o,e=>{r(V)?e(l):e(u,-1)}),e(n),A(t,n)};g(u,e=>{r(N)===`photo`&&e(f)});var h=j(u,2),_=t=>{var n=he(),i=j(s(n),2);S(i,20,()=>[{id:`ligne`,icon:`─`,label:`Ligne droite`,desc:`1 rangée`},{id:`grille`,icon:`⊞`,label:`Grille`,desc:`Rectangulaire`},{id:`vcut`,icon:`∨`,label:`V-cut / Bouchon`,desc:`Coupe en V`},{id:`echelon`,icon:`≋`,label:`Échelon`,desc:`Rangées décalées`}],x,(t,n)=>{var i=pe(),a=s(i),o=s(a,!0);e(a);var l=j(a,2),u=s(l,!0);e(l);var d=j(l,2),f=s(d,!0);e(d),e(i),c(()=>{b(i,`
            padding: 10px 8px; border-radius: 8px; font-size: 11px; font-weight: 600;
            cursor: pointer; font-family: inherit; border: 1px solid; text-align: center;
            ${r(z)===n.id?`background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);`:`background: var(--card); border-color: var(--border); color: var(--text2);`}
          `),D(o,n.icon),D(u,n.label),D(f,n.desc)}),O(`click`,i,()=>m(z,n.id,!0)),A(t,i)}),e(i);var a=j(i,2),o=s(a),l=t=>{var n=me(),i=j(s(n),2);C(i),e(n),y(i,()=>r(ae),e=>m(ae,e)),A(t,n)};g(o,e=>{r(z)!==`ligne`&&e(l)});var u=j(o,2),d=s(u),f=s(d,!0);e(d);var p=j(d,2);C(p),e(u);var h=j(u,2),_=j(s(h),2);C(_),e(h);var v=j(h,2),w=j(s(v),2);C(w),e(v);var T=j(v,2),E=j(s(T),2);C(E),e(T),e(a);var k=j(a,2);e(n),c(()=>D(f,r(z)===`ligne`?`Nb trous`:`Trous/rangée`)),y(p,()=>r(oe),e=>m(oe,e)),y(_,()=>r(se),e=>m(se,e)),y(w,()=>r(Ae),e=>m(Ae,e)),y(E,()=>r(B),e=>m(B,e)),O(`click`,k,dt),A(t,n)};g(h,e=>{r(N)===`template`&&e(_)}),c(()=>{b(a,`
        flex: 1; min-width: 90px;
        padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; font-family: inherit; border: 1px solid;
        text-align: center;
        ${r(N)===`photo`?`background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);`:`background: var(--card2); border-color: var(--border); color: var(--text2);`}
      `),b(o,`
        flex: 1; min-width: 90px;
        padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; font-family: inherit; border: 1px solid;
        text-align: center;
        ${r(N)===`template`?`background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);`:`background: var(--card2); border-color: var(--border); color: var(--text2);`}
      `),b(l,`
        flex: 1; min-width: 90px;
        padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;
        cursor: pointer; font-family: inherit; border: 1px solid;
        text-align: center;
        ${r(N)===`none`?`background: var(--accent-glow); border-color: var(--accent); color: var(--accent2);`:`background: var(--card2); border-color: var(--border); color: var(--text2);`}
      `)}),O(`click`,a,()=>m(N,r(N)===`photo`?`none`:`photo`,!0)),O(`click`,o,()=>m(N,r(N)===`template`?`none`:`template`,!0)),O(`click`,l,()=>{m(N,`none`)}),A(t,n)};g(gt,e=>{M()||e(_t)});var vt=j(gt,2),yt=t=>{var n=_e(),r=j(s(n));e(n),O(`click`,r,()=>{m(L,!1),m(R,null),m(I,!0),X()}),A(t,n)};g(vt,e=>{r(L)&&e(yt)});var Q=j(vt,2),$=s(Q);w($,e=>G=e,()=>G);var bt=j($,2),xt=e=>{var t=ve();c(()=>b(t,`
        position: absolute;
        left: ${r(te)-20}px;
        top: ${r(ne)-20}px;
        width: 40px; height: 40px;
        border-radius: 50%;
        background: rgba(255,255,255,0.3);
        pointer-events: none;
        animation: ripple-anim 0.4s ease-out forwards;
      `)),A(e,t)};g(bt,e=>{r(re)&&e(xt)});var St=j(bt,2),Ct=e=>{A(e,ye())};g(St,e=>{u().length===0&&!M()&&!r(L)&&e(Ct)}),e(Q),w(Q,e=>K=e,()=>K);var wt=j(Q,2),Tt=t=>{var n=Se(),i=s(n),a=s(i);e(i);var o=j(i,2),l=t=>{var n=v();S(d(n),17,()=>u().filter(e=>e.id===r(P)),x,(t,n)=>{var i=be(),a=s(i);e(i),c(()=>D(a,`· Trou ${r(n).label??``} — panneau ouvert`)),A(t,i)}),A(t,n)},f=e=>{A(e,xe())};g(o,e=>{r(P)!==null&&r(I)?e(l):M()||e(f,1)}),e(n),c(()=>D(a,`${u().length??``} trou${u().length>1?`s`:``}`)),A(t,n)};g(wt,e=>{u().length>0&&!r(L)&&e(Tt)});var Et=j(wt,2),Dt=t=>{var n=we();S(n,21,()=>r(Be),x,(t,n)=>{var i=Ce(),a=s(i),o=j(a,2),l=s(o,!0);e(o),e(i),c(()=>{b(a,`
            display: inline-block; width: 10px; height: 10px; border-radius: 50%;
            background: ${Le[r(n)]??``}; border: 1.5px solid ${Y[r(n)]??``}; flex-shrink: 0;
          `),D(l,Re[r(n)])}),A(t,i)}),e(n),A(t,n)};g(Et,e=>{r(Be).length>0&&e(Dt)});var Ot=j(Et,2),kt=t=>{var n=Te(),r=s(n),i=j(r,2),a=j(i,2),o=j(a,2),l=j(o,2);e(n),c(()=>{i.disabled=u().length===0,b(i,`
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
      `)}),O(`click`,r,at),O(`click`,i,Pe),O(`click`,a,Fe),O(`click`,o,Me),O(`click`,l,Ne),A(t,n)};g(Ot,e=>{!M()&&!r(L)&&e(kt)}),e(ht);var At=j(ht,2),jt=t=>{var n=Oe(),i=j(s(n),2),a=s(i),o=s(a);e(a);var l=j(a,2);e(i);var u=j(i,2),f=s(u),p=j(s(f),2),h=s(p),_=j(h,2),v=j(_,2);C(v);var b=j(v,2),x=j(b,2);e(p),e(f);var S=j(f,2),w=j(s(S),2);C(w),e(S);var T=j(S,2),E=s(T),k=j(E,2),ee=e=>{var t=Ee();O(`click`,t,lt),A(e,t)},M=e=>{var t=De(),n=d(t),r=j(n,2);O(`click`,n,ut),O(`click`,r,()=>m(q,!1)),A(e,t)};g(k,e=>{r(q)?e(M,-1):e(ee)}),e(T),e(u),e(n),c(()=>D(o,`✏️ Trou ${r(F).label??``}`)),O(`click`,l,rt),O(`click`,h,()=>st(-25)),O(`click`,_,()=>st(-5)),O(`input`,v,ot),y(v,()=>r(F).delay_ms,e=>r(F).delay_ms=e),O(`click`,b,()=>st(5)),O(`click`,x,()=>st(25)),O(`input`,w,ot),y(w,()=>r(F).label,e=>r(F).label=e),O(`click`,E,ct),A(t,n)};g(At,e=>{r(I)&&r(F)&&!M()&&e(jt)}),c(()=>b(Q,`
      position: relative; width: 100%; border-radius: 8px; overflow: hidden;
      border: ${r(L)?`2px solid #f5c518`:`1px solid var(--border)`};
      cursor: ${M()?`default`:r(L)?`crosshair`:`pointer`};
      touch-action: none;
    `)),O(`pointerdown`,$,function(...e){(M()?void 0:et)?.apply(this,e)}),O(`pointerup`,$,function(...e){(M()?void 0:tt)?.apply(this,e)}),f(`pointercancel`,$,function(...e){(M()?void 0:tt)?.apply(this,e)}),A(n,mt),o()}n([`click`,`change`,`pointerdown`,`pointerup`,`input`]);export{se as n,Ae as t};
import{B as e,C as t,E as n,H as r,J as i,L as a,M as o,Q as s,R as c,U as l,V as u,Y as d,_ as f,b as p,c as m,d as h,g,h as _,l as v,r as y,v as b,w as x,x as S,y as C,z as w}from"../chunks/Dpq0MdiO.js";import{c as T,t as E}from"../chunks/KxK7eKPx.js";import"../chunks/CT0T0Gak.js";import"../chunks/D4C03Baa.js";import{t as D}from"../chunks/D7Nd8s-2.js";import{a as O,n as k}from"../chunks/BfYHUnu2.js";var A=S(`<button> </button>`),j=S(`<div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>`),M=S(`<div style="font-size: 48px; margin-bottom: 12px;">📋</div> <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">Aucun journal</div> <div style="font-size: 13px; color: var(--text3); margin-bottom: 16px;">Créez votre premier journal de tir</div> <button class="btn btn-primary">✏️ Créer maintenant</button>`,1),N=S(`<div style="font-size: 13px; color: var(--text3);"> </div>`),P=S(`<div style="
      text-align: center; padding: 40px 20px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    "><!></div>`),F=S(`<div style="font-size: 10px; color: var(--text3);"> </div>`),I=S(`<div><button style="
            width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px;
            cursor: pointer; background: none; border: none; text-align: left; font-family: inherit;
          "><div style="
            width: 42px; height: 42px; border-radius: 8px; background: var(--card2);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0; border: 1px solid var(--border);
          ">💥</div> <div style="flex: 1; min-width: 0;"><div style="font-size: 13px; font-weight: 700; color: var(--text);"> </div> <div style="font-size: 11px; color: var(--text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"> </div> <!></div> <span> </span></button> <div style="
          display: flex; gap: 6px; padding: 8px 14px;
          border-top: 1px solid var(--border); background: rgba(0,0,0,0.1);
        "><button style="
              flex: 1; padding: 7px 10px; background: var(--card2); border: 1px solid var(--border);
              color: var(--text2); border-radius: 6px; font-size: 11px; font-weight: 600;
              cursor: pointer; font-family: inherit;
            ">👁️ Voir</button> <button style="
              flex: 1; padding: 7px 10px; background: var(--accent-glow); border: 1px solid var(--accent);
              color: var(--accent2); border-radius: 6px; font-size: 11px; font-weight: 600;
              cursor: pointer; font-family: inherit;
            ">✏️ Modifier</button> <button style="
              padding: 7px 10px; background: var(--red-dim); border: 1px solid var(--red);
              color: var(--red); border-radius: 6px; font-size: 11px; font-weight: 600;
              cursor: pointer; font-family: inherit;
            ">🗑️</button></div></div>`),L=S(`<div style="padding: 14px 12px 0;"><div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px; margin-bottom: 12px;
  "><div style="font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 2px;">📂 Historique des tirs</div> <div style="font-size: 12px; color: var(--text3);"> </div></div> <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 12px; margin-bottom: 12px;
  "><input type="text" placeholder="🔍 Rechercher par numéro, chantier, date..." style="margin-bottom: 8px;"/> <div style="display: flex; gap: 8px; flex-wrap: wrap;"></div></div> <button class="btn btn-primary btn-full" style="margin-bottom: 12px;">✏️ Nouveau journal de tir</button> <!></div>`);function R(t,S){d(S,!0);let R=r(e([])),z=r(!0),B=r(``),V=r(`tous`);y(async()=>{u(R,await O(),!0),u(z,!1)});let H=l(()=>n(R).filter(e=>{let t=!n(B)||e.numero_tir?.toLowerCase().includes(n(B).toLowerCase())||e.localisation_chantier?.toLowerCase().includes(n(B).toLowerCase())||e.date_tir?.includes(n(B))||e.boutefeu_nom?.toLowerCase().includes(n(B).toLowerCase()),r=n(V)===`tous`||e.statut===n(V);return t&&r}));async function U(e){confirm(`Supprimer "${e.numero_tir}"? Cette action est irréversible.`)&&(await k(e.id),u(R,n(R).filter(t=>t.id!==e.id),!0),D(`🗑️ Journal supprimé`,`info`))}function W(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`fr-CA`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}var G=L(),K=a(G),q=w(a(K),2),J=a(q);s(q),s(K);var Y=w(K,2),X=a(Y);v(X);var Z=w(X,2);_(Z,20,()=>[{val:`tous`,label:`Tous`},{val:`brouillon`,label:`✏️ Brouillons`},{val:`complete`,label:`✅ Complétés`}],g,(e,t)=>{var r=A(),i=a(r,!0);s(r),o(()=>{h(r,`
            padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
            cursor: pointer; border: 1px solid ${n(V)===t.val?`var(--accent)`:`var(--border)`};
            background: ${n(V)===t.val?`var(--accent-glow)`:`var(--card2)`};
            color: ${n(V)===t.val?`var(--accent2)`:`var(--text3)`};
            font-family: inherit;
          `),b(i,t.label)}),x(`click`,r,()=>u(V,t.val,!0)),C(e,r)}),s(Z),s(Y);var Q=w(Y,2),$=w(Q,2),ee=e=>{C(e,j())},te=e=>{var t=P(),r=a(t),i=e=>{var t=M();x(`click`,w(c(t),6),()=>E(T+`/journal/new`)),C(e,t)},l=e=>{var t=N(),r=a(t);s(t),o(()=>b(r,`Aucun résultat pour "${n(B)??``}"`)),C(e,t)};f(r,e=>{n(R).length===0?e(i):e(l,-1)}),s(t),C(e,t)},ne=e=>{var t=p();_(c(t),17,()=>n(H),g,(e,t)=>{var r=I(),i=a(r),c=w(a(i),2),l=a(c),u=a(l,!0);s(l);var d=w(l,2),p=a(d);s(d);var m=w(d,2),g=e=>{var r=F(),i=a(r);s(r),o(()=>b(i,`👷 ${n(t).boutefeu_prenom??``} ${n(t).boutefeu_nom??``}`)),C(e,r)};f(m,e=>{n(t).boutefeu_nom&&e(g)}),s(c);var _=w(c,2),v=a(_,!0);s(_),s(i);var y=w(i,2),S=a(y),D=w(S,2),O=w(D,2);s(y),s(r),o(e=>{h(r,`
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        margin-bottom: 10px; overflow: hidden;
        border-left: 3px solid ${n(t).statut===`complete`?`var(--green)`:`var(--yellow)`};
      `),b(u,n(t).numero_tir||`Sans numéro`),b(p,`${(n(t).localisation_chantier||`Chantier —`)??``} · ${e??``}`),h(_,`
            font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; white-space: nowrap;
            ${n(t).statut===`complete`?`background: var(--green-dim); color: var(--green); border: 1px solid rgba(46,204,113,0.3);`:`background: var(--yellow-dim); color: var(--yellow); border: 1px solid rgba(243,156,18,0.3);`}
          `),b(v,n(t).statut===`complete`?`✅ Complété`:`✏️ Brouillon`)},[()=>W(n(t).date_tir)]),x(`click`,i,()=>E(T+`/journal/${n(t).id}`)),x(`click`,S,()=>E(T+`/journal/${n(t).id}`)),x(`click`,D,()=>E(T+`/journal/new?edit=${n(t).id}`)),x(`click`,O,()=>U(n(t))),C(e,r)}),C(e,t)};f($,e=>{n(z)?e(ee):n(H).length===0?e(te,1):e(ne,-1)}),s(G),o(()=>b(J,`${n(R).length??``} journal${n(R).length===1?``:`x`} au total`)),m(X,()=>n(B),e=>u(B,e)),x(`click`,Q,()=>E(T+`/journal/new`)),C(t,G),i()}t([`click`]);export{R as component};
import{$ as e,B as t,C as n,E as r,H as i,J as a,L as o,M as s,R as c,U as l,V as u,Y as d,_ as f,b as p,c as m,d as h,g,h as _,l as v,r as y,v as b,w as x,x as S,y as C,z as w}from"../chunks/J7tXCfCn.js";import{c as T,t as E}from"../chunks/C3yPtGKd.js";import"../chunks/CT0T0Gak.js";import"../chunks/Bz0M9qyE.js";import{t as D}from"../chunks/CjOZp5Y3.js";import{a as O,n as k}from"../chunks/BfYHUnu2.js";var A=S(`<button> </button>`),j=S(`<div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>`),M=S(`<div style="font-size: 48px; margin-bottom: 12px;">📋</div> <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">Aucun journal</div> <div style="font-size: 13px; color: var(--text3); margin-bottom: 16px;">Créez votre premier journal de tir</div> <button class="btn btn-primary">✏️ Créer maintenant</button>`,1),N=S(`<div style="font-size: 13px; color: var(--text3);"> </div>`),P=S(`<div style="
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
  "><input type="text" placeholder="🔍 Rechercher par numéro, chantier, date..." style="margin-bottom: 8px;"/> <div style="display: flex; gap: 8px; flex-wrap: wrap;"></div></div> <button class="btn btn-primary btn-full" style="margin-bottom: 12px;">✏️ Nouveau journal de tir</button> <!></div>`);function R(n,S){d(S,!0);let R=i(t([])),z=i(!0),B=i(``),V=i(`tous`);y(async()=>{u(R,await O(),!0),u(z,!1)});let H=l(()=>r(R).filter(e=>{let t=!r(B)||e.numero_tir?.toLowerCase().includes(r(B).toLowerCase())||e.localisation_chantier?.toLowerCase().includes(r(B).toLowerCase())||e.date_tir?.includes(r(B))||e.boutefeu_nom?.toLowerCase().includes(r(B).toLowerCase()),n=r(V)===`tous`||e.statut===r(V);return t&&n}));async function U(e){confirm(`Supprimer "${e.numero_tir}"? Cette action est irréversible.`)&&(await k(e.id),u(R,r(R).filter(t=>t.id!==e.id),!0),D(`🗑️ Journal supprimé`,`info`))}function W(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`fr-CA`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}var G=L(),K=o(G),q=w(o(K),2),J=o(q);e(q),e(K);var Y=w(K,2),X=o(Y);v(X);var Z=w(X,2);_(Z,20,()=>[{val:`tous`,label:`Tous`},{val:`brouillon`,label:`✏️ Brouillons`},{val:`complete`,label:`✅ Complétés`}],g,(t,n)=>{var i=A(),a=o(i,!0);e(i),s(()=>{h(i,`
            padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
            cursor: pointer; border: 1px solid ${r(V)===n.val?`var(--accent)`:`var(--border)`};
            background: ${r(V)===n.val?`var(--accent-glow)`:`var(--card2)`};
            color: ${r(V)===n.val?`var(--accent2)`:`var(--text3)`};
            font-family: inherit;
          `),b(a,n.label)}),x(`click`,i,()=>u(V,n.val,!0)),C(t,i)}),e(Z),e(Y);var Q=w(Y,2),$=w(Q,2),ee=e=>{C(e,j())},te=t=>{var n=P(),i=o(n),a=e=>{var t=M();x(`click`,w(c(t),6),()=>E(T+`/journal/new`)),C(e,t)},l=t=>{var n=N(),i=o(n);e(n),s(()=>b(i,`Aucun résultat pour "${r(B)??``}"`)),C(t,n)};f(i,e=>{r(R).length===0?e(a):e(l,-1)}),e(n),C(t,n)},ne=t=>{var n=p();_(c(n),17,()=>r(H),g,(t,n)=>{var i=I(),a=o(i),c=w(o(a),2),l=o(c),u=o(l,!0);e(l);var d=w(l,2),p=o(d);e(d);var m=w(d,2),g=t=>{var i=F(),a=o(i);e(i),s(()=>b(a,`👷 ${r(n).boutefeu_prenom??``} ${r(n).boutefeu_nom??``}`)),C(t,i)};f(m,e=>{r(n).boutefeu_nom&&e(g)}),e(c);var _=w(c,2),v=o(_,!0);e(_),e(a);var y=w(a,2),S=o(y),D=w(S,2),O=w(D,2);e(y),e(i),s(e=>{h(i,`
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        margin-bottom: 10px; overflow: hidden;
        border-left: 3px solid ${r(n).statut===`complete`?`var(--green)`:`var(--yellow)`};
      `),b(u,r(n).numero_tir||`Sans numéro`),b(p,`${(r(n).localisation_chantier||`Chantier —`)??``} · ${e??``}`),h(_,`
            font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; white-space: nowrap;
            ${r(n).statut===`complete`?`background: var(--green-dim); color: var(--green); border: 1px solid rgba(46,204,113,0.3);`:`background: var(--yellow-dim); color: var(--yellow); border: 1px solid rgba(243,156,18,0.3);`}
          `),b(v,r(n).statut===`complete`?`✅ Complété`:`✏️ Brouillon`)},[()=>W(r(n).date_tir)]),x(`click`,a,()=>E(T+`/journal/${r(n).id}`)),x(`click`,S,()=>E(T+`/journal/${r(n).id}`)),x(`click`,D,()=>E(T+`/journal/new?edit=${r(n).id}`)),x(`click`,O,()=>U(r(n))),C(t,i)}),C(t,n)};f($,e=>{r(z)?e(ee):r(H).length===0?e(te,1):e(ne,-1)}),e(G),s(()=>b(J,`${r(R).length??``} journal${r(R).length===1?``:`x`} au total`)),m(X,()=>r(B),e=>u(B,e)),x(`click`,Q,()=>E(T+`/journal/new`)),C(n,G),a()}n([`click`]);export{R as component};
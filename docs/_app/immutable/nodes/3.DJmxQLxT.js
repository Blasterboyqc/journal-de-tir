import{B as e,C as t,H as n,I as r,J as i,L as a,R as o,S as s,T as c,V as l,Z as u,_ as d,b as f,c as p,g as m,h,j as g,m as _,n as v,q as y,s as b,u as x,v as S,y as C,z as w}from"../chunks/BX0KRJEI.js";import{c as T,t as E}from"../chunks/B-BRZORP.js";import"../chunks/CT0T0Gak.js";import"../chunks/Ce1j1UtY.js";import{t as D}from"../chunks/DVNg1t9p.js";import{a as O,n as k}from"../chunks/D8wD4mIp.js";var A=f(`<button> </button>`),j=f(`<div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>`),M=f(`<div style="font-size: 48px; margin-bottom: 12px;">📋</div> <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">Aucun journal</div> <div style="font-size: 13px; color: var(--text3); margin-bottom: 16px;">Créez votre premier journal de tir</div> <button class="btn btn-primary">✏️ Créer maintenant</button>`,1),N=f(`<div style="font-size: 13px; color: var(--text3);"> </div>`),P=f(`<div style="
      text-align: center; padding: 40px 20px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    "><!></div>`),F=f(`<div style="font-size: 10px; color: var(--text3);"> </div>`),I=f(`<div><button style="
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
            ">🗑️</button></div></div>`),L=f(`<div style="padding: 14px 12px 0;"><div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px; margin-bottom: 12px;
  "><div style="font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 2px;">📂 Historique des tirs</div> <div style="font-size: 12px; color: var(--text3);"> </div></div> <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 12px; margin-bottom: 12px;
  "><input type="text" placeholder="🔍 Rechercher par numéro, chantier, date..." style="margin-bottom: 8px;"/> <div style="display: flex; gap: 8px; flex-wrap: wrap;"></div></div> <button class="btn btn-primary btn-full" style="margin-bottom: 12px;">✏️ Nouveau journal de tir</button> <!></div>`);function R(s,f){i(f,!0);let R=l(w([])),z=l(!0),B=l(``),V=l(`tous`);v(async()=>{e(R,await O(),!0),e(z,!1)});let H=n(()=>c(R).filter(e=>{let t=!c(B)||e.numero_tir?.toLowerCase().includes(c(B).toLowerCase())||e.localisation_chantier?.toLowerCase().includes(c(B).toLowerCase())||e.date_tir?.includes(c(B))||e.boutefeu_nom?.toLowerCase().includes(c(B).toLowerCase()),n=c(V)===`tous`||e.statut===c(V);return t&&n}));async function U(t){confirm(`Supprimer "${t.numero_tir}"? Cette action est irréversible.`)&&(await k(t.id),e(R,c(R).filter(e=>e.id!==t.id),!0),D(`🗑️ Journal supprimé`,`info`))}function W(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`fr-CA`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}var G=L(),K=r(G),q=o(r(K),2),J=r(q);u(q),u(K);var Y=o(K,2),X=r(Y);p(X);var Z=o(X,2);_(Z,20,()=>[{val:`tous`,label:`Tous`},{val:`brouillon`,label:`✏️ Brouillons`},{val:`complete`,label:`✅ Complétés`}],h,(n,i)=>{var a=A(),o=r(a,!0);u(a),g(()=>{x(a,`
            padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
            cursor: pointer; border: 1px solid ${c(V)===i.val?`var(--accent)`:`var(--border)`};
            background: ${c(V)===i.val?`var(--accent-glow)`:`var(--card2)`};
            color: ${c(V)===i.val?`var(--accent2)`:`var(--text3)`};
            font-family: inherit;
          `),d(o,i.label)}),t(`click`,a,()=>e(V,i.val,!0)),S(n,a)}),u(Z),u(Y);var Q=o(Y,2),$=o(Q,2),ee=e=>{S(e,j())},te=e=>{var n=P(),i=r(n),s=e=>{var n=M();t(`click`,o(a(n),6),()=>E(T+`/journal/new`)),S(e,n)},l=e=>{var t=N(),n=r(t);u(t),g(()=>d(n,`Aucun résultat pour "${c(B)??``}"`)),S(e,t)};m(i,e=>{c(R).length===0?e(s):e(l,-1)}),u(n),S(e,n)},ne=e=>{var n=C();_(a(n),17,()=>c(H),h,(e,n)=>{var i=I(),a=r(i),s=o(r(a),2),l=r(s),f=r(l,!0);u(l);var p=o(l,2),h=r(p);u(p);var _=o(p,2),v=e=>{var t=F(),i=r(t);u(t),g(()=>d(i,`👷 ${c(n).boutefeu_prenom??``} ${c(n).boutefeu_nom??``}`)),S(e,t)};m(_,e=>{c(n).boutefeu_nom&&e(v)}),u(s);var y=o(s,2),b=r(y,!0);u(y),u(a);var C=o(a,2),w=r(C),D=o(w,2),O=o(D,2);u(C),u(i),g(e=>{x(i,`
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        margin-bottom: 10px; overflow: hidden;
        border-left: 3px solid ${c(n).statut===`complete`?`var(--green)`:`var(--yellow)`};
      `),d(f,c(n).numero_tir||`Sans numéro`),d(h,`${(c(n).localisation_chantier||`Chantier —`)??``} · ${e??``}`),x(y,`
            font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; white-space: nowrap;
            ${c(n).statut===`complete`?`background: var(--green-dim); color: var(--green); border: 1px solid rgba(46,204,113,0.3);`:`background: var(--yellow-dim); color: var(--yellow); border: 1px solid rgba(243,156,18,0.3);`}
          `),d(b,c(n).statut===`complete`?`✅ Complété`:`✏️ Brouillon`)},[()=>W(c(n).date_tir)]),t(`click`,a,()=>E(T+`/journal/${c(n).id}`)),t(`click`,w,()=>E(T+`/journal/${c(n).id}`)),t(`click`,D,()=>E(T+`/journal/new?edit=${c(n).id}`)),t(`click`,O,()=>U(c(n))),S(e,i)}),S(e,n)};m($,e=>{c(z)?e(ee):c(H).length===0?e(te,1):e(ne,-1)}),u(G),g(()=>d(J,`${c(R).length??``} journal${c(R).length===1?``:`x`} au total`)),b(X,()=>c(B),t=>e(B,t)),t(`click`,Q,()=>E(T+`/journal/new`)),S(s,G),y()}s([`click`]);export{R as component};
const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../chunks/-Uo1-QJh.js","../chunks/Di6zslmw.js"])))=>i.map(i=>d[i]);
import{B as e,D as t,G as n,H as r,N as i,R as a,S as o,T as s,U as c,V as l,X as u,Z as d,_ as f,b as p,d as m,f as h,g,n as _,o as v,s as y,tt as b,v as x,w as S,x as C,y as w,z as T}from"../chunks/1FJt_Sav.js";import{c as E,t as D}from"../chunks/C3m8Kwxs.js";import{t as O}from"../chunks/Di6zslmw.js";import"../chunks/CsaauQz1.js";import"../chunks/DmWhSB1-.js";import{t as k}from"../chunks/CT8sUEb6.js";import{i as A,t as ee}from"../chunks/htN8Uh45.js";var te=o(`<button> </button>`),ne=o(`<div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>`),re=o(`<div style="font-size: 48px; margin-bottom: 12px;">📋</div> <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">Aucun journal</div> <div style="font-size: 13px; color: var(--text3); margin-bottom: 16px;">Créez votre premier journal de tir</div> <button class="btn btn-primary">✏️ Créer maintenant</button>`,1),j=o(`<div style="font-size: 13px; color: var(--text3);"> </div>`),M=o(`<div style="
      text-align: center; padding: 40px 20px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    "><!></div>`),N=o(`<div style="font-size: 10px; color: var(--text3);"> </div>`),P=o(`<div><button style="
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
              flex: 1; padding: 7px 10px; background: var(--card2); border: 1px solid var(--border);
              color: var(--text2); border-radius: 6px; font-size: 11px; font-weight: 600;
              cursor: pointer; font-family: inherit;
            "> </button> <button style="
              padding: 7px 10px; background: var(--red-dim); border: 1px solid var(--red);
              color: var(--red); border-radius: 6px; font-size: 11px; font-weight: 600;
              cursor: pointer; font-family: inherit;
            ">🗑️</button></div></div>`),F=o(`<div style="padding: 14px 12px 0;"><div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px; margin-bottom: 12px;
  "><div style="font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 2px;">📂 Historique des tirs</div> <div style="font-size: 12px; color: var(--text3);"> </div></div> <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 12px; margin-bottom: 12px;
  "><input type="text" placeholder="🔍 Rechercher par numéro, chantier, date..." style="margin-bottom: 8px;"/> <div style="display: flex; gap: 8px; flex-wrap: wrap;"></div></div> <button class="btn btn-primary btn-full" style="margin-bottom: 12px;">✏️ Nouveau journal de tir</button> <!></div>`);function I(o,S){d(S,!0);let I=c(l([])),L=c(!0),R=c(``),z=c(`tous`),B=c(null);_(async()=>{r(I,await A(),!0),r(L,!1)});let V=n(()=>t(I).filter(e=>{let n=!t(R)||e.numero_tir?.toLowerCase().includes(t(R).toLowerCase())||e.chantier?.toLowerCase().includes(t(R).toLowerCase())||e.date_tir?.includes(t(R))||e.boutefeu_nom?.toLowerCase().includes(t(R).toLowerCase()),r=t(z)===`tous`||e.statut===t(z);return n&&r}));function H(e){switch(e){case`complete`:return`badge-green`;case`brouillon`:return`badge-yellow`;case`archive`:return`badge-gray`;default:return`badge-gray`}}function U(e){switch(e){case`complete`:return`✅ Complété`;case`brouillon`:return`✏️ Brouillon`;case`archive`:return`📦 Archivé`;default:return e}}async function W(e){confirm(`Supprimer "${e.numero_tir}"? Cette action est irréversible.`)&&(await ee(e.id),r(I,t(I).filter(t=>t.id!==e.id),!0),k(`🗑️ Journal supprimé`,`info`))}async function G(e){r(B,e.id,!0);try{let{exportJournalPDF:t}=await O(async()=>{let{exportJournalPDF:e}=await import(`../chunks/-Uo1-QJh.js`);return{exportJournalPDF:e}},__vite__mapDeps([0,1]),import.meta.url);await t(e),k(`📄 PDF téléchargé!`,`success`)}catch{k(`Erreur export PDF`,`error`)}finally{r(B,null)}}function K(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`fr-CA`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}var q=F(),J=a(q),Y=e(a(J),2),ie=a(Y);b(Y),b(J);var X=e(J,2),Z=a(X);y(Z);var Q=e(Z,2);g(Q,20,()=>[{val:`tous`,label:`Tous`},{val:`brouillon`,label:`✏️ Brouillons`},{val:`complete`,label:`✅ Complétés`},{val:`archive`,label:`📦 Archivés`}],f,(e,n)=>{var o=te(),c=a(o,!0);b(o),i(()=>{m(o,`
            padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
            cursor: pointer; border: 1px solid ${t(z)===n.val?`var(--accent)`:`var(--border)`};
            background: ${t(z)===n.val?`var(--accent-glow)`:`var(--card2)`};
            color: ${t(z)===n.val?`var(--accent2)`:`var(--text3)`};
            font-family: inherit;
          `),w(c,n.label)}),s(`click`,o,()=>r(z,n.val,!0)),p(e,o)}),b(Q),b(X);var $=e(X,2),ae=e($,2),oe=e=>{p(e,ne())},se=n=>{var r=M(),o=a(r),c=t=>{var n=re();s(`click`,e(T(n),6),()=>D(E+`/journal/new`)),p(t,n)},l=e=>{var n=j(),r=a(n);b(n),i(()=>w(r,`Aucun résultat pour "${t(R)??``}"`)),p(e,n)};x(o,e=>{t(I).length===0?e(c):e(l,-1)}),b(r),p(n,r)},ce=n=>{var r=C();g(T(r),17,()=>t(V),f,(n,r)=>{var o=P(),c=a(o),l=e(a(c),2),u=a(l),d=a(u,!0);b(u);var f=e(u,2),g=a(f);b(f);var _=e(f,2),v=e=>{var n=N(),o=a(n);b(n),i(()=>w(o,`👷 ${t(r).boutefeu_prenom??``} ${t(r).boutefeu_nom??``}`)),p(e,n)};x(_,e=>{t(r).boutefeu_nom&&e(v)}),b(l);var y=e(l,2),S=a(y,!0);b(y),b(c);var C=e(c,2),T=a(C),O=e(T,2),k=a(O,!0);b(O);var A=e(O,2);b(C),b(o),i((e,n,i)=>{m(o,`
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        margin-bottom: 10px; overflow: hidden;
        border-left: 3px solid ${t(r).statut===`complete`?`var(--green)`:t(r).statut===`brouillon`?`var(--yellow)`:`var(--border)`};
      `),w(d,t(r).numero_tir||`Sans numéro`),w(g,`${(t(r).chantier||`Chantier —`)??``} · ${e??``}`),h(y,1,`badge ${n??``}`),w(S,i),O.disabled=t(B)===t(r).id,w(k,t(B)===t(r).id?`⏳`:`📄 PDF`)},[()=>K(t(r).date_tir),()=>H(t(r).statut),()=>U(t(r).statut)]),s(`click`,c,()=>D(E+`/journal/${t(r).id}`)),s(`click`,T,()=>D(E+`/journal/${t(r).id}`)),s(`click`,O,()=>G(t(r))),s(`click`,A,()=>W(t(r))),p(n,o)}),p(n,r)};x(ae,e=>{t(L)?e(oe):t(V).length===0?e(se,1):e(ce,-1)}),b(q),i(()=>w(ie,`${t(I).length??``} journal${t(I).length===1?``:`x`} au total`)),v(Z,()=>t(R),e=>r(R,e)),s(`click`,$,()=>D(E+`/journal/new`)),p(o,q),u()}S([`click`]);export{I as component};
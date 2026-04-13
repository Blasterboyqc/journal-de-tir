const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../chunks/-Uo1-QJh.js","../chunks/Di6zslmw.js"])))=>i.map(i=>d[i]);
import{B as e,D as t,G as n,H as r,N as i,R as a,S as o,T as s,U as c,V as l,X as u,Z as d,_ as f,b as p,d as m,et as h,f as g,g as _,n as v,o as y,s as b,v as x,w as S,x as C,y as w,z as T}from"../chunks/gxaokRQK.js";import{c as E,t as D}from"../chunks/BtGHQLZt.js";import{t as O}from"../chunks/Di6zslmw.js";import"../chunks/CsaauQz1.js";import"../chunks/-ACgAgoY.js";import{t as k}from"../chunks/nnJPwGW4.js";import{i as A,t as ee}from"../chunks/DH-uP65Y.js";var te=o(`<button> </button>`),ne=o(`<div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>`),j=o(`<div style="font-size: 48px; margin-bottom: 12px;">📋</div> <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">Aucun journal</div> <div style="font-size: 13px; color: var(--text3); margin-bottom: 16px;">Créez votre premier journal de tir</div> <button class="btn btn-primary">✏️ Créer maintenant</button>`,1),M=o(`<div style="font-size: 13px; color: var(--text3);"> </div>`),N=o(`<div style="
      text-align: center; padding: 40px 20px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    "><!></div>`),P=o(`<div style="font-size: 10px; color: var(--text3);"> </div>`),F=o(`<div><button style="
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
            ">🗑️</button></div></div>`),I=o(`<div style="padding: 14px 12px 0;"><div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px; margin-bottom: 12px;
  "><div style="font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 2px;">📂 Historique des tirs</div> <div style="font-size: 12px; color: var(--text3);"> </div></div> <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 12px; margin-bottom: 12px;
  "><input type="text" placeholder="🔍 Rechercher par numéro, chantier, date..." style="margin-bottom: 8px;"/> <div style="display: flex; gap: 8px; flex-wrap: wrap;"></div></div> <button class="btn btn-primary btn-full" style="margin-bottom: 12px;">✏️ Nouveau journal de tir</button> <!></div>`);function L(o,S){d(S,!0);let L=c(l([])),R=c(!0),z=c(``),B=c(`tous`),V=c(null);v(async()=>{r(L,await A(),!0),r(R,!1)});let H=n(()=>t(L).filter(e=>{let n=!t(z)||e.numero_tir?.toLowerCase().includes(t(z).toLowerCase())||e.chantier?.toLowerCase().includes(t(z).toLowerCase())||e.date_tir?.includes(t(z))||e.boutefeu_nom?.toLowerCase().includes(t(z).toLowerCase()),r=t(B)===`tous`||e.statut===t(B);return n&&r}));function U(e){switch(e){case`complete`:return`badge-green`;case`brouillon`:return`badge-yellow`;case`archive`:return`badge-gray`;default:return`badge-gray`}}function W(e){switch(e){case`complete`:return`✅ Complété`;case`brouillon`:return`✏️ Brouillon`;case`archive`:return`📦 Archivé`;default:return e}}async function G(e){confirm(`Supprimer "${e.numero_tir}"? Cette action est irréversible.`)&&(await ee(e.id),r(L,t(L).filter(t=>t.id!==e.id),!0),k(`🗑️ Journal supprimé`,`info`))}async function K(e){r(V,e.id,!0);try{let{exportJournalPDF:t}=await O(async()=>{let{exportJournalPDF:e}=await import(`../chunks/-Uo1-QJh.js`);return{exportJournalPDF:e}},__vite__mapDeps([0,1]),import.meta.url);await t(e),k(`📄 PDF téléchargé!`,`success`)}catch{k(`Erreur export PDF`,`error`)}finally{r(V,null)}}function re(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`fr-CA`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}var q=I(),J=a(q),Y=e(a(J),2),ie=a(Y);h(Y),h(J);var X=e(J,2),Z=a(X);b(Z);var Q=e(Z,2);_(Q,20,()=>[{val:`tous`,label:`Tous`},{val:`brouillon`,label:`✏️ Brouillons`},{val:`complete`,label:`✅ Complétés`},{val:`archive`,label:`📦 Archivés`}],f,(e,n)=>{var o=te(),c=a(o,!0);h(o),i(()=>{m(o,`
            padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
            cursor: pointer; border: 1px solid ${t(B)===n.val?`var(--accent)`:`var(--border)`};
            background: ${t(B)===n.val?`var(--accent-glow)`:`var(--card2)`};
            color: ${t(B)===n.val?`var(--accent2)`:`var(--text3)`};
            font-family: inherit;
          `),w(c,n.label)}),s(`click`,o,()=>r(B,n.val,!0)),p(e,o)}),h(Q),h(X);var $=e(X,2),ae=e($,2),oe=e=>{p(e,ne())},se=n=>{var r=N(),o=a(r),c=t=>{var n=j();s(`click`,e(T(n),6),()=>D(E+`/journal/new`)),p(t,n)},l=e=>{var n=M(),r=a(n);h(n),i(()=>w(r,`Aucun résultat pour "${t(z)??``}"`)),p(e,n)};x(o,e=>{t(L).length===0?e(c):e(l,-1)}),h(r),p(n,r)},ce=n=>{var r=C();_(T(r),17,()=>t(H),f,(n,r)=>{var o=F(),c=a(o),l=e(a(c),2),u=a(l),d=a(u,!0);h(u);var f=e(u,2),_=a(f);h(f);var v=e(f,2),y=e=>{var n=P(),o=a(n);h(n),i(()=>w(o,`👷 ${t(r).boutefeu_prenom??``} ${t(r).boutefeu_nom??``}`)),p(e,n)};x(v,e=>{t(r).boutefeu_nom&&e(y)}),h(l);var b=e(l,2),S=a(b,!0);h(b),h(c);var C=e(c,2),T=a(C),O=e(T,2),k=a(O,!0);h(O);var A=e(O,2);h(C),h(o),i((e,n,i)=>{m(o,`
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        margin-bottom: 10px; overflow: hidden;
        border-left: 3px solid ${t(r).statut===`complete`?`var(--green)`:t(r).statut===`brouillon`?`var(--yellow)`:`var(--border)`};
      `),w(d,t(r).numero_tir||`Sans numéro`),w(_,`${(t(r).chantier||`Chantier —`)??``} · ${e??``}`),g(b,1,`badge ${n??``}`),w(S,i),O.disabled=t(V)===t(r).id,w(k,t(V)===t(r).id?`⏳`:`📄 PDF`)},[()=>re(t(r).date_tir),()=>U(t(r).statut),()=>W(t(r).statut)]),s(`click`,c,()=>D(E+`/journal/${t(r).id}`)),s(`click`,T,()=>D(E+`/journal/${t(r).id}`)),s(`click`,O,()=>K(t(r))),s(`click`,A,()=>G(t(r))),p(n,o)}),p(n,r)};x(ae,e=>{t(R)?e(oe):t(H).length===0?e(se,1):e(ce,-1)}),h(q),i(()=>w(ie,`${t(L).length??``} journal${t(L).length===1?``:`x`} au total`)),y(Z,()=>t(z),e=>r(z,e)),s(`click`,$,()=>D(E+`/journal/new`)),p(o,q),u()}S([`click`]);export{L as component};
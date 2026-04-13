const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["../chunks/0dB52B9f.js","../chunks/DXb0ZbaM.js"])))=>i.map(i=>d[i]);
import{$ as e,B as t,D as n,H as r,L as i,M as a,R as o,S as s,T as c,V as l,W as u,X as d,Y as f,_ as p,b as m,d as h,f as g,g as _,n as v,o as y,s as b,v as x,w as S,x as C,y as w,z as T}from"../chunks/m8gXUh05.js";import{t as E}from"../chunks/cpT6iuvc.js";import{t as D}from"../chunks/DXb0ZbaM.js";import"../chunks/CT0T0Gak.js";import"../chunks/CErQ82Bz.js";import{t as O}from"../chunks/BaZJIPol.js";import{i as k,t as ee}from"../chunks/BNrOeKJU.js";var te=s(`<button> </button>`),ne=s(`<div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>`),A=s(`<div style="font-size: 48px; margin-bottom: 12px;">📋</div> <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">Aucun journal</div> <div style="font-size: 13px; color: var(--text3); margin-bottom: 16px;">Créez votre premier journal de tir</div> <button class="btn btn-primary">✏️ Créer maintenant</button>`,1),j=s(`<div style="font-size: 13px; color: var(--text3);"> </div>`),M=s(`<div style="
      text-align: center; padding: 40px 20px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    "><!></div>`),N=s(`<div style="font-size: 10px; color: var(--text3);"> </div>`),P=s(`<div><button style="
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
            ">🗑️</button></div></div>`),F=s(`<div style="padding: 14px 12px 0;"><div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px; margin-bottom: 12px;
  "><div style="font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 2px;">📂 Historique des tirs</div> <div style="font-size: 12px; color: var(--text3);"> </div></div> <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 12px; margin-bottom: 12px;
  "><input type="text" placeholder="🔍 Rechercher par numéro, chantier, date..." style="margin-bottom: 8px;"/> <div style="display: flex; gap: 8px; flex-wrap: wrap;"></div></div> <button class="btn btn-primary btn-full" style="margin-bottom: 12px;">✏️ Nouveau journal de tir</button> <!></div>`);function I(s,S){d(S,!0);let I=r(t([])),L=r(!0),R=r(``),z=r(`tous`),B=r(null);v(async()=>{l(I,await k(),!0),l(L,!1)});let V=u(()=>n(I).filter(e=>{let t=!n(R)||e.numero_tir?.toLowerCase().includes(n(R).toLowerCase())||e.chantier?.toLowerCase().includes(n(R).toLowerCase())||e.date_tir?.includes(n(R))||e.boutefeu_nom?.toLowerCase().includes(n(R).toLowerCase()),r=n(z)===`tous`||e.statut===n(z);return t&&r}));function H(e){switch(e){case`complete`:return`badge-green`;case`brouillon`:return`badge-yellow`;case`archive`:return`badge-gray`;default:return`badge-gray`}}function U(e){switch(e){case`complete`:return`✅ Complété`;case`brouillon`:return`✏️ Brouillon`;case`archive`:return`📦 Archivé`;default:return e}}async function W(e){confirm(`Supprimer "${e.numero_tir}"? Cette action est irréversible.`)&&(await ee(e.id),l(I,n(I).filter(t=>t.id!==e.id),!0),O(`🗑️ Journal supprimé`,`info`))}async function G(e){l(B,e.id,!0);try{let{exportJournalPDF:t}=await D(async()=>{let{exportJournalPDF:e}=await import(`../chunks/0dB52B9f.js`);return{exportJournalPDF:e}},__vite__mapDeps([0,1]),import.meta.url);await t(e),O(`📄 PDF téléchargé!`,`success`)}catch{O(`Erreur export PDF`,`error`)}finally{l(B,null)}}function K(e){if(!e)return`—`;try{return new Date(e).toLocaleDateString(`fr-CA`,{day:`2-digit`,month:`short`,year:`numeric`})}catch{return e}}var q=F(),J=i(q),Y=T(i(J),2),re=i(Y);e(Y),e(J);var X=T(J,2),Z=i(X);b(Z);var Q=T(Z,2);_(Q,20,()=>[{val:`tous`,label:`Tous`},{val:`brouillon`,label:`✏️ Brouillons`},{val:`complete`,label:`✅ Complétés`},{val:`archive`,label:`📦 Archivés`}],p,(t,r)=>{var o=te(),s=i(o,!0);e(o),a(()=>{h(o,`
            padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
            cursor: pointer; border: 1px solid ${n(z)===r.val?`var(--accent)`:`var(--border)`};
            background: ${n(z)===r.val?`var(--accent-glow)`:`var(--card2)`};
            color: ${n(z)===r.val?`var(--accent2)`:`var(--text3)`};
            font-family: inherit;
          `),w(s,r.label)}),c(`click`,o,()=>l(z,r.val,!0)),m(t,o)}),e(Q),e(X);var $=T(X,2),ie=T($,2),ae=e=>{m(e,ne())},oe=t=>{var r=M(),s=i(r),l=e=>{var t=A();c(`click`,T(o(t),6),()=>E(`/journal/new`)),m(e,t)},u=t=>{var r=j(),o=i(r);e(r),a(()=>w(o,`Aucun résultat pour "${n(R)??``}"`)),m(t,r)};x(s,e=>{n(I).length===0?e(l):e(u,-1)}),e(r),m(t,r)},se=t=>{var r=C();_(o(r),17,()=>n(V),p,(t,r)=>{var o=P(),s=i(o),l=T(i(s),2),u=i(l),d=i(u,!0);e(u);var f=T(u,2),p=i(f);e(f);var _=T(f,2),v=t=>{var o=N(),s=i(o);e(o),a(()=>w(s,`👷 ${n(r).boutefeu_prenom??``} ${n(r).boutefeu_nom??``}`)),m(t,o)};x(_,e=>{n(r).boutefeu_nom&&e(v)}),e(l);var y=T(l,2),b=i(y,!0);e(y),e(s);var S=T(s,2),C=i(S),D=T(C,2),O=i(D,!0);e(D);var k=T(D,2);e(S),e(o),a((e,t,i)=>{h(o,`
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        margin-bottom: 10px; overflow: hidden;
        border-left: 3px solid ${n(r).statut===`complete`?`var(--green)`:n(r).statut===`brouillon`?`var(--yellow)`:`var(--border)`};
      `),w(d,n(r).numero_tir||`Sans numéro`),w(p,`${(n(r).chantier||`Chantier —`)??``} · ${e??``}`),g(y,1,`badge ${t??``}`),w(b,i),D.disabled=n(B)===n(r).id,w(O,n(B)===n(r).id?`⏳`:`📄 PDF`)},[()=>K(n(r).date_tir),()=>H(n(r).statut),()=>U(n(r).statut)]),c(`click`,s,()=>E(`/journal/${n(r).id}`)),c(`click`,C,()=>E(`/journal/${n(r).id}`)),c(`click`,D,()=>G(n(r))),c(`click`,k,()=>W(n(r))),m(t,o)}),m(t,r)};x(ie,e=>{n(L)?e(ae):n(V).length===0?e(oe,1):e(se,-1)}),e(q),a(()=>w(re,`${n(I).length??``} journal${n(I).length===1?``:`x`} au total`)),y(Z,()=>n(R),e=>l(R,e)),c(`click`,$,()=>E(`/journal/new`)),m(s,q),f()}S([`click`]);export{I as component};
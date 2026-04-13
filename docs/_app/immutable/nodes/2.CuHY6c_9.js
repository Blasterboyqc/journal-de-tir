import{$ as e,B as t,D as n,H as r,L as i,M as a,Q as o,S as s,T as c,V as l,W as u,X as d,Y as f,_ as p,b as m,d as h,et as g,f as _,g as v,n as y,v as b,w as x,y as S,z as C}from"../chunks/m8gXUh05.js";import{t as w}from"../chunks/cpT6iuvc.js";import"../chunks/CT0T0Gak.js";import"../chunks/CErQ82Bz.js";import{a as T,i as E}from"../chunks/BNrOeKJU.js";var D=s(`<div style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;
      "><div> </div> <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-top: 2px;"> </div> <div style="font-size: 11px; color: var(--text3);"> </div></div>`),O=s(`<button style="
          width: 100%; display: flex; align-items: center; gap: 12px;
          background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 12px 14px; cursor: pointer; margin-bottom: 8px; text-align: left;
          transition: all .15s; font-family: inherit;
        "><div style="
            width: 40px; height: 40px; border-radius: 8px; background: var(--card2);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0;
          ">💥</div> <div style="flex: 1; min-width: 0;"><div style="font-size: 13px; font-weight: 700; color: var(--text);"> </div> <div style="font-size: 11px; color: var(--text3);"> </div></div> <span> </span></button>`),k=s(`<button style="
          width: 100%; padding: 10px; background: none; border: 1px dashed var(--border);
          border-radius: var(--radius-sm); color: var(--text3); font-size: 13px; cursor: pointer;
          font-family: inherit;
        "> </button>`),A=s(`<div style="margin-bottom: 14px;"><div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Tirs récents</div> <!> <!></div>`),j=s(`<div style="
      text-align: center; padding: 40px 20px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    "><div style="font-size: 48px; margin-bottom: 12px;">📋</div> <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">Aucun journal de tir</div> <div style="font-size: 13px; color: var(--text3); margin-bottom: 16px;">Commencez par créer votre premier journal de tir</div> <button class="btn btn-primary">✏️ Créer mon premier journal</button></div>`),M=s(`<div style="text-align: center; padding: 20px; color: var(--text3);">Chargement...</div>`),N=s(`<div style="padding: 14px 12px 0;"><div style="
    background: linear-gradient(135deg, var(--accent) 0%, #6c84f8 100%);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 14px;
    position: relative;
    overflow: hidden;
  "><div style="position: relative; z-index: 1;"><div style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;"> </div> <div style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 2px;">Journal de Tir</div> <div style="font-size: 12px; color: rgba(255,255,255,0.8);">Conforme Règlement E-22 · Québec</div></div> <div style="position: absolute; right: -10px; top: -10px; font-size: 80px; opacity: 0.15;">💥</div></div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;"></div> <div style="margin-bottom: 14px;"><div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Actions rapides</div> <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"><button style="
        background: var(--accent); color: #fff; border: none; border-radius: var(--radius);
        padding: 16px; cursor: pointer; text-align: left; transition: all .15s;
        font-family: inherit;
      "><div style="font-size: 24px; margin-bottom: 6px;">✏️</div> <div style="font-size: 13px; font-weight: 700;">Nouveau journal</div> <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">Créer un tir</div></button> <button style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        padding: 16px; cursor: pointer; text-align: left; transition: all .15s;
        font-family: inherit;
      "><div style="font-size: 24px; margin-bottom: 6px;">📂</div> <div style="font-size: 13px; font-weight: 700; color: var(--text);">Historique</div> <div style="font-size: 11px; color: var(--text3); margin-top: 2px;">Voir tous les tirs</div></button> <button style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        padding: 16px; cursor: pointer; text-align: left; transition: all .15s;
        font-family: inherit;
      "><div style="font-size: 24px; margin-bottom: 6px;">👷</div> <div style="font-size: 13px; font-weight: 700; color: var(--text);">Mon profil</div> <div style="font-size: 11px; color: var(--text3); margin-top: 2px;"> </div></button> <button style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        padding: 16px; cursor: pointer; text-align: left; transition: all .15s;
        font-family: inherit;
      "><div style="font-size: 24px; margin-bottom: 6px;">📄</div> <div style="font-size: 13px; font-weight: 700; color: var(--text);">Export PDF</div> <div style="font-size: 11px; color: var(--text3); margin-top: 2px;">Télécharger</div></button></div></div> <!> <div style="
    background: rgba(79,110,247,0.1); border: 1px solid rgba(79,110,247,0.25);
    border-radius: var(--radius); padding: 12px; margin-bottom: 14px;
    font-size: 12px; color: var(--accent2);
  "><strong>📱 Mode hors-ligne</strong> — Toutes vos données sont sauvegardées localement sur votre appareil. L'application fonctionne sans connexion internet.</div></div>`);function P(s,x){d(x,!0);let P=r(t([])),F=r(null),I=r(!0);y(async()=>{await(async e=>{var t=g(e,2);l(P,t[0],!0),l(F,t[1],!0)})(await Promise.all([E(),T()])),l(I,!1)});function L(e){return n(P).filter(t=>t.statut===e).length}function R(e){switch(e){case`complete`:return`badge-green`;case`brouillon`:return`badge-yellow`;case`archive`:return`badge-gray`;default:return`badge-gray`}}function z(e){switch(e){case`complete`:return`✅ Complété`;case`brouillon`:return`✏️ Brouillon`;case`archive`:return`📦 Archivé`;default:return e}}let B=u(()=>n(P).slice(0,5));var V=N(),H=i(V),U=i(H),W=i(U),G=i(W);e(W),o(4),e(U),o(2),e(H);var K=C(H,2);v(K,21,()=>[{val:n(P).length,lbl:`Total tirs`,sub:`Journaux enregistrés`,color:`var(--accent2)`},{val:L(`complete`),lbl:`Complétés`,sub:`Prêts pour signature`,color:`var(--green)`},{val:L(`brouillon`),lbl:`Brouillons`,sub:`En cours`,color:`var(--yellow)`},{val:n(P).filter(e=>e.date_tir===new Date().toISOString().split(`T`)[0]).length,lbl:`Aujourd'hui`,sub:`Tirs ce jour`,color:`var(--orange)`}],p,(t,r)=>{var o=D(),s=i(o),c=i(s,!0);e(s);var l=C(s,2),u=i(l,!0);e(l);var d=C(l,2),f=i(d,!0);e(d),e(o),a(()=>{h(s,`font-size: 28px; font-weight: 800; color: ${n(r).color??``};`),S(c,n(r).val),S(u,n(r).lbl),S(f,n(r).sub)}),m(t,o)}),e(K);var q=C(K,2),J=C(i(q),2),Y=i(J),X=C(Y,2),Z=C(X,2),Q=C(i(Z),4),$=i(Q,!0);e(Q),e(Z);var ee=C(Z,2);e(J),e(q);var te=C(q,2),ne=t=>{var r=A(),o=C(i(r),2);v(o,17,()=>n(B),p,(t,r)=>{var o=O(),s=C(i(o),2),l=i(s),u=i(l,!0);e(l);var d=C(l,2),f=i(d);e(d),e(s);var p=C(s,2),h=i(p,!0);e(p),e(o),a((e,t)=>{S(u,n(r).numero_tir||`Sans nom`),S(f,`${(n(r).chantier||`Chantier non défini`)??``} · ${(n(r).date_tir||`—`)??``}`),_(p,1,`badge ${e??``}`),S(h,t)},[()=>R(n(r).statut),()=>z(n(r).statut)]),c(`click`,o,()=>w(`/journal/${n(r).id}`)),m(t,o)});var s=C(o,2),l=t=>{var r=k(),o=i(r);e(r),a(()=>S(o,`Voir tous les ${n(P).length??``} journaux →`)),c(`click`,r,()=>w(`/historique`)),m(t,r)};b(s,e=>{n(P).length>5&&e(l)}),e(r),m(t,r)},re=t=>{var n=j(),r=C(i(n),6);e(n),c(`click`,r,()=>w(`/journal/new`)),m(t,n)},ie=e=>{m(e,M())};b(te,e=>{!n(I)&&n(P).length>0?e(ne):n(I)?e(ie,-1):e(re,1)}),o(2),e(V),a(()=>{S(G,`Bienvenue${n(F)?`, ${n(F).prenom}`:``}`),S($,n(F)?`${n(F).prenom} ${n(F).nom}`:`Configurer`)}),c(`click`,Y,()=>w(`/journal/new`)),c(`click`,X,()=>w(`/historique`)),c(`click`,Z,()=>w(`/profil`)),c(`click`,ee,()=>w(`/historique?export=true`)),m(s,V),f()}x([`click`]);export{P as component};
import{n as e}from"../chunks/Bq1CAHEh.js";import{C as t,E as n,G as r,H as i,I as a,J as o,L as s,M as c,Q as l,V as u,W as d,Y as f,_ as p,d as m,f as h,g,h as _,j as v,m as y,r as b,v as x,w as S,x as C,y as w,z as T}from"../chunks/Dpq0MdiO.js";import{c as E,t as D}from"../chunks/RYzkHl6M.js";import"../chunks/CT0T0Gak.js";import{t as O}from"../chunks/CdzBCOiB.js";import"../chunks/BVIc5WOX.js";import{n as k}from"../chunks/D7Nd8s-2.js";var A=e({prerender:()=>!1,ssr:()=>!1}),j=C(`<button><span style="font-size: 20px;"> </span> <span style="font-size: 9px; white-space: nowrap;"> </span></button>`),M=C(`<div> </div>`),N=C(`<div id="app" style="display:flex;flex-direction:column;height:100dvh;height:100vh;background:var(--bg);"><header style="
    height: 56px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
    flex-shrink: 0;
    z-index: 100;
  "><div style="
      width: 30px; height: 30px; background: var(--accent); border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 14px; color: #fff; flex-shrink: 0;
    ">💥</div> <div style="flex: 1;"><div style="font-size: 15px; font-weight: 700; color: var(--text);">Journal de Tir</div> <div style="font-size: 10px; color: var(--text3);">Boutefeux du Québec — E-22</div></div> <button style="
      background: none; border: 1px solid var(--border); border-radius: 8px;
      padding: 6px 8px; color: var(--text2); cursor: pointer; font-size: 16px;
    " title="Changer le thème"> </button></header> <main style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-bottom: calc(var(--nav-h) + var(--safe-bottom) + 8px);"><!></main> <nav style="
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: calc(var(--nav-h) + var(--safe-bottom));
    background: var(--surface);
    border-top: 1px solid var(--border);
    display: flex;
    align-items: stretch;
    padding-bottom: var(--safe-bottom);
    z-index: 100;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
  "></nav> <!></div>`);function P(e,t){f(t,!0);let C=()=>r(O,`$page`,P),A=()=>r(k,`$toastMessage`,P),[P,F]=d(),I=i(!0);b(()=>{u(I,localStorage.getItem(`theme`)!==`light`),L(n(I))});function L(e){document.documentElement.setAttribute(`data-theme`,e?`dark`:`light`),localStorage.setItem(`theme`,e?`dark`:`light`)}function R(){u(I,!n(I)),L(n(I))}let z=[{path:`/`,icon:`🏠`,label:`Tableau de bord`},{path:`/journal/new`,icon:`✏️`,label:`Nouveau tir`},{path:`/historique`,icon:`📂`,label:`Historique`},{path:`/profil`,icon:`👷`,label:`Profil`}];function B(e){let t=C().route.id??``;return e===`/`?t===`/`:t.startsWith(e)}var V=N();h(`12qhfyh`,e=>{v(()=>{a.title=`Journal de Tir`})});var H=s(V),U=T(s(H),4),W=s(U,!0);l(U),l(H);var G=T(H,2);y(s(G),()=>t.children),l(G);var K=T(G,2);_(K,21,()=>z,g,(e,t)=>{var r=j(),i=s(r),a=s(i,!0);l(i);var o=T(i,2),u=s(o,!0);l(o),l(r),c((e,i)=>{m(r,`
          flex: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none; background: none;
          color: ${e??``};
          font-size: 10px; font-weight: 600; padding: 8px 4px;
          text-transform: uppercase; letter-spacing: 0.3px;
          border-top: 2px solid ${i??``};
          transition: all .15s;
          font-family: inherit;
        `),x(a,n(t).icon),x(u,n(t).label)},[()=>B(n(t).path)?`var(--accent2)`:`var(--text3)`,()=>B(n(t).path)?`var(--accent)`:`transparent`]),S(`click`,r,()=>D(E+n(t).path)),w(e,r)}),l(K);var q=T(K,2),J=e=>{var t=M(),n=s(t,!0);l(t),c(()=>{m(t,`
      position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
      background: ${A().type===`success`?`var(--green)`:A().type===`error`?`var(--red)`:`var(--accent)`};
      color: #fff; padding: 10px 20px; border-radius: 20px;
      font-size: 13px; font-weight: 600; z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      animation: fadeInDown 0.2s ease;
    `),x(n,A().text)}),w(e,t)};p(q,e=>{A()&&e(J)}),l(V),c(()=>x(W,n(I)?`☀️`:`🌙`)),S(`click`,U,R),w(e,V),o(),F()}t([`click`]);export{P as component,A as universal};
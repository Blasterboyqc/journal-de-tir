import{n as e}from"../chunks/C9nxAZ-q.js";import{$ as t,D as n,G as r,H as i,I as a,K as o,L as s,M as c,S as l,T as u,V as d,X as f,Y as p,_ as m,b as h,d as g,g as _,h as v,j as y,n as b,p as x,v as S,w as C,y as w,z as T}from"../chunks/m8gXUh05.js";import{t as E}from"../chunks/snfMgVB7.js";import"../chunks/CT0T0Gak.js";import{t as D}from"../chunks/C-kg7kB5.js";import"../chunks/rjesjrG0.js";import{n as O}from"../chunks/BaZJIPol.js";var k=e({prerender:()=>!1,ssr:()=>!1}),A=l(`<button><span style="font-size: 20px;"> </span> <span style="font-size: 9px; white-space: nowrap;"> </span></button>`),j=l(`<div> </div>`),M=l(`<div id="app" style="display:flex;flex-direction:column;height:100dvh;height:100vh;background:var(--bg);"><header style="
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
  "></nav> <!></div>`);function N(e,l){f(l,!0);let C=()=>o(D,`$page`,N),k=()=>o(O,`$toastMessage`,N),[N,P]=r(),F=i(!0);b(()=>{d(F,localStorage.getItem(`theme`)!==`light`),I(n(F))});function I(e){document.documentElement.setAttribute(`data-theme`,e?`dark`:`light`),localStorage.setItem(`theme`,e?`dark`:`light`)}function L(){d(F,!n(F)),I(n(F))}let R=[{path:`/`,icon:`🏠`,label:`Tableau de bord`},{path:`/journal/new`,icon:`✏️`,label:`Nouveau tir`},{path:`/historique`,icon:`📂`,label:`Historique`},{path:`/profil`,icon:`👷`,label:`Profil`}];function z(e){let t=C().url.pathname;return e===`/`?t===`/`:t.startsWith(e)}var B=M();x(`12qhfyh`,e=>{y(()=>{a.title=`Journal de Tir`})});var V=s(B),H=T(s(V),4),U=s(H,!0);t(H),t(V);var W=T(V,2);v(s(W),()=>l.children),t(W);var G=T(W,2);_(G,21,()=>R,m,(e,r)=>{var i=A(),a=s(i),o=s(a,!0);t(a);var l=T(a,2),d=s(l,!0);t(l),t(i),c((e,t)=>{g(i,`
          flex: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none; background: none;
          color: ${e??``};
          font-size: 10px; font-weight: 600; padding: 8px 4px;
          text-transform: uppercase; letter-spacing: 0.3px;
          border-top: 2px solid ${t??``};
          transition: all .15s;
          font-family: inherit;
        `),w(o,n(r).icon),w(d,n(r).label)},[()=>z(n(r).path)?`var(--accent2)`:`var(--text3)`,()=>z(n(r).path)?`var(--accent)`:`transparent`]),u(`click`,i,()=>E(n(r).path)),h(e,i)}),t(G);var K=T(G,2),q=e=>{var n=j(),r=s(n,!0);t(n),c(()=>{g(n,`
      position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
      background: ${k().type===`success`?`var(--green)`:k().type===`error`?`var(--red)`:`var(--accent)`};
      color: #fff; padding: 10px 20px; border-radius: 20px;
      font-size: 13px; font-weight: 600; z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      animation: fadeInDown 0.2s ease;
    `),w(r,k().text)}),h(e,n)};S(K,e=>{k()&&e(q)}),t(B),c(()=>w(U,n(F)?`☀️`:`🌙`)),u(`click`,H,L),h(e,B),p(),P()}C([`click`]);export{N as component,k as universal};
import{n as e}from"../chunks/Bq1CAHEh.js";import{$ as t,C as n,E as r,G as i,H as a,I as o,J as s,L as c,M as l,V as u,W as d,Y as f,_ as p,d as m,f as h,g,h as _,j as v,m as y,r as b,v as x,w as S,x as C,y as w,z as T}from"../chunks/J7tXCfCn.js";import{c as E,t as D}from"../chunks/C3yPtGKd.js";import"../chunks/CT0T0Gak.js";import{t as O}from"../chunks/BkV3aJd9.js";import"../chunks/Bz0M9qyE.js";import{n as k}from"../chunks/CjOZp5Y3.js";var A=e({prerender:()=>!1,ssr:()=>!1}),j=C(`<button><span style="font-size: 20px;"> </span> <span style="font-size: 9px; white-space: nowrap;"> </span></button>`),M=C(`<div> </div>`),N=C(`<div id="app" style="display:flex;flex-direction:column;height:100dvh;height:100vh;background:var(--bg);"><header style="
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
  "></nav> <!></div>`);function P(e,n){f(n,!0);let C=()=>i(O,`$page`,P),A=()=>i(k,`$toastMessage`,P),[P,F]=d(),I=a(!0);b(()=>{u(I,localStorage.getItem(`theme`)!==`light`),L(r(I))});function L(e){document.documentElement.setAttribute(`data-theme`,e?`dark`:`light`),localStorage.setItem(`theme`,e?`dark`:`light`)}function R(){u(I,!r(I)),L(r(I))}let z=[{path:`/`,icon:`🏠`,label:`Tableau de bord`},{path:`/journal/new`,icon:`✏️`,label:`Nouveau tir`},{path:`/historique`,icon:`📂`,label:`Historique`},{path:`/profil`,icon:`👷`,label:`Profil`}];function B(e){let t=C().route.id??``;return e===`/`?t===`/`:t.startsWith(e)}var V=N();h(`12qhfyh`,e=>{v(()=>{o.title=`Journal de Tir`})});var H=c(V),U=T(c(H),4),W=c(U,!0);t(U),t(H);var G=T(H,2);y(c(G),()=>n.children),t(G);var K=T(G,2);_(K,21,()=>z,g,(e,n)=>{var i=j(),a=c(i),o=c(a,!0);t(a);var s=T(a,2),u=c(s,!0);t(s),t(i),l((e,t)=>{m(i,`
          flex: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none; background: none;
          color: ${e??``};
          font-size: 10px; font-weight: 600; padding: 8px 4px;
          text-transform: uppercase; letter-spacing: 0.3px;
          border-top: 2px solid ${t??``};
          transition: all .15s;
          font-family: inherit;
        `),x(o,r(n).icon),x(u,r(n).label)},[()=>B(r(n).path)?`var(--accent2)`:`var(--text3)`,()=>B(r(n).path)?`var(--accent)`:`transparent`]),S(`click`,i,()=>D(E+r(n).path)),w(e,i)}),t(K);var q=T(K,2),J=e=>{var n=M(),r=c(n,!0);t(n),l(()=>{m(n,`
      position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
      background: ${A().type===`success`?`var(--green)`:A().type===`error`?`var(--red)`:`var(--accent)`};
      color: #fff; padding: 10px 20px; border-radius: 20px;
      font-size: 13px; font-weight: 600; z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      animation: fadeInDown 0.2s ease;
    `),x(r,A().text)}),w(e,n)};p(q,e=>{A()&&e(J)}),t(V),l(()=>x(W,r(I)?`☀️`:`🌙`)),S(`click`,U,R),w(e,V),s(),F()}n([`click`]);export{P as component,A as universal};
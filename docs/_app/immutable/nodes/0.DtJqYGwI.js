import{A as e,B as t,C as n,F as r,I as i,J as a,R as o,S as s,T as c,U as l,V as u,W as d,Z as f,_ as p,b as m,d as h,et as g,g as _,h as v,j as y,m as b,n as x,p as S,q as C,u as w,v as T}from"../chunks/BX0KRJEI.js";import{c as E,t as D}from"../chunks/B-BRZORP.js";import"../chunks/CT0T0Gak.js";import{t as O}from"../chunks/BMaVfBGP.js";import"../chunks/Ce1j1UtY.js";import{n as k}from"../chunks/DVNg1t9p.js";var A=g({prerender:()=>!1,ssr:()=>!1}),j=m(`<button><span style="font-size: 20px;"> </span> <span style="font-size: 9px; white-space: nowrap;"> </span></button>`),M=m(`<div> </div>`),N=m(`<div id="app" style="display:flex;flex-direction:column;height:100dvh;height:100vh;background:var(--bg);"><header style="
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
  "></nav> <!></div>`);function P(s,m){a(m,!0);let g=()=>d(O,`$page`,P),A=()=>d(k,`$toastMessage`,P),[P,F]=l(),I=u(!0);x(()=>{t(I,localStorage.getItem(`theme`)!==`light`),L(c(I))});function L(e){document.documentElement.setAttribute(`data-theme`,e?`dark`:`light`),localStorage.setItem(`theme`,e?`dark`:`light`)}function R(){t(I,!c(I)),L(c(I))}let z=[{path:`/`,icon:`🏠`,label:`Tableau de bord`},{path:`/journal/new`,icon:`✏️`,label:`Nouveau tir`},{path:`/historique`,icon:`📂`,label:`Historique`},{path:`/profil`,icon:`👷`,label:`Profil`}];function B(e){let t=g().route.id??``;return e===`/`?t===`/`:t.startsWith(e)}var V=N();h(`12qhfyh`,t=>{e(()=>{r.title=`Journal de Tir`})});var H=i(V),U=o(i(H),4),W=i(U,!0);f(U),f(H);var G=o(H,2);S(i(G),()=>m.children),f(G);var K=o(G,2);b(K,21,()=>z,v,(e,t)=>{var r=j(),a=i(r),s=i(a,!0);f(a);var l=o(a,2),u=i(l,!0);f(l),f(r),y((e,n)=>{w(r,`
          flex: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none; background: none;
          color: ${e??``};
          font-size: 10px; font-weight: 600; padding: 8px 4px;
          text-transform: uppercase; letter-spacing: 0.3px;
          border-top: 2px solid ${n??``};
          transition: all .15s;
          font-family: inherit;
        `),p(s,c(t).icon),p(u,c(t).label)},[()=>B(c(t).path)?`var(--accent2)`:`var(--text3)`,()=>B(c(t).path)?`var(--accent)`:`transparent`]),n(`click`,r,()=>D(E+c(t).path)),T(e,r)}),f(K);var q=o(K,2),J=e=>{var t=M(),n=i(t,!0);f(t),y(()=>{w(t,`
      position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
      background: ${A().type===`success`?`var(--green)`:A().type===`error`?`var(--red)`:`var(--accent)`};
      color: #fff; padding: 10px 20px; border-radius: 20px;
      font-size: 13px; font-weight: 600; z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      animation: fadeInDown 0.2s ease;
    `),p(n,A().text)}),T(e,t)};_(q,e=>{A()&&e(J)}),f(V),y(()=>p(W,c(I)?`☀️`:`🌙`)),n(`click`,U,R),T(s,V),C(),F()}s([`click`]);export{P as component,A as universal};
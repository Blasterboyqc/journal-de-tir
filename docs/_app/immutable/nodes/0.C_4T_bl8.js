import{n as e}from"../chunks/Bq1CAHEh.js";import{B as t,D as n,H as r,K as i,L as a,M as o,N as s,R as c,S as l,T as u,U as d,X as f,Z as p,_ as m,b as h,d as g,g as _,h as v,n as y,p as b,q as x,tt as S,v as C,w,y as T}from"../chunks/1FJt_Sav.js";import{c as E,t as D}from"../chunks/BVSDxZJg.js";import"../chunks/CsaauQz1.js";import{t as O}from"../chunks/BUmExv4M.js";import"../chunks/CBhFkWnh.js";import{n as k}from"../chunks/CT8sUEb6.js";var A=e({prerender:()=>!1,ssr:()=>!1}),j=l(`<button><span style="font-size: 20px;"> </span> <span style="font-size: 9px; white-space: nowrap;"> </span></button>`),M=l(`<div> </div>`),N=l(`<div id="app" style="display:flex;flex-direction:column;height:100dvh;height:100vh;background:var(--bg);"><header style="
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
  "></nav> <!></div>`);function P(e,l){p(l,!0);let w=()=>x(O,`$page`,P),A=()=>x(k,`$toastMessage`,P),[P,F]=i(),I=d(!0);y(()=>{r(I,localStorage.getItem(`theme`)!==`light`),L(n(I))});function L(e){document.documentElement.setAttribute(`data-theme`,e?`dark`:`light`),localStorage.setItem(`theme`,e?`dark`:`light`)}function R(){r(I,!n(I)),L(n(I))}let z=[{path:`/`,icon:`🏠`,label:`Tableau de bord`},{path:`/journal/new`,icon:`✏️`,label:`Nouveau tir`},{path:`/historique`,icon:`📂`,label:`Historique`},{path:`/profil`,icon:`👷`,label:`Profil`}];function B(e){let t=w().route.id??``;return e===`/`?t===`/`:t.startsWith(e)}var V=N();b(`12qhfyh`,e=>{o(()=>{a.title=`Journal de Tir`})});var H=c(V),U=t(c(H),4),W=c(U,!0);S(U),S(H);var G=t(H,2);v(c(G),()=>l.children),S(G);var K=t(G,2);_(K,21,()=>z,m,(e,r)=>{var i=j(),a=c(i),o=c(a,!0);S(a);var l=t(a,2),d=c(l,!0);S(l),S(i),s((e,t)=>{g(i,`
          flex: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none; background: none;
          color: ${e??``};
          font-size: 10px; font-weight: 600; padding: 8px 4px;
          text-transform: uppercase; letter-spacing: 0.3px;
          border-top: 2px solid ${t??``};
          transition: all .15s;
          font-family: inherit;
        `),T(o,n(r).icon),T(d,n(r).label)},[()=>B(n(r).path)?`var(--accent2)`:`var(--text3)`,()=>B(n(r).path)?`var(--accent)`:`transparent`]),u(`click`,i,()=>D(E+n(r).path)),h(e,i)}),S(K);var q=t(K,2),J=e=>{var t=M(),n=c(t,!0);S(t),s(()=>{g(t,`
      position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
      background: ${A().type===`success`?`var(--green)`:A().type===`error`?`var(--red)`:`var(--accent)`};
      color: #fff; padding: 10px 20px; border-radius: 20px;
      font-size: 13px; font-weight: 600; z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      animation: fadeInDown 0.2s ease;
    `),T(n,A().text)}),h(e,t)};C(q,e=>{A()&&e(J)}),S(V),s(()=>T(W,n(I)?`☀️`:`🌙`)),u(`click`,U,R),h(e,V),f(),F()}w([`click`]);export{P as component,A as universal};
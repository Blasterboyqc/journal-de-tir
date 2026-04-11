<script lang="ts">
  import './layout.css';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { toastMessage } from '$lib/stores/app';
  // Note: favicon is set via app.html

  let { children } = $props();
  let isDark = $state(true);

  onMount(() => {
    const saved = localStorage.getItem('theme');
    isDark = saved !== 'light';
    applyTheme(isDark);
  });

  function applyTheme(dark: boolean) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  function toggleTheme() {
    isDark = !isDark;
    applyTheme(isDark);
  }

  const navItems = [
    { path: '/', icon: '🏠', label: 'Tableau de bord' },
    { path: '/journal/new', icon: '✏️', label: 'Nouveau tir' },
    { path: '/historique', icon: '📂', label: 'Historique' },
    { path: '/profil', icon: '👷', label: 'Profil' },
  ];

  function isActive(path: string) {
    const currentPath = $page.url.pathname;
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  }
</script>

<svelte:head>
  <title>Journal de Tir</title>
</svelte:head>

<div id="app" style="display:flex;flex-direction:column;height:100dvh;height:100vh;background:var(--bg);">

  <!-- Header -->
  <header style="
    height: 56px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
    flex-shrink: 0;
    z-index: 100;
  ">
    <div style="
      width: 30px; height: 30px; background: var(--accent); border-radius: 7px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-size: 14px; color: #fff; flex-shrink: 0;
    ">💥</div>
    <div style="flex: 1;">
      <div style="font-size: 15px; font-weight: 700; color: var(--text);">Journal de Tir</div>
      <div style="font-size: 10px; color: var(--text3);">Boutefeux du Québec — E-22</div>
    </div>
    <button onclick={toggleTheme} style="
      background: none; border: 1px solid var(--border); border-radius: 8px;
      padding: 6px 8px; color: var(--text2); cursor: pointer; font-size: 16px;
    " title="Changer le thème">
      {isDark ? '☀️' : '🌙'}
    </button>
  </header>

  <!-- Main content -->
  <main style="flex: 1; overflow-y: auto; overflow-x: hidden; padding-bottom: calc(var(--nav-h) + var(--safe-bottom) + 8px);">
    {@render children()}
  </main>

  <!-- Bottom navigation -->
  <nav style="
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
  ">
    {#each navItems as item}
      <button
        onclick={() => goto(item.path)}
        style="
          flex: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 3px; cursor: pointer; border: none; background: none;
          color: {isActive(item.path) ? 'var(--accent2)' : 'var(--text3)'};
          font-size: 10px; font-weight: 600; padding: 8px 4px;
          text-transform: uppercase; letter-spacing: 0.3px;
          border-top: 2px solid {isActive(item.path) ? 'var(--accent)' : 'transparent'};
          transition: all .15s;
          font-family: inherit;
        "
      >
        <span style="font-size: 20px;">{item.icon}</span>
        <span style="font-size: 9px; white-space: nowrap;">{item.label}</span>
      </button>
    {/each}
  </nav>

  <!-- Toast notifications -->
  {#if $toastMessage}
    <div style="
      position: fixed; top: 70px; left: 50%; transform: translateX(-50%);
      background: {$toastMessage.type === 'success' ? 'var(--green)' : $toastMessage.type === 'error' ? 'var(--red)' : 'var(--accent)'};
      color: #fff; padding: 10px 20px; border-radius: 20px;
      font-size: 13px; font-weight: 600; z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
      animation: fadeInDown 0.2s ease;
    ">
      {$toastMessage.text}
    </div>
  {/if}
</div>

<style>
  @keyframes fadeInDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
</style>

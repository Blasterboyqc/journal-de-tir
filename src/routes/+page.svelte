<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { getJournaux, getProfil, type JournalTir, type ProfilBoutefeu } from '$lib/db';

  let journaux = $state<JournalTir[]>([]);
  let profil = $state<ProfilBoutefeu | null>(null);
  let loading = $state(true);

  onMount(async () => {
    [journaux, profil] = await Promise.all([getJournaux(), getProfil()]);
    loading = false;
  });

  const stats = $derived({
    total: journaux.length,
    brouillons: journaux.filter(j => j.statut === 'brouillon').length,
    completes: journaux.filter(j => j.statut === 'complete').length,
  });

  const recents = $derived(journaux.slice(0, 3));

  function formatDate(dateStr: string) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('fr-CA', { day: '2-digit', month: 'short' });
    } catch {
      return dateStr;
    }
  }
</script>

<div style="padding: 14px 12px 0;">

  <!-- Hero card -->
  <div style="
    background: linear-gradient(135deg, rgba(79,110,247,0.15) 0%, rgba(107,114,153,0.1) 100%);
    border: 1px solid var(--accent);
    border-radius: var(--radius); padding: 18px; margin-bottom: 14px;
    position: relative; overflow: hidden;
  ">
    <div style="
      position: absolute; top: -20px; right: -20px;
      font-size: 80px; opacity: 0.08; user-select: none;
      transform: rotate(15deg);
    ">💥</div>
    <div style="font-size: 20px; font-weight: 900; color: var(--text); margin-bottom: 4px;">
      Journal de Tir
    </div>
    <div style="font-size: 11px; color: var(--accent2); font-weight: 600; margin-bottom: 8px;">
      Annexe 2.2 — Code de sécurité pour les travaux de construction
    </div>
    {#if profil?.prenom}
      <div style="font-size: 12px; color: var(--text3);">
        Bonjour, <strong style="color: var(--text);">{profil.prenom} {profil.nom}</strong>
        {#if profil.certificat_cstc}· Cert. {profil.certificat_cstc}{/if}
      </div>
    {:else}
      <div style="font-size: 12px; color: var(--text3);">
        <a
          href="{base}/profil"
          onclick={(e) => { e.preventDefault(); goto(base + '/profil'); }}
          style="color: var(--accent2); text-decoration: underline;"
        >Configurez votre profil</a> pour pré-remplir les journaux.
      </div>
    {/if}
  </div>

  <!-- Stats -->
  {#if !loading}
  <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px;">
    {#each [
      { val: stats.total, label: 'Journaux', color: 'var(--accent2)', bg: 'var(--accent-glow)' },
      { val: stats.brouillons, label: 'Brouillons', color: 'var(--yellow)', bg: 'var(--yellow-dim)' },
      { val: stats.completes, label: 'Complétés', color: 'var(--green)', bg: 'var(--green-dim)' },
    ] as stat}
      <div style="
        background: {stat.bg}; border: 1px solid {stat.color}33;
        border-radius: var(--radius-sm); padding: 12px 10px; text-align: center;
      ">
        <div style="font-size: 24px; font-weight: 900; color: {stat.color};">{stat.val}</div>
        <div style="font-size: 10px; color: var(--text3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px;">{stat.label}</div>
      </div>
    {/each}
  </div>
  {/if}

  <!-- Primary action -->
  <button
    onclick={() => goto(base + '/journal/new')}
    class="btn btn-primary btn-full"
    style="margin-bottom: 14px; font-size: 15px; padding: 14px; font-weight: 800;"
  >
    ✏️ Nouveau journal de tir
  </button>

  <!-- Recent journals -->
  {#if recents.length > 0}
    <div style="
      font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;
    ">
      <span>Tirs récents</span>
      <button
        onclick={() => goto(base + '/historique')}
        style="font-size: 11px; color: var(--accent2); background: none; border: none; cursor: pointer; font-family: inherit;"
      >Voir tout →</button>
    </div>

    {#each recents as j}
      <button
        onclick={() => goto(base + `/journal/${j.id}`)}
        style="
          width: 100%; display: flex; align-items: center; gap: 10px;
          background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 10px 12px; margin-bottom: 8px; cursor: pointer; text-align: left; font-family: inherit;
          border-left: 3px solid {j.statut === 'complete' ? 'var(--green)' : 'var(--yellow)'};
        "
      >
        <div style="font-size: 20px;">💥</div>
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 13px; font-weight: 700; color: var(--text);">{j.numero_tir}</div>
          <div style="font-size: 11px; color: var(--text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            {j.localisation_chantier || 'Chantier —'} · {formatDate(j.date_tir)}
          </div>
        </div>
        <span style="
          font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 20px;
          {j.statut === 'complete'
            ? 'background: var(--green-dim); color: var(--green);'
            : 'background: var(--yellow-dim); color: var(--yellow);'}
        ">{j.statut === 'complete' ? '✅' : '✏️'}</span>
      </button>
    {/each}

  {:else if !loading}
    <div style="
      text-align: center; padding: 32px 20px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    ">
      <div style="font-size: 40px; margin-bottom: 10px;">📋</div>
      <div style="font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 6px;">Aucun journal encore</div>
      <div style="font-size: 12px; color: var(--text3);">Commencez par créer un nouveau journal de tir.</div>
    </div>
  {/if}

  <!-- App info -->
  <div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 10px 12px; margin-top: 14px;
    font-size: 10px; color: var(--text3); line-height: 1.6; text-align: center;
  ">
    📱 Application hors-ligne · Données sur votre appareil uniquement<br>
    Formulaire Annexe 2.2 du Code de sécurité, travaux de construction (Québec)
  </div>

</div>

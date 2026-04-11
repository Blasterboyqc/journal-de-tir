<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getJournaux, getProfil, type JournalTir } from '$lib/db';

  let journaux = $state<JournalTir[]>([]);
  let profil = $state<any>(null);
  let loading = $state(true);

  onMount(async () => {
    [journaux, profil] = await Promise.all([getJournaux(), getProfil()]);
    loading = false;
  });

  function statsByStatut(statut: string) {
    return journaux.filter(j => j.statut === statut).length;
  }

  function getStatutBadge(statut: string) {
    switch (statut) {
      case 'complete': return 'badge-green';
      case 'brouillon': return 'badge-yellow';
      case 'archive': return 'badge-gray';
      default: return 'badge-gray';
    }
  }

  function getStatutLabel(statut: string) {
    switch (statut) {
      case 'complete': return '✅ Complété';
      case 'brouillon': return '✏️ Brouillon';
      case 'archive': return '📦 Archivé';
      default: return statut;
    }
  }

  const recentJournaux = $derived(journaux.slice(0, 5));
</script>

<div style="padding: 14px 12px 0;">

  <!-- Welcome Banner -->
  <div style="
    background: linear-gradient(135deg, var(--accent) 0%, #6c84f8 100%);
    border-radius: var(--radius);
    padding: 16px;
    margin-bottom: 14px;
    position: relative;
    overflow: hidden;
  ">
    <div style="position: relative; z-index: 1;">
      <div style="font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
        Bienvenue{profil ? `, ${profil.prenom}` : ''}
      </div>
      <div style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 2px;">Journal de Tir</div>
      <div style="font-size: 12px; color: rgba(255,255,255,0.8);">
        Conforme Règlement E-22 · Québec
      </div>
    </div>
    <div style="position: absolute; right: -10px; top: -10px; font-size: 80px; opacity: 0.15;">💥</div>
  </div>

  <!-- Stats Grid -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px;">
    {#each [
      { val: journaux.length, lbl: 'Total tirs', sub: 'Journaux enregistrés', color: 'var(--accent2)' },
      { val: statsByStatut('complete'), lbl: 'Complétés', sub: 'Prêts pour signature', color: 'var(--green)' },
      { val: statsByStatut('brouillon'), lbl: 'Brouillons', sub: 'En cours', color: 'var(--yellow)' },
      { val: journaux.filter(j => j.date_tir === new Date().toISOString().split('T')[0]).length, lbl: "Aujourd'hui", sub: 'Tirs ce jour', color: 'var(--orange)' },
    ] as stat}
      <div style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 14px;
      ">
        <div style="font-size: 28px; font-weight: 800; color: {stat.color};">{stat.val}</div>
        <div style="font-size: 13px; font-weight: 600; color: var(--text); margin-top: 2px;">{stat.lbl}</div>
        <div style="font-size: 11px; color: var(--text3);">{stat.sub}</div>
      </div>
    {/each}
  </div>

  <!-- Quick Actions -->
  <div style="margin-bottom: 14px;">
    <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Actions rapides
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      <button onclick={() => goto('/journal/new')} style="
        background: var(--accent); color: #fff; border: none; border-radius: var(--radius);
        padding: 16px; cursor: pointer; text-align: left; transition: all .15s;
        font-family: inherit;
      ">
        <div style="font-size: 24px; margin-bottom: 6px;">✏️</div>
        <div style="font-size: 13px; font-weight: 700;">Nouveau journal</div>
        <div style="font-size: 11px; opacity: 0.8; margin-top: 2px;">Créer un tir</div>
      </button>
      <button onclick={() => goto('/historique')} style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        padding: 16px; cursor: pointer; text-align: left; transition: all .15s;
        font-family: inherit;
      ">
        <div style="font-size: 24px; margin-bottom: 6px;">📂</div>
        <div style="font-size: 13px; font-weight: 700; color: var(--text);">Historique</div>
        <div style="font-size: 11px; color: var(--text3); margin-top: 2px;">Voir tous les tirs</div>
      </button>
      <button onclick={() => goto('/profil')} style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        padding: 16px; cursor: pointer; text-align: left; transition: all .15s;
        font-family: inherit;
      ">
        <div style="font-size: 24px; margin-bottom: 6px;">👷</div>
        <div style="font-size: 13px; font-weight: 700; color: var(--text);">Mon profil</div>
        <div style="font-size: 11px; color: var(--text3); margin-top: 2px;">{profil ? `${profil.prenom} ${profil.nom}` : 'Configurer'}</div>
      </button>
      <button onclick={() => goto('/historique?export=true')} style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        padding: 16px; cursor: pointer; text-align: left; transition: all .15s;
        font-family: inherit;
      ">
        <div style="font-size: 24px; margin-bottom: 6px;">📄</div>
        <div style="font-size: 13px; font-weight: 700; color: var(--text);">Export PDF</div>
        <div style="font-size: 11px; color: var(--text3); margin-top: 2px;">Télécharger</div>
      </button>
    </div>
  </div>

  <!-- Recent Journals -->
  {#if !loading && journaux.length > 0}
    <div style="margin-bottom: 14px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        Tirs récents
      </div>
      {#each recentJournaux as j}
        <button onclick={() => goto(`/journal/${j.id}`)} style="
          width: 100%; display: flex; align-items: center; gap: 12px;
          background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
          padding: 12px 14px; cursor: pointer; margin-bottom: 8px; text-align: left;
          transition: all .15s; font-family: inherit;
        ">
          <div style="
            width: 40px; height: 40px; border-radius: 8px; background: var(--card2);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0;
          ">💥</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text);">{j.numero_tir || 'Sans nom'}</div>
            <div style="font-size: 11px; color: var(--text3);">{j.chantier || 'Chantier non défini'} · {j.date_tir || '—'}</div>
          </div>
          <span class="badge {getStatutBadge(j.statut)}">{getStatutLabel(j.statut)}</span>
        </button>
      {/each}
      {#if journaux.length > 5}
        <button onclick={() => goto('/historique')} style="
          width: 100%; padding: 10px; background: none; border: 1px dashed var(--border);
          border-radius: var(--radius-sm); color: var(--text3); font-size: 13px; cursor: pointer;
          font-family: inherit;
        ">
          Voir tous les {journaux.length} journaux →
        </button>
      {/if}
    </div>
  {:else if !loading}
    <!-- Empty state -->
    <div style="
      text-align: center; padding: 40px 20px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    ">
      <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
      <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">
        Aucun journal de tir
      </div>
      <div style="font-size: 13px; color: var(--text3); margin-bottom: 16px;">
        Commencez par créer votre premier journal de tir
      </div>
      <button onclick={() => goto('/journal/new')} class="btn btn-primary">
        ✏️ Créer mon premier journal
      </button>
    </div>
  {:else}
    <div style="text-align: center; padding: 20px; color: var(--text3);">Chargement...</div>
  {/if}

  <!-- Info banner -->
  <div style="
    background: rgba(79,110,247,0.1); border: 1px solid rgba(79,110,247,0.25);
    border-radius: var(--radius); padding: 12px; margin-bottom: 14px;
    font-size: 12px; color: var(--accent2);
  ">
    <strong>📱 Mode hors-ligne</strong> — Toutes vos données sont sauvegardées localement sur votre appareil. L'application fonctionne sans connexion internet.
  </div>

</div>

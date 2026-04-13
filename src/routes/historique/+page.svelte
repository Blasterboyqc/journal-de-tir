<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { getJournaux, deleteJournal, type JournalTir } from '$lib/db';
  import { showToast } from '$lib/stores/app';

  let journaux = $state<JournalTir[]>([]);
  let loading = $state(true);
  let search = $state('');
  let filterStatut = $state('tous');
  let exporting = $state<number | null>(null);

  onMount(async () => {
    journaux = await getJournaux();
    loading = false;
  });

  const filtered = $derived(journaux.filter(j => {
    const matchSearch = !search ||
      j.numero_tir?.toLowerCase().includes(search.toLowerCase()) ||
      j.chantier?.toLowerCase().includes(search.toLowerCase()) ||
      j.date_tir?.includes(search) ||
      j.boutefeu_nom?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut === 'tous' || j.statut === filterStatut;
    return matchSearch && matchStatut;
  }));

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

  async function confirmDelete(j: JournalTir) {
    if (!confirm(`Supprimer "${j.numero_tir}"? Cette action est irréversible.`)) return;
    await deleteJournal(j.id!);
    journaux = journaux.filter(x => x.id !== j.id);
    showToast('🗑️ Journal supprimé', 'info');
  }

  async function exportPDF(j: JournalTir) {
    exporting = j.id!;
    try {
      const { exportJournalPDF } = await import('$lib/pdf');
      await exportJournalPDF(j);
      showToast('📄 PDF téléchargé!', 'success');
    } catch (err) {
      showToast('Erreur export PDF', 'error');
    } finally {
      exporting = null;
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
</script>

<div style="padding: 14px 12px 0;">

  <!-- Header -->
  <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px; margin-bottom: 12px;
  ">
    <div style="font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 2px;">📂 Historique des tirs</div>
    <div style="font-size: 12px; color: var(--text3);">{journaux.length} journal{journaux.length !== 1 ? 'x' : ''} au total</div>
  </div>

  <!-- Search & Filter -->
  <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 12px; margin-bottom: 12px;
  ">
    <input
      type="text"
      bind:value={search}
      placeholder="🔍 Rechercher par numéro, chantier, date..."
      style="margin-bottom: 8px;"
    >
    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
      {#each [
        { val: 'tous', label: 'Tous' },
        { val: 'brouillon', label: '✏️ Brouillons' },
        { val: 'complete', label: '✅ Complétés' },
        { val: 'archive', label: '📦 Archivés' },
      ] as f}
        <button
          onclick={() => filterStatut = f.val}
          style="
            padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
            cursor: pointer; border: 1px solid {filterStatut === f.val ? 'var(--accent)' : 'var(--border)'};
            background: {filterStatut === f.val ? 'var(--accent-glow)' : 'var(--card2)'};
            color: {filterStatut === f.val ? 'var(--accent2)' : 'var(--text3)'};
            font-family: inherit;
          "
        >{f.label}</button>
      {/each}
    </div>
  </div>

  <!-- New journal button -->
  <button onclick={() => goto(base + '/journal/new')} class="btn btn-primary btn-full" style="margin-bottom: 12px;">
    ✏️ Nouveau journal de tir
  </button>

  <!-- Journal list -->
  {#if loading}
    <div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>
  {:else if filtered.length === 0}
    <div style="
      text-align: center; padding: 40px 20px;
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    ">
      {#if journaux.length === 0}
        <div style="font-size: 48px; margin-bottom: 12px;">📋</div>
        <div style="font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px;">Aucun journal</div>
        <div style="font-size: 13px; color: var(--text3); margin-bottom: 16px;">Créez votre premier journal de tir</div>
        <button onclick={() => goto(base + '/journal/new')} class="btn btn-primary">✏️ Créer maintenant</button>
      {:else}
        <div style="font-size: 13px; color: var(--text3);">Aucun résultat pour "{search}"</div>
      {/if}
    </div>
  {:else}
    {#each filtered as j}
      <div style="
        background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
        margin-bottom: 10px; overflow: hidden;
        border-left: 3px solid {j.statut === 'complete' ? 'var(--green)' : j.statut === 'brouillon' ? 'var(--yellow)' : 'var(--border)'};
      ">
        <!-- Card header (clickable) -->
        <button
          onclick={() => goto(base + `/journal/${j.id}`)}
          style="
            width: 100%; display: flex; align-items: center; gap: 12px; padding: 12px 14px;
            cursor: pointer; background: none; border: none; text-align: left; font-family: inherit;
          "
        >
          <div style="
            width: 42px; height: 42px; border-radius: 8px; background: var(--card2);
            display: flex; align-items: center; justify-content: center;
            font-size: 18px; flex-shrink: 0; border: 1px solid var(--border);
          ">💥</div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 13px; font-weight: 700; color: var(--text);">{j.numero_tir || 'Sans numéro'}</div>
            <div style="font-size: 11px; color: var(--text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {j.chantier || 'Chantier —'} · {formatDate(j.date_tir)}
            </div>
            {#if j.boutefeu_nom}
              <div style="font-size: 10px; color: var(--text3);">👷 {j.boutefeu_prenom} {j.boutefeu_nom}</div>
            {/if}
          </div>
          <span class="badge {getStatutBadge(j.statut)}">{getStatutLabel(j.statut)}</span>
        </button>

        <!-- Card actions -->
        <div style="
          display: flex; gap: 6px; padding: 8px 14px;
          border-top: 1px solid var(--border); background: rgba(0,0,0,0.1);
        ">
          <button
            onclick={() => goto(base + `/journal/${j.id}`)}
            style="
              flex: 1; padding: 7px 10px; background: var(--card2); border: 1px solid var(--border);
              color: var(--text2); border-radius: 6px; font-size: 11px; font-weight: 600;
              cursor: pointer; font-family: inherit;
            "
          >👁️ Voir</button>
          <button
            onclick={() => exportPDF(j)}
            disabled={exporting === j.id}
            style="
              flex: 1; padding: 7px 10px; background: var(--card2); border: 1px solid var(--border);
              color: var(--text2); border-radius: 6px; font-size: 11px; font-weight: 600;
              cursor: pointer; font-family: inherit;
            "
          >{exporting === j.id ? '⏳' : '📄 PDF'}</button>
          <button
            onclick={() => confirmDelete(j)}
            style="
              padding: 7px 10px; background: var(--red-dim); border: 1px solid var(--red);
              color: var(--red); border-radius: 6px; font-size: 11px; font-weight: 600;
              cursor: pointer; font-family: inherit;
            "
          >🗑️</button>
        </div>
      </div>
    {/each}
  {/if}

</div>

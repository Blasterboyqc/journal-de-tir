<script lang="ts">
  import { onMount } from 'svelte';
  import { getProfil, saveProfil, type ProfilBoutefeu } from '$lib/db';
  import { showToast } from '$lib/stores/app';

  let saving = $state(false);
  let loading = $state(true);
  let saved = $state(false);

  let form = $state<Omit<ProfilBoutefeu, 'id'>>({
    prenom: '',
    nom: '',
    certificat_cstc: '',
    cstc_expiry: '',
    permis_sq: '',
    employeur: '',
    chantier_actuel: '',
    telephone: '',
    gemini_api_key: '',
    updatedAt: '',
  });

  onMount(async () => {
    try {
      const profil = await getProfil();
      if (profil) {
        const { id: _, ...rest } = profil;
        form = rest;
      }
    } catch (err) {
      console.error('DB error:', err);
      // If it's a version error, offer to reset
      if (String(err).includes('version') || String(err).includes('upgrade')) {
        if (confirm('La base de données doit être réinitialisée pour cette mise à jour. Vos données seront perdues. Continuer?')) {
          await import('dexie').then(({ default: Dexie }) => Dexie.delete('JournalDeTirDB'));
          location.reload();
        }
      }
    } finally {
      loading = false;
    }
  });

  async function save() {
    if (saving) return;
    saving = true;
    try {
      await saveProfil({
        ...form,
        updatedAt: new Date().toISOString(),
      });
      saved = true;
      showToast('✅ Profil sauvegardé', 'success');
      setTimeout(() => saved = false, 3000);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      saving = false;
    }
  }
</script>

{#if loading}
  <div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>
{:else}
<div style="padding: 14px 12px 0;">

  <!-- Header -->
  <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px; margin-bottom: 16px;
  ">
    <div style="font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 2px;">👷 Mon Profil</div>
    <div style="font-size: 12px; color: var(--text3);">
      Ces informations pré-remplissent chaque nouveau journal de tir automatiquement.
    </div>
  </div>

  <!-- Identité du boutefeu -->
  <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
    Identité du boutefeu
  </div>

  <div class="form-row" style="margin-bottom: 10px;">
    <div class="form-group">
      <label for="prenom">Prénom</label>
      <input id="prenom" type="text" bind:value={form.prenom} placeholder="Prénom">
    </div>
    <div class="form-group">
      <label for="nom">Nom</label>
      <input id="nom" type="text" bind:value={form.nom} placeholder="Nom de famille">
    </div>
  </div>

  <div class="form-row" style="margin-bottom: 10px;">
    <div class="form-group">
      <label for="telephone">Téléphone</label>
      <input id="telephone" type="tel" bind:value={form.telephone} placeholder="ex: 514-555-1234">
    </div>
    <div class="form-group">
      <label for="employeur">Employeur</label>
      <input id="employeur" type="text" bind:value={form.employeur} placeholder="Nom de l'entreprise">
    </div>
  </div>

  <div class="divider"></div>

  <!-- Certifications -->
  <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
    Certifications et permis
  </div>

  <div class="form-row" style="margin-bottom: 10px;">
    <div class="form-group">
      <label for="certificat_cstc">Certificat CSTC</label>
      <input id="certificat_cstc" type="text" bind:value={form.certificat_cstc} placeholder="ex: BF-12345">
    </div>
    <div class="form-group">
      <label for="cstc_expiry">Expiration CSTC</label>
      <input id="cstc_expiry" type="date" bind:value={form.cstc_expiry}>
    </div>
  </div>

  <div class="form-row cols1" style="margin-bottom: 16px;">
    <div class="form-group">
      <label for="permis_sq">Permis Sûreté du Québec</label>
      <input id="permis_sq" type="text" bind:value={form.permis_sq} placeholder="ex: SQ-2024-XXXXX">
    </div>
  </div>

  <div class="divider"></div>

  <!-- Chantier actuel -->
  <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
    Chantier actuel
  </div>

  <div class="form-row cols1" style="margin-bottom: 16px;">
    <div class="form-group">
      <label for="chantier_actuel">Localisation du chantier actuel</label>
      <input
        id="chantier_actuel"
        type="text"
        bind:value={form.chantier_actuel}
        placeholder="ex: Autoroute 40, km 23 — Montréal"
      >
    </div>
  </div>

  <div class="divider"></div>

  <!-- Clé API Gemini -->
  <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
    IA — Clé API Gemini (optionnel)
  </div>

  <div class="form-row cols1" style="margin-bottom: 10px;">
    <div class="form-group">
      <label for="gemini_key">Clé API Google Gemini</label>
      <input
        id="gemini_key"
        type="password"
        bind:value={form.gemini_api_key}
        placeholder="AIzaSy..."
        autocomplete="off"
      >
    </div>
  </div>
  <div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 8px 10px; margin-bottom: 16px;
    font-size: 11px; color: var(--text3); line-height: 1.5;
  ">
    🤖 Utilisée pour l'importation photo IA dans l'éditeur de patron de forage. Obtenez votre clé sur <strong style="color: var(--accent2);">aistudio.google.com</strong>. Stockée localement uniquement.
  </div>

  <!-- Info note -->
  <div style="
    background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: 10px 12px; margin-bottom: 16px;
    font-size: 11px; color: var(--text3); line-height: 1.5;
  ">
    💡 <strong style="color: var(--text2);">Utilisation:</strong> Ces données sont stockées localement sur votre téléphone (IndexedDB). Aucune donnée n'est envoyée sur Internet. Les informations sont pré-remplies dans chaque nouveau journal.
  </div>

  <!-- Save button -->
  <button
    onclick={save}
    disabled={saving}
    class="btn btn-primary btn-full"
    style="margin-bottom: 16px; {saved ? 'background: var(--green); border-color: var(--green);' : ''}"
  >
    {saving ? '⏳ Sauvegarde...' : saved ? '✅ Profil sauvegardé!' : '💾 Sauvegarder le profil'}
  </button>

  <!-- CSTC expiry warning -->
  {#if form.cstc_expiry}
    {@const expiryDate = new Date(form.cstc_expiry)}
    {@const now = new Date()}
    {@const daysLeft = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}
    {#if daysLeft < 30}
      <div style="
        background: var(--red-dim); border: 1px solid var(--red);
        border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 16px;
        font-size: 12px; color: var(--red); font-weight: 600;
      ">
        ⚠️ Votre certificat CSTC expire {daysLeft <= 0 ? 'depuis' : 'dans'} {Math.abs(daysLeft)} jour{Math.abs(daysLeft) !== 1 ? 's' : ''}!
      </div>
    {:else if daysLeft < 60}
      <div style="
        background: var(--yellow-dim); border: 1px solid var(--yellow);
        border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 16px;
        font-size: 12px; color: var(--yellow); font-weight: 600;
      ">
        ⚠️ Votre certificat CSTC expire dans {daysLeft} jours.
      </div>
    {/if}
  {/if}

</div>
{/if}

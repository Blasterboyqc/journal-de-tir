<script lang="ts">
  import { onMount } from 'svelte';
  import { getProfil, saveProfil } from '$lib/db';
  import { showToast } from '$lib/stores/app';

  let saving = $state(false);
  let loading = $state(true);
  let hasProfil = $state(false);

  let form = $state({
    prenom: '',
    nom: '',
    certificat_cstc: '',
    cstc_expiry: '',
    permis_sq: '',
    employeur: '',
    chantier_actuel: '',
    telephone: '',
    email: '',
    updatedAt: '',
  });

  onMount(async () => {
    const profil = await getProfil();
    if (profil) {
      form.prenom = profil.prenom || '';
      form.nom = profil.nom || '';
      form.certificat_cstc = profil.certificat_cstc || '';
      form.cstc_expiry = profil.cstc_expiry || '';
      form.permis_sq = profil.permis_sq || '';
      form.employeur = profil.employeur || '';
      form.chantier_actuel = profil.chantier_actuel || '';
      form.telephone = profil.telephone || '';
      form.email = profil.email || '';
      hasProfil = true;
    }
    loading = false;
  });

  async function save() {
    if (saving) return;
    saving = true;
    try {
      await saveProfil({
        ...form,
        updatedAt: new Date().toISOString(),
      });
      hasProfil = true;
      showToast('✅ Profil sauvegardé!', 'success');
    } catch (err) {
      showToast('Erreur lors de la sauvegarde', 'error');
    } finally {
      saving = false;
    }
  }

  // CSTC expiry check — Svelte 5 $derived takes an expression, not a function factory
  const cstcExpired = $derived(
    form.cstc_expiry ? new Date(form.cstc_expiry) < new Date() : false
  );

  const cstcExpiringSoon = $derived(
    form.cstc_expiry
      ? (new Date(form.cstc_expiry).getTime() - Date.now() > 0 &&
         new Date(form.cstc_expiry).getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000)
      : false
  );
</script>

<div style="padding: 14px 12px 0;">

  <!-- Header -->
  <div style="
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 14px; margin-bottom: 12px;
  ">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="
        width: 52px; height: 52px; background: var(--accent); border-radius: 12px;
        display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0;
      ">👷</div>
      <div>
        <div style="font-size: 18px; font-weight: 800; color: var(--text);">
          {hasProfil ? `${form.prenom} ${form.nom}` : 'Mon profil'}
        </div>
        <div style="font-size: 12px; color: var(--text3);">
          {hasProfil ? (form.employeur || 'Boutefeu certifié') : 'Configurer votre profil'}
        </div>
      </div>
    </div>
  </div>

  {#if !loading}

    <!-- CSTC Alerts -->
    {#if form.cstc_expiry}
      {#if cstcExpired}
        <div style="
          background: var(--red-dim); border: 1px solid rgba(231,76,60,0.4);
          border-radius: var(--radius-sm); padding: 12px; margin-bottom: 12px;
          font-size: 13px; color: var(--red);
        ">
          ⚠️ <strong>CERTIFICAT CSTC EXPIRÉ</strong> — Votre certificat a expiré le {form.cstc_expiry}. Renouvelez-le immédiatement.
        </div>
      {:else if cstcExpiringSoon}
        <div style="
          background: var(--yellow-dim); border: 1px solid rgba(243,156,18,0.4);
          border-radius: var(--radius-sm); padding: 12px; margin-bottom: 12px;
          font-size: 13px; color: var(--yellow);
        ">
          ⏰ <strong>Renouvellement bientôt requis</strong> — Votre certificat CSTC expire le {form.cstc_expiry}.
        </div>
      {/if}
    {/if}

    <!-- Identity -->
    <div class="card">
      <div class="card-header" style="cursor: default;">
        <div class="section-letter">①</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Identité</h3>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group">
            <label for="prenom">Prénom <span style="color:var(--red)">*</span></label>
            <input id="prenom" type="text" bind:value={form.prenom} placeholder="Votre prénom">
          </div>
          <div class="form-group">
            <label for="nom">Nom <span style="color:var(--red)">*</span></label>
            <input id="nom" type="text" bind:value={form.nom} placeholder="Votre nom">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="telephone">Téléphone</label>
            <input id="telephone" type="tel" bind:value={form.telephone} placeholder="ex: 514-555-0123">
          </div>
          <div class="form-group">
            <label for="email">Courriel</label>
            <input id="email" type="email" bind:value={form.email} placeholder="votre@email.com">
          </div>
        </div>
      </div>
    </div>

    <!-- Certifications -->
    <div class="card">
      <div class="card-header" style="cursor: default;">
        <div class="section-letter">②</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Certifications et permis</h3>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group">
            <label for="certificat_cstc">Certificat CSTC <span style="color:var(--red)">*</span></label>
            <input id="certificat_cstc" type="text" bind:value={form.certificat_cstc} placeholder="ex: BF-12345">
          </div>
          <div class="form-group">
            <label for="cstc_expiry">Date d'expiration CSTC</label>
            <input id="cstc_expiry" type="date" bind:value={form.cstc_expiry}>
          </div>
        </div>
        <div class="form-row cols1">
          <div class="form-group">
            <label for="permis_sq">Permis Sûreté du Québec <span style="color:var(--red)">*</span></label>
            <input id="permis_sq" type="text" bind:value={form.permis_sq} placeholder="ex: SQ-2024-XXXXX">
          </div>
        </div>

        <!-- Validity indicator -->
        {#if form.certificat_cstc}
          <div style="
            display: flex; align-items: center; gap: 8px; padding: 8px 12px;
            background: {cstcExpired ? 'var(--red-dim)' : cstcExpiringSoon ? 'var(--yellow-dim)' : 'var(--green-dim)'};
            border-radius: var(--radius-sm); font-size: 12px;
            color: {cstcExpired ? 'var(--red)' : cstcExpiringSoon ? 'var(--yellow)' : 'var(--green)'};
          ">
            {cstcExpired ? '⚠️ Certificat expiré' : cstcExpiringSoon ? '⏰ Expire bientôt' : '✅ Certificat valide'}
            {#if form.cstc_expiry}· Expiration: {form.cstc_expiry}{/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Travail -->
    <div class="card">
      <div class="card-header" style="cursor: default;">
        <div class="section-letter">③</div>
        <h3 style="font-size: 14px; font-weight: 600; color: var(--text); flex: 1;">Employeur et chantier</h3>
      </div>
      <div class="card-body">
        <div class="form-row cols1">
          <div class="form-group">
            <label for="employeur">Employeur</label>
            <input id="employeur" type="text" bind:value={form.employeur} placeholder="ex: Fafard Explosifs Inc.">
          </div>
        </div>
        <div class="form-row cols1">
          <div class="form-group">
            <label for="chantier_actuel">Chantier actuel</label>
            <input id="chantier_actuel" type="text" bind:value={form.chantier_actuel} placeholder="ex: Prolongement ligne bleue métro">
          </div>
        </div>
        <div style="
          background: rgba(79,110,247,0.08); border: 1px solid rgba(79,110,247,0.2);
          border-radius: var(--radius-sm); padding: 10px 12px; margin-top: 8px;
          font-size: 12px; color: var(--accent2);
        ">
          💡 Ces informations seront automatiquement remplies dans tous vos nouveaux journaux de tir.
        </div>
      </div>
    </div>

    <!-- Save button -->
    <button onclick={save} class="btn btn-primary btn-full" style="margin-top: 4px;" disabled={saving}>
      {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder le profil'}
    </button>

    <!-- About -->
    <div style="
      background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
      padding: 14px; margin-top: 12px;
    ">
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
        À propos de l'application
      </div>
      <div style="font-size: 12px; color: var(--text2); line-height: 1.6;">
        <strong style="color: var(--text);">Journal de Tir v1.0 MVP</strong><br>
        Application PWA pour boutefeux québécois<br>
        Conforme Règlement E-22 — CSTC — CNESST<br>
        <br>
        <span style="color: var(--text3);">Toutes les données sont stockées localement sur votre appareil. Aucune donnée n'est envoyée à un serveur.</span>
      </div>
      <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
        <span class="badge badge-blue">📱 PWA</span>
        <span class="badge badge-blue">🔒 Hors-ligne</span>
        <span class="badge badge-green">✅ E-22</span>
        <span class="badge badge-gray">Québec 🇨🇦</span>
      </div>
    </div>

  {:else}
    <div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>
  {/if}

</div>

<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import {
    getProfil, getJournal, saveJournal, updateJournal,
    emptyJournal, defaultSchemas,
    type JournalTir
  } from '$lib/db';
  import { showToast } from '$lib/stores/app';
  import DrillPatternEditor from '$lib/components/DrillPatternEditor.svelte';
  import BoreholeDiagram from '$lib/components/BoreholeDiagram.svelte';

  // ── State ──────────────────────────────────────────────────────────────────

  let activeTab = $state(0);  // 0=Journal, 1=Plan de tir, 2=Profil de tir
  let saving = $state(false);
  let loading = $state(true);
  let editId = $state<number | null>(null);

  // The form data
  let form = $state<Omit<JournalTir, 'id'>>(emptyJournal());

  // ── Mount ──────────────────────────────────────────────────────────────────

  onMount(async () => {
    try {
      const urlEdit = $page.url.searchParams.get('edit');
      if (urlEdit) {
        editId = parseInt(urlEdit);
        const existing = await getJournal(editId);
        if (existing) {
          const { id: _, ...rest } = existing;
          form = {
            ...emptyJournal(),
            ...rest,
            schemas: rest.schemas && rest.schemas.length === 6
              ? rest.schemas
              : defaultSchemas(),
          };
        }
      } else {
        const profil = await getProfil();
        form = emptyJournal(profil);
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

  // ── Save ───────────────────────────────────────────────────────────────────

  async function save(andComplete = false) {
    if (saving) return;
    saving = true;
    try {
      const data: Omit<JournalTir, 'id'> = {
        ...form,
        statut: andComplete ? 'complete' : form.statut,
        updatedAt: new Date().toISOString(),
      };
      if (editId) {
        await updateJournal(editId, data);
        showToast(andComplete ? '✅ Journal complété!' : '💾 Sauvegardé!', 'success');
        goto(base + `/journal/${editId}`);
      } else {
        const newId = await saveJournal(data);
        showToast(andComplete ? '✅ Journal complété!' : '💾 Journal créé!', 'success');
        goto(base + `/journal/${newId}`);
      }
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde', 'error');
      saving = false;
    }
  }

  // ── Preview / Aperçu ───────────────────────────────────────────────────────

  async function preview() {
    if (saving) return;
    saving = true;
    try {
      const data: Omit<JournalTir, 'id'> = {
        ...form,
        statut: form.statut,
        updatedAt: new Date().toISOString(),
      };
      let id: number;
      if (editId) {
        await updateJournal(editId, data);
        id = editId;
      } else {
        id = await saveJournal(data);
        editId = id;
        // Update URL so future saves will edit this journal
        const url = new URL(window.location.href);
        url.searchParams.set('edit', String(id));
        window.history.replaceState({}, '', url.toString());
      }
      showToast('💾 Brouillon sauvegardé', 'success');
      goto(base + `/journal/${id}/print`);
    } catch (err) {
      console.error(err);
      showToast('Erreur lors de la sauvegarde', 'error');
      saving = false;
    }
  }

  // ── Oui/Non toggle helper ──────────────────────────────────────────────────

  function ouiNonToggle(field: keyof JournalTir, val: boolean) {
    (form as any)[field] = (form as any)[field] === val ? null : val;
  }

  function isOuiNon(field: keyof JournalTir, val: boolean): boolean {
    return (form as any)[field] === val;
  }

  const tabs = ['📋 Journal', '🗺️ Plan de tir', '📐 Profil de tir'];
</script>

{#if loading}
  <div style="text-align: center; padding: 40px; color: var(--text3);">Chargement...</div>
{:else}
<div style="padding: 0 0 16px;">

  <!-- Sticky header with tabs -->
  <div style="
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 12px 14px;
    position: sticky; top: 0; z-index: 50;
  ">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
      <button
        onclick={() => goto(base + '/historique')}
        style="background: none; border: none; color: var(--text3); cursor: pointer; font-size: 18px; padding: 4px; font-family: inherit;"
      >←</button>
      <div style="flex: 1;">
        <div style="font-size: 13px; font-weight: 700; color: var(--text);">
          {editId ? '✏️ Modifier le journal' : '✏️ Nouveau journal de tir'}
        </div>
        <div style="font-size: 10px; color: var(--text3);">{form.numero_tir} · Annexe 2.2</div>
      </div>
      <button
        onclick={preview}
        disabled={saving}
        style="
          padding: 8px 12px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 700;
          background: var(--card2); color: var(--text2); border: 1px solid var(--border);
          cursor: pointer; font-family: inherit; white-space: nowrap;
          opacity: {saving ? 0.6 : 1};
        "
      >👁️ Aperçu</button>
      <button
        onclick={() => save(false)}
        disabled={saving}
        style="
          padding: 8px 14px; border-radius: var(--radius-sm); font-size: 12px; font-weight: 700;
          background: var(--accent); color: #fff; border: none; cursor: pointer;
          font-family: inherit; white-space: nowrap;
          opacity: {saving ? 0.6 : 1};
        "
      >{saving ? '⏳' : '💾 Sauver'}</button>
    </div>

    <!-- Tab bar -->
    <div style="display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none;">
      {#each tabs as tab, i}
        <button
          onclick={() => activeTab = i}
          style="
            flex-shrink: 0; padding: 7px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
            cursor: pointer; border: 1px solid {activeTab === i ? 'var(--accent)' : 'var(--border)'};
            background: {activeTab === i ? 'var(--accent-glow)' : 'var(--card2)'};
            color: {activeTab === i ? 'var(--accent2)' : 'var(--text3)'};
            white-space: nowrap; font-family: inherit;
          "
        >{tab}</button>
      {/each}
    </div>
  </div>

  <!-- ════════════════════════════════════════════════════════════════════════
       PAGE 1 — Journal de tir par sautage
       ════════════════════════════════════════════════════════════════════════ -->
  {#if activeTab === 0}
  <div style="padding: 14px 12px 0;">

    <!-- Reference note -->
    <div style="
      font-size: 10px; color: var(--text3); text-align: center;
      background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 6px 10px; margin-bottom: 14px; line-height: 1.5;
    ">
      Annexe 2.2 Journal de tir (art. 4.7.10.) du Code de sécurité pour les travaux de construction
    </div>

    <!-- ── En-tête ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      En-tête
    </div>
    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="nom_entreprise">Nom de l'entreprise</label>
        <input id="nom_entreprise" type="text" bind:value={form.nom_entreprise} placeholder="ex: Fafard Explosifs Inc.">
      </div>
    </div>
    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="adresse">Adresse <span style="color:var(--text3);font-weight:400;">(optionnel)</span></label>
        <input id="adresse" type="text" bind:value={form.adresse_entreprise} placeholder="Adresse de l'entreprise">
      </div>
    </div>
    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="loc_chantier">Localisation du chantier</label>
        <input id="loc_chantier" type="text" bind:value={form.localisation_chantier} placeholder="ex: Autoroute 40, km 23">
      </div>
    </div>
    <div class="form-row cols1" style="margin-bottom: 16px;">
      <div class="form-group">
        <label for="donneur">Donneur d'ouvrage</label>
        <input id="donneur" type="text" bind:value={form.donneur_ouvrage} placeholder="ex: MTQ, Ville de Montréal">
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── Information sur le sautage ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Information sur le sautage à l'explosif
    </div>
    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="loc_chainage">Localisation / chaînage</label>
        <input id="loc_chainage" type="text" bind:value={form.localisation_chainage} placeholder="ex: Station 4+500">
      </div>
    </div>
    <div class="form-row" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="date_tir">Date</label>
        <input id="date_tir" type="date" bind:value={form.date_tir}>
      </div>
      <div class="form-group">
        <label for="heure_tir">Heure</label>
        <input id="heure_tir" type="time" bind:value={form.heure_tir}>
      </div>
    </div>
    <div class="form-row cols1" style="margin-bottom: 16px;">
      <div class="form-group">
        <label for="nb_volees">Nombre de volées quotidiennes</label>
        <input id="nb_volees" type="text" bind:value={form.nb_volees_quotidiennes} placeholder="ex: 2">
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── Conditions climatiques ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Conditions climatiques
    </div>
    <div class="form-row" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="temperature">Température (°C)</label>
        <input id="temperature" type="text" bind:value={form.temperature} placeholder="ex: 12">
      </div>
      <div class="form-group">
        <label for="vent">Direction et vitesse des vents</label>
        <input id="vent" type="text" bind:value={form.vent_direction_vitesse} placeholder="ex: N-O 20 km/h">
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
      {#each [
        { key: 'meteo_ensoleille' as keyof JournalTir, label: 'Ensoleillé ☀️' },
        { key: 'meteo_nuageux' as keyof JournalTir, label: 'Nuageux ⛅' },
        { key: 'meteo_pluie' as keyof JournalTir, label: 'Pluie 🌧️' },
        { key: 'meteo_neige' as keyof JournalTir, label: 'Neige ❄️' },
      ] as item}
        <label style="
          display: flex; align-items: center; gap: 10px; cursor: pointer;
          background: var(--card2); border: 1px solid var(--border);
          border-radius: var(--radius-sm); padding: 10px 12px;
          font-size: 13px; color: var(--text2); font-weight: 400;
          user-select: none;
        ">
          <input
            type="checkbox"
            bind:checked={(form as any)[item.key]}
            style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent);"
          >
          {item.label}
        </label>
      {/each}
    </div>

    <div class="divider"></div>

    <!-- ── Données sur le forage ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Données sur le forage
    </div>

    <div class="form-row" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="nb_trous">Nombre de trous</label>
        <input id="nb_trous" type="text" bind:value={form.nb_trous} placeholder="ex: 24">
      </div>
      <div class="form-group">
        <label for="diametre">Diamètre de forage (mm)</label>
        <input id="diametre" type="text" bind:value={form.diametre_forage} placeholder="ex: 89">
      </div>
    </div>
    <div class="form-row" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="fardeau">Fardeau (m)</label>
        <input id="fardeau" type="text" bind:value={form.fardeau} placeholder="ex: 3.0">
      </div>
      <div class="form-group">
        <label for="espacement">Espacement (m)</label>
        <input id="espacement" type="text" bind:value={form.espacement} placeholder="ex: 3.5">
      </div>
    </div>
    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="profondeur_rangee">Profondeur moyenne par rangée du forage (m)</label>
        <input id="profondeur_rangee" type="text" bind:value={form.profondeur_moy_rangee} placeholder="ex: 10.5">
      </div>
    </div>
    <div class="form-row" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="haut_collet">Hauteur du collet (m)</label>
        <input id="haut_collet" type="text" bind:value={form.hauteur_collet} placeholder="ex: 2.5">
      </div>
      <div class="form-group">
        <div style="font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 8px;">Nature de la bourre</div>
        <div style="display: flex; gap: 8px; padding-top: 0px;">
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 12px; color: var(--text2); font-weight: 400; text-transform: none; letter-spacing: 0;">
            <input type="checkbox" bind:checked={form.nature_bourre_pierre_nette} style="width: 16px; height: 16px; accent-color: var(--accent);">
            pierre nette
          </label>
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 12px; color: var(--text2); font-weight: 400; text-transform: none; letter-spacing: 0;">
            <input type="checkbox" bind:checked={form.nature_bourre_concassee} style="width: 16px; height: 16px; accent-color: var(--accent);">
            concassée
          </label>
        </div>
      </div>
    </div>
    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="mort_terrain">Hauteur du mort terrain (m)</label>
        <input id="mort_terrain" type="text" bind:value={form.hauteur_mort_terrain} placeholder="ex: 1.5">
      </div>
    </div>

    <!-- Vibrations -->
    <div style="
      background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 10px 12px; margin-bottom: 10px;
    ">
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px;">
        Vibrations
      </div>
      <div class="form-group" style="margin-bottom: 8px;">
        <label for="vib_respecter">Valeur à respecter</label>
        <input id="vib_respecter" type="text" bind:value={form.vibrations_valeur_respecter} placeholder="ex: 12.5 mm/s PPV">
      </div>
      <div class="form-group" style="margin-bottom: 8px;">
        <label for="vib_obtenue">Valeur obtenue</label>
        <input id="vib_obtenue" type="text" bind:value={form.vibrations_valeur_obtenue} placeholder="ex: 8.2 mm/s PPV">
      </div>
      <div class="form-group">
        <label for="vib_sismo">Emplacement des sismographes</label>
        <input id="vib_sismo" type="text" bind:value={form.vibrations_sismographes} placeholder="ex: Bâtiment résidentiel, 150m N">
      </div>
    </div>

    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="nb_predecoupage">Nombre de trous de pré-découpage (à détailler sur le plan de tir)</label>
        <input id="nb_predecoupage" type="text" bind:value={form.nb_trous_predecoupage} placeholder="ex: 8">
      </div>
    </div>

    <!-- Pare-éclats -->
    <div style="
      background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 10px 12px; margin-bottom: 16px;
    ">
      <div style="font-size: 11px; font-weight: 700; color: var(--text3); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px;">
        Type de pare-éclats (si requis)
      </div>
      <div class="form-row" style="margin-bottom: 8px;">
        <div class="form-group">
          <label for="type_pe">Type</label>
          <input id="type_pe" type="text" bind:value={form.type_pare_eclats} placeholder="ex: Tapis caoutchouc">
        </div>
        <div class="form-group">
          <label for="dim_pe">Dimension</label>
          <input id="dim_pe" type="text" bind:value={form.pare_eclats_dimension} placeholder="ex: 3m × 4m">
        </div>
      </div>
      <div class="form-group">
        <label for="nb_pe">Nombre</label>
        <input id="nb_pe" type="text" bind:value={form.pare_eclats_nombre} placeholder="ex: 4">
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── Distance des structures ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Distance des structures les plus près (en mètre)
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
      {#each [
        { key: 'dist_batiment' as keyof JournalTir, label: 'Bâtiment' },
        { key: 'dist_pont' as keyof JournalTir, label: 'Pont' },
        { key: 'dist_route' as keyof JournalTir, label: 'Route' },
        { key: 'dist_ligne_electrique' as keyof JournalTir, label: 'Ligne électrique' },
        { key: 'dist_structure_souterraine' as keyof JournalTir, label: 'Structure sous-terr.' },
      ] as item}
        <div class="form-group">
          <label for={String(item.key)}>{item.label} (m)</label>
          <input
            id={String(item.key)}
            type="text"
            bind:value={(form as any)[item.key]}
            placeholder="ex: 50"
          >
        </div>
      {/each}
    </div>

    <div class="divider"></div>

    <!-- ── Explosifs ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Explosifs (réf.: Colonne de charge)
    </div>
    <div class="form-row" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="type_det">Type de détonateurs</label>
        <input id="type_det" type="text" bind:value={form.type_detonateurs} placeholder="ex: Électroniques">
      </div>
      <div class="form-group">
        <label for="nb_det">Nombre de détonateurs</label>
        <input id="nb_det" type="text" bind:value={form.nb_detonateurs} placeholder="ex: 48">
      </div>
    </div>
    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="qte_expl">Quantité d'explosifs utilisés (amorces, explosifs en unité, sac, caisse ou kg)</label>
        <textarea
          id="qte_expl"
          bind:value={form.quantite_explosifs}
          placeholder="ex: 24 cartouches 500g Emulite, 3 caisses ANFO 25kg"
          rows="3"
        ></textarea>
      </div>
    </div>
    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="emulsion">Type d'émulsion pompée (s'il y a lieu)</label>
        <input id="emulsion" type="text" bind:value={form.type_emulsion_pompee} placeholder="ex: Magnafrac 5000">
      </div>
    </div>
    <div class="form-row" style="margin-bottom: 16px;">
      <div class="form-group">
        <label for="vol_roc">Volume de roc (m³)</label>
        <input id="vol_roc" type="text" bind:value={form.volume_roc_m3} placeholder="ex: 450">
      </div>
      <div class="form-group">
        <label for="facteur">Facteur de chargement (kg/m³)</label>
        <input id="facteur" type="text" bind:value={form.facteur_chargement} placeholder="ex: 0.45">
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── Recommandations ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Recommandations (bonnes pratiques)
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
      {#each [
        { key: 'camera_video' as keyof JournalTir, label: 'Caméra vidéo' },
        { key: 'ecaillage_securite' as keyof JournalTir, label: 'Écaillage de sécurité' },
        { key: 'detecteur_co_bnq' as keyof JournalTir, label: 'Détecteur résidentiel de CO selon la norme BNQ' },
      ] as item}
        <div style="
          display: flex; align-items: center; gap: 12px;
          background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 10px 12px;
        ">
          <span style="flex: 1; font-size: 13px; color: var(--text2);">{item.label}</span>
          <div style="display: flex; gap: 6px;">
            <button
              type="button"
              onclick={() => ouiNonToggle(item.key, true)}
              style="
                padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
                cursor: pointer; font-family: inherit; border: 1px solid;
                {isOuiNon(item.key, true)
                  ? 'background: var(--green-dim); border-color: var(--green); color: var(--green);'
                  : 'background: var(--card2); border-color: var(--border); color: var(--text3);'}
              "
            >Oui</button>
            <button
              type="button"
              onclick={() => ouiNonToggle(item.key, false)}
              style="
                padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
                cursor: pointer; font-family: inherit; border: 1px solid;
                {isOuiNon(item.key, false)
                  ? 'background: var(--red-dim); border-color: var(--red); color: var(--red);'
                  : 'background: var(--card2); border-color: var(--border); color: var(--text3);'}
              "
            >Non</button>
          </div>
        </div>
      {/each}
    </div>

    <div class="divider"></div>

    <!-- ── Résultat du sautage ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Résultat du sautage
    </div>

    <div class="form-row cols1" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="conc_co">Concentration max. de CO (ppm)</label>
        <input id="conc_co" type="text" bind:value={form.concentration_co_ppm} placeholder="ex: 25 ppm">
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">

      {#each [
        { key: 'fracturation_exigee' as keyof JournalTir, label: 'Fracturation telle qu\'exigée', invertColors: false },
        { key: 'bris_hors_profil' as keyof JournalTir, label: 'Bris hors profil', invertColors: true },
        { key: 'trous_rates' as keyof JournalTir, label: 'Trous ratés / canon / fond de trou', invertColors: true },
      ] as item}
        <div style="background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="flex: 1; font-size: 13px; color: var(--text2);">{item.label}</span>
            <div style="display: flex; gap: 6px;">
              <button type="button" onclick={() => ouiNonToggle(item.key, true)} style="padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid; {isOuiNon(item.key, true) ? (item.invertColors ? 'background: var(--red-dim); border-color: var(--red); color: var(--red);' : 'background: var(--green-dim); border-color: var(--green); color: var(--green);') : 'background: var(--card2); border-color: var(--border); color: var(--text3);'}">Oui</button>
              <button type="button" onclick={() => ouiNonToggle(item.key, false)} style="padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid; {isOuiNon(item.key, false) ? (item.invertColors ? 'background: var(--green-dim); border-color: var(--green); color: var(--green);' : 'background: var(--red-dim); border-color: var(--red); color: var(--red);') : 'background: var(--card2); border-color: var(--border); color: var(--text3);'}">Non</button>
            </div>
          </div>
        </div>
      {/each}

      <!-- Projection -->
      <div style="background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: {form.projection === true ? '10px' : '0'};">
          <span style="flex: 1; font-size: 13px; color: var(--text2);">Projection</span>
          <div style="display: flex; gap: 6px;">
            <button type="button" onclick={() => ouiNonToggle('projection', true)} style="padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid; {isOuiNon('projection', true) ? 'background: var(--red-dim); border-color: var(--red); color: var(--red);' : 'background: var(--card2); border-color: var(--border); color: var(--text3);'}">Oui</button>
            <button type="button" onclick={() => ouiNonToggle('projection', false)} style="padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; border: 1px solid; {isOuiNon('projection', false) ? 'background: var(--green-dim); border-color: var(--green); color: var(--green);' : 'background: var(--card2); border-color: var(--border); color: var(--text3);'}">Non</button>
          </div>
        </div>
        {#if form.projection === true}
          <div class="form-group" style="margin-bottom: 8px;">
            <label for="proj_details">Si oui, distance et grosseur des pierres</label>
            <input id="proj_details" type="text" bind:value={form.projection_details} placeholder="ex: 15m, pierres de 5-10 cm">
          </div>
          <div class="form-group">
            <label for="dommages">Description des dommages</label>
            <textarea id="dommages" bind:value={form.description_dommages} placeholder="Décrivez les dommages causés..." rows="2"></textarea>
          </div>
        {/if}
      </div>

    </div>

    <div class="divider"></div>

    <!-- ── Remarques ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Remarques
    </div>
    <div class="form-row cols1" style="margin-bottom: 16px;">
      <div class="form-group">
        <textarea
          bind:value={form.remarques}
          placeholder="Observations, commentaires particuliers..."
          rows="4"
        ></textarea>
      </div>
    </div>

    <div class="divider"></div>

    <!-- ── Boutefeu ── -->
    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
      Nom du boutefeu / Signature
    </div>
    <div class="form-row" style="margin-bottom: 10px;">
      <div class="form-group">
        <label for="bf_prenom">Prénom</label>
        <input id="bf_prenom" type="text" bind:value={form.boutefeu_prenom} placeholder="Prénom">
      </div>
      <div class="form-group">
        <label for="bf_nom">Nom</label>
        <input id="bf_nom" type="text" bind:value={form.boutefeu_nom} placeholder="Nom de famille">
      </div>
    </div>
    <div class="form-row" style="margin-bottom: 16px;">
      <div class="form-group">
        <label for="bf_cert">Certificat CSTC</label>
        <input id="bf_cert" type="text" bind:value={form.boutefeu_certificat} placeholder="ex: BF-12345">
      </div>
      <div class="form-group">
        <label for="bf_sq">Permis SQ</label>
        <input id="bf_sq" type="text" bind:value={form.boutefeu_permis_sq} placeholder="ex: SQ-2024-XXXXX">
      </div>
    </div>

    <div style="
      background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 10px 12px; margin-bottom: 16px;
      font-size: 11px; color: var(--text3); line-height: 1.5;
    ">
      📌 <em>L'employeur doit conserver le journal de tir pendant une durée de 3 ans à compter de la date de la dernière intervention au chantier.</em>
    </div>

    <div style="display: flex; gap: 10px; margin-bottom: 16px;">
      <button onclick={() => save(false)} disabled={saving} class="btn btn-secondary" style="flex: 1; justify-content: center;">
        {saving ? '⏳' : '💾 Sauver brouillon'}
      </button>
      <button onclick={() => save(true)} disabled={saving} class="btn btn-primary" style="flex: 1; justify-content: center;">
        {saving ? '⏳' : '✅ Compléter'}
      </button>
    </div>

  </div>
  {/if}

  <!-- ════════════════════════════════════════════════════════════════════════
       PAGE 2 — Plan de tir
       ════════════════════════════════════════════════════════════════════════ -->
  {#if activeTab === 1}
  <div style="padding: 14px 12px 0;">

    <div style="font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 4px;">
      Plan de tir — Registre de forage (tel que réalisé)
    </div>
    <div style="
      font-size: 10px; color: var(--text3); margin-bottom: 14px;
      background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 6px 10px;
    ">
      Annexe 2.2 — Page 2
    </div>

    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
      5 items à documenter sur le plan
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
      {#each [
        { key: 'plan_faces_libres' as keyof JournalTir, num: '1', label: 'Nombre et orientation des faces libres' },
        { key: 'plan_direction_tir' as keyof JournalTir, num: '2', label: 'Direction du tir' },
        { key: 'plan_sequence_identification' as keyof JournalTir, num: '3', label: 'Identification de la séquence de tir (incluant les délais)' },
        { key: 'plan_structures_distance' as keyof JournalTir, num: '4', label: 'Positionnement des structures les plus près (distance en mètre)' },
        { key: 'plan_zone_tir' as keyof JournalTir, num: '5', label: "Zone de tir (ligne d'avertissement «délimitation de la zone de chargement») et distances en mètre" },
      ] as item}
        <div style="
          background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 10px 12px;
        ">
          <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 6px;">
            <div style="
              width: 22px; height: 22px; border-radius: 50%; background: var(--accent);
              display: flex; align-items: center; justify-content: center;
              font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0; margin-top: 1px;
            ">{item.num}</div>
            <label for={String(item.key)} style="font-size: 12px; font-weight: 600; color: var(--text2); line-height: 1.4; flex: 1; margin-bottom: 0; text-transform: none; letter-spacing: 0;">
              {item.label}
            </label>
          </div>
          <textarea
            id={String(item.key)}
            bind:value={(form as any)[item.key]}
            placeholder="Notes et valeurs mesurées..."
            rows="2"
            style="font-size: 13px;"
          ></textarea>
        </div>
      {/each}
    </div>

    <div class="divider"></div>

    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
      Patron de forage — Éditeur interactif
    </div>
    <div style="font-size: 11px; color: var(--text3); margin-bottom: 10px;">
      Placez les trous manuellement, utilisez un gabarit, ou importez une photo avec l'IA.
    </div>

    <DrillPatternEditor
      bind:holes={form.drill_holes}
      bind:connections={form.drill_connections}
      bind:dataurl={form.patron_forage_dataurl}
    />

    <div style="margin-top: 16px; margin-bottom: 16px;">
      <button onclick={() => save(false)} disabled={saving} class="btn btn-primary btn-full">
        {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder le plan de tir'}
      </button>
    </div>

  </div>
  {/if}

  <!-- ════════════════════════════════════════════════════════════════════════
       PAGE 3 — Profil de tir
       ════════════════════════════════════════════════════════════════════════ -->
  {#if activeTab === 2}
  <div style="padding: 14px 12px 0;">

    <div style="font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 4px;">
      Profil de tir — Vue en élévation du sautage par tir
    </div>
    <div style="
      font-size: 10px; color: var(--text3); margin-bottom: 14px;
      background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 6px 10px;
    ">
      Annexe 2.2 — Page 3
    </div>

    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
      Informations requises
    </div>

    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
      {#each [
        { key: 'profil_description_explosifs' as keyof JournalTir, num: '1', label: 'Description des explosifs par trou (dimensions, nombre et poids)' },
        { key: 'profil_agents_sautage' as keyof JournalTir, num: '2', label: 'Description des agents de sautage (poids / trou en kg)' },
        { key: 'profil_raccordements_delais' as keyof JournalTir, num: '3', label: 'Identification des raccordements / délai milliseconde (fond du trou et à la surface)' },
      ] as item}
        <div style="
          background: var(--card2); border: 1px solid var(--border); border-radius: var(--radius-sm);
          padding: 10px 12px;
        ">
          <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 6px;">
            <div style="
              width: 22px; height: 22px; border-radius: 50%; background: var(--accent);
              display: flex; align-items: center; justify-content: center;
              font-size: 11px; font-weight: 800; color: #fff; flex-shrink: 0; margin-top: 1px;
            ">{item.num}</div>
            <label for={String(item.key)} style="font-size: 12px; font-weight: 600; color: var(--text2); line-height: 1.4; flex: 1; margin-bottom: 0; text-transform: none; letter-spacing: 0;">
              {item.label}
            </label>
          </div>
          <textarea
            id={String(item.key)}
            bind:value={(form as any)[item.key]}
            placeholder="Remplir selon la colonne de charge..."
            rows="3"
            style="font-size: 13px;"
          ></textarea>
        </div>
      {/each}
    </div>

    <div class="divider"></div>

    <div style="font-size: 11px; font-weight: 700; color: var(--accent2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
      Schémas de sautage (6 schémas)
    </div>
    <div style="font-size: 11px; color: var(--text3); margin-bottom: 12px; line-height: 1.5;">
      Disposition des trous de mine / Séquence de mise à feu — remplissez chaque schéma.
    </div>

    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
      {#each form.schemas as _schema, i}
        <BoreholeDiagram bind:schema={form.schemas[i]} index={i} />
      {/each}
    </div>

    <div style="margin-bottom: 16px;">
      <button onclick={() => save(false)} disabled={saving} class="btn btn-secondary btn-full" style="margin-bottom: 8px;">
        {saving ? '⏳' : '💾 Sauver brouillon'}
      </button>
      <button onclick={() => save(true)} disabled={saving} class="btn btn-primary btn-full">
        {saving ? '⏳' : '✅ Compléter le journal'}
      </button>
    </div>

  </div>
  {/if}

</div>
{/if}

<script lang="ts">
  import type { SchemaForage } from '$lib/db';

  // One schema card for a borehole diagram
  // Matches the "SCHÉMA DE SAUTAGE" boxes from the official page 3

  let {
    schema = $bindable<SchemaForage>(),
    index,
    readonly = false,
  }: {
    schema: SchemaForage;
    index: number;
    readonly?: boolean;
  } = $props();

  // Parse couches lines for the diagram labels
  const coucheLines = $derived(
    schema.couches ? schema.couches.split('\n').filter(l => l.trim()) : []
  );
</script>

<div style="
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  font-size: 12px;
">
  <!-- Card header -->
  <div style="
    background: var(--card2);
    border-bottom: 1px solid var(--border);
    padding: 8px 10px;
    font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px;
  ">
    Schéma #{index + 1} — Disposition des trous de mine / Séquence de mise à feu
  </div>

  <div style="padding: 10px;">

    <!-- Profondeur des forages -->
    <div style="margin-bottom: 8px;">
      <label for="prof_{index}" style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">
        Profondeur des forages: SOL/ROC (incluant mort terrain)
      </label>
      {#if readonly}
        <div style="font-size: 13px; color: var(--text); padding: 6px 0;">{schema.profondeur_sol_roc || '—'}</div>
      {:else}
        <input
          id="prof_{index}"
          type="text"
          bind:value={schema.profondeur_sol_roc}
          placeholder="ex: 2.5m SOL / 8.5m ROC"
          style="font-size: 12px;"
        >
      {/if}
    </div>

    <!-- Chargement-Type -->
    <div style="margin-bottom: 10px;">
      <label for="ct_{index}" style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">
        Chargement-Type
      </label>
      {#if readonly}
        <div style="font-size: 13px; color: var(--text); padding: 6px 0;">{schema.chargement_type || '—'}</div>
      {:else}
        <input
          id="ct_{index}"
          type="text"
          bind:value={schema.chargement_type}
          placeholder="ex: Emulite 100, 70mm"
          style="font-size: 12px;"
        >
      {/if}
    </div>

    <!-- Visual borehole diagram + labels -->
    <div style="display: flex; gap: 8px; margin-bottom: 10px;">

      <!-- Left labels -->
      <div style="
        flex: 1; display: flex; flex-direction: column; justify-content: space-between;
        min-height: 140px;
        font-size: 10px; color: var(--text3);
        padding: 4px 0;
      ">
        {#if coucheLines.length > 0}
          {#each coucheLines as line}
            <div style="
              display: flex; align-items: center; gap: 4px;
              padding: 2px 0;
            ">
              <span style="color: var(--accent2);">•</span>
              <span style="color: var(--text2); font-size: 10px;">{line}</span>
            </div>
          {/each}
        {:else if !readonly}
          <div style="font-size: 10px; color: var(--text3); font-style: italic; padding: 4px 0;">
            Couches ↓
          </div>
        {/if}
      </div>

      <!-- Borehole visual -->
      <div style="
        width: 56px; flex-shrink: 0;
        border: 2px solid var(--border2);
        border-radius: 0 0 4px 4px;
        border-top: none;
        min-height: 140px;
        position: relative;
        background: linear-gradient(to bottom,
          rgba(79,110,247,0.08) 0%,
          rgba(79,110,247,0.05) 30%,
          rgba(231,76,60,0.12) 60%,
          rgba(243,156,18,0.1) 100%
        );
        overflow: hidden;
      ">
        <!-- SOL label -->
        <div style="
          position: absolute; top: 0; left: 0; right: 0;
          text-align: center; font-size: 9px; font-weight: 700;
          color: var(--text3); padding: 3px 0;
          border-bottom: 1px dashed var(--border2);
          background: rgba(0,0,0,0.2);
          text-transform: uppercase; letter-spacing: 0.3px;
        ">SOL</div>

        <!-- Divider line (SOL/ROC) at ~30% -->
        <div style="
          position: absolute; left: 0; right: 0; top: 30%;
          border-top: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="font-size: 8px; color: var(--text3); background: var(--card); padding: 0 3px;">ROC</span>
        </div>

        <!-- Front de taille (red) at ~80% -->
        <div style="
          position: absolute; left: 0; right: 0; top: 80%;
          border-top: 2px solid rgba(231,76,60,0.7);
          display: flex; align-items: center; justify-content: center;
        ">
          <span style="font-size: 8px; color: #e74c3c; background: var(--card); padding: 0 3px; font-weight: 700;">FOND</span>
        </div>

        <!-- Hole indicator (vertical line) -->
        <div style="
          position: absolute; left: 50%; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, var(--accent) 0%, var(--accent) 78%, #e74c3c 78%, #e74c3c 100%);
          transform: translateX(-50%);
          opacity: 0.6;
        "></div>
      </div>

    </div>

    <!-- "Front de taille" label (red, like paper form) -->
    <div style="
      color: #e74c3c; font-size: 10px; font-weight: 700;
      text-align: center; margin-bottom: 8px; letter-spacing: 0.5px;
    ">— FRONT DE TAILLE —</div>

    <!-- Bourre / Espaceurs -->
    <div style="margin-bottom: 6px;">
      <label for="bourre_{index}" style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">
        Bourre / Espaceurs
      </label>
      {#if readonly}
        <div style="font-size: 12px; color: var(--text2);">{schema.bourre || '—'}</div>
      {:else}
        <input
          id="bourre_{index}"
          type="text"
          bind:value={schema.bourre}
          placeholder="ex: 2.5m pierre nette"
          style="font-size: 12px;"
        >
      {/if}
    </div>

    <!-- Explosifs / Amorces -->
    <div style="margin-bottom: 8px;">
      <label for="expl_{index}" style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">
        Explosifs / Amorces
      </label>
      {#if readonly}
        <div style="font-size: 12px; color: var(--text2);">{schema.explosifs_amorces || '—'}</div>
      {:else}
        <input
          id="expl_{index}"
          type="text"
          bind:value={schema.explosifs_amorces}
          placeholder="ex: 3×500g Emulite, détonateur 500ms"
          style="font-size: 12px;"
        >
      {/if}
    </div>

    <!-- Couches labels (textarea) -->
    {#if !readonly}
    <div style="margin-bottom: 8px;">
      <label for="couches_{index}" style="font-size: 10px; font-weight: 600; color: var(--text3); text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 3px;">
        Étiquettes de couches (une par ligne)
      </label>
      <textarea
        id="couches_{index}"
        bind:value={schema.couches}
        placeholder="Mort terrain&#10;Roc fracturé&#10;Roc sain&#10;Sous-forage"
        rows="4"
        style="font-size: 11px; min-height: 72px;"
      ></textarea>
    </div>
    {/if}

    <!-- Footer: Trous n° -->
    <div style="
      display: flex; align-items: center; gap: 8px;
      border-top: 1px solid var(--border); padding-top: 8px;
    ">
      <span style="font-size: 11px; color: var(--text3); font-weight: 600; white-space: nowrap;">Trous n°:</span>
      {#if readonly}
        <span style="font-size: 12px; color: var(--text);">{schema.trous_de || '___'}</span>
        <span style="color: var(--text3);">à</span>
        <span style="font-size: 12px; color: var(--text);">{schema.trous_a || '___'}</span>
      {:else}
        <input
          type="text"
          bind:value={schema.trous_de}
          placeholder="de"
          style="width: 56px; font-size: 12px; text-align: center;"
        >
        <span style="color: var(--text3);">à</span>
        <input
          type="text"
          bind:value={schema.trous_a}
          placeholder="à"
          style="width: 56px; font-size: 12px; text-align: center;"
        >
      {/if}
    </div>

  </div>
</div>

import type { JournalTir } from './db';

export async function exportJournalPDF(journal: JournalTir): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });

  const pageW = 215.9;
  const margin = 15;
  const colW = pageW - margin * 2;
  let y = margin;

  const addLine = () => {
    doc.setDrawColor(180, 180, 200);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  };

  const addTitle = (text: string, size = 10) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 50, 120);
    doc.text(text, margin, y);
    y += size * 0.45 + 2;
  };

  const addRow = (label: string, value: string, x = margin, w = colW) => {
    const half = w / 2;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80, 80, 100);
    doc.text(label + ':', x, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 40);
    const lines = doc.splitTextToSize(value || '—', half - 2);
    doc.text(lines, x + half * 0.45, y);
    y += Math.max(5, lines.length * 4);
  };

  const checkPage = (needed = 20) => {
    if (y + needed > 270) {
      doc.addPage();
      y = margin;
    }
  };

  // ── HEADER ──
  doc.setFillColor(20, 30, 80);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('JOURNAL DE TIR', margin, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Conforme Règlement E-22 — Province de Québec', margin, 19);
  doc.text(`No. ${journal.numero_tir}`, pageW - margin - 30, 12);
  doc.text(`Statut: ${journal.statut.toUpperCase()}`, pageW - margin - 30, 19);
  y = 34;

  // ── SECTION 1: IDENTIFICATION ──
  addTitle('① IDENTIFICATION DU CHANTIER');
  addLine();
  addRow('Numéro de tir', journal.numero_tir);
  addRow('Date', journal.date_tir);
  addRow('Heure prévue', journal.heure_tir);
  addRow('Chantier / Projet', journal.chantier);
  addRow('Station / Localisation', journal.station);
  addRow('No. contrat', journal.contrat);
  y += 2;

  // ── SECTION 2: BOUTEFEU ──
  checkPage();
  addTitle('② BOUTEFEU ET PERMIS');
  addLine();
  addRow('Prénom', journal.boutefeu_prenom);
  addRow('Nom', journal.boutefeu_nom);
  addRow('Certificat CSTC', journal.boutefeu_certificat);
  addRow('Permis SQ', journal.boutefeu_permis_sq);
  addRow('Superviseur', journal.superviseur);
  addRow('Employeur', journal.employeur);
  y += 2;

  // ── SECTION 3: CONDITIONS ──
  checkPage();
  addTitle('③ CONDITIONS MÉTÉOROLOGIQUES ET GÉOLOGIQUES');
  addLine();
  addRow('Date/Heure de mise à feu', journal.heure_mise_a_feu || journal.heure_tir);
  addRow('Température', journal.temperature ? `${journal.temperature} °C` : '');
  addRow('Météo', journal.meteo);
  addRow('Type de roc', journal.type_roc);
  addRow('Géologie', journal.geologie);
  addRow('Conditions du roc', journal.conditions_roc);
  y += 2;

  // ── SECTION 4: FORAGE ──
  checkPage();
  addTitle('④ PLAN DE FORAGE');
  addLine();
  addRow('Type de tir', journal.type_tir);
  addRow('Nombre de trous', journal.nb_trous);
  addRow('Profondeur prévue (m)', journal.profondeur_prevue);
  addRow('Profondeur réelle (m)', journal.profondeur_reelle);
  addRow('Diamètre (mm)', journal.diametre);
  addRow('Espacement (m)', journal.espacement);
  addRow('Fardeau (m)', journal.fardeau);
  addRow('Sous-forage (m)', journal.sous_forage);
  addRow('Inclinaison (°)', journal.inclinaison);
  addRow('Orientation', journal.orientation);
  y += 2;

  // ── SECTION 5: EXPLOSIFS ──
  checkPage(30);
  addTitle('⑤ EXPLOSIFS ET DÉTONATEURS');
  addLine();

  if (journal.explosifs && journal.explosifs.length > 0) {
    // Table header
    doc.setFillColor(240, 240, 250);
    doc.rect(margin, y - 1, colW, 6, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 80);
    const cols = [margin, margin + 40, margin + 75, margin + 105, margin + 135, margin + 160];
    doc.text('Type', cols[0], y + 3);
    doc.text('Fabricant', cols[1], y + 3);
    doc.text('No. lot', cols[2], y + 3);
    doc.text('Qté/trou', cols[3], y + 3);
    doc.text('Nb trous', cols[4], y + 3);
    doc.text('Total kg', cols[5], y + 3);
    y += 7;

    journal.explosifs.forEach((e, i) => {
      checkPage(8);
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 255);
        doc.rect(margin, y - 1, colW, 5.5, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 40);
      doc.text(e.type || '—', cols[0], y + 3);
      doc.text(e.fabricant || '—', cols[1], y + 3);
      doc.text(e.lot || '—', cols[2], y + 3);
      doc.text(`${e.quantite_par_trou || '—'} ${e.unite}`, cols[3], y + 3);
      doc.text(e.nb_trous || '—', cols[4], y + 3);
      doc.text(e.total_kg || '—', cols[5], y + 3);
      y += 5.5;
    });
  }
  y += 3;
  addRow('Détonateurs', journal.detonateurs);
  addRow('Type de détonateurs', journal.type_detonateurs);
  addRow('Nb détonateurs utilisés', journal.nb_detonateurs);
  addRow('Séquence / délais', journal.sequence_delais);
  y += 2;

  // ── SECTION 6: SÉCURITÉ ──
  checkPage();
  addTitle('⑥ MESURES DE SÉCURITÉ');
  addLine();
  addRow('Zone de sécurité (m)', journal.zone_securite_m);
  addRow('Signaux utilisés', journal.signaux_utilises);

  const checks = [
    { label: 'Procédures de sécurité suivies', val: journal.procedures_suivies },
    { label: 'Zone évacuée et sécurisée', val: journal.zone_evacuee },
    { label: 'Communication établie', val: journal.communication_etablie },
    { label: 'Inspection pré-tir complétée', val: journal.inspection_avant },
  ];
  checks.forEach(c => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 40);
    const mark = c.val ? '☑' : '☐';
    doc.text(`${mark} ${c.label}`, margin, y);
    y += 5;
  });

  if (journal.gardiens && journal.gardiens.length > 0) {
    y += 1;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(50, 50, 80);
    doc.text('Gardiens de sécurité:', margin, y);
    y += 4;
    journal.gardiens.forEach(g => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 40);
      doc.text(`  • ${g.nom} — ${g.poste}`, margin, y);
      y += 4.5;
    });
  }
  y += 2;

  // ── SECTION 7: RÉSULTATS ──
  checkPage();
  addTitle('⑦ RÉSULTATS DU TIR');
  addLine();
  addRow('Heure de mise à feu', journal.heure_mise_a_feu);
  addRow('Fragmentation', journal.fragmentation);
  addRow('Projection max (m)', journal.projection_max_m);
  addRow('Vibrations PPV (mm/s)', journal.vibrations_ppv);
  addRow('Bruit (dB)', journal.bruit_db);
  addRow('Fumée (couleur)', journal.fumee_couleur);

  if (journal.trous_rates === 'oui' || journal.nb_trous_rates) {
    y += 1;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(180, 30, 30);
    doc.text('⚠ RATÉS SIGNALÉS', margin, y);
    y += 5;
    addRow('Nb trous ratés', journal.nb_trous_rates);
    addRow('Description', journal.description_rates);
    addRow('Procédures appliquées', journal.procedures_rates);
  }

  addRow('Observations générales', journal.resultats_generaux);
  y += 2;

  // ── SECTION 8: RÉCAP ──
  checkPage(25);
  addTitle('⑧ RÉCAPITULATIF DES QUANTITÉS');
  addLine();

  doc.setFillColor(245, 245, 255);
  doc.rect(margin, y - 1, colW, 18, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 50, 120);
  doc.text(`Total explosifs: ${journal.total_explosif_kg || '—'} kg`, margin + 5, y + 4);
  doc.text(`Total détonateurs: ${journal.total_detonateurs || '—'}`, margin + 5, y + 10);
  doc.text(`Ratio de poudre: ${journal.ratio_poudre || '—'} kg/tonne`, margin + 80, y + 4);
  y += 22;

  // ── SECTION 9: NOTES ──
  if (journal.remarques) {
    checkPage();
    addTitle('⑨ REMARQUES ET NOTES ADDITIONNELLES');
    addLine();
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 20, 40);
    const lines = doc.splitTextToSize(journal.remarques, colW);
    doc.text(lines, margin, y);
    y += lines.length * 4 + 4;
  }

  // ── SIGNATURE ──
  checkPage(35);
  addTitle('⑩ SIGNATURE ET CERTIFICATION');
  addLine();

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 60);
  doc.text('Je soussigné(e) certifie que les informations contenues dans ce journal de tir sont exactes', margin, y);
  y += 4;
  doc.text('et conformes aux exigences du Règlement E-22 sur les explosifs du Québec.', margin, y);
  y += 8;

  if (journal.signature_data) {
    try {
      doc.addImage(journal.signature_data, 'PNG', margin, y, 60, 20);
    } catch (e) { /* skip if image fails */ }
  }

  // Signature line
  doc.setDrawColor(50, 50, 100);
  doc.line(margin, y + 25, margin + 70, y + 25);
  doc.line(margin + 90, y + 25, margin + 160, y + 25);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 100);
  doc.text('Signature du boutefeu', margin, y + 29);
  doc.text('Date: ' + (journal.signature_date || journal.date_tir || ''), margin + 90, y + 29);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 20, 40);
  doc.text(`${journal.boutefeu_prenom} ${journal.boutefeu_nom}`.trim() || 'N/D', margin, y + 35);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 100);
  doc.text(`Cert. CSTC: ${journal.boutefeu_certificat || '—'}  |  Permis SQ: ${journal.boutefeu_permis_sq || '—'}`, margin, y + 40);
  y += 45;

  // ── FOOTER ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(180, 180, 200);
    doc.line(margin, 270, pageW - margin, 270);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 150);
    doc.text('Journal de Tir — Application mobile pour boutefeux québécois', margin, 275);
    doc.text(`Page ${i} / ${pageCount}`, pageW - margin - 20, 275);
  }

  // Save
  const filename = `journal-tir-${journal.numero_tir}-${journal.date_tir || 'draft'}.pdf`;
  doc.save(filename);
}

/**
 * parser.js — Journal de Tir PLB
 * PDF text parser: parsePDFText, normalizePDFText
 * Extracted from journal-tir-v3-final.html
 */

/**
 * Detect and strip X-tab metadata format produced by pdf-import.js.
 * Input format: each line is "x1\tstr1\tx2\tstr2\t..."
 * Returns plain text with items joined by spaces.
 */
function stripXTabFormat(raw) {
  // Check if this looks like X-tab encoded format (lines starting with digits\ttext)
  if (!/^\d+\t/.test(raw.split('\n').find(l => l.trim()) || '')) return raw;
  return raw.split('\n').map(line => {
    if (!/^\d+\t/.test(line)) return line; // not an encoded line, keep as-is
    const parts = line.split('\t');
    const texts = [];
    for (let i = 1; i < parts.length; i += 2) {
      if (parts[i]) texts.push(parts[i]);
    }
    return texts.join(' ');
  }).join('\n');
}

export function normalizePDFText(raw) {
  const decoded = stripXTabFormat(raw);
  const fixes = [
    [/A\s+L[ÉE]SA\s*GE/gi, 'ALÉSAGE'],
    [/A\s+LÉSA\s*GE/gi, 'ALÉSAGE'],
    [/MA\s+SSE\b/gi, 'MASSE'],
    [/TOTA\s*L\b/gi, 'TOTAL'],
    [/CHA\s*RGEMENT/gi, 'CHARGEMENT'],
    [/FA\s+CTEUR\b/gi, 'FACTEUR'],
    [/V\s+olume\b/g, 'Volume'],
    [/V\s+ertical\b/g, 'Vertical'],
    [/Horizont\s+al\b/g, 'Horizontal'],
    [/moy\s+enne\b/gi, 'moyenne'],
    [/D[eé]ton\s+ateurs\b/gi, 'Détonateurs'],
    [/P[eé]rim[eé]\s*triques\b/gi, 'Périmétriques'],
    [/GLOBA\s*L\b/gi, 'GLOBAL'],
    [/vol[eé]\s*e\b/gi, 'volée'],
    [/Banquet\s*te\b/gi, 'Banquette'],
    [/fon\s*c[eé]e\b/gi, 'foncée'],
    [/Alesage\b/g, 'Alésage'],
    [/V\s+olume\s+t\s+héorique/gi, 'Volume théorique'],
    [/t\s+héorique/gi, 'théorique'],
    [/explosiV\s+e\b/gi, 'explosive'],
    [/explosiv\s+e\b/gi, 'explosive'],
    [/t\s+rou\b/gi, 'trou'],
    [/t\s+rous\b/gi, 'trous'],
    [/charg\s+ée\b/gi, 'chargée'],
    [/Charge\s+explosiv\s+e/gi, 'Charge explosive'],
    [/Fact\s+eur\b/gi, 'Facteur'],
    [/t\s+ir\b/gi, 'tir'],
    [/t\s+ot\s+al\b/gi, 'total'],
    [/A\s+ngle\b/gi, 'Angle'],
    [/orient\s+at\s+ion/gi, 'orientation'],
    [/Sy\s+st\s+ème/gi, 'Système'],
    [/initiat\s+ion/gi, 'initiation'],
    [/d[eé]tonat\s+eurs/gi, 'détonateurs'],
    [/UNI\s+TRONIC/gi, 'UNITRONIC'],
    [/UNITRONI\s+C/gi, 'UNITRONIC'],
    [/Élect\s+ronique/gi, 'Électronique'],
    [/PA\s+R\b/g, 'PAR'],
    [/Qtés\s+PA\s+R/g, 'Qtés PAR'],
    [/V\s+ert\s+ical/gi, 'Vertical'],
    [/Charge\s+explos[iî]v[eE]\s+tot\s*ale/gi, 'Charge explosive totale'],
    [/Charge\s+unit\s*aire\s+\(FOND\)/gi, 'Charge unitaire (FOND)'],
    [/Fact\s+eur\s+charge\s+t\s*héorique/gi, 'Facteur charge théorique'],
    [/PÉRIMÉT\s*RIQUES/g, 'PÉRIMÉTRIQUES'],
  ];
  let t = decoded;
  for (const [pat, rep] of fixes) t = t.replace(pat, rep);
  return t;
}

function frNum(str) {
  if (!str) return null;
  return parseFloat(str.replace(',', '.')) || null;
}

function detectZone(allText) {
  if (/ZONE\s+TUNNEL/i.test(allText)) return 'TUNNEL';
  if (/ZONE\s+BANQUETTE/i.test(allText)) return 'BANQUETTE';
  return 'INCONNU';
}

/**
 * Extract personnel names using column-position approach.
 * Handles PDF layouts where CONÇU PAR : and DESSINÉ PAR : appear on one line,
 * with names on the next line in matching column positions.
 * Handles both plain text (old format) and X-tab encoded format from pdf-import.js.
 * X-tab format: each line is "x1\tstr1\tx2\tstr2\t..."
 */
function extractPersonnelFromPDF(rawText) {
  const lines = rawText.split('\n');
  const result = {};
  const isXTab = /^\d+\t/.test(lines.find(l => l.trim()) || '');

  /**
   * Parse an X-tab encoded line into [{x, str}] pairs.
   */
  function parseXTabLine(line) {
    if (!/^\d+\t/.test(line)) return null;
    const parts = line.split('\t');
    const items = [];
    for (let i = 0; i < parts.length - 1; i += 2) {
      const x = parseFloat(parts[i]);
      const str = parts[i + 1] || '';
      if (str.trim()) items.push({ x, str });
    }
    return items;
  }

  /**
   * Find the value at a given X position (±tolerance) in an X-tab items array.
   */
  function findAtX(items, targetX, tol = 20) {
    const found = items.filter(it => Math.abs(it.x - targetX) <= tol);
    found.sort((a, b) => Math.abs(a.x - targetX) - Math.abs(b.x - targetX));
    return found[0] ? found[0].str.trim() : null;
  }

  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    if (/CON[ÇC]U\s+PAR\s*:/i.test(line)) {
      let nameLineIdx = i + 1;
      while (nameLineIdx < lines.length && !lines[nameLineIdx].trim()) nameLineIdx++;
      const nameLine = lines[nameLineIdx] || '';

      if (isXTab) {
        // X-tab format: match by X position
        const labelItems = parseXTabLine(line);
        const nameItems = parseXTabLine(nameLine);
        if (labelItems && nameItems) {
          const concuItem = labelItems.find(it => /CON[ÇC]U\s+PAR/i.test(it.str));
          const desItem = labelItems.find(it => /DESSIN[ÉE]\s+PAR/i.test(it.str));
          if (concuItem && !result.concuPar) {
            const name = findAtX(nameItems, concuItem.x);
            if (name && /[A-Za-zÀ-ü]/.test(name) && !/^\d{4}/.test(name)) result.concuPar = name;
          }
          if (desItem && !result.dessinePar) {
            const name = findAtX(nameItems, desItem.x);
            if (name && /[A-Za-zÀ-ü]/.test(name) && !/^\d{4}/.test(name)) result.dessinePar = name;
          }
        }
      } else {
        // Plain text format: use character position (legacy)
        const concuPos = line.search(/CON[ÇC]U\s+PAR\s*:/i);
        const desPos = line.search(/DESSIN[ÉE]\s+PAR\s*:/i);
        if (concuPos >= 0 && !result.concuPar) {
          const concuArea = nameLine.substring(concuPos).trim();
          const concuName = concuArea.split(/\s{3,}/)[0].trim();
          if (concuName && /[A-Za-zÀ-ü]/.test(concuName)) result.concuPar = concuName;
        }
        if (desPos >= 0 && !result.dessinePar) {
          const desArea = nameLine.substring(desPos).trim();
          const desName = desArea.split(/\s{3,}/)[0].trim();
          if (desName && /[A-Za-zÀ-ü]/.test(desName)) result.dessinePar = desName;
        }
      }
    }

    if (/V[ÉE]RIFI[ÉE]\s+PAR\s*:/i.test(line) && !result.verifiePar) {
      let nameLineIdx = i + 1;
      while (nameLineIdx < lines.length && !lines[nameLineIdx].trim()) nameLineIdx++;
      const nameLine = lines[nameLineIdx] || '';

      if (isXTab) {
        const labelItems = parseXTabLine(line);
        const nameItems = parseXTabLine(nameLine);
        if (labelItems && nameItems) {
          const verifItem = labelItems.find(it => /V[ÉE]RIFI[ÉE]\s+PAR/i.test(it.str));
          if (verifItem) {
            const name = findAtX(nameItems, verifItem.x);
            if (name && /[A-Za-zÀ-ü]/.test(name) && !/^\d{4}/.test(name)) result.verifiePar = name;
          }
        }
      } else {
        const verifPos = line.search(/V[ÉE]RIFI[ÉE]\s+PAR\s*:/i);
        if (verifPos >= 0) {
          const verifArea = nameLine.substring(verifPos).trim();
          const verifName = verifArea.split(/\s{3,}/)[0].trim();
          if (verifName && /[A-Za-zÀ-ü]/.test(verifName)) result.verifiePar = verifName;
        }
      }
    }
  }
  return result;
}

/**
 * For BANQUETTE multi-scenario tables, find the scenario column index
 * that matches the trousMasse count of the current shot.
 * Returns -1 if not found.
 */
function findBanquetteScenarioIdx(rawText, trousMasse) {
  if (!trousMasse) return -1;
  const masseRowPat = /Nombre\s+de\s+trous\s+charg[eé]s\s*-\s*([\d\s]+)\n\s+\[un\]/i;
  const m = masseRowPat.exec(rawText);
  if (!m) return -1;
  const masseVals = (m[1].match(/\d+/g) || []).map(Number);
  const colIdx = masseVals.indexOf(trousMasse);
  if (colIdx < 0) return -1;
  return Math.floor(colIdx / 3); // Each scenario has 3 sub-columns: cut, masse, tampon
}

export function parsePDFText(rawText) {
  const t = normalizePDFText(rawText);
  const ext = {};
  const conf = {};
  ext._confidence = conf;

  // 1. Zone
  ext.zone = detectZone(t);

  // 2. Drawing number
  let m = t.match(/(\d{7}-\d{6}-\d+[A-Z]+-DWG-\d{4})/);
  if (m) { ext.dessinNo = m[1]; conf.dessinNo = 'high'; }

  // Revision — try adjacent "RÉV. R00" first, then standalone R00 near drawing number
  m = t.match(/R[ÉE]V\.?\s*(R\d{2})\b/);
  if (!m) m = t.match(/\bRÉV\.\s*\n\s*(R\d{2})\b/);
  if (!m) m = t.match(/(?:FEUILLE|FORMAT|RÉV)[^\n]*\n[^\n]*(R\d{2})\b/i);
  if (m) { ext.revision = m[1]; conf.revision = 'high'; }

  // Date
  m = t.match(/DATE\s*[:\s]\s*(\d{2}-\d{2}-\d{4})/);
  if (!m) m = t.match(/\b(\d{2}-\d{2}-\d{4})\b/);
  if (m) {
    const parts = m[1].split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      ext.date = `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else {
      ext.date = m[1];
    }
    conf.date = 'high';
  }

  // Project
  m = t.match(/STATION\s+([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ\w\s]+(?:–|-)\s*LOT\s*\w+)/i);
  if (!m) m = t.match(/PROJET\s*[:\s]+([^\n]+?)(?:\s{3,}|TITRE|CLIENT)/i);
  if (!m) m = t.match(/STATION\s+([A-Za-zÀ-ü\s]+?)\s*(?:–|-)\s*LOT\s*(\w+)/i);
  if (m) {
    let proj = m[0].replace(/PROJET\s*[:\s]+/i, '').trim();
    const stMatch = t.match(/STATION\s+([\w\s]+?)\s*[–\-]\s*LOT\s*(\w+)/i);
    if (stMatch) proj = `STATION ${stMatch[1].trim()} – LOT ${stMatch[2]}`;
    ext.projet = proj.trim();
    conf.projet = 'high';
  }

  // 3. Shot ID
  if (ext.zone === 'BANQUETTE') {
    m = t.match(/Tir\s+(\d+)\s*[–\-]\s*Banquette\s+(\d+)/i);
    if (!m) m = t.match(/Tir\s+(\d+)\s+B-(\d+)/i);
    if (m) {
      ext.shotId = `Tir ${m[1]} B-${m[2]}`;
      ext.tirNum = m[1];
      ext.banquetteNum = m[2];
      conf.shotId = 'high';
    }
  } else if (ext.zone === 'TUNNEL') {
    m = t.match(/Tir\s+(DL-\d+)/i);
    if (!m) m = t.match(/DL-(\d+)/i);
    if (m) {
      const dlNum = m[1].startsWith('DL-') ? m[1] : `DL-${m[1]}`;
      ext.shotId = `Tir ${dlNum}`;
      ext.tirNum = dlNum;
      conf.shotId = 'high';
    }
    m = t.match(/TITRE\s*[:\s]+[^\n]*?(DL-\d+)/i);
    if (m) {
      ext.shotId = `Tir ${m[1]}`;
      ext.tirNum = m[1];
      conf.shotId = 'high';
    }
  }

  // 4. Personnel — use column-position approach for multi-column PDFs
  const personnel = extractPersonnelFromPDF(rawText);
  if (personnel.concuPar) { ext.concuPar = personnel.concuPar; conf.concuPar = 'high'; }
  if (personnel.dessinePar) { ext.dessinePar = personnel.dessinePar; conf.dessinePar = 'high'; }
  if (personnel.verifiePar) { ext.verifiePar = personnel.verifiePar; conf.verifiePar = 'high'; }
  // Fallback: same-line regex
  if (!ext.concuPar) {
    m = t.match(/CON[ÇC]U\s+PAR\s*[:\s]+([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ][A-Za-zÀ-ü\s,.\-]+?)(?=\s{2,}|DESSIN[ÉE]|V[ÉE]RIFI[ÉE]|$)/i);
    if (m) { ext.concuPar = m[1].trim(); conf.concuPar = 'high'; }
  }
  if (!ext.dessinePar) {
    m = t.match(/DESSIN[ÉE]\s+PAR\s*[:\s]+([A-Za-zÀ-ü][A-Za-zÀ-ü\s,.\-]+?)(?=\s{2,}|V[ÉE]RIFI[ÉE]|APPROUV|$)/i);
    if (m) { ext.dessinePar = m[1].trim(); conf.dessinePar = 'high'; }
  }

  // 5. Hole counts
  m = t.match(/(\d+)\s+trous?\s+de\s+masse/i);
  if (m) { ext.trousMasse = parseInt(m[1]); conf.trousMasse = 'high'; }
  m = t.match(/(\d+)\s+trous?\s+(?:de\s+)?bouchon/i);
  if (m) { ext.trousBouchon = parseInt(m[1]); conf.trousBouchon = 'high'; }
  m = t.match(/(\d+)\s+trous?\s+satellite/i);
  if (m) { ext.trousSatellite = parseInt(m[1]); conf.trousSatellite = 'medium'; }
  m = t.match(/(\d+)\s+trous?\s+tampons?/i);
  if (m) { ext.trousTampon = parseInt(m[1]); conf.trousTampon = 'high'; }

  // Tunnel-specific hole counts
  if (ext.zone === 'TUNNEL') {
    m = t.match(/(\d+)\s+trous?\s+p[eé]rim[eé]triques/i);
    if (m) { ext.trousPerim = parseInt(m[1]); conf.trousPerim = 'high'; }
    m = t.match(/(\d+)\s+trous?\s+de\s+plancher/i);
    if (!m) m = t.match(/(\d+)\s+trous?\s+(?:LIFTER|lifters?|plancher)/i);
    if (m) { ext.trousLifter = parseInt(m[1]); conf.trousLifter = 'high'; }
    m = t.match(/Qté\.?\s+trous?\s+ALÉSAGE\s+\[un\]\s+(\d+)/i);
    if (!m) m = t.match(/ALÉSAGE\s+\[un\]\s+(\d+)/i);
    if (m) { ext.trousAlésage = parseInt(m[1]); conf.trousAlésage = 'high'; }
    m = t.match(/Qté\.?\s+trous?\s+TOTAL\s*\/\s*volée\s+\[un\]\s+(\d+)/i);
    if (!m) m = t.match(/TOTAL\/volée\s+\[un\]\s+(\d+)/i);
    if (!m) m = t.match(/(\d+)\s+trous?\s+TOTAL\s*\/?volée/i);
    if (m) { ext.totalTrous = parseInt(m[1]); conf.totalTrous = 'high'; }
  }

  // Total calculated
  if (!ext.totalTrous) {
    const sum = (ext.trousMasse||0) + (ext.trousBouchon||0) +
                (ext.trousSatellite||0) + (ext.trousTampon||0) +
                (ext.trousPerim||0) + (ext.trousLifter||0) + (ext.trousAlésage||0);
    if (sum > 0) { ext.totalTrous = sum; conf.totalTrous = 'medium'; }
  }

  // 6. Drilling parameters
  m = t.match(/Prof\.\s*\(for[eé]e\)\s*:\s*([\d,\.]+)\s*m/i);
  if (!m) m = t.match(/Prof\.\s*\(for[eé]e\)\s*[:\s]+([\d,.]+)\s*m/i);
  if (m) { ext.profForee = frNum(m[1]); conf.profForee = 'high'; }
  if (!ext.profForee) {
    m = t.match(/Profondeur\s+moyenne\s+des\s+trous\s+\[m\]\s+([\d,.]+)/i);
    if (m) { ext.profForee = frNum(m[1]); conf.profForee = 'medium'; }
  }

  // Facteur de chargement
  m = t.match(/Facteur\s+de\s+chargement\s*:\s*([\d,\.]+)\s*kg\/m/i);
  if (m) { ext.facteurChargement = frNum(m[1]); conf.facteurChargement = 'high'; }
  if (!ext.facteurChargement) {
    m = t.match(/Facteur\s+de\s+chargement\s*[:\s]+([0-9,\.]+)\s*kg\/m[³3]/i);
    if (m) { ext.facteurChargement = frNum(m[1]); conf.facteurChargement = 'medium'; }
  }

  // Advance (tunnel)
  m = t.match(/(?:Longueur\s+d['']avance\s*\/\s*vol[eé]e|Avance\s*\/\s*vol[eé]e)\s+\[m\]\s+([\d,.]+)/i);
  if (!m) m = t.match(/Avance\s+([\d,.]+)\s*m\b/i);
  if (m) { ext.avance = frNum(m[1]); conf.avance = 'high'; }

  // Drill diameter
  m = t.match(/Forage\s+Ø\s*(\d+)\s*mm/i);
  if (!m) m = t.match(/Diamètre\s+de\s+forage[^\n]*?\[mm\][^\n]*?(\d{2})\b/i);
  if (!m) m = t.match(/\[mm\]\s+(51|41)\b/);
  if (m) { ext.diametreMm = parseInt(m[1]); conf.diametreMm = 'high'; }

  // Hauteur du banc
  m = t.match(/Hauteur\s+du\s+banc\s+\[m\]\s+([\d,.]+)/i);
  if (m) { ext.hauteurBanc = frNum(m[1]); conf.hauteurBanc = 'high'; }

  // 7. Explosives
  const expTypes = [];
  const expMatches = [...t.matchAll(/(Power[Dd]itch|Power[Ff]rac|Power[Cc]ord[\s\-]?\d*)/gi)];
  for (const em of expMatches) {
    const name = em[1].trim().replace(/\s+/g,' ');
    if (!expTypes.find(e => e.toLowerCase() === name.toLowerCase())) expTypes.push(name);
  }
  if (/DYNO\s+INERT\s+STEMMING/i.test(t)) expTypes.push('DYNO INERT STEMMING SL');
  if (expTypes.length) { ext.explosifsDetectes = expTypes; conf.explosifsDetectes = 'high'; }

  // Detonator
  if (/UNITRONIC/i.test(t)) {
    ext.detonateur = 'UNITRONIC (Électronique)';
    ext.firingSys = 'unitronic';
    conf.detonateur = 'high';
  } else if (/edev|eDev/i.test(t)) {
    ext.detonateur = 'eDev II'; ext.firingSys = 'edev2';
  }

  // Matelas
  if (/matelas/i.test(t) && /OUI/i.test(t)) ext.matelas = 'OUI (min. 3 épaisseurs)';

  // 8. Loading summary — zone-specific parsing
  if (ext.zone === 'TUNNEL') {
    m = t.match(/Charge\s+totale\s*\/\s*vol[eé]e\s+\[kg\]\s*([\d,.]+)/i);
    if (!m) m = t.match(/Charge\s+explosive\s+totale\s+\[kg\]\s*([0-9,.]+)/i);
    if (m) { ext.chargeTotaleKg = frNum(m[1]); conf.chargeTotaleKg = 'high'; }

    m = t.match(/FACTEUR\s+DE\s+CHARGEMENT\s+\(GLOBAL\)\s+\[kg\/m[³3]\]\s*([\d,.]+)/i);
    if (!m) m = t.match(/Facteur\s+de\s+chargement\s+\(par\s+tir\)\s+\[kg\/m[³3]\]\s*([\d,.]+)/i);
    if (m) { ext.facteurTir = frNum(m[1]); conf.facteurTir = 'high'; }

    m = t.match(/Détonateurs\s+UNITRONIC\s+\[un\]\s+([\d.]+)/i);
    if (m) { ext.nbDetonateurs = parseInt(m[1]); conf.nbDetonateurs = 'high'; }

  } else {
    // BANQUETTE: multi-column table
    const trousMasse = ext.trousMasse || 0;
    const scenarioIdx = findBanquetteScenarioIdx(rawText, trousMasse);

    // chargeMatch: value may be on same line (Y-sorted pdfjs) or on next line (old format)
    const chargeMatch = t.match(/Charge\s+explosive\s+totale\s+\[kg\]\s+([\d\s.]+)/i);
    const chargeVals = chargeMatch ?
      (chargeMatch[1].match(/\d+\.?\d*/g) || []).map(Number).filter(v => v > 10) : [];

    if (scenarioIdx >= 0 && scenarioIdx < chargeVals.length) {
      ext.chargeTotaleKg = chargeVals[scenarioIdx];
      conf.chargeTotaleKg = 'high';
    } else if (chargeVals.length === 1) {
      // Single value scenario (already Y-sorted, only one column shown)
      ext.chargeTotaleKg = chargeVals[0];
      conf.chargeTotaleKg = 'high';
    } else {
      const detChargeMatch = t.match(/DÉTAILS\s*\/\s*ZONE\s+DE\s+TIR[\s\S]*?Charge\s+explosive\s+totale\s+\[kg\]\s+([\d,.]+)/i);
      if (detChargeMatch) { ext.chargeTotaleKg = frNum(detChargeMatch[1]); conf.chargeTotaleKg = 'high'; }
    }

    // facteurTir: handle [kg/m 3 ] (with space) from pdfjs, in addition to [kg/m³]
    const factDetMatch = t.match(/DÉTAILS\s*\/\s*ZONE\s+DE\s+TIR[\s\S]*?Facteur\s+de\s+chargement\s+\(par\s+t[iu]r\)\s+\[kg\/m[³3\s]*\]\s+([\d,\.]+)/i);
    if (factDetMatch) {
      ext.facteurTir = frNum(factDetMatch[1]); conf.facteurTir = 'high';
    } else {
      const factMultiMatch = t.match(/Facteur\s+de\s+chargement\s+\(par[\s\S]*?\[kg\/m[³3\s]*\]\s*([\d\s.,]+)/i);
      if (factMultiMatch && scenarioIdx >= 0) {
        const factVals = (factMultiMatch[1].match(/[\d.]+/g) || []).map(Number).filter(v => v > 0.1 && v < 5);
        if (scenarioIdx < factVals.length) { ext.facteurTir = factVals[scenarioIdx]; conf.facteurTir = 'high'; }
      }
      if (!ext.facteurTir && ext.facteurChargement) {
        ext.facteurTir = ext.facteurChargement; conf.facteurTir = 'medium';
      }
    }

    if (scenarioIdx >= 0) {
      const espMatch = rawText.match(/Espacement\s+\[m\]\s+([\d\.\s]+)/i);
      if (espMatch) {
        const espVals = (espMatch[1].match(/[\d.]+/g) || []).map(Number).filter(v => v > 0 && v < 5);
        const masseRowPat = /Nombre\s+de\s+trous\s+charg[eé]s\s*-\s*([\d\s]+)\n\s+\[un\]/i;
        const mMatch = masseRowPat.exec(rawText);
        if (mMatch) {
          const masseVals = (mMatch[1].match(/\d+/g) || []).map(Number);
          const colIdx = masseVals.indexOf(trousMasse);
          if (colIdx >= 0 && colIdx < espVals.length) {
            ext.espacement = espVals[colIdx]; conf.espacement = 'high';
          }
        }
      }
    }

    if (!ext.volume) {
      m = t.match(/Volume\s+\[m[³3]?\s*\]\s+([\d,.]+)/i);
      if (m) { ext.volume = frNum(m[1]); conf.volume = 'high'; }
    }
    if (!ext.volume && scenarioIdx >= 0) {
      const detMatch = rawText.match(/DÉTAILS \/ ZONE DE TIR([\s\S]*?)Nombre de trous charg/i);
      if (detMatch) {
        const vol3Match = detMatch[1].match(/3\n\s+\[m \]\s+([\d\.\s]+)/);
        if (vol3Match) {
          const volVals = (vol3Match[1].match(/[\d.]+/g) || []).map(Number);
          if (scenarioIdx < volVals.length) { ext.volume = volVals[scenarioIdx]; conf.volume = 'high'; }
        }
      }
    }

    if (!ext.largeur && scenarioIdx >= 0) {
      const detMatch = rawText.match(/DÉTAILS \/ ZONE DE TIR([\s\S]*?)Nombre de trous charg/i);
      if (detMatch) {
        const mRows = [...detMatch[1].matchAll(/\[m\]\s+([\d\.\s]+)/g)];
        if (mRows.length >= 2) {
          const largVals = (mRows[1][1].match(/[\d.]+/g) || []).map(Number).filter(v => v > 0 && v < 100);
          if (scenarioIdx < largVals.length) { ext.largeur = largVals[scenarioIdx]; conf.largeur = 'high'; }
        }
      }
    }
  }

  // PowerDitch quantities
  m = t.match(/Powerditch\s*-\s*32[^\n]*?\[kg\]\s*([\d,.]+)/i);
  if (m) ext.powerditch32Kg = frNum(m[1]);
  m = t.match(/PowerFrac\s*-\s*25[^\n]*?\[kg\]\s*([\d,.]+)/i);
  if (m) ext.powerfrac25Kg = frNum(m[1]);
  m = t.match(/PowerCord\s*200[^\n]*?\[m\]\s*([\d,.]+)/i);
  if (m) ext.powercord200m = frNum(m[1]);

  // 9. Zone dimensions
  // Unit notation may include spaces from pdfjs: "[m 2 ]" instead of "[m²]", "[m 3 ]" instead of "[m³]"
  if (!ext.largeur) {
    m = t.match(/Largeur\s+\[m\]\s*([\d,.]+)/i);
    if (m) { ext.largeur = frNum(m[1]); conf.largeur = 'high'; }
  }
  if (!ext.longueur) {
    m = t.match(/Longueur\s+\[m\]\s*([\d,.]+)/i);
    if (m) { ext.longueur = frNum(m[1]); conf.longueur = 'high'; }
  }
  m = t.match(/Superficie\s+\[m[²2\s]*\]\s*([\d,.]+)/i);
  if (!m) m = t.match(/Surface\s+\(aire\)\s+du\s+tir\s+\[m[²2\s]*\]\s*([\d,.]+)/i);
  if (m) { ext.superficie = frNum(m[1]); conf.superficie = 'high'; }
  if (!ext.volume) {
    m = t.match(/Volume\s+roc\s*\/\s*vol[eé]e\s+\[m[³3\s]*\]\s*([\d,.]+)/i);
    if (!m) m = t.match(/Volume\s+\[m[³3\s]*\]\s*([\d,.]+)/i);
    if (m) {
      const v = frNum(m[1]);
      if (v && v > 10) { ext.volume = v; conf.volume = 'high'; }
    }
  }

  // 10. Vibrations
  const ppvMatches = [...t.matchAll(/P\s*:\s*([\d.]+)\s*mm\/s/gi)];
  if (ppvMatches.length) {
    const ppvVals = ppvMatches.map(pm => parseFloat(pm[1])).filter(v => !isNaN(v));
    ext.ppvValues = ppvVals; ext.ppvMax = Math.max(...ppvVals); conf.ppvValues = 'high';
  }
  const ppvMatches2 = [...t.matchAll(/([\d.]+)\s*mm\/s/g)];
  if (ppvMatches2.length) {
    const ppvVals2 = ppvMatches2.map(pm => parseFloat(pm[1])).filter(v => !isNaN(v) && v < 200);
    if (ppvVals2.length && (!ext.ppvValues || ppvVals2.length > ext.ppvValues.length)) {
      ext.ppvValues = ppvVals2; ext.ppvMax = Math.max(...ppvVals2); conf.ppvValues = 'high';
    }
  }

  // 11. Spacing / burden
  if (!ext.espacement) {
    m = t.match(/Espacement\s+\[m\]\s+([\d,.]+)/i);
    if (m) { ext.espacement = frNum(m[1]); conf.espacement = 'high'; }
  }
  m = t.match(/Fardeau\s+\[m\]\s+([\d,.]+)/i);
  if (m) { ext.fardeau = frNum(m[1]); conf.fardeau = 'high'; }
  // BANQUETTE: fardeau unlabeled row — appears before "Espacement [m]"
  // In DWG-3002 style, the fardeau row has no label in the extracted text
  if (!ext.fardeau && ext.zone === 'BANQUETTE') {
    // Find the unlabeled [m] row immediately preceding the Espacement row
    const espBeforeMatch = rawText.match(/\[m\]\s+([\d\.\s]+)\s*\n\s*\n?\s*Espacement\s+\[m\]/i);
    if (espBeforeMatch) {
      const fardeauVals = (espBeforeMatch[1].match(/[\d.]+/g) || []).map(Number).filter(v => v > 0 && v < 5);
      // Use the same column index as espacement (based on trousMasse)
      const trousMasse2 = ext.trousMasse || 0;
      if (trousMasse2 > 0 && fardeauVals.length > 0) {
        const masseRowPat2 = /Nombre\s+de\s+trous\s+charg[eé]s\s*-\s*([\d\s]+)\n\s+\[un\]/i;
        const mMatch2 = masseRowPat2.exec(rawText);
        if (mMatch2) {
          const masseVals2 = (mMatch2[1].match(/\d+/g) || []).map(Number);
          const colIdx2 = masseVals2.indexOf(trousMasse2);
          if (colIdx2 >= 0 && colIdx2 < fardeauVals.length) {
            ext.fardeau = fardeauVals[colIdx2]; conf.fardeau = 'high';
          }
        }
      }
      if (!ext.fardeau && fardeauVals.length > 0) {
        ext.fardeau = fardeauVals[0]; conf.fardeau = 'medium';
      }
    }
  }
  m = t.match(/Sous-forage\s+\[m\]\s+([\d,.]+)/i);
  if (m) { ext.sousFogage = frNum(m[1]); conf.sousFogage = 'medium'; }
  m = t.match(/Collet\s+\(total\)\s+dans\s+le\s+roc\s+\[m\]\s+([\d,.]+)/i);
  if (!m) m = t.match(/Collet\s+\(tot\s*al\)\s+dans\s+le\s+roc\s+\[m\]\s+([\d,.]+)/i);
  if (m) { ext.colletTotal = frNum(m[1]); conf.colletTotal = 'medium'; }

  // Normalize undefined fields to null for consistency
  if (ext.longueur === undefined) ext.longueur = null;

  return ext;
}

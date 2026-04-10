/**
 * parser.test.mjs — Journal de Tir PLB
 * Tests for js/parser.js using real extracted PDF text files
 * Run with: node tests/parser.test.mjs
 */

import { parsePDFText } from '../js/parser.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCRATCH = '/workspace/scratch';

// ============================================================
// TEST FRAMEWORK
// ============================================================
let passed = 0;
let failed = 0;
let total = 0;

function test(label, actual, expected, tolerance) {
  total++;
  let ok = false;
  if (tolerance !== undefined && typeof actual === 'number' && typeof expected === 'number') {
    ok = Math.abs(actual - expected) <= tolerance;
  } else if (expected === null || expected === undefined) {
    ok = actual === expected;
  } else {
    ok = String(actual) === String(expected);
  }
  const status = ok ? '✅ PASS' : '❌ FAIL';
  if (ok) passed++; else failed++;
  console.log(`  ${status} ${label}: got=${JSON.stringify(actual)} expected=${JSON.stringify(expected)}`);
}

function testContains(label, actual, expectedSubstr) {
  total++;
  const ok = typeof actual === 'string' && actual.toLowerCase().includes(expectedSubstr.toLowerCase());
  const status = ok ? '✅ PASS' : '❌ FAIL';
  if (ok) passed++; else failed++;
  console.log(`  ${status} ${label}: got=${JSON.stringify(actual)} expected_contains=${JSON.stringify(expectedSubstr)}`);
}

function testGte(label, actual, minVal) {
  total++;
  const ok = typeof actual === 'number' && actual >= minVal;
  const status = ok ? '✅ PASS' : '❌ FAIL';
  if (ok) passed++; else failed++;
  console.log(`  ${status} ${label}: got=${JSON.stringify(actual)} expected_gte=${minVal}`);
}

// ============================================================
// LOAD REAL TEXT FILES
// ============================================================
const text3002 = readFileSync(join(SCRATCH, 'blast-plan-text.txt'), 'utf8');
const text3003 = readFileSync(join(SCRATCH, 'dwg3003_text.txt'), 'utf8');
const text3018 = readFileSync(join(SCRATCH, 'dwg3018_text.txt'), 'utf8');

// ============================================================
// TEST DWG-3002 (Provencher, BANQUETTE, Tir 13 B-9)
// ============================================================
console.log('\n========================================');
console.log('DWG-3002 — Provencher — Tir 13 B-9');
console.log('========================================');
const r3002 = parsePDFText(text3002);
console.log('Zone:', r3002.zone);
console.log('Shot ID:', r3002.shotId);
console.log('Projet:', r3002.projet);
console.log('Dessin No:', r3002.dessinNo);
console.log('Date:', r3002.date);
console.log('Trous masse:', r3002.trousMasse);
console.log('Trous bouchon:', r3002.trousBouchon);
console.log('Trous satellite:', r3002.trousSatellite);
console.log('Total trous:', r3002.totalTrous);
console.log('Prof. forée:', r3002.profForee);
console.log('Facteur charg:', r3002.facteurChargement);
console.log('Diamètre:', r3002.diametreMm);
console.log('Explosifs:', r3002.explosifsDetectes);
console.log('Détonateur:', r3002.detonateur);
console.log('Charge totale:', r3002.chargeTotaleKg);
console.log('Facteur tir:', r3002.facteurTir);
console.log('Largeur:', r3002.largeur);
console.log('Longueur:', r3002.longueur);
console.log('Volume:', r3002.volume);
console.log('PPV values:', r3002.ppvValues);
console.log('PPV max:', r3002.ppvMax);
console.log('Espacement:', r3002.espacement);
console.log('Fardeau:', r3002.fardeau);
console.log('Conçu par:', r3002.concuPar);
console.log('Dessiné par:', r3002.dessinePar);
console.log();

test('zone', r3002.zone, 'BANQUETTE');
test('shotId', r3002.shotId, 'Tir 13 B-9');
testContains('projet', r3002.projet, 'PROVENCHER');
testContains('dessinNo', r3002.dessinNo, 'DWG-3002');
test('date', r3002.date, '2026-03-30');
test('trousMasse', r3002.trousMasse, 134);
test('trousBouchon', r3002.trousBouchon, 13);
test('trousSatellite', r3002.trousSatellite, 20);
test('totalTrous', r3002.totalTrous, 167);
test('profForee', r3002.profForee, 2.6);
test('facteurChargement', r3002.facteurChargement, 0.956);
test('diametreMm', r3002.diametreMm, 51);
testContains('explosifsDetectes[0]', (r3002.explosifsDetectes||[''])[0], 'PowerDitch');
// Note: DWG-3002 PDF extract does not include the initiation system page
// detonateur detection skipped for this dataset — it's a PDF data limitation
test('chargeTotaleKg', r3002.chargeTotaleKg, 263);
test('facteurTir', r3002.facteurTir, 0.72);
test('largeur', r3002.largeur, 10.9, 0.5);
test('longueur', r3002.longueur, null);
test('volume', r3002.volume, 362.75, 1);
testGte('ppvValues.length', (r3002.ppvValues||[]).length, 5);
test('ppvMax', r3002.ppvMax, 40.13, 1);
test('espacement', r3002.espacement, 1.01, 0.05);
test('fardeau', r3002.fardeau, 0.94, 0.05);
testContains('concuPar', r3002.concuPar||'', 'BOSCO');
testContains('dessinePar', r3002.dessinePar||'', 'Alexis');

// ============================================================
// TEST DWG-3003 (Lacordaire, TUNNEL, Tir DL-06)
// ============================================================
console.log('\n========================================');
console.log('DWG-3003 — Lacordaire — Tir DL-06');
console.log('========================================');
const r3003 = parsePDFText(text3003);
console.log('Zone:', r3003.zone);
console.log('Shot ID:', r3003.shotId);
console.log('Projet:', r3003.projet);
console.log('Dessin No:', r3003.dessinNo);
console.log('Date:', r3003.date);
console.log('Trous périm:', r3003.trousPerim);
console.log('Trous masse:', r3003.trousMasse);
console.log('Trous lifter:', r3003.trousLifter);
console.log('Trous alésage:', r3003.trousAlésage);
console.log('Total trous:', r3003.totalTrous);
console.log('Avance:', r3003.avance);
console.log('Diamètre:', r3003.diametreMm);
console.log('Explosifs:', r3003.explosifsDetectes);
console.log('Nb détonateurs:', r3003.nbDetonateurs);
console.log('Charge totale:', r3003.chargeTotaleKg);
console.log('Facteur tir:', r3003.facteurTir);
console.log('Détonateur:', r3003.detonateur);
console.log('Conçu par:', r3003.concuPar);
console.log('Dessiné par:', r3003.dessinePar);
console.log();

test('zone', r3003.zone, 'TUNNEL');
testContains('shotId', r3003.shotId||'', 'DL-06');
testContains('projet', r3003.projet||'', 'LACORDAIRE');
testContains('dessinNo', r3003.dessinNo||'', 'DWG-3003');
test('date', r3003.date, '2026-04-01');
testGte('trousPerim', r3003.trousPerim||0, 10);
testGte('trousMasse', r3003.trousMasse||0, 5);
testGte('totalTrous', r3003.totalTrous||0, 50);
testGte('avance', r3003.avance||0, 1.0);
testGte('diametreMm', r3003.diametreMm||0, 41);
testContains('explosifsDetectes[0]', (r3003.explosifsDetectes||[''])[0], 'Power');
testContains('detonateur', r3003.detonateur||'', 'UNITRONIC');
testGte('chargeTotaleKg', r3003.chargeTotaleKg||0, 50);
testGte('facteurTir', r3003.facteurTir||0, 0.5);
testContains('concuPar', r3003.concuPar||'', 'BOSCO');

// ============================================================
// TEST DWG-3018 (BANQUETTE, Tir 18 B-10)
// ============================================================
console.log('\n========================================');
console.log('DWG-3018 — BANQUETTE — Tir 18 B-10');
console.log('========================================');
const r3018 = parsePDFText(text3018);
console.log('Zone:', r3018.zone);
console.log('Shot ID:', r3018.shotId);
console.log('Dessin No:', r3018.dessinNo);
console.log('Date:', r3018.date);
console.log('Trous masse:', r3018.trousMasse);
console.log('Trous bouchon:', r3018.trousBouchon);
console.log('Total trous:', r3018.totalTrous);
console.log('Explosifs:', r3018.explosifsDetectes);
console.log('Détonateur:', r3018.detonateur);
console.log('Charge totale:', r3018.chargeTotaleKg);
console.log('Facteur tir:', r3018.facteurTir);
console.log('Largeur:', r3018.largeur);
console.log('Volume:', r3018.volume);
console.log('Espacement:', r3018.espacement);
console.log('Fardeau:', r3018.fardeau);
console.log('Conçu par:', r3018.concuPar);
console.log();

test('zone', r3018.zone, 'BANQUETTE');
testContains('shotId', r3018.shotId||'', 'B-10');
testContains('dessinNo', r3018.dessinNo||'', 'DWG-3018');
testGte('trousMasse', r3018.trousMasse||0, 50);
testContains('explosifsDetectes[0]', (r3018.explosifsDetectes||[''])[0], 'Power');
testContains('detonateur', r3018.detonateur||'', 'UNITRONIC');
testGte('chargeTotaleKg', r3018.chargeTotaleKg||0, 100);
testGte('facteurTir', r3018.facteurTir||0, 0.5);
testContains('concuPar', r3018.concuPar||'', 'BOSCO');

// ============================================================
// SUMMARY
// ============================================================
console.log('\n========================================');
console.log(`RÉSULTATS: ${passed}/${total} tests passés`);
if (failed > 0) {
  console.log(`❌ ${failed} test(s) échoué(s)`);
  process.exit(1);
} else {
  console.log('✅ Tous les tests passent!');
}

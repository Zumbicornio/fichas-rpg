// Lê o texto extraído do SRD 5.2.1 (pdftotext) e gera srd-monstros.json
const fs = require('fs');
const raw = fs.readFileSync(process.argv[2], 'utf8').split(/\r?\n/);
const start = raw.findIndex((l, i) => i > 14000 && l.trim() === 'Monsters A-Z');
let L = raw.slice(start).map(l => l.replace(/\f/g, '').trimEnd().replace(/ ?System Reference Document 5\.2\.1$/, '').replace(/-footwide/g, '-foot-wide').replace(/(\w) � (\d)/g, '$1 × $2').replace(/([a-z])�([a-z])/g, '$1$2').replace(/�/g, '•').replace(/^Con22 /, 'Con 22 ').replace(/^Int 6 -2 2 Wis/, 'Int 6 -2 -2 Wis'));
// tira rodapés de página
L = L.filter(l => !/^\d+ System Reference Document 5\.2\.1$/.test(l.trim()) && !/^\d+$/.test(l.trim()));
const TYPE_RE = /^(Tiny|Small|Medium|Large|Huge|Gargantuan)\b[^.]*, (Lawful|Neutral|Chaotic|Unaligned|Any)[\w ]*$/;
const idx = [];
L.forEach((l, i) => { if (TYPE_RE.test(l.trim()) && i > 0 && L[i - 1].trim()) idx.push(i); });
const SECS = ['Traits', 'Actions', 'Bonus Actions', 'Reactions', 'Legendary Actions'];
const TRAIT_RE = /^[A-Z0-9][A-Za-z0-9'’\-]*(?: (?:[A-Z0-9][A-Za-z0-9'’\-]*|of|the|and|or|in|to|a|an|with|from|on|by|for))*(?: \([^)]*\))?\. /;
const out = {}, problemas = [];
for (let k = 0; k < idx.length; k++) {
  const ti = idx[k], name = L[ti - 1].trim();
  const end = k + 1 < idx.length ? idx[k + 1] - 1 : L.length;
  let body = L.slice(ti + 1, end);
  // remove títulos soltos no fim (nome repetido do próximo bloco / título de grupo)
  while (body.length) {
    const t = body[body.length - 1].trim();
    const antes = body.length > 1 ? body[body.length - 2].trim() : '';
    // título solto (nome do próximo bloco / título de grupo) só se vier depois de uma linha em branco
    if (!t || (!antes && t.length < 45 && !/[.:]$/.test(t) && /^[A-Z]/.test(t) && !/\d/.test(t) && !SECS.includes(t))) body.pop(); else break;
  }
  const secStart = body.findIndex(l => SECS.includes(l.trim()));
  const head = (secStart < 0 ? body : body.slice(0, secStart)).filter(l => l.trim() && l.trim() !== 'MOD SAVE');
  const H = head.join('\n');
  const m = (re) => { const r = H.match(re); return r ? r[1].trim() : ''; };
  const ac = m(/\bAC (\d+)/), hp = m(/\bHP (\d+ \([^)]*\)|\d+)/), speed = m(/\bSpeed ([^\n]*?)(?=\s+Initiative|\s*$)/m);
  const ini = H.match(/Initiative ([+-−]\d+) \((\d+)\)/);
  // atributos e salvaguardas
  const ab = {}, ordem = [];
  const ABRE = /\b(Str|Dex|Con|Int|Wis|Cha) (\d+)(?: ([+-]\d+) ([+-]\d+))?/g; let r;
  const semNum = H.replace(/^([+-]\d+ ){3}[+-]\d+$/gm, '');
  while ((r = ABRE.exec(semNum))) { ab[r[1]] = { v: +r[2], mod: r[3], sv: r[4] }; ordem.push(r[1]); }
  const quads = [...H.matchAll(/^([+-]\d+) ([+-]\d+) ([+-]\d+) ([+-]\d+)$/gm)].flatMap(q => [[q[1], q[2]], [q[3], q[4]]]);
  for (const a of ordem) if (!ab[a].mod) { const q = quads.shift(); if (q) { ab[a].mod = q[0]; ab[a].sv = q[1]; } }
  const A6 = ['Str', 'Dex', 'Con', 'Int', 'Wis', 'Cha'];
  const okAb = A6.every(a => ab[a] && ab[a].mod && +ab[a].mod === Math.floor((ab[a].v - 10) / 2));
  // linha de informações (Skills ... CR)
  const infoTxt = head.filter(l => !/^(AC |HP |Speed |Initiative |(Str|Dex|Con|Int|Wis|Cha) \d|[+-]\d+ [+-]\d+)/.test(l.trim()) && !/^Initiative/.test(l.trim()))
    .join(' ').replace(/\s+/g, ' ').replace(/^.*?(?=(Skills|Resistances|Vulnerabilities|Immunities|Gear|Senses|Languages|CR) )/, '');
  const info = {};
  const KEYS = ['Skills', 'Vulnerabilities', 'Resistances', 'Immunities', 'Gear', 'Senses', 'Languages', 'CR'];
  const parts = infoTxt.split(new RegExp('\\b(' + KEYS.join('|') + ') ')).slice(1);
  for (let j = 0; j + 1 < parts.length; j += 2) info[parts[j]] = parts[j + 1].trim();
  const cr = (info.CR || '').match(/^(\d+\/\d+|\d+)/);
  // seções
  const secoes = [];
  if (secStart >= 0) {
    let cur = null;
    for (const l0 of body.slice(secStart)) {
      const l = l0.trim(); if (!l) continue;
      if (SECS.includes(l)) { cur = [l, []]; secoes.push(cur); continue; }
      if (/^System Reference Document 5.2.1$/.test(l)) continue;
      const linhas = cur[1];
      const prev = linhas.length ? linhas[linhas.length - 1] : null;
      const novo = TRAIT_RE.test(l) || !prev || (cur[0] === 'Legendary Actions' && /^Legendary Action Uses/.test(l));
      if (novo) linhas.push(l);
      else if (/\d-[a-z]+-$/.test(prev)) linhas[linhas.length - 1] = prev + l;
      else if (/[a-z]-$/.test(prev) && /^[a-z]/.test(l)) linhas[linhas.length - 1] = prev.slice(0, -1) + l;
      else linhas[linhas.length - 1] = prev + ' ' + l;
    }
  }
  const rec = { nome: name, tipo: L[ti].trim(), ca: ac, pv: hp, desl: speed, ini: ini ? ini[1] + ' (' + ini[2] + ')' : '',
    atr: okAb ? A6.map(a => ab[a].v) : null, salv: okAb ? A6.map(a => ab[a].sv) : null, info, cr: cr ? cr[1] : '', secoes };
  if (!ac || !hp || !speed || !okAb || !rec.cr || !secoes.length) problemas.push(name + ' :: ' + JSON.stringify({ ac, hp, speed, okAb, cr: rec.cr, ns: secoes.length, ab }));
  if (out[name]) problemas.push('DUPLICADO ' + name);
  out[name] = rec;
}
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 0));
console.log('blocos', Object.keys(out).length, 'problemas', problemas.length);
problemas.slice(0, 40).forEach(p => console.log(' -', p.slice(0, 300)));

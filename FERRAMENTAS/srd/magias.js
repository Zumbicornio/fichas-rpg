// Gera magias.json (nome inglês -> nome em português) a partir do SPELL_DB do mesa.html.
// Uso: node magias.js "../../MESA DE RPG/mesa.html" magias.json
const fs = require('fs');
const [html, saida] = process.argv.slice(2);
if (!html || !saida) { console.error('Uso: node magias.js "../../MESA DE RPG/mesa.html" magias.json'); process.exit(1); }
const s = fs.readFileSync(html, 'utf8');
const ini = s.indexOf('const SPELL_DB = [');
if (ini < 0) { console.error('não achei "const SPELL_DB = [" no ' + html); process.exit(1); }
// cada magia começa com ['Nome PT','Nome EN',nível,...
const RE = /\[\s*(['"])((?:\\.|(?!\1).)*)\1\s*,\s*(['"])((?:\\.|(?!\3).)*)\3\s*,\s*\d+\s*,/g;
const tira = t => t.replace(/\\(.)/g, '$1');
const out = {};
RE.lastIndex = ini;
let m; while ((m = RE.exec(s))) out[tira(m[4])] = tira(m[2]);
fs.writeFileSync(saida, JSON.stringify(out, null, 1));
console.log('magias', Object.keys(out).length);

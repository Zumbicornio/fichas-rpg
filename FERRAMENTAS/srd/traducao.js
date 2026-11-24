// Lê traducao/pt-*.txt, confere com srd.json (mesmas seções e linhas) e troca nomes de magias (inglês -> PT do app de fichas).
// Uso: node traducao.js srd.json magias.json  -> grava traducao.json e mostra problemas
const fs = require('fs'), path = require('path');
const srd = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const magias = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
Object.assign(magias, { 'Vitriolic Sphere': 'Esfera Vitriólica', 'Mind Spike': 'Pico Mental', 'Charm Monster': 'Enfeitiçar Monstro',
  'Elementalism': 'Elementalismo', 'Ice Knife': 'Faca de Gelo', "Heroes' Feast": 'Banquete de Heróis' });
const nomesMag = Object.keys(magias).sort((a, b) => b.length - a.length);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE_MAG = new RegExp('\\b(' + nomesMag.map(esc).join('|') + ')\\b', 'g');
const SEC = { Traits: 'Traços', Actions: 'Ações', 'Bonus Actions': 'Ações Bônus', Reactions: 'Reações', 'Legendary Actions': 'Ações Lendárias' };
const dir = path.join(__dirname, 'traducao');
const out = {}, prob = [];
for (const f of fs.readdirSync(dir).filter(f => /^pt-\d+\.txt$/.test(f)).sort()) {
  const txt = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r/g, '');
  for (const bloco of txt.split(/^@@ /m).slice(1)) {
    const [cab, ...resto] = bloco.split('\n'); const nome = cab.trim();
    const secoes = []; let cur = null;
    for (const l of resto) { if (!l.trim()) continue; if (l.startsWith('## ')) { cur = [l.slice(3).trim(), []]; secoes.push(cur); } else if (cur) cur[1].push(l.trim().replace(RE_MAG, n => magias[n])); }
    const o = srd[nome];
    if (!o) { prob.push(f + ': nome desconhecido ' + nome); continue; }
    const esp = o.secoes.map(([t, ls]) => (SEC[t] || t) + ':' + ls.length).join(' '), tem = secoes.map(([t, ls]) => t + ':' + ls.length).join(' ');
    if (esp !== tem) prob.push(`${f}: ${nome} esperado [${esp}] veio [${tem}]`);
    secoes.forEach(([, ls]) => ls.forEach(l => { if (/\b(the|and|with|creature|damage|target)\b/.test(l)) prob.push(`${f}: ${nome} parece ter inglês: ${l.slice(0, 90)}`); }));
    out[nome] = secoes;
  }
}
fs.writeFileSync(path.join(path.dirname(process.argv[2]), 'traducao.json'), JSON.stringify(out));
console.log('traduzidos', Object.keys(out).length, 'de', Object.keys(srd).length, '| problemas', prob.length);
prob.slice(0, 30).forEach(p => console.log(' -', p));

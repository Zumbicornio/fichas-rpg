// Grava as fichas do SRD (saída do build.js) no arquivo de dados da Mesa.
// Uso: node inject.js "../../MESA DE RPG/dados-srd.js" srd-line.js
// O build.js gera uma linha "const SRD = {...};"; a Mesa carrega "window.MESA_SRD = {...};" de dados-srd.js
// (o mesa.html só tem "const SRD = window.MESA_SRD || {};" entre os marcadores SRD-INICIO/FIM e NÃO deve receber os dados).
const fs = require('fs'), path = require('path');
const [alvo, linhaArq] = process.argv.slice(2);
if (!alvo || !linhaArq) { console.error('Uso: node inject.js "../../MESA DE RPG/dados-srd.js" srd-line.js'); process.exit(1); }
if (!/\.js$/i.test(alvo)) { console.error('O alvo deve ser o dados-srd.js da Mesa, não um .html (a página ficaria grande demais).'); process.exit(1); }

const linha = fs.readFileSync(linhaArq, 'utf8').trim();
const m = /^const SRD = ([\s\S]*);$/.exec(linha);
if (!m) { console.error('srd-line.js não está no formato "const SRD = {...};" do build.js.'); process.exit(1); }
const novo = JSON.parse(m[1]); // confere que é JSON válido

const CAB = '/* Mesa de RPG — dados carregados antes do script principal (separados para a página caber na revisão de compartilhamento). Não editar à mão sem conferir o mesa.html. */';
let cab = CAB, antigo = null;
if (fs.existsSync(alvo)) {
  const atual = fs.readFileSync(alvo, 'utf8');
  const i = atual.indexOf('window.MESA_SRD = ');
  if (i < 0) { console.error(path.basename(alvo) + ' não tem "window.MESA_SRD = ". Arquivo errado?'); process.exit(1); }
  if (i > 0) cab = atual.slice(0, i).trim() || CAB; // mantém o comentário do topo
  try { antigo = JSON.parse(atual.slice(i + 'window.MESA_SRD = '.length).trim().replace(/;$/, '')); } catch { antigo = null; }
}

const saida = cab + '\nwindow.MESA_SRD = ' + JSON.stringify(novo) + ';\n';
fs.writeFileSync(alvo, saida);
console.log('ok', Object.keys(novo).length + ' monstros', (saida.length / 1024).toFixed(0) + ' KB');
if (antigo) {
  const a = Object.keys(antigo), n = Object.keys(novo);
  const novos = n.filter(k => !(k in antigo)), sumiram = a.filter(k => !(k in novo));
  const mudaram = n.filter(k => k in antigo && JSON.stringify(antigo[k]) !== JSON.stringify(novo[k]));
  console.log('em relação ao arquivo anterior: ' + novos.length + ' novos, ' + sumiram.length + ' removidos, ' + mudaram.length + ' alterados');
  for (const [t, l] of [['novos', novos], ['removidos', sumiram], ['alterados', mudaram]]) if (l.length) console.log('  ' + t + ': ' + l.slice(0, 15).join(', ') + (l.length > 15 ? ' …' : ''));
}

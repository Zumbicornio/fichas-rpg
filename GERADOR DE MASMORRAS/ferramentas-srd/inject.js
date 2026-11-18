// injeta/atualiza a linha "const SRD = ..." no app, entre os marcadores
const fs = require('fs');
const [html, linhaArq] = process.argv.slice(2);
let s = fs.readFileSync(html, 'utf8');
const linha = fs.readFileSync(linhaArq, 'utf8');
const INI = '/* SRD-INICIO: fichas oficiais do System Reference Document 5.2.1 (CC-BY-4.0), geradas a partir do PDF. Não editar à mão. */';
const FIM = '/* SRD-FIM */';
const bloco = INI + '\n' + linha + '\n' + FIM;
if (s.includes(INI)) s = s.slice(0, s.indexOf(INI)) + bloco + s.slice(s.indexOf(FIM) + FIM.length);
else { const k = s.indexOf('const monSlug ='); if (k < 0) throw new Error('âncora não achada'); s = s.slice(0, k) + bloco + '\n' + s.slice(k); }
fs.writeFileSync(html, s);
console.log('ok', (s.length / 1024).toFixed(0) + ' KB');

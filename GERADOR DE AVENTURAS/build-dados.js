// Copia da Mesa de RPG as tabelas de XP e a lista de monstros para o Gerador de Aventuras.
// Uso: node "GERADOR DE AVENTURAS/build-dados.js"  (rode de novo se a lista de monstros da Mesa mudar)
const fs = require('fs'), path = require('path');
const mesa = fs.readFileSync(path.join(__dirname, '..', 'MESA DE RPG', 'mesa.html'), 'utf8').replace(/\r\n/g, '\n');
const linha = ini => { const i = mesa.indexOf(ini); if (i < 0) throw new Error('não achei ' + ini); return mesa.slice(i, mesa.indexOf('\n', i)); };
const i = mesa.indexOf('const MON = ['), j = mesa.indexOf('].map(([pt,en,cr,tags]) => ({pt,en,cr,xp:CRXP[cr],tags}));', i);
if (i < 0 || j < 0) throw new Error('não achei a lista MON');
const dados = [linha('const BUD = {'), linha('const CRXP = {'), mesa.slice(i, j) + '].map(([pt,en,cr,tags]) => ({pt,en,cr,xp:CRXP[cr],tags}));'].join('\n');
const F = path.join(__dirname, 'aventuras.html');
let s = fs.readFileSync(F, 'utf8');
const a = s.indexOf('/*@@MESA-INICIO'), b = s.indexOf('/*@@MESA-FIM*/');
const cab = s.slice(a, s.indexOf('*/', a) + 2);
s = s.slice(0, a) + cab + '\n' + dados + '\n' + s.slice(b);
fs.writeFileSync(F, s);
console.log('ok:', (dados.match(/\['/g) || []).length, 'monstros');

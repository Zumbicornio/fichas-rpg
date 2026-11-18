// srd.json -> linha "const SRD = {...};" com cabeçalho em português (texto de traços/ações fica no original)
const fs = require('fs');
const srd = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const ALIAS = { 'Animated Flying Sword': 'Flying Sword', 'Animated Rug of Smothering': 'Rug of Smothering' };
const m2 = n => { const v = Math.round(n * 0.3 * 10) / 10; return String(v).replace('.', ','); };
const metros = s => s.replace(/(\d+)[- ](?:ft\.?|feet|foot)/g, (_, n) => m2(+n) + ' m');
const rep = (s, pares) => { for (const [a, b] of pares) s = s.replace(new RegExp('\\b' + a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g'), b); return s; };
const TERMOS = Object.entries({
  'Passive Perception': 'Percepção passiva', 'Animal Handling': 'Adestrar Animais', 'Sleight of Hand': 'Prestidigitação',
  Acrobatics: 'Acrobacia', Arcana: 'Arcanismo', Athletics: 'Atletismo', Deception: 'Enganação', History: 'História', Insight: 'Intuição',
  Intimidation: 'Intimidação', Investigation: 'Investigação', Medicine: 'Medicina', Nature: 'Natureza', Perception: 'Percepção',
  Performance: 'Atuação', Persuasion: 'Persuasão', Religion: 'Religião', Stealth: 'Furtividade', Survival: 'Sobrevivência',
  Bludgeoning: 'Contundente', Lightning: 'Elétrico', Necrotic: 'Necrótico', Piercing: 'Perfurante', Psychic: 'Psíquico',
  Radiant: 'Radiante', Slashing: 'Cortante', Thunder: 'Trovejante', Acid: 'Ácido', Cold: 'Frio', Fire: 'Fogo', Force: 'Energia',
  Blinded: 'Cego', Charmed: 'Enfeitiçado', Deafened: 'Surdo', Exhaustion: 'Exaustão', Frightened: 'Amedrontado', Grappled: 'Agarrado',
  Incapacitated: 'Incapacitado', Invisible: 'Invisível', Paralyzed: 'Paralisado', Petrified: 'Petrificado', Poisoned: 'Envenenado',
  Poison: 'Venenoso', Prone: 'Caído', Restrained: 'Impedido', Stunned: 'Atordoado', Unconscious: 'Inconsciente',
  Blindsight: 'Percepção às Cegas', Darkvision: 'Visão no Escuro', Tremorsense: 'Sentido Sísmico', Truesight: 'Visão Verdadeira',
  "Thieves' Cant": 'Gíria de Ladrão', 'Deep Speech': 'Dialeto Subterrâneo', Undercommon: 'Subcomum', Common: 'Comum', Draconic: 'Dracônico',
  Abyssal: 'Abissal', Elvish: 'Élfico', Dwarvish: 'Anão', Gnomish: 'Gnômico', Sylvan: 'Silvestre', Druidic: 'Druídico', Giant: 'Gigante',
  telepathy: 'telepatia', understands: 'entende', "but can't speak them": 'mas não os fala', "but can't speak it": 'mas não o fala', "but can't speak": 'mas não fala', "can't speak": 'não fala', None: 'Nenhum',
  'the languages it knew in life': 'os idiomas que conhecia em vida', 'all languages': 'todos os idiomas', plus: 'mais', and: 'e', or: 'ou'
}).sort((a, b) => b[0].length - a[0].length);
const DESL = [['Burrow', 'escavação'], ['Climb', 'escalada'], ['Fly', 'voo'], ['Swim', 'natação'], ['hover', 'pairar']];
const TIPO = Object.entries({
  'Lawful Good': 'Leal e Bom', 'Neutral Good': 'Neutro e Bom', 'Chaotic Good': 'Caótico e Bom', 'Lawful Neutral': 'Leal e Neutro',
  'Chaotic Neutral': 'Caótico e Neutro', 'Lawful Evil': 'Leal e Mau', 'Neutral Evil': 'Neutro e Mau', 'Chaotic Evil': 'Caótico e Mau',
  'Unaligned': 'Sem Tendência', 'Neutral': 'Neutro', 'Swarm of Tiny Beasts': 'Enxame de Feras Miúdas', 'Swarm of Tiny Undead': 'Enxame de Mortos-Vivos Miúdos',
  'Swarm of Tiny Monstrosities': 'Enxame de Monstruosidades Miúdas', 'Swarm of Small Beasts': 'Enxame de Feras Pequenas', 'Swarm of Medium Beasts': 'Enxame de Feras Médias',
  Tiny: 'Miúdo', Small: 'Pequeno', Medium: 'Médio', Large: 'Grande', Huge: 'Enorme', Gargantuan: 'Imenso', 'or Smaller': 'ou menor', or: 'ou',
  Aberration: 'Aberração', Beast: 'Fera', Celestial: 'Celestial', Construct: 'Constructo', Dragon: 'Dragão', Elemental: 'Elemental', Fey: 'Fada',
  Fiend: 'Ínfero', Giant: 'Gigante', Humanoid: 'Humanoide', Monstrosity: 'Monstruosidade', Ooze: 'Gosma', Plant: 'Planta', Undead: 'Morto-Vivo',
  Chromatic: 'Cromático', Metallic: 'Metálico', Demon: 'Demônio', Devil: 'Diabo', Wizard: 'Mago', Cleric: 'Clérigo', Titan: 'Titã', 'Any Alignment': 'Qualquer Tendência'
}).sort((a, b) => b[0].length - a[0].length);
const SEC = { Traits: 'Traços', Actions: 'Ações', 'Bonus Actions': 'Ações Bônus', Reactions: 'Reações', 'Legendary Actions': 'Ações Lendárias' };
const INFO = [['Skills', 'Perícias'], ['Vulnerabilities', 'Vulnerabilidades'], ['Resistances', 'Resistências'], ['Immunities', 'Imunidades'], ['Gear', 'Equipamento'], ['Senses', 'Sentidos'], ['Languages', 'Idiomas']];
const ATR = ['For', 'Des', 'Con', 'Int', 'Sab', 'Car'];
const out = {};
for (const [nome, s] of Object.entries(srd)) {
  const en = ALIAS[nome] || nome;
  const mods = s.atr.map(v => Math.floor((v - 10) / 2));
  const salv = s.salv.map((sv, i) => +sv !== mods[i] ? ATR[i] + ' ' + sv : '').filter(Boolean).join(', ');
  const info = [];
  if (salv) info.push(['Salvaguardas', salv]);
  for (const [k, pt] of INFO) if (s.info[k]) info.push([pt, metros(rep(s.info[k], TERMOS))]);
  out[en] = {
    tipo: rep(s.tipo, TIPO), ca: s.ca, pv: s.pv.replace(/ \+ /g, '+').replace(/ - /g, '−'), desl: metros(rep(s.desl, DESL)), ini: s.ini,
    atr: s.atr, info, cr: s.cr, nomeSrd: nome !== en ? nome : undefined,
    secoes: s.secoes.map(([t, ls]) => [SEC[t] || t, ls])
  };
}
const line = 'const SRD = ' + JSON.stringify(out) + ';';
fs.writeFileSync(process.argv[3], line);
console.log('monstros', Object.keys(out).length, 'tamanho', (line.length / 1024).toFixed(0) + ' KB');
const ex = out['Young White Dragon']; console.log(JSON.stringify({ ...ex, secoes: ex.secoes.map(s => [s[0], s[1].length]) }));
console.log(JSON.stringify(out['Mummy'].info), out['Mummy'].tipo, out['Swarm of Rats'] && out['Swarm of Rats'].tipo);

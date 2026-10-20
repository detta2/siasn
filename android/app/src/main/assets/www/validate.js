// Validasi + dedup bank soal SiASN. Usage: node validate.js
const fs = require('fs');
const DIR = '/home/hatch/workspace/siasn/js/data/';
const files = fs.readdirSync(DIR).filter(f => f.endsWith('.js')).sort();
let total = 0, problems = [];
const seenQ = new Map(); // normalized question -> first id
const seenId = new Set();

for (const f of files) {
  const src = fs.readFileSync(DIR + f, 'utf8');
  try { new (require('vm').Script)(src); } catch (e) { problems.push(`${f}: JS syntax error`); continue; }
  const m = src.match(/window\.(QB_\w+)\s*=/);
  if (!m) { problems.push(`${f}: no window.QB_* assignment`); continue; }
  const sandbox = { window: {} };
  require('vm').createContext(sandbox);
  require('vm').runInContext(src, sandbox);
  const arr = sandbox.window[m[1]];
  if (!Array.isArray(arr)) { problems.push(`${f}: not an array`); continue; }
  const cat = m[1].includes('TWK') ? 'TWK' : m[1].includes('TIU') ? 'TIU' : 'TKP';
  const dupsInFile = [];
  arr.forEach((q, i) => {
    total++;
    const tag = `${f}#${i} (${q.id || 'no-id'})`;
    if (!q.id || !q.q || !q.opts || q.opts.length !== 5 || !q.ex) { problems.push(`${tag}: schema`); return; }
    if (seenId.has(q.id)) { problems.push(`${tag}: duplicate id`); return; }
    seenId.add(q.id);
    if (cat === 'TKP') {
      const s = q.opts.map(o => o.s).sort((a, b) => a - b).join(',');
      if (s !== '1,2,3,4,5') { problems.push(`${tag}: bad scores [${q.opts.map(o => o.s)}]`); return; }
    } else {
      if (q.a < 0 || q.a > 4 || !Number.isInteger(q.a)) { problems.push(`${tag}: bad answer index`); return; }
    }
    const nq = (q.q.trim() + '|' + q.opts.map(o => (o.t || o).trim()).join('|')).toLowerCase().replace(/\s+/g, ' ');
    if (seenQ.has(nq)) dupsInFile.push(`${q.id} dup of ${seenQ.get(nq)}`);
    else seenQ.set(nq, q.id);
  });
  if (dupsInFile.length) problems.push(`${f}: ${dupsInFile.length} dup questions: ${dupsInFile.slice(0, 5).join('; ')}${dupsInFile.length > 5 ? '...' : ''}`);
  console.log(`${f}: ${arr.length} soal`);
}
console.log('TOTAL:', total);
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'ALL CLEAN');
process.exit(problems.length ? 1 : 0);

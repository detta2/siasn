#!/usr/bin/env node
/* =====================================================================
   SiASN — Validator Bank Soal (validate_questions.js)
   ---------------------------------------------------------------------
   Memeriksa seluruh file data js/data/ (twk*.js, tiu*.js, tkp*.js)
   terhadap standar CAT BKN & keamanan struktur:

   1. Duplikat      : ID kembar & KLON soal (batang + himpunan opsi
                      identik, urutan opsi bebas). Batang generik yang
                      sama dengan opsi berbeda BUKAN duplikat (isi soal
                      hidup di opsinya) — hanya dilaporkan sebagai info.
                      Klon dengan isi jawaban benar berbeda = konflik
                      kunci (error tersendiri).
   2. Kunci jawaban : TWK/TIU wajib punya indeks `a` valid yang menunjuk
                      opsi yang ada; pembahasan (ex) wajib terisi.
   3. Bobot TKP     : 5 opsi, tiap opsi skor bulat 1..5, tepat satu
                      opsi bernilai 5 (jawaban terbaik tunggal).
   4. Null safety   : id/q/opts/ex tidak boleh kosong/null/salah tipe;
                      opsi tidak boleh kosong / kembar dalam satu soal.
   5. Heuristik     : pembahasan yang nyaris tak berbagi kata kunci
                      dengan soal ditandai sebagai PERINGATAN (dugaan
                      pembahasan tertukar) untuk ditinjau manual.

   Pakai:  node validate_questions.js           (laporan manusiawi)
           node validate_questions.js --json    (keluaran JSON)
   Kode keluar: 0 = bersih dari ERROR (peringatan boleh ada),
                1 = ada ERROR.
   ===================================================================== */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const DATA_DIR = path.join(__dirname, "js", "data");
const CATS = ["TWK", "TIU", "TKP"];

function loadBank() {
  const files = fs.readdirSync(DATA_DIR)
    .filter((f) => /^(twk|tiu|tkp)(_b\d+)?\.js$/.test(f))
    .sort((a, b) => {
      const na = /_b(\d+)/.exec(a), nb = /_b(\d+)/.exec(b);
      if (!na && !nb) return 0;
      if (!na) return -1;
      if (!nb) return 1;
      return (+na[1]) - (+nb[1]);
    });
  const bank = { TWK: [], TIU: [], TKP: [] };
  const origin = {}; // id -> file pertama
  for (const f of files) {
    const code = fs.readFileSync(path.join(DATA_DIR, f), "utf8");
    const sandbox = { window: {} };
    vm.createContext(sandbox);
    try { vm.runInContext(code, sandbox, { filename: f }); }
    catch (e) { console.error("GAGAL PARSE " + f + ": " + e.message); process.exit(2); }
    for (const key of Object.keys(sandbox.window)) {
      const m = /^QB_(TWK|TIU|TKP)(_B\d+)?$/.exec(key);
      if (!m) continue;
      const arr = sandbox.window[key];
      if (!Array.isArray(arr)) continue;
      for (const q of arr) { q.__file = f; bank[m[1]].push(q); }
    }
  }
  return { bank, files, origin };
}

function normText(s) {
  return String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}
const STOP = new Set(("yang dan di ke dari untuk dengan adalah ini itu atau pada dalam tidak juga akan sebagai oleh karena secara dapat telah lebih ada merupakan antara menjadi bagi sudah salah satu dua tiga empat lima ia dia anda kami kita mereka tersebut berikut kecuali selain selama terhadap tentang menjadi memiliki digunakan dilakukan berdasarkan pengertian contoh soal jawaban benar tepat paling sesuai bukan ialah yaitu yakni dalam").split(" "));
function keywords(s) {
  return new Set(normText(s).split(" ").filter((w) => w.length > 3 && !STOP.has(w)));
}

function validate(bank) {
  const errors = [], warnings = [];
  const E = (cat, q, msg) => errors.push({ cat, id: q && q.id, file: q && q.__file, msg });
  const W = (cat, q, msg) => warnings.push({ cat, id: q && q.id, file: q && q.__file, msg });
  const stats = {};

  for (const cat of CATS) {
    const qs = bank[cat];
    stats[cat] = qs.length;
    const seenId = new Map();
    const cloneGroups = new Map(); // kunci klon -> soal pertama
    const stemFamilies = new Map(); // batang -> jumlah varian (info)
    for (const q of qs) {
      /* --- struktur dasar / null safety --- */
      if (!q || typeof q !== "object") { E(cat, q, "entri bukan objek"); continue; }
      if (typeof q.id !== "string" || !q.id.trim()) E(cat, q, "id kosong/bukan string");
      if (typeof q.q !== "string" || q.q.trim().length < 8) E(cat, q, "teks soal kosong/terlalu pendek");
      if (!Array.isArray(q.opts)) { E(cat, q, "opts bukan array"); continue; }
      if (typeof q.ex !== "string" || q.ex.trim().length < 5) E(cat, q, "pembahasan (ex) kosong/terlalu pendek");

      /* --- duplikat ID --- */
      if (q.id) {
        if (seenId.has(q.id)) E(cat, q, "ID duplikat (pertama di " + seenId.get(q.id) + ")");
        else seenId.set(q.id, q.__file);
      }

      /* --- klon sejati: batang + himpunan opsi identik --- */
      const stemKey = String(q.q || "").trim().replace(/\s+/g, " ");
      stemFamilies.set(stemKey, (stemFamilies.get(stemKey) || 0) + 1);
      const optKey = q.opts.map((o) => (o && typeof o === "object") ? (String(o.t || "").trim() + "#" + o.s) : String(o || "").trim()).sort().join("||");
      const cloneKey = stemKey + "||" + optKey;
      if (cloneGroups.has(cloneKey)) {
        const first = cloneGroups.get(cloneKey);
        E(cat, q, "KLON soal (sama persis dengan " + first.id + " @ " + first.__file + ")");
        if (cat !== "TKP" && Number.isInteger(q.a) && first && Number.isInteger(first.a)) {
          const aTxt = String(q.opts[q.a] || "").trim(), bTxt = String(first.opts[first.a] || "").trim();
          if (aTxt !== bTxt) E(cat, q, "KONFLIK KUNCI dengan klon " + first.id + ": '" + aTxt + "' vs '" + bTxt + "'");
        }
      } else cloneGroups.set(cloneKey, q);

      if (cat === "TKP") {
        /* --- TKP: bobot BKN --- */
        if (q.opts.length !== 5) E(cat, q, "TKP harus tepat 5 opsi, ditemukan " + q.opts.length);
        let fives = 0;
        const seenOpt = new Set();
        q.opts.forEach((o, i) => {
          if (!o || typeof o !== "object") { E(cat, q, "opsi " + i + " bukan objek {t,s}"); return; }
          if (typeof o.t !== "string" || !o.t.trim()) E(cat, q, "opsi " + i + " teks kosong");
          if (!Number.isInteger(o.s) || o.s < 1 || o.s > 5) E(cat, q, "opsi " + i + " skor tidak valid (harus bulat 1..5): " + JSON.stringify(o.s));
          if (o.s === 5) fives++;
          const no = String(o.t || "").trim();
          if (seenOpt.has(no)) E(cat, q, "teks opsi kembar persis dalam satu soal (opsi " + i + ")");
          seenOpt.add(no);
        });
        if (fives === 0) E(cat, q, "TKP tanpa opsi bernilai 5 (tidak ada jawaban terbaik)");
        if (fives > 1) E(cat, q, "TKP punya " + fives + " opsi bernilai 5 (jawaban terbaik harus tunggal)");
      } else {
        /* --- TWK/TIU: kunci jawaban --- */
        if (q.opts.length !== 5) E(cat, q, "harus tepat 5 opsi, ditemukan " + q.opts.length);
        const seenOpt = new Set();
        q.opts.forEach((o, i) => {
          if (typeof o !== "string" || !o.trim()) E(cat, q, "opsi " + i + " kosong/bukan string");
          const no = String(o || "").trim();
          if (seenOpt.has(no)) E(cat, q, "teks opsi kembar persis dalam satu soal (opsi " + i + ")");
          seenOpt.add(no);
        });
        if (!Number.isInteger(q.a)) E(cat, q, "kunci `a` bukan bilangan bulat: " + JSON.stringify(q.a));
        else if (q.a < 0 || q.a >= q.opts.length) E(cat, q, "kunci `a`=" + q.a + " menunjuk opsi yang tidak ada (opsi: " + q.opts.length + ")");
      }

      /* --- heuristik pembahasan tertukar (peringatan) --- */
      if (typeof q.q === "string" && typeof q.ex === "string" && q.ex.length >= 20) {
        const optTxt = q.opts.map((o) => (o && typeof o === "object") ? o.t : o).join(" ");
        const kq = keywords(q.q + " " + optTxt), ke = keywords(q.ex);
        let overlap = 0;
        ke.forEach((w) => { if (kq.has(w)) overlap++; });
        if (kq.size >= 4 && overlap === 0) W(cat, q, "pembahasan 0 kata kunci bersama soal — dugaan tertukar, tinjau manual");
      }
    }
  }
  return { errors, warnings, stats };
}

const { bank, files } = loadBank();
const { errors, warnings, stats } = validate(bank);
const total = CATS.reduce((a, c) => a + stats[c], 0);

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ files: files.length, stats, total, errors, warnings }, null, 1));
} else {
  console.log("=== VALIDASI BANK SOAL SiASN ===");
  console.log("File diperiksa : " + files.length + " file data");
  console.log("Total soal     : " + total + " (TWK " + stats.TWK + " • TIU " + stats.TIU + " • TKP " + stats.TKP + ")");
  let famCount = 0;
  console.log("ERROR          : " + errors.length);
  errors.slice(0, 200).forEach((e) => console.log("  [E] " + e.cat + " " + e.id + " (" + e.file + ") — " + e.msg));
  if (errors.length > 200) console.log("  ... dan " + (errors.length - 200) + " error lain (pakai --json untuk lengkap)");
  console.log("PERINGATAN     : " + warnings.length);
  warnings.slice(0, 60).forEach((e) => console.log("  [W] " + e.cat + " " + e.id + " (" + e.file + ") — " + e.msg));
  if (warnings.length > 60) console.log("  ... dan " + (warnings.length - 60) + " peringatan lain");
  console.log(errors.length === 0 ? "\nHASIL: BERSIH — tidak ada error." : "\nHASIL: ADA ERROR — perbaiki sebelum rilis.");
}
process.exit(errors.length ? 1 : 0);

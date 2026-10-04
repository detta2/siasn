/* SiASN — Latihan CPNS. 100% client-side. */
(function(){
"use strict";
var CATS={
 TWK:{name:"TWK",full:"Tes Wawasan Kebangsaan",n:30,pg:65,max:150,cls:""},
 TIU:{name:"TIU",full:"Tes Intelegensia Umum",n:35,pg:80,max:175,cls:"tiu"},
 TKP:{name:"TKP",full:"Tes Karakteristik Pribadi",n:45,pg:166,max:225,cls:"tkp"}
};
var BANK={TWK:[],TIU:[],TKP:[]};
["TWK","TIU","TKP"].forEach(function(c){
 var arr=window["QB_"+c]||[];
 for(var b=2;b<=20;b++){arr=arr.concat(window["QB_"+c+"_B"+b]||[]);}
 BANK[c]=arr;
});
var MAT={TWK:window.MAT_TWK||[],TIU:window.MAT_TIU||[],TKP:window.MAT_TKP||[]};
var LS="siasn_v1";
function load(){try{var s=JSON.parse(localStorage.getItem(LS));if(s&&s.done)return s;}catch(e){}return{done:{},tryouts:[]};}
function save(){try{localStorage.setItem(LS,JSON.stringify(ST));}catch(e){}}
var ST=load();
window.SIASN={BANK:BANK,ST:ST,topicOf:topicOf,prepQ:prepQ,pkgQuestions:pkgQuestions};
var S={view:"dash"};
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function fmtT(s){s=Math.max(0,s);var m=Math.floor(s/60),h=Math.floor(m/60);m=m%60;var ss=s%60;function p(x){return(x<10?"0":"")+x;}return(h>0?p(h)+":":"")+p(m)+":"+p(ss);}
function head(inner){return '<div class="topbar"><div class="logo">'+ICONS.grad+'</div><div class="brand"><b>SiASN</b><span>Latihan SKD CPNS</span></div></div>'+inner;}
function go(v,arg){
 if(window.Mentor3D&&Mentor3D.active()){
  var cur=(S.view||"").indexOf("mentor")===0,nxt=(v||"").indexOf("mentor")===0;
  if(cur&&!nxt)Mentor3D.destroy();
 }
 if(v==="latihan"&&arg){startLatPreset(arg);return;}
 S.view=v;render();window.scrollTo(0,0);
}
window.go=go;

/* ---------- IKON SVG ---------- */
var ICONS={
 pencil:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/></svg>',
 stopwatch:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 10v3.5l2.5 1.5"/><path d="M9.5 2.5h5"/><path d="M12 2.5V6"/></svg>',
 book:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
 robot:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="8.5" width="15" height="11" rx="2.5"/><path d="M12 8.5V4.5"/><circle cx="12" cy="3" r="1.3"/><circle cx="9.3" cy="13.2" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.7" cy="13.2" r="1.2" fill="currentColor" stroke="none"/><path d="M9.5 16.8h5"/></svg>',
 flag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V4c4-2.5 8 2.5 12 0v9c-4 2.5-8-2.5-12 0"/></svg>',
 zap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z"/></svg>',
 users:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.5c2.6.6 4.5 2.5 5 5.5"/></svg>',
 chart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M6 21v-7M11 21V8M16 21v-11M21 21V4"/></svg>',
 layers:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
 doc:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></svg>',
 bulb:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.4 1 2.3h6c0-.9.4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>',
 target:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/></svg>',
 speaker:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>',
 stop:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>',
 chat:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-8.5 8.4 8.6 8.6 0 0 1-3.8-.9L3 21l2-5.4a8.3 8.3 0 0 1-1-4A8.4 8.4 0 0 1 12.5 3 8.4 8.4 0 0 1 21 11.5z"/></svg>',
 grad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/><path d="M22 10v6"/></svg>',
 back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
 check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
 x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
 clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
 flame:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c4.4 0 8-3.2 8-7.5 0-3.2-2.2-5.4-3.8-7C14.6 5.9 13.5 4.5 13 2c-3.2 2-5.2 4.6-5.8 7.2C5.7 10.4 4 12.6 4 14.5 4 18.8 7.6 22 12 22z"/><path d="M12 22c-2 0-3.5-1.4-3.5-3.2 0-1.5 1-2.4 1.9-3.3.7 1 1.6 1.7 1.6 3.3"/></svg>',
 trophy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4.5A2.5 2.5 0 0 0 7 11M17 6h2.5A2.5 2.5 0 0 1 17 11"/></svg>',
 chev:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>'
};
function ic(n){return '<span class="icn">'+ICONS[n]+'</span>';}

/* ---------- DASHBOARD ---------- */
function vDash(){
 var done=Object.keys(ST.done),nDone=done.length,ok=0;
 done.forEach(function(k){if(ST.done[k].ok)ok++;});
 var acc=nDone?Math.round(ok/nDone*100):0;
 var nTo=ST.tryouts.length,best=0;
 ST.tryouts.forEach(function(t){if(t.total>best)best=t.total;});
 var cards='<div class="grid4">'
  +'<div class="stat g"><b>'+nDone+'</b><span>Soal dikerjakan</span></div>'
  +'<div class="stat b"><b>'+acc+'%</b><span>Akurasi latihan</span></div>'
  +'<div class="stat y"><b>'+nTo+'</b><span>Tryout</span></div>'
  +'<div class="stat p"><b>'+best+'</b><span>Skor terbaik</span></div></div>';
 var prog="";
 Object.keys(CATS).forEach(function(c){
  var tot=BANK[c].length,dn=0;
  done.forEach(function(k){if(ST.done[k].c===c)dn++;});
  var pct=tot?Math.round(dn/tot*100):0;
  prog+='<div class="prow"><div class="lbl"><span><b>'+c+'</b> — '+esc(CATS[c].full)+'</span><span>'+dn+'/'+tot+'</span></div><div class="bar"><i style="width:'+pct+'%"></i></div></div>';
 });
 var hist=ST.tryouts.length?ST.tryouts.slice().reverse().slice(0,8).map(function(t){
  return '<div class="hist"><span>'+esc(t.d)+'</span><span><b>'+t.total+'</b> '+(t.pass?'<span class="pill ok">LULUS</span>':'<span class="pill no">GAGAL</span>')+'</span></div>';
 }).join(""):'<div class="empty">Belum ada tryout. Yuk mulai yang pertama!</div>';
 return head(
  '<div class="hero"><span class="eyebrow">Tryout SKD • 110 soal • 100 menit</span><h1>Siap jadi ASN?</h1><p>5.400 soal TWK, TIU, TKP dimodelkan dari pola soal CPNS tahun-tahun sebelumnya, plus tryout persis format SKD asli.</p></div>'
  +pathBanner()
  +'<div class="mmenu">'
  +'<button class="mitem" onclick="go(\'lat_cat\')"><span class="mtile blue">'+ICONS.pencil+'</span><span><b>Latihan Soal</b><span>Koreksi + pembahasan</span></span><span class="mgo">'+ICONS.chev+'</span></button>'
  +'<button class="mitem" onclick="go(\'to_packs\')"><span class="mtile red">'+ICONS.stopwatch+'</span><span><b>Tryout SKD</b><span>12 paket simulasi</span></span><span class="mgo">'+ICONS.chev+'</span></button>'
  +'<button class="mitem" onclick="openMatList(\'TWK\')"><span class="mtile purple">'+ICONS.book+'</span><span><b>Materi</b><span>Materi lengkap 19 topik</span></span><span class="mgo">'+ICONS.chev+'</span></button>'
  +'<button class="mitem" onclick="go(\'mentor\')"><span class="mtile green">'+ICONS.robot+'</span><span><b>Mentor 3D</b><span>Tanya Nara</span></span><span class="mgo">'+ICONS.chev+'</span></button>'
  +'</div>'
  +'<div class="card"><h2>'+ic("chart")+'Progresmu</h2>'+cards+'</div>'
  +'<div class="card"><h2>'+ic("layers")+'Bank Soal</h2>'+prog+'</div>'
  +'<div class="card"><h2>'+ic("doc")+'Riwayat Tryout</h2>'+hist+'</div>'
  +'<div class="info"><b>Format SKD asli:</b> TWK 30 soal (PG 65) • TIU 35 soal (PG 80) • TKP 45 soal (PG 166) • Total 110 soal, 100 menit. Lulus = ketiga komponen mencapai passing grade masing-masing.</div>'
  +'<div class="footer">SiASN • soal latihan dimodelkan dari kisi-kisi & pola soal CPNS sebelumnya</div>'
 );
}

/* ---------- TOPIK & TEKNIK BELAJAR ---------- */
var TOPIC_RULES={
 TWK:[
  ["Pancasila",/pancasila|sila|bpupki|ppki|piagam jakarta|garuda/i],
  ["UUD 1945",/uud ?1945|amandemen|pasal \d|mpr\b|dpr\b|dpd\b|mahkamah|konstitusi|perpu/i],
  ["Bela Negara",/bela negara|sishankamrata|komponen cadangan|komponen pendukung|ketahanan nasional|proxy war|ancaman/i],
  ["Sejarah Nasional",/proklamasi|kemerdekaan|revolusi|orde |reformasi|voc|penjajah|pergerakan|sumpah pemuda|agresi|linggarjati|renville|kmb|jepang|belanda/i],
  ["NKRI & Kebangsaan",/nkri|bhinneka|nusantara|wawasan|djuanda|perbatasan|pulau|asean|deklarasi/i],
  ["Bahasa Indonesia",/kata baku|kalimat|ejaan|tanda baca|huruf kapital|penulisan|paragraf|serapan|imbuhan/i]
 ],
 TIU:[
  ["Sinonim",/sinonim/i],
  ["Antonim",/antonim/i],
  ["Analogi",/=| : /],
  ["Figural",/gambar|pola|bangun|kubus|dadu|lipat|cermin|rotasi|simetri|panah|titik|sudut|segitiga|persegi|lingkaran|kotak/i],
  ["Penalaran Logis",/kesimpulan|silogisme|premis|jika .* maka|semua |sebagian |tidak ada |implikasi/i],
  ["Deret Angka",/^[\dA-Z,\s.\-–()]+$/],
  ["Aritmetika",/./]
 ],
 TKP:[
  ["Anti-Radikalisme",/radikal|ekstrem|teror|intoleran|khilafah/i],
  ["TIK & Digital",/digital|siber|internet|hoaks|phising|phishing|media sosial|whatsapp|aplikasi|data pribadi|ransomware/i],
  ["Sosial Budaya",/adat|agama|toleransi|suku|budaya|ibadah|keyakinan/i],
  ["Kerjasama Tim",/rekan|kerjasama|koordinasi|konflik|\btim\b|musyawarah|rapat/i],
  ["Profesionalisme & Integritas",/atasan|integritas|gratifikasi|korupsi|pungli|netralitas|disiplin|whistleblow|inspektorat|\bwbs\b/i],
  ["Pelayanan Publik",/./]
 ]
};
function topicOf(cat,qtext){
 var rules=TOPIC_RULES[cat]||[],t=qtext||"";
 for(var i=0;i<rules.length;i++){
  if(rules[i][0]==="Deret Angka"){if(/,/.test(t)&&rules[i][1].test(t))return rules[i][0];continue;}
  if(rules[i][1].test(t))return rules[i][0];
 }
 return "Umum";
}
var TECH={
 "Pancasila":[
  {t:"Active recall per sila",d:"Tutup catatan, sebutkan bunyi + contoh pengamalan tiap sila dari ingatan. Yang macet = yang diulang besok."},
  {t:"Rangkai jadi cerita",d:"BPUPKI → Piagam Jakarta → PPKI dalam satu alur cerita, jangan hafal tanggal lepas-lepas."},
  {t:"Spaced repetition",d:"Soal yang salah hari ini diulang besok, lalu 3 hari kemudian. Jangan diulang di hari yang sama saja."}
 ],
 "UUD 1945":[
  {t:"Peta pasal",d:"Bikin mind map per bab (mis. Pasal 20–22 = DPR & UU). Visual lebih nempel daripada teks panjang."},
  {t:"Flashcard bolak-balik",d:"Depan kartu = topik ('syarat presiden'), belakang = nomor pasal + isinya."},
  {t:"Fokus pola 'kecuali'",d:"Soal UUD sering tanya pengecualian — latih dengan sengaja mencari opsi yang BUKAN."}
 ],
 "Bela Negara":[
  {t:"Tabel perbandingan",d:"Jajarkan komponen utama / cadangan / pendukung + sishankamrata dalam satu tabel. Bedakan, jangan hafal lepas."},
  {t:"Kaitkan UU dengan berita",d:"Tiap pasal UU 23/2019 cari contoh beritanya — konteks bikin hafalan tahan lama."},
  {t:"Bedakan istilah mirip",d:"Tulis perbedaan sishankamrata vs ketahanan nasional vs wawasan nusantara. Soal suka mengecoh di sini."}
 ],
 "Sejarah Nasional":[
  {t:"Timeline sendiri",d:"Gambar garis waktu 1908–1998 versi kamu: tahun + tokoh + dampak. Tempel di dinding."},
  {t:"Rantai sebab-akibat",d:"Tiap peristiwa jawab 'kenapa terjadi?' dan 'apa akibatnya?' — soal suka tanya hubungan, bukan tahun doang."},
  {t:"Kartu tokoh",d:"Satu tokoh satu kartu: peran + peristiwa terkait. Acak kartunya tiap review."}
 ],
 "NKRI & Kebangsaan":[
  {t:"Peta konsep",d:"Hubungkan wawasan nusantara → astagatra → trigatra dalam satu bagan."},
  {t:"Jembatan keledai",d:"Untuk daftar (pulau terdepan, 4 pilar, dsb.) bikin singkatan lucu yang gampang diingat."},
  {t:"Kaitkan ke berita",d:"Baca berita perbatasan/geopolitik, hubungkan ke konsep yang dipelajari."}
 ],
 "Bahasa Indonesia":[
  {t:"Drill 20 soal pola",d:"Kerjakan 20 soal kata baku sekaligus, yang salah masuk daftar pribadi."},
  {t:"Daftar kata jebakan",d:"Kumpulkan kata yang sering salah (mis. 'apotek' bukan 'apotik'), review tiap pagi 5 menit."},
  {t:"Pahami kaidahnya",d:"Baca pembahasan sampai paham ATURANNYA, bukan cuma jawabannya."}
 ],
 "Sinonim":[
  {t:"10 kata per hari",d:"Ambil 10 kata dari soal yang salah, bikin flashcard + contoh kalimat sendiri."},
  {t:"Pahami nuansa",d:"Sinonim bukan arti kembar — cek KBBI, perhatikan konteks pemakaiannya."},
  {t:"Kelompokkan per tema",d:"Kata sifat, kata kerja, istilah serapan dipisah — lebih gampang diingat."}
 ],
 "Antonim":[
  {t:"Kartu pasangan",d:"Satu kartu = satu pasangan lawan kata. Bolak-balik sampai lancar tanpa mikir."},
  {t:"Waspadai jebakan",d:"Lawan kata kadang tidak mutlak — baca SEMUA opsi dulu sebelum mengunci."},
  {t:"Ulangi yang salah",d:"Antonim yang pernah salah 90% muncul lagi dalam bentuk lain. Catat!"}
 ],
 "Analogi":[
  {t:"Sebutkan relasinya dulu",d:"Sebelum lihat opsi, ucapkan hubungannya ('alat untuk...'). Baru cocokkan ke opsi."},
  {t:"Uji tiap opsi",d:"Pasang tiap opsi ke pola yang sama — yang paling paralel = jawaban."},
  {t:"Kumpulkan tipe relasi",d:"Sebab-akibat, alat-fungsi, bagian-keseluruhan — kenali polanya biar cepat."}
 ],
 "Deret Angka":[
  {t:"Tulis pola yang kamu tahu",d:"Selisih, ×2±n, kuadrat, prima, selang-seling — cek satu-satu tiap soal."},
  {t:"Kerjakan 2 arah",d:"Coba dari depan DAN dari belakang — kadang polanya kebaca dari belakang."},
  {t:"Drill 60 detik",d:"Latih kecepatan: di ujian tiap soal cuma ~1 menit. Timer nyala tiap latihan."}
 ],
 "Aritmetika":[
  {t:"Error log",d:"Catat TIPE soal yang salah (diskon? perbandingan? kecepatan?) + rumusnya. Review tiap minggu."},
  {t:"Tulis langkahnya",d:"Jangan hitung di kepala — tulis biar ketahuan salahnya di langkah mana."},
  {t:"Tanpa kalkulator",d:"Biasakan hitung manual dari sekarang biar cepat di hari-H."}
 ],
 "Penalaran Logis":[
  {t:"Gambar diagram Venn",d:"Untuk silogisme, gambar lebih cepat daripada mikir abstrak."},
  {t:"Uji kontraposisi",d:"'Jika A maka B' setara 'jika bukan B maka bukan A' — jebakan favorit soal."},
  {t:"Waspadai 'tidak dapat disimpulkan'",d:"Kalau ragu, cek: apakah kesimpulan BENAR-BENAR mengikuti premis?"}
 ],
 "Figural":[
  {t:"Sketsa ulang",d:"Gambar ulang polanya di kertas, putar/cerminkan manual pakai tangan."},
  {t:"Cari yang berubah",d:"Tiap langkah tanya: apa yang berubah? Bentuk? Arah? Jumlah?"},
  {t:"Hafalkan pola umum",d:"Rotasi 90°, cermin, lipat kertas, dadu berlawanan — itu-itu saja polanya."}
 ],
 "Pelayanan Publik":[
  {t:"Empati dulu, prosedur jalan",d:"Opsi terbaik = peduli warga + tetap ikut aturan. Bukan salah satu."},
  {t:"Cari yang paling proaktif",d:"Skor 5 selalu yang 'menjemput bola', bukan yang pasif menunggu."},
  {t:"Bayangkan jadi warga",d:"Kalau kamu yang dilayani, perlakuan mana yang kamu mau? Itu biasanya skor 5."}
 ],
 "Profesionalisme & Integritas":[
  {t:"Tolak + lapor jalur resmi",d:"Gratifikasi/korupsi = tolak, catat, lapor inspektorat/WBS. Bukan diviralkan."},
  {t:"Atasan salah ≠ ikut salah",d:"Perintah yang melanggar aturan tetap ditolak dengan sopan."},
  {t:"Ingat urutannya",d:"Integritas > loyalitas buta > kenyamanan pribadi."}
 ],
 "Kerjasama Tim":[
  {t:"Tim di atas ego",d:"Opsi terbaik = koordinasi & musyawarah, bukan jalan sendiri."},
  {t:"Konflik = mediasi",d:"Dengarkan semua pihak, cari jalan tengah, libatkan atasan bila perlu."},
  {t:"Jangan menunda",d:"Pekerjaan tim yang macet = segera komunikasikan, bukan didiamkan."}
 ],
 "Sosial Budaya":[
  {t:"Hormati + jalan tengah",d:"Adat/agama dihormati, solusi dicari bersama tetua/tokoh setempat."},
  {t:"Jangan menghakimi",d:"Beda keyakinan/budaya = pahami dulu, bukan ceramahi."},
  {t:"Libatkan yang dipercaya",d:"Tokoh adat/agama sebagai jembatan — dilibatkan, bukan dilangkahi."}
 ],
 "TIK & Digital":[
  {t:"Data warga = amanah",d:"Tolak akses data untuk kepentingan pribadi, apapun alasannya."},
  {t:"Verifikasi dulu",d:"Hoaks/phishing = klarifikasi resmi + edukasi warga, bukan ikut menyebar."},
  {t:"Siapkan cadangan",d:"Sistem down = alihkan ke manual yang tertib. Pelayanan jangan berhenti."}
 ],
 "Anti-Radikalisme":[
  {t:"Lapor aparat",d:"Konten/kelompok ekstrem = amankan bukti + lapor BNPT/aparat. Bukan main hakim sendiri."},
  {t:"Narasi persatuan",d:"Lawan propaganda dengan fakta + ajak tokoh lintas agama bersuara."},
  {t:"Waspadai rekrutmen halus",d:"Bantuan bersyarat ikut kajian ideologi = tolak polanya, penuhi kebutuhan via jalur resmi."}
 ]
};
function analyzeWeak(items){
 var map={};
 items.forEach(function(it){
  var tp=topicOf(it.cat,it.q),key=it.cat+"|"+tp;
  if(!map[key])map[key]={cat:it.cat,topic:tp,weak:0,total:0};
  map[key].total++;
  if(it.weak)map[key].weak++;
 });
 return Object.keys(map).map(function(k){return map[k];})
  .filter(function(m){return m.weak>0;})
  .sort(function(a,b){return b.weak-a.weak;});
}
function techPanelHtml(items){
 var rows=analyzeWeak(items);
 var h='<div class="card"><h2>'+ic("bulb")+'Teknik Belajar Buatmu</h2>';
 if(!rows.length){
  h+='<div class="perfect">'+ic("target")+' <b>Sempurna — tidak ada topik lemah!</b><p>Pertahankan dengan review berkala: tanpa pengulangan, 70% materi hilang dalam 24 jam. Tantangan berikutnya: tryout 110 soal dengan timer 100 menit.</p></div>';
 }else{
  h+='<p style="color:#6b7280;font-size:14px;margin-bottom:12px">Fokus ke topik dengan salah terbanyak dulu — itu yang paling cepat mendongkrak skormu.</p>';
  rows.forEach(function(r){
   var tips=TECH[r.topic]||[];
   h+='<div class="tech"><div class="theader"><span class="badge '+CATS[r.cat].cls+'">'+r.cat+'</span><b>'+esc(r.topic)+'</b><span class="wpill">'+r.weak+' salah / '+r.total+'</span><button class="learnbtn" onclick="openMat(\''+r.cat+'\',\''+esc(r.topic)+'\')">'+ic("book")+'Pelajari</button></div><ul>'
    +tips.map(function(t){return '<li><b>'+esc(t.t)+':</b> '+esc(t.d)+'</li>';}).join("")+'</ul></div>';
  });
 }
 h+='<div class="gtip">⏱️ <b>Tips umum:</b> ulangi soal yang salah minggu ini (spaced repetition mengalahkan belajar marathon), dan biasakan latihan pakai timer — kecepatan sama pentingnya dengan ketepatan.</div></div>';
 return h;
}

/* ---------- LATIHAN ---------- */
function vLatCat(){
 var h='<div class="grid3">';
 var tiles={TWK:['flag','c0'],TIU:['zap','c1'],TKP:['users','c2']},ti=0;
 Object.keys(CATS).forEach(function(c){
  var t=tiles[c]||['book','c'+(ti%3)];ti++;
  h+='<div class="catchoice" onclick="openLatTopic(\''+c+'\')"><span class="ctile '+t[1]+'">'+ICONS[t[0]]+'</span><span style="flex:1"><b>'+c+'</b><p>'+esc(CATS[c].full)+'</p></span></div>';
 });
 return head('<button class="backlink" onclick="go(\'dash\')">'+ic("back")+'Dashboard</button><div class="card"><h2>'+ic("pencil")+'Latihan Soal</h2><p style="color:#6b7280;font-size:14px;margin-bottom:14px;font-weight:600">Pilih kategori, lalu pilih topik. Jawaban langsung dikoreksi + pembahasan.</p>'+h+'</div>');
}
window.openLatTopic=function(c){S.latCat=c;go("lat_topic");};
function vLatTopic(){
 var c=S.latCat;
 var counts={};
 BANK[c].forEach(function(q){var t=topicOf(c,q.q);counts[t]=(counts[t]||0)+1;});
 var topics=(TOPIC_RULES[c]||[]).map(function(r){return r[0];});
 var h='<div class="mattopic" onclick="startLatPreset({cat:\''+c+'\'})"><span class="mn">★</span><span><b>Semua Topik</b> <small style="color:#6b7280">campuran • '+BANK[c].length+' soal</small></span><span class="mgo">'+ic("chev")+'</span></div>';
 h+=topics.map(function(t,i){
  return '<div class="mattopic" onclick="startLatPreset({cat:\''+c+'\',topic:\''+esc(t)+'\'})"><span class="mn">'+(i+1)+'</span><span>'+esc(t)+' <small style="color:#6b7280">• '+(counts[t]||0)+' soal</small></span><span class="mgo">'+ic("chev")+'</span></div>';
 }).join("");
 return head('<button class="backlink" onclick="go(\'lat_cat\')">'+ic("back")+'Kategori</button><div class="card"><h2>'+ic("pencil")+'Latihan '+c+'</h2><p style="color:#6b7280;font-size:14px;margin-bottom:12px;font-weight:600">'+esc(CATS[c].full)+' — pilih topik.</p>'+h+'</div>');
}
function startLatPreset(p){
 p=p||{};
 var idxs=[];
 if(p.list){
  p.list.forEach(function(it){
   var arr=BANK[it.cat]||[];
   for(var i=0;i<arr.length;i++)if(topicOf(it.cat,arr[i].q)===it.topic)idxs.push({cat:it.cat,i:i});
  });
 }else{
  var arr2=BANK[p.cat]||[];
  for(var j=0;j<arr2.length;j++)if(!p.topic||topicOf(p.cat,arr2[j].q)===p.topic)idxs.push({cat:p.cat,i:j});
 }
 if(!idxs.length){alert("Soal untuk filter ini belum tersedia.");return;}
 idxs=shuffle(idxs);
 if(p.n)idxs=idxs.slice(0,p.n);
 S.lat={cat:p.cat||"MIX",order:idxs,pos:0,answered:false,pick:-1,hist:[],preset:p,mix:!!p.list,cur:null,curPos:-1};
 go("lat");
}
window.startLatPreset=startLatPreset;
window.startLat=function(c){
 if(!BANK[c].length){alert("Bank soal "+c+" belum siap.");return;}
 startLatPreset({cat:c});
};
window.restartLat=function(){startLatPreset((S.lat&&S.lat.preset)||{cat:(S.lat&&S.lat.cat)||"TWK"});};
function prepQ(cat,qi){
 var q=BANK[cat][qi];
 if(cat==="TKP"){
  var ord=shuffle(q.opts.map(function(_,i){return i;}));
  return{id:q.id,cat:cat,q:q.q,opts:ord.map(function(i){return{t:q.opts[i].t,s:q.opts[i].s};}),best:5,ex:q.ex,isTKP:true};
 }
 var ord=shuffle(q.opts.map(function(_,i){return i;}));
 var na=ord.indexOf(q.a);
 return{id:q.id,cat:cat,q:q.q,opts:ord.map(function(i){return q.opts[i];}),a:na,ex:q.ex,isTKP:false};
}
function vLat(){
 var L=S.lat,it=L.order[L.pos],q;
 if(L.cur&&L.curPos===L.pos){q=L.cur;}
 else{q=prepQ(it.cat,it.i);L.cur=q;L.curPos=L.pos;}
 var total=L.order.length;
 var opts=q.opts.map(function(o,i){
  var txt=q.isTKP?o.t:o;
  var cls="opt",dis=L.answered?"disabled":"";
  if(L.answered){
   if(q.isTKP){if(o.s===5)cls+=" correct";else if(i===L.pick)cls+=" wrong";}
   else{if(i===q.a)cls+=" correct";else if(i===L.pick)cls+=" wrong";}
  }
  return '<button class="'+cls+'" '+dis+' onclick="ansLat('+i+')"><span class="k">'+String.fromCharCode(65+i)+'</span><span>'+esc(txt)+'</span></button>';
 }).join("");
 var fb="";
 if(L.answered){
  var good=q.isTKP?q.opts[L.pick].s===5:L.pick===q.a;
  fb='<div class="explain"><div class="fb '+(good?"ok\">"+ic("check")+"Tepat!":"no\">"+ic("x")+"Kurang tepat.")+'</div> '+esc(q.ex)+'</div>'
   +(good?"":'<div class="motiv">🔥 <i>"'+esc(pickMotiv())+'"</i></div>'+trikBox(it.cat,q));
 }
 return head('<button class="backlink" onclick="go(\'lat_cat\')">'+ic("back")+'Kategori</button><div class="card">'
  +'<div class="qmeta"><span class="badge '+CATS[it.cat].cls+'">'+it.cat+'</span><span style="color:#6b7280;font-size:13px">Soal '+(L.pos+1)+' / '+total+'</span></div>'
  +'<div class="qtext">'+esc(q.q)+'</div><div class="opts">'+opts+'</div>'+fb
  +(L.answered?'<div class="qnav"><button class="btn plain" onclick="endLat()">Selesai</button><button class="btn" onclick="nextLat()">'+ic("chev")+'</button></div>':"")
  +'</div>');
}
window.ansLat=function(i){
 var L=S.lat;if(L.answered)return;
 L.answered=true;L.pick=i;
 var it=L.order[L.pos],q=L.cur,good=q.isTKP?q.opts[i].s===5:i===q.a;
 var weak=q.isTKP?q.opts[i].s<=3:i!==q.a;
 L.hist.push({id:q.id,cat:it.cat,q:q.q,ok:!weak});
 ST.done[q.id]={c:it.cat,ok:good?1:0};save();
 if(weak&&window.PathLib)PathLib.srsWrong(q.id);
 render();
};
window.nextLat=function(){
 var L=S.lat;L.pos++;
 if(L.pos>=L.order.length){L.order=shuffle(L.order);L.pos=0;}
 L.answered=false;L.pick=-1;go("lat");
};
window.endLat=function(){
 if(window.PathLib&&S.lat&&S.lat.preset)PathLib.completeLatihan(S.lat.preset);
 go("lat_result");
};
function vLatResult(){
 var L=S.lat,hist=L.hist||[],n=hist.length,ok=0;
 hist.forEach(function(x){if(x.ok)ok++;});
 var acc=n?Math.round(ok/n*100):0;
 var items=hist.map(function(x){return{cat:x.cat,q:x.q,weak:!x.ok};});
 var clabel=L.mix?"Campuran":L.cat;
 return head('<button class="backlink" onclick="go(\'lat_cat\')">'+ic("back")+'Kategori</button><div class="card"><h2>Hasil Sesi Latihan</h2>'
  +'<div class="grid4"><div class="stat"><b>'+n+'</b><span>Soal dijawab</span></div><div class="stat"><b>'+ok+'</b><span>Tepat</span></div><div class="stat"><b>'+acc+'%</b><span>Akurasi</span></div><div class="stat"><b>'+clabel+'</b><span>Kategori</span></div></div>'
  +'<button class="btn big" onclick="restartLat()">Latihan Lagi</button></div>'
  +techPanelHtml(items));
}

function reviewHtml(qs,ans){
 return qs.map(function(q,i){
  var an=ans[i],uTxt=an<0?"(tidak dijawab)":(q.isTKP?q.opts[an].t:q.opts[an]);
  var rows=q.opts.map(function(o,j){
   var txt=q.isTKP?o.t:o,cls="ro";
   if(q.isTKP){if(o.s===5)cls+=" cc";if(j===an&&o.s!==5)cls+=" uc";}
   else{if(j===q.a)cls+=" cc";if(j===an&&j!==q.a)cls+=" uc";}
   return '<div class="'+cls+'"><b>'+String.fromCharCode(65+j)+'.</b> '+esc(txt)+(q.isTKP?' <span style="color:#6b7280">('+o.s+')</span>':"")+'</div>';
  }).join("");
  return '<details><summary>'+(i+1)+'. ['+q.cat+'] '+esc(q.q.slice(0,80))+'… — <b>'+esc(uTxt.slice(0,40))+'</b></summary><div class="revbody">'+rows+'<div class="explain"><b>Pembahasan:</b> '+esc(q.ex)+'</div></div></details>';
 }).join("");
}

/* ---------- MOTIVASI TOUGH-LOVE SAAT SALAH ---------- */
var MOTIV=[
"Tolol! Soal segini masih salah juga? Fokus, jangan asal tebak.",
"Goblok boleh, tapi jangan dipelihara. Baca pembahasannya.",
"Salah lagi? Punya otak dipakai, jangan dipajang doang, tolol.",
"Mau jadi ASN tapi males baca pembahasan? Mimpi aja sana, goblok.",
"Topik yang sama, salah berkali-kali. Bego itu kalau diulang terus.",
"Kompetitormu lagi latihan soal yang sama. Kamu malah bengong kayak orang tolol.",
"Ngantuk? Cuci muka, balik lagi. NIP gak samperin orang mager tolol.",
"Gini terus yang lolos orang lain, tolol. Mau?",
"Jangan salahkan soalnya, goblok. Salahkan jarimu yang kegatelan nebak.",
"Bangun, tolol! Ujian gak nunggu kamu siap.",
"Berhenti cari alasan, goblok. Paham, bukan hafal. Titik.",
"Soal ini barusan ngetawain kamu, tolol. Balas dendam: kuasai topiknya.",
"Masih nebak-nebak? Itu namanya judi, goblok. Bukan strategi.",
"Capek? 3 juta pendaftar lain juga capek, tolol. Bedanya mereka terus jalan.",
"Salah itu wajar. Salah di tempat yang sama tiga kali itu tolol.",
"Disiplin hari ini = nama di pengumuman besok. Mager hari ini = tolol selamanya.",
"Santai boleh, leha-leha jangan, goblok. Waktu ujian gak bisa diulang.",
"Udah dikasih pembahasan masih salah juga? Catet polanya, goblok!",
"Fokus 25 menit > scroll 3 jam, tolol. Pilih sekarang.",
"Kalau gampang nyerah di latihan, di ruang ujian mau ngapain? Nangis? Goblok."
];
function pickMotiv(){
 var i;
 do{i=Math.floor(Math.random()*MOTIV.length);}while(MOTIV.length>1&&i===S.motivLast);
 S.motivLast=i;
 return MOTIV[i];
}
/* Box "cara cepat": trik acak sesuai topik soal, fallback trik UMUM. Tanpa pindah view. */
function trikBox(cat,q){
 var TR=window.TRIK||[];
 var topic=topicOf(cat,q.q);
 var cands=TR.filter(function(t){return t.cat===cat&&t.topic===topic;});
 if(!cands.length)cands=TR.filter(function(t){return t.cat==="UMUM";});
 if(!cands.length)return "";
 var t=cands[Math.floor(Math.random()*cands.length)];
 return '<div class="caracepat"><b>⚡ Cara cepat: '+esc(t.judul)+'</b><div>'+t.isi+'</div></div>';
}

/* ---------- TRYOUT ---------- */
var NPKG=12;
function mulberry32(seed){var a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function seededShuffle(a,seed){a=a.slice();var rnd=mulberry32(seed);for(var i=a.length-1;i>0;i--){var j=Math.floor(rnd()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
/* Paket p (1..NPKG): per kategori ambil n soal FIXED, deterministik, tanpa overlap antar paket. */
function pkgQuestions(p){
 var qs=[],ci=0;
 Object.keys(CATS).forEach(function(c){
  var n=CATS[c].n;
  /* satu permutasi per kategori (seed hanya dari kategori) -> slice offset menjamin tanpa overlap */
  var idx=seededShuffle(BANK[c].map(function(_,i){return i;}),ci*97+13);
  var off=(p-1)*n;
  for(var k=0;k<n;k++){qs.push(prepQ(c,idx[off+k]));}
  ci++;
 });
 return qs;
}
function bestPkg(p){
 var b=null;
 ST.tryouts.forEach(function(t){if(t.pkg===p&&(!b||t.total>b.total))b=t;});
 return b;
}
function vToPacks(){
 S.pkgIntro=null;
 var cards="";
 for(var p=1;p<=NPKG;p++){
  var b=bestPkg(p);
  var st=b?'<span class="pill '+(b.pass?"ok":"no")+'">'+(b.pass?"LULUS":"GAGAL")+'</span>':'<span class="pill idle">BELUM</span>';
  cards+='<div class="pkgcard"><div class="pkghead"><b>Paket '+p+'</b>'+st+'</div>'
   +'<div class="pkgsub">TWK 30 • TIU 35 • TKP 45 — 100 menit</div>'
   +(b?'<div class="pkgscore">Skor terbaik: <b>'+b.total+'</b> / 550</div>':'<div class="pkgscore dim">Belum dikerjakan</div>')
   +'<button class="btn '+(b?"plain":"")+'" onclick="startToPkg('+p+')">'+(b?"Ulangi":"Mulai")+'</button></div>';
 }
 return head('<button class="backlink" onclick="go(\'dash\')">'+ic("back")+'Dashboard</button>'
  +'<div class="card"><h2>'+ic("stopwatch")+'Paket Tryout</h2>'
  +'<p style="color:#6b7280;font-size:14px;font-weight:600;margin:0">12 paket simulasi ujian SKD asli — masing-masing 110 soal dengan susunan tetap. Kumpulkan skor terbaik di tiap paket!</p></div>'
  +'<div class="pkggrid">'+cards+'</div>');
}
window.startToPkg=function(p){S.pkgIntro=p;go("to_intro");};
function vToIntro(){
 var p=S.pkgIntro;
 if(!(p&&p>=1&&p<=NPKG))p=null;
 var backTo=p?"to_packs":"dash";
 var b=p?bestPkg(p):null;
 return head('<button class="backlink" onclick="go(\''+backTo+'\')">'+ic("back")+(p?"Paket Tryout":"Dashboard")+'</button><div class="card"><h2>'+(p?("Tryout — Paket "+p):"Tryout SKD")+'</h2>'
  +'<div class="info"><b>Simulasi persis ujian asli:</b><br>• 110 soal: TWK 30 • TIU 35 • TKP 45<br>• Waktu 100 menit (otomatis selesai saat habis)<br>• TWK/TIU: benar 5, salah 0 • TKP: skala 1–5<br>• Passing grade: TWK 65, TIU 80, TKP 166</div>'
  +(p&&b?'<div class="hist"><span>Skor terbaik Paket '+p+'</span><span><b>'+b.total+'</b> '+(b.pass?'<span class="pill ok">LULUS</span>':'<span class="pill no">GAGAL</span>')+'</span></div>':"")
  +'<button class="btn big" onclick="startTo('+(p?p:"")+')">Mulai Tryout</button></div>');
}
window.startTo=function(pkg){
 var qs=[];
 if(pkg&&pkg>=1&&pkg<=NPKG){
  qs=pkgQuestions(pkg);
 }else{
  pkg=null;
  Object.keys(CATS).forEach(function(c){
   var idx=shuffle(BANK[c].map(function(_,i){return i;})).slice(0,CATS[c].n);
   idx.forEach(function(ii){qs.push(prepQ(c,ii));});
  });
 }
 if(qs.length<110){alert("Bank soal belum lengkap untuk tryout (butuh 110, ada "+qs.length+").");return;}
 S.to={qs:qs,ans:new Array(qs.length).fill(-1),doubt:{},idx:0,left:6000,timer:null,pkg:pkg};
 go("to");
 S.to.timer=setInterval(function(){
  if(S.view!=="to"||!S.to){clearInterval(S.to.timer);return;}
  S.to.left--;
  var el=document.getElementById("tmrT");
  if(el){el.textContent=fmtT(S.to.left);if(S.to.left<300)document.getElementById("tmr").classList.add("low");}
  if(S.to.left<=0)finishTo();
 },1000);
};
function vTo(){
 var T=S.to,q=T.qs[T.idx],an=T.ans[T.idx];
 var opts=q.opts.map(function(o,i){
  var txt=q.isTKP?o.t:o;
  return '<button class="opt'+(an===i?" picked":"")+'" onclick="ansTo('+i+')"><span class="k">'+String.fromCharCode(65+i)+'</span><span>'+esc(txt)+'</span></button>';
 }).join("");
 var grid=T.qs.map(function(_,i){
  var cls="";
  if(T.ans[i]>=0)cls="done";
  if(T.doubt[i])cls="doubt";
  if(i===T.idx)cls+=" cur";
  return '<button class="'+cls+'" onclick="jumpTo('+i+')">'+(i+1)+'</button>';
 }).join("");
 var secTtl="";
 if(T.idx===0||T.qs[T.idx-1].cat!==q.cat)secTtl='<div class="secttl">'+q.cat+' — '+esc(CATS[q.cat].full)+'</div>';
 return head('<div class="card"><div class="tobar"><button class="backlink" style="margin:0" onclick="abortTo()">'+ic("x")+'Batal</button>'
  +'<span class="timer" id="tmr">'+ic("clock")+'<span id="tmrT">'+fmtT(T.left)+'</span></span>'
  +'<button class="btn" onclick="finishTo(true)">Selesai</button></div>'
  +'<div class="qmeta"><span class="badge '+CATS[q.cat].cls+'">'+q.cat+'</span><span style="color:#6b7280;font-size:13px">Soal '+(T.idx+1)+' / '+T.qs.length+'</span></div>'
  +secTtl+'<div class="qtext">'+esc(q.q)+'</div><div class="opts">'+opts+'</div>'
  +'<label class="doubtrow"><input type="checkbox" '+(T.doubt[T.idx]?"checked":"")+' onchange="togDoubt(this.checked)"> Ragu-ragu</label>'
  +'<div class="qnav"><button class="btn plain" '+(T.idx===0?"disabled":"")+' onclick="moveTo(-1)">'+ic("back")+' Sebelumnya</button>'
  +'<button class="btn plain" '+(T.idx===T.qs.length-1?"disabled":"")+' onclick="moveTo(1)">Berikutnya '+ic("chev")+'</button></div>'
  +'<div class="numgrid">'+grid+'</div></div>');
}
window.ansTo=function(i){S.to.ans[S.to.idx]=i;render();};
window.jumpTo=function(i){S.to.idx=i;render();window.scrollTo(0,0);};
window.moveTo=function(d){S.to.idx=Math.min(S.to.qs.length-1,Math.max(0,S.to.idx+d));render();window.scrollTo(0,0);};
window.togDoubt=function(v){if(v)S.to.doubt[S.to.idx]=1;else delete S.to.doubt[S.to.idx];};
window.abortTo=function(){if(confirm("Batalkan tryout? Progres hilang.")){var pk=S.to&&S.to.pkg?S.to.pkg:null;clearInterval(S.to.timer);S.to=null;go(pk?"to_packs":"dash");}};
window.finishTo=function(ask){
 if(ask){var un=S.to.ans.filter(function(a){return a<0;}).length;
  if(!confirm(un?("Masih ada "+un+" soal belum dijawab. Selesaikan?"):"Selesaikan tryout?"))return;}
 clearInterval(S.to.timer);
 var T=S.to,res={twk:0,tiu:0,tkp:0};
 T.qs.forEach(function(q,i){
  var an=T.ans[i];if(an<0)return;
  if(q.isTKP)res.tkp+=q.opts[an].s;
  else if(an===q.a)res[q.cat.toLowerCase()]+=5;
 });
 res.total=res.twk+res.tiu+res.tkp;
 res.pass=res.twk>=65&&res.tiu>=80&&res.tkp>=166;
 var d=new Date(),ds=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
 var pkg=S.to.pkg||null;
 ST.tryouts.push({d:ds,twk:res.twk,tiu:res.tiu,tkp:res.tkp,total:res.total,pass:res.pass?1:0,pkg:pkg});
 save();
 if(window.PathLib){
  T.qs.forEach(function(q,i){
   var an=T.ans[i],weak;
   if(an<0)weak=true;
   else if(q.isTKP)weak=q.opts[an].s<=3;
   else weak=an!==q.a;
   if(weak)PathLib.srsWrong(q.id);
  });
  PathLib.completeTryout();
 }
 S.res={res:res,qs:T.qs,ans:T.ans,pkg:pkg};
 S.to=null;go("to_result");
};
function vToResult(){
 var R=S.res,res=R.res;
 function rc(c,key,label){
  var sc=res[key],pg=CATS[c].pg,okp=sc>=pg;
  return '<div class="resc"><b>'+sc+'</b><small>'+label+'<br>PG '+pg+'</small><div style="margin-top:8px"><span class="pill '+(okp?"ok":"no")+'">'+(okp?"LULUS":"GAGAL")+'</span></div></div>';
 }
 var items=R.qs.map(function(q,i){
  var an=R.ans[i],weak;
  if(an<0)weak=true;
  else if(q.isTKP)weak=q.opts[an].s<=3;
  else weak=an!==q.a;
  return{cat:q.cat,q:q.q,weak:weak};
 });
 return head('<button class="backlink" onclick="go(\''+(R.pkg?"to_packs":"dash")+'\')">'+ic("back")+(R.pkg?"Paket Tryout":"Dashboard")+'</button><div class="card"><h2>Hasil Tryout '+(R.pkg?("— Paket "+R.pkg):"")+' '+(res.pass?"🎉":"😔")+'</h2>'
  +'<div style="text-align:center;margin:10px 0"><span class="pill '+(res.pass?"ok":"no")+'" style="font-size:16px;padding:8px 24px">'+(res.pass?"LULUS PASSING GRADE":"BELUM LULUS")+'</span></div>'
  +(res.pass?"":'<div class="motiv">🔥 <i>"'+esc(pickMotiv())+'"</i></div>')
  +'<div class="resgrid">'+rc("TWK","twk","TWK") +rc("TIU","tiu","TIU")+rc("TKP","tkp","TKP")+'</div>'
  +'<div style="text-align:center;color:#6b7280">Total skor: <b style="font-size:20px;color:#1e2433">'+res.total+'</b> / 550</div></div>'
  +techPanelHtml(items)
  +'<div class="card"><h2>Pembahasan</h2>'+reviewHtml(R.qs,R.ans)+'</div>');
}

/* ---------- MATERI ---------- */
window.openMatList=function(c){S.mat={cat:c,idx:0};go("mat_list");};
window.openMat=function(c,t){
 var arr=MAT[c]||[],idx=0;
 for(var i=0;i<arr.length;i++){if(arr[i].topic===t){idx=i;break;}}
 S.mat={cat:c,idx:idx};go("mat_view");
};
window.matMove=function(d){S.mat.idx+=d;go("mat_view");};
function vMatList(){
 var c=S.mat.cat,arr=MAT[c]||[];
 var h=arr.map(function(t,i){
  return '<div class="mattopic" onclick="openMat(\''+c+'\',\''+esc(t.topic)+'\')"><span class="mn">'+(i+1)+'</span><span>'+esc(t.topic)+'</span><span class="mgo">→</span></div>';
 }).join("");
 return head('<button class="backlink" onclick="go(\'dash\')">'+ic("back")+'Dashboard</button><div class="card"><h2>'+ic("book")+'Materi '+c+'</h2><p style="color:#6b7280;font-size:14px;margin-bottom:12px">'+esc(CATS[c].full)+'</p>'+(h||'<div class="empty">Materi belum tersedia.</div>')+'</div>');
}
function vMatView(){
 var M=S.mat,arr=MAT[M.cat]||[],t=arr[M.idx];
 if(!t)return head('<button class="backlink" onclick="go(\'dash\')">'+ic("back")+'Dashboard</button><div class="card"><div class="empty">Materi tidak ditemukan.</div></div>');
 var prev=M.idx>0,next=M.idx<arr.length-1;
 var readBtn="";
 if(window.PathLib){
  var done=false;
  (window.PATH_STEPS||[]).forEach(function(s){if(s.kind==="materi"&&s.cat===M.cat&&s.topic===t.topic&&PathLib.stepDone(s))done=true;});
  readBtn=done
   ?'<button class="btn plain" style="width:100%;margin-top:14px" disabled>'+ic("check")+'Sudah dibaca ✓</button>'
   :'<button class="btn" style="width:100%;margin-top:14px" onclick="markMatRead()">'+ic("check")+'Tandai sudah dibaca</button>';
 }
 return head('<button class="backlink" onclick="go(\'mat_list\')">'+ic("back")+'Daftar Materi</button><div class="card">'
  +'<div class="qmeta"><span class="badge '+CATS[M.cat].cls+'">'+M.cat+'</span><span style="color:#6b7280;font-size:13px">Topik '+(M.idx+1)+' / '+arr.length+'</span></div>'
  +'<h2 style="margin:10px 0 14px;font-size:19px">'+esc(t.topic)+'</h2>'
  +'<div class="matbody">'+t.html+'</div>'
  +readBtn
  +'<div class="qnav">'+(prev?'<button class="btn plain" onclick="matMove(-1)">'+ic("back")+'Sebelumnya</button>':"<span></span>")
  +(next?'<button class="btn" onclick="matMove(1)">Berikutnya '+ic("chev")+'</button>':"")+'</div></div>');
}
window.markMatRead=function(){
 var M=S.mat,arr=MAT[M.cat]||[],t=arr[M.idx];
 if(t&&window.PathLib)PathLib.completeMateri(M.cat,t.topic);
 render();
};

/* ---------- MENTOR 3D ---------- */
function naraSay(t){
 var b=document.getElementById("naraSay");
 if(b)b.innerHTML=t;
}
window.naraSay=naraSay;
function askNara(){
 var inp=document.getElementById("naraQ");
 var q=inp?inp.value.trim():"";
 if(!q){naraSay("Ketik dulu pertanyaanmu 🙂");return;}
 var r=window.Mentor3D?Mentor3D.searchMentor(q):null;
 if(!r){
  naraSay("Hmm, aku belum paham itu. Coba tanya tentang <b>rumus matematika</b>, <b>deret angka</b>, <b>sejarah proklamasi</b>, atau <b>sinonim</b>…");
  if(window.Mentor3D)Mentor3D.speak("Hmm, aku belum paham itu. Coba tanya hal lain ya.");
  return;
 }
 if(r.kind==="topic"){S.mentor={kind:"topic",cat:r.cat,topic:r.topic};go("mentor_ex");}
 else{S.mentor={kind:"q",cat:r.cat,idx:r.idx,id:r.id};go("mentor_ex");}
}
window.askNara=askNara;
function naraAsk(q){var i=document.getElementById("naraQ");if(i)i.value=q;askNara();}
window.naraAsk=naraAsk;
function openMentorQ(id){
 var f=window.Mentor3D?Mentor3D.findQ(id):null;
 if(!f)return;
 S.mentor={kind:"q",cat:f.cat,idx:f.idx,id:id};go("mentor_ex");
}
window.openMentorQ=openMentorQ;
function stopExplain(){
 if(window.Mentor3D)Mentor3D.stop();
 naraSay("Oke, berhenti dulu. Tekan Jelaskan kalau mau diulang.");
}
window.stopExplain=stopExplain;
function replayExplain(){startExplain();}
window.replayExplain=replayExplain;
function startExplain(){
 var Mc=S.mentor;if(!Mc||!window.Mentor3D)return;
 var text;
 if(Mc.kind==="topic")text=Mentor3D.materiSpeech(Mc.cat,Mc.topic);
 else text=Mentor3D.soalSpeech(Mc.cat,Mc.idx);
 naraSay("Nara lagi ngejelasin… dengerin ya 🙂");
 Mentor3D.speak(text,{
  onReady:function(sents){
   var box=document.getElementById("naraText");
   if(box)box.innerHTML=sents.map(function(s,i){return '<span class="msen" data-i="'+i+'">'+esc(s)+"</span>";}).join(" ");
  },
  onSentence:function(i){
   var box=document.getElementById("naraText");if(!box)return;
   var els=box.querySelectorAll(".msen"),k;
   for(k=0;k<els.length;k++)els[k].classList.remove("on");
   var el=box.querySelector('[data-i="'+i+'"]');
   if(el){el.classList.add("on");try{el.scrollIntoView({block:"nearest"});}catch(e){}}
  },
  onDone:function(){naraSay("Gimana, paham? Tanya lagi kalau masih bingung 🙂");}
 });
}
function mentorQHtml(cat,q){
 var rows=q.opts.map(function(o,j){
  var txt=cat==="TKP"?o.t:o,cls="ro";
  if(cat==="TKP"){if(o.s===5)cls+=" cc";}
  else{if(j===q.a)cls+=" cc";}
  return '<div class="'+cls+'"><b>'+String.fromCharCode(65+j)+'.</b> '+esc(txt)+(cat==="TKP"?' <span style="color:#6b7280">('+o.s+')</span>':"")+'</div>';
 }).join("");
 return '<div class="qmeta"><span class="badge '+CATS[cat].cls+'">'+cat+'</span><span style="color:#6b7280;font-size:13px">'+esc(q.id)+'</span></div>'
  +'<p style="font-size:15.5px;font-weight:600;margin:10px 0 12px;line-height:1.6">'+esc(q.q)+'</p>'+rows
  +'<div class="explain"><b>Pembahasan:</b> '+esc(q.ex)+'</div>';
}
function vMentor(){
 var wrong=window.Mentor3D?Mentor3D.wrongList(8):[];
 var whtml=wrong.length?wrong.map(function(w){
  var stem="",f=Mentor3D.findQ(w.id);
  if(f){var q=Mentor3D.getQ(f.cat,f.idx);if(q)stem=q.q;}
  return '<div class="mattopic" onclick="openMentorQ(\''+w.id+'\')"><span class="mn">'+w.cat+'</span><span style="font-weight:400;font-size:13.5px">'+esc(stem.slice(0,72))+'…</span><span class="mgo">→</span></div>';
 }).join(""):'<div class="empty">Belum ada soal salah — pertahankan! 🎉<br><br><button class="btn" onclick="go(\'lat_cat\')">Mulai Latihan</button></div>';
 var chips=["Rumus matematika","Deret angka","Sejarah proklamasi","Sinonim antonim","UUD 1945","Pelayanan publik"].map(function(c){
  return '<button class="chip" onclick="naraAsk(\''+c+'\')">'+c+'</button>';
 }).join("");
 return head('<button class="backlink" onclick="go(\'dash\')">'+ic("back")+'Dashboard</button>'
 +'<div class="m3dwrap"><canvas id="m3d"></canvas><div class="narasay" id="naraSay">Halo! Aku <b>Nara</b>, mentor belajarmu!</div></div>'
 +'<div class="card"><h2>'+ic("chat")+'Tanya Nara</h2>'
 +'<div class="msearch"><input id="naraQ" placeholder="cth: rumus deret angka…" onkeydown="if(event.key===\'Enter\')askNara()"><button class="btn" onclick="askNara()">Tanya</button></div>'
 +'<div class="chips">'+chips+'</div></div>'
 +'<div class="card"><h2>'+ic("grad")+'Soal yang pernah kamu salah</h2>'+whtml+'</div>');
}
function vMentorEx(){
 var Mc=S.mentor;
 if(!Mc)return head('<button class="backlink" onclick="go(\'mentor\')">'+ic("back")+'Mentor</button><div class="card"><div class="empty">Pilih dulu yang mau dijelasin.</div></div>');
 var body="";
 if(Mc.kind==="topic"){
  var t=null,arr=MAT[Mc.cat]||[],i;
  for(i=0;i<arr.length;i++)if(arr[i].topic===Mc.topic)t=arr[i];
  body='<div class="qmeta"><span class="badge '+CATS[Mc.cat].cls+'">'+Mc.cat+'</span></div><h2 style="margin:10px 0 14px;font-size:19px">'+esc(Mc.topic)+'</h2><div class="matbody">'+(t?t.html:"")+'</div>';
 }else{
  var q=window.Mentor3D?Mentor3D.getQ(Mc.cat,Mc.idx):null;
  body=q?mentorQHtml(Mc.cat,q):'<div class="empty">Soal tidak ditemukan.</div>';
 }
 return head('<button class="backlink" onclick="go(\'mentor\')">'+ic("back")+'Mentor</button>'
 +'<div class="m3dwrap small"><canvas id="m3d2"></canvas><div class="narasay" id="naraSay">Siap ngejelasin…</div></div>'
 +'<div class="card"><div id="naraCtl"><button class="btn" onclick="replayExplain()">'+ic("speaker")+'Jelaskan</button> <button class="btn plain" onclick="stopExplain()">'+ic("stop")+'Berhenti</button></div>'
 +'<div class="naraText" id="naraText"></div></div>'
 +'<div class="card">'+body+'</div>');
}

/* ---------- JALUR BELAJAR ---------- */
function pathBanner(){
 if(!window.PathLib)return "";
 var PL=window.PathLib,po=PL.overall(),ns=PL.nextStep();
 var ty=PL.schedToday(),tg=PL.schedTarget(),st=PL.schedStreak();
 var inner='<div class="pbtop"><b>🛤️ Jalur Belajar</b><span>'+po.done+'/'+po.total+' langkah • '+po.pct+'%</span></div>'
  +'<div class="bar"><i style="width:'+po.pct+'%"></i></div>'
  +'<div class="schedline">🎯 Hari ini <b>'+ty+'/'+tg+'</b> &nbsp;•&nbsp; 🔥 <b>'+st+'</b> hari beruntun</div>';
 if(ns)inner+='<button class="btn" onclick="event.stopPropagation();goNextStep()">▶ '+esc(PL.stepShort(ns))+'</button>';
 else inner+='<div class="empty" style="padding:6px">Semua langkah selesai. Luar biasa! 🎉</div>';
 return '<div class="pathbanner" onclick="go(\'jalur\')">'+inner+'</div>'
  +'<div class="trikbanner" onclick="go(\'trik\')"><b>⚡ Trik Cepat</b><span>50 jurus hemat waktu SKD</span><span class="mgo">'+ICONS.chev+'</span></div>';
}
function goStep(s){
 if(!s)return;
 if(s.kind==="materi")window.openMat(s.cat,s.topic);
 else if(s.kind==="latihan")go("latihan",{cat:s.cat,topic:s.topic,n:s.n});
 else if(s.kind==="review")go("review");
 else if(s.kind==="latihan_lemah"){
  var w=window.PathLib.weakestTopics(3);
  if(!w.length){alert("Belum ada data latihan yang cukup. Kerjakan latihan dulu ya!");return;}
  go("latihan",{list:w.map(function(x){return{cat:x.cat,topic:x.topic};}),n:s.n});
 }
 else if(s.kind==="tryout")window.startTo();
}
window.goStep=goStep;
window.goStepById=function(id){var s=window.PathLib?window.PathLib.stepById(id):null;if(s)goStep(s);};
window.goNextStep=function(){
 if(!window.PathLib){go("jalur");return;}
 var s=window.PathLib.nextStep();
 if(!s){go("jalur");return;}
 goStep(s);
};
function vJalur(){
 var PL=window.PathLib,steps=window.PATH_STEPS,fases=window.PATH_FASES,ns=PL.nextStep();
 var h='<button class="backlink" onclick="go(\'dash\')">'+ic("back")+'Dashboard</button>';
 h+='<div class="card"><h2>'+ic("layers")+'Jalur Belajar dari 0</h2>'
  +'<p style="color:#6b7280;font-size:14px;font-weight:600;margin-bottom:12px">Ikuti langkahnya satu per satu — dari nol sampai siap tryout. Langkah yang sudah selesai bisa diulang kapan saja.</p>'
  +(ns?'<button class="btn big" onclick="goNextStep()">▶ Lanjut: '+esc(PL.stepName(ns))+'</button>'
      :'<div class="perfect">'+ic("trophy")+' <b>Semua langkah selesai!</b><p>Tinggal jaga ritme dengan tryout berkala dan review terjadwal.</p></div>')
  +'</div>';
 /* --- Target Harian + Trik Cepat --- */
 var ty=PL.schedToday(),tg=PL.schedTarget(),st=PL.schedStreak();
 var tpct=tg?Math.min(100,Math.round(ty/tg*100)):0;
 h+='<div class="card"><h2>'+ic("target")+'Target Harian</h2>'
  +'<div class="prow"><div class="lbl"><span>🎯 Langkah selesai hari ini</span><span><b>'+ty+'</b> / '+tg+'</span></div><div class="bar"><i style="width:'+tpct+'%"></i></div></div>'
  +'<div class="trow"><span>🔥 <b>'+st+' hari</b> beruntun memenuhi target</span>'
  +'<span class="stepper"><button onclick="schedTargetChg(-1)">−</button><b>'+tg+'/hari</b><button onclick="schedTargetChg(1)">+</button></span></div>'
  +'<p class="muted">Setiap langkah Jalur yang selesai menambah hitungan hari ini. Target bisa diubah 1–5.</p></div>';
 h+='<button class="btn big" style="margin-bottom:14px" onclick="go(\'trik\')">⚡ Trik Cepat — 50 jurus hemat waktu</button>';
 fases.forEach(function(f){
  var fs=steps.filter(function(s){return s.fase===f.id;});
  var dn=fs.filter(function(s){return PL.stepDone(s);}).length;
  var pct=fs.length?Math.round(dn/fs.length*100):0;
  h+='<div class="card"><h2>'+ic(f.icon)+esc(f.name)+'</h2><p style="color:#6b7280;font-size:13.5px;font-weight:600;margin-bottom:8px">'+esc(f.desc)+'</p>'
   +'<div class="prow"><div class="lbl"><span>Progres fase</span><span>'+dn+'/'+fs.length+'</span></div><div class="bar"><i style="width:'+pct+'%"></i></div></div>';
  fs.forEach(function(s,i){
   var done=PL.stepDone(s),sub="";
   if(s.kind==="review"){var dc=PL.dueCount();sub=dc?dc+" soal menunggu direview":"Antrean kosong — aman!";}
   h+='<div class="steprow'+(done?" done":"")+'" onclick="goStepById(\''+s.id+'\')">'
    +'<span class="stn">'+(done?ic("check"):(i+1))+'</span>'
    +'<span style="flex:1">'+esc(PL.stepName(s))+(sub?'<small>'+sub+'</small>':"")+'</span>'
    +(done?'<span class="pill ok">Selesai</span>':'<span class="mgo">'+ICONS.chev+'</span>')
    +'</div>';
  });
  h+='</div>';
 });
 var best=PL.tryoutBest();
 h+='<div class="card"><h2>'+ic("target")+'Pelacak Passing Grade</h2><p style="color:#6b7280;font-size:13.5px;font-weight:600;margin-bottom:10px">Skor terbaikmu per subtest vs passing grade. Garis merah = batas lulus.</p>';
 ["TWK","TIU","TKP"].forEach(function(c){
  var pg=PL.PG[c],mx=CATS[c].max,b=best[c.toLowerCase()];
  var w=Math.min(100,Math.round(b/mx*100)),wm=Math.round(pg/mx*100);
  h+='<div class="prow"><div class="lbl"><span><b>'+c+'</b> — '+esc(CATS[c].full)+'</span><span><b>'+b+'</b> / PG '+pg+' '+(b>=pg?'<span class="pill ok">LULUS</span>':'<span class="pill no">BELUM</span>')+'</span></div>'
   +'<div class="bar pgbar"><i style="width:'+w+'%"></i><em style="left:'+wm+'%"></em></div></div>';
 });
 h+='</div>';
 return head(h);
}
function fmtRel(ts){
 var d=Math.ceil((ts-Date.now())/86400000);
 if(d<=0)return"segera";
 if(d===1)return"besok";
 return"dalam "+d+" hari";
}
function vReview(){
 var PL=window.PathLib,R=S.rev;
 if(!R){
  var due=shuffle(PL.dueList()).slice(0,20),items=[];
  due.forEach(function(id){
   var f=(window.Mentor3D&&window.Mentor3D.findQ(id))||null;
   if(f)items.push({id:id,cat:f.cat,idx:f.idx});
  });
  if(!items.length){
   var nxt=PL.nextDueAt();
   return head('<button class="backlink" onclick="go(\'jalur\')">'+ic("back")+'Jalur Belajar</button>'
    +'<div class="card"><h2>'+ic("check")+'Review Soal Salah</h2>'
    +'<div class="perfect">'+ic("target")+' <b>Antrean kosong — tidak ada soal yang jatuh tempo! 🎉</b><p>'+(nxt?"Soal berikutnya jatuh tempo "+esc(fmtRel(nxt))+". Tetap jaga ritme belajarmu.":"Kamu belum punya soal yang salah. Pertahankan!")+'</p></div>'
    +'<button class="btn big" onclick="go(\'jalur\')">Kembali ke Jalur</button></div>');
  }
  S.rev={items:items,pos:0,answered:false,pick:-1,cur:null,curPos:-1,res:{lulus:0,ulang:0}};
  R=S.rev;
 }
 var it=R.items[R.pos];
 if(!R.cur||R.curPos!==R.pos){R.cur=window.SIASN.prepQ(it.cat,it.idx);R.curPos=R.pos;}
 var q=R.cur,total=R.items.length;
 var opts=q.opts.map(function(o,i){
  var txt=q.isTKP?o.t:o;
  var cls="opt",dis=R.answered?"disabled":"";
  if(R.answered){
   if(q.isTKP){if(o.s===5)cls+=" correct";else if(i===R.pick)cls+=" wrong";}
   else{if(i===q.a)cls+=" correct";else if(i===R.pick)cls+=" wrong";}
  }
  return '<button class="'+cls+'" '+dis+' onclick="ansRev('+i+')"><span class="k">'+String.fromCharCode(65+i)+'</span><span>'+esc(txt)+'</span></button>';
 }).join("");
 var fb="";
 if(R.answered){
  var good=q.isTKP?q.opts[R.pick].s===5:R.pick===q.a;
  fb='<div class="explain"><div class="fb '+(good?"ok\">"+ic("check")+"Tepat!":"no\">"+ic("x")+"Kurang tepat.")+'</div> '+esc(q.ex)+'</div>';
 }
 return head('<button class="backlink" onclick="go(\'jalur\')">'+ic("back")+'Jalur Belajar</button><div class="card">'
  +'<div class="qmeta"><span class="badge '+CATS[it.cat].cls+'">'+it.cat+'</span><span style="color:#6b7280;font-size:13px">Review '+(R.pos+1)+' / '+total+'</span></div>'
  +'<div class="qtext">'+esc(q.q)+'</div><div class="opts">'+opts+'</div>'+fb
  +(R.answered?'<div class="qnav"><button class="btn plain" onclick="endRev()">Selesai</button><button class="btn" onclick="nextRev()">Lanjut '+ic("chev")+'</button></div>':"")
  +'</div>');
}
window.ansRev=function(i){
 var R=S.rev;if(!R||R.answered)return;
 R.answered=true;R.pick=i;
 var q=R.cur,it=R.items[R.pos],good=q.isTKP?q.opts[i].s===5:i===q.a;
 if(good){var r=window.PathLib.srsRight(it.id);if(r.lulus)R.res.lulus++;else R.res.ulang++;}
 else{window.PathLib.srsWrong(it.id);R.res.ulang++;}
 ST.done[it.id]={c:it.cat,ok:good?1:0};save();
 render();
};
window.nextRev=function(){
 var R=S.rev;if(!R)return;
 R.pos++;R.answered=false;R.pick=-1;
 if(R.pos>=R.items.length){window.endRev();return;}
 go("review");
};
window.endRev=function(){S.revDone=S.rev;S.rev=null;go("rev_result");};
function vRevResult(){
 var PL=window.PathLib,R=S.revDone||{res:{lulus:0,ulang:0},items:[]};
 return head('<button class="backlink" onclick="go(\'jalur\')">'+ic("back")+'Jalur Belajar</button><div class="card"><h2>Hasil Review</h2>'
  +'<div class="grid4"><div class="stat"><b>'+R.items.length+'</b><span>Soal direview</span></div><div class="stat"><b>'+R.res.lulus+'</b><span>Lulus</span></div><div class="stat"><b>'+R.res.ulang+'</b><span>Dijadwal ulang</span></div><div class="stat"><b>'+PL.dueCount()+'</b><span>Sisa antrean</span></div></div>'
  +'<div class="info"><b>Cara kerja review terjadwal:</b> soal yang benar 2x beruntun = lulus dan keluar dari jadwal. Yang belum lulus muncul lagi dengan interval 1 → 3 → 7 → 14 → 30 hari.</div>'
  +'<button class="btn big" onclick="go(\'jalur\')">Kembali ke Jalur</button></div>');
}

/* ---------- TRIK CEPAT ---------- */
function vTrik(){
 var groups=["TIU","TWK","TKP","UMUM"];
 var gname={TIU:"Tes Intelegensia Umum",TWK:"Tes Wawasan Kebangsaan",TKP:"Tes Karakteristik Pribadi",UMUM:"Strategi Ujian SKD"};
 var gcls={TIU:"tiu",TWK:"",TKP:"tkp",UMUM:""};
 var h='<button class="backlink" onclick="go(\'dash\')">'+ic("back")+'Dashboard</button>'
  +'<div class="card"><h2>⚡ Trik Cepat</h2><p style="color:#6b7280;font-size:14px;font-weight:600;margin-bottom:4px">50 jurus hemat waktu ala bimbel — esensi teknik tercepat per tipe soal + strategi hari-H. Ketuk kartunya untuk buka isinya.</p></div>';
 groups.forEach(function(g){
  var list=(window.TRIK||[]).filter(function(t){return t.cat===g;});
  if(!list.length)return;
  h+='<div class="card"><h2><span class="badge '+gcls[g]+'">'+g+'</span> '+esc(gname[g])+' <span class="wpill">'+list.length+' trik</span></h2>';
  list.forEach(function(t){
   h+='<details class="trik"><summary><b style="flex:1">'+esc(t.judul)+'</b><span class="ttopic">'+esc(t.topic)+'</span></summary><div class="trikbody">'+t.isi+'</div></details>';
  });
  h+='</div>';
 });
 return head(h);
}
window.schedTargetChg=function(d){
 if(!window.PathLib)return;
 PathLib.setTarget(PathLib.schedTarget()+d);
 render();
};

/* ---------- RENDER ---------- */
function render(){
 var el=document.getElementById("app"),h="";
 if(S.view==="dash")h=vDash();
 else if(S.view==="lat_cat")h=vLatCat();
 else if(S.view==="lat_topic")h=vLatTopic();
 else if(S.view==="lat")h=vLat();
 else if(S.view==="lat_result")h=vLatResult();
 else if(S.view==="to_intro")h=vToIntro();
 else if(S.view==="to_packs")h=vToPacks();
 else if(S.view==="to")h=vTo();
 else if(S.view==="to_result")h=vToResult();
 else if(S.view==="mat_list")h=vMatList();
 else if(S.view==="mat_view")h=vMatView();
 else if(S.view==="mentor")h=vMentor();
 else if(S.view==="mentor_ex")h=vMentorEx();
 else if(S.view==="jalur")h=vJalur();
 else if(S.view==="trik")h=vTrik();
 else if(S.view==="review")h=vReview();
 else if(S.view==="rev_result")h=vRevResult();
 el.innerHTML=h;
 if(window.Mentor3D){
  if(S.view==="mentor"){var c1=document.getElementById("m3d");if(c1&&Mentor3D.init(c1))Mentor3D.greet(naraSay);}
  else if(S.view==="mentor_ex"){var c2=document.getElementById("m3d2");if(c2&&Mentor3D.init(c2))setTimeout(startExplain,400);}
 }
}
render();
})();

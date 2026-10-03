/* SiASN — Jalur Belajar dari 0.
   PATH_STEPS: 3 fase terpandu. PathLib: progress store + spaced repetition (SRS).
   100% client-side, localStorage key: siasn_path_v1. */
(function(){
"use strict";

/* ---------- DEFINISI LANGKAH ---------- */
var ORDER=[
 ["twk","Pancasila"],["twk","UUD 1945"],["twk","NKRI & Kebangsaan"],["twk","Bela Negara"],["twk","Sejarah Nasional"],["twk","Bahasa Indonesia"],
 ["tiu","Sinonim"],["tiu","Antonim"],["tiu","Aritmetika"],["tiu","Deret Angka"],["tiu","Analogi"],["tiu","Penalaran Logis"],["tiu","Figural"],
 ["tkp","Sosial Budaya"],["tkp","Kerjasama Tim"],["tkp","Profesionalisme & Integritas"],["tkp","Pelayanan Publik"],["tkp","TIK & Digital"],["tkp","Anti-Radikalisme"]
];
var STEPS=[];
ORDER.forEach(function(o,i){
 var c=o[0],t=o[1];
 STEPS.push({id:"f1-"+c+"-"+i+"-m",fase:1,kind:"materi",cat:c,topic:t});
 STEPS.push({id:"f1-"+c+"-"+i+"-l",fase:1,kind:"latihan",cat:c,topic:t,n:15});
});
STEPS.push({id:"f2-review",fase:2,kind:"review"});
STEPS.push({id:"f2-lemah",fase:2,kind:"latihan_lemah",n:20});
STEPS.push({id:"f3-to1",fase:3,kind:"tryout"});
STEPS.push({id:"f3-to2",fase:3,kind:"tryout"});
STEPS.push({id:"f3-to3",fase:3,kind:"tryout"});

var FASES=[
 {id:1,name:"Fondasi",desc:"Baca materi + latihan 15 soal per topik, diurutkan dari yang paling dasar.",icon:"layers"},
 {id:2,name:"Penguatan",desc:"Ulas soal yang pernah salah (terjadwal otomatis) + hajar 3 topik terlemahmu.",icon:"zap"},
 {id:3,name:"Tempur",desc:"3x tryout full: 110 soal, 100 menit — persis ujian SKD asli.",icon:"trophy"}
];

var PG={TWK:65,TIU:80,TKP:166};

/* ---------- STORE ---------- */
var LS="siasn_path_v1";
var DAY=86400000;
var INTERVAL=[1,3,7,14,30]; /* hari */
var mem=null;

function siasnST(){return (window.SIASN&&window.SIASN.ST)||{done:{},tryouts:[]};}
function load(){
 if(mem)return mem;
 var s=null;
 try{s=JSON.parse(localStorage.getItem(LS));}catch(e){}
 if(!s||typeof s!=="object")s={};
 if(!s.done)s.done={};
 if(!s.srs)s.srs={};
 mem=s;
 if(!s.seeded){ /* angkut soal-salah lama dari ST.done ke antrean SRS */
  var st=siasnST(),now=Date.now(),n=0;
  Object.keys(st.done||{}).forEach(function(id){
   if(st.done[id]&&!st.done[id].ok&&!mem.srs[id]){
    mem.srs[id]={box:0,nextDue:now,streak:0};n++;
   }
  });
  mem.seeded=true;save();
 }
 return mem;
}
function save(){try{localStorage.setItem(LS,JSON.stringify(mem));}catch(e){}}

/* ---------- PROGRESS ---------- */
function stepById(id){for(var i=0;i<STEPS.length;i++)if(STEPS[i].id===id)return STEPS[i];return null;}
function isDone(id){load();return !!mem.done[id];}
function markDone(id){load();mem.done[id]=true;save();}

function dueList(){
 load();var now=Date.now(),out=[];
 Object.keys(mem.srs).forEach(function(id){if(mem.srs[id].nextDue<=now)out.push(id);});
 return out;
}
function nextDueAt(){
 load();var now=Date.now(),best=null;
 Object.keys(mem.srs).forEach(function(id){var t=mem.srs[id].nextDue;if(t>now&&(best===null||t<best))best=t;});
 return best;
}
function stepDone(s){
 if(s.kind==="review")return dueList().length===0; /* repeatable: selesai saat antrean kosong */
 return isDone(s.id);
}
function nextStep(){
 for(var i=0;i<STEPS.length;i++)if(!stepDone(STEPS[i]))return STEPS[i];
 return null;
}
function overall(){
 var d=0;STEPS.forEach(function(s){if(stepDone(s))d++;});
 return{done:d,total:STEPS.length,pct:Math.round(d/STEPS.length*100)};
}

/* ---------- SPACED REPETITION ---------- */
function srsWrong(qid){
 load();
 mem.srs[qid]={box:0,nextDue:Date.now()+DAY,streak:0};
 save();
}
function srsRight(qid){
 load();var e=mem.srs[qid];
 if(!e)return{lulus:false};
 e.streak++;e.box++;
 if(e.streak>=2){delete mem.srs[qid];save();return{lulus:true};}
 e.nextDue=Date.now()+INTERVAL[Math.min(e.box,INTERVAL.length-1)]*DAY;
 save();return{lulus:false,nextIn:INTERVAL[Math.min(e.box,INTERVAL.length-1)]};
}

/* ---------- ANALITIK ---------- */
function weakestTopics(k){
 k=k||3;
 var st=siasnST(),map={};
 Object.keys(st.done||{}).forEach(function(id){
  var d=st.done[id];if(!d)return;
  var f=(window.Mentor3D&&window.Mentor3D.findQ(id))||null;
  if(!f)return;
  var arr=(window.SIASN&&window.SIASN.BANK&&window.SIASN.BANK[f.cat])||[];
  var q=arr[f.idx];if(!q)return;
  var tp=(window.SIASN&&window.SIASN.topicOf)?window.SIASN.topicOf(f.cat,q.q):"Umum";
  var key=f.cat+"|"+tp;
  if(!map[key])map[key]={cat:f.cat,topic:tp,total:0,ok:0};
  map[key].total++;if(d.ok)map[key].ok++;
 });
 var rows=Object.keys(map).map(function(x){return map[x];})
  .filter(function(r){return r.total>=2;});
 rows.sort(function(a,b){return(a.ok/a.total)-(b.ok/b.total);});
 return rows.slice(0,k);
}
function tryoutBest(){
 var st=siasnST(),b={twk:0,tiu:0,tkp:0};
 (st.tryouts||[]).forEach(function(t){
  ["twk","tiu","tkp"].forEach(function(x){if(t[x]>b[x])b[x]=t[x];});
 });
 return b;
}

/* ---------- HOOK PENYELESAIAN ---------- */
function completeMateri(cat,topic){
 STEPS.forEach(function(s){
  if(s.kind==="materi"&&s.cat===cat&&s.topic===topic)markDone(s.id);
 });
}
function completeLatihan(p){
 if(p&&p.list){markDone("f2-lemah");return;}
 if(!p||!p.topic)return;
 STEPS.forEach(function(s){
  if(s.kind==="latihan"&&s.cat===p.cat&&s.topic===p.topic)markDone(s.id);
 });
}
function completeTryout(){
 for(var i=0;i<STEPS.length;i++){
  var s=STEPS[i];
  if(s.kind==="tryout"&&!isDone(s.id)){markDone(s.id);return;}
 }
}

/* ---------- LABEL ---------- */
function stepName(s){
 if(s.kind==="materi")return"Baca materi: "+s.topic;
 if(s.kind==="latihan")return"Latihan "+s.topic+" ("+(s.n||15)+" soal)";
 if(s.kind==="review")return"Review soal salah";
 if(s.kind==="latihan_lemah")return"Latihan 3 topik terlemah ("+(s.n||20)+" soal)";
 if(s.kind==="tryout"){
  var m=/f3-to(\d)/.exec(s.id);
  return"Tryout "+(m?m[1]:s.id)+" — 110 soal, 100 menit";
 }
 return s.id;
}
function stepShort(s){
 if(s.kind==="materi")return"Baca: "+s.topic;
 if(s.kind==="latihan")return"Latihan: "+s.topic;
 if(s.kind==="review")return"Review soal salah";
 if(s.kind==="latihan_lemah")return"Hajar topik lemah";
 if(s.kind==="tryout"){var m=/f3-to(\d)/.exec(s.id);return"Tryout "+(m?m[1]:"");}
 return s.id;
}

window.PATH_STEPS=STEPS;
window.PATH_FASES=FASES;
window.PathLib={
 PG:PG,INTERVAL:INTERVAL,
 stepById:stepById,isDone:isDone,markDone:markDone,stepDone:stepDone,
 nextStep:nextStep,overall:overall,
 dueList:dueList,nextDueAt:nextDueAt,dueCount:function(){return dueList().length;},
 srsWrong:srsWrong,srsRight:srsRight,
 weakestTopics:weakestTopics,tryoutBest:tryoutBest,
 completeMateri:completeMateri,completeLatihan:completeLatihan,completeTryout:completeTryout,
 stepName:stepName,stepShort:stepShort
};
})();

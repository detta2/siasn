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
 for(var b=2;b<=11;b++){arr=arr.concat(window["QB_"+c+"_B"+b]||[]);}
 BANK[c]=arr;
});
var LS="siasn_v1";
function load(){try{var s=JSON.parse(localStorage.getItem(LS));if(s&&s.done)return s;}catch(e){}return{done:{},tryouts:[]};}
function save(){try{localStorage.setItem(LS,JSON.stringify(ST));}catch(e){}}
var ST=load();
var S={view:"dash"};
function esc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function fmtT(s){s=Math.max(0,s);var m=Math.floor(s/60),h=Math.floor(m/60);m=m%60;var ss=s%60;function p(x){return(x<10?"0":"")+x;}return(h>0?p(h)+":":"")+p(m)+":"+p(ss);}
function head(inner){return '<div class="topbar"><div class="logo">A</div><div class="brand"><b>SiASN</b><span>Latihan SKD CPNS</span></div></div>'+inner;}
function go(v){S.view=v;render();window.scrollTo(0,0);}
window.go=go;

/* ---------- DASHBOARD ---------- */
function vDash(){
 var done=Object.keys(ST.done),nDone=done.length,ok=0;
 done.forEach(function(k){if(ST.done[k].ok)ok++;});
 var acc=nDone?Math.round(ok/nDone*100):0;
 var nTo=ST.tryouts.length,best=0;
 ST.tryouts.forEach(function(t){if(t.total>best)best=t.total;});
 var cards='<div class="grid4">'
  +'<div class="stat"><b>'+nDone+'</b><span>Soal dikerjakan</span></div>'
  +'<div class="stat"><b>'+acc+'%</b><span>Akurasi latihan</span></div>'
  +'<div class="stat"><b>'+nTo+'</b><span>Tryout</span></div>'
  +'<div class="stat"><b>'+best+'</b><span>Skor terbaik</span></div></div>';
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
  '<div class="hero"><h1>Siap jadi ASN? 🇮🇩</h1><p>Latihan soal TWK, TIU, TKP dimodelkan dari pola soal CPNS tahun-tahun sebelumnya, plus tryout persis format SKD asli: 110 soal, 100 menit.</p>'
  +'<div class="cta"><button class="btn ghost" onclick="go(\'lat_cat\')">Latihan Soal</button><button class="btn" style="background:#fff;color:#4f46e5" onclick="go(\'to_intro\')">Tryout SKD</button></div></div>'
  +'<div class="card"><h2>📊 Progresmu</h2>'+cards+'</div>'
  +'<div class="card"><h2>📚 Bank Soal</h2>'+prog+'</div>'
  +'<div class="card"><h2>📝 Riwayat Tryout</h2>'+hist+'</div>'
  +'<div class="info"><b>Format SKD asli:</b> TWK 30 soal (PG 65) • TIU 35 soal (PG 80) • TKP 45 soal (PG 166) • Total 110 soal, 100 menit. Lulus = ketiga komponen mencapai passing grade masing-masing.</div>'
  +'<div class="footer">SiASN • soal latihan dimodelkan dari kisi-kisi & pola soal CPNS sebelumnya</div>'
 );
}

/* ---------- LATIHAN ---------- */
function vLatCat(){
 var h='<div class="grid3">';
 Object.keys(CATS).forEach(function(c){
  var tot=BANK[c].length,dn=0;
  Object.keys(ST.done).forEach(function(k){if(ST.done[k].c===c)dn++;});
  h+='<div class="catchoice" onclick="startLat(\''+c+'\')"><b>'+c+'</b><p>'+esc(CATS[c].full)+'</p><span class="badge '+CATS[c].cls+'">'+dn+'/'+tot+' dikerjakan</span></div>';
 });
 return head('<button class="backlink" onclick="go(\'dash\')">← Dashboard</button><div class="card"><h2>Latihan Soal</h2><p style="color:#6b7280;font-size:14px;margin-bottom:14px">Pilih kategori. Jawaban langsung dikoreksi + pembahasan.</p>'+h+'</div>');
}
window.startLat=function(c){
 if(!BANK[c].length){alert("Bank soal "+c+" belum siap.");return;}
 S.lat={cat:c,order:shuffle(BANK[c].map(function(_,i){return i;})),pos:0,answered:false,pick:-1};
 go("lat");
};
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
 var L=S.lat,q=prepQ(L.cat,L.order[L.pos]);
 L.cur=q;
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
  fb='<div class="explain"><b>'+(good?"✅ Tepat!":"❌ Kurang tepat.")+'</b> '+esc(q.ex)+'</div>';
 }
 return head('<button class="backlink" onclick="go(\'lat_cat\')">← Kategori</button><div class="card">'
  +'<div class="qmeta"><span class="badge '+CATS[L.cat].cls+'">'+L.cat+'</span><span style="color:#6b7280;font-size:13px">Soal '+(L.pos+1)+' / '+total+'</span></div>'
  +'<div class="qtext">'+esc(q.q)+'</div><div class="opts">'+opts+'</div>'+fb
  +(L.answered?'<div class="qnav"><span></span><button class="btn" onclick="nextLat()">Lanjut →</button></div>':"")
  +'</div>');
}
window.ansLat=function(i){
 var L=S.lat;if(L.answered)return;
 L.answered=true;L.pick=i;
 var q=L.cur,good=q.isTKP?q.opts[i].s===5:i===q.a;
 ST.done[q.id]={c:L.cat,ok:good?1:0};save();
 render();
};
window.nextLat=function(){
 var L=S.lat;L.pos++;
 if(L.pos>=L.order.length){L.order=shuffle(L.order);L.pos=0;}
 L.answered=false;L.pick=-1;go("lat");
};

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

/* ---------- TRYOUT ---------- */
function vToIntro(){
 return head('<button class="backlink" onclick="go(\'dash\')">← Dashboard</button><div class="card"><h2>Tryout SKD</h2>'
  +'<div class="info"><b>Simulasi persis ujian asli:</b><br>• 110 soal: TWK 30 • TIU 35 • TKP 45<br>• Waktu 100 menit (otomatis selesai saat habis)<br>• TWK/TIU: benar 5, salah 0 • TKP: skala 1–5<br>• Passing grade: TWK 65, TIU 80, TKP 166</div>'
  +'<button class="btn big" onclick="startTo()">Mulai Tryout</button></div>');
}
window.startTo=function(){
 var qs=[];
 Object.keys(CATS).forEach(function(c){
  var idx=shuffle(BANK[c].map(function(_,i){return i;})).slice(0,CATS[c].n);
  idx.forEach(function(ii){qs.push(prepQ(c,ii));});
 });
 if(qs.length<110){alert("Bank soal belum lengkap untuk tryout (butuh 110, ada "+qs.length+").");return;}
 S.to={qs:qs,ans:new Array(qs.length).fill(-1),doubt:{},idx:0,left:6000,timer:null};
 go("to");
 S.to.timer=setInterval(function(){
  if(S.view!=="to"||!S.to){clearInterval(S.to.timer);return;}
  S.to.left--;
  var el=document.getElementById("tmr");
  if(el){el.textContent=fmtT(S.to.left);if(S.to.left<300)el.classList.add("low");}
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
 return head('<div class="card"><div class="tobar"><button class="backlink" style="margin:0" onclick="abortTo()">✕ Batal</button>'
  +'<span class="timer" id="tmr">'+fmtT(T.left)+'</span>'
  +'<button class="btn" onclick="finishTo(true)">Selesai</button></div>'
  +'<div class="qmeta"><span class="badge '+CATS[q.cat].cls+'">'+q.cat+'</span><span style="color:#6b7280;font-size:13px">Soal '+(T.idx+1)+' / '+T.qs.length+'</span></div>'
  +secTtl+'<div class="qtext">'+esc(q.q)+'</div><div class="opts">'+opts+'</div>'
  +'<label class="doubtrow"><input type="checkbox" '+(T.doubt[T.idx]?"checked":"")+' onchange="togDoubt(this.checked)"> Ragu-ragu</label>'
  +'<div class="qnav"><button class="btn plain" '+(T.idx===0?"disabled":"")+' onclick="moveTo(-1)">← Sebelumnya</button>'
  +'<button class="btn plain" '+(T.idx===T.qs.length-1?"disabled":"")+' onclick="moveTo(1)">Berikutnya →</button></div>'
  +'<div class="numgrid">'+grid+'</div></div>');
}
window.ansTo=function(i){S.to.ans[S.to.idx]=i;render();};
window.jumpTo=function(i){S.to.idx=i;render();window.scrollTo(0,0);};
window.moveTo=function(d){S.to.idx=Math.min(S.to.qs.length-1,Math.max(0,S.to.idx+d));render();window.scrollTo(0,0);};
window.togDoubt=function(v){if(v)S.to.doubt[S.to.idx]=1;else delete S.to.doubt[S.to.idx];};
window.abortTo=function(){if(confirm("Batalkan tryout? Progres hilang.")){clearInterval(S.to.timer);S.to=null;go("dash");}};
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
 ST.tryouts.push({d:ds,twk:res.twk,tiu:res.tiu,tkp:res.tkp,total:res.total,pass:res.pass?1:0});
 save();
 S.res={res:res,qs:T.qs,ans:T.ans};
 S.to=null;go("to_result");
};
function vToResult(){
 var R=S.res,res=R.res;
 function rc(c,key,label){
  var sc=res[key],pg=CATS[c].pg,okp=sc>=pg;
  return '<div class="resc"><b>'+sc+'</b><small>'+label+'<br>PG '+pg+'</small><div style="margin-top:8px"><span class="pill '+(okp?"ok":"no")+'">'+(okp?"LULUS":"GAGAL")+'</span></div></div>';
 }
 return head('<button class="backlink" onclick="go(\'dash\')">← Dashboard</button><div class="card"><h2>Hasil Tryout '+(res.pass?"🎉":"😔")+'</h2>'
  +'<div style="text-align:center;margin:10px 0"><span class="pill '+(res.pass?"ok":"no")+'" style="font-size:16px;padding:8px 24px">'+(res.pass?"LULUS PASSING GRADE":"BELUM LULUS")+'</span></div>'
  +'<div class="resgrid">'+rc("TWK","twk","TWK") +rc("TIU","tiu","TIU")+rc("TKP","tkp","TKP")+'</div>'
  +'<div style="text-align:center;color:#6b7280">Total skor: <b style="font-size:20px;color:#1e2433">'+res.total+'</b> / 550</div></div>'
  +'<div class="card"><h2>Pembahasan</h2>'+reviewHtml(R.qs,R.ans)+'</div>');
}

/* ---------- RENDER ---------- */
function render(){
 var el=document.getElementById("app"),h="";
 if(S.view==="dash")h=vDash();
 else if(S.view==="lat_cat")h=vLatCat();
 else if(S.view==="lat")h=vLat();
 else if(S.view==="to_intro")h=vToIntro();
 else if(S.view==="to")h=vTo();
 else if(S.view==="to_result")h=vToResult();
 el.innerHTML=h;
}
render();
})();

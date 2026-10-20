/* SiASN Mentor 3D — "Nara". Avatar robot + suara (Web Speech API) + penjelasan dari bank soal & materi. 100% client-side. */
(function(){
"use strict";

/* ================= TEKS ================= */
function plain(html){
 return String(html||"").replace(/<[^>]+>/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g," ").trim();
}
function sentences(t){
 t=String(t||"").replace(/\s+/g," ").trim();
 if(!t)return[];
 var parts=t.replace(/([.!?…])\s+(?=[A-Z0-9"“\(\[])/g,"$1|").split("|");
 var out=[],cur="";
 function pushCur(){cur=cur.trim();if(cur.length>2)out.push(cur);cur="";}
 for(var i=0;i<parts.length;i++){
  var p=parts[i].trim();
  if(!p||p.length<3)continue;
  cur+=(cur?" ":"")+p;
  if(cur.length>=50)pushCur();
 }
 pushCur();
 var fin=[];
 out.forEach(function(s){
  while(s.length>280){
   var cut=s.slice(0,280),sp=cut.lastIndexOf(" ");
   if(sp<100)sp=280;
   fin.push(s.slice(0,sp).trim());s=s.slice(sp).trim();
  }
  if(s.length>2)fin.push(s);
 });
 return fin;
}
function sectionsOf(html){
 var parts=String(html||"").split(/<h3[^>]*>/i),out=[];
 for(var i=1;i<parts.length;i++){
  var p=parts[i],j=p.search(/<\/h3>/i);
  if(j<0)continue;
  out.push({title:plain(p.slice(0,j)),body:plain(p.slice(j+5))});
 }
 return out;
}
function findTopic(cat,topic){
 var arr=(window["MAT_"+cat]||[]),t=null;
 for(var i=0;i<arr.length;i++)if(arr[i].topic===topic){t=arr[i];break;}
 return t;
}
function cap(s,n){
 s=String(s||"");
 if(s.length<=n)return s;
 return s.slice(0,n).replace(/\s+\S*$/,"")+"…";
}
function materiSpeech(cat,topic){
 var t=findTopic(cat,topic);
 if(!t)return"";
 var secs=sectionsOf(t.html);
 var prio=["Cara Mengerjakan","Poin Kunci","Prinsip","Contoh","Pola / Rumus Kunci","Cara Menjawab","Contoh Pola"];
 secs.sort(function(a,b){
  function pi(s){for(var i=0;i<prio.length;i++)if(s.title.indexOf(prio[i])>=0)return i;return 99;}
  return pi(a)-pi(b);
 });
 var txt=secs.map(function(s){return s.title+". "+s.body;}).join(" ");
 return "Materi "+topic+". "+cap(txt,1500);
}
function bank(){
 return (window.SIASN&&window.SIASN.BANK)||{TWK:[],TIU:[],TKP:[]};
}
var qIndex=null;
function buildIndex(){
 qIndex={};
 ["TWK","TIU","TKP"].forEach(function(c){
  var arr=bank()[c]||[];
  for(var i=0;i<arr.length;i++)qIndex[arr[i].id]={cat:c,idx:i};
 });
}
function findQ(id){
 if(!qIndex)buildIndex();
 return qIndex[id]||null;
}
function getQ(cat,idx){
 var arr=bank()[cat]||[];
 return arr[idx]||null;
}
function soalSpeech(cat,idx){
 var q=getQ(cat,idx);
 if(!q)return"";
 var head="Soal. "+q.q+" ";
 var ans="";
 if(cat==="TKP"){
  var best=null;
  for(var i=0;i<q.opts.length;i++)if(!best||q.opts[i].s>best.s)best=q.opts[i];
  ans="Jawaban terbaik: "+(best?best.t:"")+". ";
 }else{
  ans="Jawaban yang benar: "+q.opts[q.a]+". ";
 }
 return cap(head+ans+"Pembahasan. "+(q.ex||""),1600);
}

/* ================= PENCARIAN ================= */
var TOPIC_KEYS={
 "Pancasila":["pancasila","sila","bpupki","ppki","ideologi"],
 "UUD 1945":["uud","pasal","amandemen","konstitusi","pembukaan","mpr","dpr","dpd"],
 "Bela Negara":["bela negara","sishankamrata","cadangan","pertahanan","ancaman"],
 "Sejarah Nasional":["sejarah","proklamasi","kemerdekaan","penjajah","pahlawan","voc","orde","reformasi"],
 "NKRI & Kebangsaan":["nkri","nusantara","wawasan","djuanda","perbatasan","bhineka","kebangsaan"],
 "Bahasa Indonesia":["baku","eyd","puebi","kalimat","ejaan","kata"],
 "Sinonim":["sinonim","persamaan kata","makna sama"],
 "Antonim":["antonim","lawan kata","berlawanan"],
 "Analogi":["analogi","hubungan kata"],
 "Figural":["figural","gambar","kubus","dadu","rotasi","pola gambar"],
 "Penalaran Logis":["silogisme","premis","kesimpulan","modus","logis"],
 "Deret Angka":["deret","barisan","pola bilangan","angka berikut"],
 "Aritmetika":["hitung","persen","diskon","kecepatan","perbandingan","fpb","kpk","rumus","matematika"],
 "Anti-Radikalisme":["radikal","terorisme","intoleran"],
 "TIK & Digital":["digital","internet","hoaks","teknologi","siber","data","komputer"],
 "Sosial Budaya":["budaya","adat","gotong royong","masyarakat"],
 "Kerjasama Tim":["tim","kerjasama","kolega","rekan"],
 "Profesionalisme & Integritas":["integritas","profesional","korupsi","gratifikasi","disiplin"],
 "Pelayanan Publik":["pelayanan","publik","prima","pengaduan"]
};
function norm(s){return " "+String(s||"").toLowerCase().replace(/[^a-z0-9 ]/g," ")+" ";}
function searchMentor(query){
 var nq=norm(query),best=null,bs=0;
 ["TWK","TIU","TKP"].forEach(function(c){
  (window["MAT_"+c]||[]).forEach(function(t){
   var keys=(TOPIC_KEYS[t.topic]||[]).slice();
   t.topic.toLowerCase().split(/[^a-z]+/).forEach(function(w){if(w.length>2)keys.push(w);});
   var sc=0;
   keys.forEach(function(k){if(k.length>2&&nq.indexOf(" "+k+" ")>=0)sc+=k.length;});
   if(sc>bs){bs=sc;best={kind:"topic",cat:c,topic:t.topic};}
  });
 });
 if(best&&bs>=4)return best;
 var words=nq.trim().split(/\s+/).filter(function(w){return w.length>3;});
 if(words.length){
  var bq=null,bqs=0;
  ["TWK","TIU","TKP"].forEach(function(c){
   var arr=bank()[c]||[];
   for(var i=0;i<arr.length;i++){
    var sq=norm(arr[i].q),sc=0;
    words.forEach(function(w){if(sq.indexOf(w)>=0)sc++;});
    if(sc>bqs){bqs=sc;bq={kind:"q",cat:c,idx:i,id:arr[i].id};}
   }
  });
  if(bq&&bqs>=Math.min(2,words.length))return bq;
 }
 return best;
}
function wrongList(n){
 var out=[],done=(window.SIASN&&window.SIASN.ST&&window.SIASN.ST.done)||{};
 Object.keys(done).forEach(function(id){
  if(done[id]&&!done[id].ok)out.push({id:id,cat:done[id].c});
 });
 return out.slice(-(n||12)).reverse();
}

/* ================= DIAGNOSTIC COACH =================
   Analisis performa ASLI dari localStorage user (window.SIASN.ST):
   rata-rata skor tryout per sub-tes, selisih dari passing grade resmi,
   akurasi latihan, dan topik yang paling sering salah (via topicOf). */
var PG={TWK:65,TIU:80,TKP:166};
function stData(){return (window.SIASN&&window.SIASN.ST)||{done:{},tryouts:[]};}
function diagnose(){
 var S=stData(),tos=S.tryouts||[],done=S.done||{};
 var cats={};
 ["TWK","TIU","TKP"].forEach(function(c){
  var scores=tos.map(function(t){return t[c.toLowerCase()];}).filter(function(x){return typeof x==="number";});
  var avg=scores.length?Math.round(scores.reduce(function(a,b){return a+b;},0)/scores.length):null;
  var dn=0,ok=0;
  Object.keys(done).forEach(function(id){var d=done[id];if(d&&d.c===c){dn++;if(d.ok)ok++;}});
  cats[c]={avg:avg,last:scores.length?scores[scores.length-1]:null,pg:PG[c],gap:avg===null?null:PG[c]-avg,done:dn,ok:ok,acc:dn?Math.round(ok/dn*100):null,weakTopics:[]};
 });
 var topicOf=(window.SIASN&&window.SIASN.topicOf)||null;
 if(topicOf){
  var tw={};
  Object.keys(done).forEach(function(id){
   var d=done[id];if(!d||d.ok)return;
   var f=findQ(id);if(!f)return;
   var q=getQ(f.cat,f.idx);if(!q)return;
   var t=topicOf(f.cat,q.q),k=f.cat+"|"+t;
   if(!tw[k])tw[k]={cat:f.cat,topic:t,wrong:0};
   tw[k].wrong++;
  });
  Object.keys(tw).forEach(function(k){if(cats[tw[k].cat])cats[tw[k].cat].weakTopics.push(tw[k]);});
  ["TWK","TIU","TKP"].forEach(function(c){cats[c].weakTopics.sort(function(a,b){return b.wrong-a.wrong;});cats[c].weakTopics=cats[c].weakTopics.slice(0,3);});
 }
 var crit=null,critGap=-1e9;
 ["TWK","TIU","TKP"].forEach(function(c){var g=cats[c].gap;if(g!==null&&g>critGap){critGap=g;crit=c;}});
 if(!crit){var ba=null;["TWK","TIU","TKP"].forEach(function(c){if(cats[c].done>=5&&(ba===null||cats[c].acc<cats[ba].acc))ba=c;});crit=ba;}
 return {hasTryout:tos.length>0,nTryout:tos.length,totalDone:Object.keys(done).length,cats:cats,critical:crit};
}
function diagnosisText(){
 var d;
 try{d=diagnose();}catch(e){return "Halo! Aku Nara, mentor belajarmu. Ketik pertanyaan, atau pilih soal yang pernah kamu salah — aku jelasin pakai suara.";}
 if(!d.hasTryout&&d.totalDone===0)return "Halo! Aku Nara, mentor belajarmu. Kamu belum punya data belajar sama sekali — mulai dengan Tryout Diagnostik atau Latihan Perdana ya, biar aku bisa membaca kekuatan dan kelemahanmu.";
 if(!d.hasTryout)return "Halo! Aku Nara. Kamu sudah mengerjakan "+d.totalDone+" soal latihan, tapi belum pernah tryout penuh — jadi kesiapan passing grade-mu belum bisa kunilai. Coba satu tryout ya, setelah itu kubedah hasilmu di kartu Diagnosis.";
 var s="Halo! Aku Nara. Dari "+d.nTryout+" tryout, rata-ratamu TWK "+d.cats.TWK.avg+", TIU "+d.cats.TIU.avg+", TKP "+d.cats.TKP.avg+". ";
 var c=d.critical;
 if(c&&d.cats[c].gap>0)s+="Yang paling kritis "+c+": masih kurang "+d.cats[c].gap+" poin dari passing grade "+d.cats[c].pg+". Kita fokus ke sana dulu — tombol latihannya ada di kartu Diagnosis.";
 else s+="Semua sub-tes rata-ratanya sudah lewat passing grade. Pertahankan ritmenya, dan poles topik yang masih sering salah di kartu Diagnosis.";
 return s;
}
function trikHariIni(catPref){
 var arr=window.TRIK||[];
 if(!arr.length)return null;
 var pool=catPref?arr.filter(function(t){return t.cat===catPref;}):[];
 if(!pool.length)pool=arr;
 var day=Math.floor(Date.now()/86400000);
 return pool[day%pool.length];
}

/* ================= SUARA ================= */
var voice=null,speaking=false,stopFlag=false;
function pickVoice(){
 try{
  var vs=(window.speechSynthesis?speechSynthesis.getVoices():[])||[];
  var i;
  for(i=0;i<vs.length;i++)if(/^id/i.test(vs[i].lang))return vs[i];
  for(i=0;i<vs.length;i++)if(/indones/i.test(vs[i].name))return vs[i];
 }catch(e){}
 return null;
}
function hasSpeech(){return ("speechSynthesis" in window);}
function speak(text,cb){
 stopSpeak();
 cb=cb||{};
 var sents=sentences(text).slice(0,60);
 cb.onReady&&cb.onReady(sents);
 if(!hasSpeech()||!sents.length){cb.onDone&&cb.onDone();return;}
 if(!voice)voice=pickVoice();
 if(window.speechSynthesis.onvoiceschanged!==undefined){
  try{speechSynthesis.onvoiceschanged=function(){voice=pickVoice();};}catch(e){}
 }
 speaking=true;stopFlag=false;setTalking(true);
 var i=0;
 function next(){
  if(stopFlag||i>=sents.length){speaking=false;setTalking(false);cb.onDone&&cb.onDone();return;}
  var u;
  try{u=new SpeechSynthesisUtterance(sents[i]);}catch(e){i++;next();return;}
  u.lang="id-ID";if(voice)u.voice=voice;u.rate=1;u.pitch=1;
  (function(idx){
   u.onstart=function(){setTalking(true);cb.onSentence&&cb.onSentence(idx);};
   u.onend=function(){i++;next();};
   u.onerror=function(){i++;next();};
  })(i);
  try{speechSynthesis.speak(u);}catch(e){i++;next();}
 }
 next();
}
function stopSpeak(){
 stopFlag=true;
 try{if(hasSpeech())speechSynthesis.cancel();}catch(e){}
 speaking=false;setTalking(false);
}

/* ================= AVATAR 3D ================= */
var renderer=null,scene=null,camera=null,av=null,rafId=0,t0=0,blinkAt=2,blinking=0,waveT=0,talking=false,active=false,mX=0,mY=0;
var inView=true,ioObs=null,STATIC3D=false;
try{STATIC3D=(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)||(navigator.deviceMemory&&navigator.deviceMemory<=1)||(navigator.connection&&/^(slow-2g|2g)$/.test(navigator.connection.effectiveType||""));}catch(e){}
function M(color,rough){
 return new THREE.MeshStandardMaterial({color:color,roughness:rough==null?0.55:rough,metalness:0.08});
}
function buildAvatar(){
 var g=new THREE.Group();
 var indigo=0x6366f1,deep=0x4f46e5,light=0xf1f5ff,dark=0x1e1b4b;
 var torso=new THREE.Mesh(new THREE.SphereGeometry(0.52,40,40),M(indigo));
 torso.scale.set(1,1.12,0.82);torso.position.y=0.62;torso.castShadow=true;g.add(torso);
 var belly=new THREE.Mesh(new THREE.CircleGeometry(0.24,40),M(0xc7d2fe,0.35));
 belly.position.set(0,0.60,0.425);g.add(belly);
 var book=new THREE.Mesh(new THREE.BoxGeometry(0.16,0.12,0.012),M(0xffffff,0.4));
 book.position.set(0,0.60,0.435);g.add(book);
 var headG=new THREE.Group();headG.position.y=1.44;g.add(headG);
 var head=new THREE.Mesh(new THREE.SphereGeometry(0.36,40,40),M(light));
 head.castShadow=true;headG.add(head);
 function eye(x){
  var e=new THREE.Group();
  var w=new THREE.Mesh(new THREE.SphereGeometry(0.088,24,24),M(0xffffff,0.25));e.add(w);
  var p=new THREE.Mesh(new THREE.SphereGeometry(0.044,16,16),M(dark,0.25));p.position.z=0.058;e.add(p);
  var glint=new THREE.Mesh(new THREE.SphereGeometry(0.014,8,8),M(0xffffff,0.2));glint.position.set(0.018,0.02,0.088);e.add(glint);
  e.position.set(x,0.06,0.295);headG.add(e);return e;
 }
 var eL=eye(-0.135),eR=eye(0.135);
 function cheek(x){
  var c=new THREE.Mesh(new THREE.SphereGeometry(0.045,16,16),M(0xf9a8d4,0.6));
  c.scale.z=0.4;c.position.set(x,-0.06,0.315);headG.add(c);
 }
 cheek(-0.21);cheek(0.21);
 var mouth=new THREE.Mesh(new THREE.BoxGeometry(0.15,0.03,0.02),M(dark,0.4));
 mouth.position.set(0,-0.13,0.325);headG.add(mouth);
 var capG=new THREE.Group();
 var board=new THREE.Mesh(new THREE.BoxGeometry(0.54,0.05,0.54),M(0x312e81,0.55));
 board.rotation.z=0.07;board.rotation.x=-0.05;capG.add(board);
 var base=new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.23,0.13,28),M(0x312e81,0.55));
 base.position.y=-0.075;capG.add(base);
 var tassel=new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.013,0.20,10),M(0xfbbf24,0.5));
 tassel.position.set(0.25,-0.12,0.02);capG.add(tassel);
 var tEnd=new THREE.Mesh(new THREE.SphereGeometry(0.032,14,14),M(0xfbbf24,0.5));
 tEnd.position.set(0.25,-0.235,0.02);tEnd.castShadow=true;capG.add(tEnd);
 capG.position.set(0,0.335,0);headG.add(capG);
 function arm(side){
  var ag=new THREE.Group();ag.position.set(0.50*side,0.98,0);
  var a=new THREE.Mesh(new THREE.CylinderGeometry(0.075,0.062,0.5,20),M(deep));
  a.position.y=-0.25;a.castShadow=true;ag.add(a);
  var hand=new THREE.Mesh(new THREE.SphereGeometry(0.095,20,20),M(light));
  hand.position.y=-0.53;hand.castShadow=true;ag.add(hand);
  ag.rotation.z=0.28*side;g.add(ag);return ag;
 }
 var aL=arm(-1),aR=arm(1);
 g.position.y=0.12;
 return{g:g,headG:headG,eL:eL,eR:eR,mouth:mouth,aL:aL,aR:aR};
}
function tick(now){
 if(!active)return;
 rafId=requestAnimationFrame(tick);
 if(document.hidden||!inView)return;
 var t=(now-t0)/1000;
 av.g.position.y=0.12+Math.sin(t*1.7)*0.045;
 av.g.rotation.y=Math.sin(t*0.45)*0.07+mX*0.18;
 av.headG.rotation.y+=((mX*0.5)-av.headG.rotation.y)*0.06;
 var targetX=mY*0.28+(talking?Math.sin(t*6.5)*0.035:0);
 av.headG.rotation.x+=((targetX)-av.headG.rotation.x)*0.08;
 if(t>blinkAt){blinkAt=t+2.2+Math.random()*2.8;blinking=0.13;}
 if(blinking>0){blinking-=1/60;var s=Math.max(0.08,blinking/0.13);av.eL.scale.y=s;av.eR.scale.y=s;}
 else{av.eL.scale.y=1;av.eR.scale.y=1;}
 if(talking){
  av.mouth.scale.y=1+Math.abs(Math.sin(t*10.5))*2.4+Math.random()*0.5;
  av.mouth.scale.x=1+Math.sin(t*10.5)*0.1;
 }else{av.mouth.scale.y+=(1-av.mouth.scale.y)*0.25;av.mouth.scale.x+=(1-av.mouth.scale.x)*0.25;}
 if(waveT>0){waveT-=1/60;av.aR.rotation.z=-2.25+Math.sin(t*13)*0.38;av.aR.rotation.x=0;}
 else{
  av.aR.rotation.z+=(0.28-av.aR.rotation.z)*0.07;
  av.aL.rotation.z+=(-0.28-av.aL.rotation.z)*0.07;
  av.aL.rotation.x=Math.sin(t*1.7)*0.09;
  av.aR.rotation.x=Math.sin(t*1.7+1.2)*0.09;
 }
 renderer.render(scene,camera);
}
function init(canvas){
 destroy();
 if(!window.THREE||!canvas)return false;
 var wrap=canvas.parentNode;
 var w=wrap?wrap.clientWidth:320;
 if(!w)w=320;
 var small=canvas.id==="m3d2";
 var h=small?Math.round(Math.min(170,Math.max(140,w*0.42))):Math.round(Math.min(230,Math.max(185,w*0.58)));
 try{
  renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});
 }catch(e){return false;}
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
 renderer.setSize(w,h,false);
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(34,w/h,0.1,50);
 camera.position.set(0,1.38,4.5);
 camera.lookAt(0,1.02,0);
 scene.add(new THREE.HemisphereLight(0xffffff,0xdde3ff,0.95));
 var key=new THREE.DirectionalLight(0xffffff,0.85);
 key.position.set(2.5,4.2,3);key.castShadow=true;
 key.shadow.mapSize.set(1024,1024);
 key.shadow.camera.left=-3;key.shadow.camera.right=3;
 key.shadow.camera.top=4;key.shadow.camera.bottom=-2;
 scene.add(key);
 var fill=new THREE.DirectionalLight(0xc7d2fe,0.35);
 fill.position.set(-3,1.5,2.5);scene.add(fill);
 var sh=new THREE.Mesh(new THREE.CircleGeometry(1.5,48),new THREE.ShadowMaterial({opacity:0.16}));
 sh.rotation.x=-Math.PI/2;sh.position.y=0.0;sh.receiveShadow=true;scene.add(sh);
 av=buildAvatar();scene.add(av.g);
 function onMove(cx,cy){
  var r=canvas.getBoundingClientRect();
  mX=((cx-r.left)/r.width-0.5)*2;
  mY=((cy-r.top)/r.height-0.5)*2;
 }
 canvas.onmousemove=function(e){onMove(e.clientX,e.clientY);};
 canvas.ontouchmove=function(e){if(e.touches&&e.touches[0])onMove(e.touches[0].clientX,e.touches[0].clientY);};
 active=true;t0=performance.now();blinkAt=2.2;
 if(window.IntersectionObserver&&canvas){try{ioObs=new IntersectionObserver(function(en){inView=!(en[0]&&en[0].isIntersecting===false);},{threshold:0.02});ioObs.observe(canvas);}catch(e){}}
 if(STATIC3D){try{renderer.render(scene,camera);}catch(e){}}
 else rafId=requestAnimationFrame(tick);
 return true;
}
function destroy(){
 active=false;
 if(ioObs){try{ioObs.disconnect();}catch(e){}ioObs=null;}
 if(rafId)cancelAnimationFrame(rafId);
 rafId=0;
 stopSpeak();
 if(renderer){try{renderer.dispose();}catch(e){}renderer=null;}
 scene=null;camera=null;av=null;
}
function setTalking(b){talking=!!b;}
function wave(){waveT=1.7;}
function greet(sayFn){
 wave();
 var msg=diagnosisText();
 sayFn&&sayFn(msg);
 speak(msg);
}

window.Mentor3D={
 init:init,destroy:destroy,active:function(){return active;},
 speak:speak,stop:stopSpeak,speaking:function(){return speaking;},hasSpeech:hasSpeech,
 setTalking:setTalking,wave:wave,greet:greet,
 sentences:sentences,plain:plain,materiSpeech:materiSpeech,soalSpeech:soalSpeech,
 searchMentor:searchMentor,wrongList:wrongList,findQ:findQ,getQ:getQ,sectionsOf:sectionsOf,
 diagnose:diagnose,diagnosisText:diagnosisText,trikHariIni:trikHariIni
};
})();

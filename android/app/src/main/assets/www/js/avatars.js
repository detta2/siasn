/* SiASN — 4 avatar mentor 3D alternatif (orca, owl, cat, penguin).
   Tiap build() mengembalikan interface yang sama dengan robot Nara:
   {g, headG, eL, eR, mouth, aL, aR} agar bisa dipakai tick() yang sama. */
(function(){
"use strict";
function M(color,rough){
  return new THREE.MeshStandardMaterial({color:color,roughness:rough==null?0.55:rough,metalness:0.08});
}
function sph(r,c,rs,x,y,z,sx,sy,sz){
  var m=new THREE.Mesh(new THREE.SphereGeometry(r,28,28),M(c,rs));
  m.position.set(x||0,y||0,z||0);
  m.scale.set(sx==null?1:sx,sy==null?1:sy,sz==null?1:sz);
  m.castShadow=true;return m;
}
function eye(x,y,z,r,dark){
  var e=new THREE.Group();
  var w=new THREE.Mesh(new THREE.SphereGeometry(r,20,20),M(0xffffff,0.25));e.add(w);
  var p=new THREE.Mesh(new THREE.SphereGeometry(r*0.5,14,14),M(dark||0x1e1b4b,0.25));
  p.position.z=r*0.66;e.add(p);
  var gl=new THREE.Mesh(new THREE.SphereGeometry(r*0.16,8,8),M(0xffffff,0.2));
  gl.position.set(r*0.2,r*0.22,r*0.95);e.add(gl);
  e.position.set(x,y,z);return e;
}
function togaCap(s){
  var g=new THREE.Group(),navy=0x312e81;
  var board=new THREE.Mesh(new THREE.BoxGeometry(0.54,0.05,0.54),M(navy,0.55));
  board.rotation.z=0.07;board.rotation.x=-0.05;g.add(board);
  var base=new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.23,0.13,28),M(navy,0.55));
  base.position.y=-0.075;g.add(base);
  var tas=new THREE.Mesh(new THREE.CylinderGeometry(0.013,0.013,0.20,10),M(0xfbbf24,0.5));
  tas.position.set(0.25,-0.12,0.02);g.add(tas);
  var tEnd=new THREE.Mesh(new THREE.SphereGeometry(0.032,14,14),M(0xfbbf24,0.5));
  tEnd.position.set(0.25,-0.235,0.02);g.add(tEnd);
  g.scale.setScalar(s||1);return g;
}
function mouthBox(w,c,x,y,z){
  var m=new THREE.Mesh(new THREE.BoxGeometry(w,0.035,0.02),M(c||0x7a2e2e,0.4));
  m.position.set(x,y,z);return m;
}

/* ---------- 1. ORCA ---------- */
function buildOrca(){
  var g=new THREE.Group(),ink=0x23232e;
  var body=sph(0.55,ink,0.5,0,0.72,0,1,1.18,0.92);g.add(body);
  var belly=sph(0.5,0xffffff,0.5,0,0.60,0.30,0.70,0.88,0.60);g.add(belly);
  var headG=new THREE.Group();headG.position.set(0,1.0,0);g.add(headG);
  [[-1],[1]].forEach(function(s){
    var patch=sph(0.13,0xffffff,0.5,s[0]*0.30,0.06,0.42,1,1.35,0.45);headG.add(patch);
    var e=eye(s[0]*0.30,-0.02,0.50,0.058,0x0a0a0a);headG.add(e);
    if(s[0]<0)var eL=e;else var eR=e;
    headG.userData[s[0]<0?"eL":"eR"]=e;
  });
  var eL=headG.userData.eL,eR=headG.userData.eR;
  var mouth=mouthBox(0.34,0x5b2323,0,-0.28,0.52);headG.add(mouth);
  var dorsal=new THREE.Mesh(new THREE.ConeGeometry(0.22,0.6,20),M(ink,0.5));
  dorsal.scale.z=0.32;dorsal.position.set(0,0.62,-0.18);dorsal.rotation.x=-0.35;
  dorsal.castShadow=true;headG.add(dorsal);
  // ekor
  var tail=new THREE.Group();tail.position.set(0,0.32,-0.52);g.add(tail);
  var stock=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.12,0.42,16),M(ink,0.5));
  stock.rotation.x=Math.PI/2;stock.position.z=-0.18;tail.add(stock);
  [[-1],[1]].forEach(function(s){
    var f=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.38,14),M(ink,0.5));
    f.scale.z=0.35;f.rotation.z=s[0]*1.25;f.position.set(s[0]*0.20,0.02,-0.42);tail.add(f);
  });
  // sirip dada (aL/aR)
  function fin(side){
    var fg=new THREE.Group();fg.position.set(0.50*side,0.55,0.12);
    var f=sph(0.16,ink,0.5,0,-0.20,0.02,0.55,1.5,0.35);fg.add(f);
    fg.rotation.z=0.55*side;g.add(fg);return fg;
  }
  var aL=fin(-1),aR=fin(1);
  var cap=togaCap(1.05);cap.position.set(0,1.78,0);cap.rotation.z=0.08;g.add(cap);
  g.position.y=0.10;
  return {g:g,headG:headG,eL:eL,eR:eR,mouth:mouth,aL:aL,aR:aR};
}

/* ---------- 2. BURUNG HANTU ---------- */
function buildOwl(){
  var g=new THREE.Group(),br=0x8b5e34;
  var body=sph(0.55,br,0.6,0,0.75,0,1,1.2,0.95);g.add(body);
  var belly=sph(0.5,0xd9a86c,0.6,0,0.68,0.36,0.62,0.85,0.5);g.add(belly);
  var headG=new THREE.Group();headG.position.set(0,1.02,0);g.add(headG);
  var eL=eye(-0.22,0.03,0.40,0.20),eR=eye(0.22,0.03,0.40,0.20);
  headG.add(eL);headG.add(eR);
  var beak=new THREE.Mesh(new THREE.ConeGeometry(0.09,0.17,16),M(0xf59e0b,0.5));
  beak.position.set(0,-0.13,0.50);beak.rotation.x=1.85;headG.add(beak);
  var mouth=mouthBox(0.12,0x5b3a1a,0,-0.24,0.48);headG.add(mouth);
  [[-1],[1]].forEach(function(s){
    var t=new THREE.Mesh(new THREE.ConeGeometry(0.10,0.30,12),M(br,0.6));
    t.position.set(s[0]*0.30,0.52,-0.02);t.rotation.z=-s[0]*0.25;headG.add(t);
  });
  function wing(side){
    var wg=new THREE.Group();wg.position.set(0.53*side,-0.15,0);
    var w=sph(0.20,0x74491f,0.6,0,-0.26,0,0.45,1.35,0.8);wg.add(w);
    headG.add(wg);return wg;
  }
  // sayap ikut headG? tidak — pindah ke g agar wave natural
  var aL=wing(-1),aR=wing(1);
  headG.remove(aL);headG.remove(aR);g.add(aL);g.add(aR);
  aL.position.set(-0.53,0.87,0);aR.position.set(0.53,0.87,0);
  [[-1],[1]].forEach(function(s){
    var f=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.07,0.14,12),M(0xf59e0b,0.5));
    f.position.set(s[0]*0.20,0.07,0.10);g.add(f);
  });
  var cap=togaCap(1.0);cap.position.set(0,1.72,0);cap.rotation.z=-0.06;g.add(cap);
  g.position.y=0.10;
  return {g:g,headG:headG,eL:eL,eR:eR,mouth:mouth,aL:aL,aR:aR};
}

/* ---------- 3. KUCING ---------- */
function buildCat(){
  var g=new THREE.Group(),org=0xf5a623;
  var body=sph(0.50,org,0.6,0,0.60,0,1,1.15,0.9);g.add(body);
  var belly=sph(0.42,0xfde9c8,0.6,0,0.55,0.30,0.66,0.85,0.5);g.add(belly);
  var headG=new THREE.Group();headG.position.set(0,1.32,0);g.add(headG);
  var head=sph(0.42,org,0.55,0,0,0,1,0.95,0.92);headG.add(head);
  [[-1],[1]].forEach(function(s){
    var ear=new THREE.Mesh(new THREE.ConeGeometry(0.15,0.32,12),M(org,0.6));
    ear.position.set(s[0]*0.27,0.42,-0.02);ear.rotation.z=-s[0]*0.18;headG.add(ear);
    var inn=new THREE.Mesh(new THREE.ConeGeometry(0.07,0.16,10),M(0xf9a8d4,0.6));
    inn.position.set(s[0]*0.26,0.38,0.10);inn.rotation.z=-s[0]*0.18;headG.add(inn);
  });
  var eL=eye(-0.16,0.08,0.35,0.115,0x166534),eR=eye(0.16,0.08,0.35,0.115,0x166534);
  headG.add(eL);headG.add(eR);
  var nose=sph(0.045,0xec4899,0.5,0,-0.04,0.40);headG.add(nose);
  var mouth=mouthBox(0.10,0x7c2d12,0,-0.12,0.385);headG.add(mouth);
  [[-1],[1]].forEach(function(s){
    for(var i=0;i<3;i++){
      var w=new THREE.Mesh(new THREE.CylinderGeometry(0.008,0.008,0.30,6),M(0xffffff,0.5));
      w.position.set(s[0]*0.38,-0.02+i*0.05,0.30);
      w.rotation.z=Math.PI/2+s[0]*0.25;w.rotation.y=-s[0]*0.35;headG.add(w);
    }
  });
  var tail=new THREE.Mesh(new THREE.TorusGeometry(0.26,0.07,12,24,2.1),M(org,0.6));
  tail.position.set(0.38,0.55,-0.38);tail.rotation.set(0.3,0.9,0.4);g.add(tail);
  function paw(side){
    var pg=new THREE.Group();pg.position.set(0.40*side,0.42,0.18);
    var p=sph(0.13,org,0.6,0,-0.12,0);pg.add(p);
    g.add(pg);return pg;
  }
  var aL=paw(-1),aR=paw(1);
  var cap=togaCap(0.95);cap.position.set(0,1.82,0);cap.rotation.z=0.10;g.add(cap);
  g.position.y=0.10;
  return {g:g,headG:headG,eL:eL,eR:eR,mouth:mouth,aL:aL,aR:aR};
}

/* ---------- 4. PENGUIN ---------- */
function buildPenguin(){
  var g=new THREE.Group(),blk=0x1f2937;
  var body=sph(0.55,blk,0.55,0,0.78,0,1,1.28,0.95);g.add(body);
  var belly=sph(0.5,0xffffff,0.5,0,0.70,0.34,0.66,0.92,0.55);g.add(belly);
  var headG=new THREE.Group();headG.position.set(0,1.12,0);g.add(headG);
  var eL=eye(-0.17,0.06,0.42,0.105),eR=eye(0.17,0.06,0.42,0.105);
  headG.add(eL);headG.add(eR);
  var beak=new THREE.Mesh(new THREE.ConeGeometry(0.085,0.20,14),M(0xf59e0b,0.5));
  beak.position.set(0,-0.05,0.50);beak.rotation.x=1.75;headG.add(beak);
  var mouth=mouthBox(0.11,0x92400e,0,-0.17,0.47);headG.add(mouth);
  function flip(side){
    var fg=new THREE.Group();fg.position.set(0.55*side,-0.20,0);
    var f=sph(0.18,blk,0.55,0,-0.28,0,0.42,1.45,0.7);fg.add(f);
    g.add(fg);return fg;
  }
  var aL=flip(-1),aR=flip(1);
  aL.position.set(-0.55,0.92,0);aR.position.set(0.55,0.92,0);
  [[-1],[1]].forEach(function(s){
    var f=new THREE.Mesh(new THREE.BoxGeometry(0.22,0.08,0.30),M(0xf59e0b,0.5));
    f.position.set(s[0]*0.20,0.05,0.12);g.add(f);
  });
  var cap=togaCap(1.0);cap.position.set(0,1.86,0);cap.rotation.z=-0.08;g.add(cap);
  g.position.y=0.10;
  return {g:g,headG:headG,eL:eL,eR:eR,mouth:mouth,aL:aL,aR:aR};
}

window.AVATARS={
  orca:{name:"Orca",tag:"Paus orca yang kalem & bijak",build:buildOrca},
  owl:{name:"Hoot",tag:"Burung hantu si paling paham teori",build:buildOwl},
  cat:{name:"Kimo",tag:"Kucing oren yang semangat",build:buildCat},
  penguin:{name:"Pingu",tag:"Penguin yang teliti & rapi",build:buildPenguin}
};
})();

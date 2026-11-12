'use strict';

const packageTextures=new Map();
const photoCells={onigiri:[0,0],bento:[1,0],sandwich:[2,0],ice:[0,1],mochi:[1,1],oden:[2,1]};
const foodAtlas=new Image();
const pendingAtlas=[];
foodAtlas.addEventListener('load',()=>{
 for(const applyPhoto of pendingAtlas)applyPhoto();
 pendingAtlas.length=0;
});
foodAtlas.src='food-atlas.png';
function foodPhoto(item,context,x,y,w,h){
 const [col,row]=photoCells[item.id];
 const tile=foodAtlas.naturalWidth/3;
 const tileHeight=foodAtlas.naturalHeight/2;
 const scale=Math.min(tile/w,tileHeight/h);
 const sw=w*scale,sh=h*scale;
 context.drawImage(foodAtlas,col*tile+(tile-sw)/2,row*tileHeight+(tileHeight-sh)/2,sw,sh,x,y,w,h);
}
function withAtlas(callback){
 if(foodAtlas.complete&&foodAtlas.naturalWidth)callback();
 else pendingAtlas.push(callback);
}
let trayPhoto;
function bentoSurface(item,parent){
 if(!trayPhoto){
  trayPhoto=graphic(480,340,(g,w,h)=>{
   g.fillStyle='#342921';g.fillRect(0,0,w,h);
  });
  const canvas=trayPhoto.image;
  withAtlas(()=>{
   foodPhoto(item,canvas.getContext('2d'),0,0,canvas.width,canvas.height);
   trayPhoto.needsUpdate=true;
  });
 }
 const face=panel(0,0,.135,.623,.408,trayPhoto,0,parent);
 face.material.side=T.FrontSide;
}
function wrapper(item,back=false){
 const key=item.id+(back?'_back':'_front');
 if(packageTextures.has(key))return packageTextures.get(key);
 const texture=graphic(640,480,(g,w,h)=>{
  const color='#'+item.color.toString(16).padStart(6,'0');
  const chinese='"Microsoft YaHei", "PingFang SC", "Noto Sans CJK SC", sans-serif';
  const gradient=g.createLinearGradient(0,0,w,h);
  gradient.addColorStop(0,'#fffaf0');gradient.addColorStop(1,'#e9dfc9');
  g.fillStyle=gradient;g.fillRect(0,0,w,h);
  g.fillStyle=color;g.fillRect(0,0,w,83);
  g.fillStyle='#fff9e9';g.font='bold 42px '+chinese;g.fillText('雨夜便利 · '+(item.station==='hot'?'热食':item.station==='food'?'鲜食':item.station==='drinks'?'冷藏':'冷冻'),34,57);
  g.fillStyle='#273536';g.font='bold '+Math.min(80,565/item.name.length)+'px '+chinese;
  g.fillText(item.name,34,189);
  g.fillStyle=color;g.font='bold 36px '+chinese;g.fillText(item.spec,36,260);
  g.fillStyle='#839389';g.fillRect(36,290,w-72,3);
  g.fillStyle='#344b4a';g.font='27px '+chinese;
  g.fillText(back?'商品说明  ·  储存信息':'雨夜便利店  ·  包装示意',36,345);
  if(back){
   g.fillText(item.station==='freezer'?'冷冻保存  ·  开封后尽快食用':item.station==='hot'?'当餐食用  ·  小心烫口':'请按包装条件保存',36,391);
   g.fillStyle='#30403d';
   for(let i=0;i<35;i++)g.fillRect(37+i*8,409,2+(i*11)%5,39);
  }else{
   g.fillStyle=color;g.fillRect(0,401,w,79);
   g.fillStyle='#fff6e6';g.font='30px '+chinese;
   g.fillText(item.station==='food'?'鲜食系列':item.station==='drinks'?'冷饮系列':item.station==='hot'?'即享系列':'冰品系列',35,451);
  }
 });
 if(!back&&photoCells[item.id]&&item.id!=='bento'&&item.id!=='oden'){
  withAtlas(()=>{
   const canvas=texture.image,g=canvas.getContext('2d');
   foodPhoto(item,g,385,248,223,138);
   g.strokeStyle='#fff5db';g.lineWidth=4;g.strokeRect(385,248,223,138);
   texture.needsUpdate=true;
  });
 }
 packageTextures.set(key,texture);
 return texture;
}
function packageModel(item,parent,size=1){
 const g=new T.Group();
 g.scale.setScalar(size);parent.add(g);
 const parts=[];
 const detailBatches=new Map();
 const add=(geometry,color,x=0,y=0,z=0)=>{
  const mesh=new T.Mesh(geometry,typeof color==='object'?color:mat(color));
  mesh.position.set(x,y,z);g.add(mesh);parts.push(mesh);return mesh;
 };
 const cuboid=(x,y,z,w,h,d,c)=>add(new T.BoxGeometry(w,h,d),c,x,y,z);
 const ellipsoid=(x,y,z,w,h,d,c)=>{
  const mesh=add(new T.SphereGeometry(1,14,9),c,x,y,z);
  mesh.scale.set(w,h,d);return mesh;
 };
 const grain=(x,y,z,c,angle)=>{
  if(!detailBatches.has(c))detailBatches.set(c,[]);
  const transform=new T.Object3D();
  transform.position.set(x,y,z);transform.rotation.z=angle;transform.scale.set(.017,.009,.009);
  transform.updateMatrix();detailBatches.get(c).push(transform.matrix);
 };
 const triangle=(w,h,d,z,color)=>{
  const shape=new T.Shape();
  shape.moveTo(-w/2,-h/2);shape.lineTo(w/2,-h/2);shape.lineTo(0,h/2);shape.closePath();
  return add(new T.ExtrudeGeometry(shape,{depth:d,steps:1,bevelEnabled:true,bevelSize:.016,bevelThickness:.011,bevelSegments:2}),color,0,0,z);
 };
 const film=new T.MeshPhongMaterial({color:0xe6f4f1,transparent:true,opacity:.16,shininess:105,depthWrite:false});
 let printWidth=.37,printHeight=.27,frontZ=.10,backZ=-.10,printY=0;
 if(item.kind==='rice'){
  const rice=ellipsoid(0,0,0,.267,.263,.084,0xe4c896);
  rice.rotation.z=-.08;
  for(let i=0;i<38;i++){
   const a=i*2.4,r=Math.sqrt(i/38);
   grain(Math.cos(a)*r*.232,Math.sin(a)*r*.224,.062+.019*(1-r),[0xf4e2af,0xcaa578,0xe9cb9a][i%3],a);
  }
  cuboid(0,-.172,.04,.273,.139,.114,0x30473a);
  ellipsoid(0,0,0,.282,.276,.101,film);
  printWidth=.265;printHeight=.153;printY=.075;frontZ=.111;
 }else if(item.kind==='sandwich'){
  triangle(.53,.54,.048,-.107,0xb59060);
  triangle(.504,.512,.052,-.054,0x7e9b55);
  triangle(.49,.50,.043,0,0x774832);
  triangle(.51,.52,.05,.045,0xdcbe8d);
  triangle(.55,.57,.219,-.118,film);
  printWidth=.315;printHeight=.177;printY=-.15;frontZ=.124;backZ=-.128;
 }else if(item.kind==='tray'){
  cuboid(0,0,0,.645,.431,.15,0x263638);
  cuboid(-.148,.015,.079,.24,.29,.039,0xe1cd9d);
  for(let i=0;i<37;i++){
   const x=-.248+(i*31%101)/505,y=-.105+(i*37%117)/470;
   grain(x,y,.105,[0xffeac4,0xe3cd9b,0xf6dea9][i%3],i*.9);
  }
  for(let i=0;i<5;i++){
   const x=.019+i%2*.119,y=.12-Math.floor(i/2)*.092;
   const chicken=add(new T.DodecahedronGeometry(.074,0),[0xb66a32,0xc37e3f,0x9e532a][i%3],x,y,.092);
   chicken.scale.set(1,.79,.47);chicken.rotation.z=i*.6;
  }
  for(let i=0;i<8;i++)ellipsoid(.245+i%2*.028,.125-Math.floor(i/2)*.041,.099,.03,.026,.024,i%2?0x5c7638:0x83934a);
  bentoSurface(item,g);
  cuboid(0,0,.113,.656,.443,.05,film);
  printWidth=.54;printHeight=.128;printY=-.146;frontZ=.144;backZ=-.076;
 }else if(item.kind==='bottle'||item.kind==='can'||item.kind==='cup'){
  const bottle=item.kind==='bottle',cup=item.kind==='cup';
  const profile=bottle?[[0,-.32],[.13,-.32],[.151,-.281],[.151,.134],[.142,.181],[.086,.227],[.065,.27],[.065,.318],[0,.318]]:cup?[[0,-.31],[.12,-.31],[.177,.257],[0,.257]]:[[0,-.27],[.143,-.27],[.154,-.241],[.154,.238],[.133,.267],[0,.267]];
  add(new T.LatheGeometry(profile.map(p=>new T.Vector2(...p)),32),bottle?0x9a793e:cup?0xf3ecdd:item.color);
  const r=bottle?.073:cup?.185:.138;
  add(new T.CylinderGeometry(r,r,.033,32),bottle?0x457258:cup?0x313b3c:0xbec8c7,0,bottle?.32:cup?.26:.267);
  if(bottle)for(const y of [-.28,-.25,.157,.19])add(new T.CylinderGeometry(.153,.151,.009,32),0xad9051,0,y);
  if(cup)add(new T.CylinderGeometry(.156,.136,.205,32),0xae7b4d,0,-.051);
  if(!bottle&&!cup){
   const tab=add(new T.TorusGeometry(.034,.008,8,14),0x657270,0,.287,.035);tab.rotation.x=Math.PI/2;
  }
  const radius=bottle?.153:cup?.161:.156;
  for(const back of [false,true]){
   const arc=1.65;
   const segment=new T.CylinderGeometry(radius,radius,bottle?.24:.235,22,1,true,-arc/2+(back?Math.PI:0),arc);
   add(segment,new T.MeshBasicMaterial({map:wrapper(item,back)}),0,cup?-.04:0);
  }
  return {g,parts};
 }else if(item.kind==='skewer'){
  add(new T.CylinderGeometry(.013,.013,.63,10),0xcaa46d,0,.012);
  for(let i=0;i<3;i++){
   const ball=add(new T.IcosahedronGeometry(.092,2),i%2?0x8f5d40:0x95694a,0,-.16+i*.145);
   ball.scale.set(1,.89,1);
  }
  return {g,parts};
 }else if(item.kind==='mochi'){
  cuboid(0,0,0,.57,.335,.105,0x6c394d);
  ellipsoid(-.126,.044,.055,.103,.094,.07,0xf4dfcd);
  ellipsoid(.126,.044,.055,.103,.094,.07,0xf3dfcf);
  cuboid(0,0,.09,.578,.343,.084,film);
  printWidth=.488;printHeight=.115;printY=-.095;frontZ=.137;backZ=-.06;
 }else{
  const carton=item.kind==='carton';
  if(carton){
   cuboid(0,-.033,0,.32,.476,.205,0xffe4e9);
   const top=new T.CylinderGeometry(.158,.162,.204,3,1);
   const gable=add(top,0xf3c9d4,0,.201,0);gable.rotation.set(Math.PI/2,0,-Math.PI/2);
   cuboid(0,.286,0,.32,.037,.029,0xe8a7bc);
   cuboid(.163,-.017,.023,.013,.37,.033,0xf3e7de);
   printWidth=.303;printHeight=.319;frontZ=.104;backZ=-.104;
  }else{
   const pouch=ellipsoid(0,0,0,.227,.25,.069,item.color);pouch.scale.z=.085;
   for(const y of [-.254,.254]){
    cuboid(0,y,0,.44,.035,.056,item.color);
    for(let x=-.205;x<.209;x+=.025)cuboid(x,y,.03,.009,.026,.006,0x809b75);
   }
   printWidth=.39;printHeight=.322;frontZ=.086;backZ=-.086;
  }
 }
 for(const [color,matrices] of detailBatches){
  const grains=new T.InstancedMesh(new T.SphereGeometry(1,9,6),mat(color),matrices.length);
  matrices.forEach((matrix,i)=>grains.setMatrixAt(i,matrix));g.add(grains);
 }
 panel(0,printY,frontZ,printWidth,printHeight,wrapper(item),0,g);
 panel(0,printY,backZ,printWidth,printHeight,wrapper(item,true),Math.PI,g);
 return {g,parts};
}


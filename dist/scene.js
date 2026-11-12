'use strict';
const T = THREE;
const scene = new T.Scene();
const renderer = new T.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
renderer.outputEncoding=T.sRGBEncoding;
document.body.append(renderer.domElement);
renderer.domElement.setAttribute('aria-label','雨夜便利店。拖拽旋转，滚动缩放，点击门边进店立牌进入。');
const camera=new T.OrthographicCamera(-10,10,8,-8,.1,110);
camera.position.set(12.4,9.2,17);
const orbit=new T.OrbitControls(camera,renderer.domElement);
orbit.target.set(0,.8,0);
orbit.enableDamping=true;
orbit.enablePan=false;
orbit.maxPolarAngle=Math.PI*.485;
orbit.minPolarAngle=.13;
orbit.minZoom=.65;
orbit.maxZoom=3.6;
orbit.update();
scene.add(new T.HemisphereLight(0x96bbeb,0x4a4560,.62));
const moon=new T.DirectionalLight(0xa9c9f2,.31);
moon.position.set(-4,10,5);scene.add(moon);
const warm=new T.PointLight(0xffbd70,1.18,7,2);
warm.position.set(-.6,2.45,1.5);scene.add(warm);
for(const x of [-3.05,.3]){
 const fixture=new T.PointLight(0xffb873,.69,5.2,1.65);
 fixture.position.set(x,2.75,-.65);scene.add(fixture);
}

const cache=new Map(), instances=new Map();
const unit=new T.BoxGeometry(1,1,1);
const edge=new T.EdgesGeometry(unit);
const ink=new T.LineBasicMaterial({color:0x142236,transparent:true,opacity:.58});
function mat(c,lit=true){
 const key=c+'_'+lit;
 if(!cache.has(key)) cache.set(key,lit?new T.MeshLambertMaterial({color:c}):new T.MeshBasicMaterial({color:c}));
 return cache.get(key);
}
function box(x,y,z,w,h,d,c,opt={}){
 const material=typeof c==='object'?c:mat(c,!opt.light);
 const o=new T.Mesh(unit,material);
 o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.y=opt.rot||0;
 if(opt.bulk){
  if(!instances.has(material))instances.set(material,[]);
  o.updateMatrix();instances.get(material).push(o.matrix.clone());return o;
 }
 (opt.parent||scene).add(o);
 if(opt.ink){const line=new T.LineSegments(edge,ink);o.add(line);}
 return o;
}
const b=(...args)=>box(...args);
function rod(a,b,r,c,parent=scene){
 const A=new T.Vector3(...a),B=new T.Vector3(...b),v=B.clone().sub(A);
 const m=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),8),mat(c));
 m.position.copy(A).lerp(B,.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());parent.add(m);return m;
}
function disc(x,y,z,r,c,depth=.015){
 const m=new T.Mesh(new T.CylinderGeometry(r,r,depth,24),mat(c));
 m.position.set(x,y,z);scene.add(m);return m;
}
function sphere(x,y,z,r,c,parent=scene){
 const m=new T.Mesh(new T.IcosahedronGeometry(r,1),mat(c));m.position.set(x,y,z);parent.add(m);return m;
}
function wire(points,color=0x647587,thickness=.011){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
 scene.add(new T.Mesh(new T.TubeGeometry(curve,32,thickness,5,false),mat(color)));
}
function graphic(w,h,draw){
 const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
 draw(canvas.getContext('2d'),w,h);
 const tx=new T.CanvasTexture(canvas);tx.encoding=T.sRGBEncoding;tx.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return tx;
}
function panel(x,y,z,w,h,tx,rot=0,parent=scene){
 const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:tx,transparent:true,side:T.DoubleSide}));
 p.position.set(x,y,z);p.rotation.y=rot;parent.add(p);return p;
}
function label(x,y,z,w,h,lines,fg,bg,rot=0,parent=scene){
 const sign=panel(x,y,z,w,h,graphic(768,Math.max(64,Math.round(768*h/w)),(g,W,H)=>{
  if(bg){g.fillStyle=bg;g.fillRect(0,0,W,H);}
  g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';
  lines.forEach((s,i)=>{g.font='bold '+Math.min(H*.65/lines.length,W/(s.length*(/[^\x00-\x7f]/.test(s)?1.04:.64)))+'px Microsoft YaHei, PingFang SC, Noto Sans CJK SC, sans-serif';g.fillText(s,W/2,H*(i+.5)/lines.length);});
 }),rot,parent);
 sign.material.side=T.FrontSide;
 return sign;
}
let seed=87;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const cream=0xfff1d6, navy=0x23384a, frame=0x334f56, teal=0x44b9b1, silver=0x9cb3be;
const outlined={ink:true}, emissive={light:true}, bulk={bulk:true};

b(0,-.57,0,14.4,.93,14.4,0x182a42,outlined);
b(0,-.12,0,14.48,.16,14.48,0x5e778a,outlined);
b(0,-.045,0,14.33,.09,14.33,0x23354c);
const asphalt=graphic(512,512,(g,w,h)=>{
 g.fillStyle='#25374c';g.fillRect(0,0,w,h);
 for(let i=0;i<12500;i++){g.fillStyle=rand()<.5?'rgba(124,153,175,.14)':'rgba(2,7,21,.16)';g.fillRect(rand()*w,rand()*h,rand()*3+.4,rand()*1.6+.4);}
});
asphalt.wrapS=asphalt.wrapT=T.RepeatWrapping;asphalt.repeat.set(3,3);
const road=new T.Mesh(new T.PlaneGeometry(14.31,14.31),new T.MeshLambertMaterial({map:asphalt}));
road.rotation.x=-Math.PI/2;road.position.y=.008;scene.add(road);

b(-2.18,.13,-2.37,9.88,.25,9.56,0x627582,outlined);
b(-2.18,.263,-2.37,9.77,.02,9.42,0x627a87);
for(let x=-6.95;x<2.7;x+=.42)b(x,.28,2.34,.405,.055,.15,0x9caeb2,bulk);
for(let z=-7;z<2.35;z+=.42)b(2.67,.28,z,.16,.055,.405,0x9caeb2,bulk);
for(let x=-7;x<2.6;x+=.52) b(x,.279,1.81,.012,.004,1.0,0x3c505f,bulk);
for(let z=-7;z<2.3;z+=.52) b(2.09,.279,z,1.0,.004,.012,0x3c505f,bulk);
b(-2.17,.02,2.58,9.95,.017,.22,0x152837);
b(2.92,.021,-2.28,.22,.017,9.4,0x152837);
for(let i=0;i<7;i++){
 b(.22+i*.53,.027,4.06,.32,.014,2.21,0xc5d5d4,bulk);
 b(4.91,.027,.95+i*.34,2.45,.014,.20,0xb9cece,bulk);
}
for(let i=0;i<6;i++) b(-6.48+i*2.54,.025,6.42,.72,.012,.065,0xd9ba7f,bulk);
for(let i=0;i<3;i++)b(6.69,.025,-6.2+i*2.0,.058,.012,.8,0xb1bec5,bulk);
b(3.87,.025,-3.9,.055,.012,5.25,0x9aaeb7);
for(let z=-6.53;z<-1.36;z+=1.7)b(4.94,.025,z,2.18,.012,.053,0xa8b6b8,bulk);
for(const [x,z] of [[-4.74,4.24],[3.3,2.7],[5.43,-5.75]]){
 disc(x,.029,z,.30,0x526774);
 disc(x,.039,z,.25,0x354b5b);
 for(let i=-3;i<=3;i++) b(x,.05,z+i*.047,.34,.009,.015,0x718292,bulk);
}
for(const [x,z] of [[-4.82,2.58],[1.47,2.58],[2.92,-3.31]]){
 b(x,.032,z,.43,.022,.235,0x677d89,outlined);
 for(let i=-4;i<=4;i++)b(x+i*.041,.047,z,.021,.008,.175,0x152736,bulk);
}

const puddleMap=graphic(256,512,(g,w,h)=>{
 const grad=g.createRadialGradient(w/2,h/2,0,w/2,h/2,h/2);
 grad.addColorStop(0,'#fff');grad.addColorStop(.64,'rgba(255,255,255,.62)');grad.addColorStop(1,'rgba(255,255,255,0)');
 g.save();g.translate(w/2,h/2);g.scale(.49,1);g.translate(-w/2,-h/2);g.fillStyle=grad;g.fillRect(-w,0,w*3,h);g.restore();
 g.globalCompositeOperation='destination-out';
 for(let i=0;i<180;i++){g.fillStyle='rgba(0,0,0,'+(rand()*.33)+')';g.fillRect(rand()*w,rand()*h,rand()*65,rand()*3);}
});
function reflection(x,y,z,w,d,c,opacity,rot=0){
 const m=new T.Mesh(new T.PlaneGeometry(w,d),new T.MeshBasicMaterial({map:puddleMap,color:c,transparent:true,opacity,depthWrite:false,blending:T.AdditiveBlending}));
 m.rotation.set(-Math.PI/2,0,rot);m.position.set(x,y,z);scene.add(m);
}
for(const a of [
 [-3,.036,3.3,2.22,3.7,0xff761e,.43],[-.42,.036,3.6,1.93,3.7,0xff9629,.46],
 [1.53,.036,3.55,1.28,3.95,0xffa63d,.49],[-5.25,.036,3.65,1.15,3.6,0x269aff,.44],
 [3.42,.037,-.56,1.45,4.1,0xff9030,.36],[4.48,.037,1.1,1.6,2.7,0x37bdeb,.31],
 [-4.63,.035,5.25,2.6,1.29,0x61aafa,.28,.7],[5.26,.036,-4.52,1.84,2.4,0x61aafa,.31],
 [1.5,.036,5.56,1.1,2.8,0x5595f4,.33],[-1.2,.035,6.28,2.5,1.1,0x487fc6,.28,1]
])reflection(...a);
for(let i=0;i<24;i++){
 const x=-6.7+rand()*13.4,z=2.8+rand()*4.15;
 reflection(x,.032,z,.2+rand()*1.2,.2+rand()*.56,0x81b0de,.12+rand()*.16,rand()*3);
}
reflection(-1.1,.289,1.84,4.7,1.22,0xffbc79,.43,1.57);

const left=-5.23,right=1.76,front=1.17,back=-4.47,floor=.38;
const middle=(left+right)/2,zc=(front+back)/2;
b(middle,.32,zc,7.04,.13,5.7,0x9aa39c,outlined);
b(middle,.401,zc,6.89,.027,5.56,0xe5c7a0);
for(let x=left+.25;x<right;x+=.47)b(x,.417,zc,.012,.003,5.46,0xb29c83,bulk);
for(let z=back+.25;z<front;z+=.47)b(middle,.418,z,6.8,.003,.012,0xb29c83,bulk);
b(middle,1.87,back,7.02,2.96,.16,0xc5bfa8,outlined);
b(left,1.87,zc,.16,2.96,5.61,0xa8b5b0,outlined);
b(right,1.83,-3.62,.16,2.9,1.72,0xa2b1ae,outlined);
for(let i=0;i<6;i++)b(right+.09,1.39+i*.26,-3.62,.01,.012,1.7,0x738b8c,bulk);

const roofStart=scene.children.length;
b(middle,3.27,zc,7.12,.24,5.76,0xd6ddd2,outlined);
b(middle,3.43,zc,7.37,.17,6,0x4d6473,outlined);
b(middle,3.56,zc,7.32,.15,5.99,0x718597,outlined);
b(middle,3.641,zc,7.16,.04,5.83,0x27394a);
for(let i=0;i<8;i++)b(left+.18+i*.95,3.668,zc,.014,.006,5.76,0x69808b);
for(const z of [back-.125,front+.135]){
 b(middle,3.72,z,7.37,.18,.11,0xa2b4ba,outlined);
 b(middle,3.827,z,7.44,.047,.145,0x557086,outlined);
}
for(const x of [left-.18,right+.18]){
 b(x,3.72,zc,.11,.18,5.96,0xa4b7bc,outlined);
 b(x,3.827,zc,.145,.047,6.04,0x557086,outlined);
}
for(const [x,z] of [[-4.22,-3.92],[-3.13,-3.92],[.83,-2.92]]){
 b(x,3.72,z,.78,.14,.47,0x213342);
 b(x,3.88,z,.71,.24,.43,0xa3b3b6,outlined);
 for(let i=-4;i<=4;i++)b(x+i*.056,3.87,z+.218,.018,.14,.009,0x465b67,bulk);
}
rod([.66,3.66,-3.75],[.66,4.32,-3.75],.07,0x899fa9);
disc(.66,4.31,-3.75,.115,0x657d8a,.043);
for(const x of [-3.42,-1.52])rod([x,3.68,-3.75],[x,4.76,-3.75],.034,0x778d9a);
b(-2.47,4.4,-3.75,2.35,.64,.078,0x133e56,outlined);
label(-2.56,4.48,-3.706,1.94,.28,['S O R A M A R T'],'#e0f0eb');
label(-2.59,4.23,-3.705,1.75,.18,['雨夜街角 · 24小时'],'#a4cbd5');
label(-1.48,4.49,-3.70,.28,.32,['☾'],'#ffdda0');
label(-2.47,4.4,-3.799,2.32,.55,['SoraMart','全天营业'],'#c6e1e4',null,Math.PI);

b(middle,2.91,front+.22,7.41,.22,.69,0xa0b2b3,outlined);
b(right+.22,2.91,zc+.07,.70,.22,5.98,0xa0b2b3,outlined);
b(middle,3.15,front+.427,7.42,.42,.15,0xe5f5ec,emissive);
b(right+.49,3.15,zc+.14,.14,.42,5.99,0xe4f3ec,emissive);
for(const [dy,h,c] of [[.18,.054,0x75b9d0],[-.17,.042,0x439a9c],[-.126,.031,0x8cd0bd]]){
 b(middle,3.15+dy,front+.518,7.44,h,.034,c,emissive);
 b(right+.574,3.15+dy,zc+.14,.03,h,5.98,c,emissive);
}
const logo=graphic(1024,150,(g,w,h)=>{
 g.fillStyle='#1b4d68';g.beginPath();g.arc(87,73,41,0,Math.PI*2);g.fill();
 g.fillStyle='#e5f5ec';g.beginPath();g.arc(102,57,35,0,Math.PI*2);g.fill();
 g.fillStyle='#4badad';g.beginPath();g.arc(116,94,7,0,Math.PI*2);g.fill();
 g.fillStyle='#214d66';g.font='900 103px system-ui';g.fillText('SoraMart',153,110);
});
panel(-2.3,3.166,front+.531,3.33,.39,logo);
panel(right+.579,3.161,-.81,2.77,.34,logo,Math.PI/2);
label(.82,3.158,front+.539,1.22,.145,['24小时便利店'],'#326678');
for(let i=0;i<5;i++){
 b(left+.62+i*1.42,2.786,front+.24,.89,.024,.14,0xffe5ad,emissive);
}
b(right+.28,2.785,-.72,.19,.024,2.57,0xffe4ae,emissive);
const shopRoof=scene.children.slice(roofStart);

const glass=new T.MeshBasicMaterial({color:0x8ec9d1,transparent:true,opacity:.099,depthWrite:false,side:T.DoubleSide});
const facadeStart=scene.children.length;
const shine=new T.MeshBasicMaterial({color:0xe4fcff,transparent:true,opacity:.15,depthWrite:false,side:T.DoubleSide});
function glint(x,y,z,w,h,side,parent=scene){
 const p=new T.Mesh(new T.PlaneGeometry(w,h),shine);p.rotation.y=side?Math.PI/2:0;p.rotateZ(-.32);
 p.position.set(x,y,z);parent.add(p);
}
function windowSpan(a,e,side){
 const pos=(a+e)/2,w=e-a;
 if(side){
  b(right,1.55,pos,.029,2.28,w,glass);
  b(right,.51,pos,.13,.24,w,navy);
  b(right,2.67,pos,.14,.11,w,frame);
  b(right,1.23,pos,.08,.043,w,frame);
  glint(right+.024,2.1,pos,.04,.65,true);
 }else{
  b(pos,1.55,front,w,2.28,.025,glass);
  b(pos,.51,front,w,.24,.13,navy);
  b(pos,2.67,front,w,.11,.14,frame);
  b(pos,1.23,front,w,.043,.08,frame);
  glint(pos-.13,2.12,front+.028,.038,.74,false);
 }
}
const mullions=[left,-4.23,-3.10,-1.94,-.76,-.24,1.52,right];
for(const x of mullions)b(x,1.56,front,.081,2.44,.14,frame,outlined);
for(let i=0;i<5;i++)windowSpan(mullions[i],mullions[i+1],false);
windowSpan(1.52,right,false);
const sides=[-2.75,-1.52,-.22,front];
for(const z of sides)b(right,1.57,z,.14,2.41,.09,frame,outlined);
for(let i=0;i<3;i++)windowSpan(sides[i],sides[i+1],true);
for(const [x,z] of [[left,front],[right,front],[right,-2.75]])b(x,1.57,z,.17,2.51,.17,0x849b9d,outlined);

const doors=[];
for(const dir of [-1,1]){
 const g=new T.Group();g.position.set(.64+dir*.438,.405,front-.016);scene.add(g);
 b(0,1.1,0,.86,2.18,.031,glass,{parent:g});
 for(const x of [-.43,.43]) b(x,1.1,0,.048,2.23,.095,frame,{parent:g});
 for(const y of [.03,1.09,2.20]) b(0,y,0,.87,.045,.091,frame,{parent:g});
 b(-dir*.08,1.10,.055,.19,.072,.018,0xf6ebc9,{parent:g,light:true});
 glint(dir*.15,1.55,.044,.041,.68,false,g);
 label(0,.77,.049,.3,.12,['自动门'],'#ecfff7','#286a70',0,g);
 doors.push({g,dir});
}
b(.64,2.66,front,1.77,.145,.17,frame,outlined);
b(.64,2.59,front+.10,.25,.069,.08,0x202e38);
b(.64,2.59,front+.143,.04,.027,.012,0x7cf4c2,emissive);
shopRoof.push(...scene.children.slice(facadeStart));
b(.64,.286,1.51,1.66,.023,.49,0x253e47,outlined);
for(let i=0;i<9;i++)b(.64,.302,1.30+i*.051,1.55,.004,.011,0x536c6f,bulk);
b(.64,.433,.68,1.45,.008,.52,0xd6a86b);
for(let i=0;i<3;i++){
 const p=label(.64,.441,.35-i*.33,.28,.26,['▲'],'#558988');
 p.rotation.x=-Math.PI/2;
}
const products=[0xf2dfaf,0xcc6c62,0x709c81,0xe0af5a,0x87aab6,0xe6cfc0,0xb47884,0x98b4a3];

const stockBodies={
 bottle:new T.LatheGeometry([[0,-.5],[.43,-.5],[.49,-.43],[.49,.19],[.45,.29],[.25,.39],[.23,.49],[0,.49]].map(p=>new T.Vector2(...p)),12),
 packet:new T.SphereGeometry(.57,10,8),
 carton:unit
};
const stockLabelGeo=new T.PlaneGeometry(1,1);
const stockBatches=new Map();
function stockPart(geometry,material,x,y,z,w,h,d){
 if(!stockBatches.has(geometry))stockBatches.set(geometry,new Map());
 const batches=stockBatches.get(geometry);
 if(!batches.has(material))batches.set(material,[]);
 const m=new T.Matrix4().makeScale(w,h,d);
 m.setPosition(x,y,z);batches.get(material).push(m);
}
const stockPrints=new Map();
function stockPrint(c,bottle){
 const key=c+'_'+bottle;
 if(!stockPrints.has(key)){
  const i=products.indexOf(c);
  const color='#'+c.toString(16).padStart(6,'0');
  const name=(bottle?['纯净水','蜜桃茶','茉莉茶','柚子汽水','电解质水','鲜牛奶','草莓乳饮','乌龙茶']:['奶香吐司','辣味薯片','海苔脆片','蜂蜜蛋糕','苏打饼干','原味面包','草莓夹心','抹茶饼干'])[i];
  const map=graphic(180,124,(g,w,h)=>{
   g.fillStyle='#fff3da';g.fillRect(0,0,w,h);
   g.fillStyle=color;g.fillRect(0,0,w,24);g.fillRect(0,92,w,32);
   g.fillStyle='#253732';g.textAlign='center';
   g.font='bold 29px Microsoft YaHei, sans-serif';g.fillText(name,90,69,162);
   g.font='bold 15px Microsoft YaHei, sans-serif';g.fillText(bottle?'冷藏饮料':'休闲食品',90,113);
  });
  stockPrints.set(key,new T.MeshBasicMaterial({map}));
 }
 return stockPrints.get(key);
}
function goods(x,y,z,w,h,d,c,bottle=false){
 const i=products.indexOf(c);
 const packet=!bottle&&i%3!==0;
 const shape=bottle?stockBodies.bottle:packet?stockBodies.packet:stockBodies.carton;
 stockPart(shape,mat(c),x,y+h/2,z,w,h,d);
 stockPart(stockLabelGeo,stockPrint(c,bottle),x,y+h*.51,z+d*(packet?.563:.5)+.002,w*.89,h*(bottle?.43:.52),1);
 if(bottle){
  b(x,y+h+.005,z,w*.43,.019,d*.48,0xf0e9d7,bulk);
 }else if(packet){
  for(const lip of [.07,.93])b(x,y+h*lip,z,w*.92,.013,d*.48,c,bulk);
 }else b(x,y+h-.007,z,w*.97,.014,d*1.01,0xe2d4ba,bulk);
}
function rack(x,z,w,levels=4){
 b(x,.49,z,w,.15,.64,0x958e7e,outlined);
 b(x,1.16,z-.26,w,1.44,.055,0xc4bba4,outlined);
 for(const xx of [x-w/2,x+w/2])b(xx,1.19,z,.05,1.46,.64,0xa99f89,outlined);
 for(let j=0;j<levels;j++){
  const y=.62+j*.34;
  b(x,y,z,w,.047,.64,0xefddba,outlined);
  b(x,y+.008,z+.331,w,.043,.014,0x7b9a91,bulk);
  for(let i=0;i<Math.floor(w/.145);i++){
   const px=x-w/2+.11+i*.145;
   const height=.09+rand()*.11;
   if(j!==levels-1||x!==-3.88||i%4===1)goods(px,y+.025,z+.13,.098,height,.096,products[(i+j*3)%8],i%4===0);
   if(i%3===0)b(px,y+.012,z+.34,.062,.016,.007,0xffedc9,bulk);
  }
 }
 b(x,1.947,z,w,.12,.15,0x6d9d93,outlined);
}
rack(-3.88,-.34,1.96);
rack(-1.64,-1.25,1.63);
rack(-3.77,-2.28,1.85);
rack(-1.37,-2.59,1.44);
label(-3.88,1.95,-.257,1.4,.095,['饭团 · 便当 · 三明治'],'#fff3d8');
label(-1.64,1.95,-1.168,1.31,.09,['休闲零食'],'#fff3d8');
label(-3.77,1.95,-2.198,1.3,.09,['烘焙面包'],'#fff3d8');
for(const x of [-4.38,-3.30,-2.22,-1.14]){
 b(x,1.52,-3.99,1.06,2.19,.74,0x7b9696,outlined);
 b(x,1.48,-3.602,.91,1.93,.013,0xaecdd1,emissive);
 for(let j=0;j<6;j++){
  const y=.61+j*.28;
  b(x,y,-3.511,.88,.031,.27,0xeff2d5,bulk);
  for(let i=0;i<7;i++)goods(x-.39+i*.128,y+.02,-3.535,.074,.115+rand()*.055,.075,products[(j+i*3)%8],i%3!==1);
 }
 for(const xx of [x-.49,x+.49])b(xx,1.52,-3.37,.053,2.12,.048,0x375763,bulk);
 b(x,1.48,-3.36,.94,1.95,.014,glass);
 b(x+.37,1.48,-3.337,.035,.26,.034,0xd3e0d5,bulk);
}
b(-2.76,2.62,-3.91,4.25,.17,.47,0x6aa5b0,outlined);
label(-2.76,2.62,-3.663,3.7,.13,['冷藏饮料'],'#f2fff9');
b(.78,1.52,-4.345,.91,2.18,.15,0x596d70,outlined);
b(.78,1.52,-4.258,.75,2.06,.04,0x7e9391,outlined);
b(1.08,1.43,-4.217,.068,.064,.035,0xe8d0a5);
label(.79,1.96,-4.227,.46,.125,['员工专用'],'#244857','#e0e4c8');
b(.68,.8,-2.38,1.53,.77,.62,0xc5af83,outlined);
b(.68,1.204,-2.38,1.63,.087,.73,cream,outlined);
b(.68,.88,-2.059,1.51,.24,.029,0x588e8e,outlined);
label(.68,.89,-2.038,1.19,.152,['收银台 · 自助结账'],'#f8edc9');
b(.88,1.29,-2.37,.31,.12,.26,0x35464d,outlined);
b(.88,1.455,-2.42,.32,.22,.071,0x2b414b,outlined);
b(.88,1.455,-2.375,.27,.158,.015,0x9cded1,emissive);
b(1.32,1.47,-2.67,.24,.49,.29,0x364749,outlined);
b(1.32,1.57,-2.514,.16,.12,.014,0x8bd4c1,emissive);
b(1.32,1.31,-2.49,.095,.12,.076,0xedddbd);
b(.28,1.27,-2.36,.54,.047,.39,0x69685a,outlined);
b(.28,1.4,-2.37,.54,.25,.39,glass);
for(let i=0;i<5;i++){
 const px=.065+i*.104;
 b(px,1.31,-2.29,.075,.045,.085,products[i],bulk);
 rod([px,1.32,-2.29],[px,1.45,-2.32],.008,0xc4a074);
}
label(.28,1.45,-2.164,.36,.102,['关东煮'],'#fff5dc','#a75e3c');
b(1.10,.73,-.49,.79,.62,1.21,0xb3c7be,outlined);
b(1.10,1.062,-.49,.83,.07,1.25,0x7caaa7,outlined);
b(1.10,1.107,-.49,.68,.017,1.08,glass);
for(let i=0;i<8;i++)b(.94+(i%2)*.23,1.079,-.89+Math.floor(i/2)*.24,.17,.039,.175,products[i],bulk);
label(1.504,.86,-.49,.89,.14,['冷冻冰品'],'#f4f9dd','#588f9f',Math.PI/2);
b(-4.93,.87,.63,.34,.85,.72,0x959f91,outlined);
for(let row=0;row<3;row++){
 b(-4.79,.59+row*.24,.63,.19,.045,.70,0x4b716f,outlined);
 for(let i=0;i<3;i++)label(-4.682,.71+row*.24,.41+i*.22,.18,.19,[['周刊','旅行','漫画'][i]],'#ffeec5',['#6d7e9d','#bd725b','#49898d'][(i+row)%3],Math.PI/2);
}
for(const x of [-4.09,-2.10,-.1,1.08]){
 for(const z of [-2.85,-.8,.62])shopRoof.push(b(x,3.133,z,1.14,.038,.14,0xffedce,emissive));
}
shopRoof.push(
 label(-2.94,1.48,front+.029,.54,.63,['鲜食上新','叉烧饭团','每日新鲜'],'#fff2cd','#aa584b'),
 label(-3.61,1.16,front+.029,.47,.37,['咖啡','现磨热饮'],'#fff0cd','#436d71'),
 label(right+.028,1.41,.52,.48,.62,['热食供应','暖汤小食','关东煮'],'#573a30','#e7bf83',Math.PI/2),
 label(right+.029,2.11,-1.96,.61,.16,['24小时营业'],'#eeffed','#527b7b',Math.PI/2)
);

// Vending machine and service area.
const vendX=-5.85,vendZ=.37;
b(vendX,1.06,vendZ,.91,1.56,.56,0x376581,outlined);
b(vendX,1.08,vendZ+.288,.77,1.44,.032,0x70b9d1,emissive);
b(vendX,1.29,vendZ+.317,.68,.81,.033,0xd9f5eb,emissive);
for(let j=0;j<4;j++){
 b(vendX,.975+j*.19,vendZ+.34,.65,.023,.034,0x365d70,bulk);
 for(let i=0;i<7;i++){
  goods(vendX-.278+i*.091,.992+j*.19,vendZ+.343,.053,.096,.039,products[(i+j*3)%8]);
  b(vendX-.278+i*.091,.981+j*.19,vendZ+.367,.03,.008,.009,0x97ead9,bulk);
 }
}
b(vendX,.66,vendZ+.328,.49,.17,.037,0x253b50,outlined);
b(vendX+.323,.858,vendZ+.34,.082,.135,.029,0x243a4c,outlined);
label(vendX,1.77,vendZ+.314,.68,.115,['自助饮料'],'#eefff6','#306784');
reflection(vendX,.289,1.21,1.32,1.52,0x5bc4fa,.54);
b(-6.55,.68,.48,.38,.79,.43,0x568589,outlined);
b(-6.55,1.08,.48,.42,.092,.46,0x92b9b2,outlined);
b(-6.55,1.127,.51,.23,.013,.12,0x304857,outlined);
label(-6.55,.88,.7,.31,.11,['可回收物'],'#d7ece0');
for(const x of [-6.38,-5.68]){
 b(x,.57,-3.35,.42,.58,.73,0x9daeb2,outlined);
 for(let i=0;i<8;i++)b(x+.221,.36+i*.051,-3.35,.012,.017,.57,0x465a66,bulk);
}
b(-6.23,1.19,-4.49,1.35,1.84,.16,0x405563,outlined);
for(let i=0;i<11;i++)b(-6.23,.38+i*.153,-4.39,1.29,.027,.019,0x627480,bulk);
label(-6.19,1.64,-4.371,.91,.22,['员工入口'],'#a2bcbc','#394a59');
for(let i=0;i<4;i++)b(-6.27,.284,-1.62-i*.67,.098,.005,.26,0x828e8b,bulk);
b(right+.133,1.45,-3.68,.09,.79,1.17,0x394e58,outlined);
b(right+.186,1.45,-3.68,.035,.69,1.05,0xb8a788,outlined);
for(let i=0;i<3;i++)label(right+.21,1.47,-4.03+i*.34,.27,.52,[['社区','公告栏'],['夏日夜市','活动通知'],['安全','疏散图']][i],'#3d5560',['#e2cfac','#e4a985','#aac6bc'][i],Math.PI/2);

const rackX=1.9,rackZ=1.63;
b(rackX,.35,rackZ,.39,.12,.32,0x364c51,outlined);
for(const x of [-.17,.17])for(const z of [-.14,.14])rod([rackX+x,.35,rackZ+z],[rackX+x,.82,rackZ+z],.017,silver);
for(const z of [-.14,.14])rod([rackX-.17,.82,rackZ+z],[rackX+.17,.82,rackZ+z],.018,silver);
for(let i=0;i<3;i++){
 const x=rackX-.115+i*.106;
 rod([x,.39,rackZ],[x+.04,1.02,rackZ+.045],.026,[0x629aa9,0xcaa272,0xaa778c][i]);
 wire([[x+.04,1.02,rackZ+.045],[x+.041,1.097,rackZ+.046],[x+.08,1.115,rackZ+.046],[x+.10,1.077,rackZ+.046]],0x263e50,.014);
}
function bike(x,z){
 const y=.594,r=.306;
 for(const dx of [-.47,.47]){
  const wheel=new T.Mesh(new T.TorusGeometry(r,.027,7,32),mat(0x192c39));wheel.position.set(x+dx,y,z);scene.add(wheel);
  const rim=new T.Mesh(new T.TorusGeometry(r-.026,.011,5,28),mat(0xa3b6b8));rim.position.copy(wheel.position);scene.add(rim);
  for(let i=0;i<8;i++)rod([x+dx,y,z],[x+dx+Math.cos(i*Math.PI/4)*.278,y+Math.sin(i*Math.PI/4)*.278,z],.006,0x899ba1);
 }
 const A=[x-.47,y,z],B=[x-.21,y+.42,z],C=[x+.08,y+.03,z],D=[x+.37,y+.37,z],E=[x+.47,y,z];
 for(const [a,b] of [[A,B],[A,C],[B,C],[B,D],[C,D],[D,E]])rod(a,b,.022,0x6aa9a6);
 rod(D,[x+.34,y+.63,z],.016,0x99b2b9);
 rod([x+.34,y+.63,z-.12],[x+.34,y+.63,z+.13],.02,0x2d444b);
 b(x-.22,y+.46,z,.20,.045,.13,0x263744,outlined);
 b(x+.55,y+.48,z,.25,.19,.25,0x425d67,outlined);
 for(let i=0;i<4;i++)b(x+.43+i*.073,y+.54,z+.13,.012,.15,.014,0x879c9f,bulk);
}
bike(-4.3,1.72);

function guard(x,z,axis){
 const pts=axis?[[x,z-.52],[x,z+.52]]:[[x-.52,z],[x+.52,z]];
 for(const [xx,zz] of pts){
  rod([xx,.28,zz],[xx,.82,zz],.039,0xacbcb9);
  disc(xx,.82,zz,.052,0xd2d4c4,.035);
 }
 for(const y of [.52,.75])rod([pts[0][0],y,pts[0][1]],[pts[1][0],y,pts[1][1]],.027,0x94aeb3);
}
guard(1.9,2.25,false);guard(2.55,1.63,true);
const sx=2.35,sz=1.76;
rod([sx,.28,sz],[sx,3.53,sz],.064,0x4f6876);
wire([[sx,3.46,sz],[sx,3.69,sz],[sx+.32,3.74,sz],[sx+.54,3.68,sz]],0x526e7d,.043);
b(sx+.53,3.645,sz,.28,.10,.18,0x526c77,outlined);
b(sx+.53,3.58,sz,.226,.041,.135,0xffdb9d,emissive);
const street=new T.PointLight(0xffbf74,.74,4.4,2);street.position.set(sx+.53,3.42,sz);scene.add(street);
label(sx,1.61,sz+.078,.73,.23,['青叶路 →'],'#e3f9ef','#2b6f88');
label(sx,1.35,sz+.08,.58,.16,['社区街角'],'#d3eee7','#335d73');
rod([-6.65,.28,1.58],[-6.65,1.55,1.58],.027,0x8b9da4);
const traffic=new T.Mesh(new T.CylinderGeometry(.165,.165,.036,24),mat(0x6aa5b7));
traffic.rotation.x=Math.PI/2;traffic.position.set(-6.65,1.61,1.58);scene.add(traffic);
label(-6.65,1.61,1.604,.20,.20,['↗'],'#e8f1db');
const px=2.27,pz=-3.56;
rod([px,.27,pz],[px,5.37,pz],.092,0x718391);
b(px,3.63,pz,.26,.54,.27,0x83959d,outlined);
for(const y of [4.49,5.0]){
 rod([px-.51,y,pz],[px+.51,y,pz],.045,0x7c909c);
 for(const dx of [-.44,0,.44])rod([px+dx,y,pz],[px+dx,y+.155,pz],.026,0x92a6ad);
}
rod([-5.91,.28,-5.98],[-5.91,4.91,-5.98],.074,0x667c8b);
const cablesStart=scene.children.length;
for(const o of [-.43,0,.43]){
 wire([[-5.91+o,4.82,-5.98],[-3.36+o,4.42,-5.24],[-.55+o,4.50,-4.42],[px+o,5.13,pz],[4.7+o,4.76,-4.62],[6.88+o,4.55,-5.92]],0x53677c);
}
shopRoof.push(...scene.children.slice(cablesStart));
for(const [x,z,k] of [[2.17,-5.3,1],[-5.15,-5.68,1.1],[2.14,-6.29,.69]]){
 b(x,.37,z,.69*k,.22,.64*k,0x486069,outlined);
 rod([x,.45,z],[x+.05*k,1.55*k,z],.059*k,0x5a6664);
 for(const [dx,dy,dz,r,c] of [[0,1.72,0,.49,0x558485],[.24,1.54,.12,.35,0x5e9290],[-.26,1.56,.11,.37,0x507f82],[.08,1.97,-.09,.37,0x6c9a96],[-.13,1.76,-.23,.39,0x49777e]]){
  sphere(x+dx*k,dy*k,z+dz*k,r*k,c);
 }
}
for(const [x,z] of [[3.75,-1.57],[5.95,-6.56],[-5.53,2.18]]){
 const cone=new T.Mesh(new T.ConeGeometry(.094,.32,12),mat(0xd28166));
 cone.position.set(x,(x<0?.28:0)+.17,z);scene.add(cone);
 b(x,(x<0?.28:0)+.026,z,.24,.04,.24,0x495c66,outlined);
 const band=new T.Mesh(new T.CylinderGeometry(.033,.052,.05,12),mat(0xf0dfbd));
 band.position.set(x,(x<0?.28:0)+.203,z);scene.add(band);
}
for(const [material,matrices] of instances){
 const mesh=new T.InstancedMesh(unit,material,matrices.length);
 matrices.forEach((m,i)=>mesh.setMatrixAt(i,m));scene.add(mesh);
}

for(const [geometry,batches] of stockBatches){
 for(const [material,matrices] of batches){
  const mesh=new T.InstancedMesh(geometry,material,matrices.length);
  matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));
  scene.add(mesh);
 }
}

// Rain is clipped to the model footprint and excluded from the interior.
const drops=[];
for(let i=0;i<650;i++)drops.push({x:(rand()-.5)*14.1,y:rand()*7.8,z:(rand()-.5)*14.1,v:6+rand()*4,l:.13+rand()*.26});
const coords=new Float32Array(drops.length*6);
const rainGeo=new T.BufferGeometry();
const rainAttr=new T.BufferAttribute(coords,3).setUsage(T.DynamicDrawUsage);
rainGeo.setAttribute('position',rainAttr);
const rain=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:0x9ec7ea,transparent:true,opacity:.23,depthWrite:false}));
rain.frustumCulled=false;scene.add(rain);
const ripples=[];
const ring=new T.RingGeometry(.86,1,30);
for(let i=0;i<45;i++){
 const m=new T.Mesh(ring,new T.MeshBasicMaterial({color:i%4===0?0xffd39a:0x9cc8e2,transparent:true,depthWrite:false}));
 m.rotation.x=-Math.PI/2;
 if(i%4===0)m.position.set(3.11+rand()*3.87,.056,-6.7+rand()*9.4);
 else m.position.set(-6.94+rand()*13.88,.056,2.79+rand()*4.15);
 scene.add(m);ripples.push({m,phase:rand(),pace:.45+rand()*.61});
}

// The first door opening sends one customer out along the sidewalk.
const visitor=makePerson({coat:0x9a6b53,pants:0x384552,umbrellaColor:0x6f8aa4});
visitor.visible=false;scene.add(visitor);
const exitPath=new T.CatmullRomCurve3([[.64,.416,.38],[.64,.415,1.15],[.64,.30,1.76],[-.68,.28,1.97],[-3.7,.28,2.02],[-5.88,.28,1.65],[-6.54,.28,-.35],[-6.38,.28,-3.8]].map(p=>new T.Vector3(...p)));
let requestedOpen=false,doorProgress=0,visitorTime=Infinity,exitPlayed=false;
const ray=new T.Raycaster(),pointer=new T.Vector2();
const hitZone=new T.Mesh(new T.BoxGeometry(1.78,2.32,.18));hitZone.position.set(.64,1.57,front);hitZone.updateMatrixWorld();
function doorHit(e){
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.set(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height);
 ray.setFromCamera(pointer,camera);
 const hit=ray.intersectObject(hitZone)[0];
 const nearSide=ray.ray.origin.z>front;
 return nearSide&&hit;
}
const activePointers=new Set();
let press=null;
renderer.domElement.addEventListener('pointerdown',e=>{
 activePointers.add(e.pointerId);
 press=activePointers.size===1&&e.button===0?{x:e.clientX,y:e.clientY,id:e.pointerId}:null;
});
renderer.domElement.addEventListener('pointermove',e=>{
 if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>6)press=null;
 if(!activePointers.size)renderer.domElement.style.cursor=shopHit(e)||(!shop.inside&&doorHit(e))?'pointer':shop.inside?'default':'grab';
});
renderer.domElement.addEventListener('pointercancel',e=>{activePointers.delete(e.pointerId);press=null;});
renderer.domElement.addEventListener('pointerup',e=>{
 activePointers.delete(e.pointerId);
 if(press?.id===e.pointerId){
  const interaction=shopHit(e);
  if(interaction)interaction();
  else if(!shop.inside&&!shop.transition&&doorHit(e)){
   requestedOpen=!requestedOpen;
   if(requestedOpen&&!exitPlayed){
    visitorTime=-.57;exitPlayed=true;
   }
  }
 }
 press=null;
});
function resize(){
 const aspect=innerWidth/innerHeight;
 const span=Math.max(8.6,11.5/aspect);
 camera.left=-span*aspect;camera.right=span*aspect;
 camera.top=span;camera.bottom=-span;
 camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
 if(typeof resizeShop==='function')resizeShop();
}
addEventListener('resize',resize);resize();
const clock=new T.Clock();
const step=new T.Vector3(),next=new T.Vector3();
renderer.setAnimationLoop(()=>{
 const elapsed=clock.getDelta();
 const dt=Math.min(elapsed,.10);
 if(orbit.enabled)orbit.update();
 const movingThroughDoor=visitorTime>=-.25&&visitorTime<1.85;
 const target=requestedOpen||movingThroughDoor?1:0;
 doorProgress=T.MathUtils.damp(doorProgress,target,9,dt);
 for(const {g,dir} of doors)g.position.x=.64+dir*(.438+.724*doorProgress);
 visitorTime+=dt;
 visitor.visible=visitorTime>=0&&visitorTime<9.8;
 if(visitor.visible){
  const t=visitorTime/9.8;
  exitPath.getPointAt(t,step);exitPath.getPointAt(Math.min(t+.005,1),next);
  visitor.position.copy(step);
  visitor.rotation.y=Math.atan2(next.x-step.x,next.z-step.z);
  walkPerson(visitor,visitorTime);
 }
 drops.forEach((p,i)=>{
  const roof=p.x>left-.16&&p.x<right+.62&&p.z>back-.13&&p.z<front+.56;
  p.y-=p.v*dt;
  if(p.y<(roof?3.67:.13))p.y=7.45+rand()*.35;
  const o=i*6;
  if(roof&&typeof shop!=='undefined'&&shop.inside){
   coords.fill(0,o,o+6);return;
  }
  coords[o]=p.x;coords[o+1]=p.y;coords[o+2]=p.z;
  coords[o+3]=p.x+.034;coords[o+4]=p.y+p.l;coords[o+5]=p.z-.041;
 });
 rainAttr.needsUpdate=true;
 for(const r of ripples){
  r.phase=(r.phase+dt*r.pace)%1;
  r.m.scale.setScalar(.025+r.phase*.17);
  r.m.material.opacity=.30*Math.sin(r.phase*Math.PI)*(1-r.phase*.63);
 }
 const view=typeof updateShop==='function'?updateShop(dt,elapsed):camera;
 renderer.render(scene,view);
 if(typeof renderShopPreview==='function')renderShopPreview();
});



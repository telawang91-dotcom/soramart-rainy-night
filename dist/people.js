'use strict';

let personOvalGeometry;
function makePerson({coat,skin=0xd5a486,hair=0x302b2b,pants=0x34434a,umbrellaColor,staff=false}){
 const g=new T.Group();
 const mesh=(geo,color,parent,x,y,z)=>{
  const o=new T.Mesh(geo,mat(color));
  o.position.set(x,y,z);parent.add(o);return o;
 };
 const oval=(parent,x,y,z,sx,sy,sz,color)=>{
  personOvalGeometry??=new T.SphereGeometry(1,14,10);
  const o=mesh(personOvalGeometry,color,parent,x,y,z);
  o.scale.set(sx,sy,sz);return o;
 };
 const tube=(parent,x,y,z,top,bottom,length,depth,color)=>{
  const o=mesh(new T.CylinderGeometry(top,bottom,length,12),color,parent,x,y,z);
  o.scale.z=depth;return o;
 };
 const legs=[],arms=[];
 for(const side of [-1,1]){
  const leg=new T.Group();leg.position.set(side*.066,.57,0);g.add(leg);
  tube(leg,0,-.12,0,.066,.049,.27,.87,pants);
  const shin=new T.Group();shin.position.y=-.239;leg.add(shin);
  tube(shin,0,-.113,0,.05,.032,.25,.88,pants);
  oval(shin,0,-.278,.037,.045,.039,.089,0x263238);
  b(0,-.303,.036,.081,.016,.157,0x485051,{parent:shin});
  legs.push({leg,shin});
 }
 oval(g,0,.559,0,.131,.117,.078,pants);
 const torso=tube(g,0,.736,0,.155,.121,.345,.58,coat);torso.rotation.x=-.026;
 oval(g,0,.884,-.009,.145,.058,.083,coat);
 rod([0,.582,.074],[0,.855,.093],.006,staff?0xb8d3bc:0x46484d,g);
 for(const side of [-1,1]){
  const arm=new T.Group();arm.position.set(side*.137,.845,-.006);arm.rotation.z=side*.135;g.add(arm);
  oval(arm,0,-.022,0,.053,.062,.052,coat);
  tube(arm,0,-.106,0,.05,.042,.168,.9,coat);
  const elbow=new T.Group();elbow.position.set(0,-.174,0);arm.add(elbow);
  tube(elbow,0,-.061,0,.042,.033,.15,.91,coat);
  oval(elbow,0,-.166,.006,.031,.05,.03,skin);
  arms.push({arm,elbow});
 }
 const collar=staff?0xe8e2ca:0x4e5354;
 for(const side of [-1,1]){
  const collarTip=b(side*.039,.867,.079,.066,.042,.019,collar,{parent:g});collarTip.rotation.z=side*.39;
 }
 tube(g,0,.922,0,.042,.051,.074,.89,skin);
 const head=new T.Group();head.position.set(0,.995,.006);g.add(head);
 oval(head,0,.031,.005,.086,.107,.081,skin);
 oval(head,0,-.025,.027,.070,.063,.058,skin);
 oval(head,0,.017,.077,.018,.026,.023,skin);
 oval(head,0,-.041,.077,.025,.006,.008,0xa87162);
 const hairCap=mesh(new T.SphereGeometry(1,18,10,0,Math.PI*2,0,Math.PI*.58),hair,head,0,.060,-.007);
 hairCap.scale.set(.092,.092,.089);
 for(const side of [-1,1]){
  oval(head,side*.082,.014,0,.017,.026,.015,skin);
  const eye=oval(head,side*.036,.030,.079,.014,.006,.004,0x373337);
  eye.rotation.z=-side*.06;
  const brow=oval(head,side*.038,.046,.077,.018,.004,.004,hair);
  brow.rotation.z=side*.11;
  oval(head,side*.067,.063,-.019,.022,.061,.063,hair);
 }
 const fringe=oval(head,-.027,.072,.058,.058,.025,.033,hair);fringe.rotation.z=-.34;
 if(staff){
  for(const y of [.817,.801])b(0,y,.091,.243,.012,.009,y>.81?0xe2e3c9:0xbf8e51,{parent:g});
  b(.080,.766,.087,.072,.042,.012,0xeedec4,{parent:g});
 }else{
  oval(g,0,.749,-.102,.108,.144,.075,0x4b5559);
  for(const x of [-.091,.091])rod([x,.869,.056],[x,.628,.077],.012,0x454e50,g);
 }
 if(umbrellaColor!==undefined){
  arms[1].elbow.rotation.x=-1.18;
  const canopy=new T.Group();canopy.position.set(.175,1.25,.145);g.add(canopy);
  rod([0,-.68,0],[0,.207,0],.009,0xb5bdbb,canopy);
  const ribs=12,r=.43;
  const profile=[[0,.209],[.145,.192],[.29,.128],[r,.003]].map(p=>new T.Vector2(...p));
  const section=new T.LatheGeometry(profile,ribs*4).toNonIndexed();
  const uv=section.getAttribute('uv'),colors=[];
  for(let i=0;i<uv.count;i+=3){
   const sector=Math.floor((uv.getX(i)+uv.getX(i+1)+uv.getX(i+2))*ribs/3);
   const c=new T.Color(umbrellaColor).multiplyScalar(sector%2===0?1:.84);
   for(let j=0;j<3;j++)colors.push(c.r,c.g,c.b);
  }
  section.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  canopy.add(new T.Mesh(section,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})));
  const ribsGeometry=new T.BufferGeometry();
  const ribPositions=[];
  for(let i=0;i<ribs;i++){
   const a=i*Math.PI*2/ribs;
   for(let j=1;j<profile.length;j++){
    for(const v of [profile[j-1],profile[j]])ribPositions.push(Math.sin(a)*v.x,v.y+.001,Math.cos(a)*v.x);
   }
  }
  ribsGeometry.setAttribute('position',new T.Float32BufferAttribute(ribPositions,3));
  canopy.add(new T.LineSegments(ribsGeometry,new T.LineBasicMaterial({color:0x53626c,transparent:true,opacity:.53})));
  mesh(new T.CylinderGeometry(.017,.016,.058,10),0x3f5258,canopy,0,.221,0);
 }
 const groups=[];
 g.traverse(o=>{if(o.isGroup)groups.push(o);});
 for(const group of groups){
  const batches=new Map();
  for(const child of group.children){
   if(child.geometry!==personOvalGeometry)continue;
   if(!batches.has(child.material))batches.set(child.material,[]);
   batches.get(child.material).push(child);
  }
  for(const [material,ovals] of batches){
   if(ovals.length<2)continue;
   const batch=new T.InstancedMesh(personOvalGeometry,material,ovals.length);
   ovals.forEach((o,i)=>{o.updateMatrix();batch.setMatrixAt(i,o.matrix);});
   group.remove(...ovals);group.add(batch);
  }
 }
 g.userData.pose={legs,arms,head,hasUmbrella:umbrellaColor!==undefined};
 return g;
}
function walkPerson(person,elapsed){
 const stride=Math.sin(elapsed*7.6);
 const {legs,arms,head,hasUmbrella}=person.userData.pose;
 person.position.y+=.011*(1-Math.cos(elapsed*15.2));
 legs.forEach(({leg,shin},i)=>{
  const phase=i===0?stride:-stride;
  leg.rotation.x=.31*phase;
  shin.rotation.x=.41*Math.max(0,-phase);
 });
 arms[0].arm.rotation.x=-.23*stride;
 if(!hasUmbrella)arms[1].arm.rotation.x=.23*stride;
 head.rotation.y=.065*Math.sin(elapsed*2.2);
}


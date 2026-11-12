'use strict';

// Furniture footprints match the shop's shelving and counters.
const shopObstacles=[
 [-4.89,-2.87,-.68,0],[-2.48,-.80,-1.60,-.90],
 [-4.72,-2.82,-2.63,-1.93],[-2.11,-.63,-2.93,-2.25],
 [-4.94,-.60,-4.35,-3.35],[-.15,1.52,-2.77,-1.99],
 [.66,1.53,-1.14,.16],[-5.13,-4.68,.25,1.00]
];
const navStep=.105,navLeft=-5.03,navBack=-4.24,navCols=64,navRows=51;
const shopper=makePerson({coat:0xa95548,skin:0xd9a88d,hair:0x382e31,pants:0x475465});
shopper.visible=false;
scene.add(shopper);
const shopperFloor=.419;
let journey=null,walkClock=0;
const marker=new T.Mesh(new T.RingGeometry(.104,.137,28),new T.MeshBasicMaterial({color:0xf0c179,transparent:true,opacity:.87,depthWrite:false}));
marker.rotation.x=-Math.PI/2;marker.visible=false;scene.add(marker);

function canStand(x,z){
 const pad=.13;
 return x>=navLeft&&x<=1.58&&z>=navBack&&z<=1.04
  &&!shopObstacles.some(([a,b,c,d])=>x>a-pad&&x<b+pad&&z>c-pad&&z<d+pad);
}
function navPoint(index){
 return {x:navLeft+index%navCols*navStep,z:navBack+Math.floor(index/navCols)*navStep};
}
const navOpen=[];
for(let i=0;i<navCols*navRows;i++){
 const {x,z}=navPoint(i);
 if(canStand(x,z))navOpen.push(i);
}
const validNode=new Set(navOpen);
function closestNode(x,z){
 let nearest=-1,best=Infinity;
 for(const i of navOpen){
  const p=navPoint(i),cost=(x-p.x)**2+(z-p.z)**2;
  if(cost<best){best=cost;nearest=i;}
 }
 return nearest;
}
function clearLine(a,b){
 const length=Math.hypot(a.x-b.x,a.z-b.z);
 const checks=Math.ceil(length/.055);
 for(let i=1;i<=checks;i++){
  const t=i/checks;
  if(!canStand(T.MathUtils.lerp(a.x,b.x,t),T.MathUtils.lerp(a.z,b.z,t)))return false;
 }
 return true;
}
function pathTo(x,z){
 const start=closestNode(shopper.position.x,shopper.position.z);
 const end=closestNode(x,z);
 const previous=new Int32Array(navCols*navRows).fill(-1);
 const queue=[start];previous[start]=start;
 for(let i=0;i<queue.length&&previous[end]===-1;i++){
  const node=queue[i],col=node%navCols,row=Math.floor(node/navCols);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
   if(col+dx<0||col+dx>=navCols||row+dz<0||row+dz>=navRows)continue;
   const next=node+dx+dz*navCols;
   if(!validNode.has(next)||previous[next]!==-1)continue;
   if(dx&&dz&&(!validNode.has(node+dx)||!validNode.has(node+dz*navCols)))continue;
   previous[next]=node;queue.push(next);
  }
 }
 if(previous[end]===-1)return [];
 const raw=[];
 for(let node=end;node!==start;node=previous[node])raw.push(navPoint(node));
 raw.push(navPoint(start));raw.reverse();
 const target={x,z};
 if(canStand(x,z)&&clearLine(raw.at(-1),target))raw.push(target);
 const route=[];
 let cursor={x:shopper.position.x,z:shopper.position.z};
 for(let i=0;i<raw.length;){
  let far=i;
  while(far+1<raw.length&&clearLine(cursor,raw[far+1]))far++;
  route.push(raw[far]);cursor=raw[far];i=far+1;
 }
 return route;
}
function moveShopper(x,z,arrive,face){
 const points=pathTo(x,z);
 if(!points.length)return false;
 journey={points,arrive,face};
 const end=points.at(-1);
 marker.position.set(end.x,shopperFloor+.006,end.z);
 marker.visible=true;
 return true;
}
function updateWalker(dt){
 if(!journey)return;
 const position=shopper.position;
 let stride=dt*1.75;
 while(journey.points.length){
  const {x,z}=journey.points[0],dx=x-position.x,dz=z-position.z;
  const distance=Math.hypot(dx,dz);
  if(distance>.008){
   const heading=Math.atan2(dx,dz);
   const turn=heading-shopper.rotation.y;
   shopper.rotation.y+=Math.atan2(Math.sin(turn),Math.cos(turn))*Math.min(1,dt*13);
  }
  if(distance>stride){
   position.x+=dx*stride/distance;position.z+=dz*stride/distance;
   position.y=shopperFloor;
   walkClock+=dt;walkPerson(shopper,walkClock*1.37);
   return;
  }
  position.set(x,shopperFloor,z);stride-=distance;journey.points.shift();
 }
 const {arrive,face}=journey;
 journey=null;marker.visible=false;
 walkPerson(shopper,0);position.y=shopperFloor;
 if(face)shopper.rotation.y=Math.atan2(face[0]-position.x,face[1]-position.z);
 arrive?.();
}
function resetWalk(){
 journey=null;
 marker.visible=false;
 shopper.position.set(.55,shopperFloor,.77);
 shopper.rotation.y=Math.PI;
 walkPerson(shopper,0);
 shopper.position.y=shopperFloor;
}
const shopFloorPlane=new T.Plane(new T.Vector3(0,1,0),-shopperFloor);
const clickedGround=new T.Vector3();
const followFocus=new T.Vector3(-1.72,1.09,-1.84);
const focusGoal=new T.Vector3();
function followShopper(dt){
 focusGoal.set(-1.72+(shopper.position.x+1.72)*.19,1.09,-1.84+(shopper.position.z+1.84)*.17);
 followFocus.lerp(focusGoal,1-Math.exp(-dt*5));
 shopCamera.position.copy(followFocus).add(new T.Vector3(2.25,6.3,5.8));
 shopCamera.lookAt(followFocus);
}


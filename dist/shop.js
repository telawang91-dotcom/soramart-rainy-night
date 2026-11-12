'use strict';

const shopCamera=new T.PerspectiveCamera(65,1,.045,50);
const shop={
 inside:false,transition:null,station:'food',basket:new Map(),selection:null,
 view:'walk',receipt:null
};
const stations={
 food:{label:'冷藏鲜食',stand:[-3.82,.53],tag:[-3.86,2.22,-.06],fixture:[-3.88,1.20,-.34,2.02,1.54,.66]},
 drinks:{label:'冷藏饮料',stand:[-2.7,-3.17],tag:[-2.65,2.87,-3.43],fixture:[-2.76,1.58,-3.65,4.24,2.17,.58]},
 freezer:{label:'冷冻冰品',stand:[.29,-.41],tag:[1.12,1.60,-.43],fixture:[1.10,.78,-.49,.85,.73,1.25]},
 hot:{label:'关东煮与咖啡',stand:[.24,-1.67],tag:[.23,1.88,-2.31],fixture:[.28,1.41,-2.36,.56,.26,.40]},
 register:{label:'收银台',stand:[.70,-1.65],tag:[1.04,2.15,-2.46],fixture:[.91,1.46,-2.38,.37,.31,.27]}
};
const catalog=[
 {id:'onigiri',station:'food',name:'叉烧肉饭团',spec:'130 克 · 冷藏鲜食',price:620,kind:'rice',color:0x9b3430,at:[-4.55,1.72,-.035],note:'叉烧肉片配酱香炒饭。沿包装撕条打开，即可取出。'},
 {id:'bento',station:'food',name:'唐扬鸡块便当',spec:'445 克 · 微波加热',price:1590,kind:'tray',color:0xb15427,at:[-3.91,1.73,-.016],note:'炸鸡块、鸡蛋碎和菜心搭配米饭。加热前请按包装提示揭开盒盖。'},
 {id:'sandwich',station:'food',name:'全麦牛肉三明治',spec:'185 克 · 冷藏鲜食',price:1250,kind:'sandwich',color:0x366b58,at:[-3.29,1.73,-.026],note:'全麦吐司夹牛肉与生菜，适合随手带走。'},
 {id:'tea',station:'drinks',name:'无糖茉莉茶',spec:'500 毫升 · 无糖茶饮',price:500,kind:'bottle',color:0x456c49,at:[-3.28,2.10,-3.27],note:'茉莉清香，冷藏后更清爽。'},
 {id:'soda',station:'drinks',name:'柚子汽水',spec:'330 毫升 · 含气饮料',price:650,kind:'can',color:0xe9a734,at:[-2.52,2.10,-3.27],note:'冰镇汽水，带柚子果皮的清香。'},
 {id:'milk',station:'drinks',name:'草莓牛奶',spec:'250 毫升 · 冷藏乳饮',price:690,kind:'carton',color:0xd65074,at:[-1.83,2.10,-3.27],note:'草莓风味牛奶，小盒装带吸管。'},
 {id:'ice',station:'freezer',name:'抹茶雪糕',spec:'70 克 · 冷冻甜品',price:790,kind:'bag',color:0x3c704e,at:[1.10,1.18,-.8],note:'抹茶牛乳雪糕，清甜中带一点茶苦味。'},
 {id:'mochi',station:'freezer',name:'红豆冰大福',spec:'80 克 · 冷冻甜品',price:890,kind:'mochi',color:0x893b52,at:[1.10,1.18,-.31],note:'糯米外皮包裹红豆馅，内含两枚。'},
 {id:'oden',station:'hot',name:'关东煮牛肉丸',spec:'30 克 · 按个计价',price:290,kind:'skewer',color:0x875637,at:[.26,1.47,-2.20],note:'清汤煮牛肉丸。点单后由柜台夹取。'},
 {id:'coffee',station:'hot',name:'热美式咖啡',spec:'300 毫升 · 现磨热饮',price:990,kind:'cup',color:0x875637,at:[1.22,1.36,-2.29],note:'现磨咖啡加热水，纸杯配防烫杯套。'}
];
const yen=cents=>'¥'+(cents/100).toFixed(2);

const targets=[];
for(const item of catalog){
 const {g,parts}=packageModel(item,scene,item.station==='food'?.46:.43);
 g.position.set(...item.at);
 if(item.kind==='tray')g.rotation.x=-.32;
 if(item.station==='freezer')g.rotation.x=-.49;
 if(item.station==='food'||item.station==='drinks'){
  const [x,y,z]=item.at;
  label(x,y-.184,z+.017,.25,.085,[yen(item.price)],'#17292a','#f3ecd6');
 }
 for(const mesh of parts){
  mesh.userData.product=item;
  targets.push(mesh);
 }
}

const entrySign=new T.Group();
scene.add(entrySign);
entrySign.position.set(-.71,.28,1.75);
b(0,.305,0,.39,.61,.073,0x36616d,{parent:entrySign,ink:true});
b(0,.04,.012,.44,.072,.27,0x3b4e58,{parent:entrySign,ink:true});
const enterButton=label(0,.337,.04,.345,.47,['点击','进店','↗'],'#fff3ce','#327482',0,entrySign);
const doorExit=label(.64,2.47,front-.11,.53,.18,['出 店'],'#f5f5d5','#2c8177',Math.PI);
const checkoutSign=label(.64,1.93,-2.43,.57,.19,['收银台  ▸'],'#fff1c8','#3e7f81');
const checkoutTarget=b(.88,1.455,-2.375,.285,.18,.021,new T.MeshBasicMaterial({color:0xa7e7da}),{});
const registerBag=b(1.21,1.31,-2.225,.16,.17,.13,0xbc9468,{ink:true});
registerBag.visible=false;
const tillLight=b(.88,1.59,-2.38,.049,.033,.026,0x68dfb6,emissive);
const outsideStep=new T.Vector3(.55,.285,1.91);
const insideStep=new T.Vector3(.55,shopperFloor,.77);
const worldTags=[];
const fixtureHits=[];
const ghost=new T.MeshBasicMaterial({visible:false});
for(const [key,station] of Object.entries(stations)){
 const {label:caption,tag,fixture}=station;
 const sprite=new T.Sprite(new T.SpriteMaterial({map:graphic(420,104,(g,w,h)=>{
  g.fillStyle='#203435';g.strokeStyle='#f0cc8c';g.lineWidth=4;
  g.beginPath();g.roundRect(5,5,w-10,h-24,16);g.fill();g.stroke();
  g.beginPath();g.moveTo(w/2-14,h-22);g.lineTo(w/2+14,h-22);g.lineTo(w/2,h-4);g.closePath();g.fill();g.stroke();
  g.font='bold 42px Microsoft YaHei, PingFang SC, sans-serif';
  g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff3dc';g.fillText(caption,w/2,45);
 })}));
 sprite.position.set(...tag);sprite.scale.set(.30+caption.length*.155,.235,1);
 sprite.userData.station=key;
 sprite.visible=false;scene.add(sprite);worldTags.push(sprite);
 const [x,y,z,w,h,d]=fixture;
 const target=b(x,y,z,w,h,d,ghost);
 target.userData.station=key;fixtureHits.push(target);
}
const exitTag=new T.Sprite(new T.SpriteMaterial({map:graphic(256,80,(g,w,h)=>{
 g.fillStyle='#315554';g.fillRect(0,0,w,h);
 g.fillStyle='#ffedcc';g.font='bold 38px Microsoft YaHei, sans-serif';g.textAlign='center';g.textBaseline='middle';
 g.fillText('返回街角 ↓',w/2,h/2);
})}));
exitTag.position.set(.55,1.33,1.17);exitTag.scale.set(.83,.255,1);
exitTag.visible=false;scene.add(exitTag);worldTags.push(exitTag);
function cutaway(active){
 for(const piece of shopRoof)piece.visible=!active;
 for(const tag of worldTags)tag.visible=active;
 rain.visible=!active;
}
const hud=document.createElement('section');
hud.className='shop-hud';
hud.hidden=true;
hud.innerHTML=`
 <div class="shop-top"><button type="button" data-action="leave" class="shop-exit">← 回到街角</button><div class="shop-brand">点击地面行走 <span>点击商品或货区选购</span></div><button type="button" data-action="basket" class="shop-basket">购物篮 <span>0</span></button></div>
 <div class="shop-dock">
  <article class="shop-card" aria-live="polite"></article>

 </div>`;
document.body.append(hud);
const card=hud.querySelector('.shop-card');
const dock=hud.querySelector('.shop-dock');
const shopVeil=document.createElement('div');
shopVeil.className='shop-veil';document.body.append(shopVeil);
const previewRenderer=new T.WebGLRenderer({alpha:true,antialias:true});
previewRenderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
previewRenderer.outputEncoding=T.sRGBEncoding;
previewRenderer.domElement.setAttribute('aria-hidden','true');
const previewScene=new T.Scene();
previewScene.add(new T.HemisphereLight(0xfff2d7,0x68738c,1.45));
const previewLight=new T.DirectionalLight(0xffdfb7,1.15);
previewLight.position.set(3,5,4);previewScene.add(previewLight);
const previewCamera=new T.PerspectiveCamera(34,1,.05,10);
previewCamera.position.set(0,.16,1.37);previewCamera.lookAt(0,0,0);
let model=null,previewAngle=0,previewClock=0,dragPreview=null;
previewRenderer.domElement.addEventListener('pointerdown',e=>{
 previewRenderer.domElement.setPointerCapture(e.pointerId);dragPreview=e.clientX;
});
previewRenderer.domElement.addEventListener('pointermove',e=>{
 if(dragPreview===null)return;
 previewAngle+=(e.clientX-dragPreview)*.025;dragPreview=e.clientX;
});
for(const event of ['pointerup','pointercancel'])previewRenderer.domElement.addEventListener(event,()=>{dragPreview=null;});

function resizeShop(){
 shopCamera.aspect=innerWidth/innerHeight;
 shopCamera.fov=Math.min(94,T.MathUtils.radToDeg(2*Math.atan(Math.tan(Math.PI/8)*Math.max(1,1.36/shopCamera.aspect))));
 shopCamera.updateProjectionMatrix();
}
resizeShop();
function enterShop(){
 if(shop.transition||shop.inside)return;
 resetWalk();
 shopper.position.copy(outsideStep);
 shopper.visible=true;
 requestedOpen=true;
 orbit.enabled=false;
 shop.transition={mode:'enter',started:performance.now()};
}
function finishLeaving(){
 registerBag.visible=false;
 tillLight.material=mat(0x68dfb6,false);
 hud.hidden=true;
 requestedOpen=true;
 shop.transition={mode:'leave',started:performance.now()};
}
function walkTo(x,z,arrive,face){
 if(!shop.inside||shop.transition)return;
 if(moveShopper(x,z,arrive,face)){
  shop.view='walk';
  drawShop();
 }
}
function leaveShop(){
 walkTo(insideStep.x,insideStep.z,finishLeaving,[insideStep.x,3]);
}
function stationChange(station){
 const {stand,fixture}=stations[station];
 walkTo(...stand,()=>{
  shop.station=station;
  shop.view=station==='register'?'checkout':'browse';
  drawShop();
 },[fixture[0],fixture[2]]);
}
function approachItem(item){
 const [x,,z]=item.at;
 let stand=stations[item.station].stand;
 if(item.station==='food')stand=[x,.48];
 if(item.station==='drinks')stand=[x,-3.17];
 if(item.station==='freezer')stand=[.27,z];
 walkTo(...stand,()=>{
  shop.station=item.station;
  inspect(item);
 },[x,z]);
}
function inspect(item){
 shop.selection=item;
 shop.view='item';
 previewAngle=-.18;
 previewClock=0;
 if(model){
  previewScene.remove(model);
  model.traverse(obj=>{
   if(obj.isMesh&&obj.geometry!==unit){
    obj.geometry.dispose();
    if(obj.material.map||obj.material.isMeshPhongMaterial)obj.material.dispose();
   }
  });
 }
 model=packageModel(item,previewScene).g;
 drawShop();
}
function countBasket(){
 return [...shop.basket.values()].reduce((sum,n)=>sum+n,0);
}
function totalBasket(){
 return catalog.reduce((sum,p)=>sum+p.price*(shop.basket.get(p.id)||0),0);
}
function changeQuantity(id,delta){
 const count=(shop.basket.get(id)||0)+delta;
 if(count>0)shop.basket.set(id,Math.min(count,99));
 else shop.basket.delete(id);
 drawShop();
}
function checkout(){
 if(shop.station!=='register'||shop.view!=='checkout'||!countBasket())return;
 const items=catalog.filter(p=>shop.basket.has(p.id)).map(p=>({name:p.name,qty:shop.basket.get(p.id),price:p.price}));
 shop.receipt={items,total:totalBasket(),number:1+(shop.receipt?.number||0)};
 shop.basket.clear();
 shop.view='receipt';
 registerBag.visible=true;
 tillLight.material=mat(0xffb45b,false);
 drawShop();
}
function receiptRows(items){
 return items.map(p=>`<li><span>${p.name} × ${p.qty}</span><strong>${yen(p.price*p.qty)}</strong></li>`).join('');
}
function drawShop(){
 hud.querySelector('.shop-basket span').textContent=countBasket();
 dock.hidden=shop.view==='walk';
 hud.classList.toggle('walking',dock.hidden);
 if(dock.hidden)return;
 if(shop.view==='item'){
  const item=shop.selection,n=shop.basket.get(item.id)||0;
  card.innerHTML=`<div class="shop-item"><div class="shop-preview" aria-label="拖动查看商品模型"></div><div class="shop-item-text"><small>${item.spec}</small><h2>${item.name} <strong>${yen(item.price)}</strong></h2><p>${item.note}</p><div class="shop-actions"><button data-action="add" data-value="${item.id}" class="shop-primary">放入购物篮</button><button data-action="remove" data-value="${item.id}" ${n?'':'disabled'}>放回货架${n?' · '+n:''}</button><button data-action="browse">返回</button></div></div></div>`;
  const slot=card.querySelector('.shop-preview');
  slot.append(previewRenderer.domElement);
  previewRenderer.setSize(slot.clientWidth||116,slot.clientHeight||106);
  previewCamera.aspect=(slot.clientWidth||116)/(slot.clientHeight||106);previewCamera.updateProjectionMatrix();
 }else if(shop.view==='receipt'){
  const receipt=shop.receipt;
  card.innerHTML=`<small>购物小票 · 编号 ${String(receipt.number).padStart(4,'0')}</small><h2>结账完成</h2><ul class="shop-lines">${receiptRows(receipt.items)}</ul><div class="shop-actions"><strong>合计 ${yen(receipt.total)}</strong><button data-action="leave" class="shop-primary">带走购物袋</button><button data-action="browse">继续逛</button></div>`;
 }else if(shop.view==='basket'||shop.view==='checkout'){
  const paying=shop.view==='checkout';
  const items=catalog.filter(p=>shop.basket.has(p.id));
  card.innerHTML=`<small>${paying?'人民币 · 模拟结账':'人民币 · 购物清单'}</small><h2>${paying?'收银台':'购物篮'}</h2>
  ${items.length?`<ul class="shop-lines">${items.map(p=>`<li><span>${p.name}</span><div class="shop-quantity"><button aria-label="放回一件${p.name}" data-action="remove" data-value="${p.id}">−</button><b>${shop.basket.get(p.id)}</b><button aria-label="加入一件${p.name}" data-action="add" data-value="${p.id}">+</button></div><strong>${yen(p.price*shop.basket.get(p.id))}</strong></li>`).join('')}</ul>`:'<p>购物篮还是空的。去货架看看吧。</p>'}
  <div class="shop-actions"><strong>合计 ${yen(totalBasket())}</strong><button class="shop-primary" data-action="${paying?'pay':'checkout'}" ${items.length?'':'disabled'}>${paying?'模拟付款':'前往收银台'}</button><button data-action="browse">继续逛</button></div>`;
 }else{
  const {label:stationLabel}=stations[shop.station];
  card.innerHTML=`<small>雨夜便利 · 人民币参考价</small><h2>${stationLabel}</h2><div class="shop-products">${catalog.filter(p=>p.station===shop.station).map(p=>`<button data-action="item" data-value="${p.id}"><span>${p.name}</span><strong>${yen(p.price)}</strong></button>`).join('')}${shop.station==='register'?'<button data-action="checkout">查看待结账商品</button>':''}</div>`;
 }
}
hud.addEventListener('click',e=>{
 const button=e.target.closest('button');
 if(!button)return;
 const {action,value}=button.dataset;
 if(action==='leave')leaveShop();

 else if(action==='item')inspect(catalog.find(p=>p.id===value));
 else if(action==='basket'){shop.view='basket';drawShop();}
 else if(action==='browse'){shop.view='walk';drawShop();}
 else if(action==='checkout')stationChange('register');
 else if(action==='pay')checkout();
 else if(action==='add'||action==='remove')changeQuantity(value,action==='add'?1:-1);
});
addEventListener('keydown',e=>{
 if(e.key==='Escape'&&shop.inside){
  if(shop.view!=='walk'){shop.view='walk';drawShop();}
  else leaveShop();
 }
 if(e.key==='Enter'&&!shop.inside&&!shop.transition&&document.activeElement===renderer.domElement)enterShop();
});
renderer.domElement.tabIndex=0;
function shopHit(e){
 if(shop.transition)return null;
 const rect=renderer.domElement.getBoundingClientRect();
 pointer.set(2*(e.clientX-rect.left)/rect.width-1,1-2*(e.clientY-rect.top)/rect.height);
 ray.setFromCamera(pointer,shop.inside?shopCamera:camera);
 if(!shop.inside)return ray.ray.origin.z>front&&ray.intersectObject(enterButton).length?enterShop:null;
 const tagHit=ray.intersectObjects(worldTags,false)[0]?.object;
 if(tagHit===exitTag)return leaveShop;
 if(tagHit)return ()=>stationChange(tagHit.userData.station);
 const hit=ray.intersectObjects([...targets,checkoutSign,checkoutTarget,...fixtureHits],false)[0]?.object;
 if(hit===checkoutSign||hit===checkoutTarget)return ()=>stationChange('register');
 if(hit?.userData.product)return ()=>approachItem(hit.userData.product);
 if(hit?.userData.station)return ()=>stationChange(hit.userData.station);
 const point=ray.ray.intersectPlane(shopFloorPlane,clickedGround);
 if(point&&canStand(point.x,point.z)){
  const {x,z}=point;
  return ()=>walkTo(x,z);
 }
 return null;
}
function renderShopPreview(){
 if(!shop.inside||shop.view!=='item'||!model||hud.hidden)return;
 model.rotation.y=previewAngle+Math.sin(previewClock)*.30;
 previewRenderer.render(previewScene,previewCamera);
}

const pedestrians=[];
function pedestrian(color,coat,points,duration,phase){
 const person=makePerson({coat,umbrellaColor:color,skin:coat===0x986971?0xc19073:0xdbad8e,hair:coat===0x536b6b?0x46332e:0x2f2a29});
 person.visible=false;scene.add(person);
 person.scale.setScalar(coat===0x986971?.90:.98);
 const route=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));
 pedestrians.push({person,route,duration,phase});
}
pedestrian(0x9d738e,0x536e89,[[2.43,.28,-6.95],[2.43,.28,-5.1],[2.42,.28,-2.9],[2.37,.28,-.05],[2.36,.28,1.18],[2.07,.28,1.97],[.4,.28,2.12],[-2.04,.28,2.12],[-5.07,.28,2.11],[-7.04,.28,1.99]],20,4);
pedestrian(0x74988d,0x986971,[[-7.04,.28,2.16],[-4.81,.28,2.13],[-1.9,.28,2.16],[.66,.28,2.13],[2.28,.28,2.03],[2.46,.28,.78],[2.48,.28,-2.8],[2.49,.28,-6.99]],19,5);
pedestrian(0xb39a6d,0x536b6b,[[6.94,.008,6.75],[4.93,.008,6.74],[2.08,.008,6.18],[1.61,.008,5.01],[1.58,.008,3.39],[1.58,.008,2.55],[1.62,.28,2.34],[.24,.28,2.12],[-3.1,.28,2.1],[-6.94,.28,2.04]],21,22);
const clerk=makePerson({coat:0x387369,skin:0xd9a68b,staff:true});
clerk.position.set(.62,.417,-2.97);
clerk.scale.setScalar(1.13);
scene.add(clerk);
let shopTime=0;
function updateShop(dt,elapsed){
 shopTime+=dt;
 const greeting=shop.inside&&shop.station==='register';
 clerk.rotation.y=T.MathUtils.damp(clerk.rotation.y,greeting?-.11:.36,4,dt);
 clerk.userData.pose.head.rotation.x=greeting?Math.sin(shopTime*1.7)*.07:0;
 for(const walker of pedestrians){
  const {person,route,duration,phase}=walker;
  const elapsed=(shopTime+phase)%(duration+9);
  person.visible=elapsed<duration;
  if(person.visible){
   const t=elapsed/duration;
   route.getPointAt(t,step);route.getPointAt(Math.min(t+.008,1),next);
   person.position.copy(step);
   person.rotation.y=Math.atan2(next.x-step.x,next.z-step.z);
   walkPerson(person,elapsed);
  }
 }
 if(shop.inside&&shop.view==='item'&&dragPreview===null)previewClock+=dt*1.55;
 if(!shop.transition){
  if(!shop.inside)return camera;
  updateWalker(Math.min(elapsed,.33));
  followShopper(dt);
  return shopCamera;
 }
 const trans=shop.transition;
 const entering=trans.mode==='enter';
 const t=Math.min((performance.now()-trans.started)/1480,1);
 const u=T.MathUtils.smoothstep((t-.15)/.70,0,1);
 const travel=entering?u:1-u;
 shopper.position.copy(outsideStep).lerp(insideStep,travel);
 shopper.rotation.y=entering?Math.PI:0;
 walkPerson(shopper,u*1.6);
 const indoorView=entering?t>=.88:t<.17;
 cutaway(indoorView);
 const fadeAt=entering?.88:.17;
 shopVeil.style.opacity=String(Math.max(0,1-Math.abs(t-fadeAt)/.105)*.90);
 if(t===1){
  shop.transition=null;
  shop.inside=entering;
  requestedOpen=false;
  orbit.enabled=!entering;
  hud.hidden=!entering;
  shopper.visible=entering;
  renderer.domElement.style.cursor=entering?'default':'grab';
  if(entering){resetWalk();shop.view='walk';drawShop();}
 }
 if(indoorView){followShopper(dt);return shopCamera;}
 return camera;
}

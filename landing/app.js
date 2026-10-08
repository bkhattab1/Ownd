/* ====== CONFIG: bddl hado ====== */
const CONFIG = {
  whatsapp: "212762793876",   // rqm WhatsApp dyalk (b 212 bla 0 w bla +)
  price1: 300,                // taman dyal 9et3a wa7da
  price2: 550,                // taman dyal zouj
};
/* =============================== */

const IMAGES = ["img/a1.webp?v=3","img/a2.webp?v=3","img/a3.webp?v=3","img/a4.webp?v=3","img/a5.webp?v=3","img/a6.webp?v=3"];
/* img: tswira li katban mlli kaytkhtar l'loun (null = ma kaynach tswira dyalo) */
const COLORS = [
  {id:"noir",  name:"كحل",  hex:"#2B2A2E", img:0},
  {id:"rouge", name:"حمر",  hex:"#6E2130", img:2},
  {id:"beige", name:"بيج",  hex:"#D9C6A8", img:null},
  {id:"rose",  name:"وردي", hex:"#E7B5C2", img:null},
  {id:"bleu",  name:"زرق",  hex:"#34507E", img:null},
  {id:"vert",  name:"خضر",  hex:"#4A6650", img:null},
];
const CITIES = ["الدار البيضاء","الرباط","سلا","تمارة","القنيطرة","المحمدية","مراكش","فاس","مكناس","طنجة","تطوان","أكادير","إنزكان","وجدة","الناظور","الحسيمة","بني ملال","خريبكة","سطات","برشيد","الجديدة","آسفي","الصويرة","العرائش","القصر الكبير","تازة","الراشيدية","ورزازات","تارودانت","كلميم","العيون","الداخلة","خنيفرة","سيدي قاسم","سيدي سليمان","الفقيه بن صالح","وزان","شفشاون","بركان","تاوريرت","مدينة أخرى"];

const state = {img:0, color:COLORS[0], color2:COLORS[1], qty:1};
const $ = id => document.getElementById(id);
const price = () => state.qty === 2 ? CONFIG.price2 : CONFIG.price1;

/* gallery: swipe f tilifon, thumbs f pc */
const track=$("track");
IMAGES.forEach((src,i)=>{
  const s=document.createElement("div"); s.className="slide";
  s.innerHTML=`<img src="${src}" alt="عباية هودي طويلة OWND، صورة ${i+1}" width="1080" height="1440" ${i?'loading="lazy"':'fetchpriority="high"'} draggable="false">`;
  track.appendChild(s);
  $("dots").appendChild(document.createElement("i"));
  const b=document.createElement("button");
  b.type="button"; b.setAttribute("aria-label","صورة "+(i+1));
  b.innerHTML=`<img src="${src}" alt="" loading="lazy">`;
  b.onclick=()=>setImg(i);
  $("thumbs").appendChild(b);
});
function mark(i){
  state.img=i;
  $("count").textContent=`${i+1} / ${IMAGES.length}`;
  [...$("dots").children].forEach((d,j)=>d.classList.toggle("on", j===i));
  [...$("thumbs").children].forEach((b,j)=>b.setAttribute("aria-current", j===i));
}
function setImg(i, smooth=true){
  i=(i+IMAGES.length)%IMAGES.length;
  track.scrollTo({left:i*track.clientWidth, behavior: smooth?"smooth":"auto"});
  mark(i);
}
let raf;
track.addEventListener("scroll",()=>{cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>{
  const i=Math.round(track.scrollLeft/track.clientWidth); if(i!==state.img) mark(i);
});},{passive:true});
$("prevBtn").onclick=()=>setImg(state.img-1);
$("nextBtn").onclick=()=>setImg(state.img+1);
window.addEventListener("resize",()=>setImg(state.img,false));

/* radio helper */
function radios(container, items, render, onPick, isOn){
  container.innerHTML="";
  items.forEach(it=>{
    const b=document.createElement("button");
    b.type="button"; b.setAttribute("role","radio");
    render(b,it);
    b.onclick=()=>{onPick(it); refresh();};
    b._it=it; container.appendChild(b);
  });
  container._isOn=isOn;
}
function sync(container){[...container.children].forEach(b=>b.setAttribute("aria-checked", container._isOn(b._it)));}

const swatch=(b,c)=>{b.className="sw"; b.innerHTML=`<i style="background:${c.hex}"></i>${c.name}`;};
radios($("swatches"), COLORS, swatch,
  c=>{state.color=c; if(c.img!==null) setImg(c.img);}, c=>c===state.color);
radios($("swatches2"), COLORS, swatch,
  c=>{state.color2=c;}, c=>c===state.color2);

const SAVE = CONFIG.price1*2 - CONFIG.price2;
function bundleItems(){
  return [
    {q:1, title:"قطعة وحدة", sub:"التوصيل فابور", p:CONFIG.price1},
    {q:2, title:"زوج قطع", sub:`كتوفري ${SAVE} درهم · تقدري تختاري جوج ألوان`, p:CONFIG.price2, rib:"الأكثر طلبا"},
  ];
}
radios($("bundles"), bundleItems(),
  (b,x)=>{b.className="bundle"; b.innerHTML=`<div><div class="b-title">${x.title}${x.rib?`<span class="ribbon">${x.rib}</span>`:""}</div><div class="b-sub">${x.sub}</div></div><div class="b-price">${x.p} درهم</div>`;},
  x=>{state.qty=x.q;}, x=>x.q===state.qty);


CITIES.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;$("city").appendChild(o);});

function itemLabel(o){
  return o.qty===2
    ? `زوج قطع · ${o.color.name} + ${o.color2.name}`
    : `قطعة وحدة · ${o.color.name}`;
}
function refresh(){
  ["swatches","swatches2","bundles"].forEach(id=>sync($(id)));
  $("colorName").textContent=state.color.name;
  $("color2Name").textContent=state.color2.name;
  $("secondWrap").classList.toggle("show", state.qty===2);
  const p=price()+" درهم";
  $("priceTop").innerHTML=`${price()} <small>درهم</small>`;
  $("sumPrice").textContent=p; $("stickyPrice").textContent=p;
  $("sumLabel").textContent = itemLabel(state);
}
mark(0); refresh();

/* tracking dyal l'mraa7il: kayban f Vercel Analytics b7al pages /etape/... */
const sent={};
function step(name){
  if(sent[name]) return; sent[name]=1;
  try{ window.va && window.va("pageview",{path:"/etape/"+name}); }catch(e){}
}
if("IntersectionObserver" in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ step("2-formulaire"); io.disconnect(); } }),{threshold:.3});
  io.observe($("order"));
}

/* video: kaybda mlli kayban f l'ecran */
const vid=$("vid");
if(vid && "IntersectionObserver" in window){
  new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting) vid.play().catch(()=>{}); else vid.pause(); }),{threshold:.4}).observe(vid);
}

/* thank-you page */
function showThanks(t){
  const c = COLORS.find(x=>x.id===t.color) || COLORS[0];
  const c2 = COLORS.find(x=>x.id===t.color2) || c;
  const first = String(t.name||"").trim().split(/\s+/)[0];
  $("tyTitle").textContent = first ? `شكرا ${first}! الطلبية ديالك توصلات` : "شكرا! الطلبية ديالك توصلات";
  $("orderId").textContent = t.id;
  if(c.img!==null){ $("tyImg").src = IMAGES[c.img]; $("tyImg").hidden=false; }
  else { $("tySw").style.background = c.hex; $("tySw").hidden=false; }
  $("tyItem").textContent = itemLabel({qty:t.qty, color:c, color2:c2});
  $("tyHeight").textContent = t.height ? t.height+" سم" : "—";
  $("tyCity").textContent = t.city;
  $("tyPhone").textContent = String(t.phone||"").replace(/(\d{2})(?=\d)/g,"$1 ");
  $("tyTotal").textContent = t.total+" درهم";
  if(CONFIG.whatsapp){
    const msg=`سلام، درت طلبية رقم ${t.id} باسم ${t.name}`;
    $("waLink").href=`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
    $("waLink").hidden=false;
  }
  if(t.qty===1){
    $("tyUp").innerHTML=`<b>بغيتي تزيدي قطعة ثانية؟</b> الثانية بـ ${CONFIG.price2-CONFIG.price1} درهم فقط (زوج بـ ${CONFIG.price2} درهم). قوليها لينا ملي نعيطو ليك ولا فالواتساب.`;
    $("tyUp").hidden=false;
  }
  $("shop").hidden=true;
  $("thanksPage").hidden=false;
  window.scrollTo(0,0);
}
$("tyBack").onclick=()=>{ try{sessionStorage.removeItem("hd_order");}catch(e){} };
try{
  const saved=sessionStorage.getItem("hd_order");
  if(saved && location.hash==="#merci") showThanks(JSON.parse(saved));
}catch(e){}

/* form */
function check(id, ok){ $("f-"+id).classList.toggle("bad", !ok); return ok; }
$("order").addEventListener("submit", async e=>{
  e.preventDefault();
  const name=$("name").value.trim();
  const phone=$("phone").value.replace(/[\s.-]/g,"").replace(/^\+?212/,"0");
  const city=$("city").value;
  const address=$("address").value.trim();
  const height=parseInt($("height").value.replace(/[^\d]/g,""),10);
  const ok = [
    check("name", name.length>=3),
    check("phone", /^0[567]\d{8}$/.test(phone)),
    check("height", height>=120 && height<=210),
    check("city", !!city),
    check("address", address.length>=4),
  ].every(Boolean);
  if(!ok){ document.querySelector(".field.bad input, .field.bad select")?.focus(); return; }

  const order = {
    name, phone, city, address,
    qty: state.qty,
    color: state.color.id,
    color2: state.qty===2 ? state.color2.id : null,
    height,
    website: $("website").value,
  };

  const btn=$("submitBtn"), label=btn.textContent;
  step("3-clic-commande");
  btn.disabled=true; btn.textContent="كنصيفطو الطلبية…"; $("formErr").hidden=true;
  try{
    const r = await fetch("/api/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(order)});
    const data = await r.json().catch(()=>({}));
    if(!r.ok || !data.ok) throw new Error(data.error || "server");

    if (window.fbq) fbq("track","Purchase",{value:data.total,currency:"MAD"},{eventID:data.id});
    if (window.ttq) ttq.track("CompletePayment",{value:data.total,currency:"MAD"});

    const t = {id:data.id, total:data.total || price(), name, phone, city,
               qty:order.qty, color:order.color, color2:order.color2, height};
    try{ sessionStorage.setItem("hd_order", JSON.stringify(t)); history.replaceState(null,"","#merci"); }catch(e){}
    step("4-commande-ok");
    showThanks(t);
  }catch(err){
    $("formErr").textContent = "ما قدرناش نصيفطو الطلبية دابا. تأكدي من الأنترنيت وعاودي ضغطي على الزر.";
    $("formErr").hidden=false;
    btn.disabled=false; btn.textContent=label;
  }
});

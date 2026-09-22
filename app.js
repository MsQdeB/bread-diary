/* ============================================================
   BREAD DIARY — app logic (vanilla JS, no dependencies)
   ============================================================ */
const KEY = "breadDiary.v2";
const OLDKEY = "breadDiary.v1";
let state = { bakes: [], prices: {}, settings: {}, starter: [] };
let selected = new Set();
let currentId = null;
let editingId = null;
let editingStarterId = null;
const READONLY = (((location.hostname||"").endsWith("github.io")) || /[?&]view\b/.test(location.search)) && !/[?&]edit\b/.test(location.search);

const RECIPE_FIELDS = [
  ["breadFlour","Bread flour"],["wholemealFlour","Wholemeal flour"],["plainFlour","Plain flour"],["otherFlour","Other flour"],
  ["water","Water"],["salt","Salt"],["yeast","Instant yeast"],["levain","Levain"],["oil","Olive oil"],["honey","Honey"],
  ["chia","Chia (soaked)"],["flax","Flaxseed"],["pumpkinSeed","Pumpkin seeds"],["sunflowerSeed","Sunflower seeds"],["otherSeeds","Other seeds"]
];
const PROCESS_FIELDS = [
  ["levainBuild","Levain build"],["mixing","Mixing / autolyse"],["folds","Folds"],["bulk","Bulk"],
  ["retard","Cold retard"],["shaping","Shaping"],["proof","Final proof"],["bake","Bake"],["cooling","Cooling"]
];
const SCORE_FIELDS = [["crumb","Crumb"],["spring","Oven spring"],["crust","Crust"],["sour","Sourness"],["flavour","Flavour"]];

/* ---------- helpers ---------- */
function num(v){ v=parseFloat(v); return isNaN(v)?0:v; }
function esc(s){ return (s==null?"":String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
function cur(){ return (state.settings.currency||"$")+" "; }
function money(n){
  const d=(state.settings.decimals!=null)?Number(state.settings.decimals):2;
  const v=isFinite(n)?n:0;
  return cur()+v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d});
}
let toastT;
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove("show"),2400); }

/* ---------- persistence ---------- */
function seedState(){
  const prices = {}; (window.INGREDIENTS||[]).forEach(i=>prices[i.key]=i.price);
  return {
    bakes: (window.BAKES||[]).map(b=>JSON.parse(JSON.stringify(b))),
    prices: prices,
    settings: JSON.parse(JSON.stringify(window.SETTINGS||{})),
    starter: JSON.parse(JSON.stringify(window.STARTER_LOG||[]))
  };
}
function load(){
  let stored = null;
  try{ const raw = localStorage.getItem(KEY); if(raw) stored = JSON.parse(raw); }catch(e){}
  const seed = seedState();
  if(stored){
    state = Object.assign(seed, stored);
    state.settings = Object.assign(seed.settings, stored.settings||{});
    state.prices = Object.assign(seed.prices, stored.prices||{});
  } else {
    let olds = null;
    try{ const raw2 = localStorage.getItem(OLDKEY); if(raw2) olds = JSON.parse(raw2); }catch(e){}
    state = seed;
    if(Array.isArray(olds)&&olds.length) state.bakes = olds;
  }
  // ensure new ingredient keys have a price
  (window.INGREDIENTS||[]).forEach(i=>{ if(state.prices[i.key]==null) state.prices[i.key]=i.price; });
}
function persist(){ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch(e){ toast("⚠ Storage full — remove photos or export & clear."); } }

/* ---------- metrics ---------- */
function metrics(b){
  const r = b.recipe||{};
  const levain = num(r.levain), lf=levain/2, lw=levain/2;
  const flour = num(r.breadFlour)+num(r.wholemealFlour)+num(r.plainFlour)+num(r.otherFlour);
  const totalFlour = flour+lf, totalWater = num(r.water)+lw;
  const doughWeight = totalFlour+totalWater;
  return {
    totalFlour, totalWater, doughWeight,
    hydration: totalFlour? totalWater/totalFlour*100:0,
    levainPct: totalFlour? levain/totalFlour*100:0,
    yeastPct: totalFlour? num(r.yeast)/totalFlour*100:0,
    saltPct: totalFlour? num(r.salt)/totalFlour*100:0,
    wholePct: totalFlour? num(r.wholemealFlour)/totalFlour*100:0
  };
}
function totalSeedWeight(r){ r=r||{}; return num(r.chia)+num(r.flax)+num(r.pumpkinSeed)+num(r.sunflowerSeed)+num(r.otherSeeds); }
function makes(b){ return Math.max(1, num(b.makes)||num(state.settings.defaultMakes)||1); }
function ratingValue(b){
  if(b.rating!=null && b.rating!=="") return num(b.rating);
  if(b.score){ const v=SCORE_FIELDS.map(s=>num(b.score[s[0]])).filter(x=>x>0); if(v.length) return v.reduce((a,c)=>a+c,0)/v.length; }
  return null;
}
function batchShare(b){ if(!b.batch) return 1; const n=state.bakes.filter(x=>x.batch && x.batch===b.batch).length; return n||1; }
function cost(b){
  const r=b.recipe||{}; let ing=0; const lines=[];
  (window.INGREDIENTS||[]).forEach(it=>{
    const g=num(r[it.key]); if(!g) return;
    const c=g/1000*num(state.prices[it.key]); ing+=c; lines.push({key:it.key,label:it.label,g,c});
  });
  const m=makes(b), s=state.settings, n=batchShare(b);
  const energy=num(s.energyPerBake)/n, pack=num(s.packagingPerLoaf)*m, labor=num(s.laborRate)*num(s.laborHours)/n;
  const total=ing+energy+pack+labor;
  return { lines, ing, energy, pack, labor, total, makes:m, batchN:n, perLoaf: total/m, ingPerLoaf: ing/m, laborPerLoaf: labor/m, energyPerLoaf: energy/m, packPerLoaf: num(s.packagingPerLoaf) };
}

/* ---------- tabs ---------- */
function showTab(name){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-"+name).classList.add("active");
  document.querySelectorAll("#tabs button").forEach(b=>b.classList.toggle("active", b.dataset.tab===name));
  if(name==="compare") renderComparePicker();
  if(name==="insights") renderInsights();
  if(name==="calculator") renderCalcInputs();
  if(name==="schedule"){ applySchedDefaults(); recalcSchedule(); }
  if(name==="starter") renderStarter();
  if(name==="checklists") renderChecklists();
  if(name==="guide") renderGuide();
  if(name==="costing"){ renderCosting(); }
  if(name==="troubleshoot") renderTroubleshoot();
}
function toggleDark(){
  document.body.classList.toggle("dark");
  const on=document.body.classList.contains("dark");
  document.getElementById("darkBtn").textContent = on? "☀️":"🌙";
  try{ localStorage.setItem("breadDiary.dark", on?"1":"0"); }catch(e){}
}

/* ---------- table ---------- */
function leaveningClass(l){ if(/sour/i.test(l)) return "sour"; if(/hybrid/i.test(l)) return "hybrid"; return "yeast"; }
function stars(n){ if(n==null||n==="") return '<span class="muted">—</span>'; n=Math.round(+n); return '<span class="stars">'+ "★".repeat(n)+"☆".repeat(Math.max(0,5-n)) +'</span>'; }

function filteredBakes(){
  const q=(document.getElementById("search")?.value||"").toLowerCase();
  const type=document.getElementById("filterType")?.value||"";
  const sort=document.getElementById("filterSort")?.value||"num";
  let arr = state.bakes.filter(b=>{
    const hay=(b.title+" "+(b.notes||"")+" "+(b.verdict||"")+" "+(b.leavening||"")+" "+(b.date||"")).toLowerCase();
    if(q && !hay.includes(q)) return false;
    if(type && (b.leavening||"")!==type) return false;
    return true;
  });
  const rv=b=>ratingValue(b)==null?-1:ratingValue(b);
  if(sort==="rating") arr.sort((a,b)=>rv(b)-rv(a));
  else if(sort==="hydration") arr.sort((a,b)=>metrics(b).hydration-metrics(a).hydration);
  else if(sort==="cost") arr.sort((a,b)=>cost(b).perLoaf-cost(a).perLoaf);
  else arr.sort((a,b)=>(num(b.number))-(num(a.number)));
  return arr;
}
function renderTable(){
  const tb=document.getElementById("tbody"); if(!tb) return;
  tb.innerHTML="";
  const arr=filteredBakes();
  document.getElementById("count").textContent = state.bakes.length;
  document.getElementById("emptyState").style.display = state.bakes.length? "none":"block";
  arr.forEach(b=>{
    const m=metrics(b), c=cost(b), r=ratingValue(b);
    const tr=document.createElement("tr");
    tr.onclick=(e)=>{ if(e.target.type==="checkbox") return; openDetail(b.id); };
    tr.innerHTML =
      '<td><input type="checkbox" '+(selected.has(b.id)?"checked":"")+' onclick="toggleSel(event,\''+b.id+'\')"></td>'+
      '<td class="num">'+esc(b.number||"")+'</td>'+
      '<td class="num">'+esc(b.date||"")+(b.dateNote?'<div class="tag">'+esc(b.dateNote)+'</div>':'')+'</td>'+
      '<td><b>'+esc(b.title||"Untitled")+'</b>'+(b.tags?'<div class="tag">'+esc(b.tags)+'</div>':'')+'</td>'+
      '<td><span class="pill '+leaveningClass(b.leavening)+'">'+esc(b.leavening||"")+'</span></td>'+
      '<td class="num">'+m.totalFlour.toFixed(0)+' g<div class="tag">'+m.wholePct.toFixed(0)+'% whole</div></td>'+
      '<td class="num">'+m.hydration.toFixed(0)+'%</td>'+
      '<td class="num">'+(m.levainPct?m.levainPct.toFixed(0)+"%":"—")+'</td>'+
      '<td class="num">'+m.saltPct.toFixed(1)+'%</td>'+
      '<td>'+esc((b.environment&&b.environment.temp)||"—")+'</td>'+
      '<td class="num edit-only">'+money(c.perLoaf)+'</td>'+
      '<td><span class="pill '+(/progress|planned/i.test(b.status||"")?"progress":"baked")+'">'+esc(b.status||"—")+'</span></td>'+
      '<td>'+stars(r)+'</td>';
    tb.appendChild(tr);
  });
  renderCompareBar();
}
function renderCompareBar(){
  const bar=document.getElementById("compareBar"); if(!bar) return;
  bar.style.display=selected.size?"block":"none";
  document.getElementById("selCount").textContent=selected.size+" selected";
}
function toggleSel(e,id){ e.stopPropagation(); if(e.target.checked) selected.add(id); else selected.delete(id); renderCompareBar(); }

/* ---------- detail ---------- */
function openDetail(id){
  currentId=id; const b=state.bakes.find(x=>x.id===id); if(!b) return;
  const m=metrics(b), c=cost(b), r=ratingValue(b);
  document.getElementById("dTitle").textContent="#"+b.number+" · "+b.title;
  document.getElementById("dSub").innerHTML=esc(b.date||"")+(b.dateNote?' ('+esc(b.dateNote)+')':'')+' · <span class="pill '+leaveningClass(b.leavening)+'">'+esc(b.leavening||"")+'</span> · '+esc(b.status||"")+' · '+stars(r);

  let html='<div class="metric-chips">'+
    chip("Total flour",m.totalFlour.toFixed(0)+" g")+chip("Dough",m.doughWeight.toFixed(0)+" g")+
    chip("Hydration",m.hydration.toFixed(0)+"%")+chip("Levain",m.levainPct.toFixed(0)+"%")+
    chip("Yeast",m.yeastPct.toFixed(2)+"%")+chip("Salt",m.saltPct.toFixed(1)+"%")+
    chip("Whole grain",m.wholePct.toFixed(0)+"%")+chip("Seeds",totalSeedWeight(b.recipe).toFixed(0)+" g")+
    chip("Room",esc((b.environment&&b.environment.temp)||"—"))+chip("Humidity",esc((b.environment&&b.environment.humidity)||"—"))+
    chip("Cost/loaf",money(c.perLoaf),"edit-only")+
    (num(b.bakedWeight)? chip("Baked weight",num(b.bakedWeight)+" g")+(m.doughWeight>num(b.bakedWeight)? chip("Bake loss",((m.doughWeight-num(b.bakedWeight))/m.doughWeight*100).toFixed(0)+"%") : "") : "")+
    (c.batchN>1? chip("Shared batch","÷"+c.batchN,"edit-only") : "")+
    '</div>';

  if(b.score||b.rating!=null){
    html+='<h3 class="section-title">Scorecard</h3><div class="metric-chips">';
    SCORE_FIELDS.forEach(([k,l])=>{ const v=num((b.score||{})[k]); if(v) html+=chip(l, stars(v)); });
    if(b.rating!=null) html+=chip("Overall", stars(b.rating));
    html+='</div>';
  }

  html+='<div class="grid2"><div><h3 class="section-title">Recipe (grams)</h3><dl class="kv">';
  RECIPE_FIELDS.forEach(([k,l])=>{ const v=num((b.recipe||{})[k]); if(v) html+='<dt>'+esc(l)+'</dt><dd class="num">'+v+' g</dd>'; });
  if((b.recipe||{}).otherFlourNote) html+='<dt>Other flour note</dt><dd>'+esc(b.recipe.otherFlourNote)+'</dd>';
  if((b.recipe||{}).otherSeedsNote) html+='<dt>Other seeds note</dt><dd>'+esc(b.recipe.otherSeedsNote)+'</dd>';
  html+='</dl><div class="edit-only"><h3 class="section-title">Cost</h3><dl class="kv">';
  html+='<dt>Ingredients</dt><dd class="num">'+money(c.ing)+'</dd>';
  html+='<dt>Makes</dt><dd>'+c.makes+' loaf'+(c.makes>1?'es':'')+'</dd>';
  html+='<dt>Cost / loaf</dt><dd class="num"><b>'+money(c.perLoaf)+'</b></dd>';
  if(b.sellPrice){ const sp=num(b.sellPrice); const marg=sp? (sp-c.perLoaf)/sp*100:0; html+='<dt>Sell price</dt><dd class="num">'+money(sp)+' <span class="badge">'+marg.toFixed(0)+'% margin</span></dd>'; }
  html+='</dl></div></div>';

  html+='<div><h3 class="section-title">Process</h3><dl class="kv">';
  PROCESS_FIELDS.forEach(([k,l])=>{ const v=(b.process||{})[k]; if(v) html+='<dt>'+esc(l)+'</dt><dd>'+esc(v)+'</dd>'; });
  html+='</dl></div></div>';

  html+='<h3 class="section-title">Notes & verdict</h3>';
  if(b.notes) html+='<p>'+esc(b.notes)+'</p>';
  if(b.verdict) html+='<p><b>Verdict:</b> '+esc(b.verdict)+'</p>';
  if(b.improvements) html+='<p><b>Next time:</b> '+esc(b.improvements)+'</p>';

  html+='<h3 class="section-title">Photos</h3>';
  if(b.photos&&b.photos.length) html+='<div class="photos">'+b.photos.map(p=>'<img src="'+esc(p)+'" onclick="window.open(this.src)">').join("")+'</div>';
  else html+='<p class="muted">No photos yet. Use <b>Edit → Add photo</b>.</p>';

  document.getElementById("dBody").innerHTML=html;
  document.getElementById("detailOverlay").classList.add("open");
}
function chip(l,v,cls){ return '<div class="chip'+(cls?' '+cls:'')+'"><b>'+v+'</b><span>'+l+'</span></div>'; }
function closeDetail(){ document.getElementById("detailOverlay").classList.remove("open"); }
function editCurrent(){ closeDetail(); openForm(currentId); }
function deleteCurrent(){
  if(!confirm("Delete this bake permanently?")) return;
  state.bakes=state.bakes.filter(x=>x.id!==currentId); selected.delete(currentId);
  persist(); renderTable(); closeDetail(); toast("Bake deleted");
}

/* ---------- form ---------- */
function fld(k,lbl,val,type,attrs){
  val=val==null?"":val;
  if(type==="area") return '<label class="f">'+lbl+'</label><textarea data-k="'+k+'" '+(attrs||"")+'>'+esc(val)+'</textarea>';
  return '<label class="f">'+lbl+'</label><input data-k="'+k+'" type="'+(type||"text")+'" value="'+esc(val)+'" '+(attrs||"")+'>';
}
function openForm(id){
  editingId=id||null;
  const b=id? state.bakes.find(x=>x.id===id):{recipe:{},environment:{},process:{},score:{},photos:[]};
  document.getElementById("fTitle").textContent=id?"Edit bake #"+b.number:"Add bake";
  const r=b.recipe||{},env=b.environment||{},pr=b.process||{},sc=b.score||{};

  let html='<h3 class="section-title">Basics</h3><div class="row4">'+
    fld("title","Title",b.title,"text",'placeholder="Seeded Sourdough"')+
    fld("date","Date",b.date,"date")+fld("number","Bake #",b.number,"number")+
    fld("tags","Tags",b.tags,"text",'placeholder="sourdough, seeded"')+
  '</div><div class="row4">'+
    '<label class="f">Leavening</label><select data-k="leavening">'+["Instant yeast","Sourdough","Hybrid"].map(o=>'<option '+(b.leavening===o?"selected":"")+'>'+o+'</option>').join("")+'</select>'+
    fld("status","Status",b.status,"text",'placeholder="Baked / In progress"')+
    fld("rating","Overall rating",b.rating,"number",'min="1" max="5" step="0.5"')+
    fld("dateNote","Date note",b.dateNote,"text",'placeholder="approx."')+
  '</div>';

  html+='<h3 class="section-title">Scorecard (1–5)</h3><div class="row4">';
  SCORE_FIELDS.forEach(([k,l])=>{ html+=fld("score."+k,l,sc[k],"number",'min="1" max="5" step="1"'); });
  html+='</div>';

  html+='<h3 class="section-title">Recipe (grams)</h3><div class="row4">';
  RECIPE_FIELDS.forEach(([k,l])=>{ html+=fld("recipe."+k,l,num(r[k])||"","number",'step="0.1" min="0"'); });
  html+='</div><div class="row2">'+fld("recipe.otherFlourNote","Other flour note",r.otherFlourNote)+fld("recipe.otherSeedsNote","Other seeds note",r.otherSeedsNote)+'</div>';

  html+='<h3 class="section-title">Yield & pricing</h3><div class="row4">'+
    fld("makes","Makes (loaves)",b.makes,"number",'min="1" step="1"')+
    fld("bakedWeight","Baked weight (g)",b.bakedWeight,"number",'min="0" step="1"')+
    fld("batch","Batch tag (shared)",b.batch,"text",'placeholder="shared energy/labour"')+
    fld("sellPrice","Sell price / loaf",b.sellPrice,"number",'step="0.01" min="0"')+
  '</div>';

  html+='<h3 class="section-title">Environment</h3><div class="row2">'+
    fld("environment.temp","Room temp",env.temp,"text",'placeholder="29 °C"')+
    fld("environment.humidity","Humidity",env.humidity,"text",'placeholder="89 %"')+
  '</div>';

  html+='<h3 class="section-title">Process</h3>';
  PROCESS_FIELDS.forEach(([k,l])=>{ html+=fld("process."+k,l,pr[k],"area"); });

  html+='<h3 class="section-title">Notes & verdict</h3>'+
    fld("notes","Observations",b.notes,"area")+fld("verdict","Verdict",b.verdict,"area")+
    fld("improvements","What to change next time",b.improvements,"area");

  html+='<h3 class="section-title">Photos</h3><input type="file" id="photoInput" accept="image/*" multiple onchange="addPhotos(event)">'+
    '<p class="help">Photos are resized and saved inside the diary.</p><div class="photos" id="formPhotos"></div>';

  document.getElementById("fBody").innerHTML=html;
  window._formPhotos=(b.photos||[]).slice(); renderFormPhotos();
  document.getElementById("formOverlay").classList.add("open");
}
function renderFormPhotos(){
  const el=document.getElementById("formPhotos"); if(!el) return;
  el.innerHTML=(window._formPhotos||[]).map((p,i)=>'<div style="position:relative"><img src="'+esc(p)+'" style="width:100%;height:120px;object-fit:cover;border-radius:10px;border:1px solid var(--line)"><button class="danger tiny" style="position:absolute;top:6px;right:6px" onclick="rmPhoto('+i+')">✕</button></div>').join("");
}
function rmPhoto(i){ window._formPhotos.splice(i,1); renderFormPhotos(); }
function addPhotos(e){
  [...e.target.files].forEach(file=>{
    const reader=new FileReader();
    reader.onload=ev=>{ const img=new Image(); img.onload=()=>{
      const max=1400,scale=Math.min(1,max/Math.max(img.width,img.height));
      const c=document.createElement("canvas"); c.width=img.width*scale; c.height=img.height*scale;
      c.getContext("2d").drawImage(img,0,0,c.width,c.height);
      window._formPhotos.push(c.toDataURL("image/jpeg",0.82)); renderFormPhotos();
    }; img.src=ev.target.result; };
    reader.readAsDataURL(file);
  });
  e.target.value="";
}
function gv(k){ const el=document.querySelector('[data-k="'+k+'"]'); return el?el.value:undefined; }
function maxNumber(){ return state.bakes.reduce((m,b)=>Math.max(m,num(b.number)),0); }
function saveForm(){
  const b=editingId?state.bakes.find(x=>x.id===editingId):{id:"b"+Date.now(),recipe:{},environment:{},process:{},score:{}};
  b.title=gv("title")||"Untitled"; b.date=gv("date")||""; b.dateNote=gv("dateNote")||"";
  b.number=num(gv("number"))||maxNumber()+1; b.tags=gv("tags")||"";
  b.leavening=gv("leavening"); b.status=gv("status")||"Baked";
  const rv=gv("rating"); b.rating= rv===""||rv==null?null:num(rv);
  b.makes=num(gv("makes"))||num(state.settings.defaultMakes)||1;
  const sv=gv("sellPrice"); b.sellPrice= sv===""||sv==null?null:num(sv);
  const bwt=gv("bakedWeight"); b.bakedWeight= bwt===""||bwt==null?null:num(bwt);
  b.batch=gv("batch")||"";
  b.recipe=b.recipe||{}; b.environment=b.environment||{}; b.process=b.process||{}; b.score=b.score||{};
  RECIPE_FIELDS.forEach(([k])=>{ b.recipe[k]=num(gv("recipe."+k)); });
  b.recipe.otherFlourNote=gv("recipe.otherFlourNote")||""; b.recipe.otherSeedsNote=gv("recipe.otherSeedsNote")||"";
  b.environment.temp=gv("environment.temp")||""; b.environment.humidity=gv("environment.humidity")||"";
  PROCESS_FIELDS.forEach(([k])=>{ b.process[k]=gv("process."+k)||""; });
  SCORE_FIELDS.forEach(([k])=>{ const v=gv("score."+k); b.score[k]= v===""||v==null?null:num(v); });
  b.notes=gv("notes")||""; b.verdict=gv("verdict")||""; b.improvements=gv("improvements")||"";
  b.photos=(window._formPhotos||[]).slice();
  if(!editingId) state.bakes.push(b);
  persist(); renderTable(); closeForm(); toast("Saved ✓");
}
function closeForm(){ document.getElementById("formOverlay").classList.remove("open"); editingId=null; }

/* ---------- compare ---------- */
function renderComparePicker(){
  const el=document.getElementById("cmpPick"); if(!el) return;
  el.innerHTML=state.bakes.slice().sort((a,b)=>num(b.number)-num(a.number)).map(b=>
    '<label><input type="checkbox" '+(selected.has(b.id)?"checked":"")+' onchange="toggleSelTab(event,\''+b.id+'\')"> #'+b.number+' '+esc(b.title)+'</label>').join("");
  renderCompareOut();
}
function toggleSelTab(e,id){ if(e.target.checked) selected.add(id); else selected.delete(id); renderCompareBar(); renderCompareOut(); }
function renderCompareOut(){
  const sel=state.bakes.filter(b=>selected.has(b.id));
  const out=document.getElementById("cmpOut"); if(!out) return;
  if(sel.length<2){ out.innerHTML='<p class="muted">Pick 2 or more bakes above to compare.</p>'; return; }
  const rows=[
    ["Bake",b=>"#"+b.number+" "+b.title],["Date",b=>b.date||"—"],["Type",b=>b.leavening||"—"],["Status",b=>b.status||"—"],
    ["Total flour",b=>metrics(b).totalFlour.toFixed(0)+" g"],["Dough weight",b=>metrics(b).doughWeight.toFixed(0)+" g"],
    ["Hydration",b=>metrics(b).hydration.toFixed(0)+"%"],["Whole grain",b=>metrics(b).wholePct.toFixed(0)+"%"],
    ["Levain",b=>metrics(b).levainPct?metrics(b).levainPct.toFixed(0)+"%":"—"],
    ["Instant yeast",b=>metrics(b).yeastPct?metrics(b).yeastPct.toFixed(2)+"%":"—"],
    ["Salt",b=>metrics(b).saltPct.toFixed(1)+"%"],["Seeds",b=>totalSeedWeight(b.recipe).toFixed(0)+" g"],
    ["Room",b=>(b.environment&&b.environment.temp)||"—"],["Retard",b=>(b.process&&b.process.retard)||"—"],
    ["Proof",b=>(b.process&&b.process.proof)||"—"],["Bake",b=>(b.process&&b.process.bake)||"—"],
    ["Cost/loaf",b=>money(cost(b).perLoaf)],["Rating",b=>ratingValue(b)==null?"—":"★".repeat(Math.round(ratingValue(b)))],
    ["Verdict",b=>b.verdict||"—"]
  ];
  let html='<div class="wrap-scroll"><table class="cmp-table"><thead><tr><th>Field</th>'+sel.map(b=>'<th>#'+b.number+'</th>').join("")+'</tr></thead><tbody>';
  rows.forEach(([l,fn])=>{ html+='<tr><td><b>'+esc(l)+'</b></td>'+sel.map(b=>'<td>'+esc(fn(b))+'</td>').join("")+'</tr>'; });
  html+='</tbody></table></div>'; out.innerHTML=html;
}
function openCompare(){ showTab("compare"); }

/* ---------- charts ---------- */
function chartW(){ return 520; }
function barChart(items,opts){
  opts=opts||{}; const W=520,H=240,pl=40,pb=34,pt=14,pr=12;
  const max=opts.max||Math.max(1,...items.map(i=>i.value));
  const bw=(W-pl-pr)/Math.max(1,items.length);
  let s='<svg class="chart" viewBox="0 0 '+W+' '+H+'">';
  s+='<line class="axis" x1="'+pl+'" y1="'+(H-pb)+'" x2="'+(W-pr)+'" y2="'+(H-pb)+'"/>';
  s+='<line class="axis" x1="'+pl+'" y1="'+pt+'" x2="'+pl+'" y2="'+(H-pb)+'"/>';
  for(let g=0;g<=4;g++){ const y=pt+(H-pb-pt)*g/4; const val=(max*(1-g/4)); s+='<text x="'+(pl-6)+'" y="'+(y+3)+'" text-anchor="end">'+(opts.int?Math.round(val):val.toFixed(opts.dp||0))+'</text>'; }
  items.forEach((it,i)=>{ const h=(H-pb-pt)*(it.value/max); const x=pl+bw*i+bw*0.15, w=bw*0.7;
    s+='<rect x="'+x+'" y="'+(H-pb-h)+'" width="'+w+'" height="'+h+'" rx="4" fill="'+(it.color||"var(--accent2)")+'" opacity="0.9"/>';
    s+='<text x="'+(x+w/2)+'" y="'+(H-pb+14)+'" text-anchor="middle">'+esc(it.label)+'</text>';
    if(it.value) s+='<text x="'+(x+w/2)+'" y="'+(H-pb-h-4)+'" text-anchor="middle">'+esc(it.sub||"")+'</text>';
  });
  s+='</svg>'; return s;
}
function scatter(points,opts){
  opts=opts||{}; const W=520,H=240,pl=40,pb=34,pt=14,pr=14;
  const xs=points.map(p=>p.x), ys=points.map(p=>p.y);
  const xmin=Math.min(...xs,100)-5, xmax=Math.max(...xs,0)+5, ymin=0, ymax=5;
  const X=v=>pl+(W-pl-pr)*((v-xmin)/(xmax-xmin||1));
  const Y=v=>pt+(H-pb-pt)*(1-(v-ymin)/(ymax-ymin||1));
  let s='<svg class="chart" viewBox="0 0 '+W+' '+H+'">';
  s+='<line class="axis" x1="'+pl+'" y1="'+(H-pb)+'" x2="'+(W-pr)+'" y2="'+(H-pb)+'"/>';
  s+='<line class="axis" x1="'+pl+'" y1="'+pt+'" x2="'+pl+'" y2="'+(H-pb)+'"/>';
  for(let r=1;r<=5;r++){ s+='<text x="'+(pl-6)+'" y="'+(Y(r)+3)+'" text-anchor="end">'+r+'</text>'; }
  s+='<text x="'+((W)/2)+'" y="'+(H-4)+'" text-anchor="middle">'+(opts.xLabel||"")+'</text>';
  points.forEach(p=>{ s+='<circle cx="'+X(p.x)+'" cy="'+Y(p.y)+'" r="5" fill="var(--accent)" opacity="0.75"/>';
    if(p.label) s+='<text x="'+(X(p.x)+7)+'" y="'+(Y(p.y)+3)+'">'+esc(p.label)+'</text>'; });
  s+='</svg>'; return s;
}
function hbars(items){
  const max=Math.max(1,...items.map(i=>i.value)); let s='<div>';
  items.forEach(i=>{ const w=Math.round(i.value/max*100);
    s+='<div style="display:flex;align-items:center;gap:8px;margin:6px 0"><div style="width:90px;font-size:13px">'+esc(i.label)+'</div>'+
      '<div class="bar" style="width:'+w+'%;max-width:'+(100)+'%"></div><div class="num" style="font-size:13px">'+i.value.toFixed(1)+'</div></div>'; });
  return s+'</div>';
}

/* ---------- insights ---------- */
function renderInsights(){
  const bs=state.bakes;
  const rated=bs.filter(b=>ratingValue(b)!=null);
  const avgR=rated.length? (rated.reduce((a,b)=>a+ratingValue(b),0)/rated.length):0;
  const avgH=bs.length? bs.reduce((a,b)=>a+metrics(b).hydration,0)/bs.length:0;
  const totFlour=bs.reduce((a,b)=>a+metrics(b).totalFlour,0);
  const avCost=bs.length? bs.reduce((a,b)=>a+cost(b).perLoaf,0)/bs.length:0;
  document.getElementById("insKpis").innerHTML=
    kpi(bs.length,"Total bakes")+kpi(avgR?avgR.toFixed(1)+"★":"—","Avg rating")+
    kpi(avgH.toFixed(0)+"%","Avg hydration")+kpi((totFlour/1000).toFixed(1)+" kg","Total flour")+
    kpi(money(avCost),"Avg cost/loaf");
  const sorted=bs.slice().sort((a,b)=>num(a.number)-num(b.number));
  document.getElementById("chartRating").innerHTML=barChart(sorted.map(b=>({label:"#"+b.number,value:ratingValue(b)||0,sub:ratingValue(b)||"",color:"var(--accent)"})),{max:5,int:true});
  document.getElementById("chartScatter").innerHTML= scatter(rated.map(b=>({x:metrics(b).hydration,y:ratingValue(b),label:"#"+b.number})),{xLabel:"hydration %"});
  const withCost=bs.map(b=>({label:"#"+b.number,value:cost(b).perLoaf,sub:money(cost(b).perLoaf)}));
  document.getElementById("chartCost").innerHTML= withCost.length? barChart(withCost,{dp:1,int:false}):'<p class="muted">No bakes yet.</p>';
  const scoreItems=SCORE_FIELDS.map(([k,l])=>{ const v=bs.map(b=>num((b.score||{})[k])).filter(x=>x>0); return {label:l,value:v.length? v.reduce((a,c)=>a+c,0)/v.length:0}; });
  document.getElementById("chartScore").innerHTML= hbars(scoreItems);
}
function kpi(v,l){ return '<div class="kpi"><b>'+v+'</b><span>'+l+'</span></div>'; }

/* ---------- calculator ---------- */
const CALC_DEFAULT = { breadFlour:180, wholemealFlour:105, water:195, salt:6.5, yeast:0, levain:100, oil:10, honey:10, chia:8, flax:15, pumpkinSeed:15, sunflowerSeed:0, plainFlour:0, otherFlour:0, otherSeeds:0 };
function renderCalcInputs(){
  const el=document.getElementById("calcInputs"); if(!el) return;
  el.innerHTML=RECIPE_FIELDS.map(([k,l])=>'<div><label class="f">'+l+'</label><input type="number" data-calc="'+k+'" value="'+(CALC_DEFAULT[k]||0)+'" oninput="recalc()"></div>').join("");
  recalc();
}
function calcGrams(){ const o={}; document.querySelectorAll("[data-calc]").forEach(i=>o[i.dataset.calc]=num(i.value)); return o; }
function recalc(){
  const g=calcGrams();
  const flourKeys=["breadFlour","wholemealFlour","plainFlour","otherFlour"];
  const r={}; let totalFlour=0,totalAll=0;
  Object.keys(g).forEach(k=>{ if(!g[k]) return; totalAll+=g[k]; });
  Object.keys(g).forEach(k=>{ r[k]=g[k]; });
  // baker's % excludes levain's flour from base per convention; include total flour base
  const levain=num(g.levain), lf=levain/2;
  const flourBase=flourKeys.reduce((a,k)=>a+num(g[k]),0)+lf;
  const pct=k=>flourBase? (num(g[k])/flourBase*100):0;

  let pctHtml='<div class="wrap-scroll"><table><tbody>';
  RECIPE_FIELDS.forEach(([k,l])=>{ if(!num(g[k])) return; pctHtml+='<tr><td>'+l+'</td><td class="num">'+num(g[k]).toFixed(1)+' g</td><td class="num">'+pct(k).toFixed(1)+'%</td></tr>'; });
  pctHtml+='</tbody></table></div>';
  pctHtml+='<p class="help">Total flour base (incl. levain flour): '+flourBase.toFixed(0)+' g · Total dough: '+totalAll.toFixed(0)+' g</p>';
  document.getElementById("calcPct").innerHTML=pctHtml;

  const mode=document.getElementById("scaleMode").value;
  let target;
  if(mode==="loaves"){ const n=num(document.getElementById("loafN").value)||1, w=num(document.getElementById("loafW").value)||900; target=n*w; }
  else target=num(document.getElementById("scaleVal").value)||totalAll;
  const ratio=totalAll? target/totalAll:1;
  let scaled='<div class="wrap-scroll"><table><tbody>';
  RECIPE_FIELDS.forEach(([k,l])=>{ if(!num(g[k])) return; scaled+='<tr><td>'+l+'</td><td class="num">'+(num(g[k])*ratio).toFixed(1)+' g</td></tr>'; });
  scaled+='</tbody></table></div>';
  document.getElementById("calcScaled").innerHTML=scaled;
  document.getElementById("calcNote").textContent="Scale factor ×"+ratio.toFixed(3)+" → "+target.toFixed(0)+" g total dough.";
  document.getElementById("scaleValLbl").textContent = mode==="loaves"?"(uses loaves × weight)":"Target weight (g)";
}

/* ---------- schedule ---------- */
let schedSteps=[];
function baseSteps(temp){
  const t=num(temp)||24; const f=Math.max(0.4,Math.min(1.6,Math.pow(2,(24-t)/10)));
  return [
    {name:"Build levain",dur:Math.round(300*f),scaled:true},
    {name:"Mix + autolyse",dur:30,scaled:false},
    {name:"3 folds (30 min apart)",dur:90,scaled:false},
    {name:"Bulk ferment",dur:Math.round(90*f),scaled:true},
    {name:"Warm up + shape",dur:30,scaled:false},
    {name:"Final proof",dur:Math.round(90*f),scaled:true},
    {name:"Bake",dur:45,scaled:false}
  ];
}
function applySchedDefaults(){
  const temp=document.getElementById("schedTemp").value;
  const b=baseSteps(temp);
  schedSteps=b.slice(0,5);
  // insert retard from input
  schedSteps.splice(5,0,{name:"Cold retard (fridge)",dur:(num(document.getElementById("schedRetard").value)||10)*60,scaled:false,retard:true});
  schedSteps.push(b[5]); schedSteps.push(b[6]);
}
function fmtClock(mins){
  let h=Math.floor(mins/60)%24, m=Math.round(mins%60);
  return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0");
}
function recalcSchedule(){
  const [sh,sm]=(document.getElementById("schedStart").value||"12:00").split(":").map(Number);
  let t=sh*60+(sm||0);
  const body=document.getElementById("schedBody"); if(!body) return;
  body.innerHTML=schedSteps.map((st,i)=>{
    const start=t; t+=st.dur;
    return '<tr><td>'+esc(st.name)+'</td>'+
      '<td><input type="number" class="sched-dur" data-i="'+i+'" value="'+st.dur+'" style="width:90px" onchange="setSchedDur('+i+',this.value)"> min</td>'+
      '<td class="num">'+fmtClock(start)+' → '+fmtClock(t)+'</td></tr>';
  }).join("");
}
function setSchedDur(i,v){ schedSteps[i].dur=Math.max(0,num(v)); recalcSchedule(); }

/* ---------- starter ---------- */
function renderStarter(){
  const el=document.getElementById("starterList"); if(!el) return;
  const arr=(state.starter||[]).slice().sort((a,b)=> (b.date||"").localeCompare(a.date||""));
  if(!arr.length){ el.innerHTML='<p class="muted">No feedings logged yet. Click <b>+ Log feeding</b>.</p>'; return; }
  el.innerHTML=arr.map(s=>'<div class="item"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap">'+
    '<div><b>'+esc(s.date||"")+(s.time?' '+esc(s.time):'')+'</b> · ratio '+esc(s.ratio||"—")+' · '+esc(s.temp||"")+'</div>'+
    '<div class="noprint"><button class="tiny" onclick="openStarterForm(\''+s.id+'\')">Edit</button> <button class="danger tiny" onclick="delStarter(\''+s.id+'\')">Del</button></div>'+
    '</div><div class="help">starter '+num(s.starter)+'g · flour '+num(s.flour)+'g · water '+num(s.water)+'g'+(s.rise?' · rise: '+esc(s.rise):'')+(s.peakTime?' · peak '+esc(s.peakTime):'')+'</div>'+
    (s.notes?'<div style="margin-top:6px">'+esc(s.notes)+'</div>':'')+'</div>').join("");
}
function openStarterForm(id){
  editingStarterId=id||null;
  const s=id? state.starter.find(x=>x.id===id):{};
  document.getElementById("sfTitle").textContent=id?"Edit feeding":"Log feeding";
  document.getElementById("sfBody").innerHTML='<div class="row3">'+
    fld("date","Date",s.date||new Date().toISOString().slice(0,10),"date")+fld("time","Time",s.time||"","time")+
    fld("ratio","Ratio",s.ratio||"1:1:1","text","placeholder='1:1:1'")+'</div><div class="row4">'+
    fld("starter","Starter (g)",s.starter||20,"number")+fld("flour","Flour (g)",s.flour||20,"number")+
    fld("water","Water (g)",s.water||20,"number")+fld("temp","Temp",s.temp||"29 °C","text")+'</div><div class="row2">'+
    fld("rise","Rise",s.rise||"doubled","text","placeholder='doubled / 50% / flat'")+fld("peakTime","Time to peak",s.peakTime||"","text","placeholder='3 h'")+
    '</div>'+fld("notes","Notes",s.notes||"","area");
  document.getElementById("starterOverlay").classList.add("open");
}
function closeStarterForm(){ document.getElementById("starterOverlay").classList.remove("open"); editingStarterId=null; }
function saveStarter(){
  const s=editingStarterId? state.starter.find(x=>x.id===editingStarterId):{id:"s"+Date.now()};
  s.date=gv("date")||""; s.time=gv("time")||""; s.ratio=gv("ratio")||""; s.starter=num(gv("starter"));
  s.flour=num(gv("flour")); s.water=num(gv("water")); s.temp=gv("temp")||""; s.rise=gv("rise")||"";
  s.peakTime=gv("peakTime")||""; s.notes=gv("notes")||"";
  if(!editingStarterId) state.starter.push(s);
  persist(); renderStarter(); closeStarterForm(); toast("Feeding saved ✓");
}
function delStarter(id){ if(!confirm("Delete this feeding?")) return; state.starter=state.starter.filter(x=>x.id!==id); persist(); renderStarter(); }

/* ---------- costing ---------- */
function renderCosting(){
  const s=state.settings;
  document.getElementById("setCurrency").value=s.currency||"$";
  document.getElementById("setDecimals").value=(s.decimals!=null?s.decimals:2);
  document.getElementById("setEnergy").value=num(s.energyPerBake);
  document.getElementById("setPack").value=num(s.packagingPerLoaf);
  document.getElementById("setRate").value=num(s.laborRate);
  document.getElementById("setHours").value=num(s.laborHours);
  document.getElementById("priceBody").innerHTML=(window.INGREDIENTS||[]).map(i=>{
    const extra = i.key==="levain" ? ' <button class="tiny" onclick="autoLevainPrice()" title="Set to (bread flour + water) / 2 — the cost of a 100% hydration levain">auto</button>' : '';
    return '<tr><td>'+esc(i.label)+extra+'</td><td><input type="number" step="0.01" value="'+num(state.prices[i.key])+'" oninput="setPrice(\''+i.key+'\',this.value)"></td></tr>';
  }).join("");
  const sel=document.getElementById("costPick");
  const prev=sel.value;
  sel.innerHTML=state.bakes.slice().sort((a,b)=>num(b.number)-num(a.number)).map(b=>'<option value="'+b.id+'">#'+b.number+' '+esc(b.title)+'</option>').join("");
  if(prev) sel.value=prev;
  renderCostDetail();
}
function setPrice(k,v){ state.prices[k]=num(v); persist(); }
function autoLevainPrice(){
  // 100% hydration levain = half flour, half water
  state.prices.levain=(num(state.prices.breadFlour)+num(state.prices.water))/2;
  persist(); renderCosting(); renderTable();
  toast("Levain set to "+money(state.prices.levain)+"/kg");
}
function saveSettings(){
  state.settings.currency=document.getElementById("setCurrency").value;
  state.settings.decimals=num(document.getElementById("setDecimals").value);
  state.settings.energyPerBake=num(document.getElementById("setEnergy").value);
  state.settings.packagingPerLoaf=num(document.getElementById("setPack").value);
  state.settings.laborRate=num(document.getElementById("setRate").value);
  state.settings.laborHours=num(document.getElementById("setHours").value);
  persist(); renderTable(); renderCostDetail();
}
function renderCostDetail(){
  const id=document.getElementById("costPick").value; const el=document.getElementById("costDetail"); if(!el) return;
  const b=state.bakes.find(x=>x.id===id); if(!b){ el.innerHTML='<p class="muted">No bakes.</p>'; return; }
  const c=cost(b); const includeLabor=document.getElementById("costIncludeLabor").checked;
  let ing=c.ing, tot=ing+c.energy+c.pack; if(includeLabor) tot+=c.labor;
  let html='<div class="wrap-scroll"><table><thead><tr><th>Ingredient</th><th>grams</th><th>'+cur().trim()+'</th></tr></thead><tbody>';
  c.lines.forEach(l=>{ html+='<tr><td>'+esc(l.label)+'</td><td class="num">'+l.g+'</td><td class="num">'+money(l.c)+'</td></tr>'; });
  html+='</tbody><tfoot>'+
    '<tr><td><b>Ingredients</b></td><td></td><td class="num">'+money(ing)+'</td></tr>'+
    '<tr><td>Energy</td><td></td><td class="num">'+money(c.energy)+'</td></tr>'+
    '<tr><td>Packaging</td><td></td><td class="num">'+money(c.pack)+'</td></tr>'+
    (includeLabor?'<tr><td>Labour</td><td></td><td class="num">'+money(c.labor)+'</td></tr>':'')+
    '<tr><td><b>Batch total ('+c.makes+' loaf'+(c.makes>1?'es':'')+')</b></td><td></td><td class="num"><b>'+money(tot)+'</b></td></tr>'+
    '<tr><td><b>Per loaf</b></td><td></td><td class="num"><b>'+money(tot/c.makes)+'</b></td></tr>'+
  '</tfoot></table></div>';
  if(c.batchN>1) html+='<p class="help">Batch of '+c.batchN+' loaves — energy &amp; labour charged once and split (÷'+c.batchN+').</p>';
  if(b.sellPrice){ const sp=num(b.sellPrice); const marg=(sp-tot/c.makes); html+='<p class="help">Sell '+money(sp)+' → profit '+money(marg)+'/loaf ('+(sp? (marg/sp*100).toFixed(0):0)+'% margin).</p>'; }
  el.innerHTML=html;
}

/* ---------- troubleshoot ---------- */
const TROUBLE=[
  {title:"Dense / flat loaf",tags:"dense flat heavy under-proofed gluten",causes:["Under-fermented (not enough gas)","Over-fermented (gluten broke down)","Low-protein flour / weak gluten","Too little water (stiff dough)"],fixes:["Proof until domed & springy; watch the clock at warm temps","Use bread/strong flour, or add folds","Increase hydration slightly","Retard overnight in the fridge for control"]},
  {title:"Tunnels / big holes near the top",tags:"tunnel holes top airy",causes:["Over-proofed","Weak shaping / air trapped under the skin","Under-degassed before shaping"],fixes:["Shorten final proof","Shape with even tension, degas gently","Knock back lightly before final shape"]},
  {title:"Gummy / doughy crumb",tags:"gummy doughy wet underbaked",causes:["Under-baked (starch not set)","Cut too early","Too much water / too much whole grain"],fixes:["Bake to internal 93–96 °C","Cool fully (1 h+) before slicing","Reduce hydration or soak the whole grains"]},
  {title:"Too sour",tags:"sour tangy acetic",causes:["Long, cold fermentation","High acid build-up (hungry starter)","High whole-grain / high ash"],fixes:["Shorten cold retard","Feed the starter more often / fresher","Slightly warmer, shorter bulk"]},
  {title:"Not sour enough",tags:"bland flat flavour mild",causes:["Fast warm bulk","Young starter used before peak","Low whole-grain"],fixes:["Longer cold retard (12–16 h)","Add whole grain / rye","Use a slightly under-peaked starter"]},
  {title:"Weak / no rise (no oven spring)",tags:"rise spring weak dead flat",causes:["Inactive starter or dead yeast","Over-proofed","Gluten under-developed"],fixes:["Ensure levain doubles before mixing","Shorten proof; fridge retard","Add folds / autolyse"]},
  {title:"Pale crust",tags:"pale blonde underbaked crust",causes:["Oven too cool","Baked too briefly","No steam"],fixes:["Bake hotter (210–230 °C)","Bake longer / to internal temp","Add steam (tray of hot water)"]},
  {title:"Uneven browning",tags:"uneven browning hot spots",causes:["Oven hot spots / off-centre rack","No rotation"],fixes:["Rotate the loaf halfway","Use an oven stone / Dutch oven","Centre the rack"]},
  {title:"Seeds falling off / uneven",tags:"seeds coarse falling surface",causes:["Whole coarse seeds added whole","Added too late / not laminated"],fixes:["Crack/chop and soak seeds","Laminate: scatter + fold in layers","Wet the surface so seeds stick"]},
  {title:"Dough too sticky / hard to handle",tags:"sticky wet hard handle",causes:["High hydration","Under-developed gluten","Warm kitchen"],fixes:["Wet hands (don't flour) for folds","Add folds / chill the dough","Lower hydration a touch"]},
  {title:"Tearing at the seam / top",tags:"tear seam split crack",causes:["Too much elasticity (over-developed)","Under-proofed","Not scored"],fixes:["Gentler handling, longer rest","Proof longer","Score deliberately before baking"]},
  {title:"Crumb too tight / closed",tags:"tight closed dense crumb",causes:["Low hydration","Hard shaping / degassed","Whole grain absorbing water"],fixes:["Raise hydration 5–10%","Gentler shaping","Increase water for whole-grain flours"]},
  {title:"Blown-out / cracked crust (no bloom)",tags:"crack blowout bloom score",causes:["Not scored","Skin formed during proof","Weak steam"],fixes:["Score confidently just before baking","Cover dough during proof","Add steam early"]},
  {title:"Mold / off smell in starter",tags:"mold starter smell hooch",causes:["Neglect, or contamination","Long fridge storage"],fixes:["Mold (green/pink/orange) → discard & start fresh","Grey/brown liquid (hooch) is normal — pour off & feed","Feed 2–3× before baking"]}
];
function renderTroubleshoot(){
  const q=(document.getElementById("tsSearch")?.value||"").toLowerCase();
  const arr=TROUBLE.filter(t=>!q || (t.title+" "+t.tags+" "+t.causes.join(" ")+" "+t.fixes.join(" ")).toLowerCase().includes(q));
  document.getElementById("tsList").innerHTML=arr.map(t=>'<div class="card pad"><div style="font-weight:700">'+esc(t.title)+'</div>'+
    '<div class="section-title" style="margin-top:12px">Likely causes</div><ul style="margin:4px 0 0 18px">'+t.causes.map(c=>'<li>'+esc(c)+'</li>').join("")+'</ul>'+
    '<div class="section-title">Fixes</div><ul style="margin:4px 0 0 18px">'+t.fixes.map(c=>'<li>'+esc(c)+'</li>').join("")+'</ul></div>').join("") || '<p class="muted">No matches.</p>';
}

/* ---------- guide ---------- */
function renderGuide(){
  const bs=state.bakes.slice().sort((a,b)=>num(a.number)-num(b.number));
  const chart=document.getElementById("guideChart");
  const table=document.getElementById("guideTable");
  if(!chart||!table) return;
  if(!bs.length){ chart.innerHTML='<p class="muted">No bakes yet.</p>'; table.innerHTML=''; return; }
  chart.innerHTML=barChart(bs.map(b=>({label:"#"+b.number, value:metrics(b).hydration, sub:metrics(b).hydration.toFixed(0)+"%"})),{dp:0,int:true});
  let html='<div class="wrap-scroll"><table><thead><tr><th>#</th><th>Bake</th><th>Hydration</th><th>Whole grain</th><th>Seeds</th><th>Rating</th><th>Verdict</th></tr></thead><tbody>';
  bs.forEach(b=>{ const m=metrics(b);
    html+='<tr onclick="openDetail(\''+b.id+'\')" style="cursor:pointer"><td class="num">'+b.number+'</td><td>'+esc(b.title||"")+'</td><td class="num">'+m.hydration.toFixed(0)+'%</td><td class="num">'+m.wholePct.toFixed(0)+'%</td><td class="num">'+totalSeedWeight(b.recipe).toFixed(0)+' g</td><td>'+stars(ratingValue(b))+'</td><td class="muted">'+esc(b.verdict||"")+'</td></tr>';
  });
  html+='</tbody></table></div>';
  table.innerHTML=html;
}

/* ---------- checklists ---------- */
const CL_TEMPLATES = {
  starter: {
    icon:"🫙", title:"Starter maintenance (weekly)", sub:"Keep the keeper strong with minimum fuss.",
    tasks:[
      "Take the jar out of the fridge",
      "Pour off all but ~20–30 g of starter",
      "Feed 1:1:1 (equal flour + water, by weight)",
      "Stir well; scrape down the sides",
      "Leave ~2 h at room temp until bubbly",
      "Back into the fridge",
      "Write the date on the jar"
    ]
  },
  bakeprep: {
    icon:"🥖", title:"Bake-day prep", sub:"Set yourself up before mixing.",
    tasks:[
      "Check starter is active (doubles in 6–8 h); feed if needed",
      "Weigh out the flours",
      "Soak chia / prep seeds (if using)",
      "Oil or line the loaf tin",
      "Clear counter space; get bowl, dough scraper, towels out",
      "Set a small bowl of water for wet-hand folds",
      "Preheat oven ~30 min before baking (if same day)"
    ]
  },
  order: {
    icon:"🛒", title:"Order / shop list", sub:"Restock before a bake.",
    tasks:[
      "Bread flour",
      "Wholemeal flour",
      "Instant yeast (for hybrids/gifts)",
      "Salt",
      "Olive oil",
      "Honey",
      "Seeds — flax, pumpkin, chia, sunflower",
      "Loaf bags / parchment",
      "Instant-read thermometer"
    ]
  }
};

function clKey(store){ return "breadDiary.ticks."+store; }
function getTicks(store){ try{ return JSON.parse(localStorage.getItem(clKey(store))||"{}"); }catch(e){ return {}; } }
function setTick(store,id,val){ const t=getTicks(store); if(val) t[id]=1; else delete t[id]; try{ localStorage.setItem(clKey(store),JSON.stringify(t)); }catch(e){} }

function clTaskHTML(store,id,label,sub,time,checked){
  return '<label class="cl-task" style="display:flex;gap:12px;align-items:flex-start;padding:8px 4px;border-bottom:1px solid var(--line);cursor:pointer">'+
    '<input class="cl-box" type="checkbox" data-store="'+esc(store)+'" data-id="'+esc(id)+'" '+(checked?"checked":"")+' style="margin-top:3px;width:18px;height:18px;accent-color:var(--accent);flex:none">'+
    '<span style="flex:1">'+(time?'<b style="color:var(--accent);font-size:12px;margin-right:6px">'+esc(time)+'</b>':'')+'<b style="display:block">'+esc(label)+'</b>'+(sub?'<small class="muted">'+esc(sub)+'</small>':'')+'</span></label>';
}
function clCard(store,title,sub,tasks){
  const ticks=getTicks(store);
  let n=0; tasks.forEach(t=>{ if(ticks[t.id]) n++; });
  const total=tasks.length, p=total?Math.round(n/total*100):0;
  return '<div class="card pad" id="clcard-'+esc(store)+'" style="margin-bottom:16px">'+
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">'+
      '<div><div style="font-weight:700;font-size:17px">'+esc(title)+'</div>'+(sub?'<div class="muted" style="font-size:13px">'+esc(sub)+'</div>':'')+'</div>'+
      '<div style="display:flex;gap:8px;align-items:center">'+
        '<div style="width:130px;height:9px;background:var(--line);border-radius:6px;overflow:hidden"><i class="cl-fill" style="display:block;height:100%;background:var(--good);width:'+p+'%;transition:.25s"></i></div>'+
        '<span class="muted cl-pct">'+n+'/'+total+'</span>'+
        '<button class="tiny noprint" onclick="resetStore(\''+esc(store)+'\')">Reset</button>'+
      '</div>'+
    '</div>'+
    '<div style="margin-top:8px">'+tasks.map(t=>clTaskHTML(store,t.id,t.t,t.sub,t.time,ticks[t.id])).join("")+'</div></div>';
}
function refreshClCard(store){
  const card=document.getElementById("clcard-"+store); if(!card) return;
  const boxes=[...card.querySelectorAll(".cl-box")];
  const total=boxes.length, n=boxes.filter(b=>b.checked).length, p=total?Math.round(n/total*100):0;
  const pctEl=card.querySelector(".cl-pct"); if(pctEl) pctEl.textContent=n+"/"+total;
  const fill=card.querySelector(".cl-fill"); if(fill) fill.style.width=p+"%";
}
function resetStore(store){
  if(!confirm("Clear ticks for this checklist?")) return;
  try{ localStorage.removeItem(clKey(store)); }catch(e){}
  if(store.indexOf("bake.")===0) openChecklist(store.slice(5)); else renderChecklists();
}
function renderChecklists(){
  const el=document.getElementById("checklistTemplates"); if(!el) return;
  el.innerHTML=Object.keys(CL_TEMPLATES).map(k=>{
    const t=CL_TEMPLATES[k];
    const tasks=t.tasks.map((txt,i)=>({id:"t"+i, t:txt, sub:"", time:""}));
    return clCard(k, t.icon+" "+t.title, t.sub, tasks);
  }).join("");
}
function bakeChecklistTasks(b){
  const p=b.process||{}; const tasks=[];
  const add=(label,sub)=>tasks.push({id:"c"+tasks.length, t:label, sub:sub||"", time:""});
  if(p.levainBuild) add("Build the levain", p.levainBuild);
  if(p.mixing) add("Mix + autolyse", p.mixing);
  if(p.folds) add("Folds", p.folds);
  if(p.bulk) add("Bulk ferment", p.bulk);
  if(p.retard && p.retard!=="—") add("Cold retard", p.retard);
  if(p.shaping) add("Shape", p.shaping);
  if(p.proof) add("Final proof", p.proof);
  add("Preheat oven", "~30 min before baking");
  const isTray=/focaccia|tray/i.test((b.title||"")+" "+(b.tags||""));
  if(isTray) add("Dimple & top", "Press dimples with oiled fingers; drizzle olive oil + toppings");
  else add("Score the top", "One confident centre slash with a sharp blade");
  if(p.bake) add("Bake", p.bake);
  if(p.cooling) add("Cool fully", p.cooling);
  if(/order|slice/i.test(b.tags||"")) add("Slice & bag", "Slice once fully cool, then bag");
  else add("Slice & enjoy", "Once fully cool");
  return tasks;
}
function openChecklist(id){
  const b=state.bakes.find(x=>x.id===id); if(!b) return;
  currentId=id; const store="bake."+id;
  document.getElementById("clTitle").textContent="✅ "+b.title;
  document.getElementById("clSub").innerHTML="#"+b.number+" · "+esc(b.date||"")+" · "+esc(b.leavening||"");
  const r=b.recipe||{};
  const ing=RECIPE_FIELDS.map(([k,l])=>{const v=num(r[k]); return v?'<span class="badge">'+esc(l)+" "+v+"g</span>":'';}).join(" ");
  let body='<div class="section-title">Recipe</div><div class="metric-chips">'+ing+'</div>';
  body+='<div class="section-title">Steps</div>';
  body+=clCard(store, "Steps", "Tick as you go", bakeChecklistTasks(b));
  document.getElementById("clBody").innerHTML=body;
  document.getElementById("checklistOverlay").classList.add("open");
}
function closeChecklist(){ document.getElementById("checklistOverlay").classList.remove("open"); }
function resetBakeChecklist(){ resetStore("bake."+currentId); }
function printChecklist(){ window.print(); }

document.addEventListener("change", e=>{
  if(e.target && e.target.classList && e.target.classList.contains("cl-box")){
    setTick(e.target.dataset.store, e.target.dataset.id, e.target.checked);
    refreshClCard(e.target.dataset.store);
  }
});

/* ---------- print ---------- */
function printRecipe(){
  const b=state.bakes.find(x=>x.id===currentId)||state.bakes[0]; if(!b) return;
  const m=metrics(b), c=cost(b);
  const levain=num((b.recipe||{}).levain);
  let ing=RECIPE_FIELDS.map(([k,l])=>{ const v=num((b.recipe||{})[k]); return v? '<tr><td>'+l+'</td><td style="text-align:right">'+v+' g</td><td style="text-align:right">'+(m.totalFlour? (v/m.totalFlour*100).toFixed(1):"0")+'%</td></tr>':''; }).join("");
  let proc=PROCESS_FIELDS.map(([k,l])=>{ const v=(b.process||{})[k]; return v? '<p style="margin:6px 0"><b>'+l+':</b> '+esc(v)+'</p>':''; }).join("");
  let html='<h2>'+(b.title||"Recipe")+'</h2><div style="color:#666">#'+b.number+' · '+esc(b.date||"")+' · '+esc(b.leavening||"")+' · '+esc(b.status||"")+'</div>'+
    '<p style="color:#666">Hydration '+m.hydration.toFixed(0)+'% · Total flour '+m.totalFlour.toFixed(0)+' g · Dough '+m.doughWeight.toFixed(0)+' g · Cost/loaf '+money(c.perLoaf)+'</p>'+
    '<h3 style="margin-top:18px">Ingredients</h3><table style="width:100%;border-collapse:collapse">'+ing+'</table>'+
    '<h3 style="margin-top:18px">Method</h3>'+proc+
    '<h3 style="margin-top:18px">Notes</h3><p>'+esc(b.notes||"")+'</p>'+(b.verdict?'<p><b>Verdict:</b> '+esc(b.verdict)+'</p>':'');
  document.getElementById("printBody").innerHTML=html;
  document.getElementById("printOverlay").classList.add("open");
}
function closePrint(){ document.getElementById("printOverlay").classList.remove("open"); }

/* ---------- export / import ---------- */
function download(name,text,mime){
  const blob=new Blob([text],{type:mime||"text/plain"}); const a=document.createElement("a");
  a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000);
}
function exportJSON(){ download("bread-diary.json",JSON.stringify(state,null,2),"application/json"); toast("Exported JSON"); }
function exportDataJs(){ download("data.js","window.BAKES = "+JSON.stringify(state.bakes,null,2)+";\n","text/javascript"); toast("Exported data.js — replace your file"); }
function exportCSV(){
  const cols=["number","date","title","leavening","status","rating","breadFlour","wholemealFlour","water","salt","yeast","levain","oil","honey","chia","flax","pumpkinSeed","sunflowerSeed","otherSeeds","makes","sellPrice","notes","verdict","improvements"];
  const rows=[cols.join(",")];
  state.bakes.forEach(b=>{ const r=b.recipe||{}; rows.push(cols.map(c=>{
    let v=(r[c]!=null?r[c]:b[c]); if(v==null) v=""; v=String(v).replace(/"/g,'""'); return '"'+v+'"';
  }).join(",")); });
  download("bread-diary.csv",rows.join("\n"),"text/csv"); toast("Exported CSV");
}
function copyClipboard(){ navigator.clipboard.writeText(JSON.stringify(state,null,2)).then(()=>toast("Copied to clipboard"),()=>toast("Copy failed")); }
function importFile(e){
  const f=e.target.files[0]; if(!f) return; const reader=new FileReader();
  reader.onload=ev=>{ const txt=ev.target.result;
    try{ const m=txt.match(/\[[\s\S]*\]/); const data=JSON.parse(m?m[0]:txt);
      if(!confirm("Import? This REPLACES the current diary.")) return;
      if(Array.isArray(data)) state.bakes=data;
      else { state=Object.assign(seedState(),data); }
      selected.clear(); persist(); renderTable(); toast("Imported");
    }catch(err){ toast("⚠ Could not parse file"); } };
  reader.readAsText(f); e.target.value="";
}
function reloadFromFile(){ if(!confirm("Discard browser edits and reload from the data files?")) return; try{ localStorage.removeItem(KEY); }catch(e){} location.reload(); }

/* ---------- boot ---------- */
load();
if(READONLY) document.body.classList.add("readonly");
document.getElementById("updated").textContent=new Date().toLocaleDateString();
try{ if(localStorage.getItem("breadDiary.dark")==="1"){ document.body.classList.add("dark"); document.getElementById("darkBtn").textContent="☀️"; } }catch(e){}
renderTable();
renderTroubleshoot();
if(location.hash){ const t=location.hash.slice(1); if(document.getElementById("view-"+t)) showTab(t); }
if("serviceWorker" in navigator){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }

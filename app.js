const KEY = "metaflow-demo-history-v1";
const $ = (selector) => document.querySelector(selector);
const scenarios = {
  success: {label:"Normal completion", result:"Completed", status:"success", icon:"✓"},
  otp: {label:"OTP step needs review", result:"Needs review", status:"review", icon:"!"},
  verification: {label:"Human verification required", result:"Needs review", status:"review", icon:"!"},
  timeout: {label:"Timed out", result:"Timed out", status:"failed", icon:"×"}
};
function loadRuns(){try{const value=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(value)?value:[]}catch{return []}}
let runs=loadRuns();
function save(){try{localStorage.setItem(KEY,JSON.stringify(runs))}catch{$("#run-status").textContent="Browser storage is unavailable; this run won't persist."}}
function safe(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function time(value){return new Date(value).toLocaleString()}
function render(){
 $("#total-count").textContent=runs.length;
 $("#success-count").textContent=runs.filter(r=>r.status==="success").length;
 $("#review-count").textContent=runs.filter(r=>r.status==="review").length;
 const recent=runs.slice(0,4);
 $("#recent-list").innerHTML=recent.length?recent.map(r=>`<div class="recent-item"><div class="result-icon ${r.status}">${scenarios[r.scenario].icon}</div><div class="recent-copy"><b>${safe(r.name)}</b><small>${safe(scenarios[r.scenario].label)} · ${time(r.createdAt)}</small></div><span class="result-text ${r.status}">${safe(r.result)}</span></div>`).join(""):'<div class="empty">No runs yet. Start a simulation to see activity here.</div>';
 $("#history-body").innerHTML=runs.length?runs.map(r=>`<tr><td>${safe(r.name)}</td><td>${safe(scenarios[r.scenario].label)}</td><td><span class="status ${r.status}">${safe(r.result)}</span></td><td>${time(r.createdAt)}</td></tr>`).join(""):'<tr><td colspan="4" class="empty">No saved runs.</td></tr>';
}
function showView(name){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("hidden",v.id!==name));document.querySelectorAll(".nav").forEach(b=>b.classList.toggle("active",b.dataset.view===name));$("#page-title").textContent=name==="overview"?"Overview":name==="history"?"Run history":"Settings"}
document.querySelectorAll(".nav").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
$("#view-all").addEventListener("click",()=>showView("history"));
$("#run-form").addEventListener("submit",event=>{
 event.preventDefault();const button=$("#run-button");button.disabled=true;$("#run-status").textContent="Running local simulation…";
 const scenario=$("#scenario").value;const run={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:$("#case-name").value.trim()||"Untitled test",scenario,result:scenarios[scenario].result,status:scenarios[scenario].status,createdAt:new Date().toISOString()};
 // The simulation intentionally uses a fixed local result; it never opens a third-party site.
 setTimeout(()=>{runs.unshift(run);runs=runs.slice(0,200);save();render();button.disabled=false;$("#run-status").textContent="Simulation saved locally: "+run.result+".";},450);
});
$("#clear-btn").addEventListener("click",()=>{if(!runs.length)return;if(confirm("Delete all locally saved demo history?")){runs=[];save();render()}});
$("#export-btn").addEventListener("click",()=>{const rows=[["Test label","Scenario","Result","Timestamp"],...runs.map(r=>[r.name,scenarios[r.scenario].label,r.result,r.createdAt])];const csv=rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n");const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download="metaflow-demo-history.csv";a.click();URL.revokeObjectURL(url)});
render();
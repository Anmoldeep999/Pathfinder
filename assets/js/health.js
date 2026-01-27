import { setActiveNav, nowTime, statusBadge } from "./app.js";
import { getBeacons, getOutageLog, addOutageLog, setBeaconStatus } from "./api.js";

setActiveNav();

const lastRefreshEl = document.getElementById("lastRefresh");
const beaconListEl = document.getElementById("beaconList");
const logBody = document.getElementById("logBody");

function renderBeaconCard(b){
  const iconClass = b.online ? "online" : "offline";
  const badge = statusBadge(b.online);

  return `
    <div class="card" style="grid-column: span 4;">
      <h3 style="display:flex;align-items:center;gap:8px;">
        <span class="status-dot ${iconClass}"></span>${b.name}
      </h3>
      <div class="muted">IP: ${b.ip}</div>
      <div style="margin-top:10px;">${badge}</div>
      <div class="small" style="margin-top:10px;">Last seen: ${b.lastSeen}</div>
    </div>
  `;
}

async function renderLog(){
  try {
    const log = await getOutageLog();
    logBody.innerHTML = log.length
      ? log.map(e => `<tr><td>${e.time}</td><td>${e.beacon}</td><td>${e.event}</td></tr>`).join("")
      : `<tr><td colspan="3" class="small" style="color:#b6c2e2;">No outages yet</td></tr>`;
  } catch (err) {
    logBody.innerHTML = `<tr><td colspan="3" class="small" style="color:var(--bad);">Error: ${err.message}</td></tr>`;
  }
}

async function refresh(){
  try {
    const beacons = await getBeacons();
    beaconListEl.innerHTML = beacons.length
      ? beacons.map(renderBeaconCard).join("")
      : `<div class="card" style="grid-column: span 12;"><div class="small" style="color:#b6c2e2;">No beacons registered yet</div></div>`;
    lastRefreshEl.textContent = nowTime();
    await renderLog();
  } catch (err) {
    beaconListEl.innerHTML = `<div class="card" style="grid-column: span 12;"><div class="small" style="color:var(--bad);">Error: ${err.message}</div></div>`;
  }
}

// Simulate a beacon going offline/online (toggle status)
async function simulate(){
  try {
    const beacons = await getBeacons();
    if (beacons.length === 0) {
      alert("No beacons to simulate. Add beacons first.");
      return;
    }
    
    const pick = beacons[Math.floor(Math.random()*beacons.length)];
    const newStatus = !pick.online;

    await setBeaconStatus(pick.id, newStatus);
    await refresh();
  } catch (err) {
    alert("Error simulating outage: " + err.message);
  }
}

document.getElementById("btnRefresh")?.addEventListener("click", refresh);

const btnSimulate = document.getElementById("btnSimulate");
if (btnSimulate) btnSimulate.addEventListener("click", simulate);

// Auto refresh every 60s
refresh();
setInterval(refresh, 60000);

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
  const log = await getOutageLog();
  logBody.innerHTML = log.length
    ? log.map(e => `<tr><td>${e.time}</td><td>${e.beacon}</td><td>${e.event}</td></tr>`).join("")
    : `<tr><td colspan="3" class="small" style="color:#b6c2e2;">No outages yet</td></tr>`;
}

async function refresh(){
  const beacons = await getBeacons();
  beaconListEl.innerHTML = beacons.map(renderBeaconCard).join("");
  lastRefreshEl.textContent = nowTime();
  await renderLog();
}

// Simuleer dat 1 beacon offline gaat (of terug online)
async function simulate(){
  const beacons = await getBeacons();
  const pick = beacons[Math.floor(Math.random()*beacons.length)];
  const newStatus = !pick.online;

  const result = await setBeaconStatus(pick.id, newStatus);
  if (!result) return;

  // log alleen wanneer status verandert
  if (result.prev !== result.current){
    await addOutageLog({
      time: nowTime(),
      beacon: result.beacon.name,
      event: result.current ? "ONLINE" : "OFFLINE"
    });
  }
  await refresh();
}

document.getElementById("btnRefresh").addEventListener("click", refresh);
document.getElementById("btnSimulate").addEventListener("click", simulate);

// Auto refresh elke 60s
refresh();
setInterval(refresh, 60000);

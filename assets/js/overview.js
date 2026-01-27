import { setActiveNav, nowTime, statusBadge } from "./app.js";
import { getBeacons, getPois, getNodes } from "./api.js";

setActiveNav();

const lastRefreshEl = document.getElementById("lastRefresh");
const kpiOnline = document.getElementById("kpiOnline");
const kpiOffline = document.getElementById("kpiOffline");
const kpiPois = document.getElementById("kpiPois");
const kpiNodes = document.getElementById("kpiNodes");
const offlineNames = document.getElementById("offlineNames");
const unknownAlert = document.getElementById("unknownAlert");
const beaconRow = document.getElementById("beaconRow");

function beaconMiniCard(b){
  const badge = statusBadge(b.status);
  const dotClass = b.status || (b.online ? "online" : "offline");
  return `
    <div class="card" style="grid-column: span 4;">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div>
          <div style="font-weight:800;display:flex;align-items:center;gap:8px;">
            <span class="status-dot ${dotClass}"></span>${b.name}
          </div>
          <div class="small">IP: ${b.ip}</div>
        </div>
        <div>${badge}</div>
      </div>
    </div>
  `;
}

async function refresh(){
  try {
    const [beacons, pois, nodes] = await Promise.all([getBeacons(), getPois(), getNodes()]);
    const online = beacons.filter(b => b.status === "online");
    const offline = beacons.filter(b => b.status === "offline");
    const unknown = beacons.filter(b => b.status === "unknown");
    const totalBeacons = beacons.length || 0;

    // Show ?/total if any beacons are unknown, otherwise show online count
    kpiOnline.textContent = unknown.length > 0 ? `?/${totalBeacons}` : `${online.length}/${totalBeacons}`;
    kpiOffline.textContent = `${offline.length}`;
    offlineNames.textContent = offline.length ? offline.map(b=>b.name).join(", ") : "None 🎉";
    kpiPois.textContent = `${pois.length}`;
    kpiNodes.textContent = `${nodes.length}`;

    // Show/hide unknown alert
    unknownAlert.style.display = unknown.length > 0 ? "block" : "none";

    beaconRow.innerHTML = beacons.length 
      ? beacons.map(beaconMiniCard).join("")
      : `<div class="card" style="grid-column: span 12;"><div class="small" style="color:#b6c2e2;">No beacons registered yet</div></div>`;
    lastRefreshEl.textContent = nowTime();
  } catch (err) {
    beaconRow.innerHTML = `<div class="card" style="grid-column: span 12;"><div class="small" style="color:var(--bad);">Error: ${err.message}</div></div>`;
  }
}

document.getElementById("btnRefresh").addEventListener("click", refresh);

refresh();

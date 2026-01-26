import { setActiveNav, nowTime, statusBadge } from "./app.js";
import { getBeacons, getPois, getNodes } from "./api.js";

setActiveNav();

const lastRefreshEl = document.getElementById("lastRefresh");
const kpiOnline = document.getElementById("kpiOnline");
const kpiOffline = document.getElementById("kpiOffline");
const kpiPois = document.getElementById("kpiPois");
const kpiNodes = document.getElementById("kpiNodes");
const offlineNames = document.getElementById("offlineNames");
const beaconRow = document.getElementById("beaconRow");

function beaconMiniCard(b){
  const badge = statusBadge(b.online);
  const dotClass = b.online ? "online" : "offline";
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
  const [beacons, pois, nodes] = await Promise.all([getBeacons(), getPois(), getNodes()]);
  const onlineCount = beacons.filter(b => b.online).length;
  const offline = beacons.filter(b => !b.online);

  kpiOnline.textContent = `${onlineCount}/3`;
  kpiOffline.textContent = `${offline.length}`;
  offlineNames.textContent = offline.length ? offline.map(b=>b.name).join(", ") : "None 🎉";
  kpiPois.textContent = `${pois.length}`;
  kpiNodes.textContent = `${nodes.length}`;

  beaconRow.innerHTML = beacons.map(beaconMiniCard).join("");
  lastRefreshEl.textContent = nowTime();
}

document.getElementById("btnRefresh").addEventListener("click", refresh);

refresh();

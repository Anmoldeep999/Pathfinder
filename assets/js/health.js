import { setActiveNav, nowTime, statusBadge } from "./app.js";
import { getBeacons, getOutageLog, addOutageLog, setBeaconStatus } from "./api.js";

setActiveNav();

const lastRefreshEl = document.getElementById("lastRefresh");
const beaconListEl = document.getElementById("beaconList");
const logBody = document.getElementById("logBody");
const a11yAnnouncer = document.getElementById("a11yAnnouncer");

// Announce to screen readers
function announce(message) {
  if (a11yAnnouncer) {
    a11yAnnouncer.textContent = message;
    setTimeout(() => { a11yAnnouncer.textContent = ""; }, 1000);
  }
}

// Sort beacons by their number (e.g., "Beacon 01" -> 1, "Beacon 02" -> 2)
function sortBeaconsByNumber(beacons) {
  return [...beacons].sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
    const numB = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
    return numA - numB;
  });
}

function renderBeaconCard(b){
  const iconClass = b.status || (b.online ? "online" : "offline");
  const badge = statusBadge(b.status);
  const statusText = b.status || (b.online ? "online" : "offline");

  return `
    <div class="card" style="grid-column: span 4;" role="listitem" aria-label="${b.name} beacon">
      <h3 style="display:flex;align-items:center;gap:8px;">
        <span class="status-dot ${iconClass}" aria-hidden="true"></span>${b.name}
      </h3>
      <div class="muted">IP: ${b.ip}</div>
      <div style="margin-top:10px;">${badge}</div>
      <div class="small" style="margin-top:10px;">Last seen: <time>${b.lastSeen}</time></div>
    </div>
  `;
}

async function renderLog(){
  try {
    const log = await getOutageLog();
    logBody.innerHTML = log.length
      ? log.map(e => `<tr><td><time>${e.time}</time></td><td>${e.beacon}</td><td>${e.event}</td></tr>`).join("")
      : `<tr><td colspan="3" class="small" style="color:#b6c2e2;">No outages yet</td></tr>`;
  } catch (err) {
    logBody.innerHTML = `<tr><td colspan="3" class="small" style="color:var(--bad);">Error: ${err.message}</td></tr>`;
  }
}

async function refresh(){
  try {
    const beaconsRaw = await getBeacons();
    const beacons = sortBeaconsByNumber(beaconsRaw);
    const online = beacons.filter(b => b.status === "online" || b.online).length;
    const offline = beacons.filter(b => b.status === "offline" || !b.online).length;
    
    beaconListEl.innerHTML = beacons.length
      ? beacons.map(renderBeaconCard).join("")
      : `<div class="card" style="grid-column: span 12;" role="listitem"><div class="small" style="color:#b6c2e2;">No beacons registered yet</div></div>`;
    lastRefreshEl.textContent = nowTime();
    await renderLog();
    
    // Announce to screen readers
    announce(`Healthcheck refreshed. ${beacons.length} beacons total, ${online} online, ${offline} offline.`);
  } catch (err) {
    beaconListEl.innerHTML = `<div class="card" style="grid-column: span 12;" role="listitem"><div class="small" style="color:var(--bad);">Error: ${err.message}</div></div>`;
    announce(`Error loading healthcheck: ${err.message}`);
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
    announce(`Simulated ${pick.name} going ${newStatus ? 'online' : 'offline'}`);
  } catch (err) {
    alert("Error simulating outage: " + err.message);
  }
}

document.getElementById("btnRefresh")?.addEventListener("click", () => {
  announce("Refreshing healthcheck data...");
  refresh();
});

const btnSimulate = document.getElementById("btnSimulate");
if (btnSimulate) btnSimulate.addEventListener("click", simulate);

// Auto refresh every 60s
refresh();
setInterval(refresh, 60000);

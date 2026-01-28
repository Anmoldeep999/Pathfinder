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
const a11yAnnouncer = document.getElementById("a11yAnnouncer");

// Track previous beacon states to detect changes
let previousBeaconStates = new Map();

// Announce to screen readers
function announce(message) {
  if (a11yAnnouncer) {
    a11yAnnouncer.textContent = message;
    // Clear after a delay to allow re-announcement of same message
    setTimeout(() => { a11yAnnouncer.textContent = ""; }, 1000);
  }
}

// Announce urgent messages (uses assertive for immediate announcement)
function announceUrgent(message) {
  if (a11yAnnouncer) {
    a11yAnnouncer.setAttribute("aria-live", "assertive");
    a11yAnnouncer.textContent = message;
    setTimeout(() => { 
      a11yAnnouncer.textContent = ""; 
      a11yAnnouncer.setAttribute("aria-live", "polite");
    }, 1000);
  }
}

// Detect beacon status changes and announce them
function detectAndAnnounceChanges(beacons) {
  const changes = [];
  
  beacons.forEach(beacon => {
    const currentStatus = beacon.status || (beacon.online ? "online" : "offline");
    const previousStatus = previousBeaconStates.get(beacon.id);
    
    if (previousStatus !== undefined && previousStatus !== currentStatus) {
      if (currentStatus === "offline") {
        changes.push(`Alert: ${beacon.name} has gone offline!`);
      } else if (currentStatus === "online" && previousStatus === "offline") {
        changes.push(`${beacon.name} is back online.`);
      }
    }
    
    // Update stored state
    previousBeaconStates.set(beacon.id, currentStatus);
  });
  
  return changes;
}

function beaconMiniCard(b){
  const badge = statusBadge(b.status);
  const dotClass = b.status || (b.online ? "online" : "offline");
  const statusText = b.status || (b.online ? "online" : "offline");
  return `
    <div class="card" style="grid-column: span 4;" role="listitem" aria-label="${b.name} beacon, status ${statusText}">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <div>
          <div style="font-weight:800;display:flex;align-items:center;gap:8px;">
            <span class="status-dot ${dotClass}" aria-hidden="true"></span>${b.name}
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
    const totalBeacons = beacons.length || 0;

    kpiOnline.textContent = `${online.length}/${totalBeacons}`;
    kpiOffline.textContent = `${offline.length}`;
    offlineNames.textContent = offline.length ? offline.map(b=>b.name).join(", ") : "None";
    kpiPois.textContent = `${pois.length}`;
    kpiNodes.textContent = `${nodes.length}`;

    beaconRow.innerHTML = beacons.length 
      ? beacons.map(beaconMiniCard).join("")
      : `<div class="card" style="grid-column: span 12;" role="listitem"><div class="small" style="color:#b6c2e2;">No beacons registered yet</div></div>`;
    lastRefreshEl.textContent = nowTime();
    
    // Detect and announce any beacon status changes
    const changes = detectAndAnnounceChanges(beacons);
    
    if (changes.length > 0) {
      // Urgent announcement for status changes (especially offline)
      const hasOffline = changes.some(c => c.includes("gone offline"));
      if (hasOffline) {
        announceUrgent(changes.join(" "));
      } else {
        announce(changes.join(" "));
      }
    }
  } catch (err) {
    beaconRow.innerHTML = `<div class="card" style="grid-column: span 12;" role="listitem"><div class="small" style="color:var(--bad);">Error: ${err.message}</div></div>`;
    announce(`Error loading data: ${err.message}`);
  }
}

document.getElementById("btnRefresh").addEventListener("click", () => {
  announce("Refreshing data...");
  refresh();
});

// Auto-refresh every 30 seconds to detect status changes
refresh();
setInterval(refresh, 30000);

import { setActiveNav, nowTime, statusBadge } from "./app.js";
import { getBeacons, getOutageLog, addOutageLog, setBeaconStatus, clearOutageLog } from "./api.js";

setActiveNav();

const lastRefreshEl = document.getElementById("lastRefresh");
const beaconListEl = document.getElementById("beaconList");
const logBody = document.getElementById("logBody");
const uptimeStatsEl = document.getElementById("uptimeStats");
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

// Calculate uptime stats from outage log
function calculateUptimeStats(outageLog, beacons) {
  const beaconStats = {};
  const now = new Date();
  
  // Initialize stats for all beacons
  beacons.forEach(b => {
    beaconStats[b.name] = {
      name: b.name,
      currentStatus: b.status || (b.online ? "online" : "offline"),
      totalOutages: 0,
      lastOutage: null,
      estimatedUptime: 100,
      longestOutage: 0,
      recentEvents: []
    };
  });
  
  // Process outage log (most recent first)
  const sortedLog = [...outageLog].sort((a, b) => new Date(b.time) - new Date(a.time));
  
  sortedLog.forEach(entry => {
    const beaconName = entry.beacon;
    if (!beaconStats[beaconName]) {
      beaconStats[beaconName] = {
        name: beaconName,
        currentStatus: "unknown",
        totalOutages: 0,
        lastOutage: null,
        estimatedUptime: 100,
        longestOutage: 0,
        recentEvents: []
      };
    }
    
    const stats = beaconStats[beaconName];
    stats.recentEvents.push(entry);
    
    // Count offline events
    if (entry.event.toLowerCase().includes("offline") || entry.event.toLowerCase().includes("down")) {
      stats.totalOutages++;
      if (!stats.lastOutage) {
        stats.lastOutage = entry.time;
      }
    }
  });
  
  // Calculate estimated uptime based on outage frequency
  // Using a simple heuristic: fewer outages = higher uptime
  Object.values(beaconStats).forEach(stats => {
    if (stats.totalOutages === 0) {
      stats.estimatedUptime = 100;
    } else if (stats.totalOutages <= 2) {
      stats.estimatedUptime = 99;
    } else if (stats.totalOutages <= 5) {
      stats.estimatedUptime = 95;
    } else if (stats.totalOutages <= 10) {
      stats.estimatedUptime = 90;
    } else {
      stats.estimatedUptime = Math.max(50, 100 - stats.totalOutages * 2);
    }
    
    // Reduce uptime if currently offline
    if (stats.currentStatus === "offline") {
      stats.estimatedUptime = Math.min(stats.estimatedUptime, 90);
    }
  });
  
  return beaconStats;
}

// Render uptime stats cards
function renderUptimeStats(beaconStats) {
  const statsArray = Object.values(beaconStats);
  
  if (statsArray.length === 0) {
    return `<div class="small" style="color:#b6c2e2;">No beacon data available</div>`;
  }
  
  // Calculate overall stats
  const totalBeacons = statsArray.length;
  const onlineCount = statsArray.filter(s => s.currentStatus === "online").length;
  const totalOutages = statsArray.reduce((sum, s) => sum + s.totalOutages, 0);
  const avgUptime = statsArray.reduce((sum, s) => sum + s.estimatedUptime, 0) / totalBeacons;
  
  // Overall summary card
  let html = `
    <div class="card" style="grid-column: span 3;" role="listitem">
      <h3 style="margin:0 0 8px 0;">Overall Health</h3>
      <div style="font-size:2rem;font-weight:700;color:var(--${avgUptime >= 95 ? 'good' : avgUptime >= 80 ? 'warn' : 'bad'});">${avgUptime.toFixed(1)}%</div>
      <div class="muted">Average Uptime</div>
    </div>
    <div class="card" style="grid-column: span 3;" role="listitem">
      <h3 style="margin:0 0 8px 0;">Current Status</h3>
      <div style="font-size:2rem;font-weight:700;color:var(--${onlineCount === totalBeacons ? 'good' : 'warn'});">${onlineCount}/${totalBeacons}</div>
      <div class="muted">Beacons Online</div>
    </div>
    <div class="card" style="grid-column: span 3;" role="listitem">
      <h3 style="margin:0 0 8px 0;">Total Incidents</h3>
      <div style="font-size:2rem;font-weight:700;color:var(--${totalOutages === 0 ? 'good' : totalOutages <= 5 ? 'warn' : 'bad'});">${totalOutages}</div>
      <div class="muted">Outages Recorded</div>
    </div>
    <div class="card" style="grid-column: span 3;" role="listitem">
      <h3 style="margin:0 0 8px 0;">Least Reliable</h3>
      <div style="font-size:1.1rem;font-weight:600;color:var(--bad);">${getLeastReliable(statsArray)}</div>
      <div class="muted">Most Outages</div>
    </div>
  `;
  
  // Per-beacon stats (only show if there are outages to report)
  if (totalOutages > 0) {
    html += `<div style="grid-column: span 12; margin-top: 10px;"><strong>Per-Beacon Statistics:</strong></div>`;
    statsArray.forEach(stats => {
      const uptimeColor = stats.estimatedUptime >= 95 ? 'good' : stats.estimatedUptime >= 80 ? 'warn' : 'bad';
      html += `
        <div class="card" style="grid-column: span 4;" role="listitem">
          <h4 style="margin:0 0 6px 0;display:flex;align-items:center;gap:6px;">
            <span class="status-dot ${stats.currentStatus}" aria-hidden="true"></span>
            ${stats.name}
          </h4>
          <div style="display:flex;justify-content:space-between;margin-top:8px;">
            <div>
              <div style="font-size:1.3rem;font-weight:600;color:var(--${uptimeColor});">${stats.estimatedUptime}%</div>
              <div class="small muted">Uptime</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.3rem;font-weight:600;">${stats.totalOutages}</div>
              <div class="small muted">Outages</div>
            </div>
          </div>
          ${stats.lastOutage ? `<div class="small" style="margin-top:6px;">Last outage: ${stats.lastOutage}</div>` : ''}
        </div>
      `;
    });
  }
  
  return html;
}

// Get least reliable beacon name (most outages)
function getLeastReliable(statsArray) {
  if (statsArray.length === 0) return "N/A";
  const sorted = [...statsArray].sort((a, b) => b.totalOutages - a.totalOutages);
  const worst = sorted[0];
  if (worst.totalOutages === 0) {
    return "All perfect (0 outages)";
  }
  return `${worst.name} (${worst.totalOutages} outages)`;
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
    
    // Calculate and render uptime stats
    try {
      const outageLog = await getOutageLog();
      const uptimeStats = calculateUptimeStats(outageLog, beacons);
      if (uptimeStatsEl) {
        uptimeStatsEl.innerHTML = renderUptimeStats(uptimeStats);
      }
    } catch (statsErr) {
      console.warn("Could not load uptime stats:", statsErr);
      if (uptimeStatsEl) {
        uptimeStatsEl.innerHTML = `<div class="small" style="color:#b6c2e2;">Uptime stats unavailable</div>`;
      }
    }
    
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

document.getElementById("btnResetStats")?.addEventListener("click", async () => {
  if (confirm("Are you sure you want to reset all uptime statistics? This will clear the outage log.")) {
    try {
      await clearOutageLog();
      announce("Uptime statistics reset to 100%");
      await refresh();
    } catch (err) {
      alert("Error resetting stats: " + err.message);
    }
  }
});

const btnSimulate = document.getElementById("btnSimulate");
if (btnSimulate) btnSimulate.addEventListener("click", simulate);

// Auto refresh every 60s
refresh();
setInterval(refresh, 60000);

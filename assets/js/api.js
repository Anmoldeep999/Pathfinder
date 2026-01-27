// assets/js/api.js
// Real API implementation connecting to FastAPI backend

const API_BASE = "https://api.tamashfiles.com";

function getToken() {
  return localStorage.getItem("pf_token");
}

async function authFetch(endpoint, options = {}) {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
    throw new Error("Not authenticated");
  }

  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("pf_token");
    window.location.href = "login.html";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  // Handle empty responses (204 No Content)
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return null;
  }

  return res.json();
}

// ============================================================
// BEACONS
// ============================================================

export async function getBeacons() {
  const beacons = await authFetch("/beacons/");
  // Map backend format to frontend format
  return beacons.map(b => {
    const lastHeartbeat = b.last_heartbeat ? new Date(b.last_heartbeat) : null;
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    
    // Determine status: 'unknown' if last seen > 1 minute ago
    let status;
    if (!lastHeartbeat || lastHeartbeat < oneMinuteAgo) {
      status = "unknown";
    } else {
      status = b.status === "ONLINE" ? "online" : "offline";
    }
    
    return {
      id: b.id,
      name: b.name,
      ip: b.ip || "N/A",
      online: status === "online",
      status: status,
      lastSeen: lastHeartbeat ? lastHeartbeat.toLocaleString() : "Never",
      x: b.x,
      y: b.y,
      role: b.role || "Beacon",
      location: b.location || ""
    };
  });
}

export async function setBeaconStatus(beaconId, online) {
  const result = await authFetch(`/beacons/${beaconId}/status?online=${online}`, {
    method: "PATCH"
  });
  
  return {
    prev: result.prev,
    current: result.current,
    beacon: {
      id: result.beacon.id,
      name: result.beacon.name,
      ip: result.beacon.ip || "N/A",
      online: result.beacon.status === "ONLINE",
      lastSeen: result.beacon.last_heartbeat ? new Date(result.beacon.last_heartbeat).toLocaleString() : "Never"
    }
  };
}

export async function createBeacon(beacon) {
  return await authFetch("/beacons/", {
    method: "POST",
    body: JSON.stringify(beacon)
  });
}

export async function updateBeacon(beaconId, data) {
  return await authFetch(`/beacons/${beaconId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function deleteBeacon(beaconId) {
  await authFetch(`/beacons/${beaconId}`, { method: "DELETE" });
  return true;
}

// ============================================================
// NODES (same as beacons but with role info)
// ============================================================

export async function getNodes() {
  const beacons = await authFetch("/beacons/");
  return beacons.map(b => ({
    id: b.id,
    name: b.name,
    role: b.role || "Beacon",
    ip: b.ip || "N/A",
    location: b.location || ""
  }));
}

// ============================================================
// POIS (Points of Interest)
// ============================================================

export async function getPois() {
  return await authFetch("/pois/");
}

export async function addPoi(poi) {
  return await authFetch("/pois/", {
    method: "POST",
    body: JSON.stringify(poi)
  });
}

export async function updatePoi(poiId, data) {
  return await authFetch(`/pois/${poiId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  });
}

export async function deletePoi(id) {
  await authFetch(`/pois/${id}`, { method: "DELETE" });
  return true;
}

// ============================================================
// OUTAGE LOG
// ============================================================

export async function getOutageLog() {
  const logs = await authFetch("/health/outage-log?limit=30");
  return logs.map(log => ({
    time: new Date(log.timestamp).toLocaleString(),
    beacon: log.beacon_name,
    event: log.event
  }));
}

export async function addOutageLog(entry) {
  // Outage logs are now automatically created by the backend
  // when beacon status changes. This function is kept for compatibility.
  console.log("Outage log entry (auto-logged by backend):", entry);
  return true;
}

export async function clearOutageLog() {
  await authFetch("/health/outage-log", { method: "DELETE" });
  return true;
}
import { state } from "./mock-data.js";

/**
 * Later vervang je deze functies door fetch naar PHP endpoints.
 * UI blijft identiek.
 */

export async function getBeacons() { return structuredClone(state.beacons); }
export async function getNodes() { return structuredClone(state.nodes); }
export async function getPois() { return structuredClone(state.pois); }

export async function addPoi(poi){
  const nextId = Math.max(...state.pois.map(p=>p.id), 0) + 1;
  const newPoi = { id: nextId, ...poi };
  state.pois.push(newPoi);
  return structuredClone(newPoi);
}

export async function deletePoi(id){
  state.pois = state.pois.filter(p => p.id !== id);
  return true;
}

export async function addOutageLog(entry){
  state.outageLog.unshift(entry);
  state.outageLog = state.outageLog.slice(0, 30);
  return true;
}

export async function getOutageLog(){
  return structuredClone(state.outageLog);
}

export async function setBeaconStatus(beaconId, online){
  const b = state.beacons.find(x => x.id === beaconId);
  if (!b) return null;
  const prev = b.online;
  b.online = online;
  b.lastSeen = online ? "just now" : b.lastSeen;

  return { prev, current: online, beacon: structuredClone(b) };
}

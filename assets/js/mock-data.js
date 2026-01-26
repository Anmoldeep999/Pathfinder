export const state = {
  beacons: [
    { id: "beacon-01", name: "Beacon 01", ip: "192.168.1.101", online: true, lastSeen: "just now" },
    { id: "beacon-02", name: "Beacon 02", ip: "192.168.1.102", online: true, lastSeen: "just now" },
    { id: "beacon-03", name: "Beacon 03", ip: "192.168.1.103", online: true, lastSeen: "just now" }
  ],
  nodes: [
    { id:"master-01", name:"Master Controller", role:"Master", ip:"192.168.1.10", location:"Server room" },
    { id:"beacon-01", name:"Beacon 01", role:"Beacon", ip:"192.168.1.101", location:"Hall A" },
    { id:"beacon-02", name:"Beacon 02", role:"Beacon", ip:"192.168.1.102", location:"Hall B" },
    { id:"beacon-03", name:"Beacon 03", role:"Beacon", ip:"192.168.1.103", location:"Entrance" }
  ],
  pois: [
    { id: 1, name:"Main Entrance", type:"Door", location:"Front" },
    { id: 2, name:"Lab 2.14", type:"Room", location:"2nd floor" },
    { id: 3, name:"Emergency Exit", type:"Door", location:"Back" },
  ],
  outageLog: []
};

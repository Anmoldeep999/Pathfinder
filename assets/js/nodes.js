import { setActiveNav, nowTime } from "./app.js";
import { getNodes } from "./api.js";

setActiveNav();

const lastRefreshEl = document.getElementById("lastRefresh");
const nodesBody = document.getElementById("nodesBody");
const a11yAnnouncer = document.getElementById("a11yAnnouncer");

// Announce to screen readers
function announce(message) {
  if (a11yAnnouncer) {
    a11yAnnouncer.textContent = message;
    setTimeout(() => { a11yAnnouncer.textContent = ""; }, 1000);
  }
}

function row(n){
  return `
    <tr>
      <td>${n.id}</td>
      <td>${n.name}</td>
      <td>${n.role}</td>
      <td>${n.ip}</td>
      <td>${n.location}</td>
    </tr>
  `;
}

async function render(){
  try {
    const nodes = await getNodes();
    nodesBody.innerHTML = nodes.length
      ? nodes.map(row).join("")
      : `<tr><td colspan="5" class="small" style="color:#b6c2e2;">No nodes found</td></tr>`;
    lastRefreshEl.textContent = nowTime();
    announce(`Nodes list loaded. ${nodes.length} nodes total.`);
  } catch (err) {
    nodesBody.innerHTML = `<tr><td colspan="5" class="small" style="color:var(--bad);">Error: ${err.message}</td></tr>`;
    announce(`Error loading nodes: ${err.message}`);
  }
}

document.getElementById("btnRefresh").addEventListener("click", () => {
  announce("Refreshing nodes list...");
  render();
});

render();

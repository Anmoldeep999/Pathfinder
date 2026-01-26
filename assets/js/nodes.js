import { setActiveNav, nowTime } from "./app.js";
import { getNodes } from "./api.js";

setActiveNav();

const lastRefreshEl = document.getElementById("lastRefresh");
const nodesBody = document.getElementById("nodesBody");

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
  } catch (err) {
    nodesBody.innerHTML = `<tr><td colspan="5" class="small" style="color:var(--bad);">Error: ${err.message}</td></tr>`;
  }
}

document.getElementById("btnRefresh").addEventListener("click", render);

render();

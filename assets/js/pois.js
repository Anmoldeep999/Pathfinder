import { setActiveNav, nowTime } from "./app.js";
import { getPois, addPoi, deletePoi } from "./api.js";

setActiveNav();

const lastRefreshEl = document.getElementById("lastRefresh");
const poiBody = document.getElementById("poiBody");
const a11yAnnouncer = document.getElementById("a11yAnnouncer");

// Announce to screen readers
function announce(message) {
  if (a11yAnnouncer) {
    a11yAnnouncer.textContent = message;
    setTimeout(() => { a11yAnnouncer.textContent = ""; }, 1000);
  }
}

function row(p){
  return `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.type}</td>
      <td>${p.location}</td>
      <td>
        <button class="btn danger" data-id="${p.id}" aria-label="Delete POI ${p.name}">Delete</button>
      </td>
    </tr>
  `;
}

async function render(){
  try {
    const pois = await getPois();
    poiBody.innerHTML = pois.length
      ? pois.map(row).join("")
      : `<tr><td colspan="5" class="small" style="color:#b6c2e2;">No POIs found</td></tr>`;

    lastRefreshEl.textContent = nowTime();
    announce(`POI list loaded. ${pois.length} Points of Interest.`);
  } catch (err) {
    poiBody.innerHTML = `<tr><td colspan="5" class="small" style="color:var(--bad);">Error: ${err.message}</td></tr>`;
    announce(`Error loading POIs: ${err.message}`);
  }
}

poiBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const ok = confirm(`Delete POI #${id}?`);
  if (!ok) return;

  await deletePoi(id);
  announce(`POI ${id} deleted successfully.`);
  await render();
});

document.getElementById("poiForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("poiName").value.trim();
  const type = document.getElementById("poiType").value.trim();
  const location = document.getElementById("poiLocation").value.trim();

  await addPoi({ name, type, location });
  announce(`POI "${name}" added successfully.`);
  e.target.reset();
  // Return focus to name field for quick entry
  document.getElementById("poiName").focus();
  await render();
});

document.getElementById("btnSeed").addEventListener("click", async () => {
  await addPoi({ name:"Demo POI", type:"Zone", location:"Demo area" });
  announce("Demo POI added successfully.");
  await render();
});

document.getElementById("btnRefresh").addEventListener("click", () => {
  announce("Refreshing POI list...");
  render();
});

render();

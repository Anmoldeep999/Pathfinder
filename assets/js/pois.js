import { setActiveNav, nowTime } from "./app.js";
import { getPois, addPoi, deletePoi } from "./api.js";

setActiveNav();

const lastRefreshEl = document.getElementById("lastRefresh");
const poiBody = document.getElementById("poiBody");

function row(p){
  return `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.type}</td>
      <td>${p.location}</td>
      <td>
        <button class="btn danger" data-id="${p.id}">Delete</button>
      </td>
    </tr>
  `;
}

async function render(){
  const pois = await getPois();
  poiBody.innerHTML = pois.length
    ? pois.map(row).join("")
    : `<tr><td colspan="5" class="small" style="color:#b6c2e2;">No POI’s found</td></tr>`;

  lastRefreshEl.textContent = nowTime();
}

poiBody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const ok = confirm(`Delete POI #${id}?`);
  if (!ok) return;

  await deletePoi(id);
  await render();
});

document.getElementById("poiForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("poiName").value.trim();
  const type = document.getElementById("poiType").value.trim();
  const location = document.getElementById("poiLocation").value.trim();

  await addPoi({ name, type, location });
  e.target.reset();
  await render();
});

document.getElementById("btnSeed").addEventListener("click", async () => {
  await addPoi({ name:"Demo POI", type:"Zone", location:"Demo area" });
  await render();
});

document.getElementById("btnRefresh").addEventListener("click", render);

render();

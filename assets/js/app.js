export function setActiveNav() {
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(a => {
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
}

export function nowTime() {
  const d = new Date();
  return d.toLocaleString();
}

export function statusBadge(status){
  if (status === "online" || status === true) {
    return `<span class="badge good"><span class="status-dot online"></span>ONLINE</span>`;
  } else {
    return `<span class="badge bad"><span class="status-dot offline"></span>OFFLINE</span>`;
  }
}

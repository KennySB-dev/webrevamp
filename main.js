/* KennyDEV — shared scripts */
const DISCORD_ID = "681811851428102145";
const GITHUB_USER = "KennySB-dev";

/* ---- Theme ---- */
const $themeToggle = document.getElementById("theme-toggle");

const setTheme = (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
};

if ($themeToggle) {
  $themeToggle.addEventListener("change", (e) => {
    setTheme(e.target.checked ? "dark" : "light");
  });
  const savedTheme = localStorage.getItem("theme") || "light";
  setTheme(savedTheme);
  $themeToggle.checked = savedTheme === "dark";
}

/* ---- Mobile menu ---- */
const $menuBtn = document.querySelector(".menu-btn");
const $navigator = document.getElementById("nav-menu");

if ($menuBtn && $navigator) {
  const toggleMenu = () => {
    const open = $menuBtn.classList.toggle("open");
    $navigator.classList.toggle("show", open);
    $menuBtn.setAttribute("aria-expanded", open);
    document.body.classList.toggle("no-scroll", open);
  };
  $menuBtn.addEventListener("click", toggleMenu);
  $navigator.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", () => {
      if ($menuBtn.classList.contains("open")) toggleMenu();
    });
  });
}

/* ---- Active nav ---- */
(() => {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  let page = path.split("/").pop() || "index.html";
  if (page === "" || !page.includes(".")) page = "index.html";
  document.querySelectorAll(".nav__link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === page || (page === "index.html" && (href === "index.html" || href === "/"))) {
      link.classList.add("active");
    }
  });
})();

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* ---- Lanyard status ---- */
async function fetchStatus() {
  const statusEl = document.getElementById("status-badge");
  if (!statusEl) return;

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`);
    const json = await res.json();
    if (!json.success) throw new Error("Lanyard failed");

    const data = json.data;
    const status = data.discord_status;
    const activities = data.activities || [];
    const spotify = data.spotify;
    const custom = activities.find((a) => a.type === 4);
    const game = activities.find((a) => a.type === 0);

    const colors = { online: "#23a55a", idle: "#f0b232", dnd: "#f23f43", offline: "#80848e" };
    const statusLabel = { online: "Online", idle: "Idle", dnd: "Do Not Disturb", offline: "Offline" };

    let activityHtml = "";
    let activityLabel = "Not doing anything";

    if (spotify) {
      activityLabel = `Listening to ${spotify.song}`;
      activityHtml = `
        <div class="status-activity">
          <img src="${spotify.album_art_url}" alt="" class="status-album" width="42" height="42" />
          <div class="status-activity-text">
            <span class="status-activity-type"><i class="bx bx-music"></i> Listening</span>
            <strong>${escapeHtml(spotify.song)}</strong>
            <span class="status-muted">by ${escapeHtml(spotify.artist)}</span>
          </div>
        </div>`;
    } else if (game) {
      activityHtml = `
        <div class="status-activity">
          <div class="status-activity-icon"><i class="bx bx-game"></i></div>
          <div class="status-activity-text">
            <span class="status-activity-type"><i class="bx bx-joystick"></i> Playing</span>
            <strong>${escapeHtml(game.name)}</strong>
            ${game.details ? `<span class="status-muted">${escapeHtml(game.details)}</span>` : ""}
          </div>
        </div>`;
    } else if (custom && custom.state) {
      activityHtml = `
        <div class="status-activity">
          <div class="status-activity-text">
            <span class="status-muted">${escapeHtml(custom.state)}</span>
          </div>
        </div>`;
    }

    const avatar = data.discord_user.avatar
      ? `https://cdn.discordapp.com/avatars/${DISCORD_ID}/${data.discord_user.avatar}.png?size=64`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    statusEl.innerHTML = `
      <div class="status-card">
        <div class="status-header">
          <div class="status-avatar-wrap">
            <img src="${avatar}" alt="" class="status-avatar" width="44" height="44" />
            <span class="status-dot" style="background:${colors[status] || colors.offline}" title="${statusLabel[status]}"></span>
          </div>
          <div class="status-info">
            <span class="status-name">${escapeHtml(data.discord_user.global_name || data.discord_user.username)}</span>
            <span class="status-presence">${statusLabel[status] || "Offline"}</span>
          </div>
        </div>
        ${activityHtml || `<p class="status-idle-msg">${escapeHtml(activityLabel)}</p>`}
      </div>`;
    statusEl.classList.add("loaded");
  } catch (err) {
    console.warn("Status fetch failed:", err);
    statusEl.innerHTML = `
      <div class="status-card">
        <div class="status-header">
          <div class="status-avatar-wrap">
            <img src="assets/images/kenny-profile.png" alt="" class="status-avatar" width="44" height="44" />
            <span class="status-dot" style="background:#80848e"></span>
          </div>
          <div class="status-info">
            <span class="status-name">Kenny</span>
            <span class="status-presence">Status unavailable</span>
          </div>
        </div>
      </div>`;
    statusEl.classList.add("loaded");
  }
}

/* ---- GitHub stats ---- */
async function fetchGitHubStats() {
  const el = document.getElementById("github-stats");
  if (!el) return;

  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USER}`);
    if (!res.ok) throw new Error("GitHub API error");
    const data = await res.json();

    el.innerHTML = `
      <div class="gh-stat">
        <span class="gh-num">${data.public_repos ?? "—"}</span>
        <span class="gh-label">Repos</span>
      </div>
      <div class="gh-stat">
        <span class="gh-num">${data.followers ?? "—"}</span>
        <span class="gh-label">Followers</span>
      </div>
      <div class="gh-stat">
        <span class="gh-num">${data.following ?? "—"}</span>
        <span class="gh-label">Following</span>
      </div>`;
  } catch (err) {
    console.warn("GitHub stats failed:", err);
  }
}

fetchStatus();
fetchGitHubStats();
setInterval(fetchStatus, 30000);

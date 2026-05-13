export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };
    return map[char];
  });
}

export function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function fileLabel(file = {}) {
  if (!file.name) return "";
  const size = file.size ? ` (${formatBytes(file.size)})` : "";
  return `${file.name}${size}`;
}

export function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const amount = bytes / 1024 ** index;
  return `${amount.toFixed(amount >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export function makeFileCell(file) {
  if (!file?.dataUrl) return '<span class="muted">No file</span>';
  const safeName = escapeHtml(file.name || "song-file");
  return `
    <div class="audio-cell">
      <audio controls src="${file.dataUrl}"></audio>
      <a class="mini-btn" href="${file.dataUrl}" download="${safeName}">Download ${safeName}</a>
    </div>
  `;
}

export function makeLinkCell(songLink) {
  if (!songLink) return '<span class="muted">No link</span>';
  const safeLink = escapeHtml(songLink);
  return `<a href="${safeLink}" target="_blank" rel="noopener noreferrer">${safeLink}</a>`;
}

export function submissionsFromSnapshot(snapshot) {
  const value = snapshot.val() || {};
  return Object.entries(value)
    .map(([id, submission]) => ({ id, ...submission }))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

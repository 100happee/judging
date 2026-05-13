import { onValue, ref, update } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { connectionRef, databaseURL, db, submissionsRef } from "./firebase.js";
import { escapeHtml, formatDate, makeFileCell, makeLinkCell, submissionsFromSnapshot } from "./utils.js";

const firebaseStatus = document.querySelector("#firebase-status");
const status = document.querySelector("#admin-status");
const tableBody = document.querySelector("#admin-table tbody");

watchFirebaseConnection();

onValue(submissionsRef, (snapshot) => {
  const submissions = submissionsFromSnapshot(snapshot);
  status.textContent = submissions.length
    ? `${submissions.length} submission${submissions.length === 1 ? "" : "s"} ready for judging`
    : "No submissions yet.";

  tableBody.innerHTML = submissions.map((submission) => `
    <tr data-id="${escapeHtml(submission.id)}">
      <td>${escapeHtml(formatDate(submission.createdAt))}</td>
      <td>${escapeHtml(submission.submitter)}</td>
      <td class="link-cell">${makeLinkCell(submission.songLink)}</td>
      <td>${makeFileCell(submission.file)}</td>
      <td>
        <input class="score-input" type="number" min="0" max="100" step="0.1" value="${escapeHtml(submission.score || "")}" aria-label="Score for ${escapeHtml(submission.submitter)}">
      </td>
      <td>
        <textarea class="judge-note" rows="4" aria-label="Judging description for ${escapeHtml(submission.submitter)}">${escapeHtml(submission.judgeDescription || "")}</textarea>
      </td>
      <td>
        <button class="primary-btn compact save-btn" type="button">Save</button>
        <span class="save-state" aria-live="polite"></span>
      </td>
    </tr>
  `).join("");
}, (error) => {
  status.textContent = `Could not load submissions: ${error.message}`;
});

tableBody.addEventListener("click", async (event) => {
  const button = event.target.closest(".save-btn");
  if (!button) return;

  const row = button.closest("tr");
  const id = row?.dataset.id;
  if (!id) return;

  const score = row.querySelector(".score-input").value.trim();
  const judgeDescription = row.querySelector(".judge-note").value.trim();
  const saveState = row.querySelector(".save-state");

  button.disabled = true;
  saveState.textContent = "Saving...";

  try {
    await update(ref(db, `submissions/${id}`), {
      score,
      judgeDescription,
      judgedAt: Date.now()
    });
    saveState.textContent = "Saved";
  } catch (error) {
    saveState.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

function watchFirebaseConnection() {
  onValue(connectionRef, (snapshot) => {
    const connected = snapshot.val() === true;
    firebaseStatus.textContent = connected
      ? `Connected to Firebase Realtime Database: ${databaseURL}`
      : `Not connected to Firebase Realtime Database: ${databaseURL}`;
    firebaseStatus.className = `firebase-status ${connected ? "connected" : "disconnected"}`;
  }, (error) => {
    firebaseStatus.textContent = `Firebase connection check failed: ${error.message}`;
    firebaseStatus.className = "firebase-status disconnected";
  });
}

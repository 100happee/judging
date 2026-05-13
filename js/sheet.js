import { onValue } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { connectionRef, databaseURL, submissionsRef } from "./firebase.js";
import { escapeHtml, formatDate, makeFileCell, makeLinkCell, submissionsFromSnapshot } from "./utils.js";

const firebaseStatus = document.querySelector("#firebase-status");
const status = document.querySelector("#sheet-status");
const tableBody = document.querySelector("#submissions-table tbody");

watchFirebaseConnection();

onValue(submissionsRef, (snapshot) => {
  const submissions = submissionsFromSnapshot(snapshot);
  status.textContent = submissions.length
    ? `${submissions.length} submission${submissions.length === 1 ? "" : "s"}`
    : "No submissions yet.";

  tableBody.innerHTML = submissions.map((submission) => `
    <tr>
      <td>${escapeHtml(formatDate(submission.createdAt))}</td>
      <td>${escapeHtml(submission.submitter)}</td>
      <td>${escapeHtml(submission.songName || "")}</td>
      <td class="link-cell">${makeLinkCell(submission.songLink)}</td>
      <td>${makeFileCell(submission.file)}</td>
      <td>${escapeHtml(submission.score || "")}</td>
      <td>${escapeHtml(submission.judgeDescription || "")}</td>
    </tr>
  `).join("");
}, (error) => {
  status.textContent = `Could not load submissions: ${error.message}`;
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

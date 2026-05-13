import { onValue, push, serverTimestamp, set } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { connectionRef, databaseURL, submissionsRef } from "./firebase.js";
import { fileLabel, formatBytes } from "./utils.js";

const MAX_FILE_SIZE = 30 * 1024 * 1024;
const MAX_LINK_LENGTH = 100;
const form = document.querySelector("#submission-form");
const submitterInput = document.querySelector("#submitter");
const linkInput = document.querySelector("#song-link");
const fileInput = document.querySelector("#song-file");
const preview = document.querySelector("#file-preview");
const message = document.querySelector("#form-message");
const firebaseStatus = document.querySelector("#firebase-status");
const submitButton = form.querySelector('button[type="submit"]');

let selectedFileData = null;

watchFirebaseConnection();

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  selectedFileData = null;
  preview.hidden = true;
  preview.textContent = "";

  if (!file) return;

  if (!file.type.startsWith("audio/")) {
    setMessage("Please choose an audio file.", "error");
    fileInput.value = "";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    setMessage(`Please choose an audio file under ${formatBytes(MAX_FILE_SIZE)}.`, "error");
    fileInput.value = "";
    return;
  }

  selectedFileData = await readFileAsDataUrl(file);
  preview.hidden = false;
  preview.textContent = `Ready to submit: ${fileLabel(file)}`;
  setMessage("", "");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitter = submitterInput.value.trim();
  const songLink = linkInput.value.trim();
  const file = fileInput.files?.[0];

  if (!submitter) {
    setMessage("Please enter who is submitting the song.", "error");
    submitterInput.focus();
    return;
  }

  if (!songLink && !selectedFileData) {
    setMessage("Please include a song link, an audio file, or both.", "error");
    linkInput.focus();
    return;
  }

  if (songLink.length > MAX_LINK_LENGTH) {
    setMessage("Song links must be 100 characters or fewer. Please shorten your link before submitting.", "error");
    linkInput.focus();
    return;
  }

  submitButton.disabled = true;
  setMessage("Submitting...", "");

  const submissionRef = push(submissionsRef);
  const filePayload = selectedFileData && file
    ? {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: selectedFileData
      }
    : null;

  try {
    await set(submissionRef, {
      submitter,
      songLink,
      file: filePayload,
      score: "",
      judgeDescription: "",
      createdAt: Date.now(),
      serverCreatedAt: serverTimestamp()
    });

    form.reset();
    selectedFileData = null;
    preview.hidden = true;
    setMessage(`Submitted to ${databaseURL}/submissions. Your song is now visible in the sheet.`, "success");
  } catch (error) {
    console.error("Firebase Realtime Database write failed", error);
    setMessage(`Could not submit: ${error.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
});

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function setMessage(text, type) {
  message.textContent = text;
  message.className = type ? `message ${type}` : "message";
}

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

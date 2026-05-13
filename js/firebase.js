import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getDatabase, ref } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB_GR31caHupc4l5kJEARWD3Am_lX9jlxE",
  authDomain: "judging-sheets.firebaseapp.com",
  databaseURL: "https://judging-sheets-default-rtdb.firebaseio.com",
  projectId: "judging-sheets",
  storageBucket: "judging-sheets.firebasestorage.app",
  messagingSenderId: "718233328949",
  appId: "1:718233328949:web:82796d30e0e1d2a822407c",
  measurementId: "G-M2TFPFDDB9"
};

export const app = initializeApp(firebaseConfig);
export const databaseURL = firebaseConfig.databaseURL;
export const db = getDatabase(app, databaseURL);
export const submissionsRef = ref(db, "submissions");
export const connectionRef = ref(db, ".info/connected");

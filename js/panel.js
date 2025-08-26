// Panel Sayfası JavaScript

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoIcZ0noCXfPSkyZsacZajiH5fjbh32mk",
  authDomain: "pomodoro-7bde7.firebaseapp.com",
  projectId: "pomodoro-7bde7",
  storageBucket: "pomodoro-7bde7.firebasestorage.app",
  messagingSenderId: "428259058667",
  appId: "1:428259058667:web:9cdb91f7d1d4d88f34efae",
  measurementId: "G-9PZZ9256PW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Ağ kısıtlamalarında (Safari/AdBlock/VPN) Firestore bağlantı hatalarını azaltmak için
initializeFirestore(app, { experimentalForceLongPolling: true, useFetchStreams: false });
const db = getFirestore(app);

let pomodoroDuration = 25;
let shortBreakDuration = 5;
let longBreakDuration = 15;

let time = pomodoroDuration * 60;
let totalPhaseSeconds = time;
let currentPhase = "work";
let running = false;
let timerInterval;
let savedWorkRemainingSeconds = null;

// ======================= DOM Elements =======================
const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const pauseBtn = document.getElementById("pauseBtn");
const breakBtn = document.getElementById("breakBtn");
const longBreakBtn = document.getElementById("longBreakBtn");
const pomodoroInput = document.getElementById("pomodoroInput");
const shortBreakInput = document.getElementById("shortBreakInput");
const longBreakInput = document.getElementById("longBreakInput");
const timerSettings = document.getElementById("timerSettings");

const circle = document.querySelector(".progress-ring__progress");
const radius = circle.r.baseVal.value;
const circumference = 2 * Math.PI * radius;

// Ek alanlar (başlık, notlar, görev listesi)
const sessionTitleEl = document.getElementById("sessionTitle");
const notesAreaEl = document.getElementById("notesArea");
const taskListEl = document.getElementById("taskList");

function collectTasksFromDOM() {
  const items = taskListEl ? Array.from(taskListEl.querySelectorAll("li")) : [];
  return items.map((li) => {
    const checkbox = li.querySelector('input[type="checkbox"]');
    const textEl = li.querySelector('.task-text');
    return {
      text: textEl ? textEl.textContent.trim() : li.textContent.trim(),
      done: checkbox ? !!checkbox.checked : false,
    };
  });
}

async function saveCurrentSession() {
  try {
    const user = auth.currentUser;
    if (!user) {
      alert('Giriş yapmanız gerekiyor.');
      return;
    }

    const sessionDoc = {
      title: (sessionTitleEl && sessionTitleEl.value.trim()) || 'Çalışma',
      notes: (notesAreaEl && notesAreaEl.value) || '',
      tasks: collectTasksFromDOM(),
      settings: {
        pomodoro: pomodoroDuration,
        shortBreak: shortBreakDuration,
        longBreak: longBreakDuration,
      },
      createdAt: serverTimestamp(),
      phase: currentPhase,
      remainingSeconds: time,
    };

    await addDoc(collection(db, 'users', user.uid, 'sessions'), sessionDoc);
    alert('Çalışma buluta kaydedildi.');
  } catch (err) {
    console.error('Çalışma kaydetme hatası:', err);
    alert('Kaydetme başarısız: ' + (err && err.message ? err.message : err));
  }
}

document.getElementById('saveSessionBtn').addEventListener('click', saveCurrentSession);

// ======================= Timer Functions =======================
function updateTimer() {
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
  updateProgress();
}

function updateProgress() {
  const progress = (time / totalPhaseSeconds) * circumference;
  circle.style.strokeDasharray = circumference;
  circle.style.strokeDashoffset = circumference - progress;
}

function switchPhase(phase, duration) {
  currentPhase = phase;
  time = duration;
  totalPhaseSeconds = duration;
  updateTimer();
}

function startTimer() {
  if (running) return;
  running = true;

  timerInterval = setInterval(() => {
    if (time > 0) {
      time--;
      updateTimer();
    } else {
      clearInterval(timerInterval);
      running = false;
      if (currentPhase === "work") {
        shortBreak();
      } else {
        switchPhase("work", pomodoroDuration * 60);
      }
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  running = false;
  savedWorkRemainingSeconds = null;
  switchPhase("work", pomodoroDuration * 60);
  totalPhaseSeconds = pomodoroDuration * 60;
}

function shortBreak() {
  clearInterval(timerInterval);
  running = false;
  if (currentPhase === "work") {
    savedWorkRemainingSeconds = time;
  }
  switchPhase("shortBreak", shortBreakDuration * 60);
}

function longBreak() {
  clearInterval(timerInterval);
  running = false;
  if (currentPhase === "work") {
    savedWorkRemainingSeconds = time;
  }
  switchPhase("longBreak", longBreakDuration * 60);
}

function pauseTimer() {
  clearInterval(timerInterval);
  running = false;
}

// ======================= Event Listeners =======================
startBtn.addEventListener("click", startTimer);
resetBtn.addEventListener("click", resetTimer);
pauseBtn.addEventListener("click", pauseTimer);
breakBtn.addEventListener("click", shortBreak);
longBreakBtn.addEventListener("click", longBreak);

timerSettings.addEventListener("submit", async (e) => {
  e.preventDefault();

  pomodoroDuration = parseInt(pomodoroInput.value) || 25;
  shortBreakDuration = parseInt(shortBreakInput.value) || 5;
  longBreakDuration = parseInt(longBreakInput.value) || 15;

  time = pomodoroDuration * 60;
  totalPhaseSeconds = time;
  updateTimer();

  const user = auth.currentUser;
  if (user) {
    try {
      await updateDoc(doc(db, "users", user.uid), {
        pomodoroSettings: {
          pomodoro: pomodoroDuration,
          shortBreak: shortBreakDuration,
          longBreak: longBreakDuration,
        },
      });
    } catch (err) {
      console.error(err);
    }
  }
});

// ======================= Auth & Load Settings =======================
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    // Navbar display name
    try {
      const data = docSnap.exists() ? docSnap.data() : {};
      const displayName = data.name || data.fullName || user.displayName || user.email;
      const userNameEl = document.getElementById('userName');
      if (userNameEl) userNameEl.textContent = displayName;
    } catch (_) {
      const userNameEl = document.getElementById('userName');
      if (userNameEl) userNameEl.textContent = user.email;
    }

    if (docSnap.exists() && docSnap.data().pomodoroSettings) {
      const settings = docSnap.data().pomodoroSettings;
      pomodoroDuration = settings.pomodoro || 25;
      shortBreakDuration = settings.shortBreak || 5;
      longBreakDuration = settings.longBreak || 15;

      pomodoroInput.value = pomodoroDuration;
      shortBreakInput.value = shortBreakDuration;
      longBreakInput.value = longBreakDuration;

      time = pomodoroDuration * 60;
      totalPhaseSeconds = time;
      updateTimer();
    } else {
      updateTimer();
    }
  } else {
    window.location.href = 'anasayfa.html';
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = 'anasayfa.html';
  });
});
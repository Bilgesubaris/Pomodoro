// ================================
// PANEL SAYFASI JAVASCRIPT
// ================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ================================
// FIREBASE
// ================================

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

const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});


// ================================
// TIMER DEĞİŞKENLERİ
// ================================

let pomodoroDuration = 25;
let shortBreakDuration = 5;
let longBreakDuration = 15;

let time = pomodoroDuration * 60;
let totalPhaseSeconds = time;

let currentPhase = "work";
let running = false;
let timerInterval = null;

let savedWorkRemainingSeconds = null;


// ================================
// DOM ELEMENTLERİ
// ================================

const timerDisplay =
  document.getElementById("timer");

const startBtn =
  document.getElementById("startBtn");

const pauseBtn =
  document.getElementById("pauseBtn");

const resetBtn =
  document.getElementById("resetBtn");

const breakBtn =
  document.getElementById("breakBtn");

const longBreakBtn =
  document.getElementById("longBreakBtn");

const saveSessionBtn =
  document.getElementById("saveSessionBtn");

const timerSettings =
  document.getElementById("timerSettings");

const pomodoroInput =
  document.getElementById("pomodoroInput");

const shortBreakInput =
  document.getElementById("shortBreakInput");

const longBreakInput =
  document.getElementById("longBreakInput");

const sessionTitleEl =
  document.getElementById("sessionTitle");

const notesAreaEl =
  document.getElementById("notesArea");

const taskListEl =
  document.getElementById("taskList");

const newTaskInput =
  document.getElementById("newTaskInput");

const addTaskBtn =
  document.getElementById("addTaskBtn");

const logoutBtn =
  document.getElementById("logoutBtn");

const userNameEl =
  document.getElementById("userName");

const totalSessionsValue =
  document.getElementById("totalSessionsValue");

const completedTasksValue =
  document.getElementById("completedTasksValue");

const lastSessionValue =
  document.getElementById("lastSessionValue");


// ================================
// PROGRESS CIRCLE
// ================================

const circle =
  document.querySelector(".progress-ring__progress");

let radius = 0;
let circumference = 0;

if (circle) {

  radius = circle.r.baseVal.value;

  circumference =
    2 * Math.PI * radius;

}


// ================================
// TIMER GÖRÜNTÜSÜ
// ================================

function updateTimer() {

  if (!timerDisplay) return;

  const minutes =
    Math.floor(time / 60);

  const seconds =
    time % 60;

  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  updateProgress();

}


// ================================
// PROGRESS
// ================================

function updateProgress() {

  if (!circle || !circumference) {
    return;
  }

  const progress =
    totalPhaseSeconds > 0
      ? time / totalPhaseSeconds
      : 0;

  circle.style.strokeDasharray =
    circumference;

  circle.style.strokeDashoffset =
    circumference -
    progress * circumference;

}


// ================================
// FAZ DEĞİŞTİR
// ================================

function switchPhase(
  phase,
  duration
) {

  clearInterval(timerInterval);

  running = false;

  currentPhase = phase;

  time = duration;

  totalPhaseSeconds = duration;

  updateTimer();

}


// ================================
// TIMER BAŞLAT
// ================================

function startTimer() {

  if (running) return;

  if (time <= 0) {
    time = totalPhaseSeconds;
    updateTimer();
  }

  running = true;

  timerInterval =
    setInterval(() => {

      if (time > 0) {

        time--;

        updateTimer();

      } else {

        clearInterval(timerInterval);

        timerInterval = null;

        running = false;

        // Çalışma bittiyse kısa mola
        if (currentPhase === "work") {

          savedWorkRemainingSeconds = 0;

          switchPhase(
            "shortBreak",
            shortBreakDuration * 60
          );

        }

        // Mola bittiyse tekrar çalışma
        else {

          if (
            savedWorkRemainingSeconds !== null &&
            savedWorkRemainingSeconds > 0
          ) {

            switchPhase(
              "work",
              savedWorkRemainingSeconds
            );

          } else {

            switchPhase(
              "work",
              pomodoroDuration * 60
            );

          }

          savedWorkRemainingSeconds = null;

        }

      }

    }, 1000);

}


// ================================
// TIMER DURAKLAT
// ================================

function pauseTimer() {

  if (!running) return;

  clearInterval(timerInterval);

  timerInterval = null;

  running = false;

}


// ================================
// TIMER SIFIRLA
// ================================

function resetTimer() {

  clearInterval(timerInterval);

  timerInterval = null;

  running = false;

  savedWorkRemainingSeconds = null;

  switchPhase(
    "work",
    pomodoroDuration * 60
  );

}


// ================================
// KISA MOLA
// ================================

function shortBreak() {

  clearInterval(timerInterval);

  timerInterval = null;

  running = false;

  if (currentPhase === "work") {

    savedWorkRemainingSeconds =
      time;

  }

  switchPhase(
    "shortBreak",
    shortBreakDuration * 60
  );

}


// ================================
// UZUN MOLA
// ================================

function longBreak() {

  clearInterval(timerInterval);

  timerInterval = null;

  running = false;

  if (currentPhase === "work") {

    savedWorkRemainingSeconds =
      time;

  }

  switchPhase(
    "longBreak",
    longBreakDuration * 60
  );

}


// ================================
// BUTONLARI BAĞLA
// ================================

if (startBtn) {

  startBtn.addEventListener(
    "click",
    startTimer
  );

}

if (pauseBtn) {

  pauseBtn.addEventListener(
    "click",
    pauseTimer
  );

}

if (resetBtn) {

  resetBtn.addEventListener(
    "click",
    resetTimer
  );

}

if (breakBtn) {

  breakBtn.addEventListener(
    "click",
    shortBreak
  );

}

if (longBreakBtn) {

  longBreakBtn.addEventListener(
    "click",
    longBreak
  );

}


// ================================
// GÖREVLER
// ================================

function updateCompletedTasks() {

  if (
    !taskListEl ||
    !completedTasksValue
  ) {
    return;
  }

  const checkboxes =
    taskListEl.querySelectorAll(
      'input[type="checkbox"]'
    );

  let completed = 0;

  checkboxes.forEach(
    (checkbox) => {

      if (checkbox.checked) {
        completed++;
      }

    }
  );

  completedTasksValue.textContent =
    completed;

}


// ================================
// GÖREV OLUŞTUR
// ================================

function createTask(text) {

  if (!taskListEl) return;

  const li =
    document.createElement("li");

  li.className =
    "list-group-item d-flex align-items-center justify-content-between";


  const left =
    document.createElement("div");

  left.className =
    "d-flex align-items-center gap-2";


  const checkbox =
    document.createElement("input");

  checkbox.type = "checkbox";

  checkbox.className =
    "form-check-input";


  const span =
    document.createElement("span");

  span.className =
    "task-text";

  span.textContent =
    text;


  checkbox.addEventListener(
    "change",
    () => {

      li.classList.toggle(
        "done",
        checkbox.checked
      );

      updateCompletedTasks();

    }
  );


  left.appendChild(checkbox);

  left.appendChild(span);


  const deleteBtn =
    document.createElement("button");

  deleteBtn.type =
    "button";

  deleteBtn.className =
    "btn btn-sm btn-outline-danger";

  deleteBtn.innerHTML =
    '<i class="bi bi-trash"></i>';


  deleteBtn.addEventListener(
    "click",
    () => {

      li.remove();

      updateCompletedTasks();

    }
  );


  li.appendChild(left);

  li.appendChild(deleteBtn);

  taskListEl.appendChild(li);

  updateCompletedTasks();

}


// ================================
// GÖREV EKLE
// ================================

function addTask() {

  if (!newTaskInput) return;

  const text =
    newTaskInput.value.trim();

  if (!text) return;

  createTask(text);

  newTaskInput.value = "";

  newTaskInput.focus();

}


if (addTaskBtn) {

  addTaskBtn.addEventListener(
    "click",
    addTask
  );

}


if (newTaskInput) {

  newTaskInput.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {

        event.preventDefault();

        addTask();

      }

    }
  );

}


// ================================
// GÖREVLERİ TOPLA
// ================================

function collectTasksFromDOM() {

  if (!taskListEl) {
    return [];
  }

  const items =
    Array.from(
      taskListEl.querySelectorAll("li")
    );

  return items.map(
    (li) => {

      const checkbox =
        li.querySelector(
          'input[type="checkbox"]'
        );

      const textEl =
        li.querySelector(".task-text");

      return {

        text:
          textEl
            ? textEl.textContent.trim()
            : "",

        done:
          checkbox
            ? checkbox.checked
            : false

      };

    }
  );

}


// ================================
// ÇALIŞMAYI KAYDET
// ================================

async function saveCurrentSession() {

  try {

    const user =
      auth.currentUser;

    if (!user) {

      window.location.href =
        "giris.html";

      return;

    }


    const sessionDoc = {

      title:
        sessionTitleEl &&
        sessionTitleEl.value.trim()
          ? sessionTitleEl.value.trim()
          : "Çalışma",

      notes:
        notesAreaEl
          ? notesAreaEl.value
          : "",

      tasks:
        collectTasksFromDOM(),

      settings: {

        pomodoro:
          pomodoroDuration,

        shortBreak:
          shortBreakDuration,

        longBreak:
          longBreakDuration

      },

      createdAt:
        serverTimestamp(),

      phase:
        currentPhase,

      remainingSeconds:
        time

    };


    await addDoc(
      collection(
        db,
        "users",
        user.uid,
        "sessions"
      ),
      sessionDoc
    );


    alert(
      "Çalışma başarıyla kaydedildi."
    );


    await loadStatistics(
      user.uid
    );

  }

  catch (error) {

    console.error(
      "Çalışma kaydetme hatası:",
      error
    );

    alert(
      "Çalışma kaydedilemedi."
    );

  }

}


if (saveSessionBtn) {

  saveSessionBtn.addEventListener(
    "click",
    saveCurrentSession
  );

}


// ================================
// SÜRE AYARLARI
// ================================

if (timerSettings) {

  timerSettings.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      clearInterval(timerInterval);

      timerInterval = null;

      running = false;


      pomodoroDuration =
        Math.max(
          1,
          parseInt(
            pomodoroInput?.value
          ) || 25
        );


      shortBreakDuration =
        Math.max(
          1,
          parseInt(
            shortBreakInput?.value
          ) || 5
        );


      longBreakDuration =
        Math.max(
          1,
          parseInt(
            longBreakInput?.value
          ) || 15
        );


      currentPhase =
        "work";

      time =
        pomodoroDuration * 60;

      totalPhaseSeconds =
        time;

      savedWorkRemainingSeconds =
        null;

      updateTimer();


      const user =
        auth.currentUser;


      if (user) {

        try {

          await setDoc(
            doc(
              db,
              "users",
              user.uid
            ),
            {
              pomodoroSettings: {

                pomodoro:
                  pomodoroDuration,

                shortBreak:
                  shortBreakDuration,

                longBreak:
                  longBreakDuration

              }
            },
            {
              merge: true
            }
          );

        }

        catch (error) {

          console.error(
            "Ayar kaydetme hatası:",
            error
          );

        }

      }

    }
  );

}


// ================================
// İSTATİSTİKLER
// ================================

async function loadStatistics(uid) {

  try {

    const sessionsRef =
      collection(
        db,
        "users",
        uid,
        "sessions"
      );


    const snapshot =
      await getDocs(
        sessionsRef
      );


    const sessions =
      snapshot.docs.map(
        (document) => ({

          id: document.id,

          ...document.data()

        })
      );


    if (totalSessionsValue) {

      totalSessionsValue.textContent =
        sessions.length;

    }


    if (lastSessionValue) {

      const sorted =
        sessions
          .filter(
            (session) =>
              session.createdAt
          )
          .sort(
            (a, b) => {

              const dateA =
                a.createdAt?.toMillis
                  ? a.createdAt.toMillis()
                  : 0;

              const dateB =
                b.createdAt?.toMillis
                  ? b.createdAt.toMillis()
                  : 0;

              return dateB - dateA;

            }
          );


      if (sorted.length > 0) {

        const date =
          sorted[0]
            .createdAt
            .toDate();


        lastSessionValue.textContent =
          date.toLocaleDateString(
            "tr-TR"
          );

      }

    }

  }

  catch (error) {

    console.error(
      "İstatistik yükleme hatası:",
      error
    );

  }

}


// ================================
// FIREBASE AUTH
// ================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.href =
        "giris.html";

      return;

    }


    // ============================
    // KULLANICI BİLGİSİ
    // ============================

    try {

      const userDoc =
        await getDoc(
          doc(
            db,
            "users",
            user.uid
          )
        );


      const data =
        userDoc.exists()
          ? userDoc.data()
          : {};


      const displayName =
        data.name ||
        data.fullName ||
        user.displayName ||
        user.email;


      if (userNameEl) {

        userNameEl.textContent =
          displayName;

      }


      // ==========================
      // KULLANICI AYARLARI
      // ==========================

      if (
        data.pomodoroSettings
      ) {

        const settings =
          data.pomodoroSettings;


        pomodoroDuration =
          Number(
            settings.pomodoro
          ) || 25;


        shortBreakDuration =
          Number(
            settings.shortBreak
          ) || 5;


        longBreakDuration =
          Number(
            settings.longBreak
          ) || 15;


        if (pomodoroInput) {

          pomodoroInput.value =
            pomodoroDuration;

        }

        if (shortBreakInput) {

          shortBreakInput.value =
            shortBreakDuration;

        }

        if (longBreakInput) {

          longBreakInput.value =
            longBreakDuration;

        }


        time =
          pomodoroDuration * 60;

        totalPhaseSeconds =
          time;

        currentPhase =
          "work";

        updateTimer();

      }

    }

    catch (error) {

      console.error(
        "Kullanıcı bilgileri alınamadı:",
        error
      );

      if (userNameEl) {

        userNameEl.textContent =
          user.email;

      }

    }


    await loadStatistics(
      user.uid
    );

  }
);


// ================================
// ÇIKIŞ
// ================================

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    async () => {

      try {

        await signOut(auth);

        window.location.href =
          "anasayfa.html";

      }

      catch (error) {

        console.error(
          "Çıkış hatası:",
          error
        );

      }

    }
  );

}


// ================================
// İLK TIMER
// ================================

updateTimer();
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

let currentUid = null;

// DOM Elements
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const breakBtn = document.getElementById('breakBtn');
const longBreakBtn = document.getElementById('longBreakBtn');
const pomodoroInput = document.getElementById('pomodoroInput');
const shortBreakInput = document.getElementById('shortBreakInput');
const longBreakInput = document.getElementById('longBreakInput');
const timerSettings = document.getElementById('timerSettings');
const sessionTitle = document.getElementById('sessionTitle');
const newTaskInput = document.getElementById('newTaskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const notesArea = document.getElementById('notesArea');

// Timer Variables
let pomodoroDuration = 25, shortBreakDuration = 5, longBreakDuration = 15;
let timerInterval;
let time = pomodoroDuration * 60;
let running = false;
let currentPhase = 'work'; // 'work' | 'shortBreak' | 'longBreak'
let savedWorkRemainingSeconds = null;
let totalPhaseSeconds = time; // progress ring için aktif fazın toplam süresi

// Utility Functions
function storageKey(key) {
  return currentUid ? `${key}_${currentUid}` : key;
}

function updateTimer() {
  const m = String(Math.floor(time / 60)).padStart(2, '0');
  const s = String(time % 60).padStart(2, '0');
  timerEl.textContent = `${m}:${s}`;
  // progress ring güncelle
  setProgress(time, totalPhaseSeconds || (pomodoroDuration * 60));
}

// Faz geçiş yardımcısı
function switchPhase(phase, newTimeSeconds) {
  currentPhase = phase;
  time = newTimeSeconds;
  totalPhaseSeconds = newTimeSeconds;
  updateTimer();
}

// Timer Functions
function startTimer() {
  if (running) return;
  running = true;
  timerInterval = setInterval(() => {
    if (time > 0) {
      time--;
      updateTimer();
      return;
    }
    // Süre bitti
    if ((currentPhase === 'shortBreak' || currentPhase === 'longBreak') && savedWorkRemainingSeconds != null) {
      // Moladan kalan işe dön
      switchPhase('work', savedWorkRemainingSeconds);
      savedWorkRemainingSeconds = null;
      // Çalışma kaldığı yerden otomatik devam etsin
      return; // interval çalışmaya devam ediyor
    }
    // Çalışma bitti ya da mola bitti (yedek yok): dur ve çalışma süresini başa sar
    clearInterval(timerInterval);
    running = false;
    switchPhase('work', pomodoroDuration * 60);
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  running = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  running = false;
  savedWorkRemainingSeconds = null;
  switchPhase('work', pomodoroDuration * 60);
}

function shortBreak() {
  clearInterval(timerInterval);
  running = false;
  if (currentPhase === 'work') {
    savedWorkRemainingSeconds = time; // kalan çalışma süresini sakla
  }
  switchPhase('shortBreak', shortBreakDuration * 60);
}

function longBreak() {
  clearInterval(timerInterval);
  running = false;
  if (currentPhase === 'work') {
    savedWorkRemainingSeconds = time; // kalan çalışma süresini sakla
  }
  switchPhase('longBreak', longBreakDuration * 60);
}

// Task Management
function getTasks() {
  const t = localStorage.getItem(storageKey('tasks'));
  return t ? JSON.parse(t) : [];
}

function saveTasks(tasks) {
  localStorage.setItem(storageKey('tasks'), JSON.stringify(tasks));
}

function renderTasks(tasks) {
  taskList.innerHTML = '';
  tasks.forEach((task, idx) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center task-item ' + (task.done ? 'done' : '');
    
    const left = document.createElement('div');
    left.className = 'd-flex align-items-center gap-2';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = task.done;
    cb.addEventListener('change', () => {
      toggleTask(idx);
    });
    
    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;
    
    left.appendChild(cb);
    left.appendChild(span);
    
    const del = document.createElement('button');
    del.className = 'btn btn-sm btn-outline-danger';
    del.textContent = 'Sil';
    del.addEventListener('click', () => {
      deleteTask(idx);
    });
    
    li.appendChild(left);
    li.appendChild(del);
    taskList.appendChild(li);
  });
}

function addTask(text) {
  if (!text.trim()) return;
  const tasks = getTasks();
  tasks.push({ text, done: false });
  saveTasks(tasks);
  renderTasks(tasks);
  newTaskInput.value = '';
}

function toggleTask(index) {
  const tasks = getTasks();
  tasks[index].done = !tasks[index].done;
  saveTasks(tasks);
  renderTasks(tasks);
}

function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks(tasks);
}

// Personal State Management
function loadPersonalState() {
  const t = localStorage.getItem(storageKey('session_title'));
  if (t) sessionTitle.value = t;
  
  const n = localStorage.getItem(storageKey('notes'));
  if (n) notesArea.value = n;
  
  const tasksJson = localStorage.getItem(storageKey('tasks'));
  const tasks = tasksJson ? JSON.parse(tasksJson) : [];
  renderTasks(tasks);
}

// Save Session
async function saveCurrentSession() {
  const session = {
    title: sessionTitle.value.trim() || 'Çalışma',
    createdAt: new Date().toISOString(),
    settings: { 
      pomodoro: pomodoroDuration, 
      shortBreak: shortBreakDuration, 
      longBreak: longBreakDuration 
    },
    notes: notesArea.value,
    tasks: getTasks()
  };
  
  // Firestore
  const user = auth.currentUser;
  if (user) {
    try {
      console.log('Firestore kaydetme başlıyor...', user.uid);
      const docRef = await addDoc(collection(db, 'users', user.uid, 'sessions'), {
        ...session,
        createdAt: serverTimestamp()
      });
      console.log('Firestore kaydetme başarılı!', docRef.id);
      alert('Çalışma buluta kaydedildi!');
    } catch (err) {
      console.error('Firestore kaydetme hatası:', err);
      console.error('Hata detayı:', err.message);
      console.error('Hata kodu:', err.code);
      alert('Bulut kaydetme hatası: ' + err.message + '\nKod: ' + err.code);
    }
  } else {
    console.error('Kullanıcı giriş yapmamış!');
    alert('Giriş yapmanız gerekiyor!');
  }
}

// Event Listeners
function setupEventListeners() {
  // Timer buttons
  startBtn.onclick = startTimer;
  pauseBtn.onclick = pauseTimer;
  resetBtn.onclick = resetTimer;
  breakBtn.onclick = shortBreak;
  longBreakBtn.onclick = longBreak;
  
  // Focus mode
  document.getElementById('focusToggle').addEventListener('click', () => {
    document.body.classList.toggle('focus-mode');
  });
  
  // Timer settings
  if (timerSettings) {
    timerSettings.addEventListener('submit', async (e) => {
      e.preventDefault();
      pomodoroDuration = parseInt(pomodoroInput.value) || 25;
      shortBreakDuration = parseInt(shortBreakInput.value) || 5;
      longBreakDuration = parseInt(longBreakInput.value) || 15;
      time = pomodoroDuration * 60;
      updateTimer();
      
      const user = auth.currentUser;
      if (user) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            pomodoroSettings: {
              pomodoro: pomodoroDuration,
              shortBreak: shortBreakDuration,
              longBreak: longBreakDuration
            }
          });
        } catch (err) {
          console.error(err);
        }
      }
    });
  }
  
  // Task management
  addTaskBtn.addEventListener('click', () => addTask(newTaskInput.value));
  newTaskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask(newTaskInput.value);
    }
  });
  
  // Personal state
  sessionTitle.addEventListener('input', () => {
    localStorage.setItem(storageKey('session_title'), sessionTitle.value);
  });
  
  notesArea.addEventListener('input', () => {
    localStorage.setItem(storageKey('notes'), notesArea.value);
  });
  
  // Save session
  document.getElementById('saveSessionBtn').addEventListener('click', saveCurrentSession);
  
  // Logout
  let isLoggingOut = false;
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    if (isLoggingOut) return;
    isLoggingOut = true;
    const btn = document.getElementById('logoutBtn');
    if (btn) { btn.disabled = true; btn.classList.add('loading'); }
    try {
      console.log('Logout clicked');
      await signOut(auth);
      window.location.href = 'anasayfa.html';
    } catch (e) {
      console.error('Logout hatası:', e);
      alert('Çıkış yapılırken hata oluştu: ' + e.message);
      isLoggingOut = false;
      if (btn) { btn.disabled = false; btn.classList.remove('loading'); }
    }
  });
}

// Firebase Auth State
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUid = user.uid;
    document.getElementById('userName').textContent = user.email;
    
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.pomodoroSettings) {
          pomodoroDuration = data.pomodoroSettings.pomodoro || 25;
          shortBreakDuration = data.pomodoroSettings.shortBreak || 5;
          longBreakDuration = data.pomodoroSettings.longBreak || 15;
          pomodoroInput.value = pomodoroDuration;
          shortBreakInput.value = shortBreakDuration;
          longBreakInput.value = longBreakDuration;
          time = pomodoroDuration * 60;
          updateTimer();
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    loadPersonalState();
  } else {
    if (!isLoggingOut) {
      window.location.href = 'anasayfa.html';
    }
  }
});

// Progress ring update
const progressCircle = document.querySelector('.progress-ring__progress');
const circumference = 2 * Math.PI * 100;
function setProgress(secondsLeft, totalSeconds) {
  if (!progressCircle || !totalSeconds) return;
  const ratio = Math.max(0, Math.min(1, secondsLeft / totalSeconds));
  const offset = circumference * (1 - ratio);
  progressCircle.style.strokeDasharray = `${circumference}`;
  progressCircle.style.strokeDashoffset = `${offset}`;
}

// Stats update
function updateStats() {
  const totalSessionsEl = document.getElementById('totalSessionsValue');
  const completedTasksEl = document.getElementById('completedTasksValue');
  const lastSessionEl = document.getElementById('lastSessionValue');

  try {
    const sessionsKey = storageKey('sessions');
    const sessionsJson = localStorage.getItem(sessionsKey);
    const sessions = sessionsJson ? JSON.parse(sessionsJson) : [];
    totalSessionsEl && (totalSessionsEl.textContent = sessions.length);

    const tasks = getTasks();
    const doneCount = tasks.filter(t => t.done).length;
    completedTasksEl && (completedTasksEl.textContent = doneCount);

    if (sessions.length > 0) {
      const last = sessions[0];
      const dt = last.createdAt ? new Date(last.createdAt) : null;
      lastSessionEl && (lastSessionEl.textContent = dt ? dt.toLocaleString() : '-');
    }
  } catch (e) {
    console.warn('İstatistik güncelleme hatası', e);
  }
}

// Hook into existing timer logic
// totalPhaseSeconds = time; // initial total - REMOVED
function refreshPhaseTotals() {
  // total current phase seconds equals current time baseline depending on phase
  totalPhaseSeconds = running ? totalPhaseSeconds : (timerEl.textContent.includes(':') ? (pomodoroDuration * 60) : totalPhaseSeconds);
}

// Override / extend timer functions - REMOVED
// const _startTimer = startTimer;
// startTimer = function() {
//   totalPhaseSeconds = time; // capture at start
//   setProgress(time, totalPhaseSeconds);
//   _startTimer();
// };

// const _pauseTimer = pauseTimer;
// pauseTimer = function() {
//   _pauseTimer();
//   setProgress(time, totalPhaseSeconds);
// };

// const _resetTimer = resetTimer;
// resetTimer = function() {
//   _resetTimer();
//   totalPhaseSeconds = pomodoroDuration * 60;
//   setProgress(time, totalPhaseSeconds);
// };

// const _shortBreak = shortBreak;
// shortBreak = function() {
//   _shortBreak();
//   totalPhaseSeconds = shortBreakDuration * 60;
//   setProgress(time, totalPhaseSeconds);
// };

// const _longBreak = longBreak;
// longBreak = function() {
//   _longBreak();
//   totalPhaseSeconds = longBreakDuration * 60;
//   setProgress(time, totalPhaseSeconds);
// };

// Update progress every second via existing interval hook by monkey patching updateTimer - REMOVED
// const _updateTimerFn = updateTimer;
// updateTimer = function() {
//   _updateTimerFn();
//   setProgress(time, totalPhaseSeconds || (pomodoroDuration * 60));
// };

// Update stats on load and after save
updateStats();
const _saveSession = saveCurrentSession;
saveCurrentSession = async function() {
  await _saveSession();
  updateStats();
};

// Initialize
updateTimer();
setupEventListeners();

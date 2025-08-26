// Çalışmalar Sayfası JavaScript

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

// DOM Elements
const sessionsRow = document.getElementById('sessionsRow');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
const userEmailEl = document.getElementById('userEmail');
const navUserName = document.getElementById('navUserName');

let currentUid = null;
let cloudSessions = [];

// Load Cloud Sessions
async function loadCloudSessions() {
  if (!currentUid) return [];
  
  try {
    const q = query(collection(db, 'users', currentUid, 'sessions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error('Firestore yükleme hatası:', error);
    return [];
  }
}

// Render Sessions
function render(list) {
  const term = (searchInput.value || '').toLowerCase();
  const filtered = list.filter(s => {
    const t = (s.title || '').toLowerCase();
    const n = (s.notes || '').toLowerCase();
    const g = (s.tasks || []).map(x => x.text).join(' ').toLowerCase();
    return t.includes(term) || n.includes(term) || g.includes(term);
  });
  
  sessionsRow.innerHTML = '';
  
  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  } else {
    emptyState.style.display = 'none';
  }
  
  filtered.forEach((s) => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    
    const card = document.createElement('div');
    card.className = 'card shadow-sm rounded-4 h-100';
    
    const body = document.createElement('div');
    body.className = 'card-body';
    
    // Title
    const title = document.createElement('h5');
    title.className = 'card-title fw-bold';
    title.textContent = s.title || 'Çalışma';
    
    // Time
    const time = document.createElement('div');
    time.className = 'text-secondary small mb-2';
    const created = s.createdAt ? 
      (typeof s.createdAt.toDate === 'function' ? s.createdAt.toDate() : new Date(s.createdAt)) : 
      null;
    time.textContent = created ? created.toLocaleString() : '';
    
    // Settings
    const settings = document.createElement('div');
    settings.className = 'small';
    const set = s.settings || {};
    settings.innerHTML = `Pomodoro: <b>${set.pomodoro || '-'}</b> dk · Kısa: <b>${set.shortBreak || '-'}</b> dk · Uzun: <b>${set.longBreak || '-'}</b> dk`;
    
    // Notes
    const notes = document.createElement('p');
    notes.className = 'card-text mt-2';
    const notesText = s.notes || '';
    notes.textContent = notesText.slice(0, 140) + (notesText.length > 140 ? '...' : '');
    
    // Tasks
    const tasks = document.createElement('div');
    tasks.className = 'mt-2';
    const doneCount = (s.tasks || []).filter(x => x.done).length;
    const totalCount = (s.tasks || []).length;
    tasks.innerHTML = `<span class="badge bg-success me-1">Tamamlanan: ${doneCount}</span><span class="badge bg-secondary">Toplam: ${totalCount}</span>`;
    
    // Append elements
    body.appendChild(title);
    body.appendChild(time);
    body.appendChild(settings);
    body.appendChild(notes);
    body.appendChild(tasks);
    
    card.appendChild(body);
    col.appendChild(card);
    sessionsRow.appendChild(col);
  });
}

// Refresh function
async function refresh() {
  render(cloudSessions);
}

// Event Listeners
function setupEventListeners() {
  searchInput.addEventListener('input', refresh);
}

// Firebase Auth State
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'anasayfa.html';
    return;
  }
  
  currentUid = user.uid;
  try {
    const userDocRef = doc(db, 'users', currentUid);
    const userSnap = await getDoc(userDocRef);
    const data = userSnap.exists() ? userSnap.data() : {};
    const displayName = data.name || data.fullName || auth.currentUser.displayName || auth.currentUser.email;
    userEmailEl.textContent = displayName;
    if (navUserName) navUserName.textContent = displayName;
  } catch (e) {
    console.warn('Kullanıcı adı yüklenemedi, e-posta gösteriliyor.', e);
    userEmailEl.textContent = auth.currentUser.email;
    if (navUserName) navUserName.textContent = auth.currentUser.email;
  }
  
  try {
    cloudSessions = await loadCloudSessions();
    console.log(`${cloudSessions.length} çalışma yüklendi`);
  } catch (e) {
    console.error('Bulut yükleme hatası', e);
  }
  
  refresh();
});

// Initialize
setupEventListeners();

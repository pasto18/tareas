const { app, BrowserWindow, Tray, ipcMain, screen, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const admin = require('firebase-admin');

const KEY_PATH = path.join(__dirname, 'serviceAccount.json');
let db = null, initError = '';
try {
  admin.initializeApp({ credential: admin.credential.cert(JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'))) });
  db = admin.firestore();
} catch (e) {
  initError = 'Falta serviceAccount.json (ver README.md).';
}

const DEFAULT_PROJECTS = ['Personal', 'Trabajo'];
const DEFAULT_PEOPLE = [];
const DEFAULT_RUBROS = ['Casa', 'Trabajo', 'Otros'];

// Los datos viven en users/{uid}/...; esta app es del dueño, así que se busca su uid por email.
const OWNER_EMAIL = 'lisandromarq18@gmail.com';
let userPath = null;
async function base() {
  if (!userPath) userPath = `users/${(await admin.auth().getUserByEmail(OWNER_EMAIL)).uid}`;
  return userPath;
}

let tray, win;

function createWindow() {
  win = new BrowserWindow({
    width: 360, height: 720, show: false, frame: false, resizable: false, fullscreenable: false,
    skipTaskbar: true, alwaysOnTop: true, backgroundColor: '#f3f2f2',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true },
  });
  win.loadFile('index.html');
  win.on('blur', () => { if (!win.webContents.isDevToolsOpened()) win.hide(); });
}

function toggleWindow() {
  if (win.isVisible()) { win.hide(); return; }
  const b = tray.getBounds();
  const { width, height } = win.getBounds();
  const display = screen.getDisplayNearestPoint({ x: b.x, y: b.y });
  let x = Math.round(b.x + b.width / 2 - width / 2);
  x = Math.max(display.workArea.x + 8, Math.min(x, display.workArea.x + display.workArea.width - width - 8));
  win.setPosition(x, Math.round(b.y + b.height + 4), false);
  win.show();
  win.focus();
  win.webContents.send('shown');
}

app.whenReady().then(() => {
  if (app.dock) app.dock.hide();
  app.setLoginItemSettings({ openAtLogin: true });
  const icon = nativeImage.createFromPath(path.join(__dirname, 'iconTemplate.png'));
  icon.setTemplateImage(true);
  tray = new Tray(icon);
  tray.setToolTip('Nueva tarea');
  tray.on('click', toggleWindow);
  createWindow();
});

app.on('window-all-closed', (e) => e.preventDefault());

ipcMain.handle('get-lists', async () => {
  if (!db) return { error: initError };
  try {
    const snap = await db.doc(`${await base()}/settings/lists`).get();
    const d = snap.exists ? snap.data() : {};
    return {
      projects: Array.isArray(d.projects) ? d.projects : DEFAULT_PROJECTS,
      people: Array.isArray(d.people) ? d.people : DEFAULT_PEOPLE,
      rubros: Array.isArray(d.rubros) ? d.rubros : DEFAULT_RUBROS,
    };
  } catch (e) { return { error: 'No se pudo leer Firestore: ' + e.message }; }
});

ipcMain.handle('add-task', async (_e, t) => {
  if (!db) return { error: initError };
  const text = String(t.text || '').trim();
  if (!text) return { error: 'Escribe la tarea.' };
  try {
    // los proyectos/personas nuevos pasan a la lista compartida (la web los ofrece desde ya)
    const root = await base();
    const ref = db.doc(`${root}/settings/lists`);
    const cur = (await ref.get()).data() || {};
    const projects = Array.isArray(cur.projects) ? cur.projects : [...DEFAULT_PROJECTS];
    const people = Array.isArray(cur.people) ? cur.people : [...DEFAULT_PEOPLE];
    const rubros = Array.isArray(cur.rubros) ? cur.rubros : [...DEFAULT_RUBROS];
    let changed = !cur.projects || !cur.people || !cur.rubros;
    if (t.rubro && !rubros.includes(t.rubro)) { rubros.push(t.rubro); changed = true; }
    if (t.project && !projects.includes(t.project)) { projects.push(t.project); changed = true; }
    (t.assignees || []).forEach(n => { if (!people.includes(n)) { people.push(n); changed = true; } });
    if (changed) await ref.set({ projects, people, rubros });
    await db.collection(`${root}/tasks`).add({
      emoji: '📌', text, assignees: Array.isArray(t.assignees) ? t.assignees : [], toolsList: [],
      project: t.project || '', rubro: t.rubro || '', status: 'pending', order: Date.now(), peopleNeeded: 1,
      notes: '', photos: [], shopping: (Array.isArray(t.shopping) ? t.shopping : []).map(x => String(x).trim()).filter(Boolean).map(x => ({ id: crypto.randomUUID(), text: x, bought: false })), subtasks: [], toolsChecked: {}, highPriority: !!t.highPriority,
      todayDate: '', dueDate: t.dueDate || '', dueTime: t.dueDate ? (t.dueTime || '') : '', calendarEventId: '',
    });
    return { ok: true };
  } catch (e) { return { error: 'No se pudo guardar: ' + e.message }; }
});

ipcMain.on('hide', () => win && win.hide());
ipcMain.on('open-web', () => require('electron').shell.openExternal('https://pasto18.github.io/tareas/'));

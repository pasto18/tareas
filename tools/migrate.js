// Migración única: copia las tareas, listas y fotos del dueño de la estructura antigua
// (tasks/, settings/lists, tasks/{id}/foto) a la nueva (users/{uid}/...).
//
//   cd desktop && npm install            (ya instala firebase-admin)
//   node ../tools/migrate.js             (simulación: solo cuenta lo que haría)
//   node ../tools/migrate.js --apply     (copia de verdad; NO borra lo antiguo)
//   node ../tools/migrate.js --apply --delete-old   (tras comprobar que todo está bien)
//
// Necesita desktop/serviceAccount.json (la misma clave de servicio de la app de escritorio).
const path = require('path');
const crypto = require('crypto');
const admin = require(path.join(__dirname, '..', 'desktop', 'node_modules', 'firebase-admin'));

const OWNER_EMAIL = 'lisandromarq18@gmail.com';
const BUCKET = 'todo-346ec.firebasestorage.app';
const apply = process.argv.includes('--apply');
const deleteOld = process.argv.includes('--delete-old');

admin.initializeApp({
  credential: admin.credential.cert(require(path.join(__dirname, '..', 'desktop', 'serviceAccount.json'))),
  storageBucket: BUCKET,
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

const urlFor = (p, token) =>
  `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${encodeURIComponent(p)}?alt=media&token=${token}`;

async function movePhoto(photo, uid) {
  if (!photo.path || photo.path.startsWith(`users/${uid}/`)) return photo; // ya migrada
  const newPath = `users/${uid}/${photo.path}`;
  const token = crypto.randomUUID();
  if (apply) {
    await bucket.file(photo.path).copy(bucket.file(newPath));
    await bucket.file(newPath).setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
    if (deleteOld) await bucket.file(photo.path).delete().catch(() => {});
  }
  return { url: urlFor(newPath, token), path: newPath };
}

(async () => {
  const { uid } = await admin.auth().getUserByEmail(OWNER_EMAIL);
  console.log(`Dueño: ${OWNER_EMAIL} → uid ${uid}${apply ? '' : '  (SIMULACIÓN, usa --apply)'}`);

  const lists = await db.doc('settings/lists').get();
  if (lists.exists) {
    console.log('settings/lists → users/%s/settings/lists', uid);
    if (apply) await db.doc(`users/${uid}/settings/lists`).set(lists.data());
  }

  const snap = await db.collection('tasks').get();
  let photos = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const newPhotos = [];
    for (const p of data.photos || []) { newPhotos.push(await movePhoto(p, uid)); photos++; }
    if (apply) await db.doc(`users/${uid}/tasks/${d.id}`).set({ ...data, photos: newPhotos });
  }
  console.log(`${snap.size} tareas y ${photos} fotos ${apply ? 'copiadas' : 'por copiar'}.`);

  if (apply && deleteOld) {
    for (const d of snap.docs) await d.ref.delete();
    await db.doc('settings/lists').delete().catch(() => {});
    console.log('Datos antiguos borrados.');
  }
})().catch((e) => { console.error(e); process.exit(1); });

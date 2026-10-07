# Tareas (para ti y unos pocos amigos)

App estática (un solo `index.html`) + Firebase. Se publica con GitHub Pages.

## 1. Firebase (proyecto NUEVO)
1. Crea un proyecto en https://console.firebase.google.com
2. Activa **Firestore**, **Storage** y **Authentication**.
3. Authentication → Método de acceso → activa **Google** (elige tu email de soporte). Se entra con la cuenta de Google.
4. (sin usuarios que crear: entra quien esté en la lista de invitados, ver sección 3)
5. Authentication → Configuración → Dominios autorizados: añade `pasto18.github.io`.
6. Pega el contenido de `firestore.rules` en Firestore → Reglas, y el de `storage.rules` en Storage → Reglas. Publica ambas.
7. Configuración del proyecto → Tus apps → Web: copia `firebaseConfig` y pégalo en `index.html` (sección "Configuración").

No hay clave en el código: el acceso es con Google. Las reglas son lo que protege los datos.

## 3. Invitar amigos
Cada persona tiene sus datos separados en `users/{uid}/...` (Firestore y Storage); las reglas impiden que otra cuenta los lea.
Para dar acceso a alguien:
1. Firebase → Firestore → colección **`allowed`** (créala la primera vez) → *Añadir documento*.
2. **ID del documento = su email completo en minúsculas** (p. ej. `ana@gmail.com`). Los campos pueden estar vacíos.
3. Pásale el enlace `https://pasto18.github.io/tareas/`. Entra con "Entrar con Google" y empieza con listas vacías.

Para quitar el acceso, borra ese documento: deja de poder leer y escribir al instante.
Solo tú (dueño) estás siempre permitido, sin documento. Ojo: como dueño del proyecto puedes ver los datos en la consola de Firebase.

**Si Storage da "permission denied" por la lista de invitados:** las reglas de Storage consultan Firestore; al publicarlas
desde la consola, Firebase pide/otorga el permiso solo. Si no, en Google Cloud → IAM da a la cuenta
`service-<NÚMERO>@gcp-sa-firebasestorage.iam.gserviceaccount.com` el rol *Firebase Rules Firestore Service Agent*.

**Fotos:** se comprimen en el navegador (WebP, máx. 1280 px, ~100 KB) y las reglas rechazan archivos de más de 400 KB. Máx. 10 fotos por tarea.

## 4. Migrar tus datos existentes (una sola vez)
Las tareas antiguas están en `tasks/` y `settings/lists`; la app nueva lee `users/{tu-uid}/...`.
1. `cd desktop && npm install` y deja `desktop/serviceAccount.json` (ver desktop/README.md).
2. `node tools/migrate.js` → simulación. Si cuadra: `node tools/migrate.js --apply` (copia tareas, listas y fotos, no borra nada).
3. Comprueba la web. Cuando todo esté bien: `node tools/migrate.js --apply --delete-old`.
4. Publica las reglas nuevas (`firestore.rules`, `storage.rules`) **después** de migrar (o a la vez que publicas la web).

## 2. Google Calendar (opcional, ya preparado)
1. https://console.cloud.google.com → proyecto (puede ser el mismo de Firebase) → activa **Google Calendar API**.
2. Pantalla de consentimiento OAuth: tipo Externo, modo "Testing", añade tu Gmail **y los de tus amigos que quieran Calendar** como usuarios de prueba (máx. 100). Cada uno conecta su propio calendario; quien no esté en esa lista solo verá un error al sincronizar, el resto de la app funciona.
3. Credenciales → ID de cliente OAuth → **Aplicación web**. Orígenes autorizados: `https://pasto18.github.io` (y `http://localhost:5500` para probar).
4. Pega el Client ID en `CALENDAR.clientId` dentro de `index.html`.

Las tareas con fecha (y hora opcional) crean un evento en su calendario principal. "Planear día" no genera eventos.

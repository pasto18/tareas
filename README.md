# Tareas (uso personal)

App estática (un solo `index.html`) + Firebase. Se publica con GitHub Pages.

## 1. Firebase (proyecto NUEVO)
1. Crea un proyecto en https://console.firebase.google.com
2. Activa **Firestore**, **Storage** y **Authentication**.
3. Authentication → Método de acceso → activa **Google** (elige tu email de soporte). Ya no hay clave: se entra con la cuenta de Google.
4. (sin usuarios que crear: las reglas solo admiten `lisandromarq18@gmail.com`)
5. Authentication → Configuración → Dominios autorizados: añade `pasto18.github.io`.
6. Pega el contenido de `firestore.rules` en Firestore → Reglas, y el de `storage.rules` en Storage → Reglas. Publica ambas.
7. Configuración del proyecto → Tus apps → Web: copia `firebaseConfig` y pégalo en `index.html` (sección "Configuración").

No hay clave en el código: el acceso es con Google. Las reglas son lo que protege los datos.

## 2. Google Calendar (opcional, ya preparado)
1. https://console.cloud.google.com → proyecto (puede ser el mismo de Firebase) → activa **Google Calendar API**.
2. Pantalla de consentimiento OAuth: tipo Externo, modo "Testing", añade tu Gmail como usuario de prueba.
3. Credenciales → ID de cliente OAuth → **Aplicación web**. Orígenes autorizados: `https://pasto18.github.io` (y `http://localhost:5500` para probar).
4. Pega el Client ID en `CALENDAR.clientId` dentro de `index.html`.

Las tareas con fecha (y hora opcional) crean un evento en tu calendario principal. "Planear día" no genera eventos.

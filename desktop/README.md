# Tareas · barra de menú (Mac)

Icono "+" junto al reloj. Un clic abre un formulario y la tarea se guarda en el mismo Firestore que la web.
No hay login: usa una clave de servicio que solo vive en este Mac.

## Instalación
1. Firebase → Configuración del proyecto → **Cuentas de servicio** → *Generar nueva clave privada*.
2. Guarda el archivo JSON como `desktop/serviceAccount.json` (está en .gitignore; NO lo subas ni lo compartas).
3. `cd desktop && npm install && npm start`
4. Arranca solo al iniciar sesión en el Mac (se configura en la primera ejecución).

Limitación: las tareas con fecha creadas desde aquí no pasan a Google Calendar hasta que se sincronicen desde la web.

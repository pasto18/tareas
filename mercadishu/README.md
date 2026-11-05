# Mercadishu · tablero de producción

Variante de la app **Tareas** (mismo diseño, mismo `index.html` único + Firebase) pensada para organizar
**El Mercadi$hu** (sáb 12 dic 2026, Domestic Data Streamers + fiesta en el Pumarejo).

## Qué cambia respecto a la plantilla
| Plantilla "Tareas" | Mercadishu |
|---|---|
| Agrupa por **proyecto** | Agrupa por **sector**: Espacio (Domestic), Puestos y zonas, Actividades, Patio y radio, Fiesta Pumarejo, Comunicación y diseño, Limpieza |
| **Rubro** (Casa/Trabajo/Otros) | **Tipo de tarea**: Gestión, Contactar, Diseño, Producción, Compras |
| "Asignada a" oculto | **Responsable** visible: Octavi, Lisi, Anita, Mateu (editable) |
| Datos separados por usuario (`users/{uid}`) | **Tablero compartido** (`boards/mercadishu`): todos ven y editan lo mismo |
| Lista de invitados `allowed` | `mercadishu_allowed` (ids = email en minúsculas) |
| Cabecera con fecha | + cuenta atrás hasta el 12 dic |

La primera vez que alguien entra, se cargan solas las **32 tareas de la reunión** (ver `SEED_TASKS` en `index.html`):
fechas clave (fotos 11 nov, cartel 12 nov, mercadillo y fiesta 12 dic, limpieza 13 dic), responsables según el
reparto, y "sin responsable" para lo que quedó en el aire. Los ids son fijos (`seed-01`…), no se duplican.

## Puesta en marcha
1. Usa el mismo proyecto de Firebase de `Tareas` (la config ya está en `index.html`) o uno nuevo y pega su `firebaseConfig`.
2. Publica `firestore.rules` y `storage.rules` de esta carpeta (incluyen también las reglas de Tareas, no las rompen).
3. Añade al equipo: Firestore → colección **`mercadishu_allowed`** → documento con ID = email de cada persona.
4. Sube esta carpeta como repo propio y activa GitHub Pages; añade el dominio en Authentication → Dominios autorizados.

## Cómo cambiar sectores, tipos o personas
Desde cualquier tarea → chips de *Sector*, *Tipo de tarea* y *Responsable* (`+ Sector`, `Borrar sectores`…).
Los valores iniciales están en `DEFAULT_PROJECTS`, `DEFAULT_RUBROS` y `DEFAULT_PEOPLE` y solo se usan la primera vez.

# Paquete de Clase 6 — actualización

Esta es una traducción. El original está en ../UPDATE.md. Cuando hay discrepancias, el inglés es correcto.

Other languages: [Español](UPDATE.es.md) · [Português](UPDATE.pt.md) · [Italiano](UPDATE.it.md) · [हिन्दी](UPDATE.hi.md) · [اردو](UPDATE.ur.md) · [ไทย](UPDATE.th.md) · [English](../UPDATE.md)

**Este paquete ha sido ejecutado de inicio a fin en una máquina Debian 13 limpia, y una versión nueva de graphify rompió tres cosas de la versión anterior. Las tres están arregladas aquí.**

---

## La forma más rápida de instalar esto

No tienes que leer el paquete primero. Pásale el zip a Claude Code y deja que haga el trabajo, incluyendo reparar lo que se rompa en tu máquina.

Pon el zip en una carpeta, abre Claude Code en esa carpeta, y pega esto:

```text
Read class-06-graph-pack.zip in this folder. Unzip it, read every file in it, and then
install it on this machine following PREWORK.md and prompts/P1-install.md.

Rules:
- Explain each step before you run it, and stop rather than guess.
- Never tell me a step passed unless you saw its output say so.
- This tool READS my documents. Do not modify my database, my workflows or my containers.
- Pass --backend=claude-cli explicitly on anything that uses a model. The free path is
  never selected for me automatically.
- If something fails, read the error, check TROUBLESHOOT.md, and fix it. Tell me what
  you changed and why.
- Finish by running verify.sh and reading me its output.
```

Esa es toda la instalación. Claude Code lee el paquete, golpea las trampas, y las resuelve mientras tú observas.

**Si se atasca en lo mismo dos veces, detente** y publica el comando exacto y el error exacto en la comunidad. La redacción de un error es el diagnóstico.

---

## Verificado en

| | |
|---|---|
| Sistema operativo | **Debian 13 (trixie)**, x86-64, sin GPU |
| Python | 3.13.5 |
| graphify | **0.9.62** (el paquete anterior fue medido contra 0.9.49) |
| Claude Code | 2.1.258, sesión iniciada |
| Ejecución | P1 a P4, de inicio a fin, en una máquina que ya ejecuta la pila de Clase 3 |

Lo que produjo en esa máquina:

| | |
|---|---|
| Pase estructural | 1.7 s · 69 nodos · 57 aristas · 12 comunidades · **0 tokens** |
| Rastro de auditoría | **100% EXTRAÍDO · 0% INFERIDO · 0% AMBIGUO** |
| Pase de nombres | 11.5 s · 58,301 entrada / 655 salida · **$0.00** |
| Gráfico sobre HTTP | **200 en 2.3 ms**, desde otra máquina en la red |
| `verify.sh` | **12 pasados · 0 fallidos** |

Tus números serán diferentes. Esos son un corpus en una máquina, no un objetivo.

---

## Qué cambió, y por qué

### 1. El pase de nombres se movió a su propio comando

graphify 0.9.62 ya no acepta `--backend` en `update`. Ejecuta el comando antiguo y obtienes:

```text
error: unknown update option: --backend
```

`--no-label` también se movió. La clase ahora usa:

```bash
graphify update <folder>                        # structure. still zero tokens
graphify label  <folder> --backend=claude-cli   # names. still free, still explicit
```

**La trampa de costo sobrevivió al cambio de nombre.** `label` detecta automáticamente un backend de tus claves de API exactamente como lo hacía `update`, y `claude-cli` sigue sin estar en la lista de detección. Si tienes una clave OpenRouter exportada como `OPENAI_API_KEY`, la detección automática la encuentra y toma la ruta de pago. Gratuito y pago se ven idénticos en pantalla. Pasa `--backend=claude-cli` cada vez.

Cada solicitud, diapositiva y página del paquete ahora dice `label`.

### 2. Instalar graphify no instala el servidor MCP que instala

P4 registra tu gráfico como un servidor MCP para que el cerebro pueda consultar su propia forma. En 0.9.62 ese paso murió en `claude mcp list` con **"Failed to connect"** y sin otra pista.

La causa: `pip install graphifyy` pone el ejecutable `graphify-mcp` en tu PATH **sin la biblioteca que importa para servir**. Así que `which graphify-mcp` lo encuentra. Peor aún:

```bash
graphify-mcp --help     # prints usage on a machine where the server cannot start
```

Imprime el uso porque el analizador de argumentos se ejecuta antes de que lo haga la importación. Es una verificación que no puede fallar, lo que significa que no es una verificación — la misma lección que esta clase ha enseñado ahora tres veces, y esta vez fue nuestro propio script.

La corrección es una línea, y está en P4:

```bash
pip install "graphifyy[mcp]"
```

`verify.sh` ahora importa el módulo con el propio intérprete del venv en lugar de confiar en `--help`.

### 3. El gráfico se renderizó como una página en blanco mientras el servidor retornaba 200

Este es el serio, y es la razón por la que existe esta actualización.

graphify 0.9.62 escribe un hash de **`integrity`** en la etiqueta script que carga la biblioteca de visualización desde un CDN. `vendor-vis.sh` reapuntó el `src` a tu copia local y dejó ese hash atrás. El hash pertenece a una compilación diferente de la biblioteca, así que el navegador se negó a ejecutar el archivo que acababa de descargar, y la página no dibujó nada.

Cada verificación que la clase te enseñó aún pasó:

| Verificación | Dijo |
|---|---|
| `grep -o 'src="..."'` | una ruta local, sin URLs |
| `ls -l vis-network.min.js` | 652,000 bytes |
| `head -c 100 vis-network.min.js` | JavaScript, no una página de error |
| `curl -o /dev/null -w "%{http_code}"` | **200** |

La única evidencia en cualquier lugar era una línea en la consola del navegador: `vis is not defined`.

`vendor-vis.sh` ahora hace un hash del archivo que realmente descargó, escribe ese hash, elimina `crossorigin`, y **se niega a terminar** si un hash que no escribió sobrevive. Fue probado después en un navegador real: los nodos están en el lienzo, y la página hace **dos solicitudes de red, ambas a tu propia máquina** — que es la afirmación sin conexión probada en lugar de aseverada.

**Si ya construiste un gráfico con el script antiguo, vuelve a ejecutar el nuevo `vendor-vis.sh`.**
Tu página puede estar en blanco por esta razón y nada te lo habrá dicho.

---

## También vale la pena saber

`TROUBLESHOOT.md` tiene tres nuevas entradas: el error `unknown update option`, el `Failed to connect` en MCP, y la página en blanco que retorna 200.

**Vuelve a ejecutar `vendor-vis.sh` después de cada `graphify update`.** Reconstruir el gráfico reescribe la página y el enlace del CDN regresa. Tu página sin conexión silenciosamente se convierte en una página en línea, y te enteras en algún lugar sin internet, que es exactamente cuando la querías.

El gráfico es una **instantánea**. No se actualiza cuando añades un documento. Un gráfico obsoleto no genera error — contesta, confiadamente, sobre documentos que has cambiado desde entonces.

---

## Atribución, sin cambios

graphify es **Apache-2.0**, de `Graphify-Labs/graphify`, y la atribución es una condición de esa licencia en lugar de una cortesía. Se envía en `ATTRIBUTION.md`. Léelo. La clase enseña que tu cerebro debe ser navegable; graphify es una implementación de eso, no el tema.

---

*The Brain That Runs a Company — Class 6. AI Auto Base. Created by Hector Diaz, founder of Orbix Automation Solutions.*

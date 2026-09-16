# Pacchetto Classe 6 — aggiornamento

Questa è una traduzione. L'originale è in ../UPDATE.md. Quando ci sono discrepanze, l'inglese è corretto.

Other languages: [Español](UPDATE.es.md) · [Português](UPDATE.pt.md) · [Italiano](UPDATE.it.md) · [हिन्दी](UPDATE.hi.md) · [اردو](UPDATE.ur.md) · [ไทย](UPDATE.th.md) · [English](../UPDATE.md)

**Questo pacchetto è stato eseguito da capo a fondo su una macchina Debian 13 pulita, e una nuova versione di graphify ha rotto tre cose della versione precedente. Tutte e tre sono risolte qui.**

---

## Il modo più veloce per installare questo

Non devi leggere il pacchetto per primo. Passa lo zip a Claude Code e lascia che faccia il lavoro, inclusa la correzione di qualsiasi cosa si rompa sulla tua macchina.

Metti lo zip in una cartella, apri Claude Code in quella cartella, e incolla questo:

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

Questa è l'intera installazione. Claude Code legge il pacchetto, incontra le trappole, e le affronta mentre guardi.

**Se rimane bloccato sulla stessa cosa due volte, fermalo** e pubblica il comando esatto e l'errore esatto nella comunità. La formulazione di un errore è la diagnosi.

---

## Verificato su

| | |
|---|---|
| Sistema operativo | **Debian 13 (trixie)**, x86-64, senza GPU |
| Python | 3.13.5 |
| graphify | **0.9.62** (il pacchetto precedente è stato misurato contro 0.9.49) |
| Claude Code | 2.1.258, connesso |
| Esecuzione | da P1 a P4, da capo a fondo, su una macchina già in esecuzione dello stack di Classe 3 |

Cosa ha prodotto su quella macchina:

| | |
|---|---|
| Passaggio strutturale | 1.7 s · 69 nodi · 57 archi · 12 comunità · **0 token** |
| Traccia di controllo | **100% ESTRATTO · 0% INFERITO · 0% AMBIGUO** |
| Passaggio di denominazione | 11.5 s · 58,301 in / 655 out · **$0.00** |
| Grafico su HTTP | **200 in 2.3 ms**, da una macchina diversa sulla rete |
| `verify.sh` | **12 superati · 0 falliti** |

I tuoi numeri saranno diversi. Questi sono un corpus su una macchina, non un obiettivo.

---

## Cosa è cambiato, e perché

### 1. Il passaggio di denominazione si è spostato nel suo comando

graphify 0.9.62 non accetta più `--backend` su `update`. Esegui il comando precedente e ottieni:

```text
error: unknown update option: --backend
```

`--no-label` si è spostato anche questo. La classe ora utilizza:

```bash
graphify update <folder>                        # structure. still zero tokens
graphify label  <folder> --backend=claude-cli   # names. still free, still explicit
```

**La trappola del costo ha resistito alla ridenominazione.** `label` rileva automaticamente un backend dalle tue chiavi API esattamente come faceva `update`, e `claude-cli` non è ancora nell'elenco di rilevazione. Se hai una chiave OpenRouter esportata come `OPENAI_API_KEY`, il rilevamento automatico la trova e prende il percorso a pagamento. Gratuito e a pagamento sembrano identici sullo schermo. Passa `--backend=claude-cli` ogni volta.

Ogni prompt, diapositiva e pagina nel pacchetto ora dice `label`.

### 2. L'installazione di graphify non installa il server MCP che installa

P4 registra il tuo grafico come server MCP in modo che il cervello possa interrogare la sua stessa forma. Su 0.9.62 quel passaggio è morto in `claude mcp list` con **"Failed to connect"** e nessun altro indizio.

La causa: `pip install graphifyy` mette l'eseguibile `graphify-mcp` sul tuo PATH **senza la libreria che importa per servire**. Quindi `which graphify-mcp` lo trova. Peggio ancora:

```bash
graphify-mcp --help     # prints usage on a machine where the server cannot start
```

Stampa l'uso perché il parser degli argomenti viene eseguito prima di quello dell'importazione. È un controllo che non può fallire, il che significa che non è un controllo — la stessa lezione che questa classe ha insegnato tre volte ormai, e questa volta era il nostro stesso script.

La correzione è una riga, ed è in P4:

```bash
pip install "graphifyy[mcp]"
```

`verify.sh` ora importa il modulo con l'interprete del venv stesso invece di fare affidamento su `--help`.

### 3. Il grafico è stato renderizzato come una pagina vuota mentre il server restituiva 200

Questo è quello serio, ed è il motivo per cui esiste questo aggiornamento.

graphify 0.9.62 scrive un hash **`integrity`** sul tag script che carica la libreria di visualizzazione da un CDN. `vendor-vis.sh` ha reinserito il `src` sulla tua copia locale e ha lasciato quell'hash dietro. L'hash appartiene a una build diversa della libreria, quindi il browser ha rifiutato di eseguire il file che aveva appena scaricato, e la pagina non ha disegnato nulla.

Ogni controllo che la classe ti ha insegnato è comunque passato:

| Controllo | Ha detto |
|---|---|
| `grep -o 'src="..."'` | un percorso locale, no URL |
| `ls -l vis-network.min.js` | 652,000 byte |
| `head -c 100 vis-network.min.js` | JavaScript, non una pagina di errore |
| `curl -o /dev/null -w "%{http_code}"` | **200** |

L'unica prova ovunque era una riga nella console del browser: `vis is not defined`.

`vendor-vis.sh` ora calcola l'hash del file che ha effettivamente scaricato, scrive quell'hash, elimina `crossorigin`, e **si rifiuta di terminare** se un hash che non ha scritto sopravvive. È stato testato successivamente in un vero browser: i nodi sono sulla tela, e la pagina effettua **due richieste di rete, entrambe sulla tua stessa macchina** — che è l'affermazione offline testata piuttosto che asserita.

**Se hai già costruito un grafico con il vecchio script, esegui di nuovo il nuovo `vendor-vis.sh`.**
La tua pagina potrebbe essere vuota per questo motivo e nulla te lo avrebbe detto.

---

## Anche degno di nota

`TROUBLESHOOT.md` ha tre nuove voci: l'errore `unknown update option`, il `Failed to connect` su MCP, e la pagina vuota che restituisce 200.

**Esegui di nuovo `vendor-vis.sh` dopo ogni `graphify update`.** La ricostruzione del grafico riscrive la pagina e il collegamento CDN ritorna. La tua pagina offline silenziosamente diventa una pagina online, e lo scopri da qualche parte senza internet, che è esattamente quando la volevi.

Il grafico è uno **snapshot**. Non si aggiorna quando aggiungi un documento. Un grafico obsoleto non genera errori — risponde, con fiducia, su documenti che hai cambiato nel frattempo.

---

## Attribuzione, invariata

graphify è **Apache-2.0**, da `Graphify-Labs/graphify`, e l'attribuzione è una condizione di quella licenza piuttosto che una cortesia. È incluso in `ATTRIBUTION.md`. Leggilo. La classe insegna che il tuo cervello dovrebbe essere navigabile; graphify è un'implementazione di questo, non l'argomento.

---

*The Brain That Runs a Company — Class 6. AI Auto Base. Created by Hector Diaz, founder of Orbix Automation Solutions.*

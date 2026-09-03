// ─────────────────────────────────────────────────────────────────────────────
// THE ONE LINE YOU EDIT.
//
// Where n8n is. Leave it alone if everything runs on this machine. Change it if
// your stack lives on another box - a NAS, a mini PC in the cupboard, a server -
// and you are opening this dashboard from your laptop.
//
//   same machine   →  http://localhost:5678
//   another box    →  http://192.168.1.50:5678   (its address, not localhost)
//
// "localhost" means *the machine the browser is on*. Point a laptop at localhost
// and it looks at the laptop, finds nothing, and the dashboard shows a connection
// error while n8n is perfectly healthy on the other machine. That mistake costs
// people an hour, every time.
// ─────────────────────────────────────────────────────────────────────────────
window.BRAIN_N8N = "http://localhost:5678";

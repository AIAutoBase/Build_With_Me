# Class 10 -- the five traps

Same order as `DECISIONS.md`. Each one: what you actually see first, what is really
going on, and what to do about it.

---

## 1. MinIO with no named volume

**Symptom.** You run `docker compose down -v` to clean up a stuck container, bring
everything back up, and MinIO reports healthy. Then you click on a file you uploaded
last week and the dashboard shows a broken preview, or the object endpoint returns a
404. Postgres still shows the row as `converted`, with a `chunk` full of text -- so
the first read is "the database is corrupted," not "the files are gone."

**Cause.** MinIO's data directory (`/data` inside the container) was never mapped to a
named volume. It lived in the container's writable layer, or in an anonymous volume
docker created and never labeled. `docker compose down -v` deletes every volume the
compose file declares, named or anonymous, and the container comes back up empty and
perfectly healthy -- there is no error, because from MinIO's point of view nothing
went wrong. It just has a fresh, empty `/data`.

**Fix.** Add a named volume in the compose file and mount it at `/data`:

    volumes:
      - brain_files_data:/data

Recreate the container once with this in place. Going forward, `docker compose down`
(no `-v`) stops and removes containers but leaves named volumes on disk -- that is the
command for routine cleanup. `docker compose down -v` is the one that deletes
`brain_files_data` along with everything else, and it should be treated the same way
you would treat `rm -rf` on a folder you have not backed up.

---

## 2. MinIO default credentials

**Symptom.** Nothing looks wrong. That is the entire trap. The console at `:9001`
logs in on the first try with `minioadmin` / `minioadmin` because that is what the
official quickstart tells you to type, and it works, so nobody comes back to change
it. Weeks later, if the port is ever published past loopback -- a reverse proxy, a
firewall rule opened for "just a minute," a cloud VM with a public IP -- the bucket is
reachable by anyone who has read the same quickstart you did.

**Cause.** `minioadmin` / `minioadmin` is not a weak default, it is a published one.
It is the first thing anyone scanning for open MinIO ports tries, because it is
printed in MinIO's own getting-started docs.

**Fix.** Set real values in `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` in `.env`
*before* the first `docker compose up` for this service -- `minio.compose.yml` ships
with no defaults for either, so the container refuses to start until you do. If the
container was already started once with the defaults, the root credentials are
already persisted to the backend; changing the `.env` values afterward does not
retroactively change them. In that case, rotate the admin account with the `mc`
client (`mc admin user` or the console's own credential rotation) before the port is
ever reachable from outside loopback -- do not just edit `.env` and assume it took
effect.

---

## 3. Accented filenames mangled at one of three layers

**Symptom.** A file named `Contrato Adquisicion.pdf` (with the accent on the last
"o") shows up in the dashboard as something like `Contrato AdquisiciÃ³n.pdf`, or a
search for the filename by name finds nothing even though the file is clearly there.
Downloading it may hand you back a name with a different kind of garbage in it than
what the dashboard displayed.

**Cause.** The filename passes through three layers that each have their own opinion
about text encoding: the browser's multipart upload, the body parser on the upload
endpoint, and -- if the filename is ever passed as an argument to a conversion tool --
the shell that invokes it. Each layer can assume UTF-8 where the previous one wrote
Latin-1, or vice versa, and the mangling compounds rather than cancels out.

**Fix.** This class sidesteps most of the damage by content-addressing the object
(the storage key is the sha256 of the bytes, not the filename), so the file itself is
never corrupted -- only its display name is. Store the original filename as a
separate metadata field, normalized to UTF-8 NFC on the way in, and never pass a raw
filename as a shell argument to a converter; pass the file by its content-addressed
path or through stdin instead. If a name already landed mangled in the database, it
can be re-derived from the object's stored metadata or re-entered by hand -- the
bytes were never at risk, only the label was.

---

## 4. The body parser buffers a 200 MB upload

**Symptom.** A small PDF uploads instantly. A 200 MB video sits at the browser's
upload progress bar for a while and then the connection just drops -- no error
message that mentions size, no useful log line, sometimes the whole container
restarts. It gets worse, not better, if a second large upload starts while the first
is still going.

**Cause.** The default body parser (Express's built-in parser, or `multer` in memory
mode) reads the entire request body into RAM before your route handler ever runs.
A 200 MB file is 200 MB of process memory just to receive it, and two concurrent
uploads of that size can exceed the container's memory limit -- at which point the
Docker or Linux OOM killer terminates the process. From the outside this looks like
the server vanished mid-upload, because it did.

**Fix.** Stream the upload straight to disk or to object storage instead of
buffering it in memory (`multer.diskStorage`, or a streaming parser like `busboy`
piped directly to the MinIO client). Set an explicit maximum upload size and reject
oversized requests early, with an actual error that names the limit, rather than
letting the process run out of memory and say nothing.

---

## 5. Confident OCR garbage

**Symptom.** You ask the brain a question and it answers fluently, cites a source,
and gets a number wrong -- an invoice total, a date, an account number. Nothing in
the answer or the search result hints that anything is off. It reads exactly like
every other correct answer.

**Cause.** OCR on a low-quality scan (a bad fax, a phone photo at an angle, a
low-resolution scan) can produce text that is grammatically fluent and visually
plausible while being factually wrong -- a `3` read as an `8`, a `1` read as a `7`.
That text gets embedded and stored the same way clean, extracted text does, with
nothing to distinguish it downstream.

**Fix.** Store the OCR engine's confidence score alongside every OCR-derived chunk,
and show a visible marker in the UI anywhere that chunk surfaces -- in search results
and in any answer that cites it. The point is not to hide low-confidence OCR (an
`unsupported` file is a valid, honest state; a silently-omitted one is not) -- it is
to make sure a member reading an answer can tell "this came from clean text" apart
from "this came from a scan and might be wrong," every time, without having to ask.

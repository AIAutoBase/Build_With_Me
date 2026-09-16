# แพ็ก Class 6 — อัปเดต

นี่คือคำแปล ต้นฉบับภาษาอังกฤษอยู่ที่ [`../UPDATE.md`](../UPDATE.md) หากมีความขัดแย้งกัน ให้ยึดตามภาษาอังกฤษเป็นหลัก

Other languages: [Español](UPDATE.es.md) · [Português](UPDATE.pt.md) · [Italiano](UPDATE.it.md) · [हिन्दी](UPDATE.hi.md) · [اردو](UPDATE.ur.md) · [ไทย](UPDATE.th.md) · [English](../UPDATE.md)

**แพ็กนี้ถูกรันตั้งแต่ต้นจนจบบนเครื่อง Debian 13 ที่ติดตั้งใหม่ และมีสามจุดในเวอร์ชันก่อนหน้าที่พังเพราะ graphify เวอร์ชันใหม่ ทั้งสามจุดถูกแก้ไขแล้วในที่นี้**

---

## วิธีติดตั้งที่เร็วที่สุด

คุณไม่จำเป็นต้องอ่านแพ็กก่อน ส่งไฟล์ zip ให้ Claude Code แล้วปล่อยให้มันทำงานให้ ซึ่งรวมถึงการแก้ไขอะไรก็ตามที่พังบนเครื่องของคุณด้วย

วางไฟล์ zip ไว้ในโฟลเดอร์ เปิด Claude Code ในโฟลเดอร์นั้น แล้ววางข้อความนี้:

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

แค่นั้นคือการติดตั้งทั้งหมด Claude Code จะอ่านแพ็ก เจอกับดักต่างๆ แล้วแก้ไขไปทีละอย่างโดยมีคุณดูอยู่

**ถ้ามันติดที่เรื่องเดิมสองครั้ง ให้หยุดมันไว้** แล้วโพสต์คำสั่งที่ใช้จริงกับข้อความ error ที่เกิดขึ้นจริงในคอมมูนิตี้ ถ้อยคำของ error คือคำวินิจฉัยนั่นเอง

---

## ทดสอบแล้วบน

| | |
|---|---|
| ระบบปฏิบัติการ | **Debian 13 (trixie)**, x86-64, ไม่มี GPU |
| Python | 3.13.5 |
| graphify | **0.9.62** (แพ็กเวอร์ชันก่อนหน้าวัดผลกับ 0.9.49) |
| Claude Code | 2.1.258, ล็อกอินแล้ว |
| การรัน | P1 ถึง P4 แบบครบวงจร บนเครื่องที่รัน Class 3 stack อยู่แล้ว |

สิ่งที่มันได้ผลลัพธ์ออกมาบนเครื่องนั้น:

| | |
|---|---|
| รอบโครงสร้าง | 1.7 s · 69 โหนด · 57 เอดจ์ · 12 ชุมชน · **0 โทเคน** |
| Audit trail | **100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS** |
| รอบตั้งชื่อ | 11.5 s · 58,301 รับเข้า / 655 ส่งออก · **$0.00** |
| กราฟผ่าน HTTP | **200 ใน 2.3 ms** จากเครื่องอื่นในเครือข่าย |
| `verify.sh` | **12 ผ่าน · 0 ล้มเหลว** |

ตัวเลขของคุณจะไม่เหมือนกัน นี่คือผลจากคลังเอกสารชุดหนึ่งบนเครื่องเครื่องหนึ่งเท่านั้น ไม่ใช่เป้าหมายที่ต้องทำให้ได้

---

## มีอะไรเปลี่ยนไปบ้าง และทำไม

### 1. รอบตั้งชื่อย้ายไปเป็นคำสั่งของตัวเอง

graphify 0.9.62 ไม่รับ `--backend` บน `update` อีกต่อไป ถ้ารันคำสั่งเก่า คุณจะได้:

```text
error: unknown update option: --backend
```

`--no-label` ก็ย้ายเหมือนกัน ตอนนี้คลาสใช้:

```bash
graphify update <folder>                        # structure. still zero tokens
graphify label  <folder> --backend=claude-cli   # names. still free, still explicit
```

**กับดักเรื่องค่าใช้จ่ายยังอยู่เหมือนเดิมแม้เปลี่ยนชื่อคำสั่งแล้ว** `label` ตรวจจับ backend อัตโนมัติจาก API key ของคุณเหมือนที่ `update` เคยทำ และ `claude-cli` ก็ยังไม่อยู่ในรายการที่ตรวจจับได้ ถ้าคุณมี OpenRouter key ที่ export ไว้เป็น `OPENAI_API_KEY` ระบบตรวจจับอัตโนมัติจะเจอมันแล้วใช้เส้นทางที่เสียเงิน ฟรีกับเสียเงินหน้าตาเหมือนกันทุกอย่างบนหน้าจอ ให้ใส่ `--backend=claude-cli` ทุกครั้ง

ทุก prompt สไลด์ และหน้าในแพ็กตอนนี้ใช้คำว่า `label`

### 2. ติดตั้ง graphify แล้ว ไม่ได้แปลว่า MCP server ที่มันติดตั้งมาจะใช้งานได้

P4 ลงทะเบียนกราฟของคุณเป็น MCP server เพื่อให้ brain สามารถสืบค้นรูปร่างของตัวเองได้ บน 0.9.62 ขั้นตอนนี้ตายที่ `claude mcp list` พร้อมข้อความ **"Failed to connect"** โดยไม่มีเบาะแสอื่นใดเลย

สาเหตุ: `pip install graphifyy` วาง executable `graphify-mcp` ไว้บน PATH ของคุณ **โดยไม่มีไลบรารีที่มันต้อง import เพื่อให้บริการ** ดังนั้น `which graphify-mcp` จะเจอมัน แย่ไปกว่านั้น:

```bash
graphify-mcp --help     # prints usage on a machine where the server cannot start
```

มันพิมพ์วิธีใช้ออกมาเพราะตัว argument parser รันก่อนที่ import จะรัน มันคือการตรวจสอบที่ไม่มีทางล้มเหลว ซึ่งแปลว่ามันไม่ใช่การตรวจสอบเลย — บทเรียนเดียวกันนี้คลาสนี้สอนมาแล้วสามครั้ง และครั้งนี้มันคือสคริปต์ของเราเอง

วิธีแก้คือบรรทัดเดียว และมันอยู่ใน P4:

```bash
pip install "graphifyy[mcp]"
```

`verify.sh` ตอนนี้ import module ด้วย interpreter ของ venv เองแทนที่จะเชื่อ `--help`

### 3. กราฟแสดงเป็นหน้าว่างเปล่าทั้งที่ server ส่งกลับ 200

นี่คือเรื่องที่ร้ายแรงที่สุด และเป็นเหตุผลที่การอัปเดตนี้มีอยู่

graphify 0.9.62 เขียน **hash `integrity`** ลงบน script tag ที่โหลดไลบรารี visualisation จาก CDN `vendor-vis.sh` เปลี่ยน `src` ให้ชี้ไปที่สำเนาในเครื่องของคุณ แต่ปล่อย hash เดิมทิ้งไว้ hash นั้นเป็นของไลบรารีคนละ build กัน เบราว์เซอร์จึงปฏิเสธที่จะรันไฟล์ที่เพิ่งดาวน์โหลดมา และหน้าเว็บก็ไม่วาดอะไรเลย

ทุกการตรวจสอบที่คลาสสอนคุณยังคงผ่านหมด:

| Check | ผลลัพธ์ |
|---|---|
| `grep -o 'src="..."'` | path ในเครื่องหนึ่งเดียว ไม่มี URL |
| `ls -l vis-network.min.js` | 652,000 ไบต์ |
| `head -c 100 vis-network.min.js` | เป็น JavaScript ไม่ใช่หน้า error |
| `curl -o /dev/null -w "%{http_code}"` | **200** |

หลักฐานเดียวที่มีอยู่คือบรรทัดเดียวใน browser console: `vis is not defined`

ตอนนี้ `vendor-vis.sh` จะ hash ไฟล์ที่มันดาวน์โหลดมาจริงๆ เขียน hash นั้นลงไป ตัด `crossorigin` ออก และ **จะปฏิเสธไม่ทำงานจนจบ** ถ้ามี hash ที่มันไม่ได้เขียนเองหลงเหลืออยู่ หลังจากนั้นมีการทดสอบในเบราว์เซอร์จริง: โหนดปรากฏอยู่บน canvas และหน้าเว็บสร้าง **network request สองครั้ง ทั้งคู่ไปที่เครื่องของคุณเอง** — นี่คือการอ้างว่าออฟไลน์ที่ผ่านการทดสอบจริง ไม่ใช่แค่พูดลอยๆ

**ถ้าคุณสร้างกราฟด้วยสคริปต์เก่าไปแล้ว ให้รัน `vendor-vis.sh` เวอร์ชันใหม่ซ้ำอีกครั้ง** หน้าของคุณอาจว่างเปล่าด้วยเหตุผลนี้ โดยที่ไม่มีอะไรบอกคุณเลย

---

## เรื่องอื่นที่ควรรู้ไว้ด้วย

`TROUBLESHOOT.md` มีหัวข้อใหม่สามหัวข้อ: error `unknown update option`, `Failed to connect` บน MCP, และหน้าว่างเปล่าที่คืนค่า 200

**รัน `vendor-vis.sh` ซ้ำทุกครั้งหลัง `graphify update`** การสร้างกราฟใหม่จะเขียนหน้าเว็บทับ และลิงก์ CDN จะกลับมาอีกครั้ง หน้าออฟไลน์ของคุณจะกลายเป็นหน้าออนไลน์แบบเงียบๆ แล้วคุณจะมารู้ตัวตอนอยู่ในที่ที่ไม่มีอินเทอร์เน็ต ซึ่งเป็นจังหวะที่เหมาะเจาะที่สุดพอดี

กราฟคือ **snapshot** มันไม่อัปเดตเมื่อคุณเพิ่มเอกสารใหม่ กราฟที่เก่าแล้วไม่ error — มันตอบคำถามอย่างมั่นใจ เกี่ยวกับเอกสารที่คุณเปลี่ยนไปแล้วตั้งแต่นั้น

---

## การให้เครดิต ไม่มีอะไรเปลี่ยน

graphify เป็น **Apache-2.0** จาก `Graphify-Labs/graphify` และการให้เครดิตเป็นเงื่อนไขของสัญญาอนุญาตนั้น ไม่ใช่แค่มารยาท มันมาพร้อมกับ `ATTRIBUTION.md` อ่านมันซะ คลาสนี้สอนว่า brain ของคุณควรจะนำทางได้ (navigable) graphify เป็นแค่การนำไปใช้งานอย่างหนึ่งของแนวคิดนั้น ไม่ใช่ตัวเนื้อหาหลัก

---

*The Brain That Runs a Company — Class 6. AI Auto Base. สร้างโดย Hector Diaz ผู้ก่อตั้ง Orbix Automation Solutions*

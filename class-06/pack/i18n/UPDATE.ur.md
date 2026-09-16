# کلاس 6 پیک — اپڈیٹ

یہ صفحہ اس کا ترجمہ ہے۔ اصل انگریزی دستاویز [`../UPDATE.md`](../UPDATE.md) میں ہے۔ جہاں ترجمہ اور انگریزی میں فرق ہو، وہاں انگریزی درست مانی جائے گی۔

Other languages: [Español](UPDATE.es.md) · [Português](UPDATE.pt.md) · [Italiano](UPDATE.it.md) · [हिन्दी](UPDATE.hi.md) · [اردو](UPDATE.ur.md) · [ไทย](UPDATE.th.md) · [English](../UPDATE.md)

**یہ پیک ایک صاف (clean) Debian 13 مشین پر شروع سے آخر تک چلایا جا چکا ہے، اور graphify کے ایک نئے ریلیز نے پچھلے ورژن میں تین چیزیں توڑ دی تھیں۔ یہاں تینوں ٹھیک کر دی گئی ہیں۔**

---

## اسے انسٹال کرنے کا سب سے تیز طریقہ

آپ کو پہلے پورا پیک پڑھنے کی ضرورت نہیں۔ zip فائل Claude Code کے حوالے کر دیں اور اسے کام کرنے دیں، جس میں آپ کی مشین پر جو کچھ بھی خراب ہو اسے ٹھیک کرنا بھی شامل ہے۔

zip کو ایک فولڈر میں رکھیں، اس فولڈر میں Claude Code کھولیں، اور یہ پیسٹ کریں:

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

بس یہی پورا انسٹال ہے۔ Claude Code پیک کو پڑھتا ہے، مسائل (traps) سے ٹکراتا ہے، اور آپ کی نگرانی میں انہیں حل کرتا ہے۔

**اگر یہ ایک ہی چیز پر دو بار اٹک جائے تو اسے روک دیں** اور کمیونٹی میں بالکل وہی کمانڈ اور بالکل وہی ایرر پوسٹ کریں۔ ایرر کے الفاظ ہی اس کی تشخیص ہیں۔

---

## جن چیزوں پر تصدیق کی گئی

| | |
|---|---|
| آپریٹنگ سسٹم | **Debian 13 (trixie)**, x86-64, GPU کے بغیر |
| Python | 3.13.5 |
| graphify | **0.9.62** (پچھلا پیک 0.9.49 کے مقابلے میں ماپا گیا تھا) |
| Claude Code | 2.1.258, سائن اِن |
| رن | P1 سے P4 تک، شروع سے آخر تک، ایسی مشین پر جس پر پہلے سے Class 3 اسٹیک چل رہا تھا |

اس مشین پر اس نے جو نتائج دیے:

| | |
|---|---|
| اسٹرکچرل پاس | 1.7 s · 69 نوڈز · 57 ایجز · 12 کمیونٹیز · **0 ٹوکنز** |
| آڈٹ ٹریل | **100% نکالا گیا · 0% اندازہ لگایا گیا · 0% غیر واضح** |
| نیمنگ پاس | 11.5 s · 58,301 ان پٹ / 655 آؤٹ پٹ · **$0.00** |
| HTTP پر گراف | **200, 2.3 ms میں**، نیٹ ورک پر کسی دوسری مشین سے |
| `verify.sh` | **12 پاس · 0 فیل** |

آپ کے نمبر مختلف ہوں گے۔ یہ صرف ایک کارپس پر، ایک مشین پر ملے نتائج ہیں، کوئی ہدف نہیں۔

---

## کیا بدلا، اور کیوں

### 1. نیمنگ پاس اب اپنے الگ کمانڈ میں چلا گیا

graphify 0.9.62 اب `update` پر `--backend` قبول نہیں کرتا۔ پرانا کمانڈ چلائیں گے تو یہ ملے گا:

```text
error: unknown update option: --backend
```

`--no-label` بھی ہٹ گیا۔ اب کلاس میں یہ استعمال ہوتا ہے:

```bash
graphify update <folder>                        # structure. still zero tokens
graphify label  <folder> --backend=claude-cli   # names. still free, still explicit
```

**نام بدلنے کے بعد بھی لاگت والا جال باقی رہا۔** `label` آپ کی API keys سے بیک اینڈ کو بالکل اسی طرح خودکار طور پر تلاش کرتا ہے جیسے پہلے `update` کرتا تھا، اور `claude-cli` اب بھی ڈیٹیکشن لسٹ میں شامل نہیں۔ اگر آپ کے پاس `OPENAI_API_KEY` کے نام سے ایکسپورٹ کی گئی OpenRouter key ہے، تو خودکار ڈیٹیکشن اسے ڈھونڈ لیتا ہے اور پیڈ (paid) راستہ اپنا لیتا ہے۔ اسکرین پر فری اور پیڈ بالکل ایک جیسے نظر آتے ہیں۔ ہر بار `--backend=claude-cli` ضرور دیں۔

پیک میں ہر prompt، سلائیڈ اور صفحہ اب `label` کہتا ہے۔

### 2. graphify انسٹال کرنے سے وہ MCP سرور انسٹال نہیں ہوتا جسے یہ خود انسٹال کرتا ہے

P4 آپ کے گراف کو MCP سرور کے طور پر رجسٹر کرتا ہے تاکہ brain اپنی خود کی ساخت (shape) کو کوئری کر سکے۔ 0.9.62 پر یہ مرحلہ `claude mcp list` پر **"Failed to connect"** کے ساتھ ناکام ہو جاتا تھا، اور کوئی اور سراغ نہیں ملتا تھا۔

وجہ: `pip install graphifyy` آپ کے PATH پر `graphify-mcp` executable تو رکھ دیتا ہے، **لیکن وہ لائبریری نہیں جسے یہ سرو کرنے کے لیے import کرتا ہے**۔ اس لیے `which graphify-mcp` اسے ڈھونڈ لیتا ہے۔ اور اس سے بھی بری بات:

```bash
graphify-mcp --help     # prints usage on a machine where the server cannot start
```

یہ usage اس لیے پرنٹ کرتا ہے کیونکہ argument parser، import سے پہلے چلتا ہے۔ یہ ایسا check ہے جو ناکام ہو ہی نہیں سکتا، یعنی یہ check ہے ہی نہیں — یہی سبق یہ کلاس اب تیسری بار سکھا چکی ہے، اور اس بار غلطی ہماری اپنی اسکرپٹ میں تھی۔

فکس صرف ایک لائن کا ہے، اور وہ P4 میں ہے:

```bash
pip install "graphifyy[mcp]"
```

`verify.sh` اب `--help` پر بھروسہ کرنے کے بجائے venv کے اپنے انٹرپریٹر سے ماڈیول import کرتا ہے۔

### 3. سرور نے 200 لوٹایا، پھر بھی گراف خالی صفحے کے طور پر دکھا

یہ والا سنجیدہ ہے، اور اسی وجہ سے یہ اپڈیٹ بنی ہے۔

graphify 0.9.62 اس script tag پر ایک **`integrity` hash** لکھتا ہے جو visualisation لائبریری کو CDN سے لوڈ کرتا ہے۔ `vendor-vis.sh` نے `src` کو آپ کی لوکل کاپی پر پوائنٹ کر دیا، لیکن وہ hash وہیں چھوڑ دیا۔ وہ hash لائبریری کے کسی اور بلڈ کا تھا، اس لیے براؤزر نے ابھی ابھی ڈاؤن لوڈ ہونے والی فائل چلانے سے انکار کر دیا، اور صفحے پر کچھ نہیں بنا۔

کلاس میں سکھایا گیا ہر check تب بھی پاس ہو رہا تھا:

| Check | کیا ملا |
|---|---|
| `grep -o 'src="..."'` | ایک لوکل پاتھ، کوئی URL نہیں |
| `ls -l vis-network.min.js` | 652,000 بائٹس |
| `head -c 100 vis-network.min.js` | JavaScript ہے، کوئی ایرر پیج نہیں |
| `curl -o /dev/null -w "%{http_code}"` | **200** |

کہیں بھی بس ایک ہی ثبوت تھا: براؤزر کنسول میں ایک لائن — `vis is not defined`۔

`vendor-vis.sh` اب جو فائل واقعی ڈاؤن لوڈ ہوئی اسی کا hash نکالتا ہے، وہی hash لکھتا ہے، `crossorigin` ہٹا دیتا ہے، اور اگر کوئی ایسا hash باقی رہ جائے جو اس نے خود نہیں لکھا، تو **مکمل ہونے سے انکار کر دیتا ہے**۔ اس کے بعد اسے حقیقی براؤزر میں ٹیسٹ کیا گیا: نوڈز canvas پر نظر آ رہے ہیں، اور صفحہ **دو نیٹ ورک ریکویسٹس بھیجتا ہے، دونوں آپ کی اپنی مشین کو** — یعنی 'آف لائن' کا دعویٰ صرف کہا نہیں گیا بلکہ ٹیسٹ کر کے دکھایا گیا۔

**اگر آپ نے پہلے ہی پرانی اسکرپٹ سے کوئی گراف بنا لیا ہے، تو نیا `vendor-vis.sh` دوبارہ چلائیں۔** ہو سکتا ہے آپ کا صفحہ اسی وجہ سے خالی ہو، اور کسی چیز نے آپ کو یہ بتایا بھی نہ ہو۔

---

## یہ بھی جان لیں

`TROUBLESHOOT.md` میں تین نئی انٹریاں ہیں: `unknown update option` ایرر، MCP پر آنے والا `Failed to connect`، اور وہ خالی صفحہ جو 200 لوٹاتا ہے۔

**ہر `graphify update` کے بعد `vendor-vis.sh` دوبارہ چلائیں۔** گراف کو دوبارہ بنانے پر صفحہ دوبارہ لکھا جاتا ہے اور CDN لنک واپس آ جاتا ہے۔ آپ کا آف لائن صفحہ خاموشی سے آن لائن صفحہ بن جاتا ہے، اور اس کا پتا آپ کو تب چلتا ہے جب آپ کہیں انٹرنیٹ کے بغیر ہوں — بالکل اسی وقت جب آپ کو اس کی سب سے زیادہ ضرورت تھی۔

گراف ایک **اسنیپ شاٹ** ہے۔ جب آپ کوئی دستاویز شامل کرتے ہیں تو یہ خود بخود اپڈیٹ نہیں ہوتا۔ پرانا (stale) گراف ایرر نہیں دیتا — یہ ان دستاویزات کے بارے میں بھی پورے اعتماد کے ساتھ جواب دیتا ہے جنہیں آپ بعد میں بدل چکے ہیں۔

---

## ایٹریبیوشن، ویسا ہی جیسا تھا

graphify **Apache-2.0** لائسنس کے تحت آتا ہے، `Graphify-Labs/graphify` سے، اور ایٹریبیوشن اس لائسنس کی شرط ہے، کوئی خوش اخلاقی نہیں۔ یہ `ATTRIBUTION.md` میں دیا گیا ہے۔ اسے پڑھیں۔ یہ کلاس سکھاتی ہے کہ آپ کا brain نیویگیبل ہونا چاہیے؛ graphify اس کا ایک نفاذ (implementation) ہے، موضوع نہیں۔

---

*The Brain That Runs a Company — Class 6. AI Auto Base. Hector Diaz نے بنایا، جو Orbix Automation Solutions کے فاؤنڈر ہیں۔*

# क्लास 6 पैक — अपडेट

यह इस पेज का अनुवाद है। मूल अंग्रेज़ी दस्तावेज़ [`../UPDATE.md`](../UPDATE.md) में है। जहाँ अनुवाद अंग्रेज़ी से अलग हो, वहाँ अंग्रेज़ी सही मानी जाएगी।

Other languages: [Español](UPDATE.es.md) · [Português](UPDATE.pt.md) · [Italiano](UPDATE.it.md) · [हिन्दी](UPDATE.hi.md) · [اردو](UPDATE.ur.md) · [ไทย](UPDATE.th.md) · [English](../UPDATE.md)

**यह पैक एक क्लीन Debian 13 मशीन पर शुरू से आख़िर तक चलाया जा चुका है, और graphify के एक नए रिलीज़ ने पिछले वर्शन में तीन चीज़ें तोड़ दी थीं। यहाँ तीनों ठीक कर दी गई हैं।**

---

## इसे इंस्टॉल करने का सबसे तेज़ तरीका

आपको पहले पूरा पैक पढ़ने की ज़रूरत नहीं है। zip फ़ाइल Claude Code को दे दें और उसे काम करने दें, जिसमें आपकी मशीन पर जो भी टूटे उसे ठीक करना भी शामिल है।

zip को एक फ़ोल्डर में रखें, उस फ़ोल्डर में Claude Code खोलें, और यह पेस्ट करें:

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

बस इतना ही पूरा इंस्टॉल है। Claude Code पैक को पढ़ता है, गड़बड़ियों (traps) से टकराता है, और आपकी निगरानी में उन्हें सुलझाता है।

**अगर यह एक ही चीज़ पर दो बार अटक जाए, तो इसे रोक दें** और कम्युनिटी में ठीक वही कमांड और ठीक वही एरर पोस्ट करें। एरर के शब्द ही उसका निदान हैं।

---

## इस पर वेरिफ़ाई किया गया

| | |
|---|---|
| ऑपरेटिंग सिस्टम | **Debian 13 (trixie)**, x86-64, GPU नहीं |
| Python | 3.13.5 |
| graphify | **0.9.62** (पिछला पैक 0.9.49 के मुक़ाबले मापा गया था) |
| Claude Code | 2.1.258, साइन-इन |
| रन | P1 से P4 तक, शुरू से आख़िर तक, ऐसी मशीन पर जिस पर पहले से Class 3 स्टैक चल रहा था |

उस मशीन पर इसने जो नतीजे दिए:

| | |
|---|---|
| स्ट्रक्चरल पास | 1.7 s · 69 नोड्स · 57 एज · 12 कम्युनिटी · **0 टोकन** |
| ऑडिट ट्रेल | **100% निकाला गया · 0% अनुमानित · 0% अस्पष्ट** |
| नेमिंग पास | 11.5 s · 58,301 इनपुट / 655 आउटपुट · **$0.00** |
| HTTP पर ग्राफ़ | **200, 2.3 ms में**, नेटवर्क पर किसी दूसरी मशीन से |
| `verify.sh` | **12 पास · 0 फ़ेल** |

आपके नंबर अलग होंगे। ये सिर्फ़ एक कॉर्पस पर, एक मशीन पर मिले नतीजे हैं, कोई लक्ष्य नहीं।

---

## क्या बदला, और क्यों

### 1. नेमिंग पास अब अपने अलग कमांड में चला गया

graphify 0.9.62 अब `update` पर `--backend` स्वीकार नहीं करता। पुराना कमांड चलाएँगे तो यह मिलेगा:

```text
error: unknown update option: --backend
```

`--no-label` भी हट गया। अब क्लास में यह इस्तेमाल होता है:

```bash
graphify update <folder>                        # structure. still zero tokens
graphify label  <folder> --backend=claude-cli   # names. still free, still explicit
```

**नाम बदलने के बाद भी लागत वाला जाल बचा रहा।** `label` आपकी API keys से बैकएंड को उसी तरह ऑटो-डिटेक्ट करता है जैसे पहले `update` करता था, और `claude-cli` अब भी डिटेक्शन लिस्ट में नहीं है। अगर आपके पास `OPENAI_API_KEY` के नाम से एक्सपोर्ट की गई OpenRouter key है, तो ऑटो-डिटेक्शन उसे ढूँढ लेता है और पेड रास्ता अपना लेता है। स्क्रीन पर फ्री और पेड बिल्कुल एक जैसे दिखते हैं। हर बार `--backend=claude-cli` ज़रूर दें।

पैक में हर prompt, स्लाइड और पेज अब `label` कहता है।

### 2. graphify इंस्टॉल करने पर वह MCP सर्वर इंस्टॉल नहीं होता जिसे यह ख़ुद इंस्टॉल करता है

P4 आपके ग्राफ़ को MCP सर्वर के रूप में रजिस्टर करता है ताकि brain अपनी ख़ुद की संरचना (shape) क्वेरी कर सके। 0.9.62 पर यह स्टेप `claude mcp list` पर **"Failed to connect"** के साथ मर जाता था, और कोई और सुराग नहीं मिलता था।

कारण: `pip install graphifyy` आपके PATH पर `graphify-mcp` executable तो डाल देता है, **लेकिन वह लाइब्रेरी नहीं जिसे यह सर्व करने के लिए import करता है**। इसलिए `which graphify-mcp` उसे ढूँढ लेता है। और बुरी बात:

```bash
graphify-mcp --help     # prints usage on a machine where the server cannot start
```

यह usage प्रिंट करता है क्योंकि argument parser, import से पहले चलता है। यह ऐसा check है जो फेल ही नहीं हो सकता, यानी यह check है ही नहीं — यही सबक यह क्लास अब तीसरी बार सिखा चुकी है, और इस बार गलती हमारी अपनी स्क्रिप्ट में थी।

फ़िक्स सिर्फ़ एक लाइन का है, और वह P4 में है:

```bash
pip install "graphifyy[mcp]"
```

`verify.sh` अब `--help` पर भरोसा करने के बजाय venv के अपने interpreter से मॉड्यूल import करता है।

### 3. सर्वर ने 200 लौटाया, फिर भी ग्राफ़ खाली पेज के रूप में दिखा

यह वाला गंभीर है, और इसी वजह से यह अपडेट बना है।

graphify 0.9.62 उस script tag पर एक **`integrity` hash** लिखता है जो visualisation लाइब्रेरी को CDN से लोड करता है। `vendor-vis.sh` ने `src` को आपकी लोकल कॉपी पर पॉइंट कर दिया, लेकिन वह hash वहीं छोड़ दिया। वह hash लाइब्रेरी के किसी और बिल्ड का था, इसलिए browser ने अभी-अभी डाउनलोड की गई फ़ाइल को चलाने से मना कर दिया, और पेज पर कुछ नहीं बना।

क्लास में सिखाया गया हर check तब भी पास हो रहा था:

| Check | क्या मिला |
|---|---|
| `grep -o 'src="..."'` | एक लोकल पाथ, कोई URL नहीं |
| `ls -l vis-network.min.js` | 652,000 बाइट्स |
| `head -c 100 vis-network.min.js` | JavaScript है, कोई एरर पेज नहीं |
| `curl -o /dev/null -w "%{http_code}"` | **200** |

कहीं भी बस एक ही सबूत था: browser console में एक लाइन — `vis is not defined`।

`vendor-vis.sh` अब जो फ़ाइल असल में डाउनलोड हुई उसी का hash निकालता है, वही hash लिखता है, `crossorigin` हटा देता है, और अगर कोई ऐसा hash बचा रह जाए जो इसने ख़ुद नहीं लिखा, तो **फिनिश होने से मना कर देता है**। इसके बाद इसे असली browser में टेस्ट किया गया: नोड्स canvas पर दिख रहे हैं, और पेज **दो नेटवर्क रिक्वेस्ट भेजता है, दोनों आपकी अपनी मशीन को** — यानी 'ऑफ़लाइन' का दावा सिर्फ़ कहा नहीं गया, टेस्ट करके दिखाया गया।

**अगर आपने पहले ही पुरानी स्क्रिप्ट से कोई ग्राफ़ बना लिया है, तो नया `vendor-vis.sh` दोबारा चलाएँ।** हो सकता है आपका पेज इसी वजह से खाली हो, और किसी चीज़ ने आपको यह बताया भी न हो।

---

## यह भी जान लें

`TROUBLESHOOT.md` में तीन नई एंट्री हैं: `unknown update option` एरर, MCP पर आने वाला `Failed to connect`, और वह खाली पेज जो 200 लौटाता है।

**हर `graphify update` के बाद `vendor-vis.sh` दोबारा चलाएँ।** ग्राफ़ को फिर से बनाने पर पेज दोबारा लिखा जाता है और CDN लिंक वापस आ जाता है। आपका ऑफ़लाइन पेज चुपचाप ऑनलाइन पेज बन जाता है, और इसका पता आपको तब चलता है जब आप कहीं बिना इंटरनेट के हों — ठीक उसी वक़्त जब आपको इसकी सबसे ज़्यादा ज़रूरत थी।

ग्राफ़ एक **स्नैपशॉट** है। जब आप कोई डॉक्यूमेंट जोड़ते हैं तो यह अपने आप अपडेट नहीं होता। पुराना (stale) ग्राफ़ error नहीं देता — यह उन डॉक्यूमेंट्स के बारे में भी पूरे भरोसे से जवाब देता है जिन्हें आप बाद में बदल चुके हैं।

---

## एट्रिब्यूशन, वैसा ही जैसा था

graphify **Apache-2.0** लाइसेंस के तहत आता है, `Graphify-Labs/graphify` से, और एट्रिब्यूशन उस लाइसेंस की शर्त है, कोई शिष्टाचार नहीं। यह `ATTRIBUTION.md` में दिया गया है। इसे पढ़ें। यह क्लास सिखाती है कि आपका brain नेविगेबल होना चाहिए; graphify उसका एक इम्प्लीमेंटेशन है, विषय नहीं।

---

*The Brain That Runs a Company — Class 6. AI Auto Base. Hector Diaz द्वारा बनाया गया, जो Orbix Automation Solutions के फ़ाउंडर हैं।*

# 05. Cheatsheet

## Run and deploy
| Do this | Command |
|---|---|
| Run locally | `npx wrangler pages dev .` then open http://localhost:8788 |
| Stop the server | `Ctrl+C` |
| Log in to Cloudflare | `npx wrangler login` |
| Deploy | `npx wrangler pages deploy . --project-name YOUR-NAME-business-card` |
| Set the secret key | `npx wrangler pages secret put GEMINI_API_KEY --project-name YOUR-NAME-business-card` |

## Git
| Do this | Command |
|---|---|
| Start tracking a folder | `git init -b main` |
| See what changed | `git status` |
| See the exact changes | `git diff` |
| Stage everything | `git add .` |
| Save a commit | `git commit -m "feat: what I did"` |
| Commit changes to tracked files | `git commit -am "fix: what I fixed"` |
| Name a release | `git tag v0.1.0` |
| List history | `git log --oneline` |
| List tags | `git tag` |
| Restore one file from a version | `git checkout v0.1.0 -- config.json` |

## Commit message prefixes
| Prefix | Meaning | Version bump |
|---|---|---|
| `feat:` | new feature | minor (0.1.0 → 0.2.0) |
| `fix:` | bug fix | patch (0.2.0 → 0.2.1) |
| `docs:` | text/docs only | patch |
| `feat!:` | breaking change | major (→ 1.0.0) |

## Files, in one line each
| File | Role |
|---|---|
| `config.json` | **Your** content. Edit this. |
| `app.js` | Reads the config and fills the pages |
| `index.html` / `about.html` / `chat.html` | The three pages |
| `style.css` | Look and feel |
| `functions/api/chat.js` | The server side of the chatbot (holds the key) |
| `.dev.vars` | Your secret key on your computer. **Never commit.** |
| `.gitignore` | Tells git what to ignore |

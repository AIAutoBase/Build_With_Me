# 01. Setup (do this BEFORE class, ~20 minutes)

## Checklist
- [ ] Node.js 20 or newer
- [ ] Git
- [ ] Claude Code
- [ ] A code editor (VS Code recommended)
- [ ] A free Cloudflare account
- [ ] A free Gemini API key

## 1. Node.js
Download the LTS version from https://nodejs.org and install it. Check:
```
node -v
```
You should see `v20` or higher.

## 2. Git
Install from https://git-scm.com. Check:
```
git --version
```
Tell git who you are (once):
```
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

## 3. Claude Code
Follow the official install page: https://claude.com/claude-code
Check that typing `claude` in a terminal opens it.

## 4. Cloudflare account (free)
Sign up at https://dash.cloudflare.com/sign-up. Confirm your email. You do not need to add a domain or a credit card.

## 5. Gemini API key (free)
1. Go to https://aistudio.google.com/apikey
2. Sign in with a Google account.
3. Click **Create API key**.
4. Copy it into a private note. **Treat it like a password.**

The free tier has a small daily limit. That is enough for class and testing.

## 6. Test everything
Open a terminal and run:
```
node -v
git --version
claude --version
```
All three should print a version. If one fails, fix it now, not during class.

## Folder for today
Create an empty folder called `my-business-card` somewhere easy (Desktop or Documents). Open the terminal inside that folder.

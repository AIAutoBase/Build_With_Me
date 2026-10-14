# blackcatmom - affiliate notes

**No earnings exist yet. Do not claim any.** Not in class, not on the site, not in posts.

## How the tag works

Every link carries `tag=YOURTAG-20`. That is your Amazon Associates tracking ID. When a visitor clicks and buys within Amazon's cookie window, the purchase can be credited to that tag. Without the tag, the click earns nothing. Remove the tag and the link still works, it just is not tracked.

Format used on the site:

```
https://www.amazon.com/s?k=feather+wand+cat+toy&tag=YOURTAG-20
```

In HTML, write the `&` as `&amp;` inside `href`. Browsers handle both, but `&amp;` is the valid form.

Check in your Associates account that `blackcatmom.com` is listed as one of your websites (Account settings > website and mobile app list). Add it if it is not.

## Amazon disclosure (required)

The Associates Program requires this exact sentence on the site, where people see it:

> As an Amazon Associate I earn from qualifying purchases.

The site shows it right above the shop links and again in the footer.

Other Amazon rules worth knowing:
- Do not show prices or star ratings you typed by hand. They go stale, and the program limits how product data is shown. The site shows none.
- Do not put affiliate links in emails or PDFs. Link to the site instead.
- Read the current Operating Agreement before you share links on social media. Rules change.
- New accounts must make qualifying sales within a set period after sign-up or the account can be closed. Check the current terms in your account.

## FTC disclosure (US)

The FTC wants affiliate relationships disclosed **clearly and close to the link**, in plain words, before the person clicks. A footer note alone is not enough on a page with links, which is why the site has both.

On social media: put `#ad` or "affiliate link" at the start of the caption, not buried in hashtags. Use the platform's paid partnership or branded content label when it applies.

## Why search links (no invented ASINs)

- An ASIN is Amazon's product ID. A made-up or misremembered ASIN sends people to a dead or wrong page.
- AI tools can invent ASINs that look real. Search links cannot point to a product that does not exist.
- A search link shows current, in-stock options. Nothing breaks when one product is discontinued.
- Trade-off: search pages convert less well than a single chosen product, and you do not control which items show. Fine for a launch.

## Swap to SiteStripe product links later

When you have picked specific products you actually trust:
1. Log in to Amazon Associates, then open the product page on amazon.com.
2. Use the **SiteStripe** bar at the top of the page (if your account shows it). Click **Get link > Text**.
3. Copy the link. It already has your tag (full link or short `amzn.to` link).
4. Ask Claude Code: "Replace the search link on the 'Feather wand toys' card with this product link: <link>. Keep rel=sponsored and target=_blank."
5. Re-check: every link still has your tag, the disclosure is still visible, health items still say "ask your vet".

If SiteStripe does not appear, Amazon offers other link tools in the Associates dashboard (Product Linking). Use those.

## Health products

Every health card sits under: "Ask your vet before giving any medicine or supplement." Never write that a product treats, cures or prevents anything. Dog flea products can be dangerous for cats; the site says to use cat products only.

# Serakıncı Static Site

This repository hosts the static pages for the Serakıncı web site. It also includes
`b2b_scraper.js`, a Node.js script that downloads product data from the
Serakıncı B2B portal.

## Setup

1. Install the scraper dependencies:
   ```bash
   npm install puppeteer fs-extra dotenv
   ```
2. Create a `.env` file in the repository root with your credentials. At a
minimum the following variables are required:
   ```
   DERMO_EMAIL=you@example.com
   DERMO_PASSWORD=****
   ANIMAL_EMAIL=you@example.com
   ANIMAL_PASSWORD=****
   HEADLESS_MODE=true    # optional
   SLOW_MO=30            # optional
   ```

## Running the scraper

Execute the script with Node.js:

```bash
node b2b_scraper.js
```

The script launches Puppeteer and writes JSON files to `urunler/api/` such as
`products.json` and `hayvan-sagligi.json`. These files are consumed by the site
for product listings.

## Project structure

- `assets/` – compiled JS and CSS for the site
- `urunler/` – product pages and API data
- `b2b_scraper.js` – scraping script
- `netlify.toml` – Netlify configuration

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE)
file for details.

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

## Generating static product pages

After the JSON files are updated you can create a static HTML page for every
product. The script copies the product detail templates so that each page has
the same layout as `urunler/dermokozmetik/product/template.html` or
`urunler/hayvan-sagligi/product/template.html`.

Run:

```bash
node generate_static_pages.js
```

This will read the JSON data and write pages under
`urunler/<segment>/product-pages/<slug>/index.html` for both Dermokozmetik and
Hayvan Sağlığı products.

## Deploying with Netlify

The repository includes a `netlify.toml` file. Netlify will run the
`generate_static_pages.js` script during the build phase to ensure each product
has its own static page before deployment.

## Project structure

- `assets/` – compiled JS and CSS for the site
- `urunler/` – product pages and API data
- `b2b_scraper.js` – scraping script
- `netlify.toml` – Netlify configuration

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE)
file for details.

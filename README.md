# Serakıncı Static Site

This repository hosts the static pages for the Serakıncı web site. It also includes
`b2b_scraper.js`, a Node.js script that downloads product data from the
Serakıncı B2B portal.

## Setup

1. Install the scraper dependencies:
   ```bash
   npm install puppeteer fs-extra dotenv
Create a .env file in the repository root with your credentials. At a
minimum the following variables are required:

ini
Kopieren
Bearbeiten
DERMO_EMAIL=you@example.com
DERMO_PASSWORD=****
ANIMAL_EMAIL=you@example.com
ANIMAL_PASSWORD=****
HEADLESS_MODE=true    # optional
SLOW_MO=30            # optional
Running the scraper
Execute the script with Node.js:

bash
Kopieren
Bearbeiten
node b2b_scraper.js
The script launches Puppeteer and writes JSON files to urunler/api/ such as
products.json and hayvan-sagligi.json. These files are consumed by the site
for product listings.

Generating static product pages
After the JSON files are updated you can create a static HTML page for every
product. The script copies the product detail templates so that each page has
the same layout as urunler/dermokozmetik/product/template.html or
urunler/hayvan-sagligi/product/template.html.

Run:

bash
Kopieren
Bearbeiten
node generate_static_pages.js
This will read the JSON data and write pages under
urunler/<segment>/product-pages/<slug>/index.html for both Dermokozmetik and
Hayvan Sağlığı products. It also generates an index.html inside each
product-pages/ directory listing links to every product page, so visiting
/urunler/<segment>/product-pages/ shows all available products.
The same command updates sitemap.xml and sitemap.html to include every
product URL so search engines can discover them. It also downloads all product
images into urunler/api/gorseller/ so that Netlify serves them locally.
The product templates and category listings automatically read images from this
folder, so pages no longer depend on external hosts.

Deploying with Netlify
The repository includes a netlify.toml file. Netlify will run the
generate_static_pages.js script during the build phase to ensure each product
has its own static page before deployment. Product data, product images, and
pages are kept up to date by the run-scraper.yml GitHub Actions workflow,
which runs daily and commits any new JSON files, downloaded images and
generated sitemap. Each commit triggers a new Netlify deploy, so the static site
is rebuilt automatically.

Admin panel
urunler/admin.html provides a basic admin panel. Sign in with the hard coded credentials admin / serakinci123. From there you can edit product descriptions and set brand information. Buttons allow downloading updated detay-product.json, products.json and brands.json files for uploading back to the server. The panel can also generate product descriptions or suggest a brand name via Google Gemini using the same API key as the site.

Project structure
assets/ – compiled JS and CSS for the site

urunler/ – product pages and API data

b2b_scraper.js – scraping script

netlify.toml – Netlify configuration

License
This project is licensed under the MIT License. See the LICENSE file for details.
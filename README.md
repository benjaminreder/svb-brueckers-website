# SVB Brückers — Kfz-Sachverständiger Stuttgart

Professionelle Website für svb-brückers.de

## Tech Stack
- HTML / CSS / JavaScript (statisch)
- Hosting: GitHub Pages
- Kontaktformular: Formspree
- Domain: svb-brückers.de (Strato)


## Google Maps konfigurieren
Damit die Karte im Abschnitt **Einzugsgebiet** geladen wird, muss ein gültiger Google-Maps-API-Key hinterlegt werden.

Unterstützte Wege (in Prioritätsreihenfolge):
1. `data-map-api-key` direkt am Element mit `data-map-container` in `index.html`
2. `<meta name="google-maps-api-key" content="...">` im `<head>`
3. Eine globale JavaScript-Variable vor dem Laden von `js/main.js`:
   - `window.SVB_GOOGLE_MAPS_API_KEY` (bevorzugt)
   - `window.GOOGLE_MAPS_API_KEY`
   - `window.GMAPS_API_KEY`
   - `window.GOOGLE_MAPS_KEY`

Wichtig: Der API-Key sollte in der Google Cloud Console per HTTP-Referrer auf die Domain eingeschränkt werden.

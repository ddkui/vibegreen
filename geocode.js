const fs = require('fs');
const https = require('https');

const dataFile = fs.readFileSync('C:/Users/jomik/.gemini/antigravity/scratch/vibe-map/data.js', 'utf8');
const locationsMatch = dataFile.match(/const SUSTAINABLE_LOCATIONS = (\[[\s\S]*?\]);/);
if (!locationsMatch) {
    console.error('Failed to parse locations');
    process.exit(1);
}

// simple eval since this is trusted local file
let locs = [];
eval('locs = ' + locationsMatch[1]);

async function geocode(query) {
    return new Promise((resolve) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        https.get(url, { headers: { 'User-Agent': 'Antigravity/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.length > 0) resolve([parsed[0].lat, parsed[0].lon]);
                    else resolve(null);
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function run() {
    for (let loc of locs) {
        // Try precise name and city first, then address
        let coords = await geocode(loc.name + ', Luzern');
        if (!coords) {
            coords = await geocode(loc.address);
        }
        if (coords) {
            console.log(`id: '${loc.id}', new_lat: ${coords[0]}, new_lng: ${coords[1]} // ${loc.name}`);
        } else {
            console.log(`id: '${loc.id}' -> Not found by Nominatim`);
        }
        await new Promise(r => setTimeout(r, 1100)); // Rate limit 1 request/sec
    }
}

run();

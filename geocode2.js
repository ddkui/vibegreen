const fs = require('fs');
const https = require('https');

// Extract the locations cleanly by replacing the export/variable declaration
const dataFile = fs.readFileSync('C:/Users/jomik/.gemini/antigravity/scratch/vibe-map/data.js', 'utf8');
const match = dataFile.match(/const SUSTAINABLE_LOCATIONS = (\[[\s\S]*?\]);/);
let locs = [];
try {
    eval('locs = ' + match[1]);
} catch (e) {
    console.error("Syntax error evaluating locations array");
    process.exit(1);
}

async function geocode(query) {
    return new Promise((resolve) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        https.get(url, { headers: { 'User-Agent': 'AntigravityLocal/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed && parsed.length > 0) resolve([parsed[0].lat, parsed[0].lon]);
                    else resolve(null);
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

async function run() {
    let output = [];
    for (let loc of locs) {
        let coords = await geocode(loc.name + ', Luzern');
        if (!coords) {
            // Try address
            let cleanAddr = loc.address.split(',')[0];
            coords = await geocode(cleanAddr + ', Luzern');
        }
        if (coords) {
            console.log(`id: '${loc.id}', new_lat: ${coords[0]}, new_lng: ${coords[1]} // ${loc.name}`);
        } else {
            console.log(`id: '${loc.id}' -> Not found by Nominatim`);
        }
        await new Promise(r => setTimeout(r, 1100)); // Respect 1 req/sec rate limit
    }
}

run();

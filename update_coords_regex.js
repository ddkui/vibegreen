const fs = require('fs');
const dataFile = 'C:/Users/jomik/.gemini/antigravity/scratch/vibe-map/data.js';
let content = fs.readFileSync(dataFile, 'utf8');

const newCoords = {
    'karls-kraut': { lat: 47.0525099, lng: 8.3015176 },
    'tibits': { lat: 47.0500253, lng: 8.3097745 },
    'veganitas': { lat: 47.0504735, lng: 8.3107309 },
    'bayts': { lat: 47.0490301, lng: 8.3012385 },
    'unverpackt': { lat: 47.0453210, lng: 8.3082976 },
    'prima-natura': { lat: 47.0526593, lng: 8.3063422 },
    'schweizerhof': { lat: 47.0543122, lng: 8.3101734 },
    'grand-hotel-national': { lat: 47.0547850, lng: 8.3149386 },
    'hermitage': { lat: 47.0426510, lng: 8.3500980 },
    'ms-diamant': { lat: 47.0473834, lng: 8.3141978 },
    'kkl-luzern': { lat: 47.0502965, lng: 8.3121117 },
    'ali-baba-vintage': { lat: 47.0527643, lng: 8.3058129 },
    'tootsies-secondhand': { lat: 47.0473509, lng: 8.3055429 },
    'the-secondhand': { lat: 47.0490148, lng: 8.3012016 }
};

for (const [id, coords] of Object.entries(newCoords)) {
    const rx = new RegExp(`id:\\s*'${id}',\\s*name:[^,]+,\\s*lat:\\s*[\\d.]+,\\s*lng:\\s*[\\d.]+,`);
    const match = content.match(rx);
    if (match) {
        // extract name part
        const namePartMatch = match[0].match(/name:\s*('[^']+'|"[^"]+"),/);
        if (namePartMatch) {
            const namePart = namePartMatch[0];
            const newStr = `id: '${id}',\n        ${namePart}\n        lat: ${coords.lat},\n        lng: ${coords.lng},`;
            content = content.replace(rx, newStr);
        }
    } else {
        console.error("Could not find block for", id);
    }
}

fs.writeFileSync(dataFile, content, 'utf8');
console.log('Done replacing coordinates');

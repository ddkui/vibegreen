const fs = require('fs');
let content = fs.readFileSync('data.js', 'utf8');

// Precise geocoded results (validated to be within Luzern bounds ~47.02-47.07, 8.27-8.38)
const updates = {
    'treibhaus': { lat: 47.042506, lng: 8.3192252 },
    'seebad-luzern': { lat: 47.0545942, lng: 8.3186361 },
    'lido-luzern': { lat: 47.0498217, lng: 8.3360087 },
    'strandbad-tribschen': { lat: 47.040515, lng: 8.3289023 },
    'waldbad-zimmeregg': { lat: 47.0311143, lng: 8.2951400 }, // manual - Zimmeregg hills southwest
    'plant-luzern': { lat: 47.0484139, lng: 8.3050783 },
    'sentitreff': { lat: 47.0518987, lng: 8.2973555 },
    'gartenhaus': { lat: 47.0442580, lng: 8.2894200 }, // manual - Reussbühl industrial area
    'cafe-voliere': { lat: 47.0493353, lng: 8.3136462 },
    'pinakarri': { lat: 47.0550786, lng: 8.3097190 },
    'alnatura-luzern': { lat: 47.0503500, lng: 8.3050000 }, // manual - Pilatusstrasse area
    'oakberry': { lat: 47.0528000, lng: 8.3085000 }, // manual - near Hertensteinstrasse
    'lucerne-festival': { lat: 47.0502965, lng: 8.3121117 },
    'neubad': { lat: 47.0411783, lng: 8.3070641 },
};

for (const [id, coords] of Object.entries(updates)) {
    // regex matches the id line, then jumps past name and replaces the lat/lng values
    const rx = new RegExp(`(id: '${id}',[\\s\\S]*?lat:)\\s*[\\d.]+,([\\s\\S]*?lng:)\\s*[\\d.]+,`);
    if (rx.test(content)) {
        content = content.replace(rx, `$1 ${coords.lat},$2 ${coords.lng},`);
        console.log(`Updated: ${id}`);
    } else {
        console.error(`NOT FOUND: ${id}`);
    }
}

fs.writeFileSync('data.js', content, 'utf8');
console.log('All done!');

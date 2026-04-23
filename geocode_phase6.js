const https = require('https');
const fs = require('fs');

const toGeocode = [
    { id: 'treibhaus', q: 'Treibhaus Luzern Spelteriniweg 4' },
    { id: 'seebad-luzern', q: 'Seebad Luzern Nationalquai' },
    { id: 'lido-luzern', q: 'Lido Luzern Lidostrasse 6a' },
    { id: 'strandbad-tribschen', q: 'Strandbad Tribschen Luzern' },
    { id: 'waldbad-zimmeregg', q: 'Waldbad Zimmeregg Kriens Luzern' },
    { id: 'plant-luzern', q: 'Pilatusstrasse 26 Luzern Switzerland' },
    { id: 'sentitreff', q: 'Sentitreff Baselstrasse 21 Luzern' },
    { id: 'gartenhaus', q: 'Lindenstrasse 21 Reussbühl Luzern' },
    { id: 'cafe-voliere', q: 'Inseliquai Luzern Switzerland' },
    { id: 'pinakarri', q: 'Hertensteinstrasse 22 Luzern' },
    { id: 'alnatura-luzern', q: 'Alnatura Pilatusstrasse Luzern' },
    { id: 'oakberry', q: 'Hertensteinstrasse 4 Luzern' },
    { id: 'lucerne-festival', q: 'KKL Europaplatz 1 Luzern' },
    { id: 'neubad', q: 'Neubad Bireggstrasse 36 Luzern' },
];

function geocode(query) {
    return new Promise((resolve) => {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=ch`;
        const options = { headers: { 'User-Agent': 'GreenLuzernApp/1.0' } };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const results = JSON.parse(data);
                    if (results.length > 0) resolve({ lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) });
                    else resolve(null);
                } catch { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

async function main() {
    const results = {};
    for (const loc of toGeocode) {
        const result = await geocode(loc.q);
        results[loc.id] = result;
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, 1200));
    }
    fs.writeFileSync('phase6_results.json', JSON.stringify(results, null, 2));
    console.log('\nDone! Results in phase6_results.json');
}

main();

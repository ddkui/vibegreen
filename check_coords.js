const fs = require('fs');
const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'VibeMap-Geocode-Test/1.0 (test@example.com)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
          try {
              resolve(JSON.parse(data));
          } catch(e) {
              resolve([]);
          }
      });
    }).on('error', reject);
  });
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 1000;
}

const content = fs.readFileSync('data.js', 'utf8');
const objMatch = content.match(/const SUSTAINABLE_LOCATIONS = \[([\s\S]*?)\];/);

const locations = [];
const regex = /\{\s*id:\s*'([^']*)',\s*name:\s*'([^']*)',\s*lat:\s*([0-9.]+),\s*lng:\s*([0-9.]+),[\s\S]*?address:\s*'([^']*)'[\s\S]*?\}/g;
let match;
while ((match = regex.exec(objMatch[1])) !== null) {
  locations.push({
    id: match[1],
    name: match[2],
    lat: parseFloat(match[3]),
    lng: parseFloat(match[4]),
    address: match[5]
  });
}

console.log('Found ' + locations.length + ' locations.');

async function run() {
  const corrected = [];
  for (const loc of locations) {
    await new Promise(r => setTimeout(r, 1000));
    try {
      // First try exact address
      let addrQuery = encodeURIComponent(loc.address);
      let res = await get('https://nominatim.openstreetmap.org/search?format=json&q=' + addrQuery);
      
      if (!res || res.length === 0) {
          // fallback to name + city (extract city from end of address)
          const cityMatch = loc.address.match(/([0-9]{4}\s+[A-Za-z\s]+)$/);
          let city = cityMatch ? cityMatch[1] : 'Luzern';
          let query = encodeURIComponent(loc.name + ', ' + city);
          res = await get('https://nominatim.openstreetmap.org/search?format=json&q=' + query);
      }
      
      if (res && res.length > 0) {
        const osmLat = parseFloat(res[0].lat);
        const osmLon = parseFloat(res[0].lon);
        const dist = haversine(loc.lat, loc.lng, osmLat, osmLon);
        
        let newLat = loc.lat;
        let newLng = loc.lng;

        if (dist > 100) {
           console.log(`MISMATCH: ${loc.name} -> diff ${Math.round(dist)}m`);
           console.log(`   Address: ${loc.address}`);
           console.log(`   Old: ${loc.lat}, ${loc.lng}`);
           console.log(`   New: ${osmLat}, ${osmLon}`);
           console.log(`-----------------------------`);
           newLat = osmLat;
           newLng = osmLon;
        }

        corrected.push({
            id: loc.id,
            lat: newLat,
            lng: newLng
        });

      } else {
        console.log(`NOT FOUND: ${loc.name} - ${loc.address}`);
        corrected.push({ id: loc.id, lat: loc.lat, lng: loc.lng });
      }
    } catch (e) {
      console.log('Error checking ' + loc.name, e);
      corrected.push({ id: loc.id, lat: loc.lat, lng: loc.lng });
    }
  }

  // Rewrite data.js with new coords
  let newContent = content;
  for (const loc of corrected) {
      const re = new RegExp(`(\\{\\s*id:\\s*'${loc.id}',\\s*name:\\s*'[^']*',\\s*lat:\\s*)([0-9.]+)(,\\s*lng:\\s*)([0-9.]+)`);
      newContent = newContent.replace(re, `$1${loc.lat.toFixed(5)}$3${loc.lng.toFixed(5)}`);
  }
  fs.writeFileSync('data.js', newContent);
  console.log('Updated data.js with exact Nominatim coordinates!');
}

run();

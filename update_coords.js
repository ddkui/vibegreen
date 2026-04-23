const fs = require('fs');

const dataFile = 'C:/Users/jomik/.gemini/antigravity/scratch/vibe-map/data.js';
let content = fs.readFileSync(dataFile, 'utf8');

const replacements = [
    ['id: \'karls-kraut\',\n        name: \'Karls Kraut\',\n        lat: 47.053818,\n        lng: 8.300095', 'id: \'karls-kraut\',\n        name: \'Karls Kraut\',\n        lat: 47.0525099,\n        lng: 8.3015176'],
    ['id: \'tibits\',\n        name: \'Tibits Luzern\',\n        lat: 47.050474,\n        lng: 8.310574', 'id: \'tibits\',\n        name: \'Tibits Luzern\',\n        lat: 47.0500253,\n        lng: 8.3097745'],
    ['id: \'veganitas\',\n        name: \'Veganitas\',\n        lat: 47.050186,\n        lng: 8.310036', 'id: \'veganitas\',\n        name: \'Veganitas\',\n        lat: 47.0504735,\n        lng: 8.3107309'],
    ['id: \'bayts\',\n        name: \'BAYTS Bistro & Bar\',\n        lat: 47.049400,\n        lng: 8.303250', 'id: \'bayts\',\n        name: \'BAYTS Bistro & Bar\',\n        lat: 47.0490301,\n        lng: 8.3012385'],
    ['id: \'unverpackt\',\n        name: \'Unverpackt Luzern\',\n        lat: 47.045050,\n        lng: 8.308210', 'id: \'unverpackt\',\n        name: \'Unverpackt Luzern\',\n        lat: 47.0453210,\n        lng: 8.3082976'],
    ['id: \'prima-natura\',\n        name: \'Prima Natura\',\n        lat: 47.049870,\n        lng: 8.303120', 'id: \'prima-natura\',\n        name: \'Prima Natura\',\n        lat: 47.0526593,\n        lng: 8.3063422'],
    ['id: \'schweizerhof\',\n        name: \'Hotel Schweizerhof Luzern\',\n        lat: 47.054379,\n        lng: 8.311394', 'id: \'schweizerhof\',\n        name: \'Hotel Schweizerhof Luzern\',\n        lat: 47.0543122,\n        lng: 8.3101734'],
    ['id: \'grand-hotel-national\',\n        name: \'Grand Hotel National\',\n        lat: 47.054990,\n        lng: 8.313880', 'id: \'grand-hotel-national\',\n        name: \'Grand Hotel National\',\n        lat: 47.0547850,\n        lng: 8.3149386'],
    ['id: \'hermitage\',\n        name: \'HERMITAGE Lake Lucerne\',\n        lat: 47.039324,\n        lng: 8.349171', 'id: \'hermitage\',\n        name: \'HERMITAGE Lake Lucerne\',\n        lat: 47.0426510,\n        lng: 8.3500980'],
    ['id: \'ms-diamant\',\n        name: \'MS Diamant (Lake Lucerne Navigation)\',\n        lat: 47.050410,\n        lng: 8.312940', 'id: \'ms-diamant\',\n        name: \'MS Diamant (Lake Lucerne Navigation)\',\n        lat: 47.0473834,\n        lng: 8.3141978'],
    ['id: \'kkl-luzern\',\n        name: \'KKL Luzern\',\n        lat: 47.050278,\n        lng: 8.312222', 'id: \'kkl-luzern\',\n        name: \'KKL Luzern\',\n        lat: 47.0502965,\n        lng: 8.3121117'],
    ['id: \'ali-baba-vintage\',\n        name: \'Ali Baba Vintage\',\n        lat: 47.051510,\n        lng: 8.303350', 'id: \'ali-baba-vintage\',\n        name: \'Ali Baba Vintage\',\n        lat: 47.0527643,\n        lng: 8.3058129'],
    ['id: \'tootsies-secondhand\',\n        name: \'Tootsies Second Hand\',\n        lat: 47.049440,\n        lng: 8.307220', 'id: \'tootsies-secondhand\',\n        name: \'Tootsies Second Hand\',\n        lat: 47.0473509,\n        lng: 8.3055429'],
    ['id: \'the-secondhand\',\n        name: \'The Secondhand\',\n        lat: 47.049870,\n        lng: 8.303120', 'id: \'the-secondhand\',\n        name: \'The Secondhand\',\n        lat: 47.0490148,\n        lng: 8.3012016']
];

for (let [oldStr, newStr] of replacements) {
    if (!content.includes(oldStr)) {
        console.error("COULD NOT FIND:", oldStr);
    }
    content = content.replace(oldStr, newStr);
}

fs.writeFileSync(dataFile, content, 'utf8');
console.log('SUCCESS!');

// Cloudflare Pages Function: POST /api/submit-location
// Accepts a new community location submission and stores it as pending review

const VALID_CATEGORIES = [
    'vegan', 'zero-waste', 'eco-hotel', 'activity',
    'secondhand', 'ev-charging', 'bike-rental', 'swisstainable', 'drinking-water'
];

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
};

const json = (status, body) => new Response(JSON.stringify(body), { status, headers });

export async function onRequestOptions() {
    return new Response(null, { status: 200, headers });
}

export async function onRequestPost({ request, env }) {
    try {
        let body;
        try { body = await request.json(); } catch { body = {}; }
        const { name, address, lat, lng, category, description, submitted_by } = body;

        if (!name || !address || !category || !description) {
            return json(400, { error: 'Missing required fields: name, address, category, description' });
        }
        if (!VALID_CATEGORIES.includes(category)) {
            return json(400, { error: 'Invalid category' });
        }

        const clean = (s) => String(s || '').trim().slice(0, 500);

        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/community_locations`, {
            method: 'POST',
            headers: {
                apikey: env.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal',
            },
            body: JSON.stringify({
                name: clean(name),
                address: clean(address),
                lat: lat || null,
                lng: lng || null,
                category,
                description: clean(description),
                submitted_by: clean(submitted_by),
                approved: false,
            }),
        });
        if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);

        return json(200, { success: true, message: 'Thank you! Your submission is pending review.' });
    } catch (err) {
        console.error('submit-location error:', err);
        return json(500, { error: 'Failed to submit location' });
    }
}

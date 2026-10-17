// Netlify Function: POST /api/submit-location
// Accepts a new community location submission and stores it as pending review

const VALID_CATEGORIES = [
    'vegan', 'zero-waste', 'eco-hotel', 'activity',
    'secondhand', 'ev-charging', 'bike-rental', 'swisstainable', 'drinking-water'
];

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const { name, address, lat, lng, category, description, submitted_by } = body;

        // Validate required fields
        if (!name || !address || !category || !description) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing required fields: name, address, category, description' }),
            };
        }

        if (!VALID_CATEGORIES.includes(category)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid category' }),
            };
        }

        // Sanitise inputs
        const clean = (s) => String(s || '').trim().slice(0, 500);

        const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/community_locations`, {
            method: 'POST',
            headers: {
                apikey: process.env.SUPABASE_ANON_KEY,
                Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
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

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, message: 'Thank you! Your submission is pending review.' }),
        };
    } catch (err) {
        console.error('submit-location error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to submit location' }),
        };
    }
};

// Netlify Function: POST /api/submit-location
// Accepts a new community location submission and stores it as pending review

const { neon } = require('@neondatabase/serverless');

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

        const sql = neon(process.env.DATABASE_URL);

        await sql`
            INSERT INTO community_locations
                (name, address, lat, lng, category, description, submitted_by, approved, created_at)
            VALUES
                (${clean(name)}, ${clean(address)}, ${lat || null}, ${lng || null},
                 ${category}, ${clean(description)}, ${clean(submitted_by)}, false, NOW())
        `;

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

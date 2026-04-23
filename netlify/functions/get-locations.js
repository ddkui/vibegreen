// Netlify Function: GET /api/get-locations
// Returns all approved community-submitted locations from Neon DB

const { neon } = require('@neondatabase/serverless');

exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    try {
        const sql = neon(process.env.DATABASE_URL);

        const rows = await sql`
            SELECT id, name, lat, lng, category, description, address, submitted_by, created_at
            FROM community_locations
            WHERE approved = true
            ORDER BY created_at DESC
        `;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(rows),
        };
    } catch (err) {
        console.error('get-locations error:', err);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to fetch locations' }),
        };
    }
};

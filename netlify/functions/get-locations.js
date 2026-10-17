// Netlify Function: GET /api/get-locations
// Returns all approved community-submitted locations from Supabase


exports.handler = async (event) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
    };

    try {
        const res = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/community_locations` +
            '?select=id,name,lat,lng,category,description,address,submitted_by,created_at' +
            '&approved=eq.true&order=created_at.desc',
            { headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}` } }
        );
        if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
        const rows = await res.json();

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

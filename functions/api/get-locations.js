// Cloudflare Pages Function: GET /api/get-locations
// Returns all approved community-submitted locations from Supabase

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
};

export async function onRequestGet({ env }) {
    try {
        const res = await fetch(
            `${env.SUPABASE_URL}/rest/v1/community_locations` +
            '?select=id,name,lat,lng,category,description,address,submitted_by,created_at' +
            '&approved=eq.true&order=created_at.desc',
            { headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` } }
        );
        if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
        return new Response(JSON.stringify(await res.json()), { status: 200, headers });
    } catch (err) {
        console.error('get-locations error:', err);
        return new Response(JSON.stringify({ error: 'Failed to fetch locations' }), { status: 500, headers });
    }
}

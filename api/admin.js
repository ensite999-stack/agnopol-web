// /api/admin.js - Agnopol Secure Gateway
export default async function handler(req, res) {
    const { password, action, data } = req.body;

    // 1. Password Verification (From Vercel Env)
    if (!password || password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({ error: "Unauthorized: Invalid Access Key" });
    }

    const sbUrl = "https://tlsfyduighotjrsvjlqy.supabase.co/rest/v1";
    const headers = {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
    };

    try {
        let result;
        if (action === 'fetch_all') {
            const [orders, settings] = await Promise.all([
                fetch(`${sbUrl}/orders?select=*&order=created_at.desc`, { headers }).then(r => r.json()),
                fetch(`${sbUrl}/settings?select=*`, { headers }).then(r => r.json())
            ]);
            result = { orders, settings };
        } 
        else if (action === 'update_order') {
            await fetch(`${sbUrl}/orders?id=eq.${data.id}`, { method: 'PATCH', headers, body: JSON.stringify(data.update) });
            result = { success: true };
        }
        else if (action === 'update_prices') {
            for (const item of data.settings) {
                await fetch(`${sbUrl}/settings?key=eq.${item.key}`, { method: 'PATCH', headers, body: JSON.stringify({ value: item.value }) });
            }
            result = { success: true };
        }
        else if (action === 'cleanup') {
            await fetch(`${sbUrl}/orders?created_at=lt.${data.threshold}`, { method: 'DELETE', headers });
            result = { success: true };
        }
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ error: "Server sync failed" });
    }
}

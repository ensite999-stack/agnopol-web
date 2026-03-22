const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

// 波士顿晚10点相当于 UTC 时间的凌晨 2点(夏令时) 或 3点(冬令时)。
// Cloudflare 的定时任务在后台设置，这里是清理逻辑的核心代码
async function runBostonCleanup(env) {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const cutoffIso = cutoff.toISOString().slice(0, 19).replace("T", " ");

  // 1. 查出要删除的图片
  const expiredOrders = await env.DB.prepare(`SELECT proof_file_key FROM orders WHERE created_at < ?`).bind(cutoffIso).all();
  
  // 2. 从 R2 彻底删除图片 (无痕)
  for (const row of (expiredOrders.results || [])) {
    if (row.proof_file_key) await env.BUCKET.delete(row.proof_file_key);
  }

  // 3. 从 D1 删除订单记录
  await env.DB.prepare(`DELETE FROM orders WHERE created_at < ?`).bind(cutoffIso).run();
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 处理跨域
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    try {
      // ==========================================
      // 🚨 你的专属隐藏建表接口 (只在浏览器访问一次)
      // ==========================================
      if (url.pathname === "/setup-database-secret-url" && request.method === "GET") {
        // 既然是推翻重来，先删掉可能存在的旧表，防止字段冲突报错
        await env.DB.exec(`
          DROP TABLE IF EXISTS settings;
          DROP TABLE IF EXISTS orders;
          
          CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT);
          
          CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            order_no TEXT UNIQUE, 
            email TEXT, 
            username TEXT, 
            product_type TEXT, 
            quantity INTEGER, 
            amount TEXT, 
            currency TEXT DEFAULT 'U', 
            status TEXT DEFAULT 'pending', -- pending(待支付), paid(已支付/待处理), completed(已完成)
            proof_txid TEXT, 
            proof_file_key TEXT, 
            admin_note TEXT DEFAULT '', -- 后台给用户的备注
            created_at TEXT DEFAULT (datetime('now')), 
            updated_at TEXT DEFAULT (datetime('now'))
          );
          
          INSERT INTO settings (key, value) VALUES 
            ('premium_3m_price', '13.1'), 
            ('premium_6m_price', '17.1'), 
            ('premium_12m_price', '31.1'),
            ('stars_unit_price', '0.02'), -- 1U ≈ 50个
            ('pay_trc20', 'TD6sQK9NmqxKzP6WHvmUdkHQRZvwX6Cy1e'),
            ('pay_base', '0x21E43Ddaa992A0B5cfcCeFE98838239b9E91B40E');
        `);
        return new Response("🎉 Agnopol 数据库与初始价格、钱包地址已全部重置并创建成功！", { status: 200 });
      }

      // ==========================================
      // 前端公开接口 (供前端调用的业务逻辑)
      // ==========================================
      
      // 1. 获取价格和支付地址
      if (url.pathname === "/api/config" && request.method === "GET") {
        const rows = await env.DB.prepare(`SELECT key, value FROM settings`).all();
        const config = {};
        for (const r of rows.results) config[r.key] = r.value;
        return json({ ok: true, config });
      }

      // 2. 创建订单
      if (url.pathname === "/api/order/create" && request.method === "POST") {
        const body = await request.json();
        const orderNo = "AG" + Date.now() + Math.floor(Math.random() * 1000);
        await env.DB.prepare(`
          INSERT INTO orders (order_no, email, username, product_type, quantity, amount)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(orderNo, body.email, body.username, body.product_type, body.quantity, body.amount).run();
        
        return json({ ok: true, order_no: orderNo });
      }

      // 3. 上传支付凭证 (存入 R2)
      if (url.pathname === "/api/order/proof" && request.method === "POST") {
        const form = await request.formData();
        const orderNo = form.get("order_no");
        const file = form.get("file");
        
        if (!file || typeof file === "string") return json({ ok: false, error: "未检测到图片" }, 400);
        
        const fileKey = `proofs/${orderNo}-${Date.now()}.jpg`;
        await env.BUCKET.put(fileKey, file.stream(), { httpMetadata: { contentType: file.type } });
        
        // 凭证上传后，状态变为 paid (待处理)
        await env.DB.prepare(`UPDATE orders SET proof_file_key = ?, status = 'paid', updated_at = datetime('now') WHERE order_no = ?`).bind(fileKey, orderNo).run();
        
        return json({ ok: true, file_key: fileKey });
      }

      // 4. 用户查询最近3条订单 (48小时内)
      if (url.pathname === "/api/orders" && request.method === "GET") {
        const email = url.searchParams.get("email");
        const cutoffIso = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
        
        const rows = await env.DB.prepare(`
          SELECT order_no, product_type, amount, status, admin_note, created_at 
          FROM orders 
          WHERE email = ? AND created_at > ? 
          ORDER BY created_at DESC LIMIT 3
        `).bind(email, cutoffIso).all();
        
        return json({ ok: true, orders: rows.results });
      }

      // ==========================================
      // 后台管理接口 (需密码验证)
      // ==========================================
      const adminToken = request.headers.get("X-Admin-Token");
      const isAdmin = adminToken === env.ADMIN_TOKEN; // 需在 Cloudflare 环境变量设置 ADMIN_TOKEN

      if (url.pathname.startsWith("/api/admin/")) {
        if (!isAdmin) return json({ ok: false, error: "未授权或密码错误" }, 401);

        // 1. 获取所有订单 (后台列表)
        if (url.pathname === "/api/admin/orders" && request.method === "GET") {
          const rows = await env.DB.prepare(`SELECT * FROM orders ORDER BY CASE WHEN status = 'paid' THEN 0 ELSE 1 END, created_at DESC LIMIT 100`).all();
          return json({ ok: true, orders: rows.results });
        }

        // 2. 更改订单状态 (恢复支付 / 确认完成)
        if (url.pathname === "/api/admin/order/status" && request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE order_no = ?`).bind(body.status, body.order_no).run();
          return json({ ok: true });
        }

        // 3. 添加用户可见备注
        if (url.pathname === "/api/admin/order/note" && request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`UPDATE orders SET admin_note = ?, updated_at = datetime('now') WHERE order_no = ?`).bind(body.note, body.order_no).run();
          return json({ ok: true });
        }

        // 4. 删除单笔订单 (连带图片一起删)
        if (url.pathname === "/api/admin/order/delete" && request.method === "POST") {
          const body = await request.json();
          const order = await env.DB.prepare(`SELECT proof_file_key FROM orders WHERE order_no = ?`).bind(body.order_no).first();
          if (order && order.proof_file_key) await env.BUCKET.delete(order.proof_file_key);
          await env.DB.prepare(`DELETE FROM orders WHERE order_no = ?`).bind(body.order_no).run();
          return json({ ok: true });
        }
        
        // 5. 修改价格/设置
        if (url.pathname === "/api/admin/settings" && request.method === "POST") {
          const body = await request.json();
          await env.DB.prepare(`UPDATE settings SET value = ? WHERE key = ?`).bind(body.value, body.key).run();
          return json({ ok: true });
        }
      }

      return json({ ok: false, error: "Endpoint not found" }, 404);
    } catch (e) {
      return json({ ok: false, error: e.message }, 500);
    }
  },

  // 定时任务触发器：每天波士顿时间晚10点彻底销毁
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runBostonCleanup(env));
  }
};

// 辅助函数
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS"
    }
  });
}

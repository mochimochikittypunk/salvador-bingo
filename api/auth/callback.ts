import { Redis } from 'ioredis';

export default async function handler(req: any, res: any) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is missing.' });
  }

  const clientId = process.env.BASE_CLIENT_ID?.trim();
  const clientSecret = process.env.BASE_CLIENT_SECRET?.trim();
  const redisUrl = process.env.REDIS_URL?.trim();

  if (!clientId || !clientSecret || !redisUrl) {
    return res.status(500).json({ error: 'Server configuration error (missing ENV variables).' });
  }

  const redirectUri = 'https://bingo-neon-ten.vercel.app/api/auth/callback';

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('code', code as string);
    params.append('redirect_uri', redirectUri);

    const runRes = await fetch('https://api.thebase.in/1/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const data = await runRes.json();
    if (!runRes.ok) {
      throw new Error(data.error_description || 'Token fetch failed');
    }

    const redis = new Redis(redisUrl);
    // Vercel KVに永続化させる
    await redis.set('base_access_token', data.access_token);
    await redis.set('base_refresh_token', data.refresh_token);
    await redis.quit();

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).end(`
      <html>
        <head>
          <title>BASE連携完了</title>
          <meta charset="utf-8">
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background: #fde6d8; color: #3b2f2f; }
            .card { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1 style="color: #4CAF50;">✅ BASE API連携が完了しました！</h1>
            <p>アクセストークンがデータベースに安全に保存されました。<br>このタブは閉じて構いません。</p>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    res.status(500).json({ error: `エラーが発生しました: ${error.message}` });
  }
}

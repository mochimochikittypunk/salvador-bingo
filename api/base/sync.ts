import { Redis } from 'ioredis';

async function refreshBaseToken(redis: Redis, clientId: string, clientSecret: string, refreshToken: string) {
  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('refresh_token', refreshToken);

  const res = await fetch('https://api.thebase.in/1/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || 'Failed to refresh token');

  await redis.set('base_access_token', data.access_token);
  await redis.set('base_refresh_token', data.refresh_token);
  
  return data.access_token;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ error: 'Order ID (注文番号) がありません。' });

  const clientId = process.env.BASE_CLIENT_ID?.trim();
  const clientSecret = process.env.BASE_CLIENT_SECRET?.trim();
  const redisUrl = process.env.REDIS_URL?.trim();

  if (!clientId || !clientSecret || !redisUrl) {
    return res.status(500).json({ error: 'サーバー設定エラー: BASE APIキーが見つかりません。' });
  }

  const redis = new Redis(redisUrl);

  try {
    let accessToken = await redis.get('base_access_token');
    let refreshToken = await redis.get('base_refresh_token');

    if (!accessToken) {
      if (!refreshToken) throw new Error('BASE APIへの初期認証が済んでいません。店長様が /api/auth/login を開いて認証を完了してください。');
      // Token exists but not memcached properly, refresh it just in case
      accessToken = await refreshBaseToken(redis, clientId, clientSecret, refreshToken);
    }

    // Call BASE API
    let orderRes = await fetch(`https://api.thebase.in/1/orders/detail/${orderId}`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    // Handle token expiry automatically
    if (orderRes.status === 401 && refreshToken) {
      accessToken = await refreshBaseToken(redis, clientId, clientSecret, refreshToken);
      orderRes = await fetch(`https://api.thebase.in/1/orders/detail/${orderId}`, {
         headers: { 'Authorization': `Bearer ${accessToken}` }
      });
    }

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      throw new Error(orderData.error || orderData.error_description || '注文情報の取得に失敗しました。注文番号が正しいかご確認ください。');
    }

    // BASE Orders data extraction
    const orderItems = orderData.order.order_items || [];
    const itemNames = orderItems.map((item: any) => item.title);

    // Filter which items bought match our bingo beans
    // Because titles might be long e.g. "【深煎り】エチオピア...", we'll check if it includes bingo keywords.
    const bingoCandidates = [
      'エチオピア', 'ケニア', 'ルワンダ', 'ブレンド', 'ゲイシャ', 'ディカフェ', 'コロンビア', 'メキシコ', 'エルサルバドル'
    ];

    const boughtKeywords = bingoCandidates.filter(keyword => 
      itemNames.some((title: string) => title.includes(keyword))
    );

    await redis.quit();

    return res.status(200).json({ purchasedItems: boughtKeywords });

  } catch (error: any) {
    await redis.quit();
    return res.status(500).json({ error: error.message });
  }
}

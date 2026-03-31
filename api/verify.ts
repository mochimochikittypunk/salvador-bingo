import { Redis } from 'ioredis';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ valid: false, error: '合言葉が入力されていません' });
    }

    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) throw new Error('REDIS_URL is not set');
    
    const redis = new Redis(redisUrl);

    // 発行済みリストに存在するかどうかを確認
    const isIssued = await redis.sismember('issued_passwords', password);
    
    await redis.quit();

    if (isIssued === 1) {
      return res.status(200).json({ valid: true });
    } else {
      return res.status(200).json({ valid: false, error: 'この合言葉は未発行、または無効です。' });
    }
  } catch (error) {
    console.error('Redis Error:', error);
    return res.status(500).json({ valid: false, error: 'サーバーに接続できませんでした' });
  }
}

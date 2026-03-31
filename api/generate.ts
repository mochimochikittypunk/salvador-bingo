import { Redis } from 'ioredis';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) throw new Error('REDIS_URL is not set');

    const redis = new Redis(redisUrl);

    // 1. 未発行リストからランダムに1つ取り出しつつ削除
    const randomWord = await redis.spop('available_passwords');
    
    if (!randomWord) {
      await redis.quit();
      return res.status(400).json({ error: '新規発行できる合言葉がありません。' });
    }

    // 2. 発行済みリストに追加
    await redis.sadd('issued_passwords', randomWord);
    
    await redis.quit();

    return res.status(200).json({ password: randomWord });
  } catch (error) {
    console.error('Redis Error:', error);
    return res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}

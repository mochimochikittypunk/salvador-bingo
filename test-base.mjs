import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  try {
    const redis = new Redis(process.env.REDIS_URL);
    const token = await redis.get('base_access_token');
    
    const res = await fetch('https://api.thebase.in/1/orders/detail/FC12A02D45397320', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
    
    await redis.quit();
  } catch (e) {
    console.error(e);
  }
}
run();

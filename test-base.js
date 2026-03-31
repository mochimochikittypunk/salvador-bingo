import { Redis } from 'ioredis';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const redis = new Redis(process.env.REDIS_URL);
  const token = await redis.get('base_access_token');
  if(!token) { console.log("NO TOKEN"); process.exit(1); }
  
  const res = await fetch('https://api.thebase.in/1/orders?limit=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data.orders?.slice(0, 2).map((o) => o.order_item), null, 2));
  redis.quit();
}
run();

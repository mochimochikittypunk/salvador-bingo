import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Redis } from 'ioredis';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local の環境変数を強制ロード
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// TypeScriptファイルから正規表現で単語リストを取り出す（トランスパイル回避のため）
const dbContent = fs.readFileSync(path.resolve(__dirname, '../src/utils/passwordsDatabase.ts'), 'utf8');
const wordsMatch = dbContent.match(/\[([\s\S]*?)\]/);
if (!wordsMatch) {
  console.error("❌ src/utils/passwordsDatabase.ts から単語が見つかりませんでした。");
  process.exit(1);
}

const words = wordsMatch[1]
  .split(',')
  .map(w => w.trim().replace(/^"|"$/g, '').replace(/^'|'$/g, ''))
  .filter(w => w.length > 0);

async function reset() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('❌ .env.local に REDIS_URL が見つかりません。\n事前に `npx vercel env pull .env.local` を実行してください。');
    process.exit(1);
  }

  const redis = new Redis(redisUrl);
  
  console.log(`🔄 Vercel KV データベースへの接続中...`);
  
  // 両方のリストをクリア
  await redis.del('issued_passwords');
  await redis.del('available_passwords');
  
  // availableリストに100個の言葉を一括セット
  if (words.length > 0) {
    await redis.sadd('available_passwords', ...words);
  }
  
  console.log(`✅ 全員の発行済み状態を白紙に戻し、${words.length}個の合言葉を「未発行状態」としてデータベースに再セットしました！`);
  redis.quit();
}

reset();

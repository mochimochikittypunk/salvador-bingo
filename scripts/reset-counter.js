import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetFile = path.resolve(__dirname, '../src/components/TopPage.tsx');

try {
  console.log('🔄 合言葉発行数リセット処理を開始します...');

  let content = fs.readFileSync(targetFile, 'utf8');

  // 現在の日時を取得 (ISO形式: 例 '2024-10-15T12:00:00Z')
  const now = new Date();
  const nowIso = now.toISOString();

  // 1. baseDate を現在時刻に書き換える（正規表現でマッチ）
  content = content.replace(
    /const baseDate = new Date\('[^']+'\)\.getTime\(\);/,
    `const baseDate = new Date('${nowIso}').getTime();`
  );

  // 2. 初期値(1850など)を 0 にリセットする
  // 例: const simulatedCount = Math.floor(1850 + (elapsedHours * 0.45));
  content = content.replace(
    /const simulatedCount = Math\.floor\(\d+ \+ \(/,
    `const simulatedCount = Math.floor(0 + (`
  );

  fs.writeFileSync(targetFile, content, 'utf8');
  console.log(`✅ TopPage.tsx のカウンターを時間：${nowIso}、初期値：0にリセットしました。`);

  // 自動的にGitへコミット＆プッシュ（Vercelへのデプロイをトリガーする）
  console.log('🚀 GitHub経由でVercel本番環境へ反映させています...');
  execSync(`git add "${targetFile}"`, { stdio: 'inherit' });
  execSync('git commit -m "chore: reset access counter"', { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('\n🎉 リセット処理がすべて完了しました！');
  console.log('Vercelの再デプロイが完了するまで約30秒〜1分ほどお待ちいただき、ブラウザをリロードして確認してください。');

} catch (error) {
  console.error('❌ エラーが発生しました。リセット処理を中断します。', error.message);
}

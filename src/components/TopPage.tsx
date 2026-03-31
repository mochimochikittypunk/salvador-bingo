import React, { useState, useEffect } from 'react';
import { RuleModal } from './RuleModal';

type Props = {
  onLogin: (password: string) => void;
  defaultPassword?: string;
};

export const TopPage: React.FC<Props> = ({ onLogin, defaultPassword = '' }) => {
  const [inputPass, setInputPass] = useState(defaultPassword);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [accessCount, setAccessCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 擬似的な合言葉発行数（アクセス数）の生成
    const baseDate = new Date('2024-04-01T00:00:00Z').getTime();
    const now = Date.now();
    const elapsedHours = (now - baseDate) / (1000 * 60 * 60);
    // 初期値1850 + 時間経過でゆっくり増える数式
    const simulatedCount = Math.floor(1850 + (elapsedHours * 0.45));
    setAccessCount(simulatedCount);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const pass = inputPass.trim();
    if (!pass) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      const data = await resp.json();
      
      if (data.valid) {
        onLogin(pass);
      } else {
        setErrorMsg(data.error || '無効な合言葉です。新しく発行するか、正しい言葉を入力してください。');
      }
    } catch (err) {
      setErrorMsg('通信エラーが発生しました。時間を置いて再試行してください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const resp = await fetch('/api/generate', { method: 'POST' });
      const data = await resp.json();

      if (resp.ok && data.password) {
        setGeneratedPass(data.password);
        setInputPass(data.password);
      } else {
        setErrorMsg(data.error || '合言葉の発行に失敗しました。');
      }
    } catch (err) {
      setErrorMsg('通信エラーが発生しました。時間を置いて再試行してください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="top-container fade-in">
      <header className="top-header">
        <h1 className="title-logo">
          <span className="subtitle">Salvador Coffee お買い物マラソン</span>
          <br />
          国名ビンゴ大会！
        </h1>
      </header>

      <div className="login-card">
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="password">合言葉</label>
            <input 
              id="password"
              type="text" 
              value={inputPass} 
              onChange={e => {
                setInputPass(e.target.value);
                setErrorMsg(null);
              }} 
              placeholder="合言葉を入力"
              required
              disabled={isLoading}
            />
          </div>
          {errorMsg && <p className="error-message">{errorMsg}</p>}
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? '処理中...' : 'ビンゴゲームに参加する！'}
          </button>
        </form>

        <div className="divider"><span>または</span></div>

        <div className="new-issue-section">
          <button type="button" onClick={handleGenerate} className="secondary-button font-bold" disabled={isLoading}>
            {isLoading ? '発行中...' : <>合言葉を持っていませんか？<br/>新規でゲームに参加する</>}
          </button>

          {generatedPass && (
            <div className="generated-pass-alert">
              <p>あなたの合言葉は<br/><span className="highlight-pass">【{generatedPass}】</span><br/>です。</p>
              <p className="warning-text">次回以降のアクセスに必要なので、必ずスクリーンショットやメモをして保管してください！</p>
            </div>
          )}
        </div>
      </div>

      <button className="text-button inline-rules" onClick={() => setIsModalOpen(true)}>
        ルールを見る
      </button>

      {accessCount > 0 && (
        <div className="access-counter fade-in">
          これまでの合言葉発行数: <span className="counter-number">{accessCount.toLocaleString()}</span>回
        </div>
      )}

      <RuleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

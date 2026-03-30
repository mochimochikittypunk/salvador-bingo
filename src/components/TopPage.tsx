import React, { useState } from 'react';
import { RuleModal } from './RuleModal';
import { passwordsDatabase } from '../utils/passwordsDatabase';

type Props = {
  onLogin: (password: string) => void;
  defaultPassword?: string;
};

export const TopPage: React.FC<Props> = ({ onLogin, defaultPassword = '' }) => {
  const [inputPass, setInputPass] = useState(defaultPassword);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPass.trim()) {
      onLogin(inputPass.trim());
    }
  };

  const handleGenerate = () => {
    const randomWord = passwordsDatabase[Math.floor(Math.random() * passwordsDatabase.length)];
    setGeneratedPass(randomWord);
    setInputPass(randomWord);
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
              onChange={e => setInputPass(e.target.value)} 
              placeholder="合言葉を入力"
              required
            />
          </div>
          <button type="submit" className="primary-button">
            ビンゴゲームに参加する！
          </button>
        </form>

        <div className="divider"><span>または</span></div>

        <div className="new-issue-section">
          <button type="button" onClick={handleGenerate} className="secondary-button font-bold">
            合言葉を持っていませんか？<br/>新規でゲームに参加する
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

      <RuleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}

import React from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const RuleModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>ビンゴ大会 ルール</h2>
        <div className="rule-section">
          <h3>開催期間</h3>
          <p>4月1日 〜 4月30日</p>
        </div>
        <div className="rule-section">
          <h3>ルール</h3>
          <p>購入したコーヒーの生産国マスをタップして、穴を開けましょう。</p>
        </div>
        <div className="rule-section">
          <h3>リワード</h3>
          <ul className="reward-list">
            <li><strong>1列揃うと</strong> 1,000円分のキャッシュバック！</li>
            <li><strong>2列揃うと</strong> 3,000円分のキャッシュバック！</li>
            <li><strong>3列揃うと</strong> 5,000円分のキャッシュバック！</li>
          </ul>
        </div>
        <button className="primary-button" onClick={onClose}>閉じる</button>
      </div>
    </div>
  );
}

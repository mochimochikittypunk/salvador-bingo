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
          <h3>🎯 ビンゴの対象となる注文</h3>
          <ul className="modal-list">
            <li><strong>期間：</strong>2026年4月1日〜4月30日までのご注文のみ対象です。</li>
            <li><strong>対象外：</strong>「定期便（サブスク）」および、「セット割引商品」「まとめ買い商品」はビンゴの対象外となります。あらかじめご了承ください。</li>
            <li>注文完了後、発行された「注文番号 (2B...)」をビンゴ画面の連携フォームに入力してください。購入した豆のマスが自動的に開きます。</li>
            <li>期間中の複数の注文番号を順番に入力することで、マスはどんどん追加されていきます！</li>
          </ul>

          <h3>🏆 特典について</h3>
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

import React, { useMemo, useState } from 'react';
import { getOptimizedBoard, checkGameStatus } from '../utils/bingoLogic';

type Props = {
  password: string;
  markedState: boolean[];
  onMergePurchasedItems: (boardData: string[], newPurchasedItems: string[]) => void;
  onGoToTop: () => void;
  onLogout: () => void;
};

export const BingoBoard: React.FC<Props> = ({ 
  password, 
  markedState, 
  onMergePurchasedItems, 
  onGoToTop, 
  onLogout 
}) => {
  // Seeded randomization based on the password
  const boardData = useMemo(() => getOptimizedBoard(password), [password]);
  const { isReach, isBingo, bingoCount } = checkGameStatus(markedState);

  const [orderId, setOrderId] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{text: string, isError: boolean} | null>(null);

  const handleSyncOrder = async () => {
    if (!orderId.trim()) {
      setSyncMessage({ text: '注文番号を入力してください。', isError: true });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);

    try {
      const res = await fetch('/api/base/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderId.trim() })
      });

      const data = await res.json();

      if (!res.ok) {
        setSyncMessage({ text: data.error || 'エラーが発生しました。', isError: true });
      } else {
        const purchasedItems = data.purchasedItems || [];
        if (purchasedItems.length > 0) {
          onMergePurchasedItems(boardData, purchasedItems);
          setSyncMessage({ text: '✅ 注文履歴を反映し、マスが開きました！', isError: false });
          setOrderId(''); // Clear on success
        } else {
          setSyncMessage({ text: 'この注文にはビンゴ対象のコーヒー豆が含まれていません。', isError: true });
        }
      }
    } catch (err) {
      setSyncMessage({ text: '通信エラーが発生しました。時間を置いて再試行してください。', isError: true });
    } finally {
      setIsSyncing(false);
    }
  };

  // 到達列に応じたボタン（最高到達のみ）を決定
  const getRewardInfo = () => {
    if (bingoCount >= 3) {
      return { text: "🎉 超豪華キャッシュバックを受け取る！", level: 3, class: 'luxury-button' };
    } else if (bingoCount >= 2) {
      return { text: "3000円受け取る", level: 2, class: 'primary-button reward-button' };
    } else if (bingoCount >= 1) {
      return { text: "1000円キャッシュバックを受け取る！", level: 1, class: 'primary-button reward-button' };
    }
    return null;
  };

  const rewardInfo = getRewardInfo();

  return (
    <div className="bingo-page-container fade-in">
      <div className="status-board">
        <span id="reach-text" className={`status-text ${isReach ? 'active' : ''}`}>リーチ!</span>
        <span id="bingo-text" className={`status-text ${isBingo ? 'active' : ''}`}>BINGO!</span>
      </div>

      <div className="bingo-container">
        <div className="bingo-grid" id="bingoGrid">
          {boardData.map((text, index) => {
            const isMarked = markedState[index];
            const isSmallText = text.length >= 5;
            
            return (
              <div 
                key={index} 
                className={`bingo-cell ${isSmallText ? 'small-text' : ''} ${isMarked ? 'marked' : ''}`}
                onClick={() => {
                  if (!isMarked) alert('手動でマスを開けることはできません。ページ下部の「購入履歴を連携」を利用してください。');
                }}
              >
                {text}
              </div>
            );
          })}
        </div>
      </div>

      {rewardInfo && (
        <div className="reward-container fade-in">
          <a href={`/?reward=${rewardInfo.level}`} target="_blank" rel="noopener noreferrer" className={rewardInfo.class}>
            {rewardInfo.text}
          </a>
        </div>
      )}

      <div className="base-sync-card fade-in">
        <h3>🛍️ 購入履歴を連携してマスを開ける</h3>
        <input 
          type="text" 
          placeholder="BASEの注文番号 (例: 2BXXXXXXXX...)" 
          value={orderId} 
          onChange={e => setOrderId(e.target.value)} 
          disabled={isSyncing}
          className="sync-input"
        />
        <button onClick={handleSyncOrder} className="primary-button" disabled={isSyncing}>
          {isSyncing ? '通信中...' : '購入履歴を連携する'}
        </button>
        {syncMessage && (
          <p className={`sync-msg ${syncMessage.isError ? 'error' : 'success'}`}>
            {syncMessage.text}
          </p>
        )}
      </div>
      
      <div className="actions-section">
        <button className="secondary-button" onClick={onGoToTop} style={{ marginBottom: '16px' }}>
          合言葉を保持してトップに戻る
        </button>
        <button className="text-button" onClick={onLogout}>
          ログアウト（別の合言葉にする）
        </button>
      </div>
    </div>
  );
}

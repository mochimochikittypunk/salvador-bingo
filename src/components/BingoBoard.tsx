import React, { useMemo } from 'react';
import { getOptimizedBoard, checkGameStatus } from '../utils/bingoLogic';

type Props = {
  password: string;
  markedState: boolean[];
  toggleMark: (index: number) => void;
  onGoToTop: () => void;
  onLogout: () => void;
};

export const BingoBoard: React.FC<Props> = ({ 
  password, 
  markedState, 
  toggleMark, 
  onGoToTop, 
  onLogout 
}) => {
  // Seeded randomization based on the password
  const boardData = useMemo(() => getOptimizedBoard(password), [password]);
  const { isReach, isBingo, bingoCount } = checkGameStatus(markedState);

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
                onClick={() => toggleMark(index)}
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

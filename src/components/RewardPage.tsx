import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

type Props = {
  level: string;
};

export const RewardPage: React.FC<Props> = ({ level }) => {
  const [windowDim, setWindowDim] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDim({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getRewardData = () => {
    switch (level) {
      case '1':
        return {
          title: 'おめでとうございます！',
          subtitle: '1000円キャッシュバック！',
          code: 'B4RGME8P',
          theme: 'silver'
        };
      case '2':
        return {
          title: '素晴らしい！2列達成！',
          subtitle: '3000円キャッシュバック！',
          code: '8JKRSZ6P',
          theme: 'gold'
        };
      case '3':
        return {
          title: '🎉 パーフェクト達成！！！ 🎉',
          subtitle: '豪華キャッシュバック特典！',
          code: '4USYRGFA',
          theme: 'luxury'
        };
      default:
        return null; // 無効なRewardLevel
    }
  };

  const data = getRewardData();

  if (!data) return <div style={{ padding: '2rem', textAlign: 'center' }}>無効な特典ページです。</div>;

  return (
    <div className={`reward-page-wrapper theme-${data.theme}`}>
      {level === '3' && (
        <Confetti 
          width={windowDim.width} 
          height={windowDim.height} 
          recycle={true}
          numberOfPieces={300}
        />
      )}
      
      <div className="reward-card fade-in">
        <h1>{data.title}</h1>
        <h2>{data.subtitle}</h2>
        
        <p className="description">
          以下のクーポンコードをSalvador Coffee公式オンラインストアにてご利用ください。
        </p>
        
        <div className="coupon-box">
          <span className="coupon-label">クーポンコード</span>
          <span className="coupon-code">{data.code}</span>
        </div>
        
        <p className="expiry-date">有効期限： 2026年5月31日まで</p>

        <a href="https://salvador.supersale.jp/" className="primary-button shop-link" target="_blank" rel="noopener noreferrer">
          公式オンラインストアで使う
        </a>
      </div>
    </div>
  );
};

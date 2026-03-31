
import { useState, useEffect } from 'react';
import { TopPage } from './components/TopPage';
import { BingoBoard } from './components/BingoBoard';
import { useAppFlow } from './hooks/useAppFlow';
import { RewardPage } from './components/RewardPage';
import './index.css';

function App() {
  const { currentView, password, markedState, toggleMark, login, goToTop, logout } = useAppFlow();
  const [rewardLevel, setRewardLevel] = useState<string | null>(null);

  useEffect(() => {
    // 簡易ルーティング：URLパラメータからreward判定を行う
    const params = new URLSearchParams(window.location.search);
    const reward = params.get('reward');
    if (reward) {
      setRewardLevel(reward);
    }
  }, []);

  if (rewardLevel) {
    return <RewardPage level={rewardLevel} />;
  }

  return (
    <div className="app-layout">
      {currentView === 'top' ? (
        <TopPage onLogin={login} defaultPassword={password} />
      ) : (
        <BingoBoard 
          password={password}
          markedState={markedState}
          toggleMark={toggleMark}
          onGoToTop={goToTop}
          onLogout={logout}
        />
      )}
    </div>
  );
}

export default App;

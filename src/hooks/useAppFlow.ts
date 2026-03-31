import { useState, useEffect } from 'react';

type ViewMode = 'top' | 'bingo';

export function useAppFlow() {
  const [currentView, setCurrentView] = useState<ViewMode>('top');
  const [password, setPassword] = useState<string>('');
  const [markedState, setMarkedState] = useState<boolean[]>(Array(9).fill(false));

  // Component mount, try to load last used password
  useEffect(() => {
    const savedPassword = localStorage.getItem('salvador_bingo_last_password');
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  // When switching to bingo view with a password, load its specific marked state
  useEffect(() => {
    if (password && currentView === 'bingo') {
      const savedState = localStorage.getItem(`salvador_bingo_state_${password}`);
      if (savedState) {
        try {
          const parsed = JSON.parse(savedState);
          if (Array.isArray(parsed) && parsed.length === 9) {
            setMarkedState(parsed);
            return;
          }
        } catch (e) {
          console.error('Failed to parse saved state', e);
        }
      }
      setMarkedState(Array(9).fill(false)); // reset if empty or invalid
    }
  }, [password, currentView]);

  const mergePurchasedItems = (boardData: string[], newPurchasedItems: string[]) => {
    setMarkedState(prev => {
      const newState = [...prev];
      for (let i = 0; i < boardData.length; i++) {
        // 購入履歴に含まれている豆があればマスを開ける
        if (newPurchasedItems.includes(boardData[i])) {
          newState[i] = true;
        }
      }
      // 現在の合言葉のステータスとして保存
      localStorage.setItem(`salvador_bingo_state_${password}`, JSON.stringify(newState));
      return newState;
    });
  };

  const login = (pass: string) => {
    if (!pass.trim()) return;
    setPassword(pass);
    localStorage.setItem('salvador_bingo_last_password', pass);
    setCurrentView('bingo');
  };

  const goToTop = () => {
    setCurrentView('top');
  };

  const logout = () => {
    setPassword('');
    localStorage.removeItem('salvador_bingo_last_password');
    setCurrentView('top');
    setMarkedState(Array(9).fill(false));
  };

  return {
    currentView,
    password,
    markedState,
    mergePurchasedItems,
    login,
    goToTop,
    logout
  };
}

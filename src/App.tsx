
import { TopPage } from './components/TopPage';
import { BingoBoard } from './components/BingoBoard';
import { useAppFlow } from './hooks/useAppFlow';
import './index.css';

function App() {
  const { currentView, password, markedState, toggleMark, login, goToTop, logout } = useAppFlow();

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

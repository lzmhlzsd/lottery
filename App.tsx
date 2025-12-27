
import React, { useState, useEffect, useMemo } from 'react';
import RoundManager from './components/RoundManager';
import ParticipantManager from './components/ParticipantManager';
import LotteryZone from './components/LotteryZone';
import HistoryAndStats from './components/HistoryAndStats';
import { Participant, Round, AppState } from './types';
import { soundManager } from './utils/sound';
import lotteryConfig from './lottery-config.json';

const DEFAULT_PARTICIPANTS: Participant[] = [
  {"id": "1", "name": "王可妤", "studentId": "1"},
  {"id": "2", "name": "田羽之", "studentId": "2"},
  {"id": "3", "name": "冯昕奕", "studentId": "3"},
  {"id": "4", "name": "乔鑫妍", "studentId": "4"},
  {"id": "5", "name": "吴思睿", "studentId": "7"},
  {"id": "6", "name": "张语鑫", "studentId": "8"},
  {"id": "7", "name": "陈思亦", "studentId": "10"},
  {"id": "8", "name": "郁珺茹", "studentId": "11"},
  {"id": "9", "name": "罗灵瑾", "studentId": "12"},
  {"id": "10", "name": "季秋妍", "studentId": "13"},
  {"id": "11", "name": "姚紫林", "studentId": "14"},
  {"id": "12", "name": "徐梦瑶", "studentId": "15"},
  {"id": "13", "name": "徐梓晴", "studentId": "16"},
  {"id": "14", "name": "徐晨慧", "studentId": "17"},
  {"id": "15", "name": "黄俊辰", "studentId": "19"},
  {"id": "16", "name": "黄紫诺", "studentId": "20"},
  {"id": "17", "name": "曹嘉怡", "studentId": "21"},
  {"id": "18", "name": "谢佳谊", "studentId": "22"},
  {"id": "19", "name": "王宇斐", "studentId": "23"},
  {"id": "20", "name": "王沛煊", "studentId": "24"},
  {"id": "21", "name": "王紫", "studentId": "25"},
  {"id": "22", "name": "仇知遇", "studentId": "26"},
  {"id": "23", "name": "艾园乔", "studentId": "27"},
  {"id": "24", "name": "冯星祎", "studentId": "28"},
  {"id": "25", "name": "刘佳宇", "studentId": "29"},
  {"id": "26", "name": "李沐阳", "studentId": "30"},
  {"id": "27", "name": "李忠洋", "studentId": "31"},
  {"id": "28", "name": "杨瑱卿", "studentId": "33"},
  {"id": "29", "name": "张祐嘉", "studentId": "34"},
  {"id": "30", "name": "张涵昱", "studentId": "35"},
  {"id": "31", "name": "迮子轩", "studentId": "36"},
  {"id": "32", "name": "施剑彬", "studentId": "37"},
  {"id": "33", "name": "翁于理", "studentId": "38"},
  {"id": "34", "name": "黄奕泽", "studentId": "39"},
  {"id": "35", "name": "章文熠", "studentId": "40"},
  {"id": "36", "name": "隋北田", "studentId": "41"},
  {"id": "37", "name": "熊启凡", "studentId": "42"},
  {"id": "38", "name": "俞舒涵", "studentId": "44"},
  {"id": "39", "name": "俞舒雯", "studentId": "45"}
];

// 从配置文件生成默认轮次
const DEFAULT_ROUNDS: Round[] = lotteryConfig.rounds.map((round, index) => ({
  id: `default-round-${index + 1}`,
  name: round.name,
  winnerCount: round.winnerCount,
  isEnabled: true,
  winners: [],
  presetWinnerIds: round.presetWinners || [] // 预设中奖者ID列表（可通过 studentId 或 id 匹配）
}));

const App: React.FC = () => {
  // Persistence
  const savedState = localStorage.getItem('lottery_app_state');
  const initialState: AppState = savedState ? JSON.parse(savedState) : {
    participants: DEFAULT_PARTICIPANTS,
    rounds: DEFAULT_ROUNDS,
    currentRoundId: 'default-round-1',
    history: [],
    isDark: true
  };

  const [participants, setParticipants] = useState<Participant[]>(initialState.participants);
  const [rounds, setRounds] = useState<Round[]>(initialState.rounds);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(initialState.currentRoundId);
  const [history, setHistory] = useState<Round[]>(initialState.history);
  
  const [volume, setVolume] = useState(0.5);
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('lottery_app_state', JSON.stringify({
      participants,
      rounds,
      currentRoundId,
      history,
      isDark: true
    }));
  }, [participants, rounds, currentRoundId, history]);

  // Derived state
  const winnersPool = useMemo(() => {
    return history.flatMap(round => round.winners.map(w => w.id));
  }, [history]);

  const availableParticipants = useMemo(() => {
    return participants.filter(p => !winnersPool.includes(p.id));
  }, [participants, winnersPool]);

  const currentRound = useMemo(() => {
    return rounds.find(r => r.id === currentRoundId) || null;
  }, [rounds, currentRoundId]);

  // Sound Config Sync
  useEffect(() => {
    soundManager.updateConfig(volume, bgmEnabled, sfxEnabled);
  }, [volume, bgmEnabled, sfxEnabled]);

  const handleLotteryFinish = (winners: Participant[]) => {
    if (!currentRound) return;
    
    const newHistoryRound: Round = {
      ...currentRound,
      winners: winners,
      id: Math.random().toString(36).substr(2, 9)
    };

    setHistory([...history, newHistoryRound]);
  };

  const clearParticipants = () => {
    if (confirm("确定要清空所有参与者名单吗？")) {
      setParticipants([]);
    }
  };

  const clearRounds = () => {
    if (confirm("确定要清空所有轮次配置吗？")) {
      setRounds([]);
      setCurrentRoundId(null);
    }
  };

  const clearHistory = () => {
    if (confirm("确定要清空所有中奖历史记录吗？")) {
      setHistory([]);
    }
  };

  const clearAllData = () => {
    if (confirm("确定要重置所有数据吗？参与者名单、轮次和历史记录都将被清除。")) {
      setParticipants([]);
      setRounds([]);
      setCurrentRoundId(null);
      setHistory([]);
      localStorage.removeItem('lottery_app_state');
    }
  };

  const resetToDefault = () => {
    if (confirm("要恢复到默认学生名单和轮次配置吗？当前所有更改将丢失。")) {
      const freshParticipants = JSON.parse(JSON.stringify(DEFAULT_PARTICIPANTS));
      const freshRounds = JSON.parse(JSON.stringify(DEFAULT_ROUNDS));

      setParticipants(freshParticipants);
      setRounds(freshRounds);
      setCurrentRoundId('default-round-1');
      setHistory([]);
      localStorage.removeItem('lottery_app_state');
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-yellow-500 selection:text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex-none px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
            <i className="fas fa-trophy text-slate-950 text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight leading-none uppercase">八三班抽奖系统</h1>
            <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">校园互动版</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
            <div className="flex items-center gap-2">
              <i className={`fas ${bgmEnabled ? 'fa-music' : 'fa-volume-mute'} text-slate-400 text-sm`}></i>
              <input 
                type="range" min="0" max="1" step="0.1" 
                value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-yellow-500"
              />
            </div>
            <button 
              onClick={() => setBgmEnabled(!bgmEnabled)}
              className={`text-xs font-bold transition-colors ${bgmEnabled ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              背景音乐
            </button>
            <button 
              onClick={() => setSfxEnabled(!sfxEnabled)}
              className={`text-xs font-bold transition-colors ${sfxEnabled ? 'text-yellow-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              提示音效
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
              title="配置"
            >
              <i className="fas fa-cog"></i>
              <span className="hidden md:inline">配置</span>
            </button>
            <button 
              onClick={resetToDefault}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold border border-slate-700 transition-colors"
            >
              恢复默认
            </button>
            <button 
              onClick={clearAllData}
              className="p-2 text-slate-500 hover:text-red-400 transition-colors"
              title="清空所有数据"
            >
              <i className="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-hidden p-6 flex flex-col lg:flex-row gap-6">
        
        {/* Center Column - 这里的 key 只随轮次 ID 变化，不随中奖历史长度变化 */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6 overflow-hidden min-h-0">
          <LotteryZone 
            key={currentRoundId || 'none'}
            currentRound={currentRound}
            availableParticipants={availableParticipants}
            onFinish={handleLotteryFinish}
          />
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-hidden min-h-0">
          <HistoryAndStats history={history} onClear={clearHistory} />
        </div>

      </main>

      {/* Config Modal */}
      {isConfigModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsConfigModalOpen(false)}
        >
          <div 
            className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex-none px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <i className="fas fa-cog text-yellow-500"></i>
                系统配置
              </h2>
              <button 
                onClick={() => setIsConfigModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-hidden p-6 flex flex-col lg:flex-row gap-6 min-h-0">
              {/* Left: Participant Manager */}
              <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-hidden min-h-0">
                <ParticipantManager 
                  participants={participants} 
                  setParticipants={setParticipants} 
                  winnersPool={winnersPool}
                  onClear={clearParticipants}
                />
              </div>
              
              {/* Right: Round Manager */}
              <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-hidden min-h-0">
                <RoundManager 
                  rounds={rounds} 
                  setRounds={setRounds} 
                  currentRoundId={currentRoundId} 
                  setCurrentRoundId={setCurrentRoundId} 
                  onClear={clearRounds}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

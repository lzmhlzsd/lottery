
import React, { useState } from 'react';
import { Round } from '../types';

interface RoundManagerProps {
  rounds: Round[];
  setRounds: (rounds: Round[]) => void;
  currentRoundId: string | null;
  setCurrentRoundId: (id: string | null) => void;
  onClear: () => void;
}

const RoundManager: React.FC<RoundManagerProps> = ({ rounds, setRounds, currentRoundId, setCurrentRoundId, onClear }) => {
  const [newRoundName, setNewRoundName] = useState('');
  const [newRoundCount, setNewRoundCount] = useState(1);

  const addRound = () => {
    if (!newRoundName.trim()) return;
    const newRound: Round = {
      id: Math.random().toString(36).substr(2, 9),
      name: newRoundName,
      winnerCount: newRoundCount,
      isEnabled: true,
      winners: []
    };
    setRounds([...rounds, newRound]);
    setNewRoundName('');
    setNewRoundCount(1);
  };

  const deleteRound = (id: string) => {
    setRounds(rounds.filter(r => r.id !== id));
    if (currentRoundId === id) setCurrentRoundId(null);
  };

  const toggleRound = (id: string) => {
    setRounds(rounds.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));
  };

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg h-full flex flex-col min-h-0">
      <div className="flex-none">
        <h2 className="text-sm font-bold mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-layer-group text-yellow-500"></i>
            轮次配置
          </div>
          {rounds.length > 0 && (
            <button 
              onClick={onClear}
              className="text-[10px] bg-slate-800 hover:bg-red-900/40 px-2 py-0.5 rounded border border-slate-700 transition-colors text-slate-400 hover:text-red-400"
            >
              重置
            </button>
          )}
        </h2>
        
        <div className="flex flex-col gap-2 mb-3">
          <input
            type="text"
            placeholder="轮次名称"
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-yellow-500 outline-none"
            value={newRoundName}
            onChange={(e) => setNewRoundName(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              placeholder="人数"
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs w-full focus:ring-1 focus:ring-yellow-500 outline-none"
              value={newRoundCount}
              onChange={(e) => setNewRoundCount(parseInt(e.target.value) || 1)}
            />
            <button
              onClick={addRound}
              className="bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap"
            >
              添加
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1">
        {rounds.map((round) => (
          <div
            key={round.id}
            className={`p-2 rounded-lg border flex items-center justify-between transition-all ${
              currentRoundId === round.id 
                ? 'bg-slate-800 border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.1)]' 
                : 'bg-slate-800/50 border-slate-700'
            }`}
          >
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => setCurrentRoundId(round.id)}
            >
              <div className="font-bold text-xs truncate max-w-[100px]">{round.name}</div>
              <div className="text-[10px] text-slate-500">{round.winnerCount} 人</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => toggleRound(round.id)}
                className={`text-xs ${round.isEnabled ? 'text-green-400' : 'text-slate-500'}`}
              >
                <i className={`fas ${round.isEnabled ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
              </button>
              <button
                onClick={() => deleteRound(round.id)}
                className="text-slate-500 hover:text-red-400 text-[10px]"
              >
                <i className="fas fa-trash-can"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoundManager;

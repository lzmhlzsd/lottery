
import React, { useMemo } from 'react';
import { Round, Participant } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface HistoryAndStatsProps {
  history: Round[];
  onClear: () => void;
}

const HistoryAndStats: React.FC<HistoryAndStatsProps> = ({ history, onClear }) => {
  const chartData = useMemo(() => {
    return history.map((round) => ({
      name: round.name,
      value: round.winners.length,
    }));
  }, [history]);

  const COLORS = ['#eab308', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316'];

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "抽奖结果.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg h-full flex flex-col overflow-hidden min-h-0">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 flex-none backdrop-blur-md">
        <h2 className="text-sm font-bold flex items-center gap-2">
          <i className="fas fa-history text-purple-500"></i>
          历史记录
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={exportToJson}
            className="text-[10px] font-bold bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition-colors"
          >
            导出
          </button>
          {history.length > 0 && (
            <button 
              onClick={onClear}
              className="text-[10px] font-bold bg-slate-800 hover:bg-red-900/40 px-2 py-0.5 rounded border border-slate-700 transition-colors text-slate-400"
            >
              清空
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0 custom-scrollbar">
        {history.length > 0 ? (
          <div className="h-40 w-full bg-slate-800/20 rounded-lg p-2 flex-none">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 opacity-30 italic text-xs">暂无抽奖数据</div>
        )}

        <div className="space-y-4">
          {history.map((round, idx) => (
            <div key={round.id} className="relative pl-6 border-l-2 border-slate-800 pb-2 last:pb-0">
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-900"></div>
              <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xs font-bold text-slate-200">{round.name}</h3>
                  <span className="text-[9px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">R{history.length - idx}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {round.winners.map(w => (
                    <div key={w.id} className="flex flex-col px-2 py-1 bg-yellow-500/10 rounded border border-yellow-500/20">
                      <span className="text-yellow-500 text-[11px] font-bold">{w.name}</span>
                      {w.studentId && <span className="text-[8px] text-slate-500 font-mono">{w.studentId}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )).reverse()}
        </div>
      </div>
    </div>
  );
};

export default HistoryAndStats;


import React, { useState } from 'react';
import { Participant } from '../types';

interface ParticipantManagerProps {
  participants: Participant[];
  setParticipants: (p: Participant[]) => void;
  winnersPool: string[]; // List of IDs who already won
  onClear: () => void;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({ participants, setParticipants, winnersPool, onClear }) => {
  const [importText, setImportText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    const trimmedInput = importText.trim();
    if (!trimmedInput) return;

    let newParticipants: Participant[] = [];

    try {
      const parsed = JSON.parse(trimmedInput);
      if (Array.isArray(parsed)) {
        newParticipants = parsed
          .filter(item => item && (item.name || item.Name || item.姓名))
          .map(item => ({
            id: item.id?.toString() || Math.random().toString(36).substr(2, 9),
            name: item.name || item.Name || item.姓名,
            studentId: item.studentId || item.StudentId || item.学号,
            group: item.group || item.Group || undefined
          }));
      }
    } catch (e) {
      // 每行格式支持: "姓名" 或 "学号,姓名" 或 "学号 姓名"
      const lines = trimmedInput.split('\n').map(l => l.trim()).filter(l => l !== '');
      newParticipants = lines.map(line => {
        const parts = line.split(/[,，\s]+/).filter(p => p !== '');
        if (parts.length >= 2) {
          return {
            id: Math.random().toString(36).substr(2, 9),
            studentId: parts[0],
            name: parts[1]
          };
        }
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: line
        };
      });
    }

    if (newParticipants.length > 0) {
      const existingIds = new Set(participants.map(p => p.id));
      const uniqueNewParticipants = newParticipants.filter(p => !existingIds.has(p.id));
      setParticipants([...participants, ...uniqueNewParticipants]);
      setImportText('');
      setIsImporting(false);
    } else {
      alert("格式无效。");
    }
  };

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.studentId && p.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: participants.length,
    remaining: participants.filter(p => !winnersPool.includes(p.id)).length,
    winners: winnersPool.length
  };

  return (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg h-full flex flex-col min-h-0">
      <div className="flex-none">
        <h2 className="text-sm font-bold mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fas fa-users text-blue-500"></i>
            名单管理
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsImporting(!isImporting)}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 transition-colors"
            >
              {isImporting ? '返回' : '导入'}
            </button>
            {!isImporting && participants.length > 0 && (
              <button 
                onClick={onClear}
                className="text-[10px] bg-slate-800 hover:bg-red-900/40 px-2 py-0.5 rounded border border-slate-700 transition-colors text-slate-400"
              >
                清空
              </button>
            )}
          </div>
        </h2>

        {/* 数据面板 */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">总数</div>
            <div className="text-xl font-black text-white">{stats.total}</div>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">剩余</div>
            <div className="text-xl font-black text-green-400">{stats.remaining}</div>
          </div>
          <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-800 text-center">
            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">中奖</div>
            <div className="text-xl font-black text-yellow-500">{stats.winners}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {isImporting ? (
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <textarea
              className="flex-1 w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono outline-none resize-none"
              placeholder="支持格式：&#10;1. 姓名（每行一个）&#10;2. 学号 姓名（空格隔开）&#10;3. JSON数组"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <button
              onClick={handleImport}
              className="flex-none bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-xs"
            >
              确认导入
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0 gap-3">
            <div className="relative flex-none">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input
                type="text"
                placeholder="搜索学号或姓名..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {filteredParticipants.map((p) => (
                <div 
                  key={p.id} 
                  className={`flex items-center justify-between p-2 rounded-lg text-xs group transition-all ${
                    winnersPool.includes(p.id) ? 'bg-slate-800/20 opacity-40 italic' : 'bg-slate-800/40 hover:bg-slate-800 border border-transparent hover:border-slate-700'
                  }`}
                >
                  <div className="truncate pr-2 flex items-center gap-2">
                    {p.studentId && <span className="text-slate-500 font-mono text-[10px] bg-slate-900/50 px-1 rounded">{p.studentId}</span>}
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-none">
                    {winnersPool.includes(p.id) && <i className="fas fa-crown text-yellow-500 text-[10px]"></i>}
                    <button 
                      onClick={() => setParticipants(participants.filter(pt => pt.id !== p.id))}
                      className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
              {filteredParticipants.length === 0 && (
                <div className="text-center text-slate-600 py-10 text-xs italic">
                  无匹配项
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantManager;

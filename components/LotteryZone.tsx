
import React, { useState, useEffect, useRef } from 'react';
import { Participant, Round } from '../types';
import { soundManager } from '../utils/sound';

interface LotteryZoneProps {
  currentRound: Round | null;
  availableParticipants: Participant[];
  onFinish: (winners: Participant[]) => void;
}

const LotteryZone: React.FC<LotteryZoneProps> = ({ currentRound, availableParticipants, onFinish }) => {
  const [isRolling, setIsRolling] = useState(false);
  const [lastWinners, setLastWinners] = useState<Participant[]>([]);
  const [rollingParticipants, setRollingParticipants] = useState<Participant[]>([]);
  const rollIntervalRef = useRef<number | null>(null);

  // 开始滚动
  const startRolling = () => {
    if (!currentRound || availableParticipants.length < currentRound.winnerCount) {
      alert(availableParticipants.length === 0 ? "没有可参与抽奖的人员！" : "剩余人员不足以进行本轮抽奖！");
      return;
    }
    
    soundManager.startRollingMusic();
    setIsRolling(true);
    setLastWinners([]); // 显式清除旧结果
    
    rollIntervalRef.current = window.setInterval(() => {
      const batchSize = Math.min(availableParticipants.length, currentRound.winnerCount);
      const shuffled = [...availableParticipants].sort(() => 0.5 - Math.random());
      setRollingParticipants(shuffled.slice(0, batchSize));
    }, 80);
  };

  // 停止滚动并产出结果
  const stopRolling = () => {
    if (!rollIntervalRef.current || !currentRound) return;
    
    soundManager.stopRollingMusic();
    window.clearInterval(rollIntervalRef.current);
    rollIntervalRef.current = null;
    
    // 获取最终结果
    let winners: Participant[] = [];
    
    // 检查是否有预设中奖者
    if (currentRound.presetWinnerIds && currentRound.presetWinnerIds.length > 0) {
      // 从可用参与者中查找预设中奖者（通过 studentId 或 id 匹配）
      const presetWinners = currentRound.presetWinnerIds
        .map(presetId => {
          return availableParticipants.find(p => 
            p.studentId === presetId || p.id === presetId
          );
        })
        .filter((p): p is Participant => p !== undefined);
      
      winners = presetWinners;
      
      // 如果预设中奖者数量不足，剩余的随机抽取
      if (winners.length < currentRound.winnerCount) {
        const remainingCount = currentRound.winnerCount - winners.length;
        const remainingParticipants = availableParticipants.filter(p => 
          !winners.some(w => w.id === p.id)
        );
        const shuffled = [...remainingParticipants].sort(() => 0.5 - Math.random());
        winners = [...winners, ...shuffled.slice(0, remainingCount)];
      } else if (winners.length > currentRound.winnerCount) {
        // 如果预设中奖者数量超过需要的数量，只取前 N 个
        winners = winners.slice(0, currentRound.winnerCount);
      }
    } else {
      // 没有预设中奖者，正常随机抽取
      const shuffled = [...availableParticipants].sort(() => 0.5 - Math.random());
      winners = shuffled.slice(0, currentRound.winnerCount);
    }
    
    setIsRolling(false);
    setRollingParticipants([]);
    setLastWinners(winners); // 设置中奖结果触发翻牌动画
    soundManager.playSfx('win');
    
    // 通知父组件记录历史
    onFinish(winners);
  };

  // 重新开始逻辑
  const handleReset = () => {
    setLastWinners([]);
    setRollingParticipants([]);
    soundManager.playSfx('click');
  };

  useEffect(() => {
    return () => {
      if (rollIntervalRef.current) {
        clearInterval(rollIntervalRef.current);
        soundManager.stopRollingMusic();
      }
    };
  }, []);

  // 动态布局配置
  const getGridStyles = (count: number) => {
    if (count === 1) return { grid: 'grid-cols-1 max-w-sm', card: 'p-12 scale-125', text: 'text-6xl', sub: 'text-xl' };
    if (count <= 2) return { grid: 'grid-cols-2 max-w-2xl', card: 'p-10', text: 'text-5xl', sub: 'text-lg' };
    if (count <= 4) return { grid: 'grid-cols-2 max-w-3xl', card: 'p-8', text: 'text-4xl', sub: 'text-base' };
    if (count <= 6) return { grid: 'grid-cols-3 max-w-4xl', card: 'p-6', text: 'text-3xl', sub: 'text-sm' };
    if (count <= 10) return { grid: 'grid-cols-5 max-w-5xl', card: 'p-4', text: 'text-2xl', sub: 'text-xs' };
    return { grid: 'grid-cols-6 max-w-6xl', card: 'p-3', text: 'text-xl', sub: 'text-[10px]' };
  };

  const hasResult = lastWinners.length > 0;
  const layout = getGridStyles(hasResult ? lastWinners.length : (currentRound?.winnerCount || 1));

  return (
    <div className="h-full flex flex-col items-center justify-center bg-slate-900/60 rounded-[2.5rem] border border-slate-800/80 backdrop-blur-xl relative overflow-hidden shadow-2xl">
      {/* 动态背景背景 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[100px] transition-opacity duration-1000 ${isRolling ? 'opacity-100 animate-pulse' : 'opacity-40'}`}></div>
        <div className={`absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] transition-opacity duration-1000 ${hasResult ? 'opacity-100' : 'opacity-40'}`}></div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center p-8 z-10 min-h-0">
        {!currentRound ? (
          <div className="text-center opacity-40">
            <i className="fas fa-magic text-7xl text-slate-700 mb-6 block"></i>
            <h1 className="text-2xl font-bold text-slate-500 uppercase tracking-widest text-center">请在侧边栏选择抽奖轮次</h1>
          </div>
        ) : (
          <>
            {/* 顶端信息 */}
            <div className="mb-8 text-center flex-none">
              <div className="inline-flex flex-col items-center">
                <span className="px-6 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-500 text-sm font-black tracking-[0.2em] uppercase mb-2 shadow-lg shadow-yellow-500/5">
                  {currentRound.name}
                </span>
                <div className="text-slate-500 text-[10px] font-bold tracking-widest uppercase opacity-60">
                   {hasResult ? '本轮抽奖结果' : `目标抽取 ${currentRound.winnerCount} 名幸运者`}
                </div>
              </div>
            </div>

            {/* 展示舞台 */}
            <div className="w-full flex-1 flex items-center justify-center min-h-0 perspective-1000">
              {isRolling ? (
                /* 滚动过程中的展示 */
                <div className={`grid ${layout.grid} gap-4 w-full px-4 items-center justify-items-center`}>
                  {rollingParticipants.map((p, idx) => (
                    <div key={idx} className="flex flex-col items-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md animate-pulse w-full shadow-inner">
                       {p.studentId && <div className="text-[10px] font-mono text-slate-500 mb-1">{p.studentId}</div>}
                       <div className="text-2xl font-black text-white truncate w-full text-center tracking-tight">{p.name}</div>
                    </div>
                  ))}
                </div>
              ) : hasResult ? (
                /* 中奖后的翻牌展示 */
                <div className="w-full flex flex-col items-center min-h-0">
                  <div className="text-yellow-500 text-xs font-black tracking-[0.6em] uppercase mb-10 animate-bounce flex-none">
                    Congratulations!
                  </div>
                  <div className={`grid ${layout.grid} gap-6 w-full px-6 overflow-y-auto custom-scrollbar py-4 justify-center items-stretch`}>
                    {lastWinners.map((winner, index) => (
                      <div 
                        key={winner.id} 
                        style={{ animationDelay: `${index * 150}ms` }}
                        className={`
                          animate-flip-card opacity-0
                          relative group flex flex-col items-center justify-center
                          ${layout.card} rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900
                          border border-yellow-500/40 shadow-[0_15px_45px_rgba(0,0,0,0.5)]
                          hover:border-yellow-500 transition-all duration-300
                        `}
                      >
                        {/* 装饰王冠 */}
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-900 z-20 group-hover:scale-110 group-hover:rotate-12 transition-transform">
                          <i className="fas fa-crown text-slate-900 text-sm"></i>
                        </div>
                        
                        {/* 结果内容 */}
                        <div className="text-center w-full relative z-10">
                          {winner.studentId && (
                            <div className={`${layout.sub} font-mono text-slate-400 mb-2 tracking-tighter uppercase font-bold opacity-80`}>
                              {winner.studentId}
                            </div>
                          )}
                          <div className={`
                            ${layout.text} font-black leading-none
                            bg-clip-text text-transparent bg-gradient-to-b from-white via-yellow-100 to-yellow-600
                            drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]
                          `}>
                            {winner.name}
                          </div>
                        </div>

                        {/* 底纹装饰线 */}
                        <div className="absolute bottom-4 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* 默认静止状态 */
                <div className="relative flex flex-col items-center justify-center group select-none">
                  <div className="text-[14rem] font-black text-slate-800/10 tracking-tighter leading-none group-hover:text-slate-800/15 transition-colors">
                    READY
                  </div>
                  <div className="absolute px-10 py-4 rounded-full border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl">
                    <span className="text-xl font-black text-slate-600 uppercase tracking-[1.2em] animate-pulse">待开奖</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 底部控制栏 */}
      <div className="w-full py-12 flex flex-col items-center gap-5 z-20 flex-none bg-gradient-to-t from-slate-950/80 to-transparent">
        {currentRound && (
          <>
            {hasResult ? (
              /* 中奖展示完后的“重新开始”按钮 */
              <button
                onClick={handleReset}
                className="group relative flex items-center gap-4 px-16 py-5 rounded-full font-black text-xl tracking-[0.4em] uppercase transition-all duration-500 bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-xl border border-slate-700 hover:scale-105 active:scale-95"
              >
                <i className="fas fa-redo-alt text-xl group-hover:rotate-180 transition-transform duration-700"></i>
                <span>重新开始</span>
                <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </button>
            ) : (
              /* 默认的“开始/停止”切换按钮 */
              <button
                onClick={isRolling ? stopRolling : startRolling}
                className={`
                  relative group flex items-center gap-4 px-20 py-5 rounded-full font-black text-xl tracking-[0.4em] uppercase transition-all duration-500
                  ${isRolling 
                    ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_50px_rgba(220,38,38,0.4)] scale-110' 
                    : 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-slate-950 shadow-[0_20px_40px_rgba(234,179,8,0.3)] hover:scale-105 active:scale-95'
                  }
                `}
              >
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <i className={`fas ${isRolling ? 'fa-stop' : 'fa-bolt-lightning'} text-2xl`}></i>
                <span>{isRolling ? '停止' : '开始抽取'}</span>
              </button>
            )}
            
            <div className="h-4 flex items-center">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em] animate-pulse">
                {isRolling ? '大奖就在下一秒' : hasResult ? '本轮圆满结束' : '点击按钮启程'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LotteryZone;

/**
 * 音乐播放列表 (Number of Music Playlists) Canvas Adapter
 */

import { MusicPlaylistsStep } from './music-playlists-099-step-compiler';

export class MusicPlaylists099CanvasAdapter {
  render(stageContainer: HTMLElement, step: MusicPlaylistsStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 顶部状态
    const statusBox = document.createElement('div');
    statusBox.style.cssText = 'padding: 12px 16px; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b; display: flex; justify-content: space-between; align-items: center;';
    statusBox.innerHTML = `
      <div style="font-weight: 700; color: #f8fafc; font-size: 13px;">
        🎵 播放列表参数: goal=<span style="color: #38bdf8;">${step.goal}</span>, n=<span style="color: #34d399;">${step.n}</span>, 间隔k=<span style="color: #f59e0b;">${step.k}</span>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #34d399; font-weight: 700;">
        最终方案 = ${step.finalValue ?? '计算中...'}
      </div>
    `;
    root.appendChild(statusBox);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 10px 14px; background: #0f172a; border-radius: 6px; border: 1px solid #1e293b; border-left: 3px solid #38bdf8; font-size: 12px; color: #cbd5e1;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const musicPlaylists099CanvasAdapter = new MusicPlaylists099CanvasAdapter();

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
    statusBox.style.cssText = 'padding: 10px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;';
    statusBox.innerHTML = `
      <div style="font-weight: 700; color: #1e293b; font-size: 13px;">
        🎵 播放列表参数: goal=<span style="color: #2563eb;">${step.goal}</span>, n=<span style="color: #059669;">${step.n}</span>, 间隔k=<span style="color: #d97706;">${step.k}</span>
      </div>
      <div style="font-family: monospace; font-size: 12px; color: #64748b;">
        最终方案 = ${step.finalValue ?? '计算中...'}
      </div>
    `;
    root.appendChild(statusBox);

    // 2. 决策信息
    const info = document.createElement('div');
    info.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 12px; color: #334155;';
    info.textContent = step.decision;
    root.appendChild(info);

    stageContainer.appendChild(root);
  }
}

export const musicPlaylists099CanvasAdapter = new MusicPlaylists099CanvasAdapter();

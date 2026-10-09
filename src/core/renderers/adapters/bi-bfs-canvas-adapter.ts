import { BiBFSStep } from '../../../algorithms/categories/graph/bi-bfs-step-compiler';

export class BiBFSCanvasAdapter {
  public static render(container: HTMLElement, step: BiBFSStep): void {
    const isLine4 = step.smallLevelList.includes('bat') || (step.activePath && step.activePath.includes('bat'));
    const isClassic = !isLine4;

    const words = isClassic
      ? ['hit', 'hot', 'dot', 'dog', 'lot', 'log', 'cog']
      : ['bat', 'cat', 'cot', 'cog'];

    const coords: Record<string, { x: number; y: number }> = isClassic
      ? {
          hit: { x: 50, y: 100 },
          hot: { x: 120, y: 100 },
          dot: { x: 210, y: 50 },
          lot: { x: 210, y: 150 },
          dog: { x: 300, y: 50 },
          log: { x: 300, y: 150 },
          cog: { x: 390, y: 100 },
        }
      : {
          bat: { x: 60, y: 100 },
          cat: { x: 160, y: 100 },
          cot: { x: 270, y: 100 },
          cog: { x: 380, y: 100 },
        };

    const edges: Array<[string, string]> = isClassic
      ? [
          ['hit', 'hot'],
          ['hot', 'dot'],
          ['hot', 'lot'],
          ['dot', 'dog'],
          ['lot', 'log'],
          ['dog', 'cog'],
          ['log', 'cog'],
        ]
      : [
          ['bat', 'cat'],
          ['cat', 'cot'],
          ['cot', 'cog'],
        ];

    const isPathEdge = (u: string, v: string) => {
      if (!step.activePath || step.activePath.length < 2) return false;
      for (let i = 0; i < step.activePath.length - 1; i++) {
        if (
          (step.activePath[i] === u && step.activePath[i + 1] === v) ||
          (step.activePath[i] === v && step.activePath[i + 1] === u)
        ) {
          return true;
        }
      }
      return false;
    };

    const svgEdges = edges
      .map(([u, v]) => {
        const p1 = coords[u];
        const p2 = coords[v];
        if (!p1 || !p2) return '';

        const onPath = isPathEdge(u, v);
        const color = onPath ? '#34d399' : 'rgba(148, 163, 184, 0.3)';
        const width = onPath ? 3.5 : 1.5;

        return `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${color}" stroke-width="${width}" stroke-linecap="round" />
        `;
      })
      .join('');

    const svgNodes = words
      .map((w) => {
        const p = coords[w];
        if (!p) return '';

        const isMeet = step.meetWord === w;
        const inSmall = step.smallLevelList.includes(w);
        const inBig = step.bigLevelList.includes(w);
        const onPath = step.activePath && step.activePath.includes(w);
        const isCur = step.curWord === w && step.status !== 'done';

        let bg = '#0f172a';
        let border = '#334155';
        let textColor = '#cbd5e1';

        if (isMeet) {
          bg = '#78350f';
          border = '#facc15';
          textColor = '#fef08a';
        } else if (onPath) {
          bg = '#064e3b';
          border = '#34d399';
          textColor = '#a7f3d0';
        } else if (inSmall) {
          bg = '#0c4a6e';
          border = '#38bdf8';
          textColor = '#bae6fd';
        } else if (inBig) {
          bg = '#831843';
          border = '#f472b6';
          textColor = '#fbcfe8';
        }

        const halo = isMeet
          ? `<rect x="${p.x - 26}" y="${p.y - 18}" width="52" height="36" rx="8" fill="none" stroke="#facc15" stroke-width="2.5" stroke-dasharray="4 3" />`
          : isCur
            ? `<rect x="${p.x - 24}" y="${p.y - 16}" width="48" height="32" rx="7" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3" />`
            : '';

        return `
          <g class="word-node" data-word="${w}">
            ${halo}
            <rect x="${p.x - 22}" y="${p.y - 14}" width="44" height="28" rx="6"
                  fill="${bg}" stroke="${border}" stroke-width="${isMeet || onPath ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4.5}" fill="${textColor}"
                  font-size="12" font-weight="800" font-family="monospace" text-anchor="middle">
              ${w}
            </text>
          </g>
        `;
      })
      .join('');

    const meetStatus = step.meetWord
      ? `💥 碰撞相遇于 "${step.meetWord}" (总转换步数: ${step.stepCount})`
      : `当前波前词: "${step.curWord}" · 第 ${step.stepCount} 层`;

    container.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%; min-height: 380px; background: #090d16; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column;">
        <div style="position: absolute; top: 12px; left: 16px; display: flex; gap: 8px; align-items: center; z-index: 10; pointer-events: none;">
          <span style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(56, 189, 248, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #38bdf8; font-weight: 700;">
            正向波前: ${step.smallLevelList.length} 词
          </span>
          <span style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(244, 114, 182, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #f472b6; font-weight: 700;">
            对向波前: ${step.bigLevelList.length} 词
          </span>
          <span style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(250, 204, 21, 0.4); padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; color: #facc15; font-weight: 600;">
            ${meetStatus}
          </span>
        </div>

        <svg width="100%" height="100%" viewBox="0 0 460 220" style="flex: 1; display: block;">
          ${svgEdges}
          ${svgNodes}

          <!-- 双向波前对进指示导轨 -->
          <g class="wave-track">
            <line x1="30" y1="195" x2="430" y2="195" stroke="rgba(255, 255, 255, 0.08)" stroke-width="1" />
            <text x="35" y="188" fill="#94a3b8" font-size="9.5" font-weight="700">↔️ 双向波前对向扩散中线</text>
            <text x="425" y="188" fill="#64748b" font-size="9" text-anchor="end">小集合优先扩展优化</text>
          </g>
        </svg>
      </div>
    `;
  }
}

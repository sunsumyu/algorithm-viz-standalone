/**
 * 迷宫塔防·寻路破坏者 (Maze Tower Defense: Shortest Path & Graph Topology)
 * 沉浸式 60 FPS 迷宫造路塔防游戏与图论算法实验室：
 * 1. 🏰 自由迷宫建造：在网格中放置石墙、箭塔、冰霜塔与电塔，实时改变图论拓扑
 * 2. 🧭 最短路径实时动态重规划：怪兽实时根据 Dijkstra / BFS 寻找最短逃逸路线
 * 3. 🌊 波次怪兽与击杀金币奖励：疾风幼兽、装甲兽人、虚空领主
 * 4. ✨ 最优蛇形迷宫一键推演：展示如何将 O(N) 直线路径拉长至 O(N*M) 的极限制敌阵型
 * 5. 🔊 原生 Web Audio 射击、闪电与升级音效
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  MAZE_DEFENSE_CODE_LANGUAGES,
  MAZE_DEFENSE_PROBLEM_HTML,
  MAZE_DEFENSE_ANALYSIS_HTML,
} from './maze-defense-problem-content';

export type TowerType = 'WALL' | 'ARCHER' | 'FROST' | 'TESLA';

export interface GridBuilding {
  r: number;
  c: number;
  type: TowerType;
  level: number;
  range: number;
  damage: number;
  cooldown: number;
  lastAttackTime: number;
}

export interface Monster {
  id: string;
  type: 'RUNNER' | 'ORC' | 'BOSS';
  icon: string;
  x: number; // 浮点网格坐标
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  baseSpeed: number;
  slowTimer: number;
  goldReward: number;
  pathIndex: number;
  isDead: boolean;
  animTick: number;
}

export interface Projectile {
  id: string;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  progress: number;
  damage: number;
  type: 'ARROW' | 'LIGHTNING' | 'FROST';
  targetMonsterId: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
}

class SoundEngine {
  private static audioCtx: AudioContext | null = null;
  public static isMuted = false;

  private static getCtx(): AudioContext | null {
    if (this.isMuted || typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioClass) this.audioCtx = new AudioClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public static playBuild(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  public static playShoot(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  public static playZap(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {}
  }
}

export class MazeDefenseVisualizer extends StepVisualizer<any> {
  private rows = 8;
  private cols = 14;
  private startPoint = { r: 3, c: 0 };
  private endPoint = { r: 3, c: 13 };

  // 经济与波次
  private gold = 100;
  private lives = 15;
  private wave = 1;
  private isSpawningWave = false;
  private waveMonstersRemaining = 0;
  private spawnCooldown = 0;

  // 建筑与实体
  private buildings: Map<string, GridBuilding> = new Map();
  private monsters: Monster[] = [];
  private projectiles: Projectile[] = [];
  private floatingTexts: FloatingText[] = [];
  private selectedTool: TowerType = 'WALL';

  // 寻路与拓扑
  private currentShortestPath: [number, number][] = [];
  private isPathBlocked = false;

  // 60 FPS 循环
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = MAZE_DEFENSE_CODE_LANGUAGES;
    this.codeLines = MAZE_DEFENSE_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '迷宫最短路径与拓扑重规划引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '迷宫塔防·寻路破坏者' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.resetGame();
    this.initGameUI();
    this.startLoop();
  }

  public destroy(): void {
    super.destroy();
    if (this.animFrameId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private resetGame(): void {
    this.gold = 120;
    this.lives = 15;
    this.wave = 1;
    this.buildings.clear();
    this.monsters = [];
    this.projectiles = [];
    this.floatingTexts = [];
    this.isSpawningWave = false;
    this.waveMonstersRemaining = 0;
    this.recomputeShortestPath();
    this.updateHUD();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#maze-defense-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.bindCanvasClick();
    }

    this.mountTerminal({
      codeLanguages: MAZE_DEFENSE_CODE_LANGUAGES,
      problemHtml: MAZE_DEFENSE_PROBLEM_HTML,
      analysisHtml: MAZE_DEFENSE_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 建造工具选择
    this.root.querySelectorAll<HTMLButtonElement>('.maze-tool-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.root?.querySelectorAll('.maze-tool-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedTool = (btn.dataset.tool || 'WALL') as TowerType;
      });
    });

    // 发起下一波怪兽
    const startWaveBtn = this.root.querySelector('#btn-maze-start-wave') as HTMLButtonElement | null;
    if (startWaveBtn) {
      startWaveBtn.addEventListener('click', () => this.startNextWave());
    }

    // 一键生成最优蛇形迷宫
    const autoMazeBtn = this.root.querySelector('#btn-maze-auto-snake') as HTMLButtonElement | null;
    if (autoMazeBtn) {
      autoMazeBtn.addEventListener('click', () => this.buildOptimalSnakeMaze());
    }

    // 重置
    const resetBtn = this.root.querySelector('#btn-maze-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetGame());
    }
  }

  private bindCanvasClick(): void {
    if (!this.canvas) return;

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const cellW = this.canvas!.width / this.cols;
      const cellH = this.canvas!.height / this.rows;
      const c = Math.floor(clickX / cellW);
      const r = Math.floor(clickY / cellH);

      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
      if ((r === this.startPoint.r && c === this.startPoint.c) || (r === this.endPoint.r && c === this.endPoint.c)) {
        this.addFloatingText(c, r, '🚫 出入口不可建造', '#ef4444');
        return;
      }

      const key = `${r},${c}`;
      if (this.buildings.has(key)) {
        // 拆除并返还 80% 金币
        const b = this.buildings.get(key)!;
        const refund = Math.round((b.type === 'WALL' ? 10 : b.type === 'ARCHER' ? 25 : b.type === 'FROST' ? 35 : 50) * 0.8);
        this.gold += refund;
        this.buildings.delete(key);
        this.addFloatingText(c, r, `+${refund} 🪙 拆除`, '#10b981');
        this.recomputeShortestPath();
        this.updateHUD();
        return;
      }

      const costMap: Record<TowerType, number> = {
        WALL: 10,
        ARCHER: 25,
        FROST: 35,
        TESLA: 50,
      };
      const cost = costMap[this.selectedTool];

      if (this.gold < cost) {
        this.addFloatingText(c, r, `🪙 金币不足 (需 ${cost})`, '#ef4444');
        return;
      }

      // 放置建筑
      const building: GridBuilding = {
        r,
        c,
        type: this.selectedTool,
        level: 1,
        range: this.selectedTool === 'ARCHER' ? 3.0 : this.selectedTool === 'FROST' ? 2.5 : this.selectedTool === 'TESLA' ? 2.2 : 0,
        damage: this.selectedTool === 'ARCHER' ? 18 : this.selectedTool === 'TESLA' ? 40 : 8,
        cooldown: this.selectedTool === 'ARCHER' ? 0.7 : this.selectedTool === 'TESLA' ? 1.4 : 1.0,
        lastAttackTime: 0,
      };

      this.buildings.set(key, building);
      this.gold -= cost;
      SoundEngine.playBuild();
      this.addFloatingText(c, r, `-${cost} 🪙`, '#38bdf8');

      this.recomputeShortestPath();
      this.updateHUD();
    });
  }

  // 动态重新计算 BFS / Dijkstra 最短逃逸路径
  private recomputeShortestPath(): void {
    const queue: [number, number][] = [[this.startPoint.r, this.startPoint.c]];
    const dist = Array.from({ length: this.rows }, () => new Array(this.cols).fill(Infinity));
    const parent = Array.from({ length: this.rows }, () => new Array<[number, number] | null>(this.cols).fill(null));

    dist[this.startPoint.r][this.startPoint.c] = 0;
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];

    while (queue.length > 0) {
      const [cr, cc] = queue.shift()!;
      if (cr === this.endPoint.r && cc === this.endPoint.c) break;

      for (const [dr, dc] of dirs) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
          const isBlocked = this.buildings.has(`${nr},${nc}`);
          if (!isBlocked && dist[nr][nc] === Infinity) {
            dist[nr][nc] = dist[cr][cc] + 1;
            parent[nr][nc] = [cr, cc];
            queue.push([nr, nc]);
          }
        }
      }
    }

    if (dist[this.endPoint.r][this.endPoint.c] === Infinity) {
      this.isPathBlocked = true;
      this.currentShortestPath = [];
    } else {
      this.isPathBlocked = false;
      const path: [number, number][] = [];
      let curr: [number, number] | null = [this.endPoint.r, this.endPoint.c];
      while (curr !== null) {
        path.push(curr);
        curr = parent[curr[0]][curr[1]];
      }
      this.currentShortestPath = path.reverse();
    }
  }

  // 一键生成经典蛇形迷宫
  private buildOptimalSnakeMaze(): void {
    this.buildings.clear();
    // 构造上下交错引导墙
    for (let c = 2; c < this.cols - 2; c += 2) {
      const openAtTop = (c / 2) % 2 === 0;
      for (let r = 0; r < this.rows; r++) {
        if (openAtTop && r === 0) continue;
        if (!openAtTop && r === this.rows - 1) continue;
        this.buildings.set(`${r},${c}`, {
          r,
          c,
          type: (r + c) % 3 === 0 ? 'ARCHER' : 'WALL',
          level: 1,
          range: 3.0,
          damage: 18,
          cooldown: 0.8,
          lastAttackTime: 0,
        });
      }
    }

    this.recomputeShortestPath();
    this.updateHUD();
    this.addFloatingText(this.cols / 2, this.rows / 2, '✨ 最优蛇形迷宫生成完成!', '#f59e0b');
  }

  // 启动下一波怪兽生成
  private startNextWave(): void {
    if (this.isSpawningWave) return;
    this.isSpawningWave = true;
    this.waveMonstersRemaining = 5 + this.wave * 3;
    this.spawnCooldown = 0;
    this.addFloatingText(this.startPoint.c, this.startPoint.r, `⚠️ 第 ${this.wave} 波怪兽来袭!`, '#ef4444');
  }

  // 60 FPS 物理与战斗主循环
  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      this.updateGame(dt);
      this.renderCanvas();

      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  private updateGame(dt: number): void {
    const now = Date.now() / 1000;

    // 1. 生成怪兽
    if (this.isSpawningWave && this.waveMonstersRemaining > 0) {
      this.spawnCooldown -= dt;
      if (this.spawnCooldown <= 0) {
        this.spawnCooldown = 0.9;
        this.waveMonstersRemaining--;

        const isBoss = this.waveMonstersRemaining === 0 && this.wave % 3 === 0;
        const isOrc = this.waveMonstersRemaining % 2 === 0;

        this.monsters.push({
          id: `m_${Date.now()}_${Math.random()}`,
          type: isBoss ? 'BOSS' : isOrc ? 'ORC' : 'RUNNER',
          icon: isBoss ? '👹' : isOrc ? '🧌' : '🐀',
          x: this.startPoint.c + 0.5,
          y: this.startPoint.r + 0.5,
          hp: isBoss ? 280 + this.wave * 60 : isOrc ? 100 + this.wave * 25 : 45 + this.wave * 15,
          maxHp: isBoss ? 280 + this.wave * 60 : isOrc ? 100 + this.wave * 25 : 45 + this.wave * 15,
          speed: isBoss ? 0.7 : isOrc ? 1.0 : 1.7,
          baseSpeed: isBoss ? 0.7 : isOrc ? 1.0 : 1.7,
          slowTimer: 0,
          goldReward: isBoss ? 45 : isOrc ? 18 : 10,
          pathIndex: 0,
          isDead: false,
          animTick: 0,
        });

        if (this.waveMonstersRemaining <= 0) {
          this.isSpawningWave = false;
          this.wave++;
        }
      }
    }

    // 2. 怪兽沿当前最短路径推进
    for (const m of this.monsters) {
      if (m.isDead) continue;
      m.animTick += dt * 6;

      if (m.slowTimer > 0) {
        m.slowTimer = Math.max(0, m.slowTimer - dt);
        m.speed = m.slowTimer > 0 ? m.baseSpeed * 0.5 : m.baseSpeed;
      }

      if (this.currentShortestPath.length > m.pathIndex + 1) {
        const nextNode = this.currentShortestPath[m.pathIndex + 1];
        const targetX = nextNode[1] + 0.5;
        const targetY = nextNode[0] + 0.5;

        const dx = targetX - m.x;
        const dy = targetY - m.y;
        const dist = Math.hypot(dx, dy);
        const moveDist = m.speed * dt;

        if (dist <= moveDist) {
          m.x = targetX;
          m.y = targetY;
          m.pathIndex++;
        } else {
          m.x += (dx / dist) * moveDist;
          m.y += (dy / dist) * moveDist;
        }

        // 抵达终点
        if (Math.hypot(m.x - (this.endPoint.c + 0.5), m.y - (this.endPoint.r + 0.5)) <= 0.3) {
          m.isDead = true;
          this.lives = Math.max(0, this.lives - (m.type === 'BOSS' ? 3 : 1));
          this.addFloatingText(this.endPoint.c, this.endPoint.r, '-1 ❤️ 逃逸!', '#ef4444');
        }
      }
    }

    // 3. 防御塔索敌与开火
    for (const b of this.buildings.values()) {
      if (b.type === 'WALL') continue;

      if (now - b.lastAttackTime >= b.cooldown) {
        const targets = this.monsters.filter((m) => !m.isDead && Math.hypot(m.x - (b.c + 0.5), m.y - (b.r + 0.5)) <= b.range);

        if (targets.length > 0) {
          b.lastAttackTime = now;
          const target = targets[0];

          if (b.type === 'ARCHER') {
            SoundEngine.playShoot();
            this.projectiles.push({
              id: `p_${Date.now()}_${Math.random()}`,
              startX: b.c + 0.5,
              startY: b.r + 0.5,
              targetX: target.x,
              targetY: target.y,
              progress: 0,
              damage: b.damage,
              type: 'ARROW',
              targetMonsterId: target.id,
            });
          } else if (b.type === 'TESLA') {
            SoundEngine.playZap();
            target.hp = Math.max(0, target.hp - b.damage);
            this.addFloatingText(target.x, target.y, `-${b.damage} ⚡`, '#38bdf8');
            if (target.hp <= 0) this.killMonster(target);
          } else if (b.type === 'FROST') {
            targets.forEach((t) => {
              t.hp = Math.max(0, t.hp - b.damage);
              t.slowTimer = 2.0;
              this.addFloatingText(t.x, t.y, `❄️ -${b.damage}`, '#38bdf8');
              if (t.hp <= 0) this.killMonster(t);
            });
          }
        }
      }
    }

    // 4. 飞行弹道
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.progress += dt * 4.5;
      if (p.progress >= 1) {
        const target = this.monsters.find((m) => m.id === p.targetMonsterId && !m.isDead);
        if (target) {
          target.hp = Math.max(0, target.hp - p.damage);
          this.addFloatingText(target.x, target.y, `-${p.damage}`, '#ef4444');
          if (target.hp <= 0) this.killMonster(target);
        }
        this.projectiles.splice(i, 1);
      }
    }

    // 5. 飘字
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= dt * 0.8;
      ft.opacity -= dt * 1.2;
      if (ft.opacity <= 0) this.floatingTexts.splice(i, 1);
    }

    this.updateHUD();
  }

  private killMonster(m: Monster): void {
    m.isDead = true;
    this.gold += m.goldReward;
    this.addFloatingText(m.x, m.y, `+${m.goldReward} 🪙`, '#f59e0b');
  }

  private addFloatingText(x: number, y: number, text: string, color: string): void {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      opacity: 1.0,
    });
  }

  private updateHUD(): void {
    if (!this.root) return;
    const goldEl = this.root.querySelector('#maze-gold-display') as HTMLElement | null;
    const livesEl = this.root.querySelector('#maze-lives-display') as HTMLElement | null;
    const waveEl = this.root.querySelector('#maze-wave-display') as HTMLElement | null;
    const pathDistEl = this.root.querySelector('#maze-path-dist') as HTMLElement | null;

    if (goldEl) goldEl.textContent = `🪙 ${this.gold}`;
    if (livesEl) livesEl.textContent = `❤️ ${this.lives}`;
    if (waveEl) waveEl.textContent = `🌊 第 ${this.wave} 波`;
    if (pathDistEl) {
      if (this.isPathBlocked) {
        pathDistEl.innerHTML = `<span style="color:#ef4444; font-weight:800;">🚫 路径被完全封死 (Min-Cut)</span>`;
      } else {
        pathDistEl.innerHTML = `逃逸步数: <b style="color:#10b981;">${this.currentShortestPath.length} 步</b>`;
      }
    }
  }

  // 渲染 Canvas 网格沙盘
  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const cellW = width / this.cols;
    const cellH = height / this.rows;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 网格地貌
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const isAlternate = (r + c) % 2 === 0;
        ctx.fillStyle = isAlternate ? '#1e293b' : '#0f172a';
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
      }
    }

    // 2. 绘制最短路径发光轨迹
    if (!this.isPathBlocked && this.currentShortestPath.length > 1) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      this.currentShortestPath.forEach(([r, c], idx) => {
        const px = (c + 0.5) * cellW;
        const py = (r + 0.5) * cellH;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. 出入口地标
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🚪', (this.startPoint.c + 0.5) * cellW, (this.startPoint.r + 0.5) * cellH);
    ctx.fillText('💎', (this.endPoint.c + 0.5) * cellW, (this.endPoint.r + 0.5) * cellH);

    // 4. 绘制建筑
    for (const b of this.buildings.values()) {
      const bx = b.c * cellW;
      const by = b.r * cellH;
      const cx = bx + cellW / 2;
      const cy = by + cellH / 2;

      if (b.type === 'WALL') {
        ctx.fillStyle = '#64748b';
        ctx.fillRect(bx + 2, by + 2, cellW - 4, cellH - 4);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(bx + 4, by + 4, cellW - 8, 3);
      } else if (b.type === 'ARCHER') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(bx + 4, by + 4, cellW - 8, cellH - 8);
        ctx.font = '18px sans-serif';
        ctx.fillText('🏹', cx, cy);
      } else if (b.type === 'FROST') {
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(bx + 4, by + 4, cellW - 8, cellH - 8);
        ctx.font = '18px sans-serif';
        ctx.fillText('❄️', cx, cy);
      } else if (b.type === 'TESLA') {
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(bx + 4, by + 4, cellW - 8, cellH - 8);
        ctx.font = '18px sans-serif';
        ctx.fillText('⚡', cx, cy);
      }
    }

    // 5. 绘制怪兽
    for (const m of this.monsters) {
      if (m.isDead) continue;
      const mx = m.x * cellW;
      const my = m.y * cellH;

      ctx.font = m.type === 'BOSS' ? '24px sans-serif' : '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(m.icon, mx, my + Math.sin(m.animTick) * 2);

      // 血条
      const hpPct = m.hp / m.maxHp;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(mx - 12, my - 14, 24, 3);
      ctx.fillStyle = hpPct > 0.3 ? '#10b981' : '#ef4444';
      ctx.fillRect(mx - 12, my - 14, 24 * hpPct, 3);
    }

    // 6. 绘制投掷物
    for (const p of this.projectiles) {
      const px = (p.startX + (p.targetX - p.startX) * p.progress) * cellW;
      const py = (p.startY + (p.targetY - p.startY) * p.progress) * cellH;
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 7. 绘制飘字
    for (const ft of this.floatingTexts) {
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.opacity);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, (ft.x + 0.5) * cellW, (ft.y + 0.2) * cellH);
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();
  }
}

export const MAZE_DEFENSE_TEMPLATE = `
  <div id="algo-maze-defense-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：资源与波次 HUD -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🏰</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">迷宫塔防·寻路破坏者</span>
        <div style="display: flex; gap: 10px; margin-left: 12px; font-size: 12px; font-weight: 700;">
          <span id="maze-gold-display" style="color: #d97706;">🪙 120</span>
          <span id="maze-lives-display" style="color: #dc2626;">❤️ 15</span>
          <span id="maze-wave-display" style="color: #2563eb;">🌊 第 1 波</span>
          <span id="maze-path-dist" style="color: #475569;">逃逸步数: 14 步</span>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="btn-maze-start-wave" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(220,38,38,0.25);">⚔️ 召唤怪兽 (Start Wave)</button>
        <button id="btn-maze-auto-snake" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.25);">✨ 最优蛇形迷宫推荐</button>
        <button id="btn-maze-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅 -->
    <div style="display: flex; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span>🧠 图论核心：怪兽沿 BFS / Dijkstra 实时最短路径逃逸。放置石墙将直线距离最大化延伸为 S 型迷宫！</span>
    </div>

    <!-- 主交互区：左侧 60 FPS 塔防沙盘 + 建造栏，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：60 FPS 塔防沙盘与工具 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <!-- Canvas 沙盘 -->
        <div style="position: relative; display: flex; justify-content: center; background: #0f172a; border-radius: 6px; overflow: hidden; border: 1px solid #334155;">
          <canvas id="maze-defense-canvas" width="520" height="260" style="width: 520px; height: 260px; cursor: pointer;"></canvas>
        </div>

        <!-- 建造工具卡组 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 2px;">
          <button class="maze-tool-btn active" data-tool="WALL" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #2563eb; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">🧱</span>
            <span style="font-size: 10px; font-weight: 700; color: #0f172a;">引导石墙</span>
            <span style="font-size: 9px; font-weight: 800; color: #d97706;">🪙 10</span>
          </button>
          <button class="maze-tool-btn" data-tool="ARCHER" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">🏹</span>
            <span style="font-size: 10px; font-weight: 700; color: #0f172a;">高频箭塔</span>
            <span style="font-size: 9px; font-weight: 800; color: #d97706;">🪙 25</span>
          </button>
          <button class="maze-tool-btn" data-tool="FROST" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">❄️</span>
            <span style="font-size: 10px; font-weight: 700; color: #0f172a;">减速冰塔</span>
            <span style="font-size: 9px; font-weight: 800; color: #d97706;">🪙 35</span>
          </button>
          <button class="maze-tool-btn" data-tool="TESLA" style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 6px; padding: 4px 2px; cursor: pointer;">
            <span style="font-size: 14px;">⚡</span>
            <span style="font-size: 10px; font-weight: 700; color: #0f172a;">特斯拉电塔</span>
            <span style="font-size: 9px; font-weight: 800; color: #d97706;">🪙 50</span>
          </button>
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="maze-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'maze-defense',
  name: '迷宫塔防·寻路破坏者',
  viewId: 'algo-maze-defense-view',
  category: 'game',
  description: '图论塔防游戏：建造石墙改变网格拓扑、怪兽 Dijkstra 最短路逃逸、打造蛇形迷宫全歼敌军',
  icon: '🏰',
  template: MAZE_DEFENSE_TEMPLATE,
  Visualizer: MazeDefenseVisualizer,
  difficulty: 3,
  levelOrder: 3,
  learningGoal: '掌握动态图最短路径算法（Dijkstra / BFS）、拓扑连通性与最小割阻断对抗原理',
});

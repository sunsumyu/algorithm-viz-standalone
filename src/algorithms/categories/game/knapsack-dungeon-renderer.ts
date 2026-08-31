/**
 * 背包商人·地牢探险 (Knapsack Dungeon Crawler & DP Lab)
 * 沉浸式 2.5D 动态规划算法冒险游戏：
 * 1. 🎒 背包配装与负重系统 (Weight Limit & Item Loadout)
 * 2. 📊 实时 DP 状态转移矩阵全景透视 (dp[i][w] Table & Traceback Path)
 * 3. ⚖️ 贪心 vs 动态规划实时对比引擎 (Greedy vs DP Comparison)
 * 4. ⚔️ 地牢 Boss 回合制即时战斗演练 (Boss Combat, Slash FX, Floating Numbers, Sound)
 * 5. 3 大地牢层级：0-1 背包、完全背包、多维负重背包
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  KNAPSACK_DUNGEON_CODE_LANGUAGES,
  KNAPSACK_DUNGEON_PROBLEM_HTML,
  KNAPSACK_DUNGEON_ANALYSIS_HTML,
} from './knapsack-dungeon-problem-content';

export interface DungeonItem {
  id: string;
  name: string;
  icon: string;
  weight: number;
  value: number; // 战斗力 / 价值
  type: 'WEAPON' | 'ARMOR' | 'POTION' | 'SCROLL' | 'RELIC';
  count?: number; // 多重/完全背包时的数量
  desc: string;
}

export interface DungeonBoss {
  id: string;
  name: string;
  icon: string;
  hp: number;
  maxHp: number;
  attack: number;
  requiredPower: number;
  desc: string;
}

interface DungeonFloor {
  floorId: number;
  title: string;
  modeName: string;
  capacity: number;
  items: DungeonItem[];
  boss: DungeonBoss;
  concept: string;
}

const DUNGEON_FLOORS: DungeonFloor[] = [
  {
    floorId: 1,
    title: '地牢第 1 层: 骷髅王座 (0-1 背包)',
    modeName: '0-1 背包模式',
    capacity: 10,
    concept: '🎯 0-1 背包原理：每件神器世间仅存一份，在严格限重 10kg 下通过 DP 做出最优抉择。',
    items: [
      { id: 'i1', name: '炽炎大剑', icon: '🗡️', weight: 4, value: 38, type: 'WEAPON', desc: '巨剑挥砍，伤害极高' },
      { id: 'i2', name: '秘银板甲', icon: '🛡️', weight: 5, value: 42, type: 'ARMOR', desc: '厚重结实，提供稳固防御' },
      { id: 'i3', name: '狂暴药水', icon: '🧪', weight: 2, value: 16, type: 'POTION', desc: '短效爆发药水' },
      { id: 'i4', name: '冰霜卷轴', icon: '📜', weight: 1, value: 12, type: 'SCROLL', desc: '轻盈且附带冰冻伤害' },
      { id: 'i5', name: '精钢战斧', icon: '🪓', weight: 3, value: 24, type: 'WEAPON', desc: '平衡型武器' },
      { id: 'i6', name: '泰坦之戒', icon: '💍', weight: 2, value: 20, type: 'RELIC', desc: '蕴含远古力量的指环' },
    ],
    boss: {
      id: 'b1',
      name: '💀 骷髅领主',
      icon: '💀',
      hp: 120,
      maxHp: 120,
      attack: 25,
      requiredPower: 80,
      desc: '地牢一层的守关魔王，唯有配装战斗力达到 80+ 才能稳操胜券！',
    },
  },
  {
    floorId: 2,
    title: '地牢第 2 层: 炼金迷窟 (完全背包)',
    modeName: '完全背包模式',
    capacity: 12,
    concept: '🧪 完全背包原理：炼金药剂与飞刀无限量供应，物品可重复选取，状态正序转移。',
    items: [
      { id: 'i1', name: '烈焰药剂', icon: '🧪', weight: 3, value: 28, type: 'POTION', desc: '可无限自配，单位性价比极高' },
      { id: 'i2', name: '淬毒飞刀', icon: '🗡️', weight: 2, value: 17, type: 'WEAPON', desc: '轻便敏捷，可堆叠多把' },
      { id: 'i3', name: '奥术护符', icon: '🧿', weight: 4, value: 36, type: 'RELIC', desc: '强化法术共鸣' },
      { id: 'i4', name: '神圣卷轴', icon: '📜', weight: 1, value: 9, type: 'SCROLL', desc: '极低重量消耗品' },
    ],
    boss: {
      id: 'b2',
      name: '🕷️ 暗影蛛后',
      icon: '🕷️',
      hp: 180,
      maxHp: 180,
      attack: 35,
      requiredPower: 110,
      desc: '喷吐毒丝的巨型蛛后，需要通过完全背包找出无数组合的最强解！',
    },
  },
  {
    floorId: 3,
    title: '地牢第 3 层: 远古龙窟 (终极挑战)',
    modeName: '史诗综合背包',
    capacity: 15,
    concept: '🐲 终极背包挑战：神装与药剂混合，权衡单兵重装 vs 敏捷爆发，击败远古红龙！',
    items: [
      { id: 'i1', name: '灭世龙枪', icon: '🔱', weight: 7, value: 65, type: 'WEAPON', desc: '上古神器，威力毁天灭地' },
      { id: 'i2', name: '龙鳞圣铠', icon: '🛡️', weight: 6, value: 55, type: 'ARMOR', desc: '巨龙鳞片打造的终极防具' },
      { id: 'i3', name: '凤凰精粹', icon: '🧪', weight: 3, value: 30, type: 'POTION', desc: '涅槃之火' },
      { id: 'i4', name: '雷霆卷轴', icon: '📜', weight: 2, value: 22, type: 'SCROLL', desc: '召唤九天神雷' },
      { id: 'i5', name: '支配之戒', icon: '💍', weight: 2, value: 20, type: 'RELIC', desc: '全面属性提升' },
      { id: 'i6', name: '灵巧短刃', icon: '🗡️', weight: 1, value: 11, type: 'WEAPON', desc: '轻灵刺杀' },
    ],
    boss: {
      id: 'b3',
      name: '🐲 远古红龙',
      icon: '🐲',
      hp: 260,
      maxHp: 260,
      attack: 50,
      requiredPower: 140,
      desc: '地牢深处的终极霸主，唯有 100% 达成 DP 最优解才能将其斩落！',
    },
  },
];

// Web Audio API 简易原生音效合成器
class DungeonAudio {
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

  public static playEquip(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  public static playSlash(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }

  public static playVictory(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } catch {}
  }
}

export class KnapsackDungeonVisualizer extends StepVisualizer<any> {
  private currentFloor = 1;
  private selectedItemIds = new Set<string>();

  // 战斗状态
  private isFighting = false;
  private playerHp = 100;
  private maxPlayerHp = 100;
  private bossHp = 120;
  private bossMaxHp = 120;
  private combatLog: string[] = [];

  // DP 演算矩阵
  private dpTable: number[][] = [];
  private dpChosenItems: DungeonItem[] = [];
  private dpOptimalValue = 0;
  private greedyValue = 0;

  constructor() {
    super();
    this.codeLanguages = KNAPSACK_DUNGEON_CODE_LANGUAGES;
    this.codeLines = KNAPSACK_DUNGEON_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '背包动态规划算法引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '背包商人·地牢探险实战' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadFloor(1);
    this.initGameUI();
  }

  private loadFloor(floorId: number): void {
    this.currentFloor = floorId;
    this.selectedItemIds.clear();
    this.isFighting = false;
    this.combatLog = [];

    const floor = DUNGEON_FLOORS.find((f) => f.floorId === floorId) || DUNGEON_FLOORS[0];
    this.playerHp = 100;
    this.maxPlayerHp = 100;
    this.bossHp = floor.boss.hp;
    this.bossMaxHp = floor.boss.maxHp;

    // 计算 DP 全局最优解与贪心解
    this.computeDPOptimal();
    this.computeGreedy();

    this.renderFloorView();
    this.renderDPTable();
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.mountTerminal({
      codeLanguages: KNAPSACK_DUNGEON_CODE_LANGUAGES,
      problemHtml: KNAPSACK_DUNGEON_PROBLEM_HTML,
      analysisHtml: KNAPSACK_DUNGEON_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 关卡切换 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.knapsack-floor-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const floorId = parseInt(btn.dataset.floor || '1', 10);
        this.root?.querySelectorAll('.knapsack-floor-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadFloor(floorId);
      });
    });

    // 一键 DP 最优配装按钮
    const autoDpBtn = this.root.querySelector('#btn-knapsack-auto-dp') as HTMLButtonElement | null;
    if (autoDpBtn) {
      autoDpBtn.addEventListener('click', () => {
        this.selectedItemIds.clear();
        this.dpChosenItems.forEach((it) => this.selectedItemIds.add(it.id));
        DungeonAudio.playEquip();
        this.renderFloorView();
      });
    }

    // 清空背包
    const clearBtn = this.root.querySelector('#btn-knapsack-clear') as HTMLButtonElement | null;
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.selectedItemIds.clear();
        this.renderFloorView();
      });
    }

    // 发起 Boss 决战按钮
    const fightBtn = this.root.querySelector('#btn-knapsack-fight') as HTMLButtonElement | null;
    if (fightBtn) {
      fightBtn.addEventListener('click', () => this.startBossBattle());
    }
  }

  // 计算当前楼层的 DP 最优解与回溯路径
  private computeDPOptimal(): void {
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    const n = floor.items.length;
    const W = floor.capacity;

    this.dpTable = Array.from({ length: n + 1 }, () => new Array(W + 1).fill(0));

    if (floor.modeName.includes('0-1') || floor.modeName.includes('终极')) {
      // 0-1 背包
      for (let i = 1; i <= n; i++) {
        const item = floor.items[i - 1];
        for (let w = 0; w <= W; w++) {
          if (w < item.weight) {
            this.dpTable[i][w] = this.dpTable[i - 1][w];
          } else {
            this.dpTable[i][w] = Math.max(this.dpTable[i - 1][w], this.dpTable[i - 1][w - item.weight] + item.value);
          }
        }
      }

      // 回溯最优选装
      this.dpChosenItems = [];
      let curW = W;
      for (let i = n; i >= 1; i--) {
        if (this.dpTable[i][curW] !== this.dpTable[i - 1][curW]) {
          this.dpChosenItems.push(floor.items[i - 1]);
          curW -= floor.items[i - 1].weight;
        }
      }
    } else {
      // 完全背包
      for (let i = 1; i <= n; i++) {
        const item = floor.items[i - 1];
        for (let w = 0; w <= W; w++) {
          if (w < item.weight) {
            this.dpTable[i][w] = this.dpTable[i - 1][w];
          } else {
            this.dpTable[i][w] = Math.max(this.dpTable[i - 1][w], this.dpTable[i][w - item.weight] + item.value);
          }
        }
      }

      this.dpChosenItems = [];
      let curW = W;
      for (let i = n; i >= 1; i--) {
        while (curW >= floor.items[i - 1].weight && this.dpTable[i][curW] === this.dpTable[i][curW - floor.items[i - 1].weight] + floor.items[i - 1].value) {
          this.dpChosenItems.push(floor.items[i - 1]);
          curW -= floor.items[i - 1].weight;
        }
      }
    }

    this.dpOptimalValue = this.dpTable[n][W];
  }

  // 计算贪心策略解 (按单位重量价值比降序挑选)
  private computeGreedy(): void {
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    const sorted = [...floor.items].sort((a, b) => b.value / b.weight - a.value / a.weight);

    let curW = 0;
    let totalVal = 0;
    for (const it of sorted) {
      if (curW + it.weight <= floor.capacity) {
        curW += it.weight;
        totalVal += it.value;
      }
    }
    this.greedyValue = totalVal;
  }

  private getCurrentTotalStats(): { totalWeight: number; totalValue: number } {
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    let totalWeight = 0;
    let totalValue = 0;

    for (const item of floor.items) {
      if (this.selectedItemIds.has(item.id)) {
        totalWeight += item.weight;
        totalValue += item.value;
      }
    }
    return { totalWeight, totalValue };
  }

  private renderFloorView(): void {
    if (!this.root) return;
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    const stats = this.getCurrentTotalStats();
    const isOverweight = stats.totalWeight > floor.capacity;

    // 概念横幅
    const conceptEl = this.root.querySelector('#knapsack-concept-banner') as HTMLElement | null;
    if (conceptEl) conceptEl.textContent = floor.concept;

    // 背包重量条
    const weightBar = this.root.querySelector('#knapsack-weight-fill') as HTMLElement | null;
    const weightText = this.root.querySelector('#knapsack-weight-text') as HTMLElement | null;
    const powerText = this.root.querySelector('#knapsack-power-text') as HTMLElement | null;

    const pct = Math.min(100, (stats.totalWeight / floor.capacity) * 100);
    if (weightBar) {
      weightBar.style.width = `${pct}%`;
      weightBar.style.background = isOverweight ? '#ef4444' : stats.totalWeight === floor.capacity ? '#10b981' : '#3b82f6';
    }
    if (weightText) {
      weightText.innerHTML = `🎒 负重: <b>${stats.totalWeight}</b> / ${floor.capacity} kg ${isOverweight ? '<span style="color:#ef4444; font-weight:800;">(超重超载!)</span>' : ''}`;
    }
    if (powerText) {
      powerText.innerHTML = `⚔️ 当前总战力: <b style="color: ${stats.totalValue >= floor.boss.requiredPower ? '#10b981' : '#f59e0b'}; font-size: 14px;">${stats.totalValue}</b> (Boss 门槛: ${floor.boss.requiredPower})`;
    }

    // 渲染宝物库与装备栏
    const chestGrid = this.root.querySelector('#knapsack-chest-grid') as HTMLElement | null;
    if (chestGrid) {
      chestGrid.innerHTML = '';
      floor.items.forEach((item) => {
        const isEquipped = this.selectedItemIds.has(item.id);
        const card = document.createElement('div');
        card.className = `knapsack-item-card ${isEquipped ? 'equipped' : ''}`;
        card.style.cssText = `
          display: flex; flex-direction: column; align-items: center; justify-content: space-between;
          background: ${isEquipped ? '#eff6ff' : '#ffffff'};
          border: 2px solid ${isEquipped ? '#3b82f6' : '#e2e8f0'};
          border-radius: 8px; padding: 6px; cursor: pointer; transition: all 0.15s ease;
          box-shadow: ${isEquipped ? '0 4px 12px rgba(59,130,246,0.18)' : '0 1px 3px rgba(0,0,0,0.04)'};
        `;

        card.innerHTML = `
          <span style="font-size: 22px;">${item.icon}</span>
          <span style="font-size: 11px; font-weight: 800; color: #0f172a; margin-top: 2px;">${item.name}</span>
          <div style="display: flex; gap: 4px; font-size: 10px; margin-top: 4px;">
            <span style="background: #f1f5f9; color: #475569; padding: 1px 4px; border-radius: 4px; font-weight: 700;">⚖️ ${item.weight}kg</span>
            <span style="background: #fef2f2; color: #dc2626; padding: 1px 4px; border-radius: 4px; font-weight: 700;">⚔️ +${item.value}</span>
          </div>
          <span style="font-size: 9px; color: #94a3b8; text-align: center; margin-top: 4px;">${item.desc}</span>
          <button style="margin-top: 6px; width: 100%; border: none; border-radius: 4px; padding: 3px 0; font-size: 10px; font-weight: 800; cursor: pointer; background: ${isEquipped ? '#ef4444' : '#10b981'}; color: #ffffff;">
            ${isEquipped ? '卸下' : '装入背包'}
          </button>
        `;

        card.addEventListener('click', () => {
          if (this.selectedItemIds.has(item.id)) {
            this.selectedItemIds.delete(item.id);
          } else {
            this.selectedItemIds.add(item.id);
          }
          DungeonAudio.playEquip();
          this.renderFloorView();
        });

        chestGrid.appendChild(card);
      });
    }

    // 渲染 Boss 信息
    const bossCard = this.root.querySelector('#knapsack-boss-card') as HTMLElement | null;
    if (bossCard) {
      bossCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 36px;">${floor.boss.icon}</span>
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 14px; font-weight: 800; color: #0f172a;">${floor.boss.name}</span>
            <span style="font-size: 11px; color: #64748b;">${floor.boss.desc}</span>
            <div style="display: flex; gap: 8px; margin-top: 4px; font-size: 11px;">
              <span style="color: #dc2626; font-weight: 700;">❤️ HP: ${this.bossHp} / ${this.bossMaxHp}</span>
              <span style="color: #2563eb; font-weight: 700;">🛡️ 挑战建议战力: ${floor.boss.requiredPower}+</span>
            </div>
          </div>
        </div>
      `;
    }
  }

  // 渲染 DP 状态转移矩阵全景表
  private renderDPTable(): void {
    if (!this.root) return;
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    const container = this.root.querySelector('#knapsack-dp-table-container') as HTMLElement | null;
    if (!container) return;

    let html = `
      <table style="width: 100%; border-collapse: collapse; font-size: 10px; font-family: monospace; text-align: center;">
        <thead>
          <tr style="background: #f8fafc; color: #475569;">
            <th style="border: 1px solid #e2e8f0; padding: 4px 6px;">物品 \\ 容量</th>
    `;

    for (let w = 0; w <= floor.capacity; w++) {
      html += `<th style="border: 1px solid #e2e8f0; padding: 4px;">${w}kg</th>`;
    }
    html += `</tr></thead><tbody>`;

    for (let i = 0; i <= floor.items.length; i++) {
      const itemName = i === 0 ? '初始 0' : `${floor.items[i - 1].name.substring(0, 3)} (w:${floor.items[i - 1].weight})`;
      html += `<tr><td style="border: 1px solid #e2e8f0; padding: 3px 4px; font-weight: 700; background: #f8fafc; color: #0f172a;">${itemName}</td>`;

      for (let w = 0; w <= floor.capacity; w++) {
        const val = this.dpTable[i]?.[w] || 0;
        const isOptimalCorner = i === floor.items.length && w === floor.capacity;
        html += `
          <td style="border: 1px solid #e2e8f0; padding: 3px; background: ${isOptimalCorner ? '#fef08a' : val > 0 ? '#eff6ff' : '#ffffff'}; color: ${isOptimalCorner ? '#b45309' : '#1e293b'}; font-weight: ${isOptimalCorner ? '800' : '500'};">
            ${val}
          </td>
        `;
      }
      html += `</tr>`;
    }

    html += `</tbody></table>`;
    container.innerHTML = html;
  }

  // 触发 Boss 实时决斗
  private startBossBattle(): void {
    const floor = DUNGEON_FLOORS.find((f) => f.floorId === this.currentFloor) || DUNGEON_FLOORS[0];
    const stats = this.getCurrentTotalStats();

    if (stats.totalWeight > floor.capacity) {
      alert('⚠️ 背包严重超重超载！请卸下部分物品后再战！');
      return;
    }

    if (this.isFighting) return;
    this.isFighting = true;

    const modal = this.root?.querySelector('#knapsack-battle-modal') as HTMLElement | null;
    const battleLog = this.root?.querySelector('#knapsack-battle-log') as HTMLElement | null;
    if (modal) modal.style.display = 'flex';
    if (battleLog) battleLog.innerHTML = '';

    const log = (msg: string) => {
      if (!battleLog) return;
      const row = document.createElement('div');
      row.style.cssText = 'padding: 2px 0; font-size: 11px; color: #334155;';
      row.innerHTML = msg;
      battleLog.appendChild(row);
      battleLog.scrollTop = battleLog.scrollHeight;
    };

    log(`⚔️ <b>冒险者 (战力 ${stats.totalValue})</b> 挺进 Boss 巢穴，向 <b>${floor.boss.name}</b> 发起决战！`);

    let turn = 1;
    let curBossHp = floor.boss.hp;
    let curPlayerHp = 100;

    const battleStep = () => {
      if (curBossHp <= 0) {
        log(`🏆 <b>大获全胜！</b> 凭借最优配装成功斩杀 ${floor.boss.name}！`);
        DungeonAudio.playVictory();
        this.isFighting = false;
        return;
      }
      if (curPlayerHp <= 0) {
        log(`💀 <b>战败陨落！</b> 战力不足被 Boss 击败，请点击【✨ 启示之眼】应用 DP 最优解！`);
        this.isFighting = false;
        return;
      }

      if (turn % 2 === 1) {
        // 勇士攻击
        DungeonAudio.playSlash();
        const dmg = Math.round(stats.totalValue * (0.8 + Math.random() * 0.4));
        curBossHp = Math.max(0, curBossHp - dmg);
        log(`🗡️ 勇士发起猛烈挥砍，对 Boss 造成 <b style="color:#dc2626;">-${dmg}</b> 伤害！(Boss 剩余 HP: ${curBossHp})`);
      } else {
        // Boss 攻击
        DungeonAudio.playSlash();
        const bossDmg = Math.max(10, floor.boss.attack - Math.round(stats.totalValue * 0.2));
        curPlayerHp = Math.max(0, curPlayerHp - bossDmg);
        log(`🐲 Boss 发动狂暴重击，勇士受到 <b style="color:#ef4444;">-${bossDmg}</b> 伤害！(勇士剩余 HP: ${curPlayerHp})`);
      }

      turn++;
      setTimeout(battleStep, 600);
    };

    setTimeout(battleStep, 500);
  }
}

export const KNAPSACK_DUNGEON_TEMPLATE = `
  <div id="algo-knapsack-dungeon-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 战斗演练全屏弹窗 -->
    <div id="knapsack-battle-modal" style="display: none; position: absolute; inset: 0; background: rgba(15,23,42,0.75); z-index: 999; backdrop-filter: blur(4px); align-items: center; justify-content: center;">
      <div style="background: #ffffff; border-radius: 12px; padding: 20px 24px; width: 440px; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.3); border: 2px solid #3b82f6;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 800; color: #0f172a;">⚔️ 地牢 Boss 战报实录</h3>
          <button onclick="document.getElementById('knapsack-battle-modal').style.display='none'" style="background: #f1f5f9; border: none; border-radius: 4px; padding: 2px 8px; cursor: pointer; font-size: 11px;">关闭</button>
        </div>
        <div id="knapsack-battle-log" style="height: 180px; overflow-y: auto; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; margin-bottom: 10px; font-family: monospace;"></div>
      </div>
    </div>

    <!-- 顶栏：地牢层数选择与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">🎒</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">背包商人·地牢探险 (Knapsack Dungeon)</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="knapsack-floor-btn active" data-floor="1" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 1 层 (0-1 背包)</button>
          <button class="knapsack-floor-btn" data-floor="2" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 2 层 (完全背包)</button>
          <button class="knapsack-floor-btn" data-floor="3" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">第 3 层 (终极巨龙)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="btn-knapsack-auto-dp" style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: #ffffff; border: none; border-radius: 6px; padding: 4px 10px; font-size: 11.5px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 6px rgba(37,99,235,0.25);">✨ 动态规划·启示之眼 (Auto DP)</button>
        <button id="btn-knapsack-clear" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🗑️ 清空</button>
        <button id="btn-knapsack-fight" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(220,38,38,0.25);">⚔️ 挑战 Boss</button>
      </div>
    </div>

    <!-- 算法概念横幅 -->
    <div style="display: flex; align-items: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #1e40af;">
      <span id="knapsack-concept-banner">🎯 0-1 背包原理：每件神器世间仅存一份，在严格限重 10kg 下通过 DP 做出最优抉择。</span>
    </div>

    <!-- 主交互区：左侧地牢宝物库与背包 + 右侧 DP 状态矩阵与终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：宝物库与背包负重槽 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 8px; overflow-y: auto;">
        <!-- 背包负重与总战力状态条 -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11.5px; font-weight: 700; margin-bottom: 4px;">
            <span id="knapsack-weight-text">🎒 负重: 0 / 10 kg</span>
            <span id="knapsack-power-text">⚔️ 当前总战力: 0 (Boss 门槛: 80)</span>
          </div>
          <div style="height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden;">
            <div id="knapsack-weight-fill" style="width: 0%; height: 100%; background: #3b82f6; transition: width 0.2s ease;"></div>
          </div>
        </div>

        <!-- Boss 战况卡片 -->
        <div id="knapsack-boss-card" style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px;"></div>

        <!-- 宝物库网格 (点击卡牌可直接装入/卸下) -->
        <div style="font-size: 11.5px; font-weight: 800; color: #0f172a;">🏺 地牢宝物库 (点击物品装配到背包)</div>
        <div id="knapsack-chest-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;"></div>
      </div>

      <!-- 右侧：DP 状态矩阵全景表与代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 8px; min-height: 0;">
        <!-- DP 状态矩阵全景表 -->
        <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; flex: 1; min-height: 180px; overflow-y: auto;">
          <div style="font-size: 11px; font-weight: 800; color: #0f172a; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>📊 动态规划状态转移表 dp[i][w]</span>
            <span style="font-size: 9.5px; color: #2563eb;">状态转移: max(dp[i-1][w], dp[i-1][w-wi]+vi)</span>
          </div>
          <div id="knapsack-dp-table-container" style="flex: 1; overflow-x: auto;"></div>
        </div>

        <!-- 暗色代码终端挂载槽位 -->
        <div id="knapsack-terminal-mount" style="flex: 1; min-height: 160px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'knapsack-dungeon',
  name: '背包商人·地牢探险',
  viewId: 'algo-knapsack-dungeon-view',
  category: 'game',
  description: '动态规划冒险游戏：地牢搜刮神兵利刃、实时 DP 矩阵求解最优配装、大战地牢守关魔王',
  icon: '🎒',
  template: KNAPSACK_DUNGEON_TEMPLATE,
  Visualizer: KnapsackDungeonVisualizer,
  difficulty: 3,
  levelOrder: 2,
  learningGoal: '通过地牢配装与 Boss 决战，彻底掌握 0-1 背包与完全背包的状态转移方程与最优子结构',
});

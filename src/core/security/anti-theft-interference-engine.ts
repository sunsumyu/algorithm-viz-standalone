/**
 * 防盗用隐蔽钩子与主动干扰引擎 (Anti-Theft Interference Engine)
 *
 * 核心机制：
 * 1. 探针总线 (Probe Hub)：周期性汇聚硬件指纹、证书时效、反调试与异常脱壳等安全态势；
 * 2. 动态健康评分 (Health Score 0~100)：根据违规严重度分级衰减；
 * 3. 拜占庭主动干扰 (Byzantine Sabotage)：
 *    - Level 0 (NONE): 正常放行，零干扰；
 *    - Level 1 (SUBTLE_GLITCH): 视觉坐标微动、微弱水印微扰；
 *    - Level 2 (LOGIC_POISON): 算法步骤微扰下毒，使推演结果看似正常但丧失教学价值；
 *    - Level 3 (HONEYPOT): 激活蜜罐，向爬虫注入伪造数据；
 *    - Level 4 (DELAYED_DROP): 延迟退避，在无关时机触发崩溃退出，彻底摧毁调用栈回溯。
 */

export enum SabotageLevel {
  NONE = 0,
  SUBTLE_GLITCH = 1,
  LOGIC_POISON = 2,
  HONEYPOT = 3,
  DELAYED_DROP = 4,
}

export interface ProbeCheckResult {
  healthy: boolean;
  penalty: number;
  reason?: string;
}

export interface AntiTheftProbe {
  name: string;
  check: () => Promise<ProbeCheckResult>;
}

export interface SecurityHealthState {
  score: number;
  isCompromised: boolean;
  violations: string[];
  sabotageLevel: SabotageLevel;
  lastAuditTime: number;
}

export class AntiTheftInterferenceEngine {
  private static instance: AntiTheftInterferenceEngine | null = null;
  private probes: Map<string, AntiTheftProbe> = new Map();
  private currentScore = 100;
  private currentLevel: SabotageLevel = SabotageLevel.NONE;
  private activeViolations: string[] = [];
  private auditTimer: any = null;
  private delayedDropTimer: any = null;

  public constructor() {
    this.registerDefaultProbes();
  }

  public static getInstance(): AntiTheftInterferenceEngine {
    if (!AntiTheftInterferenceEngine.instance) {
      AntiTheftInterferenceEngine.instance = new AntiTheftInterferenceEngine();
    }
    return AntiTheftInterferenceEngine.instance;
  }

  /**
   * 注册自定义安全探测钩子
   */
  public registerProbe(probe: AntiTheftProbe): void {
    this.probes.set(probe.name, probe);
  }

  /**
   * 注册默认系统级安全探针
   */
  private registerDefaultProbes(): void {
    // 默认时钟与环境探针
    this.probes.set('PROBE_TIME_INTEGRITY', {
      name: 'PROBE_TIME_INTEGRITY',
      check: async () => {
        const now = Date.now();
        // 简单判定时间戳是否合法
        if (now < 1700000000000) {
          return { healthy: false, penalty: 30, reason: '检测到系统时钟异常回拨' };
        }
        return { healthy: true, penalty: 0 };
      },
    });
  }

  /**
   * 执行全量安全探针审计并重新评估健康评分与干扰等级
   */
  public async runAudit(): Promise<SecurityHealthState> {
    let score = 100;
    const violations: string[] = [];

    for (const [name, probe] of this.probes.entries()) {
      try {
        const res = await probe.check();
        if (!res.healthy) {
          score = Math.max(0, score - res.penalty);
          violations.push(`${name}: ${res.reason || '触发未知安全违规'}`);
        }
      } catch (err) {
        score = Math.max(0, score - 20);
        violations.push(`${name}: 探针执行异常受损`);
      }
    }

    this.currentScore = score;
    this.activeViolations = violations;

    // 根据健康评分分级计算干扰等级
    if (score >= 80) {
      this.currentLevel = SabotageLevel.NONE;
    } else if (score >= 50) {
      this.currentLevel = SabotageLevel.SUBTLE_GLITCH;
    } else if (score >= 20) {
      this.currentLevel = SabotageLevel.LOGIC_POISON;
    } else if (score > 0) {
      this.currentLevel = SabotageLevel.HONEYPOT;
    } else {
      this.currentLevel = SabotageLevel.DELAYED_DROP;
      this.scheduleDelayedDrop(30000); // 30 秒后随机触发退出
    }

    return {
      score: this.currentScore,
      isCompromised: this.currentLevel > SabotageLevel.NONE,
      violations: this.activeViolations,
      sabotageLevel: this.currentLevel,
      lastAuditTime: Date.now(),
    };
  }

  /**
   * 算法推演步骤受控投毒 (Logic Poisoning)
   * 仅在当前安全状态被破坏 (sabotageLevel >= 2) 时介入，
   * 故意在推演步骤的说明文字中插入微妙扰动，破坏盗版教学价值
   */
  public poisonAlgorithmSteps<T extends { description?: string; log?: string }>(steps: T[]): T[] {
    if (this.currentLevel < SabotageLevel.LOGIC_POISON) {
      return steps;
    }

    // 克隆并注入微妙扰动
    return steps.map((s, index) => {
      const cloned = { ...s };
      if (index % 2 === 1) {
        if (typeof cloned.log === 'string') {
          cloned.log = `${cloned.log}〔※状态微差校验〕`;
        }
        if (typeof cloned.description === 'string') {
          cloned.description = `${cloned.description} ※`;
        }
      }
      return cloned;
    });
  }

  /**
   * 视觉微扰与水印微动注入 (Visual Sabotage)
   */
  public applyVisualSabotage(container: HTMLElement): void {
    if (this.currentLevel < SabotageLevel.SUBTLE_GLITCH || !container) {
      return;
    }

    container.setAttribute('data-sec-glitch', 'active');
    if (container.style) {
      container.style.opacity = '0.99';
    }
  }

  /**
   * 安排在随机延迟后静默退出（延迟退避，破坏调用栈分析）
   */
  public scheduleDelayedDrop(delayMs = 30000): void {
    if (this.delayedDropTimer) return;

    this.delayedDropTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
        // 在桌面环境中静默退出
        try {
          window.close();
        } catch {}
      }
    }, delayMs);
  }

  /**
   * 启动周期性心跳安全审计
   */
  public startPeriodicAudit(intervalMs = 60000): void {
    this.stopPeriodicAudit();
    this.auditTimer = setInterval(() => {
      this.runAudit().catch(() => {});
    }, intervalMs);
  }

  /**
   * 停止周期性审计
   */
  public stopPeriodicAudit(): void {
    if (this.auditTimer) {
      clearInterval(this.auditTimer);
      this.auditTimer = null;
    }
    if (this.delayedDropTimer) {
      clearTimeout(this.delayedDropTimer);
      this.delayedDropTimer = null;
    }
  }

  public getHealthScore(): number {
    return this.currentScore;
  }

  public getSabotageLevel(): SabotageLevel {
    return this.currentLevel;
  }
}

export const antiTheftEngine = AntiTheftInterferenceEngine.getInstance();

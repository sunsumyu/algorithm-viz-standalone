import { codeStepIndexer } from './code-step-indexer';
import { highlightTokens } from './code-highlighter';
import type { StepVar } from './interfaces';

export interface KeyPointItem {
  label: string;
  desc: string;
  icon?: string;
  badge?: string;
}

export interface KeyPointsData {
  title?: string;
  summary?: string;
  points: KeyPointItem[];
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface ProblemDetail {
  title?: string;
  leetcodeId?: number;
  leetcodeUrl?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  description: string;
  inputDesc?: string;
  outputDesc?: string;
  examples?: ProblemExample[];
  constraints?: string[];
}

export interface VariableSnapshot {
  name: string;
  value: string;
  type?: string;
  isChanged: boolean;
  prevValue?: string;
}

export interface CodePresentationModelOptions {
  lines?: string[];
  languages?: Record<string, string[]>;
  language?: string;
  algoKey?: string;
  lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  problemDetail?: ProblemDetail;
  keyPoints?: KeyPointsData;
}

export interface WalkthroughLineItem {
  lineNum: number;
  codeHtml: string;
  rawCode: string;
  explanation: string;
}

/**
 * 代码演示与多语种语义模型深模块 (CodePresentationModel Deep Module)
 * 遵循深度模块原则：
 * 封装多语言代码行索引、@step:anchor 编译剥离、语法着色 Token 提取、变量快照推演与启发式教学释义推导
 * 彻底脱离 DOM 树，对外暴露高内聚的纯领域计算接口
 */
export class CodePresentationModel {
  public static readonly LANG_NAMES: Record<string, string> = {
    java: 'Java',
    cpp: 'C++',
    python: 'Python',
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    js: 'JavaScript',
    java_1d: 'Java (一维数组)',
    java_2d: 'Java (二维数组)',
    cpp_1d: 'C++ (一维)',
    cpp_2d: 'C++ (二维)',
    python_1d: 'Python (一维)',
    python_2d: 'Python (二维)',
    '1d': '一维数组版本',
    '2d': '二维数组版本',
  };

  private allLines: Record<string, string[]> = {};
  private currentLang: string;
  private langOrder: string[] = [];
  private lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  private algoKey: string;

  constructor(options: CodePresentationModelOptions = {}) {
    this.currentLang = options.language || 'java';
    this.lineExplanations = options.lineExplanations;
    this.algoKey = options.algoKey || `panel_${Math.random().toString(36).slice(2, 9)}`;

    if (options.languages && Object.keys(options.languages).length > 0) {
      const compiled = codeStepIndexer.register(this.algoKey, options.languages);
      this.allLines = { ...compiled.cleanCode };
      this.langOrder = Object.keys(this.allLines);
      if (!this.allLines[this.currentLang]) {
        this.currentLang = this.langOrder[0];
      }
    } else {
      const singleLines = options.lines || [];
      const compiled = codeStepIndexer.register(this.algoKey, { [this.currentLang]: singleLines });
      this.allLines[this.currentLang] = compiled.cleanCode[this.currentLang] || singleLines;
      this.langOrder = [this.currentLang];
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLang;
  }

  public setCurrentLanguage(lang: string): boolean {
    if (this.allLines[lang]) {
      this.currentLang = lang;
      return true;
    }
    return false;
  }

  public getAvailableLanguages(): string[] {
    return [...this.langOrder];
  }

  public getLines(lang?: string): string[] {
    const targetLang = lang || this.currentLang;
    return this.allLines[targetLang] || this.allLines[this.langOrder[0]] || [];
  }

  public updateLines(lines: string[], lang?: string): void {
    const targetLang = lang || this.currentLang;
    const compiled = codeStepIndexer.register(this.algoKey, { [targetLang]: lines });
    this.allLines[targetLang] = compiled.cleanCode[targetLang] || lines;
    if (!this.langOrder.includes(targetLang)) {
      this.langOrder.push(targetLang);
    }
  }

  public getLineCount(lang?: string): number {
    return this.getLines(lang).length;
  }

  public getHighlightedHtml(lineIndex: number, lang?: string): string {
    const lines = this.getLines(lang);
    const line = lines[lineIndex] ?? '';
    const targetLang = lang || this.currentLang;
    return highlightTokens(line, targetLang);
  }

  /**
   * 解析指定行号 (1-based) 的详细教学讲解
   */
  public getLineExplanation(lineNum: number, lang?: string): string {
    const targetLang = lang || this.currentLang;
    const lines = this.getLines(targetLang);
    const rawLine = lines[lineNum - 1] || '';

    // 1. 自定义行讲解匹配
    if (this.lineExplanations) {
      const langMap = (this.lineExplanations as Record<string, Record<number, string>>)[targetLang];
      if (langMap && langMap[lineNum]) {
        return langMap[lineNum];
      }
      const directMap = this.lineExplanations as Record<number, string>;
      if (directMap[lineNum]) {
        if (this.langOrder.length <= 1 || targetLang === 'javascript' || targetLang === 'js') {
          return directMap[lineNum];
        }
      }
    }

    // 2. 启发式智能教学讲解推导
    return this.generateFallbackExplanation(rawLine);
  }

  /**
   * 启发式智能教学讲解推导器
   */
  public generateFallbackExplanation(rawLine: string): string {
    const trimmed = rawLine.trim();
    if (!trimmed) return '空行 / 代码格式分隔。';
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return `<strong>注释说明</strong>：${trimmed.replace(/^\/\/\s*|\/\*\s*|\*\s*/, '')}`;
    }
    if (trimmed.startsWith('public') || trimmed.startsWith('private') || trimmed.startsWith('protected') || trimmed.startsWith('function') || trimmed.startsWith('def ')) {
      return '🎯 <strong>函数主入口</strong>：接收输入参数并定义算法核心函数签名，准备计算并返回最优解。';
    }
    if (trimmed.includes('new int[') || trimmed.includes('new boolean[') || trimmed.includes('Array.from') || trimmed.includes('vector<') || trimmed.includes('new Array(')) {
      return '🗺️ <strong>开辟状态空间</strong>：初始化 DP 状态数组或表格。下标通常包含边界偏移（如 0 表示空前缀/空背包），为自底向上递推计算分配连续内存空间。';
    }
    if (trimmed.includes('dp[0]') || trimmed.includes('dp[1]') || trimmed.includes('dp[2]')) {
      return `🎬 <strong>边界初始化</strong>：设定基础边界状态（<code>${trimmed}</code>），作为自底向上递推填表的初始底座。`;
    }
    if (trimmed.startsWith('for ') || trimmed.startsWith('for(')) {
      return `🔄 <strong>循环状态推进</strong>：控制子问题规模推进（<code>${trimmed}</code>）。确保计算当前状态时，其所依赖的历史前驱状态均已计算就绪。`;
    }
    if (trimmed.startsWith('if ') || trimmed.startsWith('if(')) {
      return `🔍 <strong>条件分支判定</strong>：比对当前元素或检查转移前提（<code>${trimmed}</code>），决定走无代价匹配分支还是多项抉择分支。`;
    }
    if (trimmed.startsWith('else if') || trimmed.startsWith('else')) {
      return '⚔️ <strong>决策分支</strong>：当前条件不满足时执行的备用转移路径或多向取极值操作。';
    }
    if (trimmed.includes('dp[') && trimmed.includes('=')) {
      return `⚡ <strong>状态转移计算与写入</strong>：根据状态转移方程推导当前子问题的最优解并写入状态数组（<code>${trimmed}</code>）。`;
    }
    if (trimmed.startsWith('return ')) {
      return `🏁 <strong>返回全局最优解</strong>：返回整个输入规模对应的最终计算答案（<code>${trimmed}</code>）。`;
    }
    if (trimmed === '}' || trimmed === '{' || trimmed === '};') {
      return '代码块作用域边界。';
    }
    return `执行语句：<code>${trimmed}</code>`;
  }

  private problemDetail?: ProblemDetail;
  private keyPoints?: KeyPointsData;

  public getProblemDetail(): ProblemDetail | undefined {
    return this.problemDetail;
  }

  public setProblemDetail(detail: ProblemDetail | undefined): void {
    this.problemDetail = detail;
  }

  public getKeyPoints(): KeyPointsData | undefined {
    return this.keyPoints;
  }

  public setKeyPoints(points: KeyPointsData | undefined): void {
    this.keyPoints = points;
  }

  /**
   * 纯领域函数：计算运行变量实时快照与差异对比
   */
  public computeVariableSnapshots(
    vars: StepVar[] | undefined,
    prevMap: Map<string, string> = new Map()
  ): { snapshots: VariableSnapshot[]; newMap: Map<string, string> } {
    if (!vars || vars.length === 0) {
      return { snapshots: [], newMap: new Map() };
    }

    const newMap = new Map<string, string>();
    const snapshots: VariableSnapshot[] = vars.map((v) => {
      const prevVal = prevMap.get(v.name);
      const isChanged = v.changed ?? (prevVal !== undefined && prevVal !== v.value);
      newMap.set(v.name, v.value);
      return {
        name: v.name,
        value: v.value,
        type: v.type,
        isChanged,
        prevValue: prevVal
      };
    });

    return { snapshots, newMap };
  }

  /**
   * 获取逐行精讲视图所需的全量结构化数据
   */
  public getWalkthroughData(lang?: string): WalkthroughLineItem[] {
    const targetLang = lang || this.currentLang;
    const lines = this.getLines(targetLang);
    return lines.map((rawCode, index) => {
      const lineNum = index + 1;
      return {
        lineNum,
        rawCode,
        codeHtml: highlightTokens(rawCode, targetLang),
        explanation: this.getLineExplanation(lineNum, targetLang)
      };
    });
  }
}

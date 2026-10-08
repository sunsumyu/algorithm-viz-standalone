/**
 * 全景静态推演展板核心类型与策略契约 (Deduction Tree Contracts)
 */

export interface StaticDeductionRenderOptions {
  modelId: string;
  m?: number;
  n?: number;
  s?: string;
  t?: string;
  text1?: string;
  text2?: string;
  word1?: string;
  word2?: string;
  inputs?: Record<string, any>;
  preset?: string;
  step?: any;
  extra?: any;
}

export interface IDeductionTreeRenderer {
  readonly id: string;
  canHandle(modelId: string): boolean;
  render(options: StaticDeductionRenderOptions): string;
}

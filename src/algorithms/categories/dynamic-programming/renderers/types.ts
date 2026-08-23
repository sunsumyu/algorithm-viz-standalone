/**
 * Thematic Physical Stage Types & Interfaces (物理实景动画元数据规范)
 */

export interface DpThematicMeta {
  type?: 'knapsack' | 'coin' | 'grid' | 'robber' | 'stock' | 'math-cut' | 'sequence';
  // 背包类
  knapsack?: {
    capacity: number;
    currentCapacity?: number;
    items?: Array<{ id: string | number; name: string; weight: number; value: number; color?: string }>;
    currentItemIndex?: number;
    action?: 'evaluate' | 'include' | 'exclude' | 'idle';
    totalWeight?: number;
    totalValue?: number;
  };
  // 零钱兑换类
  coin?: {
    targetAmount: number;
    currentAmount?: number;
    coins?: number[];
    currentCoin?: number;
    action?: 'drop' | 'match' | 'overflow' | 'idle';
    usedCoins?: number[];
  };
  // 网格寻路类
  grid?: {
    rows: number;
    cols: number;
    curRow?: number;
    curCol?: number;
    parentRow?: number;
    parentCol?: number;
    pathStack?: Array<[number, number]>;
    visitedCells?: Array<[number, number]>;
    dp2d?: Array<Array<number | string>>;
    fromDir?: 'top' | 'left' | 'start';
    obstacles?: Array<[number, number]>;
    pathCount?: number;
    status?: 'enter' | 'eval-border' | 'eval-goal' | 'eval-obstacle' | 'out-of-bounds' | 'memo-hit' | 'explore-down' | 'explore-right' | 'backtrack' | 'completed' | 'tabulation' | 'init' | 'update';
  };
  // 打家劫舍类
  robber?: {
    houses: Array<{ index: number; val: number }>;
    curHouse?: number;
    robbedHouses?: number[];
    alarmHouses?: number[];
    decision?: 'rob' | 'skip' | 'idle';
    totalStolen?: number;
  };
  // 股票交易类
  stock?: {
    prices: number[];
    curDay?: number;
    action?: 'buy' | 'sell' | 'hold' | 'cooldown' | 'idle';
    profit?: number;
    buyPrice?: number;
    holding?: boolean;
  };
  // 整数拆分/切割类
  mathCut?: {
    totalLength: number;
    cutPoint?: number;
    segments?: number[];
    product?: number;
    isBest?: boolean;
  };
}

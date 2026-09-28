import { ALL_ALGORITHM_METADATA } from '../src/core/algorithm-catalog.generated';

const dp66_70 = [
  'class066', 'class067', 'class068', 'class069', 'class070',
  'fibonacci', 'climbing-stairs', 'coin-change', 'decode-ways', 'house-robber',
  'unique-paths', 'min-path-sum', 'longest-common-subsequence', 'edit-distance',
  'knapsack', 'target-sum', 'partition-equal-subset-sum'
];

console.log('--- Checking DP Class 066 - 070 in Catalog ---');
for (const item of ALL_ALGORITHM_METADATA) {
  const matchId = dp66_70.some(k => item.id.includes(k));
  const matchAlias = item.aliases && item.aliases.some(a => dp66_70.some(k => a.toLowerCase().includes(k)));
  if (matchId || matchAlias) {
    console.log(`[${item.category}] ${item.id} - ${item.name}`);
    if (item.aliases) console.log(`  aliases: ${item.aliases.join(', ')}`);
  }
}

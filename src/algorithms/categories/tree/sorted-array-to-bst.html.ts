import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'sb-',
  title: '有序数组转 BST',
  subtitle: 'LeetCode 108',
  accentA: 'rgb(137,180,250)',
  accentB: 'rgb(203,166,247)',
  tip: '💡 中间元素作为根，左右子数组分别递归构建左右子树',
  icon: '🔄',
  exampleButtons: '<button class="sb-ex-btn" data-id="1">[-10,-3,0,5,9]</button><button class="sb-ex-btn" data-id="2">[1,3]</button><button class="sb-ex-btn" data-id="3">[0,1,2,3,4,5]</button>',
});

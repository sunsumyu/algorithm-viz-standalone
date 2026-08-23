import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'bmo-',
  title: 'BST 中的众数',
  subtitle: 'LeetCode 501',
  accentA: 'rgb(203,166,247)',
  accentB: 'rgb(250,179,135)',
  tip: '💡 中序遍历统计频率，记录最大频率的节点值',
  icon: '📊',
  exampleButtons: '<button class="bmo-ex-btn" data-id="1">[1,null,2,2]</button><button class="bmo-ex-btn" data-id="2">[0]</button><button class="bmo-ex-btn" data-id="3">[1,1,2,2,3]</button>',
});

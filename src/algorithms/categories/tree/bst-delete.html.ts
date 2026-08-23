import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'bd-',
  title: '删除 BST 节点',
  subtitle: 'LeetCode 450',
  accentA: 'rgb(243,139,168)',
  accentB: 'rgb(250,179,135)',
  tip: '💡 分情况：叶子/单子树/双子树(找右子树最小值替代)',
  icon: '🗑️',
  exampleButtons: '<button class="bd-ex-btn" data-id="1">[5,3,6,2,4,null,7], key=3</button><button class="bd-ex-btn" data-id="2">[5,3,6,2,4,null,7], key=0</button><button class="bd-ex-btn" data-id="3">[5,3,6,2,4,null,7], key=7</button>',
});

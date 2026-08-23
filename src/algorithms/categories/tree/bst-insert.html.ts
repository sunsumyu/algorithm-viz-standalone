import { buildTreeTemplate } from './tree-template';
export default buildTreeTemplate({
  prefix: 'bi-',
  title: 'BST 插入操作',
  subtitle: 'LeetCode 701',
  accentA: 'rgb(249,226,175)',
  accentB: 'rgb(137,180,250)',
  tip: '💡 按照 BST 性质递归找到插入位置',
  icon: '➕',
  exampleButtons: '<button class="bi-ex-btn" data-id="1">[4,2,7,1,3], val=5</button><button class="bi-ex-btn" data-id="2">[40,20,60,10,30,50,70], val=25</button><button class="bi-ex-btn" data-id="3">[4,2,7,1,3,null,null,null,null,null,null], val=5</button>',
});

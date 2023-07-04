/**
 * Created by Mr.Carry on 2017/7/26.
 */
"use strict";

let data = {
  'field': {
    '0': {'value': 0.01, 'note': '查看'},
    '1': {'value': 1, 'note': '点赞'},
    '2': {'value': 2, 'note': '评论'},
    '3': {'value': 10, 'note': '转发'},
    '4': {'value': 30, 'note': '购买成功'},
    '5': {'value': 10, 'note': '购买失败'}
  },
  note: '行为权重配置'
}

for (var i = 0; i < 1000; i++) {
  var rID = Math.floor(Math.random() * 10);
  var price = parseFloat
  ((Math.random() * 10).toFixed(2));
  if (rID < 4) {
    db.test.insert({"user": "Joe", "sku": rID, "price": price});
  }
  else if (rID >= 4 && rID < 7) {
    db.test.insert({"user": "Josh", "sku": rID, "price": price});
  }
  else {
    db.test.insert({"user": "Ken", "sku": rID, "price": price});
  }
}
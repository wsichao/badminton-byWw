/**
 * Created by Mr.Carry on 2017/6/8.
 */

let _ = require('underscore');


let arr = [
  {name: '123', id: 1},
  {name: '234', id: 1},
  {name: '222', id: 2}
]
let result = _.uniq(arr,true,function(a){
  "use strict";
  return a.id
});

console.log(result)


/**
 *
 * 版本号
 * Created by yichen on 2017/6/22.
 */


module.exports = {
  config: {
    type:{type:String , default:"zly-android-internal"},
    // 1. 朱李叶客户端
    // zly-android , 朱李叶android正式版
    // zly-android-internal , 朱李叶android内测版
    // zly-android-staging , 朱李叶android预览版
    // zly-ios , 朱李叶ios正式版
    // zly-ios-internal , 朱李叶ios内测版
    // zly-ios-staging , 朱李叶ios预览版
    // 2. 朱李叶医生端
    // zlydoc-android , 朱李叶android正式版
    // zlydoc-android-staging , 朱李叶android预览版
    // zlydoc-ios , 朱李叶ios正式版
    // zlydoc-ios-staging , 朱李叶ios预览版
    minCode:{type:Number , default:0},
    badCode:{type:String , default:""},
    url:{type:String , default:""},
    code:{type:Number , default:0},
    name:{type:String , default:""},
    desc:{type:String , default:""},
    time:{type:Number , default:0}
  },
  options: {
    collection: 'versions'
  }
}
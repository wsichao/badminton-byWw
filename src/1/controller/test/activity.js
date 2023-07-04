/**
 * Created by fly on 2017－06－06.
 */
'use strict';
module.exports = {
  getAction: function () {
    let defer = Backend.Deferred.defer();
    defer.resolve();
    return this.display('./test/activity24_Out', defer.promise);
    /*let key = '20170713liuzhenbo';
    //Backend.cache.delete(key);
    let nowTS = Math.round((Date.now()  + 10 * 1000) / 1000) ;
    console.log('nowTS:', nowTS);
    Backend.cache.get(key)
    .then(function(value){
      console.log('value:', value, typeof value);
      if(!value){
        console.log('come in');
        Backend.cache.setAt(key, 0, nowTS);
      }
    })*/
  }
}
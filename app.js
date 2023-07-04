global.mongoosePre = function (schema, schema_str) {
  schema.pre('count', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' count pre:', this._conditions);
  });
  schema.pre('find', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' find pre:', this._conditions);
  });
  schema.pre('findOne', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' findOne pre:', this._conditions);
  });
  schema.pre('findOneAndRemove', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' findOneAndRemove pre:', this._conditions);
  });
  schema.pre('findOneAndUpdate', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' findOneAndUpdate pre:', this._conditions);
  });
  schema.pre('insertMany', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' insertMany pre:', this._conditions);
  });
  schema.pre('update', function(){
    this._conditions.source = {$ne: 'zs'};
    //console.log(schema_str + ' update pre:', this._conditions);
  });
}
var http = require('http'),
     serverConfigs = require('./app/configs/server.js'),
     app = require('./server').server;
if(process.env.NODE_ENV == 'production'){
  app.listen(serverConfigs.port);
}else{
  app.listen(serverConfigs.port,"0.0.0.0");
}
console.log('Server listening on port ' + serverConfigs.port + ';  NODE_ENV: ' + process.env.NODE_ENV);

var mongoose = require('mongoose');

var LogSchema = new mongoose.Schema({
    httpUri: String,
    httpMethod: String,
    createdAt: Number,
    httpParams: {},
    userId: Schema.Types.ObjectId,
    httpReqPayload: {}
});

mongoose.model('mcSceneLog', LogSchema, 'mcSceneLogs');
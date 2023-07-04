/**
 * 意见反馈管理
 * @type {_|exports}
 * @private
 */
var
  _ = require('underscore'),
  Q = require("q"),
  Suggestion = require('../models/Suggestion');

var SuggestionService = function () {
};

SuggestionService.prototype.constructor = SuggestionService;

SuggestionService.prototype.createSuggestion = function (suggestion) {
  return Suggestion.create(suggestion);
};

SuggestionService.prototype.listSuggestion = function (pageSlice) {

  return Suggestion.find({isDeleted: false, source: 'docChat'}, null, pageSlice).exec();

};

SuggestionService.prototype.updateSuggestion = function (id, update) {
  var condition = {
    isDeleted: {$ne: true},
    _id: id,
    source: 'docChat'
  }
  return Suggestion.findOneAndUpdate(condition, update, {new: true}).exec();

};

module.exports = exports = new SuggestionService();

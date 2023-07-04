var
    Search = require('../models/Search');
function SearchService (){
}
SearchService.prototype.constructor = SearchService;
SearchService.prototype.findByUserId = function (userId){
    return Search.find({user: userId}).exec();
}

SearchService.prototype.updateSearch = function (userId, update){
    return Search.findOneAndUpdate({user: userId}, update).exec();
}
SearchService.prototype.createSearch = function (user){
    var search = {
        key: user.name,
        userCreatedAt: user.createdAt,
        user: user._id
    }
    return Search.create(search);
}
module.exports = new SearchService();
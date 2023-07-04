/**
 * Created by guoyichen on 2017/3/1.
 */
var
    SocialRel = require('../models/SocialRel'),
    mongoose = require('mongoose');
function SocialRelService() {
}
SocialRelService.prototype.constructor = SocialRelService;

SocialRelService.prototype.createRel = function (data) {
    console.log('创建用户想你想',data);
    data.updatedAt=Date.now();
    return SocialRel.create(data);
}

SocialRelService.prototype.updateRelByCond = function (cond, update) {
    update.updatedAt=Date.now();
    return SocialRel.findOneAndUpdate(cond, update, {new: true}).exec();
}

SocialRelService.prototype.getFavoritesByUserIdAndNoteName = function (userId, noteName, fields, pageSlice) {
    var cond = {
        isDeleted: false,
        user: userId,
        isRelUserFavorite: true,
        'noteInfo.noteName': new RegExp(noteName + '', 'i')
    };
    fields = fields || SocialRel.fields;
    return SocialRel.find(cond, fields, pageSlice).exec();
}

SocialRelService.prototype.getFavoritesCountByUserIdAndNoteName = function (userId, noteName) {
    var cond = {
        isDeleted: false,
        user: userId,
        isRelUserFavorite: true,
        'noteInfo.noteName': new RegExp(noteName + '', 'i')
    };
    return SocialRel.count(cond).exec();
}

SocialRelService.prototype.getRelByUserId = function (userId, relUserId, option) {
    var cond = {
        isDeleted: false,
        user: userId,
        relUser: relUserId,
    }
    var fields = option && option.fields || '_id';
    return SocialRel.findOne(cond, fields).exec();
}

SocialRelService.prototype.getFavoriteCountById = function (userId) {
    var cond = {
        isDeleted: false,
        user: userId,
        isRelUserFavorite: true
    }
    return SocialRel.count(cond).exec();
}

SocialRelService.prototype.getFansByUserId = function (userId, fields, pageSlice) {
    var cond = {
        isDeleted: false,
        relUser: userId,
        isRelUserFavorite: true,
        isUserBlacked: false
    }
    fields = fields || SocialRel.fields;
    return SocialRel.find(cond, fields, pageSlice).exec();
}

SocialRelService.prototype.getRelsByNoteName = function (userId, noteName, fields, pageSlice) {
    var cond = {
        user: userId,
        isDeleted: false,
        relUserDoctorRef: {$in: docIds},
        'noteInfo.noteName': noteName
    }
    fields = fields || SocialRel.fields;
    return SocialRel.find(cond, fields, pageSlice).exec();
}

SocialRelService.prototype.getFansCountByUserId = function (userId, option) {
    var cond = {
        isDeleted: false,
        relUser: userId,
        isRelUserFavorite: true,
        isUserBlacked: false
    }
    if (option && option.notedName) {
        cond['notedName'] = new RegExp(option.notedName + '', 'i');
    }
    return SocialRel.count(cond).exec();
}

SocialRelService.prototype.getFansByUserIdAndRelNoteName = function (userId, noteName, fields, pageSlice) {
    var cond = {
        isDeleted: false,
        relUser: userId,
        isRelUserFavorite: true,
        isUserBlacked: false,
        'notedName': new RegExp(noteName + '', 'i')
    };
    fields = fields || SocialRel.fields;
    return SocialRel.find(cond, fields, pageSlice).exec();
}
SocialRelService.prototype.getNoteByUserId = function (userId) {
    var cond = {
        isDeleted: false,
        user: userId,
        isRelUserFavorite: true
    }
    return SocialRel.find(cond, 'noteInfo', pageSlice).exec();
}

SocialRelService.prototype.findRelByRelIds = function (userId, relUserId) {
    var condition = {};
    condition.user = userId;
    condition.relUser = relUserId;
    condition.isDeleted = false;
    return SocialRel.findOne(condition).exec();
}

SocialRelService.prototype.getNoteNameByIds = function (userId, relUserIds) {
    var condition = {};
    condition.user = userId;
    condition.relUser = {$in: relUserIds};
    condition.isDeleted = false;
    return SocialRel.find(condition, "relUser noteInfo ").exec();
}

SocialRelService.prototype.getNoteNameByUserIds = function (userIds, relUserId) {
    var condition = {};
    condition.user = {$in: userIds};
    condition.relUser = relUserId;
    condition.isDeleted = false;
    return SocialRel.find(condition, "relUser noteInfo ").exec();
}

SocialRelService.prototype.getFansNoteNameByIds = function (userId, relUserIds) {
    var condition = {};
    condition.relUser = userId;
    condition.user = {$in: relUserIds};
    condition.isDeleted = false;
    return SocialRel.find(condition, "user notedName").exec();
}

SocialRelService.prototype.getNoteNameByDocChatNums = function (userDocChatNum, relUserdocChatNums) {
    var condition = {};
    condition.userDocChatNum = userDocChatNum;
    condition.relUserDocChatNum = {$in: relUserdocChatNums};
    condition.isDeleted = false;
    return SocialRel.find(condition, "relUserDocChatNum noteInfo").exec();
}

SocialRelService.prototype.updateRel = function (relId, data) {
    var condition = {};
    condition._id = relId;
    return SocialRel.findOneAndUpdate(condition, data, {new: true}).exec();
}

/**
 * 健康号，查看userId和relUserId是否存在关系
 * @param userId
 * @param relUserId
 * @returns {Promise}
 */
SocialRelService.prototype.getFlewRelByRelIds = function (userId, relUserId) {
    var condition = {};
    condition.user = userId;
    condition.relUser = relUserId;
    condition.from = {$exists: true};
    condition.isDeleted = false;
    return SocialRel.findOne(condition).exec();
}
/**
 * 健康号，查看userId 关注的作者
 * @param userId
 * @returns {Array|{index: number, input: string}|Promise|*}
 */
SocialRelService.prototype.getFlewFavoritesById = function (userId) {
    var cond = {
        isDeleted: false,
        user: mongoose.Types.ObjectId(userId),
        isRelUserFavorite: true,
        from: {$exists: true}
    }

    return SocialRel.aggregate([
        {'$match': cond},
        {
            '$lookup': {from: 'servicePackageDoctor', localField: 'relUser', foreignField: '_id', as: 'doctorInfo'}
        },
        {
            '$lookup': {from: 'factory', localField: 'relUser', foreignField: '_id', as: 'factoryInfo'}
        },
        {
            '$project': {
                'updatedAt': 1,
                "doctorInfo._id": 1, "doctorInfo.name": 1, "doctorInfo.avatar": 1,"doctorInfo.cmsUserName": 1,
                "factoryInfo._id": 1, "factoryInfo.name": 1, "factoryInfo.avatar": 1,"factoryInfo.cmsUserName": 1,
            }
        },
        {'$sort': {updatedAt: -1}}
    ]).exec();
}
module.exports = new SocialRelService();

const model = require('./../../../../app/models/Region');
const mongoose = require('mongoose')

module.exports = {
  __rule: function (valid) {
    return valid.object({
      id: valid.string().empty(""),
      type: valid.number().default(1),
    });
  },
  async getAction() {
    const type = this.query.type;
    const id = this.query.id;
    let result = [];
    let cond = {
      isDeleted: false
    };
    if (type == 1) {
      cond.type = 1;
    } else {
      cond.parentId = id;
      cond.type = type;
    }
    result = await model.find(cond).sort({_id:1});
    let items = result.map(item => {
      return {
        id: item._id,
        name: item.name
      }
    })
    if (items.length == 0) {
      items.push({
        id: mongoose.Types.ObjectId("5509080d8faee0fbe0c4b7f1"),
        name:"其他"
      })
    }
    return this.success({
      code: "",
      msg: "",
      items
    });
  }
}
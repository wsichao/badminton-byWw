module.exports = {
  config: {
    name: String,//项目名称
    parentId: Backend.Schema.Types.ObjectId //父级分类的ID	
  },
  options: {
    collection: 'makeAppointmentOrderItemsDict'
  }
};
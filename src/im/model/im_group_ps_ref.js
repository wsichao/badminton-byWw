module.exports = {
  config: {
    servicePackageOrderId: String,
    groupId: String,
    servicePackageId : Backend.Schema.Types.ObjectId
  },
  options: { collection: 'imGroupPSRef' }
}
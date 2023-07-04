const user_factory_amount_model = Backend.model('user_group', undefined, 'userFactoryAmount');

module.exports = {
  updateAmount: function(userId, factoryId, newAmount){
    const cond = {
      user: userId,
      factory: factoryId
    };
    return user_factory_amount_model.findOne(cond)
    .then(function(factory_amount){
      if(!factory_amount){
        return user_factory_amount_model.create({
          user: userId,
          factory: factoryId,
          amount: newAmount
        });
      }else{
        return user_factory_amount_model.update(cond, {$inc: {amount: newAmount}});
      }
    })
  }
}

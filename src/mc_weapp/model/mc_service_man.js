/**
 * 2030健康-被服务人信息表
 */
module.exports = {
    config: {
        // 姓名	
        name: String,
        // 手机号	
        phoneNum: String,
        // 性别	
        sex: String,
        // 年龄
        age: Number,
        // 慢性病名称	
        chronicDiseaseName: String,
        // 药费范围	
        drugFeeRange: String,
        // 复诊病例图片
        caseImg: [String],
        // 药费清单图片
        drugFeeListImg: [String],
        // 是否被删除
        isDeleted: {type: Boolean, default: false},  
        // 患病时间
        dieaseTime : Number,
        // 所在城市
        city : String, //不确定是不是string
        // 已提供资料
        provideInfo : String,
        // 目前状况
        currentStatus : String,
        // 期待结果
        expectedResults : String,
        // 现状分析
        currentAnalysis : String,
        // 专家建议治疗方式
        expertsRecommend : String,
        // 推荐医生
        recommendDoctor : [Backend.Schema.Types.ObjectId],
        // 服务价格 (单位 分)
        servicePrice : Number,
        // 专属会员服务方案
        serviceScheme : String,
    },
    options: {
      collection: 'mcServiceMan'
    }
  }
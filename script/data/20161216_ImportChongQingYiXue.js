var initDCN = 7999200; // ~ 7999615// 确认为空号段
var data = [
  {
    "name": "马建军",
    "phoneNum": "18996511311",
    "hospital": "奉节县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "熊兵",
    "phoneNum": "13984178248",
    "hospital": "贵阳市第一人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "邵立尧",
    "phoneNum": "15925560663",
    "hospital": "云南保山市第二人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "宋玉光",
    "phoneNum": "13990994151",
    "hospital": "宜宾市第二人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "邹文胜",
    "phoneNum": "13908256321",
    "hospital": "丰都县中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "冯建来",
    "phoneNum": "15803003170",
    "hospital": "沈阳军区兴城疗养院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "孔天天",
    "phoneNum": "13618530666",
    "hospital": "贵州省安顺市人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "庾劲松",
    "phoneNum": "13452739966",
    "hospital": "重庆市云阳县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "巫代友",
    "phoneNum": "13689054366",
    "hospital": "四川省成都市新都区人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "蒋晖",
    "phoneNum": "13193212606",
    "hospital": "重庆市开县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "张逸尘",
    "phoneNum": "13678581576",
    "hospital": "贵州六盘水首钢水钢集团总医院",
    "department": "外一科",
    "position": "医师"
  },
  {
    "name": "石思超",
    "phoneNum": "13668467485",
    "hospital": "重庆市梁平县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "蒋尧",
    "phoneNum": "13883086181",
    "hospital": "四川省南充市中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "王欢",
    "phoneNum": "15923925607",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "朱德奎",
    "phoneNum": "15923260962",
    "hospital": "四川省卢县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "唐广应",
    "phoneNum": "13885440505",
    "hospital": "贵州省黔南州中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "朱佩海",
    "phoneNum": "13896322073",
    "hospital": "重庆开县中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "杨正杰",
    "phoneNum": "13996417676",
    "hospital": "贵州铜仁地区人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "陈佳",
    "phoneNum": "13018390475",
    "hospital": "重庆市公共卫生医疗救治中心",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "范远俊",
    "phoneNum": "13883866681",
    "hospital": "巴南区人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "柏小金",
    "phoneNum": "13508515947",
    "hospital": "贵州遵义医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "刘蜀君",
    "phoneNum": "18623170075",
    "hospital": "万州中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "张超",
    "phoneNum": "18987234333",
    "hospital": "解放军第60医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "张磊",
    "phoneNum": "13668772992",
    "hospital": "昆明东川区人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "项德华",
    "phoneNum": "13071839315",
    "hospital": "浙江杭州富阳中医骨伤医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "苏琦",
    "phoneNum": "13531579696",
    "hospital": "广东潮州市解放军第188医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "曹汝荣",
    "phoneNum": "18985245082",
    "hospital": "遵义县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "李亢",
    "phoneNum": "15971847222",
    "hospital": "湖北十堰市郧阳医学院附属太和医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "戴伟",
    "phoneNum": "18725749770",
    "hospital": "江油市人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "苏启旭",
    "phoneNum": "13885381680",
    "hospital": "贵州省安顺市人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "史汉忠",
    "phoneNum": "13892618669",
    "hospital": "陕西省勉县医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "刘磊",
    "phoneNum": "18725742716",
    "hospital": "开封155中心医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "罗崇富",
    "phoneNum": "13984461035",
    "hospital": "贵州省思南县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "成耿",
    "phoneNum": "13638803368",
    "hospital": "云南省镇雄县中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "殷慧",
    "phoneNum": "15111922978",
    "hospital": "重庆巴南区人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "赖超超",
    "phoneNum": "13989160270",
    "hospital": "四川省达州市第二人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "李禄松",
    "phoneNum": "13984271122",
    "hospital": "贵州省遵义县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "蒋文",
    "phoneNum": "13980187841",
    "hospital": "四川遂宁市射洪县中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "王征",
    "phoneNum": "13983987118",
    "hospital": "渝北区人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "程着",
    "phoneNum": "18982867773",
    "hospital": "四川达州陆军医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "邓清民",
    "phoneNum": "13983513870",
    "hospital": "重庆云阳县中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "邹蕾",
    "phoneNum": "13708501765",
    "hospital": "贵州航天医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "武勇松",
    "phoneNum": "13518239072",
    "hospital": "四川乐山市第二人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "朱永新",
    "phoneNum": "13512379717",
    "hospital": "重庆大渡口人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "王文五",
    "phoneNum": "13984614563",
    "hospital": "贵州盘江投资控股集团公司总医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "蔡三",
    "phoneNum": "13996398895",
    "hospital": "重庆市胸科医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "钟涛",
    "phoneNum": "15884116859",
    "hospital": "四川宜宾市第一人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "李菲",
    "phoneNum": "13885853966",
    "hospital": "贵州省盘县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "孙宝慧",
    "phoneNum": "15111817317",
    "hospital": "万盛南桐矿业公司总医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "王国平",
    "phoneNum": "13974988073",
    "hospital": "湖南省人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "尹广位",
    "phoneNum": "13769748745",
    "hospital": "云南省宣威市中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "徐明灯",
    "phoneNum": "18717016261",
    "hospital": "垫江县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "李苓",
    "phoneNum": "15123157972",
    "hospital": "巴南区第二人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "沈修行",
    "phoneNum": "13795713888",
    "hospital": "四川安岳县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "班华登",
    "phoneNum": "18907768485",
    "hospital": "广西右江民族医学院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "张骞和",
    "phoneNum": "13595898697",
    "hospital": "贵州省水城矿业总医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "叶恒",
    "phoneNum": "15823267627",
    "hospital": "广东潮州市潮州医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "杜绍良",
    "phoneNum": "13251344116",
    "hospital": "云南玉溪市人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "徐剑",
    "phoneNum": "13990020009",
    "hospital": "四川自贡市第一人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "孟光强",
    "phoneNum": "15519293333",
    "hospital": "贵州道真县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "桂凯红",
    "phoneNum": "15971391023",
    "hospital": "湖北黄冈市中心医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "朱明",
    "phoneNum": "15023298128",
    "hospital": "江津区中心医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "李彬彬",
    "phoneNum": "18772753371",
    "hospital": "湖北郧阳医学院附属太和医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "赵智君",
    "phoneNum": "18523025184",
    "hospital": "重庆渝北区人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "桂忠山",
    "phoneNum": "13852984649",
    "hospital": "359医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "袁毅",
    "phoneNum": "18716134520",
    "hospital": "泸州医学院附属中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "何伟",
    "phoneNum": "13983290183",
    "hospital": "江津市中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "冉小兵",
    "phoneNum": "13452252566",
    "hospital": "重庆市黔江民族医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "胡德华",
    "phoneNum": "13224087582",
    "hospital": "四川高县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "王义兵",
    "phoneNum": "15832194891",
    "hospital": "河北省辛集市第一医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "刘绍凡",
    "phoneNum": "13883163286",
    "hospital": "重庆市中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "孙皓民",
    "phoneNum": "13888138760",
    "hospital": "昆明市中医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "卓卫民",
    "phoneNum": "13996034995",
    "hospital": "重庆南桐总医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "叶俊强",
    "phoneNum": "13802550830",
    "hospital": "深圳市第九人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "昌宏",
    "phoneNum": "13087736941",
    "hospital": "桂林市解放军第181医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "张小林",
    "phoneNum": "13036346268",
    "hospital": "武隆县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "马建军",
    "phoneNum": "18996511311",
    "hospital": "奉节县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "高明堂",
    "phoneNum": "13598080828",
    "hospital": "郑州市第七人民医院关节外科",
    "department": "关节外科",
    "position": "医师"
  },
  {
    "name": "沈宏达",
    "phoneNum": "13095179966",
    "hospital": "新疆阿克苏农一师医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "王岭",
    "phoneNum": "13644513273",
    "hospital": "黑龙江省农垦总局总医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "杨东风",
    "phoneNum": "13972409060",
    "hospital": "湖北省咸丰县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "庾明",
    "phoneNum": "13064326836",
    "hospital": "四川省达州市中心医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "孙星寿",
    "phoneNum": "13896759108",
    "hospital": "重庆市涪陵区郭昌毕骨伤科医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "张世东",
    "phoneNum": "13883925768",
    "hospital": "重庆市万盛区南桐矿业公司总医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "翁兵",
    "phoneNum": "18990549333",
    "hospital": "四川威远县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "罗亚刚",
    "phoneNum": "13408931771",
    "hospital": "云南省红河州个旧市人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "任洋",
    "phoneNum": "13689161717",
    "hospital": "陕西省汉中市洋县医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "许明熙",
    "phoneNum": "15320212988",
    "hospital": "重庆市大足县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "曾肖宾",
    "phoneNum": "13996735008",
    "hospital": "重庆南川区人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "王学林",
    "phoneNum": "15084402388",
    "hospital": "重庆奉节县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "唐华",
    "phoneNum": "13084443385",
    "hospital": "四川省成都市现代医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "张发平",
    "phoneNum": "13990095680",
    "hospital": "四川省富顺县人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "张箭",
    "phoneNum": "13659048950",
    "hospital": "四川省泸州市人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "唐勇",
    "phoneNum": "15978983898",
    "hospital": "重庆涪陵新妙中心卫生院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "赵俊波",
    "phoneNum": "13963857832",
    "hospital": "山东省烟台莱阳中心医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "祝红军",
    "phoneNum": "13941925606",
    "hospital": "辽宁辽阳市解放军201医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "唐飞",
    "phoneNum": "13389641686",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "邱振中",
    "phoneNum": "13638385596",
    "hospital": "西安市解放军第323医院",
    "department": "骨科",
    "position": "医师"
  },
  {
    "name": "杨渝勇",
    "phoneNum": "13923928260",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "曹兴",
    "phoneNum": "18523018571",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "王剑岚",
    "phoneNum": "13452302692",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "任林梅",
    "phoneNum": "15002361491",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "许腾飞",
    "phoneNum": "13657619566",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "申文翰",
    "phoneNum": "13647629827",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "龙毅",
    "phoneNum": "13618312228",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "李文博",
    "phoneNum": "13452930025",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "邓淼",
    "phoneNum": "15111823965",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "曹国永",
    "phoneNum": "15923960962",
    "hospital": "武警重庆市总队医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "莫庸",
    "phoneNum": "13618693540",
    "hospital": "重庆市铜梁县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "杨明军",
    "phoneNum": "13923910789",
    "hospital": "重庆市铜梁县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "张伟",
    "phoneNum": "13576821330",
    "hospital": "重庆市铜梁县中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "荣华",
    "phoneNum": "18712345623",
    "hospital": "重庆市铜梁县中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "张俊杰",
    "phoneNum": "13618393040",
    "hospital": "重庆市铜梁县中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "陈旭",
    "phoneNum": "17723365432",
    "hospital": "重庆市铜梁县中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "杨霖",
    "phoneNum": "13508521288",
    "hospital": "重庆市铜梁县中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "许浩成",
    "phoneNum": "17716652184",
    "hospital": "重庆市铜梁县中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "梁熙",
    "phoneNum": "13594059590",
    "hospital": "重庆医科大学附属第一医院",
    "department": "骨科",
    "position": "副教授"
  },
  {
    "name": "胡宁",
    "phoneNum": "18696761022",
    "hospital": "重庆医科大学附属第一医院",
    "department": "骨科",
    "position": "副教授"
  },
  {
    "name": "张华",
    "phoneNum": "13102348719",
    "hospital": "重庆医科大学附属第一医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "陈虹",
    "phoneNum": "13594115158",
    "hospital": "重庆医科大学附属第一医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "王爱民",
    "phoneNum": "13308302730",
    "hospital": "中国人民解放军第三军医大学重庆大坪医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "王子明",
    "phoneNum": "13320207586",
    "hospital": "中国人民解放军第三军医大学重庆大坪医院",
    "department": "运动医学",
    "position": "副主任医师"
  },
  {
    "name": "熊雁",
    "phoneNum": "13228686341",
    "hospital": "中国人民解放军第三军医大学重庆大坪医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "兰秀夫",
    "phoneNum": "13883730627",
    "hospital": "中国人民解放军第三军医大学重庆大坪医院",
    "department": "骨科",
    "position": "副教授"
  },
  {
    "name": "张铭华",
    "phoneNum": "13996150366",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "赵波",
    "phoneNum": "13101371711",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "何超",
    "phoneNum": "18996172857",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "朱凤臣",
    "phoneNum": "15520016069",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "邵高海",
    "phoneNum": "13500303511",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "李波",
    "phoneNum": "13752920499",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "屈一鸣",
    "phoneNum": "13908395569",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "徐海涛",
    "phoneNum": "13983172806",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "余雨",
    "phoneNum": "13708330627",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "栾和旭",
    "phoneNum": "1399624996",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "栾富均",
    "phoneNum": "15922542654",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "郑华",
    "phoneNum": "13996205858",
    "hospital": "重庆市第二人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "李光旭",
    "phoneNum": "13709419240",
    "hospital": "重庆市永川区人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "李德胜",
    "phoneNum": "13983832351",
    "hospital": "重庆市永川区人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "夏毅",
    "phoneNum": "13883962799",
    "hospital": "重庆市大足县中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "杨谦",
    "phoneNum": "13983758418",
    "hospital": "重庆市大足县中医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "周皓彬",
    "phoneNum": "13330339933",
    "hospital": "重庆市大足县中医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "王路",
    "phoneNum": "13594136735",
    "hospital": "重庆市第三人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "朱天亮",
    "phoneNum": "13996153907",
    "hospital": "重庆市第三人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "林朗",
    "phoneNum": "18696776577",
    "hospital": "重庆市第三人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "田开熙",
    "phoneNum": "13883020620",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "刘远禄",
    "phoneNum": "18996103571",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "曹治东",
    "phoneNum": "13883894301",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "苟景跃",
    "phoneNum": "13320266985",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "邓志龙",
    "phoneNum": "13514378083",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "李邦春",
    "phoneNum": "13883376219",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "贺小兵",
    "phoneNum": "13983580077",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "王明贵",
    "phoneNum": "18996880036",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "朱庆和",
    "phoneNum": "13908259695",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "李克俭",
    "phoneNum": "18680955541",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "赵刚",
    "phoneNum": "13996767020",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "刘晓东",
    "phoneNum": "13709462304",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "刘登钧",
    "phoneNum": "13658419192",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "李思宁",
    "phoneNum": "13983332970",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "王海",
    "phoneNum": "13609423757",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "朱君",
    "phoneNum": "13436066027",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "张博",
    "phoneNum": "18523653687",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "郝兴泽",
    "phoneNum": "13983581755",
    "hospital": "重庆市涪陵区中心医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "陈志中",
    "phoneNum": "18983115258",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "黄坤",
    "phoneNum": "13436166430",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "封富",
    "phoneNum": "13368106088",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "谭红霖",
    "phoneNum": "18983755344",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "周宏",
    "phoneNum": "18680832338",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "邝军",
    "phoneNum": "15923333768",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "袁国伟",
    "phoneNum": "13883663210",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "唐飞",
    "phoneNum": "13389641686",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "沈洪林",
    "phoneNum": "18996028863",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "肖超",
    "phoneNum": "13389641684",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "陈臣",
    "phoneNum": "15310277389",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "陈荣富",
    "phoneNum": "18996017183",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "吴雷",
    "phoneNum": "13678435316",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "曾胜",
    "phoneNum": "13389641678",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "唐劲",
    "phoneNum": "13389641692",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "彭兴平",
    "phoneNum": "13389641672",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "席鹏峰",
    "phoneNum": "13389641683",
    "hospital": "重庆市长寿区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "余相华",
    "phoneNum": "13896577116",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "袁世伟",
    "phoneNum": "15826214812",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "宋国煜",
    "phoneNum": "15826279607",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "朱益华",
    "phoneNum": "13996707886",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "陈华生",
    "phoneNum": "18502337127",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "丁文峰",
    "phoneNum": "13983320190",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "张军",
    "phoneNum": "15928909807",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "朱翔",
    "phoneNum": "15826065513",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "徐明灯",
    "phoneNum": "18717016261",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "黄建伟",
    "phoneNum": "13896715781",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "李常中",
    "phoneNum": "13896577178",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "宋鹏宇",
    "phoneNum": "13752835052",
    "hospital": "重庆市垫江县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "汪飞",
    "phoneNum": "13896730880",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "郭彬",
    "phoneNum": "13908255060",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "郑学钧",
    "phoneNum": "13996851315",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "杜思能",
    "phoneNum": "13896755131",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "谢江华",
    "phoneNum": "13996750237",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "汪昂",
    "phoneNum": "13509465478",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "张绍华",
    "phoneNum": "13896537853",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "石林",
    "phoneNum": "13452421081",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "周祥",
    "phoneNum": "13896758812",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "胡永春",
    "phoneNum": "13658276638",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "宋治国",
    "phoneNum": "13896759480",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "罗继红",
    "phoneNum": "13896692187",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "代亮",
    "phoneNum": "13896792343",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "刘飞兰",
    "phoneNum": "13883169445",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "陈友银",
    "phoneNum": "13896676225",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "王元峰",
    "phoneNum": "13594580808",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "唐正",
    "phoneNum": "13638236785",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "陈彪",
    "phoneNum": "18716803201",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "莫元升",
    "phoneNum": "13509465988",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "张芳泽",
    "phoneNum": "13896763676",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "张世国",
    "phoneNum": "13896621256",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "郎星元",
    "phoneNum": "13883849639",
    "hospital": "重庆市垫江县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "蒋骏伟",
    "phoneNum": "13908256235",
    "hospital": "重庆市丰都县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "刘佳",
    "phoneNum": "15023252551",
    "hospital": "重庆市丰都县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "冉川",
    "phoneNum": "13452597978",
    "hospital": "重庆市丰都县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "冉春",
    "phoneNum": "15095883501",
    "hospital": "重庆市丰都县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "范洪武",
    "phoneNum": "13594581111",
    "hospital": "重庆市丰都县人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "李程旭",
    "phoneNum": "13330370288",
    "hospital": "重庆市丰都县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "曾建勇",
    "phoneNum": "15095808772",
    "hospital": "重庆市丰都县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "张云涛",
    "phoneNum": "13896525097",
    "hospital": "重庆市丰都县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "邹文胜",
    "phoneNum": "13908256321",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "赵鲁沂",
    "phoneNum": "15023931221",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "黄河",
    "phoneNum": "18716866928",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "杨建华",
    "phoneNum": "18696776933",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "黄树华",
    "phoneNum": "18184706672",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "向福辉",
    "phoneNum": "13896662556",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "廖先觉",
    "phoneNum": "13896676961",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "李小平",
    "phoneNum": "13038355197",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "主任中医师"
  },
  {
    "name": "许春华",
    "phoneNum": "15223806187",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "李科",
    "phoneNum": "15826266966",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "许正发",
    "phoneNum": "13896738066",
    "hospital": "重庆市丰都县中医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "林光友",
    "phoneNum": "18983600063",
    "hospital": "重庆市綦江县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "李晓峰",
    "phoneNum": "15223422292",
    "hospital": "重庆市綦江县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "胡林",
    "phoneNum": "13512359885",
    "hospital": "重庆市綦江县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "吴明鲜",
    "phoneNum": "13618388551",
    "hospital": "重庆市綦江县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "陈立潍",
    "phoneNum": "13983095579",
    "hospital": "重庆市潼南县人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "唐娟",
    "phoneNum": "13896007373",
    "hospital": "重庆市潼南县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "张彬",
    "phoneNum": "13908315019",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "任芳",
    "phoneNum": "13370737266",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "莫党生",
    "phoneNum": "13032380802",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "孙志红",
    "phoneNum": "18696660120",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "周波",
    "phoneNum": "13372712582",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "谭祖建",
    "phoneNum": "13983063922",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "岳逊",
    "phoneNum": "13608348597",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "周明全",
    "phoneNum": "13032315333",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "贾小林",
    "phoneNum": "15808025643",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "胡维",
    "phoneNum": "13983681194",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "杨明",
    "phoneNum": "18680865090",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "陈小平",
    "phoneNum": "13098688163",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "沈凯",
    "phoneNum": "15923518328",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "张胜利",
    "phoneNum": "15823458696",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "隆晓涛",
    "phoneNum": "18623150310",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "刁剑会",
    "phoneNum": "13617682225",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "王炜",
    "phoneNum": "18996351183",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "万革",
    "phoneNum": "13752888985",
    "hospital": "重庆市中山医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "鲍晓毅",
    "phoneNum": "13527442979",
    "hospital": "重庆市第九人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "张年春",
    "phoneNum": "15123106841",
    "hospital": "重庆市第九人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "陈渝",
    "phoneNum": "13983121099",
    "hospital": "重庆市第九人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "刘春阳",
    "phoneNum": "18983086668",
    "hospital": "重庆市第九人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "邵鉴魁",
    "phoneNum": "13668017827",
    "hospital": "重庆市第九人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "翁政",
    "phoneNum": "13996499138",
    "hospital": "重庆市第九人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "杨军",
    "phoneNum": "13594105101",
    "hospital": "重庆市第九人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "朱勇军",
    "phoneNum": "18623440838",
    "hospital": "重庆市第九人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "李善志",
    "phoneNum": "13608332321",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "桂绍红",
    "phoneNum": "18623041687",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "汪礼军",
    "phoneNum": "15123207556",
    "hospital": "重庆市大足县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "袁波",
    "phoneNum": "18716280987",
    "hospital": "重庆市大足县人民医院",
    "department": "肾科",
    "position": "副主任医师"
  },
  {
    "name": "田媚",
    "phoneNum": "18996302199",
    "hospital": "重庆市大足县人民医院",
    "department": "肾科",
    "position": "主治医师"
  },
  {
    "name": "丁洪",
    "phoneNum": "18623084336",
    "hospital": "重庆市北部新区第一人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "李光旭",
    "phoneNum": "13709419240",
    "hospital": "重庆市永川区人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "徐薇",
    "phoneNum": "13996007878",
    "hospital": "重庆市永川区人民医院",
    "department": "肾科",
    "position": "副主任医师"
  },
  {
    "name": "卢卫忠",
    "phoneNum": "13012392369",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "周杰",
    "phoneNum": "13983905720",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "副主任中医师"
  },
  {
    "name": "李建军",
    "phoneNum": "13108980253",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "副主任中医师"
  },
  {
    "name": "陈廷明",
    "phoneNum": "13983130303",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "刘绍凡",
    "phoneNum": "13883163286",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "陈愉",
    "phoneNum": "13452360638",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "万锐杰",
    "phoneNum": "18623356003",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "易世雄",
    "phoneNum": "13996121629",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "曹洪辉",
    "phoneNum": "18623415268",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "王加俊",
    "phoneNum": "13883258206",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "匡志平",
    "phoneNum": "15123119090",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "陈小勇",
    "phoneNum": "13883225945",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "冉强",
    "phoneNum": "18302305336",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "王美元",
    "phoneNum": "13648260288",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "雷鸣",
    "phoneNum": "15086696252",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "匡雷",
    "phoneNum": "13101232292",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "李平",
    "phoneNum": "15023252686",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "冉金伟",
    "phoneNum": "13527360602",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "江恒",
    "phoneNum": "13452984196",
    "hospital": "重庆市中医研究院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "龙兴敬",
    "phoneNum": "13452909112",
    "hospital": "重庆市高新区人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "赵万正",
    "phoneNum": "13635459387",
    "hospital": "重庆市高新区人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "杨世林",
    "phoneNum": "13996371980",
    "hospital": "重庆市高新区人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "匡安银",
    "phoneNum": "13983131087",
    "hospital": "重庆市高新区人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "代羽",
    "phoneNum": "15178725286",
    "hospital": "重庆市高新区人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "田开熙",
    "phoneNum": "13883020620",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "刘远禄",
    "phoneNum": "18996103571",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "曹治东",
    "phoneNum": "13883894301",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "苟景跃",
    "phoneNum": "13320266985",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "邓志龙",
    "phoneNum": "13514378083",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "李邦春",
    "phoneNum": "13883376219",
    "hospital": "重庆市急救医疗中心",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "谭响",
    "phoneNum": "13983260666",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "曾波",
    "phoneNum": "18983130660",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "胡小军",
    "phoneNum": "13896053183",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "李犹学",
    "phoneNum": "13883688998",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "梁军",
    "phoneNum": "13883893363",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "饶世海",
    "phoneNum": "13594667785",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "汤世金",
    "phoneNum": "13608385308",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "王德华",
    "phoneNum": "18523085887",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "王光健",
    "phoneNum": "15023278390",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "王欢",
    "phoneNum": "15923925607",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "魏文东",
    "phoneNum": "13896090885",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "谢金岑",
    "phoneNum": "18623020471",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "杨伟",
    "phoneNum": "15023163691",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "郑明伟",
    "phoneNum": "13883213999",
    "hospital": "重庆市荣昌县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "陈志中",
    "phoneNum": "18983115258",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "黄坤",
    "phoneNum": "13436166430",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "封富",
    "phoneNum": "13368106088",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "谭红霖",
    "phoneNum": "18983755344",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "周宏",
    "phoneNum": "18680832338",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "邝军",
    "phoneNum": "15923333768",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "袁国伟",
    "phoneNum": "13883663210",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "肖义敏",
    "phoneNum": "18996093058",
    "hospital": "重庆市长寿区中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "李旭",
    "phoneNum": "13638313537",
    "hospital": "重庆南岸中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "张圣华",
    "phoneNum": "13527635140",
    "hospital": "重庆南岸中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "尹良军",
    "phoneNum": "13594668983",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "副教授"
  },
  {
    "name": "陈世荣",
    "phoneNum": "13883111390",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "副教授"
  },
  {
    "name": "陈富",
    "phoneNum": "13752981512",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "程昀",
    "phoneNum": "13060203995",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "秦晋",
    "phoneNum": "15909398050",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "梁凯路",
    "phoneNum": "15803009066",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "聂茂",
    "phoneNum": "13678428205",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "晏铮剑",
    "phoneNum": "13983983139",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "汪洋",
    "phoneNum": "13206138504",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "李锐冬",
    "phoneNum": "13436056490",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "石磊",
    "phoneNum": "15826122617",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "程相俊",
    "phoneNum": "13048463221",
    "hospital": "重庆医科大学附属第二医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "黄纯聪",
    "phoneNum": "13368176120",
    "hospital": "重庆市西铝医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "胡国忠",
    "phoneNum": "15923281870",
    "hospital": "重庆市西铝医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "张华义",
    "phoneNum": "13308360622",
    "hospital": "重庆市西铝医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "何剑锋",
    "phoneNum": "13996786518",
    "hospital": "重庆市南川区人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "肖文座",
    "phoneNum": "13996860958",
    "hospital": "重庆市南川区人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "王庭明",
    "phoneNum": "15923728016",
    "hospital": "重庆市南川区人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "许万堂",
    "phoneNum": "13452510323",
    "hospital": "重庆市南川区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "周波",
    "phoneNum": "13594553548",
    "hospital": "重庆市南川区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "毛显贵",
    "phoneNum": "15023500285",
    "hospital": "重庆市南川区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "彭士波",
    "phoneNum": "13594039951",
    "hospital": "重庆市南川区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "娄方练",
    "phoneNum": "15095838909",
    "hospital": "重庆市南川区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "杨柳",
    "phoneNum": "13908399739",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "教授"
  },
  {
    "name": "段小军",
    "phoneNum": "13883112822",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "副教授"
  },
  {
    "name": "陈光兴",
    "phoneNum": "18623108787",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "副教授"
  },
  {
    "name": "郭林",
    "phoneNum": "13883007291",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "副教授"
  },
  {
    "name": "张颖",
    "phoneNum": "13648328888",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "副教授"
  },
  {
    "name": "何锐",
    "phoneNum": "18696766829",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "副教授"
  },
  {
    "name": "古凌川",
    "phoneNum": "13883030383",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "主治医师"
  },
  {
    "name": "王凤玲",
    "phoneNum": "18580121774",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "主治医师"
  },
  {
    "name": "陈昊",
    "phoneNum": "15086856686",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "主治医师"
  },
  {
    "name": "彭阳",
    "phoneNum": "13594329777",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "杨鹏飞",
    "phoneNum": "15922949824",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "主治医师"
  },
  {
    "name": "黄程军",
    "phoneNum": "15213309667",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "主治医师"
  },
  {
    "name": "傅德杰",
    "phoneNum": "13594032750",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "主治医师"
  },
  {
    "name": "陶兴",
    "phoneNum": "18983207331",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "邓姝",
    "phoneNum": "13983802218",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "陈鹏旭",
    "phoneNum": "15723053205",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "罗江明",
    "phoneNum": "18323213268",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "熊然",
    "phoneNum": "18580150722",
    "hospital": "中国人民解放军第三军医大学重庆西南医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "杨昌国",
    "phoneNum": "13012333392",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "袁可",
    "phoneNum": "13668009135",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "周梦姣",
    "phoneNum": "13452137833",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "李善志",
    "phoneNum": "13608332321",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "桂绍红",
    "phoneNum": "18623041687",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "刘文平",
    "phoneNum": "18696502232",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "赵继文",
    "phoneNum": "13320200001",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "修奇志",
    "phoneNum": "13618312666",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "公孙婷",
    "phoneNum": "13527407258",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "黄强",
    "phoneNum": "13696462577",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "石一君",
    "phoneNum": "18580994875",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "宋可",
    "phoneNum": "13908353298",
    "hospital": "重庆市沙坪坝区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "孙燕威",
    "phoneNum": "13032315575",
    "hospital": "重庆市江北区中医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "牟应怀",
    "phoneNum": "13650532407",
    "hospital": "重庆市江北区中医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "陈莉",
    "phoneNum": "13983196850",
    "hospital": "重庆市江北区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "廖世亮",
    "phoneNum": "13101211782",
    "hospital": "重庆市江北区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "魏炳南",
    "phoneNum": "15922770606",
    "hospital": "重庆市江北区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "丁浩洋",
    "phoneNum": "15123329381",
    "hospital": "重庆市江北区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "李晖",
    "phoneNum": "13452374926",
    "hospital": "重庆市江北区中医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "余定华",
    "phoneNum": "13983790512",
    "hospital": "重庆市江北区中医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "贺仕雄",
    "phoneNum": "18580546575",
    "hospital": "重庆市红十字会医院江北区人民医院",
    "department": "骨科",
    "position": "主任医师"
  },
  {
    "name": "吴蔚",
    "phoneNum": "13983881272",
    "hospital": "重庆市红十字会医院江北区人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "汪海波",
    "phoneNum": "15320497577",
    "hospital": "重庆市红十字会医院江北区人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "吴光宇",
    "phoneNum": "13048416353",
    "hospital": "重庆市红十字会医院江北区人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "杨帆",
    "phoneNum": "13617665211",
    "hospital": "重庆市红十字会医院江北区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "刘科帅",
    "phoneNum": "15215014896",
    "hospital": "重庆市红十字会医院江北区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "魏刚",
    "phoneNum": "13883195120",
    "hospital": "重庆市红十字会医院江北区人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "冉胜强",
    "phoneNum": "15123218901",
    "hospital": "重庆市红十字会医院江北区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "沈钧国",
    "phoneNum": "13883147118",
    "hospital": "重庆同康骨科医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "杜云峰",
    "phoneNum": "13983833176",
    "hospital": "重庆市沙坪坝区陈家桥医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "何彬",
    "phoneNum": "13996244338",
    "hospital": "重庆市沙坪坝区陈家桥医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "莫世翔",
    "phoneNum": "13883334704",
    "hospital": "重庆市沙坪坝区陈家桥医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "陈顺炳",
    "phoneNum": "13018349863",
    "hospital": "重庆建设医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "肖仕斌",
    "phoneNum": "15086950897",
    "hospital": "重庆建设医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "吴庆",
    "phoneNum": "13996856744",
    "hospital": "重庆市沙坪坝区人民医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "罗勇",
    "phoneNum": "13352013767",
    "hospital": "重庆市沙坪坝区人民医院",
    "department": "骨科",
    "position": "主治医师"
  },
  {
    "name": "舒华",
    "phoneNum": "13983360335",
    "hospital": "重庆市沙坪坝区人民医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "关群",
    "phoneNum": "13365808900",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "运动医学",
    "position": "主任医师"
  },
  {
    "name": "吉明",
    "phoneNum": "13668473157",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "刘峰",
    "phoneNum": "13212505182",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "唐进",
    "phoneNum": "13212367262",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "熊小江",
    "phoneNum": "13983528111",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "运动医学",
    "position": "副主任医师"
  },
  {
    "name": "杨涛",
    "phoneNum": "13709450256",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "运动医学",
    "position": "副主任医师"
  },
  {
    "name": "周继斌",
    "phoneNum": "13372768167",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "运动医学",
    "position": "住院医师"
  },
  {
    "name": "陈乙瑞",
    "phoneNum": "13983521159",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "冯世龙",
    "phoneNum": "13509467567",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "骨科",
    "position": "副主任医师"
  },
  {
    "name": "李波",
    "phoneNum": "13896238178",
    "hospital": "重庆市万州市三峡中心医院",
    "department": "骨科",
    "position": "住院医师"
  },
  {
    "name": "王玉柱",
    "phoneNum": "18983556628",
    "hospital": "重庆市云阳县人民医院",
    "department": "骨科",
    "position": "副主任医师"
  }];




data.forEach(function(d){
  var dcnum = initDCN++;
  var doctor = {
    phoneNum: d.phoneNum,
    realName: d.name,
    docChatNum: dcnum + "",
    applyStatus: "done",
    from: "重庆-运动医学",
    password: "e10adc3949ba59abbe56e057f20f883e",
    systag: 'doctor',
    province: "重庆市",
    city: "",
    sex: "",
    hospital: d.hospital,
    department: d.department,
    chargeLevel: "二",
    callPrice: {
      discount: 1,
      customerInitiateTime: 5,
      doctorInitiateTime: 5,
      initiatePayment: 20,
      initiateIncome: 16,
      paymentPerMin: 5,
      incomePerMin: 4
    },
    createdAt:1481900740806,
    updatedAt:1481900740806,
    isDeleted:false,
    source: "docChat",
    statisticsUpdatedAt:1481900740806
  };

  doctor.recommendConf = [
    {
      "item" : "bak",
      "isVisiable" : true,
      "disabled" : true,
      "type" : "doctor",
      "title" : "暂无",
      "docChatNum" : "",
      "link" : "",
      "more" : {
        "disabled" : false,
        "type" : "doctor_list",
        "title" : "备用联系人",
        "url" : "https://pro.mtxhcare.com/1/customer/doctor/recommendList/bakContact"
      }
    },
    {
      "item" : "ass",
      "isVisiable" : true,
      "disabled" : true,
      "type" : "doctor",
      "title" : "暂无",
      "docChatNum" : "",
      "link" : "",
      "more" : {
        "type" : "doctor_list",
        "title" : "服务助理",
        "url" : "https://pro.mtxhcare.com/1/customer/doctor/recommendList/assistant",
        "disabled" : false
      }
    },
    {
      "item" : "ad",
      "isVisiable" : true,
      "disabled" : true,
      "type" : "doctor",
      "title" : "暂无",
      "docChatNum" : "",
      "link" : "",
      "more" : {
        "type" : "doctor_list",
        "title" : "猜你喜欢",
        "url" : "https://pro.mtxhcare.com/1/customer/doctor/recommendList/ad",
        "disabled" : false
      }
    }
  ];
  db.doctors.insert(doctor);
});

// 检查脚本
// db.doctors.find({docChatNum: /^7999/})
// db.doctors.update({docChatNum: /^7999/}, {$set: {source: "docChat"}}, {multi: true})
// db.doctors.find({from: "重庆-运动医学"}).count()
// db.doctors.remove({from: "重庆-运动医学"})
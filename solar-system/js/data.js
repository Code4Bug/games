// 行星数据配置
const PLANETS_DATA = [
    { 
        name: '水星', 
        size: 2.4, 
        distance: 40, 
        color: 0x8c7853, 
        speed: 0.04, // 公转速度
        rotationSpeed: 0.002, // 自转速度（58.6天自转一次）
        info: '距离太阳最近的行星，表面温差极大，白天约430°C，夜晚-180°C。公转周期：88天',
        realSize: '4,879 km',
        moons: 0
    },
    { 
        name: '金星', 
        size: 6, 
        distance: 60, 
        color: 0xffc649, 
        speed: 0.015,
        rotationSpeed: -0.0008, // 逆向自转（243天自转一次）
        info: '太阳系中最热的行星，浓厚的大气层产生强烈的温室效应。公转周期：225天',
        realSize: '12,104 km',
        moons: 0
    },
    { 
        name: '地球', 
        size: 6.4, 
        distance: 85, 
        color: 0x4a90e2, 
        speed: 0.01, // 公转速度（365天）
        rotationSpeed: 0.25, // 自转速度（24小时自转一次）
        info: '我们的家园，唯一已知存在生命的星球，71%被海洋覆盖。公转周期：365天',
        realSize: '12,742 km',
        moons: 1
    },
    { 
        name: '火星', 
        size: 3.4, 
        distance: 110, 
        color: 0xe27b58, 
        speed: 0.008,
        rotationSpeed: 0.24, // 自转速度（24.6小时自转一次）
        info: '红色星球，拥有太阳系最大的火山和峡谷，有极地冰盖。公转周期：687天',
        realSize: '6,779 km',
        moons: 2
    },
    { 
        name: '木星', 
        size: 14, 
        distance: 160, 
        color: 0xc88b3a, 
        speed: 0.002,
        rotationSpeed: 0.6, // 自转速度（9.9小时自转一次）
        info: '太阳系最大的行星，著名的大红斑是持续数百年的风暴。公转周期：12年',
        realSize: '139,820 km',
        moons: 79
    },
    { 
        name: '土星', 
        size: 12, 
        distance: 210, 
        color: 0xfad5a5, 
        speed: 0.0009,
        rotationSpeed: 0.55, // 自转速度（10.7小时自转一次）
        info: '拥有壮观光环的气态巨行星，光环由冰块和岩石组成。公转周期：29年',
        realSize: '116,460 km',
        moons: 82
    },
    { 
        name: '天王星', 
        size: 8, 
        distance: 260, 
        color: 0x4fd0e7, 
        speed: 0.0004,
        rotationSpeed: 0.35, // 自转速度（17.2小时自转一次）
        info: '侧躺着公转的冰巨星，自转轴倾斜98度，呈现蓝绿色。公转周期：84年',
        realSize: '50,724 km',
        moons: 27
    },
    { 
        name: '海王星', 
        size: 7.8, 
        distance: 310, 
        color: 0x4166f5, 
        speed: 0.0001,
        rotationSpeed: 0.38, // 自转速度（16.1小时自转一次）
        info: '太阳系最外层的行星，拥有太阳系最强的风暴，风速超过2000km/h。公转周期：165年',
        realSize: '49,244 km',
        moons: 14
    }
];

// 卫星数据配置
const MOONS_DATA = {
    '地球': [
        { 
            name: '月球', 
            size: 1.5, 
            distance: 10, 
            color: 0xaaaaaa, 
            speed: 0.0092, // 月球公转速度（27.3天绕地球一周，与地球自转同步）
            info: '地球唯一的天然卫星，距离地球约38.4万公里，影响地球的潮汐现象。', 
            realSize: '3,474 km',
            hasTexture: true
        }
    ],
    '火星': [
        { 
            name: '火卫一(Phobos)', 
            size: 0.6, 
            distance: 6, 
            color: 0x8c7853, 
            speed: 0.15, 
            info: '火星较大的卫星，轨道极低，每7.6小时绕火星一周。', 
            realSize: '22.2 km' 
        },
        { 
            name: '火卫二(Deimos)', 
            size: 0.4, 
            distance: 9, 
            color: 0x9c8863, 
            speed: 0.08, 
            info: '火星较小的卫星，呈不规则形状，表面布满陨石坑。', 
            realSize: '12.6 km' 
        }
    ],
    '木星': [
        { 
            name: '木卫一(Io)', 
            size: 1.8, 
            distance: 18, 
            color: 0xffdd44, 
            speed: 0.12, 
            info: '太阳系火山活动最活跃的天体，表面布满硫磺。', 
            realSize: '3,643 km' 
        },
        { 
            name: '木卫二(Europa)', 
            size: 1.6, 
            distance: 22, 
            color: 0xddeeff, 
            speed: 0.09, 
            info: '冰冻表面下可能存在液态水海洋，是寻找外星生命的重点目标。', 
            realSize: '3,122 km' 
        },
        { 
            name: '木卫三(Ganymede)', 
            size: 2.6, 
            distance: 26, 
            color: 0xaabbcc, 
            speed: 0.07, 
            info: '太阳系最大的卫星，比水星还大，拥有自己的磁场。', 
            realSize: '5,268 km' 
        },
        { 
            name: '木卫四(Callisto)', 
            size: 2.4, 
            distance: 30, 
            color: 0x8899aa, 
            speed: 0.05, 
            info: '表面布满陨石坑，是太阳系中最古老的地形之一。', 
            realSize: '4,821 km' 
        }
    ],
    '土星': [
        { 
            name: '土卫六(Titan)', 
            size: 2.5, 
            distance: 20, 
            color: 0xffaa44, 
            speed: 0.08, 
            info: '太阳系第二大卫星，拥有浓厚大气层，表面有液态甲烷湖泊。', 
            realSize: '5,150 km' 
        },
        { 
            name: '土卫二(Enceladus)', 
            size: 1.0, 
            distance: 16, 
            color: 0xeeffff, 
            speed: 0.12, 
            info: '表面冰层下喷射水汽柱，可能存在地下海洋。', 
            realSize: '504 km' 
        },
        { 
            name: '土卫五(Rhea)', 
            size: 1.5, 
            distance: 24, 
            color: 0xccddee, 
            speed: 0.06, 
            info: '土星第二大卫星，表面密布冰和陨石坑。', 
            realSize: '1,527 km' 
        }
    ],
    '天王星': [
        { 
            name: '天卫三(Titania)', 
            size: 1.6, 
            distance: 14, 
            color: 0xaaccdd, 
            speed: 0.09, 
            info: '天王星最大的卫星，表面有峡谷和陨石坑。', 
            realSize: '1,578 km' 
        },
        { 
            name: '天卫四(Oberon)', 
            size: 1.5, 
            distance: 18, 
            color: 0x99bbcc, 
            speed: 0.07, 
            info: '天王星第二大卫星，古老而多坑的表面。', 
            realSize: '1,523 km' 
        },
        { 
            name: '天卫一(Ariel)', 
            size: 1.2, 
            distance: 11, 
            color: 0xbbddee, 
            speed: 0.11, 
            info: '表面相对年轻，有明显的断层和峡谷系统。', 
            realSize: '1,158 km' 
        },
        { 
            name: '天卫二(Umbriel)', 
            size: 1.2, 
            distance: 13, 
            color: 0x888899, 
            speed: 0.10, 
            info: '表面非常暗，是天王星卫星中最黑暗的一颗。', 
            realSize: '1,170 km' 
        },
        { 
            name: '天卫五(Miranda)', 
            size: 0.8, 
            distance: 9, 
            color: 0xccddff, 
            speed: 0.13, 
            info: '拥有太阳系中最奇特的地形，表面像拼图一样。', 
            realSize: '472 km' 
        }
    ],
    '海王星': [
        { 
            name: '海卫一(Triton)', 
            size: 2.0, 
            distance: 15, 
            color: 0xccddff, 
            speed: 0.1, 
            info: '太阳系中唯一逆行公转的大卫星，表面有冰火山喷发氮气。', 
            realSize: '2,707 km' 
        },
        { 
            name: '海卫二(Nereid)', 
            size: 0.6, 
            distance: 25, 
            color: 0xaabbdd, 
            speed: 0.04, 
            info: '轨道极其椭圆，是太阳系中轨道离心率最大的卫星之一。', 
            realSize: '340 km' 
        }
    ]
};

// 小卫星配置
const SMALL_MOONS_CONFIG = {
    '木星': { count: 75, baseDistance: 34, distanceRange: 30 },
    '土星': { count: 50, baseDistance: 28, distanceRange: 25 },
    '天王星': { count: 22, baseDistance: 20, distanceRange: 20 },
    '海王星': { count: 12, baseDistance: 18, distanceRange: 15 }
};

// 时间模拟常量
const TIME_CONFIG = {
    earthYearDays: 365.25,
    startDate: new Date(2026, 0, 1),
    earthSpeed: 0.01, // 地球公转速度
    earthRotationSpeed: 0.25 // 地球自转速度
};
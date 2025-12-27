// 可爱扁平化卡通图标库
// 每个图标都是柔和圆角设计,明亮色彩,尺寸一致
const CUTE_ICONS = {
    // 餐饮类
    burger: {
        name: '微笑小汉堡',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 汉堡上层面包 -->
            <path d="M12 28 Q32 22 52 28 L52 24 Q32 18 12 24 Z" fill="#FFB74D"/>
            <ellipse cx="32" cy="24" rx="20" ry="6" fill="#FFA726"/>
            <!-- 芝士 -->
            <path d="M10 30 L32 34 L54 30" fill="#FFD54F"/>
            <!-- 肉饼 -->
            <ellipse cx="32" cy="36" rx="20" ry="5" fill="#8D6E63"/>
            <!-- 蔬菜 -->
            <path d="M11 38 Q32 42 53 38" fill="#81C784"/>
            <!-- 下层面包 -->
            <path d="M10 40 Q32 46 54 40 L54 44 Q32 50 10 44 Z" fill="#FFB74D"/>
            <ellipse cx="32" cy="44" rx="20" ry="5" fill="#FFA726"/>
            <!-- 芝麻 -->
            <circle cx="26" cy="22" r="1.5" fill="#FFE0B2"/>
            <circle cx="38" cy="22" r="1.5" fill="#FFE0B2"/>
            <circle cx="32" cy="20" r="1.5" fill="#FFE0B2"/>
        </svg>`,
        category: 'food'
    },
    coffee: {
        name: '微笑热饮杯',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF3E0" stroke="#FFB74D" stroke-width="2"/>
            <!-- 杯身 -->
            <path d="M18 20 L18 44 Q18 48 22 48 L42 48 Q46 48 46 44 L46 20 Z" fill="#D7CCC8" stroke="#8D6E63" stroke-width="2"/>
            <!-- 咖啡液面 -->
            <ellipse cx="32" cy="20" rx="14" ry="4" fill="#6D4C41"/>
            <!-- 杯把手 -->
            <path d="M46 24 Q54 24 54 30 Q54 36 46 36" fill="none" stroke="#8D6E63" stroke-width="3"/>
            <!-- 笑脸 -->
            <circle cx="28" cy="36" r="2" fill="#4E342E"/>
            <circle cx="36" cy="36" r="2" fill="#4E342E"/>
            <path d="M28 40 Q32 44 36 40" fill="none" stroke="#4E342E" stroke-width="1.5" stroke-linecap="round"/>
            <!-- 热气 -->
            <path d="M26 12 Q28 8 26 6" fill="none" stroke="#BDBDBD" stroke-width="2" stroke-linecap="round"/>
            <path d="M32 10 Q34 6 32 4" fill="none" stroke="#BDBDBD" stroke-width="2" stroke-linecap="round"/>
            <path d="M38 12 Q40 8 38 6" fill="none" stroke="#BDBDBD" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        category: 'food'
    },
    pizza: {
        name: '萌系三角披萨',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 披萨饼底 -->
            <path d="M12 48 L32 16 L52 48 Z" fill="#FFB74D" stroke="#FF9800" stroke-width="2"/>
            <!-- 奶酪 -->
            <path d="M16 46 L32 20 L48 46 Z" fill="#FFE082" opacity="0.8"/>
            <!-- 腊肠1 -->
            <circle cx="26" cy="36" r="4" fill="#E57373"/>
            <circle cx="26" cy="36" r="2" fill="#D32F2F"/>
            <!-- 腊肠2 -->
            <circle cx="38" cy="40" r="4" fill="#E57373"/>
            <circle cx="38" cy="40" r="2" fill="#D32F2F"/>
            <!-- 腊肠3 -->
            <circle cx="32" cy="28" r="3.5" fill="#E57373"/>
            <circle cx="32" cy="28" r="1.8" fill="#D32F2F"/>
            <!-- 橄榄 -->
            <circle cx="22" cy="42" r="2.5" fill="#4CAF50"/>
            <circle cx="42" cy="32" r="2.5" fill="#4CAF50"/>
            <!-- 面饼边 -->
            <path d="M12 48 L32 16 L52 48" fill="none" stroke="#F57C00" stroke-width="3" stroke-linejoin="round"/>
        </svg>`,
        category: 'food'
    },
    noodles: {
        name: '可爱面条碗',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 碗 -->
            <ellipse cx="32" cy="48" rx="20" ry="8" fill="#D7CCC8"/>
            <path d="M12 48 Q12 28 32 28 Q52 28 52 48" fill="#A1887F"/>
            <ellipse cx="32" cy="28" rx="20" ry="6" fill="#BCAAA4"/>
            <!-- 面条 -->
            <path d="M18 30 Q20 24 22 30" fill="none" stroke="#FFCC80" stroke-width="2" stroke-linecap="round"/>
            <path d="M24 28 Q26 22 28 28" fill="none" stroke="#FFCC80" stroke-width="2" stroke-linecap="round"/>
            <path d="M30 27 Q32 21 34 27" fill="none" stroke="#FFCC80" stroke-width="2" stroke-linecap="round"/>
            <path d="M36 28 Q38 22 40 28" fill="none" stroke="#FFCC80" stroke-width="2" stroke-linecap="round"/>
            <path d="M42 30 Q44 24 46 30" fill="none" stroke="#FFCC80" stroke-width="2" stroke-linecap="round"/>
            <!-- 筷子 -->
            <line x1="26" y1="18" x2="26" y2="32" stroke="#8D6E63" stroke-width="2" stroke-linecap="round"/>
            <line x1="38" y1="18" x2="38" y2="32" stroke="#8D6E63" stroke-width="2" stroke-linecap="round"/>
            <!-- 蒸汽 -->
            <path d="M28 14 Q30 10 28 8" fill="none" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M36 14 Q38 10 36 8" fill="none" stroke="#BDBDBD" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`,
        category: 'food'
    },
    drink: {
        name: '快乐饮料杯',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 杯身 -->
            <path d="M18 18 L22 46 Q23 48 26 48 L38 48 Q41 48 42 46 L46 18 Z" fill="#B3E5FC" stroke="#039BE5" stroke-width="2"/>
            <!-- 饮料 -->
            <path d="M20 22 L23 44 Q24 46 26 46 L38 46 Q40 46 41 44 L44 22 Z" fill="#4FC3F7"/>
            <!-- 冰块 -->
            <rect x="24" y="26" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
            <rect x="34" y="30" width="8" height="8" rx="2" fill="white" opacity="0.6"/>
            <!-- 吸管 -->
            <line x1="36" y1="10" x2="32" y2="24" stroke="#FF7043" stroke-width="3" stroke-linecap="round"/>
            <!-- 笑脸 -->
            <circle cx="28" cy="38" r="1.5" fill="#01579B"/>
            <circle cx="36" cy="38" r="1.5" fill="#01579B"/>
            <path d="M28 41 Q32 44 36 41" fill="none" stroke="#01579B" stroke-width="1.2" stroke-linecap="round"/>
        </svg>`,
        category: 'food'
    },
    cake: {
        name: '甜蜜小蛋糕',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 蛋糕底座 -->
            <rect x="14" y="32" width="36" height="20" rx="3" fill="#FFCC80" stroke="#FFB74D" stroke-width="2"/>
            <!-- 蛋糕中层 -->
            <rect x="16" y="24" width="32" height="10" rx="2" fill="#FFAB91" stroke="#FF8A65" stroke-width="1.5"/>
            <!-- 奶油装饰 -->
            <ellipse cx="20" cy="24" rx="4" ry="2" fill="white"/>
            <ellipse cx="32" cy="23" rx="5" ry="2.5" fill="white"/>
            <ellipse cx="44" cy="24" rx="4" ry="2" fill="white"/>
            <!-- 樱桃 -->
            <circle cx="32" cy="18" r="4" fill="#E53935"/>
            <circle cx="34" cy="16" r="1" fill="#FFCDD2"/>
            <!-- 樱桃梗 -->
            <path d="M32 14 Q34 10 38 11" fill="none" stroke="#4CAF50" stroke-width="1.5" stroke-linecap="round"/>
            <!-- 蜡烛 -->
            <rect x="30" y="8" width="4" height="10" rx="1" fill="#FFEB3B"/>
            <path d="M32 6 Q34 4 32 2 Q30 4 32 6" fill="#FF9800"/>
        </svg>`,
        category: 'food'
    },

    // 交通类
    car: {
        name: '黄色小萌车',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFFDE7" stroke="#FFF176" stroke-width="2"/>
            <!-- 车身 -->
            <path d="M10 36 Q10 30 16 28 L20 20 Q22 18 24 18 L40 18 Q42 18 44 20 L48 28 Q54 30 54 36 L54 44 Q54 46 52 46 L12 46 Q10 46 10 44 Z" fill="#FFD54F" stroke="#FFB300" stroke-width="2"/>
            <!-- 车窗 -->
            <path d="M22 20 L26 28 L38 28 L42 20 Z" fill="#B3E5FC" stroke="#039BE5" stroke-width="1.5"/>
            <!-- 车灯 -->
            <circle cx="14" cy="38" r="3" fill="#FFF9C4"/>
            <circle cx="50" cy="38" r="3" fill="#FFF59D"/>
            <!-- 轮子 -->
            <circle cx="20" cy="46" r="5" fill="#424242" stroke="#212121" stroke-width="2"/>
            <circle cx="20" cy="46" r="2" fill="#9E9E9E"/>
            <circle cx="44" cy="46" r="5" fill="#424242" stroke="#212121" stroke-width="2"/>
            <circle cx="44" cy="46" r="2" fill="#9E9E9E"/>
            <!-- 眼睛 -->
            <circle cx="24" cy="34" r="3" fill="white"/>
            <circle cx="40" cy="34" r="3" fill="white"/>
            <circle cx="24" cy="34" r="1.5" fill="#212121"/>
            <circle cx="40" cy="34" r="1.5" fill="#212121"/>
        </svg>`,
        category: 'transport'
    },
    subway: {
        name: '蓝色圆头小火车',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 车身 -->
            <rect x="8" y="24" width="48" height="26" rx="8" fill="#42A5F5" stroke="#1976D2" stroke-width="2"/>
            <!-- 车窗 -->
            <rect x="14" y="28" width="10" height="8" rx="3" fill="#E3F2FD"/>
            <rect x="27" y="28" width="10" height="8" rx="3" fill="#E3F2FD"/>
            <rect x="40" y="28" width="10" height="8" rx="3" fill="#E3F2FD"/>
            <!-- 车灯 -->
            <circle cx="14" cy="46" r="2.5" fill="#FFEB3B"/>
            <circle cx="50" cy="46" r="2.5" fill="#FFEB3B"/>
            <!-- 轮子 -->
            <circle cx="18" cy="50" r="4" fill="#37474F" stroke="#263238" stroke-width="1.5"/>
            <circle cx="32" cy="50" r="4" fill="#37474F" stroke="#263238" stroke-width="1.5"/>
            <circle cx="46" cy="50" r="4" fill="#37474F" stroke="#263238" stroke-width="1.5"/>
            <!-- 眼睛 -->
            <circle cx="24" cy="38" r="2" fill="white"/>
            <circle cx="24" cy="38" r="1" fill="#0D47A1"/>
            <circle cx="40" cy="38" r="2" fill="white"/>
            <circle cx="40" cy="38" r="1" fill="#0D47A1"/>
        </svg>`,
        category: 'transport'
    },
    bus: {
        name: '橙色小巴士',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF3E0" stroke="#FFB74D" stroke-width="2"/>
            <!-- 车身 -->
            <rect x="6" y="26" width="52" height="24" rx="6" fill="#FF9800" stroke="#F57C00" stroke-width="2"/>
            <!-- 车窗 -->
            <rect x="12" y="30" width="8" height="8" rx="2" fill="#B3E5FC"/>
            <rect x="22" y="30" width="8" height="8" rx="2" fill="#B3E5FC"/>
            <rect x="32" y="30" width="8" height="8" rx="2" fill="#B3E5FC"/>
            <rect x="42" y="30" width="10" height="8" rx="2" fill="#B3E5FC"/>
            <!-- 车门 -->
            <rect x="40" y="38" width="8" height="12" rx="2" fill="#FFE0B2" stroke="#FFB74D" stroke-width="1"/>
            <!-- 轮子 -->
            <circle cx="16" cy="50" r="5" fill="#424242" stroke="#212121" stroke-width="2"/>
            <circle cx="48" cy="50" r="5" fill="#424242" stroke="#212121" stroke-width="2"/>
            <!-- 车灯 -->
            <circle cx="10" cy="36" r="2.5" fill="#FFEB3B"/>
            <circle cx="54" cy="36" r="2.5" fill="#FFEB3B"/>
            <!-- 眼睛 -->
            <circle cx="20" cy="36" r="1.5" fill="white"/>
            <circle cx="20" cy="36" r="0.8" fill="#212121"/>
        </svg>`,
        category: 'transport'
    },
    airplane: {
        name: '粉色萌系飞行器',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 机身 -->
            <ellipse cx="32" cy="32" rx="18" ry="8" fill="#F48FB1" stroke="#EC407A" stroke-width="2"/>
            <!-- 机头窗户 -->
            <ellipse cx="44" cy="32" rx="5" ry="4" fill="#E1F5FE"/>
            <!-- 上机翼 -->
            <path d="M26 28 L32 16 L38 28 Z" fill="#F06292" stroke="#EC407A" stroke-width="1.5"/>
            <!-- 下机翼 -->
            <path d="M26 36 L32 48 L38 36 Z" fill="#F06292" stroke="#EC407A" stroke-width="1.5"/>
            <!-- 侧机翼 -->
            <path d="M28 30 L16 26 L16 38 L28 34 Z" fill="#F48FB1" stroke="#EC407A" stroke-width="1.5"/>
            <!-- 尾翼 -->
            <path d="M14 30 L10 26 L14 32 Z" fill="#F06292"/>
            <!-- 眼睛 -->
            <circle cx="42" cy="30" r="2" fill="white"/>
            <circle cx="42" cy="30" r="1" fill="#880E4F"/>
            <!-- 嘴巴 -->
            <path d="M44 34 Q46 35 48 34" fill="none" stroke="#880E4F" stroke-width="1" stroke-linecap="round"/>
        </svg>`,
        category: 'transport'
    },
    taxi: {
        name: '绿色出租车',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 车身 -->
            <path d="M10 38 L12 26 Q14 24 16 24 L48 24 Q50 24 52 26 L54 38 L54 46 L10 46 Z" fill="#66BB6A" stroke="#43A047" stroke-width="2"/>
            <!-- 车顶灯 -->
            <rect x="28" y="18" width="8" height="6" rx="2" fill="#FFEB3B" stroke="#FBC02D" stroke-width="1"/>
            <!-- 车窗 -->
            <rect x="18" y="26" width="12" height="8" rx="2" fill="#E1F5FE"/>
            <rect x="34" y="26" width="12" height="8" rx="2" fill="#E1F5FE"/>
            <!-- TAXI标识 -->
            <text x="32" y="42" font-size="6" fill="white" text-anchor="middle" font-weight="bold">TAXI</text>
            <!-- 轮子 -->
            <circle cx="20" cy="46" r="4" fill="#424242"/>
            <circle cx="44" cy="46" r="4" fill="#424242"/>
            <!-- 车灯 -->
            <circle cx="12" cy="40" r="2" fill="#FFEB3B"/>
            <circle cx="52" cy="40" r="2" fill="#FFEB3B"/>
        </svg>`,
        category: 'transport'
    },
    bike: {
        name: '红色小自行车',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 后轮 -->
            <circle cx="16" cy="44" r="8" fill="none" stroke="#424242" stroke-width="3"/>
            <circle cx="16" cy="44" r="2" fill="#9E9E9E"/>
            <!-- 前轮 -->
            <circle cx="48" cy="44" r="8" fill="none" stroke="#424242" stroke-width="3"/>
            <circle cx="48" cy="44" r="2" fill="#9E9E9E"/>
            <!-- 车架 -->
            <path d="M16 44 L32 28 L48 44" fill="none" stroke="#EF5350" stroke-width="2.5" stroke-linejoin="round"/>
            <path d="M32 28 L32 20" fill="none" stroke="#EF5350" stroke-width="2.5"/>
            <path d="M32 20 L28 28 L36 28 Z" fill="none" stroke="#EF5350" stroke-width="2.5"/>
            <!-- 车把 -->
            <path d="M32 20 L44 20" fill="none" stroke="#424242" stroke-width="2" stroke-linecap="round"/>
            <!-- 车座 -->
            <ellipse cx="32" cy="17" rx="5" ry="2" fill="#8D6E63"/>
            <!-- 踏板 -->
            <circle cx="32" cy="36" r="2.5" fill="#424242"/>
        </svg>`,
        category: 'transport'
    },

    // 购物类
    shopping: {
        name: '蝴蝶结购物车',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 购物车篮筐 -->
            <rect x="14" y="20" width="36" height="24" rx="4" fill="#81C784" stroke="#66BB6A" stroke-width="2"/>
            <!-- 网格 -->
            <line x1="22" y1="20" x2="22" y2="44" stroke="#66BB6A" stroke-width="1"/>
            <line x1="30" y1="20" x2="30" y2="44" stroke="#66BB6A" stroke-width="1"/>
            <line x1="38" y1="20" x2="38" y2="44" stroke="#66BB6A" stroke-width="1"/>
            <line x1="14" y1="28" x2="50" y2="28" stroke="#66BB6A" stroke-width="1"/>
            <line x1="14" y1="36" x2="50" y2="36" stroke="#66BB6A" stroke-width="1"/>
            <!-- 轮子 -->
            <circle cx="20" cy="48" r="4" fill="#424242" stroke="#212121" stroke-width="2"/>
            <circle cx="44" cy="48" r="4" fill="#424242" stroke="#212121" stroke-width="2"/>
            <!-- 把手 -->
            <path d="M14 20 L14 12 L50 12" fill="none" stroke="#424242" stroke-width="2.5" stroke-linecap="round"/>
            <!-- 蝴蝶结 -->
            <circle cx="50" cy="12" r="4" fill="#F06292"/>
            <circle cx="46" cy="10" r="3" fill="#F48FB1"/>
            <circle cx="54" cy="10" r="3" fill="#F48FB1"/>
            <circle cx="50" cy="12" r="1.5" fill="#C2185B"/>
        </svg>`,
        category: 'shopping'
    },
    clothes: {
        name: '穿裙子的T恤',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- T恤 -->
            <path d="M18 20 L18 46 L46 46 L46 20 L40 20 L38 16 Q36 14 32 14 Q28 14 26 16 L24 20 Z" fill="#64B5F6" stroke="#1976D2" stroke-width="2"/>
            <!-- 领口 -->
            <path d="M26 16 Q32 20 38 16" fill="none" stroke="#1976D2" stroke-width="1.5"/>
            <!-- 袖子 -->
            <path d="M18 20 L12 26 L14 32 L18 28" fill="#64B5F6" stroke="#1976D2" stroke-width="2" stroke-linejoin="round"/>
            <path d="M46 20 L52 26 L50 32 L46 28" fill="#64B5F6" stroke="#1976D2" stroke-width="2" stroke-linejoin="round"/>
            <!-- 裙子 -->
            <path d="M18 46 L18 50 Q32 54 46 50 L46 46 Z" fill="#F48FB1" stroke="#EC407A" stroke-width="2"/>
            <!-- 扣子 -->
            <circle cx="32" cy="26" r="1.5" fill="#BBDEFB"/>
            <circle cx="32" cy="32" r="1.5" fill="#BBDEFB"/>
            <circle cx="32" cy="38" r="1.5" fill="#BBDEFB"/>
            <!-- 笑脸 -->
            <circle cx="28" cy="22" r="1.5" fill="white"/>
            <circle cx="28" cy="22" r="0.8" fill="#0D47A1"/>
            <circle cx="36" cy="22" r="1.5" fill="white"/>
            <circle cx="36" cy="22" r="0.8" fill="#0D47A1"/>
        </svg>`,
        category: 'shopping'
    },
    shoes: {
        name: '运动小鞋子',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 鞋底 -->
            <path d="M10 44 L12 50 Q16 52 32 52 Q48 52 52 50 L54 44 Z" fill="#FF7043" stroke="#E64A19" stroke-width="2"/>
            <!-- 鞋面 -->
            <path d="M10 44 Q10 32 20 28 L32 26 L44 28 Q54 32 54 44 Z" fill="#FF8A65" stroke="#E64A19" stroke-width="2"/>
            <!-- 鞋带 -->
            <line x1="24" y1="30" x2="40" y2="30" stroke="#FFFFFF" stroke-width="2"/>
            <line x1="26" y1="34" x2="38" y2="34" stroke="#FFFFFF" stroke-width="2"/>
            <line x1="28" y1="38" x2="36" y2="38" stroke="#FFFFFF" stroke-width="2"/>
            <!-- 鞋带孔 -->
            <circle cx="24" cy="30" r="1.5" fill="#D84315"/>
            <circle cx="40" cy="30" r="1.5" fill="#D84315"/>
            <circle cx="26" cy="34" r="1.5" fill="#D84315"/>
            <circle cx="38" cy="34" r="1.5" fill="#D84315"/>
            <!-- 装饰线 -->
            <path d="M12 40 Q32 42 52 40" fill="none" stroke="white" stroke-width="1.5" stroke-dasharray="3,2"/>
        </svg>`,
        category: 'shopping'
    },
    cosmetics: {
        name: '可爱化妆品',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 口红管 -->
            <rect x="16" y="30" width="10" height="20" rx="3" fill="#EC407A" stroke="#C2185B" stroke-width="1.5"/>
            <path d="M18 30 L18 24 Q21 20 24 24 L24 30 Z" fill="#F48FB1"/>
            <!-- 粉饼盒 -->
            <rect x="28" y="34" width="20" height="16" rx="4" fill="#BA68C8" stroke="#8E24AA" stroke-width="1.5"/>
            <ellipse cx="38" cy="34" rx="10" ry="4" fill="#E1BEE7"/>
            <circle cx="38" cy="34" r="3" fill="#CE93D8"/>
            <!-- 镜子 -->
            <ellipse cx="44" cy="24" rx="10" ry="8" fill="#E3F2FD" stroke="#90CAF9" stroke-width="2"/>
            <ellipse cx="44" cy="24" rx="8" ry="6" fill="#BBDEFB"/>
            <!-- 反光 -->
            <path d="M40 20 Q42 18 44 20" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <!-- 闪光装饰 -->
            <path d="M52 16 L53 20 L57 21 L53 22 L52 26 L51 22 L47 21 L51 20 Z" fill="#FFD54F"/>
        </svg>`,
        category: 'shopping'
    },
    game: {
        name: '游戏手柄',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 手柄主体 -->
            <rect x="10" y="24" width="44" height="24" rx="10" fill="#5C6BC0" stroke="#3949AB" stroke-width="2"/>
            <!-- 左侧手柄 -->
            <circle cx="18" cy="36" r="8" fill="#3F51B5" stroke="#3949AB" stroke-width="1.5"/>
            <circle cx="18" cy="36" r="3" fill="#7986CB"/>
            <!-- 右侧手柄 -->
            <circle cx="46" cy="36" r="8" fill="#3F51B5" stroke="#3949AB" stroke-width="1.5"/>
            <!-- 方向键 -->
            <circle cx="46" cy="33" r="1.5" fill="#9FA8DA"/>
            <circle cx="43" cy="36" r="1.5" fill="#9FA8DA"/>
            <circle cx="46" cy="39" r="1.5" fill="#9FA8DA"/>
            <circle cx="49" cy="36" r="1.5" fill="#9FA8DA"/>
            <!-- 中间按钮 -->
            <circle cx="28" cy="30" r="2.5" fill="#EF5350"/>
            <circle cx="34" cy="30" r="2.5" fill="#66BB6A"/>
            <circle cx="36" cy="36" r="2.5" fill="#42A5F5"/>
            <circle cx="30" cy="36" r="2.5" fill="#FFEB3B"/>
            <!-- 装饰线 -->
            <line x1="24" y1="28" x2="24" y2="40" stroke="#7986CB" stroke-width="1"/>
            <line x1="40" y1="28" x2="40" y2="40" stroke="#7986CB" stroke-width="1"/>
        </svg>`,
        category: 'shopping'
    },
    phone: {
        name: '智能手机',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 手机机身 -->
            <rect x="18" y="10" width="28" height="44" rx="4" fill="#424242" stroke="#212121" stroke-width="2"/>
            <!-- 屏幕 -->
            <rect x="20" y="16" width="24" height="32" rx="2" fill="#64B5F6"/>
            <!-- 屏幕内容 - 简单的APP图标 -->
            <rect x="22" y="18" width="6" height="6" rx="1" fill="#EF5350"/>
            <rect x="30" y="18" width="6" height="6" rx="1" fill="#66BB6A"/>
            <rect x="38" y="18" width="6" height="6" rx="1" fill="#FFEB3B"/>
            <rect x="22" y="26" width="6" height="6" rx="1" fill="#42A5F5"/>
            <rect x="30" y="26" width="6" height="6" rx="1" fill="#AB47BC"/>
            <rect x="38" y="26" width="6" height="6" rx="1" fill="#FF7043"/>
            <!-- Home键 -->
            <circle cx="32" cy="51" r="2.5" fill="#616161"/>
            <!-- 听筒 -->
            <rect x="26" y="12" width="12" height="2" rx="1" fill="#616161"/>
        </svg>`,
        category: 'shopping'
    },

    // 生活类
    house: {
        name: '彩色小屋',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 房子主体 -->
            <rect x="16" y="32" width="32" height="24" rx="2" fill="#FFCC80" stroke="#FFB74D" stroke-width="2"/>
            <!-- 屋顶 -->
            <path d="M10 32 L32 12 L54 32 Z" fill="#EF5350" stroke="#E53935" stroke-width="2"/>
            <!-- 烟囱 -->
            <rect x="38" y="16" width="6" height="10" fill="#8D6E63"/>
            <ellipse cx="41" cy="14" rx="4" ry="2" fill="#A1887F"/>
            <!-- 烟雾 -->
            <circle cx="41" cy="10" r="2" fill="#BDBDBD"/>
            <circle cx="43" cy="6" r="1.5" fill="#E0E0E0"/>
            <circle cx="39" cy="4" r="1" fill="#EEEEEE"/>
            <!-- 窗户 -->
            <rect x="20" y="38" width="10" height="10" rx="2" fill="#B3E5FC" stroke="#039BE5" stroke-width="1.5"/>
            <rect x="34" y="38" width="10" height="10" rx="2" fill="#B3E5FC" stroke="#039BE5" stroke-width="1.5"/>
            <line x1="25" y1="38" x2="25" y2="48" stroke="#039BE5" stroke-width="1"/>
            <line x1="20" y1="43" x2="30" y2="43" stroke="#039BE5" stroke-width="1"/>
            <line x1="39" y1="38" x2="39" y2="48" stroke="#039BE5" stroke-width="1"/>
            <line x1="34" y1="43" x2="44" y2="43" stroke="#039BE5" stroke-width="1"/>
            <!-- 门 -->
            <rect x="26" y="44" width="10" height="12" rx="2" fill="#8D6E63" stroke="#6D4C41" stroke-width="1.5"/>
            <circle cx="34" cy="50" r="1.5" fill="#FFD54F"/>
        </svg>`,
        category: 'life'
    },
    lightbulb: {
        name: '发光笑脸灯',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 灯泡 -->
            <ellipse cx="32" cy="30" rx="14" ry="16" fill="#FFEB3B" stroke="#FBC02D" stroke-width="2"/>
            <!-- 灯泡底座 -->
            <rect x="26" y="44" width="12" height="4" rx="1" fill="#9E9E9E" stroke="#757575" stroke-width="1"/>
            <rect x="26" y="48" width="12" height="4" rx="1" fill="#9E9E9E" stroke="#757575" stroke-width="1"/>
            <!-- 光芒 -->
            <path d="M32 8 L34 12 L32 11 L30 12 Z" fill="#FFD54F"/>
            <path d="M32 52 L34 48 L32 49 L30 48 Z" fill="#FFD54F"/>
            <path d="M12 30 L16 32 L15 30 L16 28 Z" fill="#FFD54F"/>
            <path d="M52 30 L48 32 L49 30 L48 28 Z" fill="#FFD54F"/>
            <path d="M16 16 L19 19 L18 18 L20 16 Z" fill="#FFD54F"/>
            <path d="M48 16 L45 19 L46 18 L44 16 Z" fill="#FFD54F"/>
            <path d="M16 44 L19 41 L18 42 L20 44 Z" fill="#FFD54F"/>
            <path d="M48 44 L45 41 L46 42 L44 44 Z" fill="#FFD54F"/>
            <!-- 笑脸 -->
            <circle cx="26" cy="28" r="2.5" fill="#F57F17"/>
            <circle cx="38" cy="28" r="2.5" fill="#F57F17"/>
            <circle cx="27" cy="27.5" r="1" fill="white"/>
            <circle cx="39" cy="27.5" r="1" fill="white"/>
            <path d="M26 34 Q32 40 38 34" fill="none" stroke="#F57F17" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        category: 'life'
    },
    movie: {
        name: '电影胶片',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 胶卷盘 -->
            <circle cx="20" cy="32" r="12" fill="#37474F" stroke="#263238" stroke-width="2"/>
            <circle cx="20" cy="32" r="6" fill="#546E7A"/>
            <circle cx="20" cy="32" r="3" fill="#78909C"/>
            <!-- 胶卷 -->
            <rect x="20" y="26" width="32" height="12" fill="#263238"/>
            <!-- 胶卷孔 -->
            <rect x="24" y="28" width="2" height="8" fill="#455A64"/>
            <rect x="28" y="28" width="2" height="8" fill="#455A64"/>
            <rect x="32" y="28" width="2" height="8" fill="#455A64"/>
            <rect x="36" y="28" width="2" height="8" fill="#455A64"/>
            <rect x="40" y="28" width="2" height="8" fill="#455A64"/>
            <rect x="44" y="28" width="2" height="8" fill="#455A64"/>
            <!-- 胶卷盘2 -->
            <circle cx="52" cy="32" r="4" fill="#37474F" stroke="#263238" stroke-width="1.5"/>
            <circle cx="52" cy="32" r="2" fill="#78909C"/>
            <!-- 播放按钮 -->
            <path d="M28 23 L34 26 L34 20 Z" fill="#FF5252"/>
        </svg>`,
        category: 'life'
    },
    book: {
        name: '可爱书本',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 书本封面 -->
            <rect x="12" y="20" width="40" height="28" rx="2" fill="#7E57C2" stroke="#5E35B1" stroke-width="2"/>
            <!-- 书脊 -->
            <rect x="30" y="20" width="4" height="28" fill="#5E35B1"/>
            <!-- 书页 -->
            <rect x="14" y="22" width="15" height="24" rx="1" fill="#FFEB3B"/>
            <rect x="35" y="22" width="15" height="24" rx="1" fill="#FFEB3B"/>
            <!-- 文字线条 -->
            <line x1="16" y1="26" x2="28" y2="26" stroke="#FBC02D" stroke-width="1"/>
            <line x1="16" y1="30" x2="28" y2="30" stroke="#FBC02D" stroke-width="1"/>
            <line x1="16" y1="34" x2="26" y2="34" stroke="#FBC02D" stroke-width="1"/>
            <line x1="37" y1="26" x2="49" y2="26" stroke="#FBC02D" stroke-width="1"/>
            <line x1="37" y1="30" x2="49" y2="30" stroke="#FBC02D" stroke-width="1"/>
            <line x1="37" y1="34" x2="47" y2="34" stroke="#FBC02D" stroke-width="1"/>
            <!-- 书签 -->
            <path d="M22 22 L22 34 L26 32 L30 34 L30 22 Z" fill="#EF5350"/>
        </svg>`,
        category: 'life'
    },
    medicine: {
        name: '健康药丸',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 药丸 -->
            <ellipse cx="32" cy="32" rx="18" ry="12" fill="#F44336" stroke="#D32F2F" stroke-width="2" transform="rotate(45 32 32)"/>
            <ellipse cx="32" cy="32" rx="18" ry="12" fill="#2196F3" stroke="#1976D2" stroke-width="2" transform="rotate(45 32 32)" clip-path="url(#half)"/>
            <defs>
                <clipPath id="half">
                    <rect x="20" y="14" width="24" height="36"/>
                </clipPath>
            </defs>
            <!-- 分割线 -->
            <line x1="20" y1="44" x2="44" y2="20" stroke="white" stroke-width="2" stroke-dasharray="4,2"/>
            <!-- 药瓶 -->
            <rect x="46" y="36" width="12" height="16" rx="3" fill="#66BB6A" stroke="#43A047" stroke-width="1.5"/>
            <rect x="48" y="32" width="8" height="4" rx="1" fill="#81C784"/>
            <!-- 标签 -->
            <rect x="46" y="42" width="12" height="4" fill="white"/>
            <!-- 十字标志 -->
            <path d="M52 40 L52 38 L50 38 L50 40 L48 40 L48 42 L50 42 L50 44 L52 44 L52 42 L54 42 L54 40 Z" fill="white"/>
        </svg>`,
        category: 'life'
    },

    // 其他类
    money: {
        name: '钱袋',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 钱袋 -->
            <path d="M16 32 Q12 48 32 52 Q52 48 48 32 Q46 24 32 24 Q18 24 16 32" fill="#FFB300" stroke="#FF8F00" stroke-width="2"/>
            <!-- 钱袋口 -->
            <ellipse cx="32" cy="24" rx="8" ry="4" fill="#FFE082" stroke="#FF8F00" stroke-width="1.5"/>
            <!-- 绳子 -->
            <path d="M26 24 Q24 16 28 12 Q32 10 36 12 Q40 16 38 24" fill="none" stroke="#8D6E63" stroke-width="2"/>
            <!-- 金币符号 -->
            <text x="32" y="42" font-size="14" fill="#BF360C" text-anchor="middle" font-weight="bold">¥</text>
            <!-- 高光 -->
            <path d="M20 30 Q22 32 20 34" fill="none" stroke="#FFE082" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        category: 'other'
    },
    bank: {
        name: '迷你城堡银行',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 银行主体 -->
            <rect x="14" y="34" width="36" height="22" rx="2" fill="#90CAF9" stroke="#42A5F5" stroke-width="2"/>
            <!-- 屋顶 -->
            <path d="M8 34 L32 14 L56 34 Z" fill="#EF5350" stroke="#E53935" stroke-width="2"/>
            <!-- 旗帜 -->
            <rect x="30" y="8" width="4" height="6" fill="#8D6E63"/>
            <path d="M34 8 L44 12 L34 16 Z" fill="#F44336"/>
            <!-- 柱子 -->
            <rect x="18" y="34" width="4" height="22" fill="#64B5F6"/>
            <rect x="26" y="34" width="4" height="22" fill="#64B5F6"/>
            <rect x="34" y="34" width="4" height="22" fill="#64B5F6"/>
            <rect x="42" y="34" width="4" height="22" fill="#64B5F6"/>
            <!-- 门 -->
            <rect x="26" y="44" width="12" height="12" rx="2" fill="#795548" stroke="#5D4037" stroke-width="1.5"/>
            <circle cx="36" cy="50" r="1.5" fill="#FFD54F"/>
            <!-- 窗户 -->
            <rect x="20" y="38" width="6" height="6" rx="1" fill="#BBDEFB"/>
            <rect x="38" y="38" width="6" height="6" rx="1" fill="#BBDEFB"/>
        </svg>`,
        category: 'other'
    },
    chart: {
        name: '上升图表',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 坐标轴 -->
            <line x1="12" y1="52" x2="56" y2="52" stroke="#424242" stroke-width="2"/>
            <line x1="12" y1="52" x2="12" y2="12" stroke="#424242" stroke-width="2"/>
            <!-- 柱状图 -->
            <rect x="16" y="36" width="8" height="16" rx="2" fill="#81C784"/>
            <rect x="28" y="28" width="8" height="24" rx="2" fill="#66BB6A"/>
            <rect x="40" y="20" width="8" height="32" rx="2" fill="#4CAF50"/>
            <!-- 趋势线 -->
            <path d="M16 40 L28 32 L40 24 L52 16" fill="none" stroke="#FF5252" stroke-width="2.5" stroke-linecap="round"/>
            <!-- 箭头 -->
            <path d="M52 16 L48 16 L52 12 Z" fill="#FF5252"/>
            <!-- 上升箭头 -->
            <path d="M48 18 L54 12 L52 20 Z" fill="#4CAF50"/>
        </svg>`,
        category: 'other'
    },
    diamond: {
        name: '闪亮宝石',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 宝石主体 -->
            <path d="M32 8 L48 24 L32 52 L16 24 Z" fill="#E1F5FE" stroke="#039BE5" stroke-width="2"/>
            <!-- 宝石切面 -->
            <path d="M32 8 L40 24 L32 30 L24 24 Z" fill="#B3E5FC"/>
            <path d="M40 24 L48 24 L32 52 L32 30 Z" fill="#81D4FA"/>
            <path d="M24 24 L16 24 L32 52 L32 30 Z" fill="#4FC3F7"/>
            <!-- 闪光效果 -->
            <path d="M52 12 L54 16 L52 15 L50 16 Z" fill="#FFD54F"/>
            <path d="M10 20 L12 24 L10 23 L8 24 Z" fill="#FFD54F"/>
            <path d="M54 32 L56 36 L54 35 L52 36 Z" fill="#FFD54F"/>
            <path d="M12 40 L14 44 L12 43 L10 44 Z" fill="#FFD54F"/>
            <!-- 高光 -->
            <ellipse cx="32" cy="20" rx="4" ry="2" fill="white" opacity="0.7"/>
        </svg>`,
        category: 'other'
    },
    gift: {
        name: '可爱礼盒',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 礼盒 -->
            <rect x="14" y="32" width="36" height="24" rx="3" fill="#FF8A65" stroke="#F4511E" stroke-width="2"/>
            <!-- 礼盒盖子 -->
            <rect x="12" y="26" width="40" height="8" rx="2" fill="#FFAB91" stroke="#F4511E" stroke-width="2"/>
            <!-- 丝带竖 -->
            <rect x="30" y="26" width="4" height="30" fill="#FFD54F"/>
            <!-- 丝带横 -->
            <rect x="12" y="40" width="40" height="4" fill="#FFD54F"/>
            <!-- 蝴蝶结左 -->
            <ellipse cx="24" cy="22" rx="8" ry="5" fill="#FFEB3B" stroke="#FBC02D" stroke-width="1.5"/>
            <ellipse cx="20" cy="20" rx="5" ry="3" fill="#FFF176"/>
            <!-- 蝴蝶结右 -->
            <ellipse cx="40" cy="22" rx="8" ry="5" fill="#FFEB3B" stroke="#FBC02D" stroke-width="1.5"/>
            <ellipse cx="44" cy="20" rx="5" ry="3" fill="#FFF176"/>
            <!-- 蝴蝶结中心 -->
            <circle cx="32" cy="24" r="3" fill="#FBC02D"/>
        </svg>`,
        category: 'other'
    },
    trophy: {
        name: '金色奖杯',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 奖杯杯身 -->
            <path d="M16 16 L18 32 Q20 40 32 40 Q44 40 46 32 L48 16 Z" fill="#FFD54F" stroke="#FFB300" stroke-width="2"/>
            <!-- 奖杯把手 -->
            <path d="M16 20 Q10 20 10 26 Q10 30 16 30" fill="none" stroke="#FFB300" stroke-width="3"/>
            <path d="M48 20 Q54 20 54 26 Q54 30 48 30" fill="none" stroke="#FFB300" stroke-width="3"/>
            <!-- 星星装饰 -->
            <path d="M32 22 L34 26 L38 26 L35 29 L36 33 L32 31 L28 33 L29 29 L26 26 L30 26 Z" fill="#FF6F00"/>
            <!-- 底座 -->
            <rect x="24" y="40" width="16" height="4" rx="1" fill="#FFB300"/>
            <rect x="20" y="44" width="24" height="6" rx="2" fill="#FFA000"/>
            <!-- 高光 -->
            <path d="M20 20 Q22 22 20 24" fill="none" stroke="#FFF9C4" stroke-width="2" stroke-linecap="round"/>
        </svg>`,
        category: 'other'
    },
    map: {
        name: '笑脸地图',
        svg: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <!-- 背景圆角方块 -->
            <rect x="4" y="4" width="56" height="56" rx="12" fill="#FFF8E1" stroke="#FFD54F" stroke-width="2"/>
            <!-- 地图背景 -->
            <rect x="12" y="14" width="40" height="36" rx="3" fill="#E8F5E9" stroke="#81C784" stroke-width="2"/>
            <!-- 道路 -->
            <path d="M12 30 L52 30" stroke="#BDBDBD" stroke-width="3"/>
            <path d="M32 14 L32 50" stroke="#BDBDBD" stroke-width="3"/>
            <!-- 建筑 -->
            <rect x="16" y="18" width="10" height="8" rx="1" fill="#90CAF9"/>
            <rect x="38" y="36" width="10" height="10" rx="1" fill="#FFAB91"/>
            <rect x="38" y="18" width="10" height="8" rx="1" fill="#CE93D8"/>
            <!-- 公园 -->
            <circle cx="22" cy="42" r="6" fill="#C5E1A5"/>
            <!-- 指针 -->
            <path d="M32 12 L36 24 L32 48 L28 24 Z" fill="#F44336" stroke="#D32F2F" stroke-width="1.5"/>
            <circle cx="32" cy="20" r="4" fill="#FFEB3B" stroke="#FBC02D" stroke-width="1"/>
            <!-- 笑脸 -->
            <circle cx="31" cy="19" r="1" fill="#F57F17"/>
            <circle cx="33" cy="19" r="1" fill="#F57F17"/>
            <path d="M30 21 Q32 22 34 21" fill="none" stroke="#F57F17" stroke-width="0.8" stroke-linecap="round"/>
        </svg>`,
        category: 'other'
    }
};

// 导出图标列表供选择器使用
const CUTE_ICON_LIST = Object.keys(CUTE_ICONS).map(key => ({
    id: key,
    name: CUTE_ICONS[key].name,
    svg: CUTE_ICONS[key].svg,
    category: CUTE_ICONS[key].category
}));

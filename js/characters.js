const CHARACTERS = {
  "gilberta": {
    name: "ギルベルタ",
    enName: "Gilberta",
    role: "補助",
    element: "風元素",
    rarity: "★6",
    image: "media/Gilberta1.webp",
    gallery: [
      "media/Gilberta2.webp",
      "media/Gilberta3.webp",
      "media/Gilberta4.webp"
    ],
    overview: "エンドフィールド工業の協賛スタッフ。卓越した支援スキルを持ち、アーツ脆弱付与や行動阻害で味方を強力にバックアップする。",
    skills: [
      { name: "戦術アーツ・風脈", desc: "ターゲットを中心に風元素ダメージを与え、周囲の敵を引き寄せる。" },
      { name: "フィールドコンダクト", desc: "範囲内の味方全員の攻撃力を上昇させ、敵の属性耐性を低下させる。" }
    ]
  },
  "yvonne": {
    name: "イヴォンヌ",
    enName: "Yvonne",
    role: "術師",
    element: "氷元素",
    rarity: "★6",
    image: "media/Yvonne1.webp",
    gallery: [
      "media/Yvonne2.webp",
      "media/Yvonne3.webp",
      "media/Yvonne4.webp"
    ],
    overview: "広範囲のアーツ攻撃を展開する研究部門出身の術師。敵の凍結状態に乗じた強力なバースト火力を誇る。",
    skills: [
      { name: "アイスバースト", desc: "前方直線状の敵に氷元素ダメージを与え、一定確率で凍結させる。" },
      { name: "絶対零度アミュレット", desc: "広範囲の敵に継続的な氷元素ダメージを与え、凍結状態の敵に追加ダメージ。" }
    ]
  },
  "zoan": {
    name: "ゾアン",
    enName: "Zoan",
    role: "前衛",
    element: "物理",
    rarity: "★6",
    image: "media/Zhuang1.webp",
    gallery: [
      "media/Zhuang2.webp",
      "media/Zhuang3.webp",
      "media/Zhuang4.webp"
    ],
    overview: "近接戦闘に優れた前線部隊の精鋭オペレーター。素早い連撃と刃を用いた広範囲攻撃で敵陣を破砕する。",
    skills: [
      { name: "蒼雷閃", desc: "ターゲットへ高速で接近し、物理ダメージを与える。" },
      { name: "開眼・絶空陣", desc: "周囲の敵に広範囲の物理連撃を叩き込み、自身の攻撃速度を上昇させる。" }
    ]
  }
};
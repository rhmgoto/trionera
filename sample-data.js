/*
  トリオネラ sample data

  将来のデータ取得元候補:
  - 日経平均: Nikkei公式CSV、Yahoo Financeの ^N225、Stooqの ^NKX など
  - NYダウ: Yahoo Financeの ^DJI、Stooqの ^DJI など
  - ドル円: FREDの DEXJPUS など

  注意:
  このファイルの数値はプロトタイプ用のサンプルです。学習・UI確認用として、
  歴史イベント前後の動きが見えるように一部の日付だけを収録しています。
*/

const SAMPLE_MARKET_DATA = [
  { date: "1970-01-05", nikkei: 2358, dow: 809, usdjpy: 360 },
  { date: "1970-06-30", nikkei: 2119, dow: 683, usdjpy: 360 },
  { date: "1970-12-30", nikkei: 1987, dow: 839, usdjpy: 358 },

  { date: "1971-01-04", nikkei: 2001, dow: 830, usdjpy: 358 },
  { date: "1971-08-16", nikkei: 2600, dow: 888, usdjpy: 350 },
  { date: "1971-12-30", nikkei: 2714, dow: 890, usdjpy: 315 },

  { date: "1972-01-04", nikkei: 2713, dow: 902, usdjpy: 314 },
  { date: "1972-06-30", nikkei: 3482, dow: 929, usdjpy: 302 },
  { date: "1972-12-29", nikkei: 5207, dow: 1020, usdjpy: 302 },

  { date: "1973-01-04", nikkei: 5359, dow: 1031, usdjpy: 302 },
  { date: "1973-10-17", nikkei: 4560, dow: 964, usdjpy: 266 },
  { date: "1973-12-28", nikkei: 4307, dow: 850, usdjpy: 280 },

  { date: "1974-01-04", nikkei: 4234, dow: 855, usdjpy: 280 },
  { date: "1974-06-28", nikkei: 4700, dow: 802, usdjpy: 291 },
  { date: "1974-12-30", nikkei: 3818, dow: 616, usdjpy: 300 },

  { date: "1975-01-06", nikkei: 3777, dow: 632, usdjpy: 300 },
  { date: "1975-06-30", nikkei: 4404, dow: 878, usdjpy: 296 },
  { date: "1975-12-30", nikkei: 4359, dow: 852, usdjpy: 305 },

  { date: "1976-01-05", nikkei: 4419, dow: 858, usdjpy: 305 },
  { date: "1976-06-30", nikkei: 4777, dow: 1004, usdjpy: 298 },
  { date: "1976-12-30", nikkei: 4991, dow: 1004, usdjpy: 293 },

  { date: "1977-01-04", nikkei: 4998, dow: 999, usdjpy: 293 },
  { date: "1977-06-30", nikkei: 5067, dow: 906, usdjpy: 268 },
  { date: "1977-12-30", nikkei: 4865, dow: 831, usdjpy: 240 },

  { date: "1978-01-04", nikkei: 4859, dow: 817, usdjpy: 240 },
  { date: "1978-06-30", nikkei: 5543, dow: 821, usdjpy: 205 },
  { date: "1978-12-29", nikkei: 6001, dow: 805, usdjpy: 195 },

  { date: "1979-01-04", nikkei: 6041, dow: 811, usdjpy: 195 },
  { date: "1979-06-29", nikkei: 6203, dow: 841, usdjpy: 219 },
  { date: "1979-12-28", nikkei: 6569, dow: 839, usdjpy: 240 },

  { date: "1980-01-04", nikkei: 6560, dow: 824, usdjpy: 237 },
  { date: "1980-01-07", nikkei: 6601, dow: 832, usdjpy: 238 },
  { date: "1980-02-01", nikkei: 6670, dow: 870, usdjpy: 241 },
  { date: "1980-06-02", nikkei: 6810, dow: 868, usdjpy: 220 },
  { date: "1980-12-30", nikkei: 7116, dow: 963, usdjpy: 203 },

  { date: "1985-03-22", nikkei: 12420, dow: 1269, usdjpy: 256 },
  { date: "1985-08-22", nikkei: 12780, dow: 1330, usdjpy: 238 },
  { date: "1985-09-13", nikkei: 12895, dow: 1316, usdjpy: 242 },
  { date: "1985-09-20", nikkei: 12755, dow: 1325, usdjpy: 240 },
  { date: "1985-09-24", nikkei: 13034, dow: 1328, usdjpy: 231 },
  { date: "1985-09-30", nikkei: 13275, dow: 1329, usdjpy: 216 },
  { date: "1985-10-22", nikkei: 13060, dow: 1356, usdjpy: 214 },
  { date: "1985-12-23", nikkei: 13110, dow: 1546, usdjpy: 202 },
  { date: "1986-03-24", nikkei: 14395, dow: 1765, usdjpy: 180 },
  { date: "1986-09-22", nikkei: 18090, dow: 1789, usdjpy: 154 },

  { date: "1989-06-30", nikkei: 32948, dow: 2440, usdjpy: 144 },
  { date: "1989-09-29", nikkei: 35636, dow: 2693, usdjpy: 142 },
  { date: "1989-11-30", nikkei: 37452, dow: 2706, usdjpy: 143 },
  { date: "1989-12-22", nikkei: 38359, dow: 2734, usdjpy: 143 },
  { date: "1989-12-29", nikkei: 38915, dow: 2753, usdjpy: 143 },
  { date: "1990-01-04", nikkei: 38712, dow: 2810, usdjpy: 145 },
  { date: "1990-01-08", nikkei: 37689, dow: 2800, usdjpy: 146 },
  { date: "1990-01-31", nikkei: 37189, dow: 2590, usdjpy: 145 },
  { date: "1990-03-30", nikkei: 29980, dow: 2708, usdjpy: 158 },
  { date: "1990-06-29", nikkei: 33192, dow: 2880, usdjpy: 152 },
  { date: "1990-12-28", nikkei: 23848, dow: 2633, usdjpy: 135 },
  { date: "1991-01-04", nikkei: 24100, dow: 2515, usdjpy: 134 },

  { date: "1997-05-23", nikkei: 20271, dow: 7331, usdjpy: 116 },
  { date: "1997-10-24", nikkei: 16710, dow: 7715, usdjpy: 121 },
  { date: "1997-11-21", nikkei: 16668, dow: 7881, usdjpy: 127 },
  { date: "1997-11-25", nikkei: 16031, dow: 7851, usdjpy: 128 },
  { date: "1997-12-24", nikkei: 15158, dow: 7876, usdjpy: 130 },
  { date: "1998-02-24", nikkei: 16942, dow: 8370, usdjpy: 126 },
  { date: "1998-05-25", nikkei: 15420, dow: 8912, usdjpy: 139 },
  { date: "1998-11-24", nikkei: 14885, dow: 9301, usdjpy: 123 },

  { date: "2000-01-04", nikkei: 19002, dow: 11357, usdjpy: 102 },
  { date: "2000-03-31", nikkei: 20337, dow: 10922, usdjpy: 106 },
  { date: "2000-12-29", nikkei: 13785, dow: 10787, usdjpy: 114 },
  { date: "2001-03-12", nikkei: 12434, dow: 10208, usdjpy: 121 },
  { date: "2001-08-10", nikkei: 11953, dow: 10416, usdjpy: 123 },
  { date: "2001-09-10", nikkei: 10195, dow: 9605, usdjpy: 120 },
  { date: "2001-09-17", nikkei: 9504, dow: 8920, usdjpy: 118 },
  { date: "2001-10-11", nikkei: 10478, dow: 9410, usdjpy: 121 },
  { date: "2001-12-11", nikkei: 10511, dow: 9888, usdjpy: 127 },
  { date: "2002-03-11", nikkei: 11885, dow: 10611, usdjpy: 128 },
  { date: "2002-09-11", nikkei: 9539, dow: 8581, usdjpy: 119 },

  { date: "2008-03-14", nikkei: 12241, dow: 11951, usdjpy: 99 },
  { date: "2008-08-15", nikkei: 13019, dow: 11660, usdjpy: 110 },
  { date: "2008-09-08", nikkei: 12624, dow: 11510, usdjpy: 108 },
  { date: "2008-09-12", nikkei: 12214, dow: 11421, usdjpy: 107 },
  { date: "2008-09-16", nikkei: 11609, dow: 10917, usdjpy: 105 },
  { date: "2008-09-22", nikkei: 12090, dow: 11015, usdjpy: 106 },
  { date: "2008-10-15", nikkei: 9547, dow: 8578, usdjpy: 100 },
  { date: "2008-12-15", nikkei: 8664, dow: 8565, usdjpy: 90 },
  { date: "2009-03-16", nikkei: 7704, dow: 7216, usdjpy: 98 },
  { date: "2009-09-15", nikkei: 10217, dow: 9683, usdjpy: 91 },

  { date: "2011-02-11", nikkei: 10605, dow: 12273, usdjpy: 83 },
  { date: "2011-03-04", nikkei: 10693, dow: 12170, usdjpy: 82 },
  { date: "2011-03-10", nikkei: 10434, dow: 11984, usdjpy: 83 },
  { date: "2011-03-14", nikkei: 9620, dow: 11993, usdjpy: 81 },
  { date: "2011-03-18", nikkei: 9206, dow: 11858, usdjpy: 81 },
  { date: "2011-04-11", nikkei: 9719, dow: 12381, usdjpy: 84 },
  { date: "2011-06-10", nikkei: 9514, dow: 11952, usdjpy: 80 },
  { date: "2011-09-12", nikkei: 8535, dow: 11061, usdjpy: 77 },
  { date: "2012-03-12", nikkei: 9889, dow: 12959, usdjpy: 82 },

  { date: "2012-06-26", nikkei: 8663, dow: 12534, usdjpy: 80 },
  { date: "2012-11-26", nikkei: 9388, dow: 12967, usdjpy: 82 },
  { date: "2012-12-25", nikkei: 10080, dow: 13139, usdjpy: 84 },
  { date: "2012-12-27", nikkei: 10322, dow: 13096, usdjpy: 86 },
  { date: "2013-01-25", nikkei: 10927, dow: 13896, usdjpy: 91 },
  { date: "2013-03-26", nikkei: 12472, dow: 14559, usdjpy: 94 },
  { date: "2013-06-26", nikkei: 12834, dow: 14910, usdjpy: 98 },
  { date: "2013-12-26", nikkei: 16174, dow: 16479, usdjpy: 104 },

  { date: "2014-01-10", nikkei: 15912, dow: 16437, usdjpy: 104 },
  { date: "2014-04-10", nikkei: 14300, dow: 16170, usdjpy: 102 },
  { date: "2014-07-10", nikkei: 15217, dow: 16915, usdjpy: 101 },
  { date: "2014-10-10", nikkei: 15301, dow: 16544, usdjpy: 108 },
  { date: "2014-12-30", nikkei: 17451, dow: 17823, usdjpy: 120 },
  { date: "2015-01-09", nikkei: 17197, dow: 17737, usdjpy: 118 },
  { date: "2015-01-13", nikkei: 17087, dow: 17613, usdjpy: 118 },
  { date: "2015-02-10", nikkei: 17652, dow: 17868, usdjpy: 119 },
  { date: "2015-04-10", nikkei: 19907, dow: 18057, usdjpy: 120 },
  { date: "2015-07-10", nikkei: 19779, dow: 17760, usdjpy: 122 },
  { date: "2015-10-09", nikkei: 18438, dow: 17084, usdjpy: 120 },
  { date: "2015-12-30", nikkei: 19034, dow: 17425, usdjpy: 120 },

  { date: "2016-01-04", nikkei: 18450, dow: 17149, usdjpy: 119 },
  { date: "2016-01-08", nikkei: 17697, dow: 16346, usdjpy: 118 },
  { date: "2016-05-24", nikkei: 16498, dow: 17706, usdjpy: 110 },
  { date: "2016-06-17", nikkei: 15599, dow: 17675, usdjpy: 104 },
  { date: "2016-06-23", nikkei: 16238, dow: 18011, usdjpy: 106 },
  { date: "2016-06-24", nikkei: 14952, dow: 17400, usdjpy: 102 },
  { date: "2016-07-01", nikkei: 15682, dow: 17949, usdjpy: 102 },
  { date: "2016-07-25", nikkei: 16620, dow: 18493, usdjpy: 106 },
  { date: "2016-09-23", nikkei: 16754, dow: 18261, usdjpy: 101 },
  { date: "2016-12-22", nikkei: 19427, dow: 19918, usdjpy: 117 },
  { date: "2017-06-23", nikkei: 20132, dow: 21394, usdjpy: 111 },

  { date: "2020-01-02", nikkei: 23656, dow: 28868, usdjpy: 109 },
  { date: "2020-02-11", nikkei: 23685, dow: 29276, usdjpy: 110 },
  { date: "2020-03-04", nikkei: 21100, dow: 27090, usdjpy: 107 },
  { date: "2020-03-10", nikkei: 19867, dow: 25018, usdjpy: 105 },
  { date: "2020-03-12", nikkei: 18559, dow: 21200, usdjpy: 104 },
  { date: "2020-03-18", nikkei: 16726, dow: 19898, usdjpy: 108 },
  { date: "2020-04-10", nikkei: 19498, dow: 23719, usdjpy: 108 },
  { date: "2020-06-11", nikkei: 22472, dow: 25128, usdjpy: 107 },
  { date: "2020-09-11", nikkei: 23406, dow: 27665, usdjpy: 106 },
  { date: "2021-03-11", nikkei: 29211, dow: 32485, usdjpy: 108 },

  { date: "2021-08-24", nikkei: 27732, dow: 35366, usdjpy: 110 },
  { date: "2022-01-24", nikkei: 27588, dow: 34364, usdjpy: 114 },
  { date: "2022-02-17", nikkei: 27232, dow: 34312, usdjpy: 115 },
  { date: "2022-02-24", nikkei: 25970, dow: 33224, usdjpy: 115 },
  { date: "2022-03-03", nikkei: 26577, dow: 33794, usdjpy: 116 },
  { date: "2022-03-24", nikkei: 28110, dow: 34707, usdjpy: 122 },
  { date: "2022-05-24", nikkei: 26748, dow: 31928, usdjpy: 127 },
  { date: "2022-08-24", nikkei: 28313, dow: 32969, usdjpy: 137 },
  { date: "2023-02-24", nikkei: 27453, dow: 32817, usdjpy: 136 },

  { date: "2023-08-22", nikkei: 31857, dow: 34288, usdjpy: 146 },
  { date: "2024-01-22", nikkei: 36546, dow: 38001, usdjpy: 148 },
  { date: "2024-02-15", nikkei: 38157, dow: 38773, usdjpy: 150 },
  { date: "2024-02-21", nikkei: 38262, dow: 38612, usdjpy: 150 },
  { date: "2024-02-22", nikkei: 39098, dow: 39069, usdjpy: 150 },
  { date: "2024-02-29", nikkei: 39166, dow: 38996, usdjpy: 150 },
  { date: "2024-03-22", nikkei: 40888, dow: 39475, usdjpy: 151 },
  { date: "2024-05-22", nikkei: 38617, dow: 39671, usdjpy: 156 },
  { date: "2024-08-22", nikkei: 38211, dow: 40712, usdjpy: 146 },
  { date: "2025-02-21", nikkei: 38678, dow: 43428, usdjpy: 150 }
];

const SAMPLE_EVENTS = [
  {
    id: "event-plaza-1985",
    date: "1985-09-22",
    title: "プラザ合意",
    category: "為替",
    importance: 5,
    region: "日本・米国・欧州",
    description: "主要国がドル高是正で協調した合意。",
    memo: "ドル円の長期的な円高転換を眺める入口に。"
  },
  {
    id: "event-nikkei-high-1989",
    date: "1989-12-29",
    title: "日経平均史上最高値",
    category: "バブル",
    importance: 5,
    region: "日本",
    description: "バブル期の日経平均が高値を付けた日。",
    memo: "2024年の高値更新と比較しやすい。"
  },
  {
    id: "event-bubble-1990",
    date: "1990-01-01",
    title: "バブル崩壊期の始まり",
    category: "バブル",
    importance: 5,
    region: "日本",
    description: "日本株の大きな調整局面が始まる時期。",
    memo: "イベント日は休場日のため近い市場日を使う。"
  },
  {
    id: "event-yamaichi-1997",
    date: "1997-11-24",
    title: "山一證券破綻",
    category: "経済危機",
    importance: 4,
    region: "日本",
    description: "大手証券会社の自主廃業発表。",
    memo: "金融システム不安の文脈で観察。"
  },
  {
    id: "event-911-2001",
    date: "2001-09-11",
    title: "アメリカ同時多発テロ",
    category: "戦争・紛争",
    importance: 5,
    region: "米国",
    description: "米国で発生した大規模テロ事件。",
    memo: "市場再開後の反応を近い営業日で確認。"
  },
  {
    id: "event-lehman-2008",
    date: "2008-09-15",
    title: "リーマン・ブラザーズ破綻",
    category: "経済危機",
    importance: 5,
    region: "米国・世界",
    description: "世界金融危機を象徴する投資銀行の破綻。",
    memo: "1週間、1か月、6か月の変化が見どころ。"
  },
  {
    id: "event-earthquake-2011",
    date: "2011-03-11",
    title: "東日本大震災",
    category: "災害",
    importance: 5,
    region: "日本",
    description: "東北地方太平洋沖地震と津波、原発事故を伴う災害。",
    memo: "日本株と円相場の反応を確認。"
  },
  {
    id: "event-abe-2012",
    date: "2012-12-26",
    title: "第2次安倍政権発足",
    category: "日本政治",
    importance: 4,
    region: "日本",
    description: "金融緩和期待を含む相場テーマが広がった時期。",
    memo: "株高・円安の流れを見やすい。"
  },
  {
    id: "event-brexit-2016",
    date: "2016-06-24",
    title: "Brexit国民投票",
    category: "米国政治",
    importance: 4,
    region: "英国・欧州",
    description: "英国のEU離脱を問う国民投票で離脱派が勝利。",
    memo: "リスクオフ時の円高方向を確認。"
  },
  {
    id: "event-covid-2020",
    date: "2020-03-11",
    title: "WHOがCOVID-19パンデミック宣言",
    category: "経済危機",
    importance: 5,
    region: "世界",
    description: "WHOが新型コロナウイルス感染症をパンデミックと表明。",
    memo: "急落と回復の両方を眺める。"
  },
  {
    id: "event-ukraine-2022",
    date: "2022-02-24",
    title: "ロシアによるウクライナ侵攻",
    category: "戦争・紛争",
    importance: 5,
    region: "欧州・世界",
    description: "ロシアがウクライナへ軍事侵攻。",
    memo: "資源高、金利、為替の文脈で後からメモを追加。"
  },
  {
    id: "event-nikkei-newhigh-2024",
    date: "2024-02-22",
    title: "日経平均がバブル期高値を更新",
    category: "バブル",
    importance: 5,
    region: "日本",
    description: "日経平均が1989年末の高値を上回った日。",
    memo: "1989年高値との比較に。"
  }
];

// События игры
// Баффы (1% шанс)
const BUFFS_PROGRESS = [
  {
    name: 'накрутил подписчиков',
    type: 'progress',
    value: 2
  }
];
const BUFFS_MULT = [
  {
    name: 'твоя мать нашла работу с зарплатой 100.000 рублей в месяц',
    type: 'multiplier',
    value: 2,
    duration: 20000 // 20 секунд
  },
  {
    name: 'союзники продвинули твой трек в тиктоке',
    type: 'multiplier',
    value: 1.5,
    duration: 15000
  },
  {
    name: 'коллаборация с иван золо',
    type: 'multiplier',
    value: 3,
    duration: 5000
  }
];

// Дебаффы (1% шанс)
const DEBUFFS_PROGRESS = [
  {
    name: 'хейтеры залили перцем',
    type: 'progress',
    value: -1
  },
  {
    name: 'обманули на деньги в интернете',
    type: 'progress',
    value: -2
  },
  {
    name: 'парень ты обосрался',
    type: 'progress',
    value: -2
  },
  {
    name: 'пока спал произошла поллюция',
    type: 'progress',
    value: -1
  },
  {
    name: 'твою виртуальную девушку загрызли собаки',
    type: 'progress',
    value: -3
  },
  {
    name: 'дикий бой прогрел твою мать',
    type: 'progress',
    value: -2
  }
];
const DEBUFFS_MULT = [
  {
    name: 'твою мать уволили с работы',
    type: 'multiplier',
    value: 0.5,
    duration: 15000 // 20 секунд
  },
  {
    name: 'твой писюн слили в интернет',
    type: 'multiplier',
    value: 0.8,
    duration: 30000 // 30 секунд
  },
  {
    name: 'украли тг канал',
    type: 'multiplier',
    value: 0.7,
    duration: 20000 // 30 секунд
  }
];


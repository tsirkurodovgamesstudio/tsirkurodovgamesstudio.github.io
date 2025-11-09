const DESCRIPTIONS = {
  grishot: "",
  lilkreh: "Lil Kresh- настоящая имя, фамилия, отчество Влад Фадеев Вячеславович родился Апреля в 1998 году в городе Пенза. Маму;Надежда Фадеева Николаевна. Отец; Вячеслав Фадеев Борисович. \nВ 2000 он бы весёлым ребёнком любил машинки. \nВ 2006 году он пошло в первый класс и начел потихоньку становится реп культурой, любил прогуливать школу гулял с друзьями на улице в 5 классе попробовал первый раз сигарету потом его заметили когда он был уже в 6 классе и бросил этим заниматься курить сигареты. В 2007 получил очень серьёзное сотрясение головы что он лежал в коме 6 часов в больнице деткой. Потом его положили в психушку из того что у него пошло изменение головы. В 2008 он начел слушать реп и перадически группу кино Виктор Цоя. \nВ 2012 году Lil Kresh начел писать песни но не выпускал их. В 2014 году он выпустился из школы и он начел слушать Егора Крида. В 2018 году он начел слушать Джизуса и начал им восхищаться и идти по его стопам. В 2019 году у Lil Kresha вышел первый трек «Розовое небо». И она стала самая популярная в его городе. Потом он начел делать дольше и в 2020 году залетел трек всем «Холодные руки». В 2021 он написал трек «Новый Ван Гог» посвящено Джизусу. Lil Kresh - означает это вседаним маленький взрыв. В 2023 начел слушать Lil Peep когда он уже был мёртв и начел  тоже им восхищаться и слушать его.  В 2024 году Lil Kresh выступал в Воронеже и в Саранске. В 2025 году он сделай свою первую дискотеку и ещё в 2026 году у него сольный концерт. И дальше предложения следует пока Lil Kresh живой.",
  perebloger: "",
  showsmall: ""
}

// Данные персонажей
const CHARACTERS = [
  {
    id: 'grishot',
    name: 'Гришот',
    image: 'images/grishot.jpg',
    video: 'images/grishot.mp4',
    desc: DESCRIPTIONS.grishot,
    replicas: [
      ' '
    ]
  },
  {
    id: 'lilkreh',
    name: 'Лил Креш',
    image: 'images/lilkreh.jpg',
    video: 'images/lilkreh.mp4',
    desc: DESCRIPTIONS.lilkreh,
    replicas: [
      ' '
    ]
  },
  {
    id: 'perebloger',
    name: 'Перебогер',
    image: 'images/perebloger.jpg',
    video: 'images/perebloger.mp4',
    desc: DESCRIPTIONS.perebloger,
    replicas: [
      ' '
    ]
  },
  {
    id: 'showsmall',
    name: 'Шоу Смол 2004',
    image: 'images/showsmall.jpg',
    video: 'images/showsmall.mp4',
    desc: DESCRIPTIONS.showsmall,
    replicas: [
      ' '
    ]
  }
];

// Музыка для персонажей
const MUSIC = {
  grishot: 'audio/grishot.mp3',
  lilkreh: 'audio/lilkreh.mp3',
  perebloger: 'audio/perebloger.mp3',
  showsmall: 'audio/showsmall.mp3'
};

// Звуки при наведении на персонажей
const HOVER_SOUNDS = {
  grishot: 'audio/grishot-hover.mp3',
  lilkreh: 'audio/lilkreh-hover.mp3',
  perebloger: 'audio/perebloger-hover.mp3',
  showsmall: 'audio/showsmall-hover.mp3'
};

// Реплики персонажей (пути к аудиофайлам)
// Если файлы имеют другие имена, добавьте их сюда
// Формат: audio/{characterId}/{filename}.mp3
const REPLICAS = {
  grishot: [
    // Пример: 'audio/grishot/replica1.mp3',
    // Добавьте здесь пути к вашим файлам реплик для Гришота
  ],
  lilkreh: [
    // Пример: 'audio/lilkreh/replica1.mp3',
    // Добавьте здесь пути к вашим файлам реплик для Лил Креша
    'audio/lilkreh/1.MP3',
    'audio/lilkreh/2.MP3',
    'audio/lilkreh/3.MP3',
    'audio/lilkreh/4.MP3',
    'audio/lilkreh/5.MP3',
    'audio/lilkreh/6.MP3',
    'audio/lilkreh/7.MP3',
    'audio/lilkreh/8.MP3',
    'audio/lilkreh/9.MP3',
    'audio/lilkreh/10.MP3',
    'audio/lilkreh/11.MP3',
    'audio/lilkreh/12.MP3',
    'audio/lilkreh/13.MP3',
    'audio/lilkreh/14.MP3',
    'audio/lilkreh/15.MP3',
    'audio/lilkreh/16.MP3',
    'audio/lilkreh/17.MP3',
    'audio/lilkreh/18.MP3',
    'audio/lilkreh/19.MP3',
    'audio/lilkreh/20.MP3'
  ],
  perebloger: [
    // Пример: 'audio/perebloger/replica1.mp3',
    // Добавьте здесь пути к вашим файлам реплик для Перебогера
  ],
  showsmall: [
    // Пример: 'audio/showsmall/replica1.mp3',
    // Добавьте здесь пути к вашим файлам реплик для Шоу Смол 2004
  ]
};


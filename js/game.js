// Основная логика игры
let gameState = {
  selectedCharacter: null,
  progress: 0,
  activeBuffs: [], // Активные баффы/дебаффы
  clickMultiplier: 1, // Множитель силы клика
  lastRushActive: false // Перманентный дебаф при 90%
};

// DOM элементы
const elements = {
  splash: document.getElementById('splash'),
  charSelect: document.getElementById('charSelect'),
  game: document.getElementById('game'),
  chars: document.getElementById('chars'),
  history: document.getElementById('history'),
  bigAvatar: document.getElementById('bigAvatar'),
  charName: document.getElementById('charName'),
  charDesc: document.getElementById('charDesc'),
  progressPercent: document.getElementById('progressPercent'),
  barFill: document.getElementById('barFill'),
  popup: document.getElementById('popup'),
  popupTitle: document.getElementById('popupTitle'),
  popupMsg: document.getElementById('popupMsg'),
  clickBtn: document.getElementById('clickBtn')
};

// Навигация между экранами
function showSplash() {
  elements.splash.classList.remove('hidden');
  elements.charSelect.classList.add('hidden');
  elements.game.classList.add('hidden');
  stopMusic();
  gameState.progress = 0;
  gameState.selectedCharacter = null;
  gameState.activeBuffs = [];
  gameState.clickMultiplier = 1;
  gameState.lastRushActive = false;
  if (elements.history) {
    elements.history.innerHTML = '';
  }
}

function showCharSelect() {
  elements.splash.classList.add('hidden');
  elements.charSelect.classList.remove('hidden');
}

function startGame() {
  elements.charSelect.classList.add('hidden');
  elements.game.classList.remove('hidden');
  initCharacter();
}

// Инициализация персонажа
function initCharacter() {
  if (!gameState.selectedCharacter) return;
  
  const char = gameState.selectedCharacter;
  // ИСПОЛЬЗУЕМ ВИДЕО вместо фото, если есть video-поле
  if (char.video) {
    elements.bigAvatar.innerHTML = `<video src="${char.video}" poster="${char.image}" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:cover;border-radius:10px;"></video>`;
  } else {
    elements.bigAvatar.innerHTML = `<img src="${char.image}" alt="${char.name}" />`;
  }
  elements.charName.textContent = char.name;
  elements.charDesc.textContent = char.desc;
  
  // Сбрасываем состояние
  gameState.activeBuffs = [];
  gameState.clickMultiplier = 1;
  gameState.lastRushActive = false;
  updateClickMultiplier();
  
  // Очищаем и инициализируем историю
  if (elements.history) {
    elements.history.innerHTML = '';
    addHistoryEntry('Игра началась');
  }
  
  playCharacterMusic(char.id);
  updateProgress();
}

// Рендер персонажей для выбора (плитка 2x2)
function renderCharacters() {
  const charGrid = document.getElementById('charGrid');
  const charInfoName = document.getElementById('charInfoName');
  const charInfoDesc = document.getElementById('charInfoDesc');
  const charInfoImage = document.getElementById('charInfoImage');
  const charSelectBtn = document.getElementById('charSelectBtn');
  
  // Определяем, мобильное ли устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  // Обновляем текст для мобильных
  if (isMobile) {
    charInfoName.textContent = 'Тапни на персонажа';
  }
  
  let selectedSegment = null;
  let currentHoverAudio = null; // Текущий воспроизводимый звук
  
  // Функция показа персонажа
  function showCharacter(char, segment) {
    // Останавливаем предыдущий звук, если он играет
    if (currentHoverAudio) {
      currentHoverAudio.pause();
      currentHoverAudio.currentTime = 0;
      currentHoverAudio = null;
    }
    
    // Воспроизводим звук при наведении
    const hoverSound = HOVER_SOUNDS[char.id];
    if (hoverSound) {
      const audio = new Audio(hoverSound);
      audio.volume = 1;
      currentHoverAudio = audio;
      audio.play().catch(() => {
        // Игнорируем ошибки автоплея
        currentHoverAudio = null;
      });
      
      // Очищаем ссылку после окончания воспроизведения
      audio.addEventListener('ended', () => {
        if (currentHoverAudio === audio) {
          currentHoverAudio = null;
        }
      });
    }
    
    // Показываем изображение в блоке информации
    charInfoImage.innerHTML = `<img src="${char.image}" alt="${char.name}" />`;
    charInfoImage.classList.add('show');
    
    // Делаем контур в сегменте
    if (selectedSegment && selectedSegment !== segment) {
      selectedSegment.classList.remove('hovered', 'selected');
    }
    segment.classList.add('hovered');
    selectedSegment = segment;
    
    // Обновляем текст
    charInfoName.textContent = char.name;
    charInfoDesc.textContent = char.desc;
    charInfoName.style.transform = 'scale(1.05)';
    setTimeout(() => {
      charInfoName.style.transform = 'scale(1)';
    }, 200);
    
    // На мобильных показываем кнопку выбора
    if (isMobile) {
      charSelectBtn.classList.remove('hidden');
      charSelectBtn.onclick = () => {
        gameState.selectedCharacter = char;
        startGame();
      };
    }
  }
  
  // Функция скрытия персонажа
  function hideCharacter() {
    // Останавливаем звук при уходе мыши (только на десктопе)
    if (currentHoverAudio && !isMobile) {
      currentHoverAudio.pause();
      currentHoverAudio.currentTime = 0;
      currentHoverAudio = null;
    }
    
    // Убираем контур
    if (selectedSegment) {
      selectedSegment.classList.remove('hovered');
      if (!isMobile) {
        selectedSegment.classList.remove('selected');
      }
    }
    
    // Скрываем изображение в блоке информации
    charInfoImage.classList.remove('show');
    setTimeout(() => {
      if (!charInfoImage.classList.contains('show')) {
        charInfoImage.innerHTML = '';
      }
    }, 400);
    
    // Сбрасываем текст
    if (!isMobile || !selectedSegment) {
      charInfoName.textContent = 'Наведи на персонажа';
      charInfoDesc.textContent = '—';
      charSelectBtn.classList.add('hidden');
    }
  }
  
  charGrid.innerHTML = '';
  
  CHARACTERS.forEach((char, index) => {
    const segment = document.createElement('div');
    segment.className = 'char-segment';
    segment.innerHTML = `<img src="${char.image}" alt="${char.name}" />`;
    
    // Обработка наведения (только для десктопа)
    if (!isMobile) {
      segment.addEventListener('mouseenter', () => {
        showCharacter(char, segment);
      });
      
      segment.addEventListener('mouseleave', () => {
        hideCharacter();
      });
    }
    
    // Обработка клика/тапа
    segment.addEventListener('click', (e) => {
      if (isMobile) {
        // На мобильных: первый тап показывает персонажа, второй тап запускает игру
        if (selectedSegment === segment && segment.classList.contains('selected')) {
          // Второй тап - запускаем игру
          gameState.selectedCharacter = char;
          startGame();
        } else {
          // Первый тап - показываем персонажа (звук уже в showCharacter)
          showCharacter(char, segment);
          segment.classList.add('selected');
        }
      } else {
        // На десктопе: клик сразу запускает игру
        gameState.selectedCharacter = char;
        startGame();
      }
    });
    
    charGrid.appendChild(segment);
  });
  
  // Сброс информации при уходе мыши с сетки (только для десктопа)
  if (!isMobile) {
    charGrid.addEventListener('mouseleave', () => {
      // Убираем все контуры
      document.querySelectorAll('.char-segment.hovered').forEach(seg => {
        seg.classList.remove('hovered');
      });
      selectedSegment = null;
      
      // Скрываем изображение
      hideCharacter();
    });
  }
}

// Обновление прогресса
function updateProgress() {
  const percent = Math.floor(gameState.progress);
  elements.progressPercent.textContent = percent + '%';
  elements.barFill.style.width = gameState.progress + '%';
  
  // Проверка на 90% - активация "последнего рывка"
  if (gameState.progress >= 90 && !gameState.lastRushActive) {
    gameState.lastRushActive = true;
    updateClickMultiplier();
    addHistoryEntry('Последний рывок: сила клика x0.5', 'debuff');
  }
}

// Обновление множителя клика
function updateClickMultiplier() {
  let multiplier = 1;
  gameState.activeBuffs.forEach(buff => {
    if (buff.type === 'multiplier') {
      multiplier *= buff.value;
    }
  });
  // "Последний рывок" применяется отдельно
  if (gameState.lastRushActive) {
    multiplier *= 0.5;
  }
  gameState.clickMultiplier = multiplier;
}

// Добавление записи в историю
function addHistoryEntry(text, type = '') {
  const entry = document.createElement('div');
  entry.className = `history-entry ${type}`;
  entry.textContent = text;
  elements.history.appendChild(entry);
  
  // Ограничиваем количество записей (удаляем старые сверху)
  while (elements.history.children.length > 20) {
    elements.history.removeChild(elements.history.firstChild);
  }
  
  // Автопрокрутка вниз (к новой записи)
  elements.history.scrollTop = elements.history.scrollHeight;
}

// Обработка клика
function handleClick(event) {
  if (!gameState.selectedCharacter) return;
  
  // Воспроизводим звук клика
  const tapSound = new Audio('audio/tap.mp3');
  tapSound.volume = 0.15;
  tapSound.play().catch(() => {
    // Игнорируем ошибки автоплея
  });
  
  // Анимация сердечка
  spawnHeart(event);
  
  // Увеличение прогресса с учетом множителя
  const clickPower = BASE_PER_CLICK * gameState.clickMultiplier;
  gameState.progress = Math.min(100, gameState.progress + clickPower);
  updateProgress();
  
  // Проверка победы
  if (gameState.progress >= 100) {
    return showWin();
  }
  
  // Проверка случайных событий (2% шанс: 1% баф, 1% дебаф)
  checkRandomEvents();
  
  // Обновление активных баффов
  updateActiveBuffs();
}

// Проверка случайных событий
function checkRandomEvents() {
  const rand = Math.random();
  // Если "последний рывок" — только дебаффы, подбираем отдельно
  if (gameState.lastRushActive) {
    if (rand < 0.005) {
      // 0.5% на дебафф
      // 30% - мультипликатор, 70% - прогресс
      const which = Math.random();
      let def;
      if (which < 0.3 && DEBUFFS_MULT.length > 0) {
        def = DEBUFFS_MULT[Math.floor(Math.random() * DEBUFFS_MULT.length)];
      } else {
        def = DEBUFFS_PROGRESS[Math.floor(Math.random() * DEBUFFS_PROGRESS.length)];
      }
      applyBuffDebuff(def, 'debuff');
    }
  } else {
    // 0.5% на бафф
    if (rand < 0.005) {
      const which = Math.random();
      let bf;
      if (which < 0.3 && BUFFS_MULT.length > 0) {
        bf = BUFFS_MULT[Math.floor(Math.random() * BUFFS_MULT.length)];
      } else {
        bf = BUFFS_PROGRESS[Math.floor(Math.random() * BUFFS_PROGRESS.length)];
      }
      applyBuffDebuff(bf, 'buff');
    // 0.5% на дебафф
    } else if (rand < 0.01) {
      const which = Math.random();
      let def;
      if (which < 0.3 && DEBUFFS_MULT.length > 0) {
        def = DEBUFFS_MULT[Math.floor(Math.random() * DEBUFFS_MULT.length)];
      } else {
        def = DEBUFFS_PROGRESS[Math.floor(Math.random() * DEBUFFS_PROGRESS.length)];
      }
      applyBuffDebuff(def, 'debuff');
    }
  }
}

// Применение баффа/дебаффа
function applyBuffDebuff(effect, type) {
  if (effect.type === 'multiplier') {
    // Множитель - добавляем в активные баффы
    const buff = {
      ...effect,
      id: Date.now() + Math.random(),
      type: 'multiplier',
      endTime: Date.now() + effect.duration
    };
    gameState.activeBuffs.push(buff);
    updateClickMultiplier();
    addHistoryEntry(`${effect.name} (x${effect.value} на ${effect.duration/1000}с)`, type);
    
    // Удаляем через duration
    setTimeout(() => {
      const index = gameState.activeBuffs.findIndex(b => b.id === buff.id);
      if (index !== -1) {
        gameState.activeBuffs.splice(index, 1);
        updateClickMultiplier();
        addHistoryEntry(`Эффект "${effect.name}" закончился`, '');
      }
    }, effect.duration);
  } else if (effect.type === 'progress') {
    // Изменение прогресса
    gameState.progress = Math.max(0, Math.min(100, gameState.progress + effect.value));
    updateProgress();
    addHistoryEntry(`${effect.name} (${effect.value > 0 ? '+' : ''}${effect.value}%)`, type);
  }
}

// Обновление активных баффов (удаление истекших)
function updateActiveBuffs() {
  const now = Date.now();
  gameState.activeBuffs = gameState.activeBuffs.filter(buff => {
    if (buff.endTime && buff.endTime <= now) {
      return false;
    }
    return true;
  });
  updateClickMultiplier();
}

// Показ попапа победы
function showWin() {
  elements.popupTitle.textContent = 'Победа!';
  elements.popupMsg.textContent = 'Ты нашел свою вторую половинку 💘';
  elements.popup.classList.add('show');
}

// Скрытие попапа
function hidePopup() {
  elements.popup.classList.remove('show');
}

// Инициализация игры
function initGame() {
  renderCharacters();
  elements.clickBtn.addEventListener('click', handleClick);
  
  // Обработчик клика на утку
  const duckEmoji = document.getElementById('duckEmoji');
  if (duckEmoji) {
    duckEmoji.addEventListener('click', () => {
      const duckAudio = new Audio('audio/duck.ogg');
      duckAudio.volume = 0.5;
      duckAudio.play().catch(() => {
        // Игнорируем ошибки автоплея
      });
    });
  }
  
  // Делаем функции доступными глобально для onclick в HTML
  window.showCharSelect = showCharSelect;
  window.hidePopup = hidePopup;
}

// Запуск при загрузке страницы
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}


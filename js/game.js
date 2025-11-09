// Значение увеличения шкалы за клик
const BASE_PER_CLICK = 1.05;

// Основная логика игры
let gameState = {
  selectedCharacter: null,
  progress: 0,
  activeBuffs: [], // Активные баффы/дебаффы
  clickMultiplier: 1, // Множитель силы клика
  lastRushActive: false // Перманентный дебаф при 90%
};

// Система очереди реплик
const replicaQueue = {
  queue: [], // Очередь реплик для воспроизведения
  isPlaying: false, // Флаг воспроизведения
  currentAudio: null, // Текущее воспроизводимое аудио
  
  // Добавление реплики в очередь
  add: function(audioPath) {
    this.queue.push(audioPath);
    if (!this.isPlaying) {
      this.playNext();
    }
  },
  
  // Воспроизведение следующей реплики из очереди
  playNext: function() {
    if (this.queue.length === 0) {
      this.isPlaying = false;
      this.currentAudio = null;
      return;
    }
    
    this.isPlaying = true;
    const audioPath = this.queue.shift();
    const audio = new Audio(audioPath);
    this.currentAudio = audio;
    
    audio.volume = 1;
    
    // Обработка окончания воспроизведения
    audio.addEventListener('ended', () => {
      this.currentAudio = null;
      this.playNext(); // Воспроизводим следующую в очереди
    });
    
    // Обработка ошибок
    audio.addEventListener('error', () => {
      console.warn(`Не удалось загрузить реплику: ${audioPath}`);
      this.currentAudio = null;
      this.playNext(); // Пропускаем и переходим к следующей
    });
    
    audio.play().catch(() => {
      // Игнорируем ошибки автоплея
      this.currentAudio = null;
      this.isPlaying = false;
    });
  },
  
  // Очистка очереди
  clear: function() {
    this.queue = [];
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.isPlaying = false;
  }
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
  replicaQueue.clear(); // Очищаем очередь реплик
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
  const charConfirmBtn = document.getElementById('charConfirmBtn');
  
  // Определяем, мобильное ли устройство
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
  
  let selectedSegment = null;
  let selectedCharacter = null;
  let currentVideo = null;
  
  // Функция остановки всех видео кроме указанного
  function stopAllVideos(exceptVideo = null) {
    document.querySelectorAll('.char-segment video').forEach(v => {
      if (v !== exceptVideo) {
        v.pause();
        v.currentTime = 0;
      }
    });
  }
  
  charGrid.innerHTML = '';
  
  CHARACTERS.forEach((char, index) => {
    const segment = document.createElement('div');
    segment.className = 'char-segment';
    segment.dataset.charId = char.id;
    
    // Добавляем фото и видео
    const img = document.createElement('img');
    img.src = char.image;
    img.alt = char.name;
    
    const video = document.createElement('video');
    if (char.video) {
      video.src = char.video;
      video.loop = true;
      video.muted = false;
      video.playsInline = true;
    }
    
    segment.appendChild(img);
    if (char.video) {
      segment.appendChild(video);
    }
    
    // Обработка наведения (только для десктопа)
    if (!isMobile) {
      segment.addEventListener('mouseenter', () => {
        // Если уже выбран другой персонаж, игнорируем наведение
        if (selectedSegment && selectedSegment !== segment) {
          return;
        }
        
        segment.classList.add('hovered');
        
        // Останавливаем все другие видео
        stopAllVideos(video);
        
        // Воспроизводим видео со звуком
        if (video && char.video) {
          video.currentTime = 0;
          video.play().catch(() => {
            // Игнорируем ошибки автоплея
          });
          currentVideo = video;
        }
      });
      
      // Эффект наклона при движении мыши
      segment.addEventListener('mousemove', (e) => {
        // Применяем только к выбранному или наведенному персонажу
        if (!segment.classList.contains('hovered') && !segment.classList.contains('selected')) {
          return;
        }
        
        const rect = segment.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        // Вычисляем углы наклона (максимум 15 градусов)
        const maxTilt = 25;
        const rotateX = (mouseY / (rect.height / 2)) * -maxTilt;
        const rotateY = (mouseX / (rect.width / 2)) * maxTilt;
        
        // Применяем transform с scale и rotate
        segment.style.transform = `scale(1.5) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      
      segment.addEventListener('mouseleave', () => {
        // Сбрасываем наклон
        if (segment.classList.contains('hovered') || segment.classList.contains('selected')) {
          segment.style.transform = 'scale(1.5) rotateX(0deg) rotateY(0deg)';
        }
        
        // Если не выбран, убираем hover
        if (!segment.classList.contains('selected')) {
          segment.classList.remove('hovered');
          segment.style.transform = '';
          
          // Останавливаем видео
          if (video) {
            video.pause();
            video.currentTime = 0;
          }
          currentVideo = null;
        }
      });
    }
    
    // Обработка клика/тапа
    segment.addEventListener('click', () => {
      // Если уже выбран этот же персонаж, ничего не делаем
      if (selectedSegment === segment) {
        return;
      }
      
      // Убираем выбор с предыдущего персонажа
      if (selectedSegment) {
        selectedSegment.classList.remove('selected', 'hovered');
        selectedSegment.style.transform = '';
        const prevVideo = selectedSegment.querySelector('video');
        if (prevVideo) {
          prevVideo.pause();
          prevVideo.currentTime = 0;
        }
      }
      
      // Останавливаем все видео
      stopAllVideos();
      
      // Выбираем нового персонажа
      selectedSegment = segment;
      selectedCharacter = char;
      segment.classList.add('selected');
      
      // Сбрасываем наклон при выборе
      segment.style.transform = 'scale(1.5) rotateX(0deg) rotateY(0deg)';
      
      // На мобильных также добавляем hover для визуального эффекта
      if (isMobile) {
        segment.classList.add('hovered');
      }
      
      // Воспроизводим видео
      if (video && char.video) {
        video.currentTime = 0;
        video.play().catch(() => {});
        currentVideo = video;
      }
      
      // Показываем кнопку подтверждения
      charConfirmBtn.classList.remove('hidden');
    });
    
    charGrid.appendChild(segment);
  });
  
  // Сброс hover при уходе мыши с сетки (только для десктопа)
  if (!isMobile) {
    charGrid.addEventListener('mouseleave', () => {
      // Убираем hover со всех сегментов, кроме выбранного
      document.querySelectorAll('.char-segment.hovered').forEach(seg => {
        if (!seg.classList.contains('selected')) {
          seg.classList.remove('hovered');
          seg.style.transform = '';
          const v = seg.querySelector('video');
          if (v) {
            v.pause();
            v.currentTime = 0;
          }
        }
      });
      
      // Сбрасываем наклон у выбранного элемента, если мышь ушла с сетки
      if (selectedSegment) {
        selectedSegment.style.transform = 'scale(1.5) rotateX(0deg) rotateY(0deg)';
      }
      
      if (!selectedSegment) {
        currentVideo = null;
      }
    });
  }
  
  // Обработка кнопки подтверждения
  charConfirmBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Предотвращаем всплытие события
    if (selectedCharacter) {
      gameState.selectedCharacter = selectedCharacter;
      startGame();
    }
  });
  
  // Функция сброса выбора
  function resetSelection() {
    if (selectedSegment) {
      selectedSegment.classList.remove('selected', 'hovered');
      selectedSegment.style.transform = '';
      const video = selectedSegment.querySelector('video');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      selectedSegment = null;
      selectedCharacter = null;
      currentVideo = null;
      charConfirmBtn.classList.add('hidden');
      stopAllVideos();
    }
  }
  
  // Обработка клика вне плитки и кнопки для сброса выбора
  const charSelectContainer = document.querySelector('.char-select-container');
  if (charSelectContainer) {
    document.addEventListener('click', (e) => {
      // Проверяем, что клик был вне плитки и кнопки
      const clickedOnGrid = charGrid.contains(e.target);
      const clickedOnButton = charConfirmBtn.contains(e.target);
      
      // Если клик был вне плитки и кнопки, и персонаж выбран - сбрасываем выбор
      if (!clickedOnGrid && !clickedOnButton && selectedSegment) {
        resetSelection();
      }
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

// Получение случайной реплики персонажа
function getRandomReplica() {
  if (!gameState.selectedCharacter) return null;
  
  const charId = gameState.selectedCharacter.id;
  const replicaFolder = `audio/${charId}/`;
  
  // Сначала проверяем, есть ли реплики в конфигурации
  if (REPLICAS[charId] && REPLICAS[charId].length > 0) {
    const randomIndex = Math.floor(Math.random() * REPLICAS[charId].length);
    return REPLICAS[charId][randomIndex];
  }
  
  // Если в конфигурации нет реплик, пытаемся найти файлы с именами replica1.mp3, replica2.mp3 и т.д.
  // Проверяем до 20 файлов
  const availableReplicas = [];
  for (let i = 1; i <= 20; i++) {
    availableReplicas.push(`${replicaFolder}replica${i}.mp3`);
  }
  
  // Возвращаем случайную реплику из списка
  const randomIndex = Math.floor(Math.random() * availableReplicas.length);
  return availableReplicas[randomIndex];
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
  
  // 2% шанс воспроизвести реплику персонажа
  if (Math.random() < 0.02) {
    const replicaPath = getRandomReplica();
    if (replicaPath) {
      replicaQueue.add(replicaPath);
    }
  }
  
  // Обновление активных баффов
  updateActiveBuffs();
}

// Проверка случайных событий
function checkRandomEvents() {
  const rand = Math.random();
  // Если "последний рывок" — только дебаффы, подбираем отдельно
  if (gameState.lastRushActive) {
    if (rand < 0.01) {
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
    if (rand < 0.01) {
      const which = Math.random();
      let bf;
      if (which < 0.3 && BUFFS_MULT.length > 0) {
        bf = BUFFS_MULT[Math.floor(Math.random() * BUFFS_MULT.length)];
      } else {
        bf = BUFFS_PROGRESS[Math.floor(Math.random() * BUFFS_PROGRESS.length)];
      }
      applyBuffDebuff(bf, 'buff');
    // 0.5% на дебафф
    } else if (rand < 0.02) {
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
    addHistoryEntry(`${effect.name} (x${effect.value} клики на ${effect.duration/1000}с)`, type);
    
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

// Анимация разлетающихся сердечек
function spawnWinHearts() {
  const heartsContainer = document.getElementById('heartsContainer');
  if (!heartsContainer) return;
  
  const heartEmojis = ['💖', '💕', '💗', '💓', '💝', '💘', '❤️', '🧡', '💛', '💚', '💙', '💜'];
  const numHearts = 50; // Количество сердечек
  
  for (let i = 0; i < numHearts; i++) {
    setTimeout(() => {
      const heart = document.createElement('div');
      heart.className = 'win-heart';
      heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      
      // Случайная позиция по экрану
      const startX = Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      
      // Случайное направление разлета
      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 300;
      const endX = startX + Math.cos(angle) * distance;
      const endY = startY + Math.sin(angle) * distance;
      
      // Случайный размер
      const size = 20 + Math.random() * 30;
      heart.style.fontSize = `${size}px`;
      heart.style.left = `${startX}px`;
      heart.style.top = `${startY}px`;
      
      heartsContainer.appendChild(heart);
      
      // Анимация разлета
      requestAnimationFrame(() => {
        heart.style.transition = 'all 2s ease-out';
        heart.style.transform = `translate(${endX - startX}px, ${endY - startY}px) rotate(${Math.random() * 720}deg)`;
        heart.style.opacity = '0';
      });
      
      // Удаляем сердечко после анимации
      setTimeout(() => {
        if (heart.parentNode) {
          heart.parentNode.removeChild(heart);
        }
      }, 2000);
    }, i * 30); // Небольшая задержка между сердечками
  }
}

// Показ экрана победы
function showWin() {
  if (!gameState.selectedCharacter) return;
  
  // Останавливаем музыку и реплики
  stopMusic();
  replicaQueue.clear();
  
  // Скрываем игровой экран
  elements.game.classList.add('hidden');
  
  // Показываем экран победы
  const winScreen = document.getElementById('winScreen');
  if (!winScreen) return;
  
  winScreen.classList.remove('hidden');
  
  // Воспроизводим аудио победы
  const winAudio = new Audio('audio/won.mp3');
  winAudio.volume = 1;
  
  // Запускаем анимацию сердечек
  spawnWinHearts();
  
  // Воспроизводим аудио
  winAudio.play().catch(() => {
    // Игнорируем ошибки автоплея, продолжаем выполнение
  });
  
  // После окончания аудио показываем видео концовки
  winAudio.addEventListener('ended', () => {
    showEndingVideo();
  }, { once: true });
  
  // Если аудио не загрузилось или уже закончилось, сразу показываем видео
  winAudio.addEventListener('canplaythrough', () => {
    if (winAudio.ended || winAudio.currentTime >= winAudio.duration) {
      showEndingVideo();
    }
  }, { once: true });
  
  // Таймаут на случай, если аудио не загрузится
  setTimeout(() => {
    if (!winAudio.ended) {
      showEndingVideo();
    }
  }, 5000);
}

// Показ видео концовки
function showEndingVideo() {
  const endingVideo = document.getElementById('endingVideo');
  const restartBtn = document.getElementById('restartBtn');
  
  if (!endingVideo || !gameState.selectedCharacter) return;
  
  // Определяем путь к видео концовки
  const charId = gameState.selectedCharacter.id;
  const endingPaths = {
    grishot: 'images/grishotending.mp4',
    lilkreh: 'images/lilkrehending.mp4',
    perebloger: 'images/pereblogerending.mp4',
    showsmall: 'images/showsmallending.mp4'
  };
  
  const endingPath = endingPaths[charId] || endingPaths.grishot;
  
  endingVideo.src = endingPath;
  endingVideo.style.display = 'block';
  endingVideo.muted = false;
  endingVideo.playsInline = true;
  
  // Воспроизводим видео
  endingVideo.play().catch(() => {
    // Если не удалось воспроизвести, сразу показываем кнопку
    showRestartButton();
  });
  
  // После окончания видео показываем кнопку
  endingVideo.addEventListener('ended', () => {
    showRestartButton();
  }, { once: true });
  
  // Обработка ошибок загрузки видео
  endingVideo.addEventListener('error', () => {
    console.warn('Не удалось загрузить видео концовки');
    showRestartButton();
  }, { once: true });
}

// Показ кнопки перезагрузки
function showRestartButton() {
  const restartBtn = document.getElementById('restartBtn');
  if (restartBtn && restartBtn.classList.contains('hidden')) {
    restartBtn.classList.remove('hidden');
    // Удаляем старый обработчик, если есть, и добавляем новый
    const newRestartBtn = restartBtn.cloneNode(true);
    restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);
    newRestartBtn.addEventListener('click', () => {
      location.reload();
    });
  }
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


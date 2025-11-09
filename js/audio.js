// Управление аудио
let bgMusic = null;

function initAudio() {
  bgMusic = document.getElementById('bgMusic');
  if (!bgMusic) {
    bgMusic = document.createElement('audio');
    bgMusic.id = 'bgMusic';
    bgMusic.loop = true;
    document.body.appendChild(bgMusic);
  }
}

function playCharacterMusic(characterId) {
  if (!bgMusic) initAudio();
  
  const musicPath = MUSIC[characterId];
  if (musicPath) {
    bgMusic.src = musicPath;
    bgMusic.volume = 0.2;
    bgMusic.play().catch(() => {
      // Игнорируем ошибки автоплея (требуется взаимодействие пользователя)
    });
  }
}

function stopMusic() {
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
}


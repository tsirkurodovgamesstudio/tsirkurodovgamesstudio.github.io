// Анимация сердечек при клике
function spawnHeart(event) {
  const heart = document.createElement('div');
  heart.textContent = '💖';
  heart.style.position = 'fixed';
  heart.style.left = (event.clientX - 12) + 'px';
  heart.style.top = (event.clientY - 20) + 'px';
  heart.style.fontSize = '22px';
  heart.style.pointerEvents = 'none';
  heart.style.zIndex = 9999;
  heart.style.transition = 'transform 900ms ease-out, opacity 900ms ease-out';
  document.body.appendChild(heart);

  requestAnimationFrame(() => {
    heart.style.transform = 'translateY(-80px)';
    heart.style.opacity = '0';
  });

  setTimeout(() => heart.remove(), 1000);
}


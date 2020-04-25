
window.onload = function () {
  const startButton = document.querySelector('.enter-screen__button');
  startButton.addEventListener('click', showMainScreen);
};

function showMainScreen() {
  document.querySelector('.enter-screen').classList.add('hide');
  document.querySelector('.main').classList.remove('hide');
}

import './controller';
import {startApp, showMainScreen} from './controller';

window.onload = function () {
  const startButton = document.querySelector('.enter-screen__button');
  startButton.addEventListener('click', startApp);
  // startApp(); // закомментировать в финальном релизе
};





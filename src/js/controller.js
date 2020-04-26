import Card from './card';
import recognition from './speachRecognition';

const restApi = 'https://afternoon-falls-25894.herokuapp.com/words?';
const dataUrl = 'https://raw.githubusercontent.com/irinainina/rslang/rslang-data/data/';
const mainScreen = document.querySelector('.main');
const enterScreen = document.querySelector('.enter-screen');
const resultsScreen = document.querySelector('.results');
const statisticScreen = document.querySelector('.statistic');
const mainPicture = document.querySelector('.img');
const mainTranslate = document.querySelector('.central-screen__translation');
const difficultLevel = document.querySelector('.level');
const btnSpeakPlease = document.querySelector('.button__speak-please');
const btnReset = document.querySelector('.button__reset');
const btnResult = document.querySelector('.button__result');
const btnNewGame = document.querySelector('.results__new-game-btn');
const btnReturnResults = document.querySelector('.results__return-btn');
const btnStatistic = document.querySelector('.results__statistic');
const iconMicMainScreen = document.querySelector('.icon__mic');


const gameScore = document.querySelector('.game-score');

let currentPage = 0;
let cards = {};
let currentDataCards = [];
let gameStarted = false;
let result = 0;
let successCards = [];
let wrongCards = [];

difficultLevel.addEventListener('click', changeLevel);
btnResult.addEventListener('click', showResults);
btnStatistic.addEventListener('click', showStatistic);
btnNewGame.addEventListener('click', startApp);
btnReturnResults.addEventListener('click', () => {
  showMainScreen();
  startGame();
});

async function loadFromBack(url) {
  const response = await fetch(url);
  return await response.json();
}

function loadCardsField(group = 0, page = 15) {
  const url = `${restApi}group=${group}&page=${page}`;
  loadFromBack(url).then(data => makeCardsField(data))
}

function makeCardsField(cardsData) {
  const newField = document.createElement('div');
  newField.classList.add('cards');

  cardsData.splice(0, 10);
  cards = cardsData.map(card =>  card.word.toLowerCase());
  currentDataCards = cardsData;
  cardsData.forEach((card) => {
    let currentCard = new Card(card.word, card.image, card.audio, card.transcription);
    currentCard = currentCard.renderCardMainField();
    currentCard.addEventListener('click', onClickCard);
    newField.append(currentCard);
  });

  const oldField = document.querySelector('.cards');
  oldField.replaceWith(newField);
}

function getTranslation(word) {
  let url = 'https://translate.yandex.net/api/v1.5/tr.json/translate' +
    '?key=trnsl.1.1.20200425T120214Z.7df2562a38fe836d.f604c2224ea5a5b2ea79f898a389af7e75097a12' +
    `&text=${word}` +
    '&lang=en-ru';
  return loadFromBack(url).then(data => data.text);
}

function changeTranslation(word) {
  getTranslation(word)
    .then((translation) => mainTranslate.textContent = translation);
}

function changeMainPicture(url) {
  mainPicture.setAttribute('src', `${dataUrl}${url}`)
}

function onClickCard(event) {
  if (!gameStarted) {
    removeActiveFromAllCards();
    event.currentTarget.classList.add('active');
    event.currentTarget.querySelector('audio').play();
    changeMainPicture(event.currentTarget.dataset.image);
    changeTranslation(event.currentTarget.dataset.word);
  }
}

function onClickResultCard(event) {
  event.currentTarget.querySelector('audio').play();
}

function changeActiveLevelView(levelNumber) {
  const levels = difficultLevel.querySelectorAll('li');
  levels.forEach(level => {
    level.classList.remove('point_active');
    if (level.dataset.id === levelNumber) {
      level.classList.add('point_active');
    }
  });
}

function initialiseMainScreen() {
  mainPicture.setAttribute('src', './assets/img/blank.jpg');
  mainTranslate.textContent = ' ';
}

function changeLevel(event) {
  const group = event.target.dataset.id;
  changeActiveLevelView(group);
  loadCardsField(group, currentPage);
  initialiseMainScreen();
}

function getRandomPage() {
  return Math.floor(Math.random() * Math.floor(29));
}

function startApp() {
  currentPage = getRandomPage();
  loadCardsField(0, currentPage);
  showMainScreen();
}

function findInArrayObject(arr, searchWord) {
  return arr.findIndex(card => card.word === searchWord);
}

function compareAnswer(answer) {
  const wrongArrCardIndex = findInArrayObject(wrongCards, answer.toLowerCase());
  if (wrongArrCardIndex === -1) {
    console.log('Wrong answer');
  } else {
    addActiveToElement(findInArrayObject(currentDataCards, answer.toLowerCase()));
    changeMainPicture(wrongCards[wrongArrCardIndex].image);
    increaseResult(wrongArrCardIndex);
    addToSuccessCardsArr(wrongArrCardIndex);
    checkGameWin() && showResults();
  }
}

function checkGameWin() {
  return wrongCards.length === 0;
}

function addToSuccessCardsArr(index) {
  successCards.push(wrongCards.splice(index, 1)[0]);
}

function addActiveToElement(elemId) {
  const card = document.querySelectorAll('.card')[elemId];
  card.classList.add('active');
}

function removeActiveFromAllCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => card.classList.remove('active'));
}

function increaseResult(itemIndex) {
  result++;
  addSmileToScore();
}

function addSmileToScore() {
  const icon = '<i class="material-icons md-dark md-36">mood</i>';
  gameScore.insertAdjacentHTML('beforeend', icon);
}

function resetSmileInScore() {
  gameScore.innerHTML = '';
}

function showResults() {
  gameStarted = false;
  recognition.abort();
  createResultsTable();
  mainScreen.classList.add('hide');
  resultsScreen.classList.remove('hide');
  resetMainScreen();
  addResultsToStatistic();
}

function resetMainScreen(speakButton = false) {
  resetSmileInScore();
  removeActiveFromAllCards();
  !speakButton && deactivateMicIcon();
  initialiseMainScreen();
}

function createResultsTable() {
  const warning = document.createElement('p');
  warning.classList.add('warning-field');
  if (!successCards.length) {
    warning.classList.add('results__warning');
    warning.textContent = 'Для начала надо сказать пару слов в микрофон, нажмите Return и говорите';
    document.querySelector('.warning-field').replaceWith(warning);
  }
  document.querySelector('.warning-field').replaceWith(warning);

  document.querySelector('.errors__counter').textContent = `${wrongCards.length}`;
  document.querySelector('.success__counter').textContent = `${successCards.length}`;

  const errorCards = document.createElement('ul');
  errorCards.classList.add('error__cards');

  wrongCards.forEach((card) => {
    let currentCard = new Card(card.word, card.image, card.audio, card.transcription);
    currentCard = currentCard.renderCardResults();
    currentCard.addEventListener('click', onClickResultCard);
    errorCards.append(currentCard);
  });

  const oldErrorField = document.querySelector('.error__cards');
  oldErrorField.replaceWith(errorCards);

  const successCardsField = document.createElement('ul');
  successCardsField.classList.add('success__cards');

  successCards.forEach((card) => {
    let currentCard = new Card(card.word, card.image, card.audio, card.transcription);
    currentCard = currentCard.renderCardResults();
    currentCard.addEventListener('click', onClickResultCard);
    successCardsField.append(currentCard);
  });

  const oldSuccessField = document.querySelector('.success__cards');
  oldSuccessField.replaceWith(successCardsField);
  getResultsTranslation();
}

function getResultsTranslation() {
  const allCards = document.querySelectorAll('.result__card');
  allCards.forEach((card) => {
    getTranslation(card.dataset.word)
      .then((translation) => {
        card.querySelector('.result-card__translation').textContent = translation;
      })
  })
}

function showMainScreen() {
  enterScreen.classList.add('hide');
  resultsScreen.classList.add('hide');
  mainScreen.classList.remove('hide');
}

function activateMicIcon() {
  iconMicMainScreen.classList.add('active');
}

function deactivateMicIcon() {
  iconMicMainScreen.classList.remove('active');
}

function startGame() {
  gameStarted = true;
  recognition.start();
  resetMainScreen(true);
  activateMicIcon();
  console.log('Ready to receive a word.');
  wrongCards = [...currentDataCards];
  successCards = [];
}

function resetGame() {
  deactivateMicIcon();
  gameStarted = false;
  recognition.abort();
  resetMainScreen();
  wrongCards = [];
  successCards = [];
}

function hideResultsScreen() {
  resultsScreen.classList.add('hide');
}
// showStatistic();
function showStatistic() {
  hideResultsScreen();
  statisticScreen.classList.remove('hide');
  const currentStats = getStatisticFromStorage();
  const oldStatisticField = document.querySelector('.statistic__wrapper');
  const newStatisticScreen = document.createElement('div');
  newStatisticScreen.classList.add('statistic__wrapper');

  currentStats.forEach(res => {
    const currentResult = document.createElement('div');
    currentResult.classList.add('statistic__result');

    const resultDate = document.createElement('div');
    resultDate.classList.add('result__date');
    const curDate = new Date(res.time);
    const dateObj = {
      year: curDate.getFullYear(),
      month: (curDate.getMonth() + 1) < 10 ? `0${(curDate.getMonth() + 1)}` : `${(curDate.getMonth() + 1)}`,
      day: curDate.getDate() < 10 ? `0${curDate.getDate()}` : `${curDate.getDate()}`,
      hours: curDate.getHours() < 10 ? `0${curDate.getHours()}` : `${curDate.getHours()}`,
      minutes: curDate.getMinutes() < 10 ? `0${curDate.getMinutes()}` : `${(curDate.getMinutes() + 1)}`,
    }
    const date = `${dateObj.day}.${dateObj.month}.${dateObj.year}   ${dateObj.hours}:${dateObj.minutes}`;
    resultDate.textContent = date;

    const resultWrong = document.createElement('div');
    resultWrong.classList.add('result__wrong');
    resultWrong.textContent = 'Wrong Answers';

    const wrongCounter = document.createElement('div');
    wrongCounter.classList.add('wrong__counter');
    wrongCounter.textContent = `${res.wrongAnswers.length}`;
    resultWrong.append(wrongCounter);

    currentResult.append(resultDate);
    currentResult.append(resultWrong);

    res.wrongAnswers.forEach(word => {
      const statsWord = document.createElement('p');
      statsWord.classList.add('stats__word');
      statsWord.textContent = word;
      currentResult.append(statsWord);
    });

    const resultSuccess = document.createElement('div');
    resultSuccess.classList.add('result__success');
    resultSuccess.textContent = 'Right Answers';

    const successCounter = document.createElement('div');
    successCounter.classList.add('success__counter');
    successCounter.textContent = `${res.successAnswers.length}`;

    resultSuccess.append(successCounter);
    currentResult.append(resultSuccess);

    res.successAnswers.forEach(word => {
      const statsWord = document.createElement('p');
      statsWord.classList.add('stats__word');
      statsWord.textContent = word;
      currentResult.append(statsWord);
    });
    newStatisticScreen.append(currentResult);
  });

  const btnWrapper = document.createElement('div');
  btnWrapper.classList.add('button__wrapper');
  const btnReturn = document.createElement('button');
  btnReturn.classList.add('button', 'results__return-btn', 'stats__return-btn');
  btnReturn.textContent = 'Return';
  btnReturn.addEventListener('click', () => {
    statisticScreen.classList.add('hide');
    resultsScreen.classList.remove('hide');
  });
  btnWrapper.append(btnReturn);
  newStatisticScreen.append(btnWrapper);
  oldStatisticField.replaceWith(newStatisticScreen);
}

function addResultsToStatistic() {
  if (successCards.length) {
    let statisticArr = getStatisticFromStorage();
    let currentResult = {
      time: Date.now(),
      wrongAnswers: wrongCards.map(card => card.word),
      successAnswers: successCards.map(card => card.word),
    };
    statisticArr.push(currentResult);
    saveStatisticToStorage(statisticArr);
  }
}

function saveStatisticToStorage(statObject) {
  window.localStorage.statistic = JSON.stringify(statObject);
}

function getStatisticFromStorage() {
  const stats = window.localStorage.statistic;
  return stats ? JSON.parse(window.localStorage.statistic) : initStatisticStorage();
}

function initStatisticStorage() {
  return [];
}

// recognition listeners
btnSpeakPlease.addEventListener('click', startGame);

btnReset.addEventListener('click', resetGame);

recognition.addEventListener('result', (event)  => {
  let recognized = event.results[0][0].transcript.toLowerCase();
  mainTranslate.textContent = recognized;
  compareAnswer(recognized);
});

recognition.addEventListener('end', () => {
  gameStarted && recognition.start();
});

// TODO:
//  На странице с результатом есть кнопки, позволяющие вернуться к предыдущей
//  игре или запустить новую игру с новым набором слов

export {startApp, showMainScreen, getTranslation} ;

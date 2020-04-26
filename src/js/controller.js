import Card from './card';

const restApi = 'https://afternoon-falls-25894.herokuapp.com/words?';
const dataUrl = 'https://raw.githubusercontent.com/irinainina/rslang/rslang-data/data/';
const mainScreen = document.querySelector('.main');
const enterScreen = document.querySelector('.enter-screen');
const resultsScreen = document.querySelector('.results');
const mainPicture = document.querySelector('.img');
const mainTranslate = document.querySelector('.central-screen__translation');
const difficultLevel = document.querySelector('.level');
const btnSpeakPlease = document.querySelector('.button__speak-please');
const btnReset = document.querySelector('.button__reset');
const btnResult = document.querySelector('.button__result');
const btnNewGame = document.querySelector('.results__new-game-btn');

const gameScore = document.querySelector('.game-score');


let currentPage = 0;
let cards = {};
let currentDataCards = [];
let gameStarted = false;
let result = 0;
let successCards = [];

difficultLevel.addEventListener('click', changeLevel);
btnResult.addEventListener('click', showResults);
btnNewGame.addEventListener('click', startApp);

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
  removeActiveFromAllCards();
  event.currentTarget.classList.add('active');
  event.currentTarget.querySelector('audio').play();
  changeMainPicture(event.currentTarget.dataset.image);
  changeTranslation(event.currentTarget.dataset.word);
  // TODO: добавляем в статистику или куда там надо
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
  speechRecognition();
  showMainScreen();
}

function compareAnswer(answer) {
  const currentCardIndex = cards.indexOf(answer.toLowerCase());
  // console.log(currentCardIndex);
  if (currentCardIndex === -1) {
    console.log('Wrong answer');
  } else {
    addActiveToElement(currentCardIndex);
    changeMainPicture(currentDataCards[currentCardIndex].image);
    increaseResult(currentCardIndex);
    addToSuccessCardsArr(currentCardIndex);
  }
}

function addToSuccessCardsArr(index) {
  successCards.push(currentDataCards.splice(index, 1)[0]);
}

function addActiveToElement(elemId) {
  const card = document.querySelectorAll('.card')[elemId];
  card.classList.add('active');
}

function removeActiveFromAllCards() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => card.classList.remove('active'));
}

function speechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  btnSpeakPlease.onclick = function() {
    recognition.start();
    removeActiveFromAllCards();
    console.log('Ready to receive a color command.');
    gameStarted = true;
  };

  recognition.addEventListener('result', (event)  => {
    let recognized = event.results[0][0].transcript;
    mainTranslate.textContent = recognized;
    compareAnswer(recognized);
    // console.log(recognized);
  });

  recognition.addEventListener('end', () => recognition.start());

  btnReset.addEventListener('click', () => recognition.abort())
}

function increaseResult(itemIndex) {
  result++;
  addSmileToScore();
}

function addSmileToScore() {
  const icon = '<i class="material-icons md-dark md-36">mood</i>';
  gameScore.insertAdjacentHTML('beforeend', icon);
}

function showResults() {
  createResultsTable();
  mainScreen.classList.add('hide');
  resultsScreen.classList.remove('hide');
}

function createResultsTable() {
  document.querySelector('.errors__counter').textContent = `${currentDataCards.length}`;
  document.querySelector('.success__counter').textContent = `${successCards.length}`;

  const errorCards = document.createElement('ul');
  errorCards.classList.add('error__cards');

  currentDataCards.forEach((card) => {
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

// TODO: у пользователя есть возможность просмотреть результат игры.
//  Также результат отображается, если все слова распознаны верно.
//  На странице с результатом есть кнопки, позволяющие вернуться к предыдущей
//  игре или запустить новую игру с новым набором слов

// TODO: на странице результата игры отображаются правильно угаданные слова и слова,
//  в которых были допущены ошибки. Возле каждого слова отображаются его транскрипция,
//  перевод, иконка аудио. По клику по слову звучит его произношение

export {startApp, showMainScreen, getTranslation} ;

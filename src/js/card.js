import {getTranslation} from  './controller';

class Card {
  constructor(word, image, audio, transcription) {
    this.word = word;
    this.image = image;
    this.audio = audio;
    this.transcription = transcription;
    this.dataUrl = 'https://raw.githubusercontent.com/irinainina/rslang/rslang-data/data/';

  }

  renderCardMainField() {
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.image = this.image;
    card.dataset.word = this.word;
    card.innerHTML = `<span class="card__audio-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="currentColor"
          d="M15.788 13.007a3 3 0 110 5.985c.571 3.312 2.064 5.675 3.815 5.675 2.244 0 4.064-3.88 4.064-8.667 0-4.786-1.82-8.667-4.064-8.667-1.751 0-3.244 2.363-3.815 5.674zM19 26c-3.314 0-12-4.144-12-10S15.686 6 19 6s6 4.477 6 10-2.686 10-6 10z"
          fill-rule="evenodd"></path></svg>
      </span>
      <p class="card__word">${this.word.toLowerCase()}</p>
      <p class="card__transcription">${this.transcription}</p>
      <audio src="${this.dataUrl}${this.audio}"></audio>`;
    return card;
  }

  renderCardResults() {
    const card = document.createElement('li');
    card.classList.add('result__card');
    // card.dataset.image = this.image;
    // this.translate;
    // getTranslation(this.word)
    //   .then((translation) => this.translate = translation);
    card.dataset.word = this.word;
    card.innerHTML = `
          <span class="result-card__audio-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="currentColor"
                                                                              d="M15.788 13.007a3 3 0 110 5.985c.571 3.312 2.064 5.675 3.815 5.675 2.244 0 4.064-3.88 4.064-8.667 0-4.786-1.82-8.667-4.064-8.667-1.751 0-3.244 2.363-3.815 5.674zM19 26c-3.314 0-12-4.144-12-10S15.686 6 19 6s6 4.477 6 10-2.686 10-6 10z"
                                                                              fill-rule="evenodd"></path></svg>
          </span>
          <span class="result-card__word">${this.word.toLowerCase()}</span>
          <span class="result-card__transcription">${this.transcription}</span>
          <span class="result-card__translation"></span>
      <audio src="${this.dataUrl}${this.audio}"></audio>`;
    return card;
  }
}

export default Card;


// [{
//   'word': 'analogous',
//   'image': 'files/30_3581.jpg',
//   'audio': 'files/30_3581.mp3',
//   'audioMeaning': 'files/30_3581_meaning.mp3',
//   'audioExample': 'files/30_3581_example.mp3',
//   'textMeaning': 'If something is <i>analogous</i> to another thing, then it is like it in certain ways.',
//   'textExample': 'The relationship with his teacher was <b>analogous</b> to that of a son and mother.',
//   'transcription': '[ənǽləgəs]'
// },



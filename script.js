document.addEventListener('DOMContentLoaded', init);

async function init() {
  const response = await fetch('data.json');
  const data = await response.json();

  // Přidat klíč parent ke každé otázce
  addParentKeyToQuestions(data);

  populateCategorySelect(data);
  document.getElementById('category').addEventListener('change', () => populateItemSelect(data));
}

function addParentKeyToQuestions(data) {
  for (const category in data) {
    for (const item in data[category]) {
      data[category][item].forEach(question => {
        question.parent = item;
      });
    }
  }
}

function populateCategorySelect(data) {
  const categorySelect = document.getElementById('category');
  categorySelect.innerHTML = ''; // Vyčistit select

  for (const category in data) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category.toUpperCase();
    categorySelect.appendChild(option);
  }

  populateItemSelect(data); // Načíst položky pro první kategorii
}

function populateItemSelect(data) {
  const category = document.getElementById('category').value;
  const itemSelect = document.getElementById('item');
  itemSelect.innerHTML = ''; // Vyčistit select

  for (const item in data[category]) {
    const option = document.createElement('option');
    option.value = item;
    option.textContent = item;
    itemSelect.appendChild(option);
  }
}

document.getElementById('start').addEventListener('click', startQuiz);

let currentQuestionIndex = 0;
let questions = [];
let correctCount = 0;
let incorrectCount = 0;
let currentCategory = '';
let currentItem = '';
let useAllItems = false;

async function startQuiz() {
  currentCategory = document.getElementById('category').value;
  currentItem = document.getElementById('item').value;
  useAllItems = document.getElementById('allItems').checked;

  // Reset počítadel
  correctCount = 0;
  incorrectCount = 0;
  document.getElementById('correctCount').textContent = correctCount;
  document.getElementById('incorrectCount').textContent = incorrectCount;

  const response = await fetch('data.json');
  const data = await response.json();

  if (useAllItems) {
    // Použít všechny otázky z dané kategorie
    questions = [];
    for (const item in data[currentCategory]) {
      data[currentCategory][item].forEach(question => {
        questions.push({ ...question, parent: item });
      });
    }
  } else {
    // Použít otázky pouze z vybrané položky
    questions = data[currentCategory][currentItem].map(question => ({ ...question, parent: currentItem }));
  }

  document.getElementById('questionCount').textContent = questions.length;

  questions = shuffleArray(questions);

  currentQuestionIndex = 0;
  showQuestion();
}

function showQuestion() {
  const quizDiv = document.getElementById('quiz');
  quizDiv.innerHTML = '';

  if (currentQuestionIndex >= questions.length) {
    quizDiv.innerHTML = '<h2>Hotovo!</h2>';
    return;
  }

  const questionObj = questions[currentQuestionIndex];
  const shuffledAnswers = shuffleArray([...questionObj.answers]);

  const parentElement = document.createElement('h2');
  parentElement.textContent = questionObj.parent;
  quizDiv.appendChild(parentElement);

  const questionElement = document.createElement('h3');
  questionElement.textContent = questionObj.question;
  quizDiv.appendChild(questionElement);

  shuffledAnswers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.textContent = answer;
    button.classList.add("answer");
    button.addEventListener('click', () => checkAnswer(answer, questionObj));
    quizDiv.appendChild(button);
  });
}

function checkAnswer(selectedAnswer, questionObj) {
  const correctAnswer = questionObj.answers[0];
  const buttons = document.querySelectorAll('#quiz button.answer');
  const feedbackDiv = document.getElementById('feedback');
  feedbackDiv.innerHTML = '';

  const feedbackHr = document.createElement('hr');
  feedbackDiv.appendChild(feedbackHr);

  const questionFeedback = document.createElement('h2');
  questionFeedback.classList.add('feedbackQuestion');
  questionFeedback.textContent = questionObj.question;
  feedbackDiv.appendChild(questionFeedback);

  if (selectedAnswer === correctAnswer) {
    correctCount++;
    const correctFeedback = document.createElement('p');
    correctFeedback.classList.add('correct');
    correctFeedback.textContent = correctAnswer;
    feedbackDiv.appendChild(correctFeedback);
  } else {
    incorrectCount++;
    const incorrectFeedback = document.createElement('p');
    incorrectFeedback.classList.add('incorrect');
    incorrectFeedback.textContent = selectedAnswer;
    feedbackDiv.appendChild(incorrectFeedback);

    const correctFeedback = document.createElement('p');
    correctFeedback.classList.add('correct');
    correctFeedback.textContent = correctAnswer;
    feedbackDiv.appendChild(correctFeedback);
  }

  buttons.forEach(button => {
    if (button.textContent === correctAnswer) {
      button.classList.add('correct');
    } else if (button.textContent === selectedAnswer) {
      button.classList.add('incorrect');
    }
    button.disabled = true;
  });

  document.getElementById('correctCount').textContent = correctCount;
  document.getElementById('incorrectCount').textContent = incorrectCount;

  scrollToEnd();

  setTimeout(() => {
    currentQuestionIndex++;
    showQuestion();
  }, 1400);
}

function scrollToEnd() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

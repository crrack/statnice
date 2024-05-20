document.addEventListener('DOMContentLoaded', init);

async function init() {
  const response = await fetch('data.json');
  const data = await response.json();

  populateCategorySelect(data);
  document.getElementById('category').addEventListener('change', () => populateItemSelect(data));
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

async function startQuiz() {
  const category = document.getElementById('category').value;
  const item = document.getElementById('item').value;

  // Reset počítadel
  correctCount = 0;
  incorrectCount = 0;
  document.getElementById('correctCount').textContent = correctCount;
  document.getElementById('incorrectCount').textContent = incorrectCount;

  const response = await fetch('data.json');
  const data = await response.json();

  questions = data[category][item];
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

  const questionElement = document.createElement('h3');
  questionElement.textContent = questionObj.question;
  quizDiv.appendChild(questionElement);

  shuffledAnswers.forEach((answer, index) => {
    const button = document.createElement('button');
    button.textContent = answer;
    button.classList.add("answer");
    button.addEventListener('click', () => checkAnswer(answer, questionObj.answers[0]));
    quizDiv.appendChild(button);
  });
}

function checkAnswer(selectedAnswer, correctAnswer) {
  const buttons = document.querySelectorAll('#quiz button');
  buttons.forEach(button => {
    if (button.textContent === correctAnswer) {
      button.classList.add('correct');
      if (button.textContent === selectedAnswer) correctCount++;
    } else if (button.textContent === selectedAnswer) {
      button.classList.add('incorrect');
      incorrectCount++;
    }
    button.disabled = true;
  });

  document.getElementById('correctCount').textContent = correctCount;
  document.getElementById('incorrectCount').textContent = incorrectCount;

  setTimeout(() => {
    currentQuestionIndex++;
    showQuestion();
  }, 1300);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
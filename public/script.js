let socket = io()

let your_name = undefined;
let opponent_name = undefined
let room_number = undefined;
let questionNumber = 1;
let questionsData = undefined;
let questionsAmount = undefined;
let your_score = 0;
let opponent_score = 0;
let answered = false;
let opponent_answered = false;

document.querySelector('#play_button').addEventListener('click',signInUser)
set_container_section('home_container');

function set_container_section(container) {
  document.querySelector('#home_container').style.display = 'none';
  document.querySelector('#game_container').style.display = 'none';
  document.querySelector('#disconnected_container').style.display = 'none';
  document.querySelector('#results_container').style.display = 'none';
  document.querySelector('#'+container).style.display = 'inherit';
}

socket.emit('get_free_room_number_suggestion');

socket.on('get_free_room_number_suggestion', (free_room_number) => {
  document.querySelector('#free_room_number_suggestion').textContent = 'Free room number suggestion: ' + free_room_number;
});

function signInUser() {
  your_name = document.querySelector('#name').value;
  room_number = document.querySelector('#room_number').value;
  if (your_name == '') {
    document.querySelector('#invalid_name_message').style.display = 'inherit';
  }
  else {
    document.querySelector('#invalid_name_message').style.display = 'none';
  }
  if (room_number == '') {
    document.querySelector('#invalid_room_number_message').style.display = 'inherit';
  }
  else {
    document.querySelector('#invalid_room_number_message').style.display = 'none';
  }
  if (your_name != '' && room_number != '') {
    document.querySelector('#room_is_full_message').style.display = 'none';
    document.querySelector('#play_button').style.display = 'none';
    document.querySelector('#wait_for_opponent_join_room').style.display = 'inherit';
    socket.emit('connected',{'name':your_name},room_number);
  }
}

socket.on('start_game', () => {
  set_container_section('game_container');
  socket.emit('fetchQuestions',room_number)
  document.querySelector('#your_name').textContent = your_name;
  socket.emit('set_opponent_name',your_name,room_number);
});
socket.on('set_opponent_name', (name) => {
  opponent_name = name;
  document.querySelector('#opponent_name').textContent = opponent_name;
});

function renderQuestion(questionData) {
  document.querySelector('#questionCounter').textContent = 'Question ' + questionNumber.toString() + '/' + questionsAmount.toString();
  let questionImage = questionData['questionImage'];
  let question = questionData['question'];
  let answerOptionA = questionData['answerOptionA'];
  let answerOptionB = questionData['answerOptionB'];
  let answerOptionC = questionData['answerOptionC'];
  let answerOptionD = questionData['answerOptionD'];
  document.querySelector('#questionImage').src = questionImage;
  document.querySelector('#question').textContent = question;
  document.querySelectorAll('.answerOptionText')[0].textContent = answerOptionA;
  document.querySelectorAll('.answerOptionText')[1].textContent = answerOptionB;
  document.querySelectorAll('.answerOptionText')[2].textContent = answerOptionC;
  document.querySelectorAll('.answerOptionText')[3].textContent = answerOptionD;
  // Resetting all values for new quetion
  for (let idx=0; idx<4; idx++) {
    document.querySelectorAll('.symbol')[idx].textContent = ''
  }
  document.querySelector('#opponent_answered_text').style.display = 'none';
  document.querySelector('#opponent_answered_text').style.animationName = 'waitingForOpponentColor';
  document.querySelector('#opponent_answered_text').textContent = "Wait for the opponent's guess...";

}

socket.on('receiveFetchedQuestion', data => {
  questionsData = data;
  questionsAmount = Object.keys(data).length;
  console.log(questionsData)
  correctAnswer = questionsData[questionNumber-1]['correctAnswer'];
  renderQuestion(questionsData[questionNumber-1])
});

socket.on('disconnected', () => {
  // Reset all the variables
  your_name = undefined;
  opponent_name = undefined
  room_number = undefined;
  questionNumber = 1;
  questionsData = undefined;
  questionsAmount = undefined;
  your_score = 0;
  opponent_score = 0;
  answered = false;
  opponent_answered = false;
  set_container_section('disconnected_container');
})

// socket.on('connected', (data) => {
//   console.log(data)
// })
socket.on('room_is_full', (room_number) => {
  let room_is_full_element = document.querySelector('#room_is_full_message');
  room_is_full_element.style.display = 'inherit';
  room_is_full_element.textContent = 'Room ' + room_number.toString() + ' is already full!';
  document.querySelector('#wait_for_opponent_join_room').style.display = 'none';
  document.querySelector('#play_button').style.display = 'inherit';
})

function updateScore() {
  document.querySelector('#current_score').textContent = your_score.toString() + '-' + opponent_score.toString();
}

document.querySelector('.answerOptionsList').addEventListener('click', e => {
  let data_id = e.target.parentNode.dataset.id;
  if (typeof(data_id) != 'undefined') {
    let id_to_letter = {0:'A',1:'B',2:'C',3:'D'};
    let letter_to_id = {'A':0,'B':1,'C':2,'D':3};
    let inputAnswer = id_to_letter[data_id];
    if (answered == false) {
      socket.emit('clickAnswer', {'name':your_name,'inputAnswer':inputAnswer},room_number);
      document.querySelector('#opponent_answered_text').style.display = 'inherit';
      answered = true;
      if (inputAnswer == correctAnswer) {
        let symbol_element_clicked = document.querySelectorAll('.symbol')[data_id];
        symbol_element_clicked.textContent = '✔';
        symbol_element_clicked.style.color = '#0d0';
        your_score += 1;
        updateScore();
      }
      else {
        let symbol_element_clicked = document.querySelectorAll('.symbol')[data_id];
        symbol_element_clicked.textContent = '✘';
        symbol_element_clicked.style.color = '#d00';
        let correctAnswer_id = letter_to_id[correctAnswer];
        let symbol_element_correct = document.querySelectorAll('.symbol')[correctAnswer_id];
        symbol_element_correct.textContent = '✔';
        symbol_element_correct.style.color = '#0d0';
      }
      if (opponent_answered == true) {
        goToNextQuestion()
      }
    }
  }
})

socket.on('clickAnswer', (data) => {
  let opponent_answered_text = document.querySelector('#opponent_answered_text');
  opponent_answered_text.style.display = 'inherit'
  opponent_answered_text.style.color = 'black';
  document.querySelector('#opponent_answered_text').style.animationName = 'none';
  
  if (data['inputAnswer'] == correctAnswer) {
    opponent_answered_text.innerHTML = data['name'] + ' answered this question <span style="color:#0d0">correctly</span>!';
    opponent_score += 1;
  }
  else {
    opponent_answered_text.innerHTML = data['name'] + ' answered this question <span style="color:#d00">incorrectly</span>!';
  }
  opponent_answered = true;
  updateScore();

  if (answered == true) {
    goToNextQuestion()
  }
});

function goToNextQuestion() {
  setTimeout(function() {
    if (questionNumber == questionsAmount) {
      set_container_section('results_container');
      document.querySelector('#result_your_name').textContent = your_name;
      document.querySelector('#result_your_final_score').textContent = your_score;
      document.querySelector('#result_opponent_name').textContent = opponent_name;
      document.querySelector('#result_opponent_final_score').textContent = opponent_score;
      if (your_score > opponent_score) {
        document.querySelector('#result_text').style.color = '#0d0';
        document.querySelector('#result_text').textContent = 'Your are the champion!';
      }
      else if (your_score == opponent_score) {
        document.querySelector('#result_text').style.color = 'grey';
        document.querySelector('#result_text').textContent = "It's a tie!";
      }
      else {
        document.querySelector('#result_text').style.color = '#d00';
        document.querySelector('#result_text').textContent = opponent_name + " is the winner!";
      }
    }
    else {
      answered = false;
      opponent_answered = false;
      questionNumber += 1;
      correctAnswer = questionsData[questionNumber-1]['correctAnswer'];
      renderQuestion(questionsData[questionNumber-1]);
    }
  }, 3000);
}

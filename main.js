const express = require('express')
const app = express()
const http = require('http').createServer(app)
const path = require('path')
const io = require('socket.io')(http)
const port = process.env.PORT || 8000
const fetch = (...e)=>import("node-fetch").then(({default:t})=>t(...e))
const env = require('dotenv').config().parsed;

app.use(express.static(path.resolve('public')))

// The realtime users database that runs on the server
let users_data = {}
  
function generateStadiumQuestion(data) {
  let countries = ['Netherlands','Belgium','Austria','England','Germany','Italy','Spain','France','Portugal','Turkey']; // Ik heb een paar bekende landen gedefinieerd, zodat er geen vragen gegenereerd worden over onbekendere teams die bijvoorbeeld in de eerste voorronde van de CL werden uitgeschakeld.
  let all_stadiums = [];
  let all_teams = [];
  let all_logo_images = [];
  data['teams'].forEach((data_piece) => {
    let team = data_piece['name'];
    let team_country = data_piece['area']['name'];
    if (countries.includes(team_country)) {
      let stadium = data_piece['venue'];
      all_stadiums.push(stadium);
      all_teams.push(team);
      all_logo_images.push(data_piece['crestUrl'])
    }
  })

  const correct_stadium_idx = Math.floor(Math.random()*4); // 4 staat voor de vier antwoordopties A, B, C en D
  const team_idx = Math.floor(Math.random()*all_teams.length)
  const correct_team = all_teams[team_idx];
  const correct_stadium = all_stadiums[team_idx];
  all_stadiums.splice(all_stadiums.indexOf(correct_stadium),1);
  let stadium_options = []
  for (let idx=0; idx<4; idx++) { // Zelfde geldt voor deze 4
    let stadium = '';
    if (idx == correct_stadium_idx) {
      stadium = correct_stadium;
    }
    else {
      stadium = all_stadiums[Math.floor(Math.random()*all_stadiums.length)];
    }
    stadium_options.push(stadium);
    all_stadiums.splice(all_stadiums.indexOf(stadium),1);
  }

  let id_to_letter = {0:'A',1:'B',2:'C',3:'D'};
  let correctAnswerLetter = id_to_letter[correct_stadium_idx];
  let questionImageSrc = all_logo_images[team_idx];
  questionData = {'team':correct_team,'questionImage':questionImageSrc,'question':'What is the name of the stadium of football club ' + correct_team + '?','answerOptionA':stadium_options[0],'answerOptionB':stadium_options[1],'answerOptionC':stadium_options[2],'answerOptionD':stadium_options[3],'correctAnswer':correctAnswerLetter}

  return questionData;
}

function isRoomFull(room_number_to_check) {
  let room_number_count = 0;
  let user_id_list = Object.keys(users_data);
  user_id_list.forEach((user_id) => {
    let room_number = users_data[user_id]['room_number'];
    if (room_number == room_number_to_check) {
      room_number_count += 1;
    }
  })
  if (room_number_count == 2) {
    return true
  }
  return false
}

io.on('connection', (socket) => {
    socket.on('connected', (data,room_number) => {
      if (isRoomFull(room_number) == false) { // Check of er nog plaats is in een bepaalde room nadat een nieuwe client in die room wil aanmelden.
        socket.join(room_number)
        let name = data['name'];
        users_data[socket.id] = {'room_number':room_number,'name':name}; // Meld de nieuwe gebruiker aan.
        console.log(socket.id,'connected')
        console.log(users_data)
        console.log('Users count: ', Object.keys(users_data).length)
        if (isRoomFull(room_number)) { // Als de room gevuld is nadat een client in die room is aangemeld, begint het spel.
          io.to(room_number).emit('start_game')
        }
      }
      else { // Als de room al wel vol is, geef de gebruiker een melding dat die vol is.
        io.to(socket.id).emit('room_is_full', room_number);
      }
      console.log('')
      console.log('')
    });

    socket.on('get_free_room_number_suggestion', () => {
      let full_room_numbers_list = [];
      Object.keys(users_data).forEach((user_id) => {
        full_room_numbers_list.push(parseInt(users_data[user_id]['room_number']))
      })
      let free_room_numbers_list = [];
      for (let free_number=1; free_number<1000; free_number++) {
        if (full_room_numbers_list.includes(free_number) == false) {
          free_room_numbers_list.push(free_number);
        }
      }
      const free_room_number = free_room_numbers_list[Math.floor(Math.random()*free_room_numbers_list.length)];
      io.to(socket.id).emit('get_free_room_number_suggestion',free_room_number)
    });

    socket.on('disconnect', () => {
      if (Object.keys(users_data).includes(socket.id)) {
        let room_number = users_data[socket.id]['room_number'];
        let opponent_socket_list = Object.keys(users_data).filter(function(key) {
          return users_data[key]['room_number'] === room_number && key != socket.id;
        });
        let opponent_socket = opponent_socket_list[0];
        socket.broadcast.to(room_number).emit('disconnected'); // Laat de andere gebruiker weten dat de tegenstander gedisconnect is.
        delete users_data[socket.id]; // Verwijder beide spelers uit de real-time database op de server.
        delete users_data[opponent_socket];
        console.log(socket.id,'disconnected')
        console.log(users_data)
        console.log('Users count: ', Object.keys(users_data).length)
        console.log('')
        console.log('') 
      }
    });

    socket.on('set_opponent_name', (name,room_number) => {
      socket.broadcast.to(room_number).emit('set_opponent_name',name);
    });

    socket.on('fetchQuestions', (room_number) => {
      const url = "https://api.football-data.org/v2/competitions/CL/teams";
      const questionsData = {}
      const questionsAmount = 10; // Er worden 10 vragen gegenereerd
      fetch(url, {
          method: "GET",
          withCredentials: true,
          mode: 'cors',
          headers: {
            "X-Auth-Token": process.env.API_KEY
          }
        })
          .then(response => response.json())
          .then(function(data) {
            let teams_with_question = []; // Zorg ervoor dat er niet twee vragen over hetzelfde team worden gegenereerd;
            let questionsGeneratedCounter = 0;
            while (questionsGeneratedCounter < questionsAmount) {
              let generatedQuestion = generateStadiumQuestion(data);
              if (teams_with_question.includes(generatedQuestion['team']) == false) {
                questionsData[questionsGeneratedCounter] = generatedQuestion;
                questionsGeneratedCounter += 1;
                teams_with_question.push(generatedQuestion['team'])
              }
            }
            io.to(room_number).emit('receiveFetchedQuestion', questionsData); // Verstuur de gegenereerde quizvragen naar beide spelers in dezelfde room.
          })
          .catch(function(error) {
            console.log(error);
          });
        });

    socket.on('clickAnswer', (data,room_number) => {
        let name = data['name'];
        let inputAnswer = data['inputAnswer'];
        socket.broadcast.to(room_number).emit('clickAnswer',{'name':name,'inputAnswer':inputAnswer}); // Verstuur ingevoerde antwoordopties naar de tegenstander.
    });
})

http.listen(port, () => {
    console.log('listening on port ', port)
})
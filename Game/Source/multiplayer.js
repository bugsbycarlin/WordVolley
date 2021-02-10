
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Multiplayer {
  constructor(game) {
    this.database = firebase.database();
    this.game = game;
  }


  generateGameCode() {
    
    var name = "";
    for (var i = 0; i < 5; i++) {
      name += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

    }
    return name;
  }


  createNewGame(callback, tries_left = 0) {
    var self = this;
    var game_code = this.generateGameCode();

    var time_limits = {
      0: 5,
      1: 10,
      2: 20,
      3: 30,
      4: 60,
      5: 300,
      6: -1
    };
    var word_sizes = {
      0: 4,
      1: 5,
      2: 6,
      3: 7,
      4: 1,
    };

    game.state = {
      player_1_present: true,
      player_2_present: false, 
      player_1_character: "A",
      player_2_character: "B",
      player_1_name: "ALFIE",
      player_2_name: "BERT",
      player_1_score: 0,
      player_2_score: 0,
      player_1_ready: false,
      player_2_ready: false,
      time_limit: time_limits[this.game.time_limit_choice] + 1, // one second to make it nicer
      word_size: word_sizes[this.game.word_size_choice],
      live_word: "",
      origin: "",
      target: "",
      volley: "",
      turn: 1,
      volley_state: "none",
    };

    this.database.ref("/games/" + game_code).set(game.state, (error) => {
      if (error) {
        console.log("Failed to create game " + game_code + " on try number " + tries_left);
        console.log(error);
        if (tries_left > 0) {
          self.createNewGame(callback, tries_left - 1)
        } else {
          self.game.showAlert("Sorry! I could't\nmake a game.\nPlease try later.", function() {});
        }
      } else {
        console.log("Created game " + game_code)
        self.game.game_code = game_code;
        callback();
      }
    });
  }


  joinGame(game_code, yes_callback, no_callback) {
    var self = this;
    this.database.ref("/games/" + game_code).once("value").then((result) => {
      if (result.exists()) {
        self.game.game_code = game_code;
        this.database.ref("games/" + game_code).update({
          player_2_present: true,
        }, (error) => {
          if (error) {
            console.log("Could not join game " + game_code);
            no_callback();
          } else {
            console.log("Managed to join game " + game_code);
            this.database.ref("/games/" + game_code).once("value").then((result) => {
              self.game.state = result.val();
              yes_callback();
            });
          }
        });
      } else {
        console.log("Could not find game " + game_code);
        no_callback();
      }
    });
  }


  setWatch() {
    var ref_state_change = this.database.ref("games/" + game.game_code);
    ref_state_change.on("value", (snapshot) => {game.updateFromMulti(snapshot)});
  }


  leaveGame(code, player) {
    if (player == 1) {
      console.log("Player 1 leaving the game");
      this.database.ref("games/" + code).update({player_1_present: false});
    } else if (player == 2) {
      console.log("Player 2 leaving the game");
      this.database.ref("games/" + code).update({player_2_present: false});
    } 
  }


  update(sheet) {
    this.database.ref("games/" + this.game.game_code).update(sheet);
  }
}
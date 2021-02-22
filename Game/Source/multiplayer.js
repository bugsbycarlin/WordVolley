
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


  createNewGame(game_type, tries_left, callback) {
    var self = this;
    var game_code = this.generateGameCode();

    // Quick play defaults
    var word_size = 4;
    var time_limit = 10; // 10, 5 for fast testing

    var type = game.choices["GAME TYPE"];
    var difficulty = game.choices["DIFFICULTY"];

    if (type == "COMPETITIVE") {
      game_type = "code_comp";
      if (difficulty == "EASY") {
        word_size = 4;
        time_limit = 10;
      } else if (difficulty == "MEDIUM") {
        word_size = 1;
        time_limit = 20;
      } else if (difficulty == "HARD") {
        word_size = 7;
        time_limit = 20;
      }
    } else if (type == "COOPERATIVE") {
      game_type = "code_coop";

      if (difficulty == "EASY") {
        word_size = 4;
        time_limit = 120; // 120, 30 for fast testing
      } else if (difficulty == "MEDIUM") {
        word_size = 1;
        time_limit = 60;
      } else if (difficulty == "HARD") {
        word_size = 7;
        time_limit = 60;
      }
    }


    game.state = {
      game_type: game_type,
      player_1_state: "joined",
      player_2_state: "empty", 
      player_1_name: "ALFIE",
      player_2_name: "BERT",
      player_1_score: 0,
      player_2_score: 0,
      time_limit: time_limit + 1, // one second to make it nicer
      word_size: word_size,
      live_word: "",
      origin: "",
      target: "",
      volley: "",
      turn: 1,
      volley_state: "none",
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    };
    console.log(game.state);

    this.database.ref("/games/" + game_code).set(game.state, (error) => {
      if (error) {
        console.log("Failed to create game " + game_code + " on try number " + tries_left);
        console.log(error);
        if (tries_left > 0) {
          self.createNewGame(game_type, tries_left - 1, callback)
        } else {
          self.game.showAlert("Sorry! I could'nt make\na game. Please try later.", function() {});
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
          player_2_state: "joined",
        }, (error) => {
          if (error) {
            console.log("Could not join game " + game_code);
            no_callback();
          } else {
            console.log("Managed to join game " + game_code);
            this.database.ref("/games/" + game_code).once("value").then((result) => {
              self.game.state = result.val();
              if (self.game.state.game_type == "quick_open") {
                self.update({game_type: "quick_closed"})
              }
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


  watchGame(game_code, yes_callback, no_callback) {
    var self = this;
    this.database.ref("/games/" + game_code).once("value").then((result) => {
      if (result.exists()) {
        self.game.game_code = game_code;
        self.database.ref("/games/" + game_code).once("value").then((result) => {
          self.game.state = result.val();
          if (self.game.state.game_type == "quick_open") {
            self.update({game_type: "quick_closed"})
          }
          yes_callback();
        });
      } else {
        console.log("Could not find game " + game_code);
        no_callback();
      }
    });
  }


//.orderByChild("game_type").equalTo("quick_open")
  quickPlayGame(tries_left, yes_callback, no_callback) {
    var self = this;
    this.database.ref().child("games").orderByChild("game_type").equalTo("quick_open").limitToLast(20).once("value").then((result) => {
      console.log(result);
      if (result.exists()) {
        self.game.player = 2;
        console.log("Found quick play games to join.");
        var game_codes = Object.keys(result.val());
        console.log(game_codes);
        var game_code = game_codes[Math.floor(Math.random() * game_codes.length)];
        console.log(game_code);
        self.joinGame(game_code, yes_callback, function() {
          if (tries_left > 0) {
            self.quickPlayGame(tries_left - 1, yes_callback, no_callback);
          } else {
            no_callback();
          }
        })
      } else {
        console.log("Found no quick play games to join. Must create one.");
        // no_callback();
        self.choices = {
          "GAME_TYPE": "",
          "DIFFICULTY": "",
        };
        self.game.player = 1;
        self.createNewGame("quick_open", 2, yes_callback)
      }
    });

  }


  setWatch() {
    this.ref_state_change = this.database.ref("games/" + game.game_code);
    this.watch = this.ref_state_change.on("value", (snapshot) => {game.updateFromMulti(snapshot)});
  }


  stopWatch() {
    if (this.watch) {
      this.ref_state_change.off("value", this.watch);
      this.watch = null;
    }
  }


  finishGame(code, player, winner) {
    var sheet = {}

    if (this.game.state.game_type != "code_coop") {
      if (player == 1 && player == winner) {
        sheet["player_1_state"] = "win";
        sheet["player_2_state"] = "ended";
        sheet["volley_state"] = "ended";
      } else if (player == 2 && player == winner) {
        sheet["player_2_state"] = "win";
        sheet["player_1_state"] = "ended";
        sheet["volley_state"] = "ended";
      }
      // } else if (player == 1) {
      //   sheet["player_1_state"] = "ended";
      // } else if (player == 2) {
      //   sheet["player_2_state"] = "ended";
      // }
      if (this.game.state.game_type == "quick_open") {
        sheet["game_type"] = "quick_closed";
      }
    } else {
      sheet["player_2_state"] = "ended";
      sheet["player_1_state"] = "ended";
      sheet["volley_state"] = "changeywee";
    }
    console.log(sheet);
    console.log(code);

    this.database.ref("games/" + code).update(sheet);
  }


  leaveGame(code, player) {
    var sheet = {}
    if (player == 1) {
      console.log("Player 1 leaving the game");
      sheet["player_1_state"] = "quit";
    } else if (player == 2) {
      console.log("Player 2 leaving the game");
      sheet["player_2_state"] = "quit";
    }
    if (this.game.state.game_type == "quick_open") {
      sheet["game_type"] = "quick_closed";
    }
    this.database.ref("games/" + code).update(sheet);
  }


  update(sheet) {
    this.database.ref("games/" + this.game.game_code).update(sheet);
  }

  googleSignIn() {
    var self = this;
    var provider = new firebase.auth.GoogleAuthProvider();
    console.log(provider);
    firebase.auth()
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */

        var credential = result.credential;
        var token = credential.accessToken;
        var user = result.user;

        self.game.auth_user = user;

        self.game.sign_in_button.disable();
        self.game.sign_in_button.visible = false;
        self.game.sign_out_button.enable();
        self.game.sign_out_button.visible = true;
        // ...
      }).catch((error) => {
        console.log("Error with google sign in!")
        console.log(error);
      });
  }

  anonymousSignIn(callback) {
    console.log("Using anonymous sign in");
    var self = this;
    firebase.auth().signInAnonymously()
      .then(() => {
        callback();
      })
      .catch((error) => {
        console.log("Error with anonymous sign in!")
        console.log(error);
      });

  }

  signOut() {
    var self = this;
    firebase.auth().signOut().then(() => {
      self.game.sign_out_button.disable();
      self.game.sign_out_button.visible = false;
      self.game.sign_in_button.enable();
      self.game.sign_in_button.visible = true;
      self.game.auth_user = null;
    }).catch((error) => {
      console.log("Error signing out!");
      console.log(error);
    });
  }
}
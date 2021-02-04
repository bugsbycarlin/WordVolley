
class Multiplayer {
  constructor(game) {
    this.database = firebase.database();
    this.game = game;


    var volleyRef = this.database.ref("games/ancha/volley");
    volleyRef.on("value", (snapshot) => {
      const data = snapshot.val();
      console.log("Updated volley");
      console.log(data);
      this.game.volley = data;
    });
  }

  generateGameName() {
    var characters = "abcdefghijklmnopqrstuvwxyz";
    var name = "";
    for (var i = 0; i < 5; i++) {
      name += characters.charAt(Math.floor(Math.random() * characters.length));

    }
    return name;
  }

  createGames() {
    console.log("doin it");
    this.database.ref("/games/glogs").set({
      player_1_present: true,
      player_2_present: true,
    }, (error) => {
      if (error) {
        console.log("oh no");
        console.log(error);
      } else {
        console.log("got it");
      }
    });
  }

  createNewGame(callback) {
    var self = this;
    var game_name = this.generateGameName();

    this.database.ref("/games/" + game_name).set({
      player_1_present: true,
      player_2_present: false, 
      player1_name: "",
      player2_name: "",
      player1_character: "",
      player2_character: "",
      player1_score: 0,
      player2_score: 0,
      origin: "",
      target: "",
      volley: "",
      turn: ""
    }, (error) => {
      if (error) {
        console.log("Failed to create game " + game_name);
        console.log(error);
      } else {
        console.log("Created game " + game_name)
        self.game_name = game_name;
        callback();
      }
    });
  }

  getState() {
    return this.database.ref("/games/ancha").once("value").then((result) => {
      // console.log("boom_bap");
      // console.log(result.val());
      // console.log(result.val().volley);
      // console.log(result.val().player_1_present);
      game.volley = result.val().volley;
    });
  }

  updateVolley(volley) {
    this.database.ref("games/ancha").update({
      volley: volley,
    });
  }
}
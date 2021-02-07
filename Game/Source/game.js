
pixi = null;

class Game {
  constructor() {

    var self = this;

    // TODO: dynamically choose width and height according to aspect ratio.
    // Should be either 1280x720 or 1280x960, according to device.
    // Browser and iphone are 1280x720, and ipad is 1280x960.
    this.width = 1280;
    this.height = 720;
    if (false) {
      this.height = 960;
      document.getElementById("mainDiv").style.height = 960;
      document.getElementById("mainDiv").style.marginTop = -480;
    }

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true});
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.backgroundColor = 0xFFFFFF;
    pixi.renderer.resize(this.width,this.height);

    this.multiplayer = new Multiplayer(this);

    this.initialize();
    this.resetTitle(); 

    // document.addEventListener("click", function(ev) {self.handleMouse(ev)}, false);

    this.current_scene = "title";

    setInterval(function() {self.update()},33);

    // setInterval(function() {
    //   console.log("Stat poll.")
    //   console.log("Player: " + self.player);
    //   console.log("Game code: " + self.game_code);
    //   console.log("Game state: ")
    //   console.log(self.state);
    // },3000);

    window.addEventListener("unload", function(ev) {
      if (self.game_code != "" && self.player > 0) {
        self.multiplayer.leaveGame(self.game_code, self.player)
      }
    })



    //this.scenes["title"].addChild(this.test_ball);
    // this.test_ball.position.set(this.width * 1/8, this.height * 1/3);
    // this.test_ball.addWord("hords");
    // this.test_ball.addWord("horns");
    // this.test_ball.addWord("morns");
    // this.test_ball.addWord("moons");


    // var round = function() {
    //   console.log("firing");
    //   self.test_ball.vy = -10;
    //   self.test_ball.vx = 48;

    //   setTimeout(function(){
    //     self.test_ball.vy = -10;
    //     self.test_ball.vx = -48;
    //   },3000);
    // }
    // setInterval(round,6000);
    // round();



  }


  initialize() {
    // create three containers: title, setup, and gameplay
    this.scenes = [];
    this.scenes["title"] = new PIXI.Container();
    this.scenes["setup_create"] = new PIXI.Container();
    this.scenes["setup_create"].position.x = this.width;
    this.scenes["setup_join"] = new PIXI.Container();
    this.scenes["setup_join"].position.x = this.width;
    this.scenes["lobby"] = new PIXI.Container();
    this.scenes["lobby"].position.x = this.width;
    this.scenes["volley"] = new PIXI.Container();
    this.scenes["volley"].position.x = 2 * this.width;
    pixi.stage.addChild(this.scenes["title"]);
    pixi.stage.addChild(this.scenes["setup_create"]);
    pixi.stage.addChild(this.scenes["setup_join"]);
    pixi.stage.addChild(this.scenes["lobby"]);
    pixi.stage.addChild(this.scenes["volley"]);


    this.scenes["title"].position.x = this.width;
    this.scenes["test"] = new PIXI.Container();
    pixi.stage.addChild(this.scenes["test"]);
    this.initializeTestScreen();


    this.alertBox = new PIXI.Container();
    pixi.stage.addChild(this.alertBox);

    this.initializeTitleScreen();
    // this.initializeSetupCreate();
    // this.initializeSetupJoin();
    this.initializeAlertBox();
  }


  createGame() {
    this.player = 1;

    var self = this;

    this.multiplayer.createNewGame(function() {
      console.log(self.state.player_1_character);
      self.resetSetupLobby();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.multiplayer.setWatches();

      self.animateSceneSwitch("setup_create", "lobby");
    }, 2)

  }


  joinGame(game_code) {
    this.player = 2;

    var self = this;

    this.multiplayer.joinGame(game_code, function() {
      self.resetSetupLobby();

      self.multiplayer.setWatches();

      self.animateSceneSwitch("setup_join", "lobby");
    }, function() {
      self.showAlert("Sorry, can't find\nthat game :-(", function() {

      })
    });
  }


  resetVolley() {
    // game.state = {
    //   player_1_present: true,
    //   player_2_present: false, 
    //   player_1_character: "A",
    //   player_2_character: "B",
    //   player_1_name: "ALFIE",
    //   player_2_name: "BERT",
    //   player_1_score: 0,
    //   player_2_score: 0,
    //   player_1_ready: false,
    //   player_2_ready: false,
    //   time_limit: time_limits[this.game.time_limit_choice],
    //   word_size: word_sizes[this.game.word_size_choice],
    //   origin: "",
    //   target: "",
    //   volley: "",
    //   turn: ""
    // };
    this.state.origin = "STEVE";
    this.state.target = "BRIAN";
    this.state.volley = "";
    this.state.turn = 1 + Math.floor(Math.random() * 2);
    this.multiplayer.update({
      origin: this.state.origin,
      target: this.state.target,
      volley: this.state.volley,
      turn: this.state.turn,
    });
  }


  startVolleying() {
    if (this.player == 1) {
      // some extra work to do to start the game
      this.resetVolley();
    }

    this.initializeVolleyScreen();
    this.animateSceneSwitch("lobby", "volley");
  }


  animateSceneSwitch(old_scene, new_scene) {
    // var old_scene = this.current_scene
    var direction = -1;
    if (new_scene == "title" || old_scene == "gameplay") direction = 1;
    this.scenes[new_scene].position.x = direction * -1 * this.width;
    for (var i = 0; i < this.scenes.length; i++) {
      if (this.scenes[i] == new_scene || this.scenes[i] == old_scene) {
        this.scenes[i].visible = true;
      } else {
        this.scenes[i].visible = false;
        this.clearScene(this.scenes[i]);
      }
    }
    var tween_1 = new TWEEN.Tween(this.scenes[old_scene].position)
      .to({x: direction * this.width})
      .duration(1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
    var tween_2 = new TWEEN.Tween(this.scenes[new_scene].position)
      .to({x: 0})
      .duration(1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
    this.current_scene = new_scene;
  }


  showAlert(text, action) {
    var self = this;
    this.alertBox.alertText.text = text;
    this.alertBox.button.on("click", function() {
      action();
      self.alertBox.visible = false
    });
    this.alertBox.visible = true;
    new TWEEN.Tween(this.alertBox)
      .to({rotation: Math.PI / 60.0})
      .duration(70)
      .yoyo(true)
      .repeat(3)
      .start()
  }


  makeButton(parent, x, y, text, text_size, text_spacing, text_color, backing_width, backing_height, backing_color, action) {
    var button = new PIXI.Container();
    parent.addChild(button);
    button.position.set(x, y);
    // var button_image = new PIXI.Sprite(PIXI.Texture.from("Art/" + backing_color + "_button_backing.png"));
    // button_image.anchor.set(0.5,0.5);
    button.backing = PIXI.Sprite.from(PIXI.Texture.WHITE);
    button.backing.width = backing_width;
    button.backing.height = backing_height;
    button.backing.anchor.set(0.5, 0.5);
    button.backing.tint = backing_color;
    button.text = new PIXI.Text(text, {fontFamily: "Bebas Neue", fontSize: text_size, fill: text_color, letterSpacing: text_spacing, align: "center"});
    button.text.anchor.set(0.5,0.45);
    button.fronting = PIXI.Sprite.from(PIXI.Texture.WHITE);
    button.fronting.width = backing_width;
    button.fronting.height = backing_height;
    button.fronting.anchor.set(0.5, 0.5);
    button.fronting.alpha = 0.7;
    button.addChild(button.backing);
    button.addChild(button.text);
    button.addChild(button.fronting)
    button.fronting.visible = false;

    button.interactive = true;
    button.buttonMode = true;
    button.hitArea = button.backing.hitArea;
    button.on("click", action);

    button.disable = function() {
      this.fronting.visible = true;
      this.interactive = false;
    }

    button.enable = function() {
      this.fronting.visible = false;
      this.interactive = true;
    }

    return button;
  }


  makeLetterPalette(parent, x, y, action) {
    var mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
    mat.width = 13 * 80;
    mat.height = 160;
    mat.anchor.set(0.5, 0.5);
    mat.position.set(x - 80,y);
    mat.tint = 0xCCCCCC;
    parent.addChild(mat)
    var letters = [];
    var size = 80;
    letters[0] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
    letters[1] = ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    for (var h = 0; h < 2; h++) {
      for (var i = 0; i < 13; i++) {
        let letter = letters[h][i];
        this.makeButton(
          parent,
          x - 7*size + i*size, y + (h == 0 ? -size/2 : size/2),
          letter, size, 6, 0x000000,
          size, size, ((i+h) % 2 == 0 ? 0xF0F0F0 : 0xFFFFFF),
          //((i+h) % 2 == 0 ? 0xf1e594 : 0xFFFFFF)
          function() {
            if (action != null) {
              new TWEEN.Tween(this)
                .to({rotation: Math.PI / 20.0})
                .duration(70)
                // .easing(TWEEN.Easing.Linear.In)
                .yoyo(true)
                .repeat(1)
                
                .chain(new TWEEN.Tween(this)
                  .to({rotation: Math.PI / -20.0})
                  .duration(70)
                  // .easing(TWEEN.Easing.Linear.In)
                  .yoyo(true)
                  .repeat(1)
                  )
                .start()
              action(letter);
            }
          }
        );
      }
    }
  }


  resetTitle() {
    this.player = 0;
    this.state  = {};
    this.game_code = "";
    this.start_time = Date.now();
    this.game_code_letter_choice = 0;
    // if (this.game_code_letters != null) {
    //   for (var i = 0; i < 5; i++) {
    //     this.game_code_letters[i].text.text = "";
    //     this.game_code_letters[i].backing.tint = (i == this.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
    //   }

    // }
  }


  clearScene(scene) {
    while(scene.children[0]) { scene.removeChild(scene.children[0]); }
  }


  update() {

    var repeats = Math.floor(4/1000.0 * (Date.now() - this.start_time)) % 3;
    if (this.current_scene == "lobby" && this.player == 1 && this.state.player_2_present == false) {
      this.lobby.info_text.text = "WAITING FOR PLAYER 2" + ".".repeat(repeats + 1);
    }

    this.test_ball.update();

    this.render();
  }


  randomWord() {
    var characters = "abcdefghijklmnopqrstuvwxyz";
    var word = "";
    for (var i = 0; i < 4; i++) {
      word += characters.charAt(Math.floor(Math.random() * characters.length));

    }
    return word;
  }


  render() {
    pixi.renderer.render(pixi.stage);
  }

  handleMouse(ev) {
    // ev.preventDefault();
    // var rect = canvas.getBoundingClientRect();
    // var click_x = Math.floor(ev.clientX - rect.left);
    // var click_y = Math.floor(ev.clientY - rect.top);
    // console.log(click_x + ", " + click_y);

    // if (click_x >= canvas.width * 3/4 - 100 && click_x <= canvas.width * 3/4 + 100
    //   && click_y >= canvas.height * 1/2 - 38 && click_y <= canvas.height * 1/2 + 38) {
    //   console.log("button");
    //  this.multiplayer.updateVolley(this.volley + "-" + this.randomWord());
    // }
  }
}

function twanimate(time) {
  // console.log("at least i'm twaninmatoetr " + time);
    window.requestAnimationFrame(twanimate);
    TWEEN.update(time);
}
window.requestAnimationFrame(twanimate);

var firebaseConfig = {
  apiKey: "AIzaSyBlhNihmc39kLoWKY-MlG49ItSGJcpXSfQ",
  authDomain: "wordvolley-ccdb6.firebaseapp.com",
  projectId: "wordvolley-ccdb6",
  databaseURL: "https://wordvolley-ccdb6-default-rtdb.firebaseio.com",
  storageBucket: "wordvolley-ccdb6.appspot.com",
  messagingSenderId: "591926001792",
  appId: "1:591926001792:web:d6078dc492a6156604e665",
  measurementId: "G-FB1JPHYKJN",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

game = null;
function initialize() {
  game = new Game();
}


pixi = null;

function detectMob() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}

class Game {
  constructor() {

    var self = this;

    // TODO: dynamically choose width and height according to aspect ratio.
    // Should be either 1280x720 or 1280x960, according to device.
    // Browser and iphone are 1280x720, and ipad is 1280x960.
    this.width = 1280;
    this.height = 720;
    // if (detectMob()) {
    //   this.height = 960;
    //   document.getElementById("mainDiv").style.height = 960;
    //   document.getElementById("mainDiv").style.marginTop = -480;
    // }
    if (detectMob()) {
      this.width = 600;
      this.height = 768;
      document.getElementById("mainDiv").style.width = 1024;
      document.getElementById("mainDiv").style.marginLeft = -512;
    }

    this.loadWords()

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true});
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.backgroundColor = 0xFFFFFF;
    pixi.renderer.resize(this.width,this.height);

    this.multiplayer = new Multiplayer(this);

    this.initialize();
    this.resetTitle();

    this.current_scene = "title";

    setInterval(function() {self.update()},33);

    window.addEventListener("unload", function(ev) {
      if (self.game_code != "" && self.player > 0) {
        self.multiplayer.leaveGame(self.game_code, self.player)
        self.resetTitle();
      }
    })
  }


  initialize() {
    this.scenes = [];
    this.scenes["title"] = new PIXI.Container();
    this.scenes["setup_create"] = new PIXI.Container();
    this.scenes["setup_create"].position.x = this.width;
    this.scenes["setup_join"] = new PIXI.Container();
    this.scenes["setup_join"].position.x = this.width;
    this.scenes["setup_watch"] = new PIXI.Container();
    this.scenes["setup_watch"].position.x = this.width;
    this.scenes["lobby"] = new PIXI.Container();
    this.scenes["lobby"].position.x = this.width;
    this.scenes["volley"] = new PIXI.Container();
    this.scenes["volley"].position.x = 2 * this.width;
    pixi.stage.addChild(this.scenes["title"]);
    pixi.stage.addChild(this.scenes["setup_create"]);
    pixi.stage.addChild(this.scenes["setup_join"]);
    pixi.stage.addChild(this.scenes["setup_watch"]);
    pixi.stage.addChild(this.scenes["lobby"]);
    pixi.stage.addChild(this.scenes["volley"]);


    this.alertMask = new PIXI.Container();
    pixi.stage.addChild(this.alertMask);
    this.alertBox = new PIXI.Container();
    pixi.stage.addChild(this.alertBox);

    this.conclusionMask = new PIXI.Container();
    pixi.stage.addChild(this.conclusionMask);

    this.initializeTitleScreen();
    this.initializeAlertBox();
  }


  loadWords() {
    var self = this;
    this.legal_words = {};
    this.common_words = {};
    for (var i = 4; i <= 7; i++) {
      this.legal_words[i] = {};
      this.common_words[i] = {};
    }
    var request = new XMLHttpRequest();
    request.open("GET", "Dada/legal_words.txt.gz", true);
    request.responseType = "arraybuffer";
    request.onload = function(e) {

      var word_list = new TextDecoder("utf-8").decode(
        new Zlib.Gunzip(
          new Uint8Array(this.response)
        ).decompress()
      );
      word_list = word_list.split(/\n/);
      for (var i = 0; i < word_list.length; i++) {
        var thing = word_list[i].split(",");
        var word = thing[0];
        var common = thing[1];
        if (word != null && word.length >= 4 && word.length <= 7) {
          self.legal_words[word.length][word.toUpperCase()] = 1;
          if (common == 1) {
            self.common_words[word.length][word.toUpperCase()] = 1;
          }
        }
      }
    };
    request.send();
  }


  quickPlayGame() {
    var self = this;
    this.multiplayer.quickPlayGame(2, function() {
      self.resetSetupLobby();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.multiplayer.setWatch();

      self.animateSceneSwitch("title", "lobby");
    }, function() {
      self.showAlert("Sorry, Quick Play isn't\nworking right now :-(", function() {

      })
    });
  }


  createGame() {
    this.player = 1;

    var self = this;

    this.multiplayer.createNewGame(self.choices["GAME TYPE"] == "COMPETITIVE" ? "code_comp" : "code_coop", 2, function() {
      self.resetSetupLobby();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.multiplayer.setWatch();

      self.animateSceneSwitch("setup_create", "lobby");
    })

  }


  joinGame(game_code) {
    this.player = 2;

    var self = this;

    this.multiplayer.joinGame(game_code, function() {
      self.resetSetupLobby();

      self.multiplayer.setWatch();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.animateSceneSwitch("setup_join", "lobby");
    }, function() {
      self.showAlert("Sorry, I can't find a\ngame with that code :-(", function() {

      })
    });
  }


  watchGame(game_code) {
    this.player = 7;

    var self = this;

    this.multiplayer.watchGame(game_code, function() {
      self.resetSetupLobby();

      self.lobby_ready_button.visible = false;

      self.multiplayer.setWatch();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      if (self.state.volley_state != "none") {
        self.initializeVolleyScreen();
        self.setPriorWords();
        self.animateSceneSwitch("setup_watch", "volley");
      } else {
        self.animateSceneSwitch("setup_watch", "lobby");
      }
    }, function() {
      self.showAlert("Sorry, I can't find a\ngame with that code :-(", function() {

      })
    });
  }


  requestRematch() {

    if (this.player == 1) {
      this.multiplayer.update({
        player_1_state: "joined",
        origin: "",
        target: "",
        live_word: "",
        volley_state: "none",
      })
    } else if (this.player == 2) {
      this.multiplayer.update({
        player_2_state: "joined",
        origin: "",
        target: "",
        live_word: "",
        volley_state: "none",
      })
    }

    this.lobby_ready_button.enable();

    this.animateSceneSwitch("volley", "lobby");
  }


  animateSceneSwitch(old_scene, new_scene) {
    console.log("switching from " + old_scene + " to " + new_scene);
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
    this.alertBox.on("pointertap", function() {
      action();
      self.alertBox.visible = false
      self.alertMask.visible = false
    });
    this.alertBox.visible = true;
    this.alertMask.visible = true;
    new TWEEN.Tween(this.alertBox)
      .to({rotation: Math.PI / 60.0})
      .duration(70)
      .yoyo(true)
      .repeat(3)
      .start()
  }


  showConclusion(winner) {
    var self = this;

    var text;

    if (winner == 3) {
      text = "Time's up! You got " + this.state.player_1_score + " volleys!";
    } else if (winner == 1) {
      if (this.player == 1) {
        text = "You win, " + this.state.player_1_name + "!";
      } else if (this.player == 2) {
        text = this.state.player_1_name + " wins! You lose.";
      } else {
        text = this.state.player_1_name + " wins!";
      }
    } else if (winner == 2) {
      if (this.player == 2) {
        text = "You win, " + this.state.player_2_name + "!";
      } else if (this.player == 1) {
        text = this.state.player_2_name + " wins! You lose.";
      } else {
        text = this.state.player_2_name + " wins!";
      }
    }

    this.volley.info_text.visible = false;
    this.volley.coop_score.visible = false;
    this.volley.hint_text.visible = false;
    this.volley.back_arrow.visible = false;
    this.play_button.visible = false;
    this.letter_palette.visible = false;
    this.ball.visible = false;
    this.live_word_container.visible = false;
    this.red_underline.visible = false;
    this.blue_underline.visible = false;

    this.conclusion_text.text = text;
    this.conclusion_text.visible = true;

    this.conclusion_rematch_button.visible = true;
    this.conclusion_quit_button.visible = true;
  
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
    button.on("pointertap", action);

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
    var palette = new PIXI.Container();
    parent.addChild(palette);
    palette.position.set(x, y);

    palette.letters = [];

    var mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
    mat.width = 13 * 80;
    mat.height = 160;
    mat.anchor.set(0.5, 0.5);
    mat.position.set(-80, 0);
    mat.tint = 0xCCCCCC;
    palette.addChild(mat)

    var letters = [];
    var size = 80;
    letters[0] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
    letters[1] = ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    for (var h = 0; h < 2; h++) {
      for (var i = 0; i < 13; i++) {
        let letter = letters[h][i];
        var button = this.makeButton(
          palette,
          -7*size + i*size, (h == 0 ? -size/2 : size/2),
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
        palette.letters.push(button);
      }
    }
    return palette;
  }


  makeOptionChooser(parent, x, y, options, option_name, button_to_enable) {
    var self = this;
    this.choosers[option_name] = {};
    this.choices[option_name] = -1;
    this.choice_strings[option_name] = options;

    var option_text = new PIXI.Text(option_name, {fontFamily: "Bebas Neue", fontSize: 48, fill: 0x000000, letterSpacing: 6, align: "center"});
    option_text.anchor.set(0.5,0.5);
    option_text.position.set(x, y);
    parent.addChild(option_text);
    
    var option_marker = new PIXI.Sprite(PIXI.Texture.from("Art/blue_check.png"));
    option_marker.anchor.set(0.5, 0.5);
    option_marker.position.set(x - 160, y);
    option_marker.visible = false;
    parent.addChild(option_marker);

    // var x_positions = [];
    // if (options.length == 2) {
    //   x_positions = [self.width * 2/5, self.width * 3/5];
    // } else {
    //   for (var i = 0; i < options.length; i++) {
    //     x_positions.push(self.width * (i+1)/(options.length + 1));
    //   }
    // }
    var left_most_x = x;
    for (var i = 0; i < options.length; i++) {
      let choice_num = i;
      if (x - 10 * (1 + options[i].length) - 20 < left_most_x) {
        left_most_x = x - 10 * (1 + options[i].length) - 20;
      }
      this.makeButton(
        parent,
        x, y + (i+1) * 64,
        options[i], 36, 6, 0x3cb0f3,
        20 * (1 + options[i].length), 60, 0xFFFFFF,
        function() {
          self.choices[option_name] = options[choice_num];
          self.resetOptionsText();
          if (option_marker.visible == false) {
            option_marker.visible = true;
            option_marker.position.y = y + (choice_num+1) * 64;
            option_marker.position.x = left_most_x;
          } else {
            var tween = new TWEEN.Tween(option_marker.position)
              .to({y: y + (choice_num+1) * 64})
              .duration(200)
              .easing(TWEEN.Easing.Cubic.Out)
              .start();
          }
          for (const [key,value] of Object.entries(self.choices)) {
            let enable = true;
            if (value == -1) {
              enable = false;
            }
            if (enable) {
              button_to_enable.enable();
            } else {
              button_to_enable.disable();
            }
          }
        }
      );
    }
  }


  resetTitle() {
    this.player = 0;
    this.state  = {};
    this.choosers = {};
    this.choices = {
      "GAME_TYPE": -1,
      "DIFFICULTY": -1,
    };
    this.choice_strings = {};
    this.game_code = "";
    this.start_time = Date.now();
    this.game_code_letter_choice = 0;
    this.multiplayer.stopWatch();
  }


  clearScene(scene) {
    while(scene.children[0]) { scene.removeChild(scene.children[0]); }
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

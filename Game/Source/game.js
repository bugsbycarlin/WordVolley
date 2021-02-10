
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
    this.scenes["lobby"] = new PIXI.Container();
    this.scenes["lobby"].position.x = this.width;
    this.scenes["volley"] = new PIXI.Container();
    this.scenes["volley"].position.x = 2 * this.width;
    pixi.stage.addChild(this.scenes["title"]);
    pixi.stage.addChild(this.scenes["setup_create"]);
    pixi.stage.addChild(this.scenes["setup_join"]);
    pixi.stage.addChild(this.scenes["lobby"]);
    pixi.stage.addChild(this.scenes["volley"]);


    this.alertBox = new PIXI.Container();
    pixi.stage.addChild(this.alertBox);

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
        var marking = thing[0];
        var word = thing[1];
        if (word != null && word.length >= 4 && word.length <= 7) {
          self.legal_words[word.length][word.toUpperCase()] = 1;
          if (marking == 1) {
            self.common_words[word.length][word.toUpperCase()] = 1;
          }
        }
      }
    };
    request.send();
  }


  createGame() {
    this.player = 1;

    var self = this;

    this.multiplayer.createNewGame(function() {
      self.resetSetupLobby();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.multiplayer.setWatch();

      self.animateSceneSwitch("setup_create", "lobby");
    }, 2)

  }


  joinGame(game_code) {
    this.player = 2;

    var self = this;

    this.multiplayer.joinGame(game_code, function() {
      self.resetSetupLobby();

      self.multiplayer.setWatch();

      self.animateSceneSwitch("setup_join", "lobby");
    }, function() {
      self.showAlert("Sorry, can't find\nthat game :-(", function() {

      })
    });
  }


  animateSceneSwitch(old_scene, new_scene) {
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
    var palette = [];
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
        var button = this.makeButton(
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
        palette.push(button);
      }
    }
    return palette;
  }


  resetTitle() {
    this.player = 0;
    this.state  = {};
    this.game_code = "";
    this.start_time = Date.now();
    this.game_code_letter_choice = 0;
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

var gamejs = require("gamejs");
var $g = require("globals");
var $e = require("gamejs/event");
var $m = require("gamejs/utils/math");


var Player = function(rect) {
  // call superconstructor
  Player.superConstructor.apply(this, arguments);

  this.frames = [
    gamejs.image.load($g.images.playerF1),
    gamejs.image.load($g.images.playerF2),
    gamejs.image.load($g.images.playerF3),
    gamejs.image.load($g.images.playerF4),
  ];

  //Current Frame
  this.image = gamejs.image.load($g.images.playerF1);

  this.msPerFrame = 1000 / 15;
  this.msCurrent = 0;
  this.frame = 0;
  
  // [x,y]
  this.pos = [$g.screen.right/2,$g.screen.bot-50];

  this.size = rect;
  this.velocity = [0,0];

  this.stats = {
    health    : 100,
    damage    : 10,
  };

  this.health = 100;


  // Rect stuff
  this.rect = new gamejs.Rect(rect);
  this.rect.width = this.image.rect.width;
  this.rect.height = this.image.rect.height;
  this.rect.center = this.pos;

  return this;
};
gamejs.utils.objects.extend(Player, gamejs.sprite.Sprite);


Player.prototype.update = function(msDuration) {

  this.msCurrent += msDuration;
  if (this.msCurrent > this.msPerFrame){
    this.frame += 1;
    if (this.frame > this.frames.length-1) this.frame = 0;
    this.image = this.frames[this.frame];
    this.msCurrent = 0;
  }

	this.rect.moveIp(this.velocity);
	this.pos = this.rect.center;
  this.checkbounds();
  this.collide();
};

Player.prototype.handle = function(event){

  if(event.type === "deviceorientation") {
    if (Math.abs(event.gamma) > 3) this.move(event.gamma);
    else this.move(0);
  }

  if (event.type === "touchstart"){
    this.shoot();
  }

  if (event.type === gamejs.event.KEY_DOWN){
    if (event.key === gamejs.event.K_a){
      this.velocity = [this.velocity[0]-2, 0];
    }
    else if (event.key === gamejs.event.K_d){
      this.velocity = [this.velocity[0]+2, 0];
    }
  }
};

Player.prototype.shoot = function() {
  var pos = this.pos;
  pos[1] -= 20;
	var laser = new Laser(pos);
	$g.lasers.add(laser);
};


Player.prototype.draw = function (display){
  display.blit(this.image, this.rect);
};

Player.prototype.move = function(gamma){
	this.velocity = [gamma/2, 0];
};

Player.prototype.checkbounds = function(){
  var pos = this.rect.center;
  if (pos[0] > $g.screen.right+5)     this.rect.center =  [$g.screen.left, pos[1]];
  else if (pos[0] < $g.screen.left-5) this.rect.center = [$g.screen.right, pos[1]];
  this.pos = this.rect.center;
};

Player.prototype.collide = function(){
  var collide = gamejs.sprite.spriteCollide(this, $g.projectiles, true);
  var killed = gamejs.sprite.spriteCollide(this, $g.eLasers, true);
  if (collide.length > 0 || killed.length > 0){
    this.health -= 10;
  }
}


var Laser = function(pos) {
  // call superconstructor
  var size = [5, 25];
  Laser.superConstructor.apply(this, arguments);
  this.image = gamejs.image.load($g.images.laser);
  this.originalImage = gamejs.transform.scale(this.image, size);
  this.image = gamejs.transform.rotate(this.originalImage, 0);
  
  // [x,y]
  this.pos = pos;

  this.size = size;
  this.velocity = [0,-15];


  // Rect stuff
  this.rect = new gamejs.Rect(size);
  this.rect.width = this.image.rect.width;
  this.rect.height = this.image.rect.height;
  this.rect.center = this.pos;

  return this;
};
gamejs.utils.objects.extend(Laser, gamejs.sprite.Sprite);


Laser.prototype.update = function(msDuration) {
  this.rect.moveIp(this.velocity);
  var pos = this.pos = this.rect.center;

  if ((pos[1] < $g.screen.top - 10) || (pos[1] > $g.screen.bot + 10)){
    $g.lasers.remove(this);
  }

  var collide = gamejs.sprite.spriteCollide(this, $g.projectiles, true);
  if (collide.length > 0){
    $g.lasers.remove(this);
    $g.game.score += 5;
  }
};

Laser.prototype.draw = function (display){
  display.blit(this.image, this.rect);
};

exports.Laser = Laser;
exports.Player = Player;
var gamejs = require("gamejs");
var $g = require("globals");
var $e = require("gamejs/event");
var $m = require("gamejs/utils/math");


var Enemy = function(rect, image) {
  // call superconstructor
  Enemy.superConstructor.apply(this, arguments);


  this.frames = [
    gamejs.image.load($g.images.eF1),
    gamejs.image.load($g.images.eF2),
    gamejs.image.load($g.images.eF3),
    gamejs.image.load($g.images.eF4),
    gamejs.image.load($g.images.eF5),
    gamejs.image.load($g.images.eF6),
  ];

  this.image = gamejs.image.load(image);

  this.msPerFrame = 1000 / 1;
  this.msCurrent = 0;
  this.frame = 0;

  // [x,y]
  this.pos = [Math.random()*$g.screen.right,$g.screen.top-10];

  this.size = rect;
  this.velocity = [0,Math.random()*2 + 2];

  // Rect stuff
  this.rect = new gamejs.Rect(rect);
  this.rect.width = this.image.rect.width;
  this.rect.height = this.image.rect.height;
  this.rect.center = this.pos;

  this.stats = {
    health    : 10,
    damage    : 10,
    fireRate  : 1000
  };

  this.fireRate = 1000;

  return this;
};
gamejs.utils.objects.extend(Enemy, gamejs.sprite.Sprite);


Enemy.prototype.update = function(msDuration) {

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
  this.fireRate -= msDuration;
  if (this.fireRate < 0){
    this.shoot();
  }
};

Enemy.prototype.shoot = function() {
  this.fireRate = this.stats['fireRate']
  var pos = this.pos;
  var velocity = this.velocity;
	var laser = new eLaser(pos, velocity);
	$g.eLasers.add(laser);
};


Enemy.prototype.draw = function (display){
  display.blit(this.image, this.rect);
};


Enemy.prototype.checkbounds = function(){
  var pos = this.pos
  if (pos[1] > $g.screen.bot){
    // bye bye
    this.rect.center = this.pos = [Math.random()*$g.screen.right,$g.screen.top-10];
  }
};

Enemy.prototype.collide = function(){
  var collide = gamejs.sprite.spriteCollide(this, $g.projectiles, true);
  var killed = gamejs.sprite.spriteCollide(this, $g.lasers, true);
  if (collide.length > 0 || killed.length > 0){
    this.kill();
  }
};

Enemy.prototype.kill = function(){
  $g.enemies.remove(this);
};

var eLaser = function(pos, vel) {
  // call superconstructor
  var size = [10,10];
  eLaser.superConstructor.apply(this, arguments);
  this.image = gamejs.image.load($g.images.eLaser);
  this.originalImage = gamejs.transform.scale(this.image, size);
  this.image = gamejs.transform.rotate(this.originalImage, 0);
  
  // [x,y]
  this.pos = pos

  this.size = size;
  this.velocity = [0,Math.random()*10 + 5 + vel[1]];


  // Rect stuff
  this.rect = new gamejs.Rect(size);
  this.rect.width = this.image.rect.width;
  this.rect.height = this.image.rect.height;
  this.rect.center = this.pos;

  return this;
};
gamejs.utils.objects.extend(eLaser, gamejs.sprite.Sprite);


eLaser.prototype.update = function(msDuration) {
  this.rect.moveIp(this.velocity);
  this.pos = this.rect.center;
  this.checkbounds();
};

eLaser.prototype.draw = function (display){
  display.blit(this.image, this.rect);
};

eLaser.prototype.checkbounds = function(){
  var pos = this.pos
  if (pos[1] > $g.screen.bot){
    // bye bye
    $g.eLasers.remove(this);
  }
};


exports.eLaser = eLaser; 
exports.Enemy = Enemy;

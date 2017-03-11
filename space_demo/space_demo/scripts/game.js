var CANVAS_WIDTH=480;
var CANVAS_HEIGHT=320;

var canvasElement = $("<canvas width='" + CANVAS_WIDTH + "'height='"+ CANVAS_HEIGHT + "'></canvas>");

var canvas = canvasElement.get(0).getContext("2d");
canvasElement.appendTo('body');

var FPS=30;
setInterval(function() {
	update();

	draw();
},1000/FPS);


var textX=50;
var textY=50;

function update(){
	if(keydown.left){
		player.x-=5;
	}

	if (keydown.right) {
		player.x+=5;
	}
	if (keydown.space) {
		player.shoot();
	}

	player.x=player.x.clamp(0,CANVAS_WIDTH-player.width);

	//////update bullets
	playerBullets.forEach(function (bullet){
		bullet.update();
	});

	playerBullets= playerBullets.filter(function(bullet){
		return bullet.active;
	});
	
	//////update enemies
	enemies.forEach(function (enemy){
		enemy.update();
	});

	enemies= enemies.filter(function(enemy){
		return enemy.active;
	});

	//////update bonus enemies
	enemies_2.forEach(function (bonusEnemy){
		bonusEnemy.update();
	});

	enemies_2= enemies_2.filter(function(bonusEnemy){
		return bonusEnemy.active;
	});

	if (Math.random()<0.1) {
		enemies.push(Enemy());
	}
	if (Math.random()<0.01) {	/////////////chances of getting bonus enemy is 1/10 of regular
		enemies_2.push(BonusEnemy());
	}
	handleCollisions();
};

function draw(){
	canvas.clearRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
	player.draw();	
	scoreBoard.draw();
	Level.draw();
	Lives.draw();

	playerBullets.forEach(function (bullet){
		bullet.draw();
	});

	enemies.forEach(function(enemy){
		enemy.draw();
	});

	enemies_2.forEach(function(bonusEnemy){
		bonusEnemy.draw();
	});
}

///////------------------------Score --------------------------------------//////////////////////////
var levelchangepoints= 500 ;

var scoreBoard={
	color: "#00A",
	player_score:0,
	x:300,
	y: 20,
	draw : function(){
		canvas.fillStyle=this.color;
		canvas.font= "20px Arial";
		canvas.fillText("Score : "+this.player_score,this.x,this.y);
	},
	update : function(enemy_type){
		if(enemy_type==1)
			this.player_score+=10;
		else if (enemy_type==2) 
			this.player_score+=20;

		if (this.player_score % levelchangepoints==0) // level increased after every 500 points 
		{
			Level.update();
		};
	}	
};

////////////Levels of scoreboard
var Level={
	color: "#00A",
	player_level:1,
	x:50,
	y: 20,
	draw : function(){
		canvas.fillStyle=this.color;
		canvas.font= "20px Arial";
		canvas.fillText("Level : "+this.player_level,this.x,this.y);
	},
	update : function(){
		this.player_level= (scoreBoard.player_score/levelchangepoints)+1;
		enemy_velocity+=2;
		console.log(this.player_level);
	}	
};


////////////Lives left of player
var Lives={
	color: "#00A",
	player_lives:3,
	x:150,
	y: 20,
	draw : function(){
		canvas.fillStyle=this.color;
		canvas.font= "20px Arial";
		canvas.fillText("Lives left : "+this.player_lives,this.x,this.y);
	},
	update : function(){
		this.player_lives-=1;
		if(this.player_lives<=-1){
			//Sound.play("../sounds/invaderkilled");
			alert("GAME OVER");
            document.location.reload();
		};
	}	
};

///////***********************entitities*******************************////////////
//////////bottom line
var bottom={
	x:0,
	y:300,
	width:CANVAS_WIDTH,
	height:1
};

//----------------------player
var player={
	color: "#00A",
	x:220,
	y:270,
	width:32,
	height:32,
	draw : function(){
		/*canvas.fillStyle=this.color;
		canvas.fillRect(this.x,this.y,this.width,this.height);*/
		this.sprite.draw(canvas,this.x,this.y);
	}

};
player.sprite= Sprite("../images/player");

player.shoot= function(){
	var bulletPosition= this.midpoint();

	Sound.play("../sounds/shoot");
	playerBullets.push(Bullet({
		speed : 5,
		x: bulletPosition.x,
		y: bulletPosition.y
	}));
};


player.midpoint=function(){
	return {
		x: this.x + this.width/2,
		y: this.y + this.height/2,
	};
};

player.explode=function(){
	Lives.update();
};

var playerBullets= [];
function Bullet(I){
	I.active=true;

	I.xVelocity=0;
	I.yVelocity= -I.speed;

	I.width=3;
	I.height=3;
	I.color="#000";

	I.inBounds= function(){
		return I.x >= 0 && I.x<=CANVAS_WIDTH &&
		I.y >=0 && I.y<=CANVAS_HEIGHT;
	};

	I.draw=function(){
		canvas.fillStyle= this.color;
		canvas.fillRect(this.x,this.y,this.width,this.height);

	};

	I.update= function(){
		I.x += I.xVelocity;
		I.y += I.yVelocity;
		I.active= I.active && I.inBounds();	
	};

	return I;
}

///////////--------------------------enemies---------------------------------//////////////
enemies= [];
enemy_velocity=2;

function Enemy(I){
	I= I || {};

	I.sprite=Sprite("../images/enemy");
	I.active= true;
	I.age= Math.floor(Math.random()* 128);
	I.color= "#A2B";

	I.x= CANVAS_WIDTH/4 + Math.random() * CANVAS_WIDTH/2;
	I.y=0;
	I.xVelocity=0;
	I.yVelocity=enemy_velocity;

	I.width=32;
	I.height=32;
	I.inBounds= function(){
		return I.x >= 0 && I.x<=CANVAS_WIDTH &&
		I.y >=0 && I.y<=CANVAS_HEIGHT;
	};

	I.draw=function(){
		/*canvas.fillStyle= this.color;
		canvas.fillRect(this.x,this.y,this.width,this.height);*/
		this.sprite.draw(canvas,this.x,this.y);

	};

	I.update= function(){
		I.x += I.xVelocity;
		I.y += I.yVelocity;

		I.xVelocity=3* Math.sin(I.age * Math.PI/64);
		I.age++;

		I.active= I.active && I.inBounds();	
	};

	I.explode= function(){
		Sound.play("../sounds/explosion");
		this.active=false;
	}

	return I;
}
///////////----------------------------------enemies of type 2---------------------- //////////////
enemies_2= [];

function BonusEnemy(I){
	I= I || {};

	I.active= true;
	I.age= Math.floor(Math.random()* 128);
	I.color= "#A2B";

	I.x= CANVAS_WIDTH/4 + Math.random() * CANVAS_WIDTH/2;
	I.y=0;
	I.xVelocity=0;
	I.yVelocity=enemy_velocity;

	I.width=32;
	I.height=32;
	I.inBounds= function(){
		return I.x >= 0 && I.x<=CANVAS_WIDTH &&
		I.y >=0 && I.y<=CANVAS_HEIGHT;
	};

	I.draw=function(){
		canvas.fillStyle= this.color;
		canvas.fillRect(this.x,this.y,this.width,this.height);
		//this.sprite.draw(canvas,this.x,this.y);

	};

	I.update= function(){
		I.x += I.xVelocity;
		I.y += I.yVelocity;

		I.xVelocity=3* Math.sin(I.age * Math.PI/64);
		I.age++;

		I.active= I.active && I.inBounds();	
	};

	I.explode= function(){
		Sound.play("../sounds/bang");
		this.active=false;
	}

	return I;
}
////////******************************collision detection*****************************

function collides(a,b){
	return a.x < b.x+b.width &&
			a.x+a.width > b.x &&
			a.y < b.y+b.height &&
			a.y + a.height > b.y;
}

function handleCollisions(){
	playerBullets.forEach(function(bullet){
		enemies.forEach(function (enemy){
			if (collides(bullet,enemy)){
				enemy.explode();
				bullet.active=false;
				//scoreBoard.player_score += 5;
				scoreBoard.update(1);
				console.log("boom");
			}
		});
		enemies_2.forEach(function (bonusEnemy){
			if (collides(bullet,bonusEnemy)){
				bonusEnemy.explode();
				bullet.active=false;
				//scoreBoard.player_score += 5;
				scoreBoard.update(2);
				console.log("boom");
			}
		});
	});

	enemies.forEach(function(enemy){
		if (collides(enemy,player)) {
			enemy.explode();
			player.explode();
		}
		else if(collides(enemy,bottom)){
			enemy.explode();
			player.explode();
		};
	});

	enemies_2.forEach(function(enemy){
		if (collides(enemy,player)) {
			enemy.explode();
			player.explode();
		}
		else if(collides(enemy,bottom)){
			enemy.explode();
			player.explode();
		};
	});
}
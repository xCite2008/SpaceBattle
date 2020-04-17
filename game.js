var canvas = document.getElementById("game");
var context = canvas.getContext("2d");

var asteroid = [];
var bullets = [];
var expl = [];
var shield = { timer: 0, start: true, enabled: false };
var timer = 0;
var score = 0;
var fireflag = false;
var fireforce = 1; //start fire force
var ship = { x: 300, y: 300, animx: 0, animy: 0, lives: 5, alive: true }; //, shield: true };
var playMusicAtStart = false;

var bgmove = { e: 1, f: 1 };

var musicbutton = document.getElementById("startmusic");


// init audio
var bgAudio = new Audio();
bgAudio.src = "sounds/bg.ogg";
bgAudio.loop = true;
bgAudio.volume = 0.2;
bgAudio.autoplay;




var asteroidImage = new Image();
asteroidImage.src = 'imgs/asteroid.png';

var bulletsImage = new Image();
bulletsImage.src = 'imgs/fire.png';

var shipImage = new Image();
shipImage.src = 'imgs/ship.png';

var backgroundImage = new Image();
backgroundImage.src = 'imgs/bg.png';

var explImage = new Image();
explImage.src = 'imgs/explosion.png';

var shieldImage = new Image();
shieldImage.src = 'imgs/shield.png';


canvas.addEventListener("mousemove", function (event) {
	ship.x = event.offsetX - 25;
	ship.y = event.offsetY - 20;
	bgmove.e = event.offsetX - 400;
	bgmove.f = event.offsetY - 400;
});

canvas.addEventListener("mousedown", function (event) {
	if (musicbutton.click && playMusicAtStart == false) {
		bgAudio.play();
		playMusicAtStart = true;
	}
	fireflag = true;
	if (shield.start == true) shield.start = false;
});

canvas.addEventListener("mouseup", function (event) {
	fireflag = false;
});

document.addEventListener("keydown", function (event) {
	//bgAudio.volume = 0.2;
	if (event.code == "Equal" && bgAudio.volume <= 0.9) bgAudio.volume += 0.1;
	if (event.code == "Minus" && bgAudio.volume >= 0.1) bgAudio.volume -= 0.1;
	if (event.code == "Digit9" && bgAudio.paused) bgAudio.play();
	if (event.code == "Digit0" && bgAudio.played) bgAudio.pause();
	if (event.code == "KeyR") this.location.reload();
});

//pause if window is inactive and resume if active
document.addEventListener("visibilitychange", function () {
	if (document.hidden) { // pausing
		bgAudio.pause();
	} else { // resume
		bgAudio.play();
	}
});


//if background.png was loaded start the game
backgroundImage.onload = function () {		
	game();
}


//main game cycle
function game() {
	update();
	render();
	requestAnimFrame(game);
}

function update() {
	timer++;

	if (score >= 800 && score < 900) fireforce = 2;
	if (score >= 1500 && score < 1600) fireforce = 3;


	// asteroid generator
	if ((timer % (15 - Math.floor(timer / 500)) == 0 && timer < 7500) || (timer > 7500 && timer % 2)) {
		var tempForce = Math.floor(Math.random() * 3) + 1;
		//console.log(tempForce);
		asteroid.push({
			x: Math.random() * 550,
			y: -80,
			dx: Math.random() * 2 - 1,
			dy: Math.random() * 2 + 2,
			exist: true,
			angle: 0,
			dxangle: Math.random() * 0.1 - 0.05,
			force: tempForce,
			size: tempForce
		});
	}

	//bullets generator
	if (timer % 10 == 0 && fireflag == true && ship.alive == true) {
		bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: 0, dy: -5.2, force: fireforce });
		if (score >= 1800) {
			bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: -1, dy: -5 });
			bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: 1, dy: -5 });
		}
	};

	// ship shield animation
	ship.animx = ship.animx + 1;
	if (ship.animx > 4) {
		ship.animy++;
		ship.animx = 0
	}
	if (ship.animy > 3) {
		ship.animx = 0;
		ship.animy = 0;
	}


	//bullets trajectory
	for (i in bullets) {
		bullets[i].x += bullets[i].dx;
		bullets[i].y += bullets[i].dy;

		if (bullets[i].y < -50) bullets.splice(i, 1);
	}

	//if asteroid comes out the screen it will destroyed
	for (i in asteroid) {
		asteroid[i].x += asteroid[i].dx; //move x-axis
		asteroid[i].y += asteroid[i].dy; //move y-axis
		asteroid[i].angle += asteroid[i].dxangle; //rotate

		if (asteroid[i].x >= 550 || asteroid[i].x <= 0) asteroid[i].dx = -(asteroid[i].dx);
		if (asteroid[i].y >= 600) asteroid.splice(i, 1); //asteroid fly away so it will be destroyed

		//bullets and asteroid collision
		for (j in bullets) {

			if (Math.abs(asteroid[i].x + 25 - bullets[j].x - 10) < 30 && Math.abs(asteroid[i].y - bullets[j].y) < 25 && asteroid[i].exist == true) {

				//asteroid[i].force -= bullets[j].force;
				if (asteroid[i].force <= 1 || isNaN(asteroid[i].force) == true) {
					expl.push({ x: asteroid[i].x - 25, y: asteroid[i].y - 25, animx: 0, animy: 0 });
					asteroid[i].exist = false;
					bullets.splice(j, 1);
					score += 5;
					//break;
				} else {
					asteroid[i].force -= bullets[j].force;
					bullets.splice(j, 1);
				}

				score++;
			}

		}

		// asteroid and ship collision
		if (Math.abs(asteroid[i].x + 15 - ship.x - 10) < 30 && Math.abs(asteroid[i].y - ship.y) < 25) {
			if (shield.start == false && shield.enabled == false) ship.lives--;
			expl.push({ x: asteroid[i].x - 25, y: asteroid[i].y - 25, animx: 0, animy: 0 });
			asteroid[i].exist = false;
		}
		if (ship.lives <= 0) {
			expl.push({ x: asteroid[i].x - 25, y: asteroid[i].y - 25, animx: 0, animy: 0 });
			asteroid[i].exist = false;
			ship.alive = false;
		}

		if (asteroid[i].exist == false) asteroid.splice(i, 1);

	}

	// animation of explosion
	for (i in expl) {
		expl[i].animx = expl[i].animx + 0.5;
		if (expl[i].animx > 7) {
			expl[i].animy++;
			expl[i].animx = 0;
		}
		if (expl[i].animy > 6) expl.splice(i, 1);
	}
}

function render() {
	//clear canvas
	//context.clearRect(0, 0, 600, 600);

	//background first
	context.save();
	context.transform(1.2, 0, 0, 1.2, bgmove.e / 25, bgmove.f / 25);
	context.drawImage(backgroundImage, -20, -20, 600, 600);
	context.restore();

	//then asteroids
	//for (i in asteroid) context.drawImage(asteroidImage, asteroid[i].x, asteroid[i].y, 50, 50);
	for (i in asteroid) {
		context.save();
		context.translate(asteroid[i].x + 25, asteroid[i].y + 25);
		context.rotate(asteroid[i].angle);
		context.drawImage(asteroidImage, -25, -25, asteroid[i].size * 20, asteroid[i].size * 20);
		context.restore();
	}
	//then spaceship
	if (ship.alive == true) {
		context.drawImage(shipImage, ship.x, ship.y, 50, 50);
	} else {
		context.fillStyle = "#ffffff";
		context.font = "italic 30pt Arial";
		context.fillText(score, 15, 35);
		context.strokeText(score, 15, 35);
    }

	//shield
	if (shield.start == true || shield.enabled == true) {
		context.drawImage(shieldImage, 192 * Math.floor(ship.animx), 192 * Math.floor(ship.animy), 192, 192, ship.x - 25, ship.y - 15, 100, 100);
	}

	//and then bullets if exists
	for (i in bullets) context.drawImage(bulletsImage, bullets[i].x, bullets[i].y, 20, 30);

	//explosion
	for (i in expl) context.drawImage(explImage, 128 * Math.floor(expl[i].animx), 128 * Math.floor(expl[i].animy), 128, 128, expl[i].x, expl[i].y, 100, 100);

	context.fillStyle = "#ffffff";
	context.font = "italic 30pt Arial";
	context.fillText(score, 15, 35);
	context.strokeText(score, 15, 35);

	context.fillStyle = "#7777ff";
	context.font = "italic 10pt Arial";
	context.fillText("Frames: " + timer + ", Fireforce: " + fireforce + ", Lives: " + ship.lives + ", Asteroids: " + asteroid.length, 10, 585);
}





var requestAnimFrame = (function () {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 20);
		};
})();
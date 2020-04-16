var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var asteroid = [];
var bullets = [];
var expl = [];
var timer = 0;
var score = 0;
var fireforce = 1; //start fire force
var ship = { x: 300, y: 300 }; //, animx: 0, animy: 0};

var bgmove = {e: 1, f: 1};


var bgAudio = new Audio(); // Создаём новый элемент Audio
bgAudio.src = 'sounds/bg.mp3'; // Указываем путь к звуку "клика"
bgAudio.loop = true;
bgAudio.autoplay = true; // Автоматически запускаем


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


canvas.addEventListener("mousemove", function (event) {
	ship.x = event.offsetX - 25;
	ship.y = event.offsetY - 20;
	bgmove.e = event.offsetX - 400;
	bgmove.f = event.offsetY - 400;
});


//if explosion.png was loaded start the game
backgroundImage.onload = function () {
	bgAudio.play();
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

	// asteroid generator
	if (timer % 10 == 0) {
		var tempForce = Math.floor(Math.random() * 3) + 1;
		//console.log(tempForce);
		asteroid.push({
			x: Math.random() * 550,
			y: -50,
			dx: Math.random() * 2 - 1,
			dy: Math.random() * 2 + 2,
			exist: true,
			angle: 0,
			dxangle: Math.random() * 0.1 - 0.05,
			force: tempForce,
			size: tempForce * 25
		});
	}

	//выстрел
	if (timer % 10 == 0) {
		bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: 0, dy: -5.2, force: fireforce });
		bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: -1, dy: -5 });
		bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: 1, dy: -5 });
	};

	//двигаем пули
	for (i in bullets) {
		bullets[i].x = bullets[i].x + bullets[i].dx;
		bullets[i].y = bullets[i].y + bullets[i].dy;

		if (bullets[i].y < -50) bullets.splice(i, 1);
	}

	//if asteroid comes out the screen it will destroyed
	for (i in asteroid) {
		asteroid[i].x = asteroid[i].x + asteroid[i].dx;
		asteroid[i].y = asteroid[i].y + asteroid[i].dy;
		asteroid[i].angle = asteroid[i].angle + asteroid[i].dxangle;

		if (asteroid[i].x >= 550 || asteroid[i].x <= 0) asteroid[i].dx = -(asteroid[i].dx);
		if (asteroid[i].y >= 600) asteroid.splice(i, 1);

		//bullets and asteroid collision
		for (j in bullets) {

			if (Math.abs(asteroid[i].x + 25 - bullets[j].x - 15) < 50 && Math.abs(asteroid[i].y - bullets[j].y) < 25 && asteroid[i].exist == true) {

				//asteroid[i].force -= bullets[j].force;
				if (asteroid[i].force <= 1 || isNaN(asteroid[i].force) == true) {
					expl.push({ x: asteroid[i].x - 25, y: asteroid[i].y - 25, animx: 0, animy: 0 });
					asteroid[i].exist = false;
					bullets.splice(j, 1);
					score++;
					//break;
				} else {
					asteroid[i].force -= bullets[j].force;
					bullets.splice(j, 1);
				}
			}
			
		}
		if (asteroid[i].exist == false) asteroid.splice(i, 1);
	}

	//анимация взрывов
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
	//очистка холста (не обязательно)
	context.clearRect(0, 0, 600, 600);

	//background first
	context.save();
	context.transform(1.2, 0, 0, 1.2, bgmove.e/25, bgmove.f/25); 
	context.drawImage(backgroundImage, -20, -20, 600, 600);
	context.restore();
	//then asteroids
	//for (i in asteroid) context.drawImage(asteroidImage, asteroid[i].x, asteroid[i].y, 50, 50);
	for (i in asteroid) {
		context.save();
		context.translate(asteroid[i].x + 25, asteroid[i].y + 25);
		context.rotate(asteroid[i].angle);
		context.drawImage(asteroidImage, -25, -25, asteroid[i].size, asteroid[i].size);
		
		//context.fillStyle = "#ffffff";
		//context.font = "italic 20pt Arial";
		//context.fillText(asteroid[i].force, 25, 0);
		context.restore();
	}
	//then spaceship
	context.drawImage(shipImage, ship.x, ship.y, 50, 50);
	//and then bullets if exists

	for (i in bullets) context.drawImage(bulletsImage, bullets[i].x, bullets[i].y, 20, 30);

	for (i in expl) context.drawImage(explImage, 128 * Math.floor(expl[i].animx), 128 * Math.floor(expl[i].animy), 128, 128, expl[i].x, expl[i].y, 100, 100);

	context.fillStyle = "#ffffff";
	context.font = "italic 30pt Arial";
	context.fillText(score, 15, 35);
	context.strokeText(score, 15, 35);
}





var requestAnimFrame = (function () {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 20);
		};
})();


var canvas = document.getElementById('game');
var context = canvas.getContext('2d');

var asterCoords = [];
var bullets = [];
var expl = [];
var timer = 0;
var ship = { x: 300, y: 300 }; //, animx: 0, animy: 0};


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
});


//if explosion.png was loaded start the game
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

	// asteroid generator
	if (timer % 5 == 0) asterCoords.push({
		x: Math.random() * 550,
		y: -50,
		dx: Math.random() * 2 - 1,
		dy: Math.random() * 2 + 2,
		exist: true,
		angle: 0,
		dxangle: Math.random() * 0.1 - 0.05
	});

	//âûñòðåë
	if (timer % 10 == 0) {
		bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: 0, dy: -5.2 });
		bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: -1, dy: -5 });
		bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: 1, dy: -5 });
		bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: -2, dy: -4.8 });
		bullets.push({ x: ship.x + 15, y: ship.y - 20, dx: 2, dy: -4.8 });
	};

	//äâèãàåì ïóëè
	for (i in bullets) {
		bullets[i].x = bullets[i].x + bullets[i].dx;
		bullets[i].y = bullets[i].y + bullets[i].dy;

		if (bullets[i].y < -50) bullets.splice(i, 1);
	}

	//if asteroid comes out the screen it will destroyed
	for (i in asterCoords) {
		asterCoords[i].x = asterCoords[i].x + asterCoords[i].dx;
		asterCoords[i].y = asterCoords[i].y + asterCoords[i].dy;
		asterCoords[i].angle = asterCoords[i].angle + asterCoords[i].dxangle;

		if (asterCoords[i].x >= 550 || asterCoords[i].x <= 0) asterCoords[i].dx = -(asterCoords[i].dx);
		if (asterCoords[i].y >= 600) asterCoords.splice(i, 1);

		//bullets and asteroid collision
		for (j in bullets) {
			if (Math.abs(asterCoords[i].x + 25 - bullets[j].x - 15) < 50 && Math.abs(asterCoords[i].y - bullets[j].y) < 25) {

				//explosion start!!
				expl.push({ x: asterCoords[i].x - 25, y: asterCoords[i].y - 25, animx: 0, animy: 0 });

				asterCoords[i].exist = false;
				bullets.splice(j, 1);
				break;
			}
		}

		if (asterCoords[i].exist == false) asterCoords.splice(i, 1);
	}

	//àíèìàöèÿ âçðûâîâ
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
	//background first
	context.drawImage(backgroundImage, 0, 0, 600, 600);
	//then asteroids
	//for (i in asterCoords) context.drawImage(asteroidImage, asterCoords[i].x, asterCoords[i].y, 50, 50);
	for (i in asterCoords) {
		context.save();
		context.translate(asterCoords[i].x + 25, asterCoords[i].y + 25);
		context.rotate(asterCoords[i].angle);
		context.drawImage(asteroidImage, -25, -25, 50, 50);
		context.restore();
	}
	//then spaceship
	context.drawImage(shipImage, ship.x, ship.y, 50, 50);
	//and then bullets if exists

	for (i in bullets) context.drawImage(bulletsImage, bullets[i].x, bullets[i].y, 20, 30);

	for (i in expl) context.drawImage(explImage, 128 * Math.floor(expl[i].animx), 128 * Math.floor(expl[i].animy), 128, 128, expl[i].x, expl[i].y, 100, 100);
	
}





var requestAnimFrame = (function () {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
		function (callback) {
			window.setTimeout(callback, 1000 / 20);
		};
})();


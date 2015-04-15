function Vectorball() {
	
	this.speed = [0, 0];
	this.started = false;
	this.context = null;
	this.canvas = null;
	this.heroPos = [];
	this.lines = [];
	this.isDrawing = false;
		
	$(document).ready(function() {

		$("body").html('<canvas id="playground" />');
		vectorball.canvas = document.getElementById("playground");
		vectorball.canvas.width = window.innerWidth;
		vectorball.canvas.height = window.innerHeight;
		vectorball.heroPos = [vectorball.canvas.width/2, vectorball.canvas.height/2];
		vectorball.context = vectorball.canvas.getContext("2d");
		vectorball.initControls();
		vectorball.render();
	});
	
	Vectorball.prototype.initControls = function() {

		$(this.canvas).mousedown(function(event) {

			var mousePos = [event.offsetX, event.offsetY];
			if (!this.isDrawing) {

				vectorball.lines.push([mousePos]);
				vectorball.isDrawing = true;
			}
		});

		$(this.canvas).mousemove(function(event) {

			var mousePos = [event.offsetX, event.offsetY];
			if (vectorball.isDrawing) {

				vectorball.lines[vectorball.lines.length-1][1] = [mousePos[0], mousePos[1]];
			}
		});

		$(this.canvas).mouseup(function(event) {

			var mousePos = [event.offsetX, event.offsetY];
			if (vectorball.isDrawing) {

				vectorball.isDrawing = false;
				if (!vectorball.started) {

					vectorball.started = true;
				}
			}
		});

		$(this.canvas).mouseout(function(event) {

			var mousePos = [event.offsetX, event.offsetY];
			if (vectorball.isDrawing) {

				vectorball.lines[lines.length-1].push(mousePos);
				vectorball.isDrawing = false;
				if (!vectorball.started) {

					vectorball.started = true;
				}
			}
		});

		$(window).resize(function(event) {

			vectorball.canvas.width = window.innerWidth;
			vectorball.canvas.height = window.innerHeight;
		});

		$(this.canvas).on("contextmenu",function(){
		   return false;
		});
	}

	Vectorball.prototype.render = function() {
	 
		this.oldHeroPos = [this.heroPos[0], this.heroPos[1]];
		this.heroPos[0] += this.speed[0];
		this.heroPos[1] += this.speed[1];
		for (var i = 0; i < this.speed.length; i++) {

			if (this.speed[i] >= 1) {

				this.speed[i] *= .8;
			}
			else {

				this.speed[i] = 0;
			}
		}

		// Clear the canvas
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.lineCap = "round";

		if (this.started) {

			this.heroPos[1] += config.gravity;
		}

		var collisions = [];

		for (var k = 0; k < 2; k++) {

			if (k == 0) {

				this.context.lineWidth = 3*config.lineWidth;
				this.context.strokeStyle = "#000000";
			}
			else {

				this.context.lineWidth = config.lineWidth;
				this.context.strokeStyle = "#ff9900";
			}
			if (this.lines && this.lines.length > 0) {

				for (var i = 0; i < this.lines.length; i++) {

					if (this.isDrawing && k > 0 && i == this.lines.length-1) {

						this.context.strokeStyle = "#ff0000";
					}
					var line = this.lines[i];
					var point = line[0];
					point[1] -= 1;
					this.context.beginPath();
					this.context.moveTo(point[0], point[1]);
					for (var j = 1; j < line.length; j++) {

						point = line[j];
						if (this.started) {

							point[1] -= 1;
						}
						lastPoint = line[j-1];
						var dist = Util.dotLineLength(this.heroPos[0], this.heroPos[1], lastPoint[0], lastPoint[1], point[0], point[1], true);
						var minRadius = config.heroRadius+config.lineWidth;
						this.context.lineTo(point[0], point[1]);
						if (k > 0 && dist != null && dist < minRadius) {

							if (collisions.length == 1) {
								
								console.log(collisions);
							}
							collisions.push([lastPoint[0], lastPoint[1], point[0], point[1]]);
						}
					}
					this.context.stroke();
				}
			}
		}

		var maxY = this.canvas.height;
		this.canMove = true;

		for (var i = 0; i < collisions.length; i++) {

			var collision = collisions[i];
			this.heroPos = Util.getCirclePositionOnLine(collision[0], collision[1], collision[2], collision[3]);
		}
		if (collisions.length > 1) {

			this.canMove = false;
			this.heroPos = Util.getCirclePositionBetweenLines(collisions[0][0], collisions[0][1], collisions[0][2], collisions[0][3], 
				collisions[1][0], collisions[1][1], collisions[1][2], collisions[1][3]);
		}

		this.context.beginPath();
		this.context.arc(this.heroPos[0], this.heroPos[1], config.heroRadius, 0, 2 * Math.PI, false);
		this.context.fillStyle = "#00cc00";
		this.context.fill();
		this.context.lineWidth = config.lineWidth;
		this.context.strokeStyle = "#000000";
		this.context.stroke();

		// Redraw
		requestAnimationFrame(this.render.bind(this));
	};
}

var vectorball = new Vectorball();

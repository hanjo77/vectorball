function Util() {
	
}

Util.getCirclePositionOnLine = function(x1, y1, x2, y2) {

	var radius = config.heroRadius+config.lineWidth;
	var angle = (y1 > y2) ? Util.angleOfLine(x2, y2, x1, y1) : Util.angleOfLine(x1, y1, x2, y2);
	var vector = (y1 > y2) ? [x1-x2, y1-y2] : [x2-x1, y2-y1];
	var normal = (angle > 90) ? [-vector[1], vector[0]] : [vector[1], -vector[0]];
	var origin = Util.lineIntersect(x1, y1, x2, y2, vectorball.heroPos[0]-(normal[0]/2), vectorball.heroPos[1]-(normal[1]/2), vectorball.heroPos[0]+(normal[0]/2), vectorball.heroPos[1]+(normal[1]/2));
	var len = Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
	var acceleration = (angle > 90) ? (180-angle)/10 : angle/10;
	vectorball.speed = !isNaN((vector[0]/len)*acceleration) ? [(vector[0]/len)*acceleration, (vector[1]/len)*acceleration] : [0, gravity];
	normal = [(normal[0]/len)*radius, (normal[1]/len)*radius];
	return origin ? [origin[0]+normal[0], origin[1]+normal[1]] : [vectorball.heroPos[0]+vectorball.speed[0], vectorball.heroPos[1]+vectorball.speed[1]];
}

Util.getCirclePositionBetweenLines = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	
	var radius = config.heroRadius+config.lineWidth;
	var intersection = Util.lineIntersect(x1, y1, x2, y2, x3, y3, x4, y4);
	// Get points a and b (points of both lines with lowest y-coordinates

	if (intersection) {

		var a = (y1 < y2) ? [x1, y1] : [x2, y2];
		var b = (y3 < y4) ? [x3, y3] : [x4, y4];
		// Get unit vectors of lines	
		var v1 = [a[0]-intersection[0], a[1]-intersection[1]];
		var v2 = [b[0]-intersection[0], b[1]-intersection[1]];
		var len = Math.sqrt(Math.pow(v1[0], 2) + Math.pow(v1[1], 2));
		v1 = [v1[0]/len, v1[1]/len];
		len = Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2));
		v2 = [v2[0]/len, v2[1]/len];
		// Get unit vector of line in the middle of the two lines
		var m = [(v2[0]+v1[0])/2, (v2[1]+v1[1])/2];
		len = Math.sqrt(Math.pow(m[0], 2) + Math.pow(m[1], 2));
		m = [m[0]/len, m[1]/len];
		// Get angle of line in the middle of the lines
		var angle = Util.angleBetween2Lines(intersection[0], intersection[1], a[0], a[1], intersection[0], intersection[1], b[0], b[1])/(180/Math.PI);
		
		// Get length for line between the two lines
		var b = Math.sqrt(Math.pow(radius, 2)+(Math.pow(((radius+config.lineWidth)/Math.tan(angle)), 2)));
		if (b < radius) {
			
			b = radius;
		}
		var lambda = Math.sqrt(Math.pow(b, 2)/(Math.pow(m[0], 2)+Math.pow(m[1], 2)));
		return [intersection[0]+(b*m[0]), intersection[1]+(b*m[1])];
	}
	return heroPos;
}

/**
 * See: http://jsfromhell.com/math/dot-line-length
 *
 * Distance from a point to a line or segment.
 *
 * @param {number} x point's x coord
 * @param {number} y point's y coord
 * @param {number} x0 x coord of the line's A point
 * @param {number} y0 y coord of the line's A point
 * @param {number} x1 x coord of the line's B point
 * @param {number} y1 y coord of the line's B point
 * @param {boolean} overLine specifies if the distance should respect the limits
 * of the segment (overLine = true) or if it should consider the segment as an
 * infinite line (overLine = false), if false returns the distance from the point to
 * the line, otherwise the distance from the point to the segment.
 */
Util.dotLineLength = function(x, y, x0, y0, x1, y1, o) {
	
  function lineLength(x, y, x0, y0){
	return Math.sqrt((x -= x0) * x + (y -= y0) * y);
  }
  
  if(o && !(o = function(x, y, x0, y0, x1, y1){
	if(!(x1 - x0)) return {x: x0, y: y};
	else if(!(y1 - y0)) return {x: x, y: y0};
	var left, tg = -1 / ((y1 - y0) / (x1 - x0));
	return {x: left = (x1 * (x * tg - y + y0) + x0 * (x * - tg + y - y1)) / (tg * (x1 - x0) + y0 - y1), y: tg * left - tg * x + y};
  }(x, y, x0, y0, x1, y1), o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))){
	var l1 = lineLength(x, y, x0, y0), l2 = lineLength(x, y, x1, y1);
	return l1 > l2 ? l2 : l1;
  }
  else {
	var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
	return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
  }
};

Util.lineIntersect = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	var denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
	if (denom == 0.0) { // Lines are parallel.

		return null;
	}
	var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3))/denom;
	var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3))/denom;
	if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {

		// Get the intersection point.
		return [(x1 + ua*(x2 - x1)), (y1 + ua*(y2 - y1))];
	}

	return null;
}

/**
 * Determines the angle of a straight line drawn between point one and two. The number returned, which is a float in degrees, tells us how much we have to rotate a horizontal line clockwise for it to match the line between the two points.
 * If you prefer to deal with angles using radians instead of degrees, just change the last line to: "return Math.Atan2(yDiff, xDiff);"
 */
Util.angleOfLine = function(x1, y1, x2, y2) {
	
	var xDiff = x2 - x1;
	var yDiff = y2 - y1;
	return Math.atan2(yDiff, xDiff)*(180/Math.PI);
}

Util.angleBetween2Lines = function(x1, y1, x2, y2, x3, y3, x4, y4) {
	
	return (Util.angleOfLine(x1, y1, x2, y2) + Util.angleOfLine(x3, y3, x4, y4))/2;
}

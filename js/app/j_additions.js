var geo={};
	geo.pos={};
	geo.init = function(){
		if (navigator.geolocation){
			navigator.geolocation.getCurrentPosition(geo.set);
		}else{
			console.log("Geolocation is not supported by this browser.");
		}
	};
	geo.set = function(position){
		geo.pos=position;
	};
	geo.get = function(attr){
		if(attr=='lat')
			attr='latitude';
		if(attr=='lng' || attr=='lon')
			attr='longitude';
		return geo.pos[attr];
	};
	geo.getStack = function(){
		var obj = new StackMob.GeoPoint(geo.pos.coords.latitude, geo.pos.coords.longitude);
		return obj;
	};


var color={};
	color.isDark = function(hex){
		var v = color.getV(hex);
		return v<75;
	}
	color.getV = function(hex){
		var rgb = color.hexToRgb(hex),
		r = rgb.r / 255,
        g = rgb.g / 255,
        b = rgb.b / 255;

		var v = Math.max(r, g, b);
		return Math.round(v*100)
	}
	color.hexToRgb = function(hex) {
	    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
	        return r + r + g + g + b + b;
	    });

	    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	    return result ? {
	        r: parseInt(result[1], 16),
	        g: parseInt(result[2], 16),
	        b: parseInt(result[3], 16)
	    } : null;
	}


Messenger.options = {
	theme: 'future'
}
function notify(message, status, showTime){
	var options = {}
		options.message=message;
		options.showCloseButton=true;
		options.hideAfter=20;

	if(status!=undefined){
		options.type=status;
	}if(status=='error'){
		options.hideAfter=5;
	}
	if(showTime)
		options.hideAfter=showTime;
	Messenger().post(options);
}
function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


Array.prototype.max = function() {
  return Math.max.apply(null, this)
}
Array.prototype.min = function() {
  return Math.min.apply(null, this)
}
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return !(a.indexOf(i) > -1);});
};

Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(u.hasOwnProperty(this[i])) {
         continue;
      }
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}
Array.prototype.sum = function(){
    var sum = 0;
    this.map(function(item){
        sum += item;
    });
    return sum;
}
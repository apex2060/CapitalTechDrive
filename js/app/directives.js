app.directive('match', function(){
	return {
		require: 'ngModel',
		link: function(scope, elem, attrs, ctrl) {
			it.scopem=scope;
			it.attrs=attrs;
			it.ctrl=ctrl;
			ctrl.$parsers.unshift(function(viewValue){
				var matchVal=$('#'+attrs.match).val();
				if (viewValue==matchVal) {
					ctrl.$setValidity('matches', true);
					ctrl.style='';
					return viewValue;
				} else {
					ctrl.$setValidity('matches', false);
					ctrl.style=' error ';
					return undefined;
				}
			});
		}
	};
});
app.directive('inputMap', function(){
	/*
		This directive accepts the following variables:
		id 			(element id) 				//An element ID is required.
		variable 	(scope variable)			//Ususally you will want to make this a 2 piece var: 'data.geo'
		selectors 	(caps split by | pipe) 		'CIRCLE|RECTANGLE|MARKER' //The first one will be default
		color 		(hex color) 				'#00FF00'
		zoom 		(number) 					15
	*/
	return {
		restrict: 'E',
		replace: true,
		scope: {
			returnVar: '=variable',
			returnFun: '=function'
		},
		template: '<div>MAP</div>',
		link:function (scope, elem, attr){
			/*SETUP DEFAULT VARIABLES FOR DIRECTIVE*/
			scope.vars = {};
			scope.vars.selectors 	= new Array('MARKER','CIRCLE', 'RECTANGLE');
			scope.vars.color 		= '#1E90FF';
			scope.vars.zoom 		= 15;
			scope.vars.advanced		= true;

			/*SET VARIABLES IF PROVIDED*/
			if(attr.selectors)
				scope.vars.selectors = attr.selectors.split('|');
			if(attr.color)
				scope.vars.color = attr.color;
			if(attr.zoom)
				scope.vars.zoom = Number(attr.zoom);
			if(attr.advanced=='false')
				scope.vars.advanced = false;

			/*THESE CONSTANTS ARE REQUIRED*/
			scope.consts = {};
			scope.consts.modes = [];
			scope.consts.currentShape;
			$(scope.vars.selectors).each(function(index, elem){
				scope.consts.modes.push(google.maps.drawing.OverlayType[elem]);
			});

			/*INITIATE THE RETURN VARIABLE*/
			scope.returnVar={};

			/*
				This makes it easy to send data to stackmob... 
				It is also nicely formated for anything else you may want to do.  
				BUT!  If you want to change the way the object is returned: EDIT THIS!
			*/
			scope.geoStack=function geoStack(obj){
				if(scope.vars.advanced){
					var results={};
					results.type=obj.type;
					if(obj.type=='circle'){
						results.q 			='isWithinKm';
						results.center 		= {};
						results.center.lat 	=obj.getCenter().lat();
						results.center.lon 	=obj.getCenter().lng();
						results.radius 		=Math.round(obj.getRadius()) / 1000;
					}else if(obj.type=='rectangle'){
						results.q 			= 'isWithinBox';
						results.center 		= {};
						results.center.lat 	= obj.getBounds().getCenter().lat();
						results.center.lon 	= obj.getBounds().getCenter().lng();
						results.coords		= obj.getBounds().toUrlValue().split(',');
						results.bl 			= {lat:results.coords[0], lon:results.coords[1]};
						results.tr 			= {lat:results.coords[2], lon:results.coords[3]};
					}else if(obj.type=='marker'){
						delete results.type;
						results.lat			= obj.getPosition().lat();
						results.lon			= obj.getPosition().lng();
					}
				}else{
					var results=[];
					if(obj.type=='circle'){
						results.push(obj.getCenter().lat());
						results.push(obj.getCenter().lng());
						results.push(Math.round(obj.getRadius()) / 1000);
					}else if(obj.type=='rectangle'){
						results.push(obj.getSouthWest().lat());
						results.push(obj.getSouthWest().lng());
						results.push(obj.getNorthEast().lat());
						results.push(obj.getNorthEast().lng());
					}else if(obj.type=='marker'){
						results.push(obj.getPosition().lat());
						results.push(obj.getPosition().lng());
					}
				}
				return results;
			}

			scope.init=function init(){
				if (navigator.geolocation){
					navigator.geolocation.getCurrentPosition(scope.setupMap);
				}
			}
			scope.setupMap=function setupMap(geo) {
				var map = new google.maps.Map(document.getElementById(attr.id), {
					zoom: scope.vars.zoom,
					center: new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude),
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					disableDefaultUI: true,
					zoomControl: true
				});

				var polyOptions = {
					strokeWeight: 0,
					fillOpacity: 0.45,
					editable: false
				};
				drawingManager = new google.maps.drawing.DrawingManager({
					drawingControlOptions: {
						position: google.maps.ControlPosition.TOP_CENTER,
						drawingModes: scope.consts.modes
					},
					drawingMode: scope.consts.modes[0],
					rectangleOptions: polyOptions,
					circleOptions: polyOptions,
					map: map
				});

				google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
					scope.deleteOld();
					var newShape = e.overlay;
						newShape.type = e.type;
						scope.setCurrent(newShape);
						scope.$apply(function(){
							scope.returnVar=scope.geoStack(newShape);
						});
						if(typeof(scope.returnFun)=='function'){
							scope.returnFun(scope.geoStack(newShape));
						}
				});

				var rectangleOptions = drawingManager.get('rectangleOptions');
				rectangleOptions.fillColor = scope.vars.color;
				drawingManager.set('rectangleOptions', rectangleOptions);

				var circleOptions = drawingManager.get('circleOptions');
				circleOptions.fillColor = scope.vars.color;
				drawingManager.set('circleOptions', circleOptions);
			}
			scope.setCurrent=function setCurrent(shape) {
				scope.consts.currentShape = shape;
			}
			scope.deleteOld=function deleteOld() {
				if (scope.consts.currentShape) {
					scope.consts.currentShape.setMap(null);
				}
			}
			scope.init();
		}
	}
});

app.directive('columnChart', function() {
	return function(scope, element, attrs) {
		var chart = new google.visualization.ColumnChart(element[0]);
		scope.$watch(attrs.columnChart, function(value) {
			var data = google.visualization.arrayToDataTable(value);
			var options = {
				title: attrs.chartTitle,
				hAxis: {title: attrs.chartHaxisTitle, titleTextStyle: {color: 'blue'}},
				'width':500,
				'height':300
			}
			if(attrs.chartColors){
				options.colors=JSON.parse(attrs.chartColors);
			}
			chart.draw(data, options);
		});
	}
})
app.directive('barChart', function() {
	return function(scope, element, attrs) {
		var chart = new google.visualization.BarChart(element[0]);
		scope.$watch(attrs.barChart, function(value) {
			var data = google.visualization.arrayToDataTable(value);
			var options = {
				title: attrs.chartTitle,
				vAxis: {title: attrs.chartHaxisTitle, titleTextStyle: {color: 'blue'}},
				'width':500,
				'height':300
			}
			if(attrs.chartColors){
				options.colors=JSON.parse(attrs.chartColors);
			}
			chart.draw(data, options);
		});
	}
})
app.directive('lineChart', function() {
	return function(scope, element, attrs) {
		var chart = new google.visualization.LineChart(element[0]);
		scope.$watch(attrs.lineChart, function(value) {
			alert('lineChart')
			var data = google.visualization.arrayToDataTable(value);
			var options = {
				title: attrs.chartTitle,
				hAxis: {title: attrs.chartHaxisTitle, titleTextStyle: {color: 'blue'}},
				'width':500,
				'height':300
			}
			if(attrs.chartColors){
				options.colors=JSON.parse(attrs.chartColors);
			}
			chart.draw(data, options);
		});
	}
})

app.directive('motionChart', function() {
	return function(scope, element, attrs) {
		var chart = new google.visualization.MotionChart(element[0]);
		scope.$watch(attrs.motionChart, function(value) {
			var data = google.visualization.arrayToDataTable(value, false);
			var options = {
				title: attrs.chartTitle,
				'width':500,
				'height':300
			}
			chart.draw(data, options);
		});
	}
})
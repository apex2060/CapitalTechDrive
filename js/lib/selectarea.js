	var mapSelect={};
	mapSelect.selectedShape;
	mapSelect.color = '#1E90FF';

	function clearSelection() {
		if (mapSelect.selectedShape) {
			mapSelect.selectedShape.setEditable(false);
		}
	}

	function setSelection(shape) {
		clearSelection();
		mapSelect.selectedShape = shape;
		shape.setEditable(true);
	}

	function deleteOld() {
		if (mapSelect.selectedShape) {
			mapSelect.selectedShape.setMap(null);
		}
	}

	function geoStack(obj){
		var results={};
		results.title=obj.title;
		results.type=obj.type;
		if(results.type=='circle'){
			results.q='isWithinKm';
			results.center=obj.getCenter().toUrlValue().split(',');
			results.radius=Math.round(obj.getRadius()) / 1000;

		}else if(results.type=='rectangle'){
			results.q='isWithinBox';
			results.coords=obj.getBounds().toUrlValue().split(',');
			results.bl={lat:results.coords[0], lng:results.coords[1]};
			results.tr={lat:results.coords[2], lng:results.coords[3]};
		}
		return results;
	}
	function init(){
		if (navigator.geolocation){
			navigator.geolocation.getCurrentPosition(initialize);
		}
	}
	function initialize(geo) {
		var map = new google.maps.Map(document.getElementById('map'), {
			zoom: 10,
			center: new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude),
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true,
			zoomControl: true
		});

		var polyOptions = {
			strokeWeight: 0,
			fillOpacity: 0.65,
			editable: true
		};
		drawingManager = new google.maps.drawing.DrawingManager({
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
					google.maps.drawing.OverlayType.CIRCLE,
					google.maps.drawing.OverlayType.RECTANGLE
				]
			},
			drawingMode: google.maps.drawing.OverlayType.CIRCLE,
			rectangleOptions: polyOptions,
			circleOptions: polyOptions,
			map: map
		});

		google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
			deleteOld();
			if (e.type != google.maps.drawing.OverlayType.MARKER) {
				drawingManager.setDrawingMode(null);

				var newShape = e.overlay;
				newShape.type = e.type;
				setSelection(newShape);
				console.log(geoStack(newShape));
				google.maps.event.addListener(newShape, 'click', function() {
					setSelection(newShape);
				});
			}
		});

		google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
		google.maps.event.addListener(map, 'click', clearSelection);

		var rectangleOptions = drawingManager.get('rectangleOptions');
		rectangleOptions.fillColor = mapSelect.color;
		drawingManager.set('rectangleOptions', rectangleOptions);

		var circleOptions = drawingManager.get('circleOptions');
		circleOptions.fillColor = mapSelect.color;
		drawingManager.set('circleOptions', circleOptions);
	}
	google.maps.event.addDomListener(window, 'load', init);
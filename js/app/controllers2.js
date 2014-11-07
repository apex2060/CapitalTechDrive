var BoardCtrl = app2.controller('BoardCtrl', function($scope) {
	var game={};
	game.defaults 						= {}
		game.defaults.google 			= {};
		game.defaults.google.key 		= 'AIzaSyBnuRAtKVkTjo385XMKpH2xCI9Q6DJmSb8';
		game.defaults.google.clientId 	= '397965988459.apps.googleusercontent.com';
		game.defaults.abc				= Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','Aa','Bb','Cc','Dd','Ee','Ff','Gg','Hh','Ii','Jj','Kk','Ll');

	game.prices = function(pos, type){
		var prices={};
		prices.cost=(pos*100);
		prices.majority=(pos*1000);
		prices.minority=(pos*1000)/2;
		if(type!=undefined){
			return prices[type];
		}else{
			return prices;
		}
	}
	game.data = {};
	game.tile = {};
		game.tile.display = function(tile){
			if(tile!=undefined)
				return game.defaults.abc[tile.r]+(tile.c+1);
		}
	game.corp = {};
		game.corp.prices = function(corp, tile_ct){
			if(corp!=undefined){
				if(tile_ct==undefined)
					tile_ct = game.corp.list[corp].tiles.length;
				if(tile_ct==0)
					tile_ct = 2;
				else if(tile_ct>=6 && tile_ct<=10)
					tile_ct = 6;
				else if(tile_ct>=11 && tile_ct<=20)
					tile_ct = 7;
				else if(tile_ct>=21 && tile_ct<=30)
					tile_ct = 8;
				else if(tile_ct>=31 && tile_ct<=40)
					tile_ct = 9;
				else if(tile_ct>=41)
					tile_ct = 10;

				var st_cost = tile_ct+game.corp.list[corp].start_cost;
				return game.prices(st_cost);
			}
		}

	game.realtime = {};
	game.realtime.options = {
		clientId: game.defaults.google.clientId,
		authButtonElementId: 'authorizeButton',
		initializeModel: function(model){
			model.beginCompoundOperation();
			var t_list = model.createList(game.tile.list);
			model.getRoot().set('t_list', t_list);
			model.endCompoundOperation();
		},
		autoCreate: true,
		defaultTitle: "Capital Game",
		onFileLoaded: function(doc) {
			game.conrtol 		= {};
			game.conrtol.doc 	= doc;
			game.conrtol.model 	= doc.getModel();
			game.conrtol.corps 		= game.conrtol.model.getRoot().get('corp');
			game.conrtol.players 	= game.conrtol.model.getRoot().get('player');
			game.conrtol.t_list 	= game.conrtol.model.getRoot().get('t_list');
			game.conrtol.t_avail 	= game.conrtol.model.getRoot().get('t_avail');

			$scope.$apply(function(){
				game.data.t_list 			= angular.fromJson(angular.toJson(game.conrtol.model.getRoot().get('t_list').asArray()));
			})
			game.conrtol.t_list.addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED, 
				function(changed){
					$scope.$apply(function(){
						game.data.t_list 	= angular.fromJson(angular.toJson(game.conrtol.model.getRoot().get('t_list').asArray()));
					});
				}
			);
		}
	}
	game.realtime.start = function() {
		var realtimeLoader = new rtclient.RealtimeLoader(game.realtime.options);
		realtimeLoader.start();
		game.realtime.status=true;
	}
	game.realtime.start();
	$scope.game	= game;
	it.game=$scope.game;
});
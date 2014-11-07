var MainCtrl = app.controller('MainCtrl', function($scope) {
	var game						= {};
	game.defaults 					= {};
	game.details 					= {};
		game.details.current 		= 0;
		game.details.last 			= 0;
	game.settings 					= {};
	game.turn 						= {};
		game.turn.end 				= true;
	game.stats 						= {};
	game.ai 						= {};
	game.player 					= {};
		game.player.list			= [];
	game.corp 						= {};
		game.corp.stock 			= {};
		game.corp.merger			= {};
			game.corp.merger.list 	= [];
			game.corp.merger.array 	= [];
			game.corp.merger.data 	= {};
	game.tile 						= {};
		game.tile.list 				= [];

	game.defaults.google 				= {};
		game.defaults.google.key 		= 'AIzaSyCEugXvbob9DFkm5CE7goqYD9uavz07IQM';
		game.defaults.google.clientId 	= '96880613868-ddjmp7d384tfvrihff8ag69mgav2oj8g.apps.googleusercontent.com';
	game.defaults.abc					= Array('A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','Aa','Bb','Cc','Dd','Ee','Ff','Gg','Hh','Ii','Jj','Kk','Ll');
	game.defaults.notifications = [{"name":"None", "audio":""},{"name":"soft", "audio":new Audio("audio/switch.mp3")},{"name":"loud", "audio":new Audio("audio/done.mp3")}];
	game.defaults.start_money 			= 6000;
	game.defaults.bench_tile_ct 		= 6;
	game.defaults.grid_r				= 9;
	game.defaults.grid_c 				= 12;
	game.defaults.stock_ct 				= 25;
	game.defaults.corps 				= [
		{"symbol":"NAPS", 		"name":"Napster", 		"start_cost":0, 	"color":"#9ECC00",		"list":[], "tiles":[], "stock":game.defaults.stock_ct},
		{"symbol":"ENRNQ", 		"name":"Enron", 		"start_cost":0, 	"color":"#BC15E9",		"list":[], "tiles":[], "stock":game.defaults.stock_ct},
		{"symbol":"INTC", 		"name":"Intel", 		"start_cost":1, 	"color":"#e1e1e1",		"list":[], "tiles":[], "stock":game.defaults.stock_ct},
		{"symbol":"FB", 		"name":"Facebook", 		"start_cost":1, 	"color":"#133783",		"list":[], "tiles":[], "stock":game.defaults.stock_ct},
		{"symbol":"MSFT", 		"name":"Microsoft", 	"start_cost":1, 	"color":"#268726",		"list":[], "tiles":[], "stock":game.defaults.stock_ct},
		{"symbol":"AMZN", 		"name":"Amazon", 		"start_cost":2, 	"color":"#E47911",		"list":[], "tiles":[], "stock":game.defaults.stock_ct},
		{"symbol":"TSLA", 		"name":"Tesla", 		"start_cost":2, 	"color":"#fe0000",		"list":[], "tiles":[], "stock":game.defaults.stock_ct},
		{"symbol":"GOOG", 		"name":"Google", 		"start_cost":3, 	"color":"#0000EF",		"list":[], "tiles":[], "stock":game.defaults.stock_ct}
	];
	// game.defaults.corps 				= [
	// 	{"symbol":"SWY", 		"name":"Safeway", 		"start_cost":0, 	"color":"#990101",		"list":[]},
	// 	{"symbol":"DNKN", 		"name":"Dunkin", 		"start_cost":0, 	"color":"#FF721A",		"list":[]},
	// 	{"symbol":"KO", 		"name":"CocaCola", 		"start_cost":1, 	"color":"#5B9BCE",		"list":[]},
	// 	{"symbol":"K", 			"name":"Kellogs",	 	"start_cost":1, 	"color":"#D31145",		"list":[]},
	// 	{"symbol":"HSY", 		"name":"Hershey", 		"start_cost":1, 	"color":"#240c0c",		"list":[]},
	// 	{"symbol":"PEP", 		"name":"PepsiCo", 		"start_cost":2, 	"color":"#003399",		"list":[]},
	// 	{"symbol":"WMT", 		"name":"Walmart", 		"start_cost":2, 	"color":"#FDBA31",		"list":[]},
	// ];
	game.defaults.player 				= {
		"name":"New Player",
		"color":"#009",
		"auto":true,
		"money":game.defaults.start_money,
		"tiles":[],
		"stock": {}
	}
	game.settings.notification = 0;
	game.settings.setNotification = function(){
		if(game.settings.notification!=game.defaults.notifications.length-1)
			game.settings.notification++;
		else
			game.settings.notification=0;
	}
	game.turn.init = function(){
		console.log('init');
		game.turn.end=false;
		game.turn.progress 		= [];
		game.turn.progress[0]	= 'active';
		game.turn.stock_ct		= 0;
		$scope.safeApply();
		game.turn.notify();
	}
	game.turn.getNext = function(turn){
		if(turn==undefined)
			turn = game.details.current;
		if(turn!=game.player.list.length-1)
			return turn+1;
		else{
			return 0;
		}
	}
	game.turn.next = function(){
		var nextPlayer = game.turn.getNext();
		//console.log(game.player.list[game.details.current].name+' > '+game.player.list[nextPlayer].name);
		if(!game.stats.end && (game.details.current==game.player.me.index || game.player.list[game.details.current].auto)){ //||
			game.tile.clean(game.details.current);
			game.ai.ref.corpCheck();
			//Messenger().hideAll();
			
			game.details.last = game.details.current;
			game.details.current = nextPlayer;

			if(game.details.current==0)
				game.stats.addHistory();

			if(game.realtime.doc!=undefined){
				game.realtime.corp.replaceRange(0,game.corp.list);
				game.realtime.player.replaceRange(0,game.player.list);
				game.realtime.tiles.replaceRange(0,game.tile.list);

				game.realtime.details.set('current', game.details.current);
				game.realtime.details.set('last', game.details.last);
			}

			game.turn.progress[1]='';
			game.turn.progress[3]='active';
			game.turn.end=true;
			//console.log('autoCheck: ',game.player.list[game.details.current]);
			if(game.player.list[game.details.current].auto){
				console.log('Starting Auto Play for: '+game.player.list[game.details.current].name)
				game.ai.play();
			}
		}
	}
	game.turn.notify = function(){
		if(game.settings.notification!=0){
			game.defaults.notifications[game.settings.notification].audio.play();
		}
	}

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

	//GAME|CORP
		game.corp.init = function(replay){
			if(replay)
				game.realtime.corp.replaceRange(0,JSON.parse(JSON.stringify(game.defaults.corps)));
			game.corp.merger.init();
		}
		game.corp.showList = function(){
			$('#corps').modal('show');
			// $('#corps').modal({
			// 	show: true,
			// 	keyboard: false,
			// 	backdrop: 'static'
			// });
		}
		game.corp.addTile = function(corp, tile){
			game.tile.list[tile.r][tile.c].corp=corp;
			game.tile.list[tile.r][tile.c].style=game.corp.list[corp].symbol;
			if(game.corp.list[corp].tiles.indexOf(tile) == -1)
				game.corp.list[corp].tiles.push(tile);
		}
		game.corp.remove = function(corp){
			game.corp.list[corp].tiles=[];
		}
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
		//GAME.CORP.STOCK
			game.corp.stock.assign = function(corp, free){
				var stock = {};
					stock.corp = corp;
					stock.name = game.corp.list[corp].name;
					if(!free)
						stock.price = game.corp.prices(corp).cost;
					else
						stock.price = 0;
				if(game.corp.list[corp].stock>0){
					// var trans = {};
					// 	trans.date=new Date();
					// 	trans.user=game.details.current;
					// 	trans.type='purchase';
					// 	trans.corp=corp;
					// 	trans.amt=stock.price;
					// game.stats.history.push(trans);
					game.stats.money_spent+=stock.price;

					game.player.list[game.details.current].money -= stock.price;
					game.player.list[game.details.current].stock[corp].list.push(stock);
					game.corp.list[corp].stock--;
				}
			}
			game.corp.stock.buyList = function(){
				if(game.turn.progress[1]=='active'){
					game.corp.func = function(corp){
						game.corp.stock.buy(corp);
						if(game.turn.stock_ct>=3){
							$('#corps').modal('hide');
							game.corp.func = function(){};
						}
					}
					// $('#corps').modal('show');
					$('#corps').modal({
						show: true,
						keyboard: false,
						backdrop: 'static'
					});
				}else{
					game.notify('You must place a tile first.', 'error');
				}
			}
			game.corp.stock.buy = function(corp){
				if(game.turn.progress[1]=='active'){
						if(game.corp.list[corp]!=undefined && game.corp.list[corp].tiles.length>0){
							if(game.corp.list[corp].stock>0){
								if(game.turn.stock_ct<3){
									if(game.corp.prices(corp).cost<=game.player.list[game.details.current].money){
										game.turn.stock_ct++;
										game.notify('Purchased stock in: '+game.corp.list[corp].name+' for: $'+game.corp.prices(corp).cost);
										game.corp.stock.assign(corp);
										if(game.turn.stock_ct==3){
											game.turn.next();
										}
									}else{
										game.notify('You do not have enough money to buy this stock.', 'error');
									}
								}else{
									game.notify('You can only buy 3 stocks each turn.', 'error');
								}
							}else{
								game.notify('There are no more stocks for this corp.', 'error');
							}
						}else{
							game.notify('You can only buy stock in a company that is on the board.', 'error');
						}
				}else{
					game.notify('You must place a tile first.', 'error');
				}
			}
			//GAME.CORP.MERGER
			game.corp.merger.init = function(){
				game.corp.merger.array = [];
				game.corp.merger.data = {};
			}
			game.corp.merger.settle = function(corp){
				var corpName = game.corp.list[corp].name;
				var money 		= game.corp.prices(corp);
				var shares 		= game.ai.majMin(corp);
				var majSH 		= shares.majSH;
				var minSH 		= shares.minSH;

				if(majSH.length>1){
					var amt = Math.ceil((money.majority+money.minority)/majSH.length);
					game.notify('There were '+majSH.length+' majority share holders.  Each will receive: $'+amt);
					for(var i=0; i<majSH.length; i++){
						var player = majSH[i];
						game.player.list[player].money += amt;
						game.notify(game.player.list[player].name+' received '+amt+' for majority shares in '+corpName+'.');
					}
				}else if(shares.min==0){
					var player = majSH[0];
					if(player != undefined){
						var amt = money.majority+money.minority;
						game.player.list[player].money += amt;
						game.notify(game.player.list[player].name+' received '+amt+' for majority and minority shares in '+corpName+'.');
					}else{
						console.debug('Player: '+player+' does not exist.');
					}
				}else{
					//Assign maj money:
					game.player.list[majSH[0]].money += money.majority;
					game.notify(game.player.list[majSH[0]].name+' received '+money.majority+' for majority shares in '+corpName+'.');
					//Assign min money:
					if(minSH.length>1){
						var amt = Math.ceil((money.minority)/minSH.length);
						game.notify('There were '+minSH.length+' minority share holders.  Each will receive: $'+amt);
						for(var i=0; i<minSH.length; i++){
							var player = minSH[i];
							game.player.list[player].money += amt;
							game.notify(game.player.list[player].name+' received '+amt+' for minority shares in '+corpName+'.');
						}
					}else{
						game.player.list[minSH[0]].money += money.minority;
						game.notify(game.player.list[minSH[0]].name+' received '+money.minority+' for minority shares in '+corpName+'.');
					}
				}
				/* END: Give out Majority/Minority Shareholder Earnings */
			}
			game.corp.merger.push = function(mcorp, rcorp, tile_ct){
				var data = {}
					data.cp=game.details.current;
					data.mcorp=mcorp;
					data.rcorp=rcorp;
					data.tile_ct=tile_ct;
				game.corp.merger.array.push(data);
			}
			game.corp.merger.transact = function(){
				game.corp.merger.turn_ct = 0;
				game.corp.merger.turn = game.details.current;
				game.corp.merger.data = game.corp.merger.array.pop();
				$('#mergeSell').modal({
					show: true,
					keyboard: false,
					backdrop: 'static'
				});
				if(game.player.list[game.corp.merger.turn].auto){
					game.ai.tradeSell(game.corp.merger.turn);
				}
			}

			game.corp.merger.func = function(){
				game.corp.merger.turn = game.turn.getNext(game.corp.merger.turn)

				if(game.corp.merger.turn_ct >= game.player.list.length-1){
					if(game.corp.merger.array.length>0){
						game.corp.merger.turn_ct = 0;
						game.corp.merger.data = game.corp.merger.array.pop();
						if(game.player.list[game.corp.merger.turn].auto){
							game.ai.tradeSell(game.corp.merger.turn);
						}
					}else{
						$('#mergeSell').modal('hide');
						game.notify('All transactions are complete.');
						if(game.tile.placeSuccess!=undefined){
							game.tile.placeSuccess();
							game.tile.placeSuccess=undefined;
						}
					}
				}else{
					game.corp.merger.turn_ct++;
					if(game.player.list[game.corp.merger.turn].auto){
						game.ai.tradeSell(game.corp.merger.turn);
					}
				}
			}
			game.corp.merger.trade = function(player){
				var mcorp = game.corp.merger.data.mcorp; //Stays
				var rcorp = game.corp.merger.data.rcorp; //Leaves
				var rList = game.player.list[player].stock[rcorp].list;
				if(rList.length >= 2){
					if(game.corp.list[mcorp].stock>0){
						var s1 = rList.pop();
						var s2 = rList.pop();
						game.corp.list[rcorp].stock+=2;

						var stock = {};
						stock.corp = mcorp;
						stock.name = game.corp.list[mcorp].name;
						stock.price = s1.price + s2.price;
						game.corp.list[mcorp].stock--;
						game.player.list[player].stock[mcorp].list.push(stock);

						game.notify(game.player.list[player].name+' traded 2/1 stock.');
					}else{
						game.notify('There are no more stocks available for '+game.corp.list[mcorp].name, 'error');
					}
				}else{
					game.notify('You need to have at least 2 stocks in order to trade 2 for 1.', 'error');
				}
			}
			game.corp.merger.sell = function(player){
				var rcorp = game.corp.merger.data.rcorp;
				var tile_ct = game.corp.merger.data.tile_ct;
				var rList = game.player.list[player].stock[rcorp].list;
				if(rList.length>0){
					var soldStock =rList.pop();
					var sellPrice = game.corp.prices(rcorp, tile_ct).cost;
					game.corp.list[rcorp].stock++;
					game.player.list[player].money += sellPrice;
					game.notify(game.player.list[player].name+' received '+sellPrice+' for selling a stock which was purchased for: '+soldStock.price);
				}else{
					game.notify('You can not sell stocks you do not have!', 'error');
				}
			}

		//GAME|PLAYER
		game.player.init = function(playAgain){
			if(playAgain){
				for(var i=0; i<game.player.list.length; i++){
					game.player.list[i].money = game.defaults.start_money;
					game.player.list[i].stock = JSON.parse(JSON.stringify(game.defaults.corps));
					game.realtime.player.replaceRange(0,game.player.list);
				}
			}else{
				game.player.list=[];
			}
		}
		game.player.showList = function(){
			$('#players').modal('show');
		}
		game.player.add = function(collaborator){
			var newPlayer = JSON.parse(JSON.stringify(game.defaults.player));
			newPlayer.stock = JSON.parse(JSON.stringify(game.defaults.corps));
			var doAdd = true;
			if(collaborator!=undefined){
				if(game.player.getIndex(collaborator) != -1){
					doAdd=false;
					console.log('duplicate: '+sid);
					//NOTE: this might be where we loose receiving tiles when a player re-opens... not sure.
				}
				if(doAdd){
					newPlayer.auto = false;
					newPlayer.name = collaborator.displayName;
					newPlayer.color = collaborator.color;
					newPlayer.photoUrl = collaborator.photoUrl;
					newPlayer.sessionId = collaborator.sessionId;
					newPlayer.userId = collaborator.userId;
				}
			}else{
				newPlayer.name = $('#player_name').val();
				newPlayer.color = $('#player_color').val();
			}

			if(doAdd){
				var tiles = game.tile.getSet();
				//console.log('tiles ',tiles.length);
				newPlayer.tiles = (tiles);
				game.player.list.push(newPlayer);
				if(game.realtime.doc!=undefined){
					console.log('new player',game.realtime.player.push(newPlayer));
					game.realtime.tiles.replaceRange(0,game.tile.list);
				}
				$('#player_name').val('');
				$('#player_color').val('');
			}
		}
		game.player.remove = function(index){
			if(game.player.list){
				var player = game.player.list[index];
				//console.log('remove',player);
				for(var i=0; i<player.tiles.length; i++){
					var tile = player.tiles[i];
					game.tile.list[tile.r][tile.c].status='';
				}
				for(var i=0; i<player.stock.length; i++){
					if(player.stock[i]!=undefined){
						game.corp.list[i].stock+=player.stock[i].list.length;
					}
				}
				game.player.list.splice(index,1);
				if(game.realtime.doc!=undefined){
					game.realtime.player.remove(index);
					game.realtime.tiles.replaceRange(0,game.tile.list);
					game.realtime.corp.replaceRange(0,game.corp.list);
					if(game.details.current>game.player.list.length-1)
						game.realtime.details.set('current',0);
				}
			}
		}
		game.player.takeOver = function(playerIndex){
			var myIndex = game.player.getIndex(game.player.me);
			if(myIndex == playerIndex){
				game.player.list[myIndex].auto=false;
				game.realtime.player.set(myIndex, game.player.list[myIndex]);
			}else{
				var myData 	= JSON.parse(JSON.stringify(game.player.list[myIndex]));	//All MY data (I want all BUT STOCK,tiles,money)
				var newData	= JSON.parse(JSON.stringify(game.player.list[playerIndex]));	//All old data (I want THIS STOCK,tiles,money)

				var newMod = JSON.parse(JSON.stringify(myData));	//myIndex	//This has my name & session Id
					newMod.stock = JSON.parse(JSON.stringify(newData.stock));	//Now I get the new stock
					newMod.tiles = JSON.parse(JSON.stringify(newData.tiles));
					newMod.money = newData.money;
					newMod.index = newData.index;
					newMod.auto  = false;

				var oldMod 	= JSON.parse(JSON.stringify(newData));	//playerIndex	//This is now a computer
					oldMod.stock = JSON.parse(JSON.stringify(myData.stock));	//Old player gets what I had
					oldMod.tiles = JSON.parse(JSON.stringify(myData.tiles));
					oldMod.money = myData.money;
					oldMod.index = myData.index;
					oldMod.auto  = true;

				//console.log(JSON.stringify(newMod))
				//console.log(JSON.stringify(oldMod))

				game.player.me = newMod;
				game.player.list[playerIndex] 	= newMod;	// This is the new me
				game.player.list[myIndex] 	= oldMod;	// This is the old me

				game.realtime.player.replaceRange(0,game.player.list);
				game.player.remove(myIndex);
			}
		}
		game.player.auto = function(playerIndex){
			if(game.player.isMe(playerIndex) || game.player.status(playerIndex)=='innactive')
				game.player.list[playerIndex].auto=!game.player.list[playerIndex].auto;
			if(game.realtime.doc!=undefined){
				game.realtime.player.set(playerIndex, game.player.list[playerIndex]);
			}
		}
		game.player.update = function(index,commit){
			if(commit){
				if(game.player.status(index)=='auto' || game.player.isMe(index)){
					game.player.list[index].update=false;
					if(game.player.isMe(index)){
						game.player.me = game.player.list[index];
						game.player.me.index = index;
					}
					if(game.realtime.doc!=undefined){
						game.realtime.player.set(index, game.player.list[index]);
					}
				}else{
					game.notify('You can only update your account or a computer account.', 'error');
				}
			}else{
				game.player.list[index].update=true;
			}
		}
		game.player.isMe = function(playerIndex){
			var player = game.player.list[playerIndex];
			if(game.player.me)
				if(player.sessionId==game.player.me.sessionId)
					return 'isMe';
		}
		game.player.status = function(playerIndex){
			var player = game.player.list[playerIndex];
			if(player.auto)
				return 'auto';
			else if(!game.player.isOnline(player))
				return 'innactive';
			else
				return 'active';
		}
		game.player.getUserIndex = function(collaborator){
			if(typeof collaborator=='object')
				var userId=collaborator.userId;
			else
				var userId=collaborator;
			for(var i=0; i<game.player.list.length; i++)
				if(game.player.list[i].userId==userId)
					return i;
			return -1;
		}
		game.player.getIndex = function(collaborator){
			if(typeof collaborator=='object')
				var sessionId=collaborator.sessionId;
			else
				var sessionId=collaborator;
			for(var i=0; i<game.player.list.length; i++)
				if(game.player.list[i].sessionId==sessionId)
					return i;
			return -1;
		}
		game.player.getObj = function(collaborator){
			if(typeof collaborator=='object')
				var sessionId=collaborator.sessionId;
			else
				var sessionId=collaborator;
			for(var i=0; i<game.player.list.length; i++)
				if(game.player.list[i].sessionId==sessionId)
					return game.player.list[i];
			return -1;
		}
		game.player.isOnline = function(collaborator){
			var colabs = game.realtime.doc.getCollaborators();
			for(var i=0; i<colabs.length; i++)
				if(collaborator.sessionId && colabs[i].sessionId == collaborator.sessionId)
					return true;
			return false;
		}
		game.player.myPiece = function(tile){
			if(game.player.list[game.details.current]){
				if(game.player.list[game.details.current].auto)
					player = game.player.list[game.details.current];
				else if(game.player.me)
					var player = game.player.list[game.player.me.index];
				if(player && tile){
					for(var i=0; i<player.tiles.length; i++){
						var pt=player.tiles[i];
						if(pt){
							if(tile.r==pt.r && tile.c==pt.c){
								return 'myPiece';
							}
						}
					}
				}
			}
		}
		game.player.myTurn = function(){
			var player = game.player.list[game.details.current];
			if(game.player.me && player)
				if(player.sessionId==game.player.me.sessionId)
					return true;
			return false;
		}
		game.player.getStock = function(playerIndex){
			if(playerIndex==undefined && game.player.me!=undefined)
				playerIndex = game.player.me.index;
			var player = game.player.list[playerIndex];
			if(player!=undefined){
				var stock = player.stock;
				var stockOwned = [];
				for(var i=0; i<stock.length; i++){
					if(stock[i].list.length){
						stock[i].corp=i;
						stockOwned.push(stock[i]);
					}
				}
				return stockOwned;
			}else{
				return [];
			}
		}
		game.player.stockCt = function(playerIndex){
			var stock = game.player.list[playerIndex].stock;
			var stock_ct = 0;
			for(var i=0; i<stock.length; i++){
				stock_ct += stock[i].list.length;
			}
			return stock_ct;
		}
		game.player.getTiles = function(playerIndex){
			if(playerIndex==undefined && game.player.me!=undefined)
				playerIndex = game.player.me.index;
			if(playerIndex!=undefined)
				return game.player.list[playerIndex].tiles;
		}

		//GAME|STATS
		game.stats.player = function(){
			var stats=[[''],['']];
			for(var i=0; i<game.player.list.length; i++){
				stats[0].push(game.player.list[i].name);
				stats[1].push(game.player.list[i].money);
			}
			//var stock = game.player.list[game.details.current].stock;
			return stats;
		}
		game.stats.hColors = function(){
			var colors=[];
			if(game.corp.list!=undefined)
				for(var i=0; i<game.corp.list.length; i++){
					colors.push(game.corp.list[i].color);
				}
			return colors;
		}

		game.stats.playerStock = function(){
			var stats=[];
				stats[0]=[];
				stats[0][0]='Players'
			for(var i=0; i<game.defaults.corps.length; i++){
				stats[0].push(game.defaults.corps[i].name);
			}
			for(var i=0; i<game.player.list.length; i++){
				var pStats = [];
				pStats.push(game.player.list[i].name);
				for(var ii=0; ii<game.defaults.corps.length; ii++){
					pStats.push(game.player.list[i].stock[ii].list.length);
				}
				stats.push(pStats);
			}
			game.stats.stock=stats;
			// $('#stocks').modal('show');
			$('#stocks').modal({
				show: true,
				keyboard: false,
				backdrop: 'static'
			});
		}
		game.stats.stockOwner = function(){
			var stats=[];
			stats[0]=[];
			stats[0][0]='corps'
			for(var i=0; i<game.player.list.length; i++){
				stats[0].push(game.player.list[i].name);
			}
			for(var i=0; i<game.defaults.corps.length; i++){
				var pStats = [];
				pStats.push(game.corp.list[i].name);
				for(var ii=0; ii<game.player.list.length; ii++){
					pStats.push(game.player.list[ii].stock[i].list.length);
				}
				stats.push(pStats);
			}
			game.stats.stock=stats;
			// $('#stocks').modal('show');
			$('#stocks').modal({
				show: true,
				keyboard: false,
				backdrop: 'static'
			});
		}
		game.stats.addHistory = function(){
			var round = game.stats.round.toString().length < 2 ? '0' + game.stats.round : game.stats.round;
			for(var i=0; i<game.player.list.length; i++){
				var player = game.player.list[i];
				var stat = [];
				stat.push(player.name);
				stat.push('2013W'+round);
				stat.push(player.money);
				stat.push(game.player.stockCt(i));
				game.stats.history.push(stat);
			}
			game.stats.round++;
		}
		game.stats.showHistory = function(){
			var chart = new google.visualization.MotionChart(document.getElementById('timeline_cont'));
			var data = google.visualization.arrayToDataTable(game.stats.history, false);
			var options = {
				title: 'Game History',
				'width':500,
				'height':300,
				'state':{"sizeOption":"3","yZoomedIn":false,"xLambda":1,"nonSelectedAlpha":0.4,"yZoomedDataMin":200,"dimensions":{"iconDimensions":["dim0"]},"xZoomedDataMax":1375660800000,"xZoomedIn":false,"iconType":"BUBBLE","yLambda":1,"yAxisOption":"2","time":"2012-12-31","orderedByY":false,"iconKeySettings":[],"duration":{"timeUnit":"W","multiplier":1},"playDuration":15000,"showTrails":true,"xZoomedDataMin":1356912000000,"orderedByX":false,"uniColorForNonSelected":false,"colorOption":"_UNIQUE_COLOR","yZoomedDataMax":35600,"xAxisOption":"_TIME"}
			}
			chart.draw(data, options);
			$('#timeline').modal('show');
		}
	
	//GAME|TILE
	game.tile.init = function(){
		var board = game.tile.board();
		if(game.realtime.doc!=undefined){
			game.realtime.tiles.clear();
			game.realtime.tiles.pushAll(board.list);
		}else{
			game.tile.list 		= board.list;
			game.tile.ct 		= game.defaults.grid_r*game.defaults.grid_c;
			game.tile.place_ct 	= 0;
		}
	}
	game.tile.board = function(){
		var board = {};
			board.list = [];
		for(var r=0; r<game.defaults.grid_r; r++){
				board.list[r]=[];
			for(var c=0; c<game.defaults.grid_c; c++){
				board.list[r][c]		= {};
				board.list[r][c].r 		= r;
				board.list[r][c].c 		= c;
				board.list[r][c].status = '';
			}
		}
		return board;
	}
	game.tile.isLast = function(tile){
		var lastTile = game.details.lastTile;
		if(tile && lastTile)
			if(tile.r==lastTile.r && tile.c==lastTile.c)
				return 'lastTile';
	}
	game.tile.display = function(tile){
		if(tile!=undefined)
			return game.defaults.abc[tile.r]+(tile.c+1);
	}
	game.tile.interact = function(tile){
		if(game.turn.progress[0]=='active'){
			game.tile.place(tile, function(){
				$('#corpsPlace').modal('hide');
				game.turn.progress[0]='';
				game.turn.progress[1]='active';
			})
		}else if(game.turn.progress[1]=='active'){
			game.corp.stock.buy(tile.corp);
		}
	}
	game.tile.place = function(tile, success, error){
		if(tile==undefined){
			return;
		}
		if(game.player.myTurn() || game.player.list[game.details.current].auto){
			//console.log('>>>>>Checking placed tile...',game.details.current,tile,game.player.list[game.details.current].tiles)
			if(game.player.myPiece(tile)=='myPiece'){
				var n = game.ai.neighborCheck(tile)
				if((n.h.length>0 || n.t==0) || game.ai.corpsAvail().length>0){
					game.corp.merger.list=[];
					game.tile.place_ct++;
					game.tile.list[tile.r][tile.c].status='onBoard';
					game.realtime.details.set('lastTile',tile);

					var neighbors = game.tile.neighbors(tile);
					var isMerger=false;
					var isNew=false;
					var nh = false;
					var corp = -1;
					//check for existent corps and mergers
					for(var i=0; i<neighbors.length; i++){
						if(!isNaN(neighbors[i].corp)){	//If there is a neighboring corp
							if(nh && neighbors[i].corp != corp && game.corp.merger.list.indexOf(neighbors[i].corp) == -1){	//If another neighbor is already a corp and the 2 corps are not the same
								isMerger=true;
								game.corp.merger.list.push(corp);
								game.corp.merger.list.push(neighbors[i].corp);
								game.corp.merger.list=game.corp.merger.list.getUnique();
								game.corp.func = function(corp){
									var tile_ct = 	$.map(game.corp.merger.list, function(corp) {
														return game.corp.list[corp].tiles.length;
													});
									var max = Math.max.apply(Math, tile_ct);

									if(game.corp.list[corp].tiles.length==max){
										game.corp.addTile(corp, tile);
										game.tile.setNeighbors(corp, tile);
										$('#merger').modal('hide');
										for(var ii=0; ii<game.corp.merger.list.length; ii++){
											if(game.corp.merger.list[ii]!=corp){
												var rcorp = game.corp.merger.list[ii];
												var tile_ct = game.corp.list[rcorp].tiles.length;
												game.notify(game.corp.list[rcorp].name + ' is being merged into '+game.corp.list[corp].name+'.');
												game.corp.merger.settle(rcorp);
												game.corp.merger.push(corp, rcorp, tile_ct);
												game.corp.remove(game.corp.merger.list[ii]);
											}
										}
										game.tile.placeSuccess=success;
										game.corp.merger.transact();
										game.corp.func = function(){};
									}else{
										game.notify('You must merge into the largest group.', 'error');
									}
								}
							}else{ //If a neighbor is a corp
								corp = neighbors[i].corp;
								nh=true;
							}
						}
					}
					if(isMerger){
						if(game.player.list[game.details.current].auto){
							game.ai.chooseMerger();
							//:847
						}else{
							$('#merger').modal({
								show: true,
								keyboard: false,
								backdrop: 'static'
							});
						}
					}else{
						if(corp != -1)
							game.corp.addTile(corp, tile);
						for(var i=0; i<neighbors.length; i++){
							if(neighbors[i].status=='onBoard'){
								if(nh){
									game.tile.setNeighbors(corp, tile);
								}else{
									isNew=true;
									game.corp.func=function(corp){
										if(game.corp.list[corp].tiles.length==0){
											game.corp.stock.assign(corp, true);
											game.corp.addTile(corp, tile);
											game.tile.setNeighbors(corp, tile);
											
											game.realtime.corp.replaceRange(0,game.corp.list);
											game.realtime.tiles.replaceRange(0,game.tile.list);

											if(success)
												success();
											game.corp.func = function(){};
										}else{
											game.notify('That company is already on the board.', 'error');
										}
									}
									// - A tile has been placed and it is now time to place a corp
									if(game.player.list[game.details.current].auto){
										if(i==0)
											game.ai.chooseNewCorp();
									}else{
										$('#corpsPlace').modal({
											show: true,
											keyboard: false,
											backdrop: 'static'
										});
									}
								}
							}
						}
					}

					if(success!=undefined && !isMerger && !isNew)
						success();
				}else{
					game.notify('All corporations are on the board, you can not place that tile at this time.', 'error');
				}
			}else{
				console.log('You can only place a tile that is yours.');
				game.notify('You can only place a tile that is yours.', 'error');
				it.game = game;
			}
		}else{
			game.notify('You can only place a tile when it is your turn.', 'error');
		}
	}

	game.tile.setNeighbors = function(corp, tile){
		var neighbors = game.tile.neighbors(tile);
		for(var i=0; i<neighbors.length; i++){
			if(neighbors[i].corp!=corp && neighbors[i].status=='onBoard'){
				game.corp.addTile(corp, neighbors[i]);
				game.tile.setNeighbors(corp, neighbors[i]);
			}
		}
	}
	game.tile.neighbors = function(tile){
		var neighbors=[];
		var onBoard=[];
		if(tile.r>0)
			neighbors.top=game.tile.list[tile.r-1][tile.c];
		if(tile.c<11)
			neighbors.right=game.tile.list[tile.r][tile.c+1];
		if(tile.r<8)
			neighbors.bottom=game.tile.list[tile.r+1][tile.c];
		if(tile.c>0)
			neighbors.left=game.tile.list[tile.r][tile.c-1];
		if(neighbors.top && neighbors.top.status==='onBoard')
			onBoard.push(neighbors.top)
		if(neighbors.right && neighbors.right.status==='onBoard')
			onBoard.push(neighbors.right)
		if(neighbors.bottom && neighbors.bottom.status==='onBoard')
			onBoard.push(neighbors.bottom)
		if(neighbors.left && neighbors.left.status==='onBoard')
			onBoard.push(neighbors.left)
		return onBoard;
	}
	game.tile.clean = function(playerIndex){
		var cp = game.player.list[playerIndex];
		var update = false;
		for(var i=0; i<game.defaults.bench_tile_ct; i++){
			var tile = cp.tiles[i];
			if(tile!=null){
				var boardTile = game.tile.list[tile.r][tile.c];
				if(boardTile.status == 'onBoard'){
					update = game.tile.assign(playerIndex, i, 'onBoard');
				}
				if(game.tile.isIllegalMerger(tile)){ //If there are two safe corps... remove tile
					update = game.tile.assign(playerIndex, i, 'disabled');
				}
			}
		}
		if(game.tile.aavail().length==0){
			if(game.ai.gameEnd())
				game.ai.endOfGame();
		}
	}
	game.tile.isIllegalMerger = function(tile){
		var nbr = game.ai.neighborCheck(tile);
		var safe_ct = 0;
		for(var ii=0; ii<nbr.h.length; ii++){
			var nbrh=nbr.h[ii];
			if(game.corp.list[nbrh].tiles.length>10){
				safe_ct++;
			}
		}
		if(safe_ct>1)
			game.tile.list[tile.r][tile.c].status='disabled';
		return (safe_ct>1);
	}
	game.tile.setStatus = function(tile,status){
		game.tile.list[tile.r][tile.c].status=status;
	}
	game.tile.aavail = function(){
		var tiles = [];
		it.tileGone=[];
		for(var i=0; i<game.tile.list.length; i++){
			var c = game.tile.list[i];
			for(var ii=0; ii<c.length; ii++){
				var tile = c[ii];
				if(tile.status!='onBoard' && tile.status!='assigned' && tile.status!='disabled'){
					if(!game.tile.isIllegalMerger(tile)){
						tiles.push(tile);
					}
				}else{
					it.tileGone.push(tile);
				}
			}
		}
		game.tile.place_ct = game.tile.ct-tiles.length;
		return tiles;
	}
	game.tile.assign = function(playerIndex, tileIndex, reason){
		var oldTile = game.player.list[playerIndex].tiles[tileIndex];
		if(oldTile)
			game.tile.setStatus(oldTile,reason);
		var avail = game.tile.aavail();
		if(avail.length>0){
			var rand = Math.floor((Math.random()*avail.length));
			var newTile = avail[rand];
			game.player.list[playerIndex].tiles[tileIndex] = newTile;
			game.tile.setStatus(newTile,'assigned');
		}else{
			game.player.list[playerIndex].tiles.splice(tileIndex, 1);
		}
		return true;
	}
	game.tile.getSet = function(playerIndex){
		console.log('get set')
		var avail = game.tile.aavail();
		var tiles = [];
		for(var i=0; i<game.defaults.bench_tile_ct; i++){
			var rand = Math.floor((Math.random()*avail.length));
			var tile =  avail.splice(rand,1)[0];
			if(tile!=undefined){
				var newTile = game.tile.list[tile.r][tile.c];
					newTile.status='assigned';
					newTile.player=playerIndex;
				tiles.push(newTile);
			}
		}
		var list = game.tile.list;
		return tiles;
	}

	// BEGIN: AI
	/*
		AI rules:
		- Play tile on:
		- Group tiles
		- Neighboring non-created location (If corps still exist)
				- Choose corp that is available according to price-range
					// - Price range rules include:: What corp - if placed will allow me to buy 
				- Give priority to tile that has other tiles which would expand or merge the corp.
			- A company that I own majority shares (If I do not want to purchase more of that stock...)
			- An other company that the other players are investing in (esp if they have tiles to build it.)
		- Buy stock:
			- Buy stock before placing tiles
			- Buy stock in companies that are small
			- Buy stock in companies that can expand
			- Buy stock in companies where you can be the majority share holder
			- Buy stock in companies that are possible mergers 
				(players hold tiles (pref. I hold the tile) to merge the company)
		- Merger:
			- Trade up if beneficial- (Trading will give you maj/min in merger OR (company stocks are worth more than sales && sell/keep are not priorities))
			- Keep if beneficial	- (Own maj/min and have potential to create another company)
			- Sell if beneficial	- (Money is needed for investing & ROI is a good ratio &&) - (Sure Sell: IF corp is unlikely to come back onto board)
	*/
	// GAME|AI
	game.ai.init = function(){
		game.ai.reasons = '';
		game.ai.details = [];
	}
	game.ai.pushDetails = function(d){
		game.ai.details.push(d);
	}
	game.ai.canBuy = function(h){
		if(game.turn.progress[1]=='active' || game.player.list[game.details.current].auto){
			if(game.turn.stock_ct<3){
				if(game.corp.list[h].stock>0 && game.corp.list[h].tiles.length>0){
					if(game.player.list[game.details.current].money>game.corp.prices(h).cost){
						return true;
					}
				}
			}
		}
	}
	game.ai.getStockStats = function(){
		var stocks = [];
		for(var i=0; igame.corp.listlength; i++)
			stocks.push(game.ai.majMin(i));
		return stocks;
	}
	game.ai.rankCorps = function(player){
		var corps = [];
		for(var i=0; i<game.corp.list.length; i++){
			corps.push(game.ai.rankCorp(player, i));
		}
		return corps;
	}
	game.ai.rankCorp = function(player, corp){
		var rank = 0;
		var mm = game.ai.majMin(corp);
		if(mm.majSH.indexOf(player) != -1)
			if(mm.majSH.length==1)
				if((mm.max-mm.min) > 3)
					rank = 50;	// is clear majority
				else
					rank = 40;	// is majority solo
			else
				if((mm.max-mm.min) > 3)
					rank = 30;	// is joint majority
				else
					rank = 20;	// is joint majority
		else if(mm.minSH.indexOf(player) != -1)
			if(mm.majSH.length==1)
				if((mm.max-mm.min) < 3)
					rank = 10;	// is clear minority
				else
					rank = 5;	// is minority solo
			else
				if((mm.max-mm.min) < 3)
					rank = 4;	// is joint minority
				else
					rank = 3;	// is joint minority
		else
			rank = game.corp.list[corp].stock-25	// has no position.
		return rank;
	}
	game.ai.corpToPick = function(player, all){
		if(all)
			var corpsList = game.ai.allCorps();
		else
			var corpsList = game.ai.corpsAvail();
		var ctp = {};
		for(var i=0; i<corpsList.length; i++){
			var corp = {}
				corp.i 		= i;
				corp.c 		= corpsList[i];
				corp.rank 	= game.ai.rankCorp(player, corp.c);
			if(corp.rank>ctp.rank || ctp.rank==undefined)
				ctp = corp;
		}
		return ctp;
	}
	game.ai.mergerChoices = function(){
		//Okay, gl understanding this function, basically we get all merger possibilities, count their tiles, and compile a list of all choices
		var ranks = game.ai.rankCorps(game.details.current);
		var ml = game.corp.merger.list;
		var tile_cts = [];
		var choices = {};
			choices.list = [];
			choices.rank = [];
		for(var i=0; i<ml.length; i++){
			var mi = ml[i];
			var m = game.corp.list[mi];
			tile_cts.push(m.tiles.length);
		}
		var max = tile_cts.max();
		for(var i=0; i<ml.length; i++){
			if(tile_cts[i]==max){
				choices.list.push(ml[i]);
				choices.rank.push(ranks[ml[i]]);
			}
		}
		return choices;
	}
	game.ai.chooseNewCorp = function(){
		var me = game.details.current;
		var ctp = game.ai.corpToPick(me);
		if(ctp.c!=undefined)
			game.corp.func(ctp.c);
		else
			game.notify('Placed tile, but no corporation is available.', 'error');
	}
	game.ai.chooseMerger = function(){
		var choices = game.ai.mergerChoices();
		var choiceIndex = 0;
		if(choices.list.length==2){
			choiceIndex = choices.rank.indexOf(choices.rank.min());
		}else if(choices.list.length>2){
			var maxI = choices.rank.indexOf(choices.rank.max());
			var minI = choices.rank.indexOf(choices.rank.min());
			for(var i=0; i<choices.list.length; i++){
				if(i!=maxI && i!=minI)
					choiceIndex = i;
			}
		}
		game.notify('I can do this!  I choose: '+game.corp.list[choices.list[choiceIndex]].name);
		game.corp.func(choices.list[choiceIndex]);
	}
	game.ai.chooseStockToBuy = function(){
		var me 			= game.details.current;
		var money 		= game.player.list[me].money;
		var stocks 		= [];
		var my_stock_ct = [];
		var my_maj 		= [];
		// Setup the stocks
		for(var i=0; i<game.corp.list.length; i++){
			var stock = game.ai.majMin(i);
			stocks.push(stock);
			my_stock_ct.push(game.player.list[me].stock[i].list.length);
			if(stock.majSH.indexOf(me) != -1)
				my_maj.push(i);
		}

		game.ai.details=[];	// Clear out details so we can add new details (reasons)
		//Choose what stocks to buy
		for(var i=0; i<game.corp.list.length; i++){
			var need;
		//Secure majority sh status
			if(stocks[i].majSH.indexOf(me) != -1 && stocks[i].max<13){
				need = (stocks[i].min+4)-my_stock_ct[i];
				if(13-(need+my_stock_ct[i])<0){
					need = 13-my_stock_ct[i];
				}
				game.ai.pushDetails('Buying '+need+' stock in '+game.corp.list[i].name+' to secure majority!')
				for(var b=0; b<need; b++){
					if(game.ai.canBuy(i)){
						game.corp.stock.buy(i);
					}
				}
			}
		//Secure minority sh status
			if(stocks[i].minSH.indexOf(me) != -1 && stocks[i].minSH.length>1){
				need = 3;
				game.ai.pushDetails('Buying '+need+' stock in '+game.corp.list[i].name+' to secure minority!')
				for(var b=0; b<need; b++){
					if(game.ai.canBuy(i)){
						game.corp.stock.buy(i);
					}
				}
			}
		//Obtain majority sh status if possible
			if(game.ai.canBuy(i)){
				need = stocks[i].max-my_stock_ct[i];
				if(need < 3 && need > 0){
					game.ai.pushDetails('Buying '+need+' stock in '+game.corp.list[i].name+' to obtain majority!')
					for(var b=0; b<need; b++){
						if(game.ai.canBuy(i)){
							game.corp.stock.buy(i);
						}
					}
				}
			}
		//Obtain minority sh status if possible
			if(game.ai.canBuy(i)){
				need = stocks[i].min+1-my_stock_ct[i];
				if(need < 3 && need > 0){
					game.ai.pushDetails('Buying '+need+' stock in '+game.corp.list[i].name+' to obtain minority!')
					for(var b=0; b<need; b++){
						if(game.ai.canBuy(i)){
							game.corp.stock.buy(i);
						}
					}
				}
			}
		//END LOOP
		}
		console.log('Stock Chosen'+ game.player.list[me].name);
		game.turn.next();
	}
	game.ai.tradeSell = function(player){
		if(game.corp.merger.data){
			var me = game.player.list[player];
			var mcorp = game.corp.merger.data.mcorp;
			var rcorp = game.corp.merger.data.rcorp;
			var rMajMin = game.ai.majMin(rcorp);
			var myRStockCt = me.stock[rcorp].list.length;
			if(mcorp){
				var mMajMin = game.ai.majMin(mcorp);
				var myMStockCt = me.stock[mcorp].list.length;
				var avail = game.corp.list[mcorp].stock;

				var stt = 0;
				var stk = 13;


				// How likely is it to come back onto the board?
				var willComeBack=true;
				if((game.tile.place_ct/game.tile.ct*100) > 60){
					willComeBack=false;
					stk=0;
				}else if((game.tile.place_ct/game.tile.ct*100) > 40 && game.ai.corpsAvail().length > 1){
					willComeBack=false;
					stk=0;
				}else if((game.tile.place_ct/game.tile.ct*100) > 30 && game.ai.corpsAvail().length > 3){
					willComeBack=false;
					stk=0;
				}else{
					if(game.corp.merger.data.tile_ct>5){
						if(me.money>6000)
							stk = rMajMin.max+1;
						else if(me.money>4000)
							stk = rMajMin.min+1;
						else
							stk = 1;
					}
				}

				// How much do we want the new stock?
				if(avail>0){
					// if(rMajMin.majSH.indexOf(player) != -1){	// If I am the majority share holder in the company leaving

					// }else if(rMajMin.minSH.indexOf(player) == -1){	// If I am the minority share holder in the company leaving

					// }else if(willComeBack && (25-game.corp.list[mcorp].stock+myRStockCt)<3){	// I can have an investment

					// }else{	// If I don't really care

					// }
					if(mMajMin.majSH.indexOf(player) != -1){
						stt = (mMajMin.min+3)-mMajMin.max;
					}else {
						var nfj = mMajMin.max-myMStockCt;
						var nfm = mMajMin.min-myMStockCt;
						if(nfj < avail && nfj > (myRStockCt/2)){
							stt = nfj+3;
						}else if(nfm < avail && nfm > (myRStockCt/2)){
							stt = nfm+3;
						}else{
							if(rMajMin.majSH.indexOf(player) == -1){
								if(mMajMin.max-myMStockCt<avail){
									stt = mMajMin.max-myMStockCt+4;
								}
							}
						}
					}
				}
			}else{
				stt=0;
				stk=0;
			}

			// If I need money & the benifits are great
			// If there are possibilities for the co. to come back...
			// If 
			while(avail>0 && myRStockCt>1 && stt>0){
				avail--;
				stt--;
				myRStockCt-=2;
				game.corp.merger.trade(player);
			}
			while(myRStockCt>stk){
				myRStockCt--;
				game.corp.merger.sell(player);
			}
		}
		game.corp.merger.func();
	}
	game.ai.endTurn = function(){

	}
	game.ai.play = function(){
		var ttp = game.ai.chooseTile();

		if(!ttp.tile){
			game.notify(ttp.response, 'error');
			game.ai.reasons = 'I did not place a tile because: <br>'+ttp.response;
		}else{
			game.tile.place(ttp.tile, game.ai.chooseStockToBuy, function(){alert('error');});
			game.ai.reasons = 'I placed tile: '+game.tile.display(ttp.tile)+' because...';
			for(var r=ttp.why.pop(); r!=undefined; r=ttp.why.pop())
				game.ai.reasons += "<br>"+r;
		}
	}
	game.ai.chooseTile = function(){
		var tiles = game.player.list[game.details.current].tiles;
		var tileNames = [];
		var tileAnalysis = [];
		var tileRank = [];

		for(var i=0; i<tiles.length; i++){
			tileAnalysis[i] = game.ai.rankTile(tiles, tiles[i]);
			tileRank[i] = tileAnalysis[i].rank;
		}
		if(tileRank.max() > -100){
			var ttp = tiles[tileRank.indexOf(tileRank.max())];
			var why = tileAnalysis[tileRank.indexOf(tileRank.max())];
			why.tile=ttp;
			for(var i=0; i<tiles.length; i++)
				tileNames[i]=game.tile.display(tiles[i]);
		}else{
			var why = {};
			why.tile=false;
			why.response = 'No tiles can be placed.';
			game.turn.progress[1]=='active';
			game.ai.chooseStockToBuy();
		}
		return why;
	}
	game.ai.rankTile = function(tiles, tile){
		var response={};
			response.rank=0;
			response.key='';
			response.why=[];
		var dontPlace=false;
		
		if(tile==undefined){
			response.rank=-500;
			response.why.push('Tile does not exist.');
			return response;
		}

		//Check board for neighbors
		var nb = game.ai.neighborCheck(tile);
		var corpsAvail = game.ai.corpsAvail();

		if(nb.h.length>1){	//If is a merger
			var mergees = [];
			for(var i=0;i<nb.h.length;i++){
				mergees[i]=game.corp.list[nb.h[i]].tiles.length;
			}
			var acquire = mergees.indexOf(mergees.max()); //What is the biggest company
			for(var i=0; i<nb.h.length; i++){
				var shares = game.ai.majMin(nb.h[i]);	//Who owns what
				if(i == acquire){ //Biggest corp
					if(shares.majSH.indexOf(game.details.current) != -1){	//If Majority Share holder
						response.rank+=10;
						response.why.push('+ MajSH in large merging company.');
						response.key = 'merge';
					}else if(shares.minSH.indexOf(game.details.current) != -1 && shares.min!=0){	//If Minority Share holder
						response.rank+=5;
						response.why.push('+ MinSH in large merging company.');
						response.key = 'merge';
					}else{
						response.rank-=5;
						response.why.push('- No affiliation with large merging company.');
						response.key = 'merge';
					}
				}else{ //Smaller corp
					if(shares.majSH.indexOf(game.details.current) != -1){	//If Majority Share holder
						response.rank+=30;
						response.why.push('+ MajSH in small merging company.');
						response.key = 'merge';
					}else if(shares.minSH.indexOf(game.details.current) != -1 && shares.min!=0){	//If Minority Share holder
						response.rank+=20;
						response.why.push('+ MinSH in small merging company.');
						response.key = 'merge';
					}else{
						response.rank-=20;
						response.why.push('- No affiliation with small merging company.');
						response.key = 'merge';
					}
				}
			}
		}else if(nb.h.length==1){		//If expanding an existing corp
			var shares = game.ai.majMin(nb.h[0]);
			if(shares.majSH.indexOf(game.details.current) != -1){	//If Majority Share holder
				response.rank+=4;
				response.why.push('+ MajSH in expanding company.');
				response.key = 'expand';
			}else if(shares.minSH.indexOf(game.details.current) != -1){	//If Minority Share holder
				//Add more rules (Probability of purchasing stock in future)
				response.rank+=2;
				response.why.push('+ MinSH in expanding company.');
				response.key = 'expand';
			}else{
				response.rank-=2;
				response.why.push('- No affiliation with expanding company.');
			}
		}else{
			if(corpsAvail.length>0){
				if(nb.t>1){
					response.rank+=30;
					response.why.push('+ Create a new corp with multiple tiles.');
					response.key = 'new';
				}else if(nb.t==1){
					response.rank+=28;
					response.why.push('+ Create a new small corp.');
					response.key = 'new';
				}else{
					response.rank = 0;
					response.why.push('- Tile does not do anything.');
					response.key = 'normal';
				}
			}else{
				dontPlace=true;
				if(nb.t>1){
					response.rank = -200;
					response.why.push('- Attempt to create a new corp with multiple tiles.. There are none available.');
				}else if(nb.t==1){
					response.rank = -200;
					response.why.push('- Attempt to create a new corp.. There are none available.');
				}else{
					response.rank = 0;
					response.why.push('- Tile does not do anything.');
					response.key = 'normal';
				}
			}
		}
		

		//Check for neighboring tiles
		if(game.ai.benchCheck(tiles, tile).length>0){
			response.rank+=5;
			response.why.push('+ We have a tile in our hand that is near this tile.');
		}

		return response;
	}
	game.ai.benchCheck = function(tiles, tile){
		var found = [];
		var neighbors = game.ai.neighbors(tile);
		for(var n=0; n<neighbors.length; n++){
			if(neighbors[n]){
				for(var i=0; i<tiles.length; i++){
					if(neighbors[n] && tiles[i]){
						if(neighbors[n].r==tiles[i].r && neighbors[n].c==tiles[i].c){
							found.push(tiles[i]);
						}
					}
				}
			}
		}
		return found;
	}
	game.ai.neighborCheck = function(tile){
		var response = {};
			response.h=[];
			response.t=0;
		var neighbors = game.ai.neighbors(tile);
		for(var n=0; n<neighbors.length; n++){
			if(neighbors[n]){
				var neighbor = game.tile.list[neighbors[n].r][neighbors[n].c]
				if(neighbor.status=='onBoard'){
					if(neighbor.corp!=undefined && response.h.indexOf(neighbor.corp) == -1){
						response.h.push(neighbor.corp);
					}else{
						response.t++
					}
				}
			}
		}
		return response;
	}
	game.ai.neighbors = function(tile){
		var neighbors=[];
		if(tile){
			if(tile.r>0)
				neighbors[0]={"r":tile.r-1, "c":tile.c};
			if(tile.c<11)
				neighbors[1]={"r":tile.r, "c":tile.c+1};
			if(tile.r<8)
				neighbors[2]={"r":tile.r+1, "c":tile.c};
			if(tile.c>0)
				neighbors[3]={"r":tile.r, "c":tile.c-1};
		}
		return neighbors;
	}
	game.ai.majMin = function(corp){
		var sharesDst = [];
		var max=0,min=0;
		var result = {};
			result.majSH=[];
			result.minSH=[];

		for(var i=0; i<game.player.list.length; i++){
			sharesDst[i]=0;
			var player = game.player.list[i];
			for(var ii=0; ii<player.stock[corp].list.length; ii++){
				var stock = player.stock[corp].list;
				sharesDst[i]=stock.length;
			}
		}
		var costs=JSON.parse(JSON.stringify(sharesDst)).sort(function(a,b){return a-b});
		for(var i=0;i<costs.length;i++){
			if(costs[i] > max){
				min = max;
				max = costs[i];
			}
		}
		result.max=max;
		result.min=min;
		//Get all majority share holders
		if(result.max>0){
			for(var i=0; i<game.player.list.length; i++){
				if(sharesDst[i]==max){
					result.majSH.push(i);
				}
			}
			//Get all minority share holders
			if(min>0){
				for(var i=0; i<game.player.list.length; i++){
					if(sharesDst[i]==min){
						result.minSH.push(i);
					}
				}
			}
		}
		return result;
	}
	game.ai.allCorps = function(){
		var allCorps=[];
		for(var i=0; i<game.corp.list.length; i++)
			allCorps.push(i)
		return allCorps;
	}
	game.ai.corpsAvail = function(){
		var corpsAvail=[];
		for(var i=0; i<game.corp.list.length; i++)
			if(game.corp.list[i].tiles.length==0)
				corpsAvail.push(i)
		return corpsAvail;
	}
	game.ai.canPlay = function(player){
		return !!game.player.list[player].tiles.length;
	}
	game.ai.gameEnd = function(){
		for(var i=0; i<game.player.list.length; i++)
			if(game.ai.canPlay(i))
				return false;
		return true;
	}
	game.ai.settleEnd = function(){
		game.corp.merger.data = game.corp.merger.array.pop();
		var m = game.corp.merger.data.rcorp; //||
		for(var p=0; p<game.player.list.length; p++){
			console.log('corp',m);
			for(var s=0; s<game.player.list[p].stock[m].list.length; s++){
				game.corp.merger.sell(p);
			}
		}
		
		if(game.corp.merger.array.length>0){
			game.ai.settleEnd();
		}else{
			game.stats.addHistory();
			game.notify('And now for the final score!');
			$('#gameStats').modal('show');
		}
	}
	game.ai.endOfGame = function(){
		// console.log(JSON.stringify(game));
		game.stats.end = true;
		for(var i=0; i<game.corp.list.length; i++){
			var tile_ct=game.corp.list[i].tiles.length;
			if(tile_ct>0){
				game.corp.merger.settle(i);
				game.corp.merger.push(false,i,tile_ct);
				game.corp.remove(i);
			}
		}
		console.log(JSON.stringify(game.player.list))
		game.ai.settleEnd();
	}
	game.ai.ref={};
	game.ai.ref.corpCheck = function(){
		var onboard = [];
		for(var i=0; i<game.corp.list.length; i++){
			var is=true;
			var corp = game.corp.list[i];
			for(var ii=0; ii<corp.tiles.length; ii++){
				var tile = corp.tiles[ii];
				if(game.tile.list[tile.r][tile.c].corp!=i){
					console.debug('error','Corp: '+corp.name+' has tiles that do not match on the board!',tile);
					is=false;
				}
			}
			if(is && corp.tiles.length>0)
				onboard.push(corp.name);
		}
		// console.log(onboard);
	}
	// END: AI

	game.reset = function(){
		game.realtime.corp.replaceRange(0,JSON.parse(JSON.stringify(game.defaults.corps)));

		game.tile.list = game.tile.board().list;
		for(var i=0; i<game.player.list.length; i++){
			game.player.list[i].stock = JSON.parse(JSON.stringify(game.defaults.corps));
			game.player.list[i].money = game.defaults.start_money;
			game.player.list[i].tiles = game.tile.getSet(i);
		}
		
		game.realtime.tiles.replaceRange(0,game.tile.list);
		game.realtime.player.replaceRange(0,game.player.list);
		game.realtime.details.set('current', 0);
		game.realtime.details.set('last', 0);
		game.realtime.details.set('lastTile', {});
	}
	//BEGIN REALTIME COMMUNICATION
	//GAME|REALTIME
	game.realtime = {};
	game.realtime.options = {
		clientId: game.defaults.google.clientId,
		authButtonElementId: 'authorizeButton',
		initializeModel: function(model){
			it.model = model;
			model.beginCompoundOperation();
				var board = game.tile.board();
				var corps = model.createList(JSON.parse(JSON.stringify(game.defaults.corps)));
				var player = model.createList(game.player.list);
				var tiles = model.createList(board.list);
				var notify = model.createList([]);
				var details = model.createMap({"current":0, "last":0, "lastTile":{}});
				model.getRoot().set('corp', corps);
				model.getRoot().set('player', player);
				model.getRoot().set('tiles', tiles);
				model.getRoot().set('details', details);
				model.getRoot().set('notify', notify);
			model.endCompoundOperation();
			game.turn.init();
		},
		autoCreate: true,
		defaultTitle: "Capital Game",
		onFileLoaded: function(doc){
			game.realtime.doc 				= doc;
			game.realtime.model 			= doc.getModel();			
			game.realtime.corp 				= game.realtime.model.getRoot().get('corp');
			game.realtime.player 			= game.realtime.model.getRoot().get('player');
			game.realtime.tiles 			= game.realtime.model.getRoot().get('tiles');
			game.realtime.details 			= game.realtime.model.getRoot().get('details');
			game.realtime.notify 			= game.realtime.model.getRoot().get('notify');

			game.realtime.setMe();
			game.realtime.initData();
			game.realtime.setPlayers();
			game.realtime.linkListeners();

			it.realtime = game.realtime;
			//$rootScope.$emit('loadNotes');
		}
	}
	game.realtime.setPlayers = function(){
		for(var i=0; i<game.player.list.length; i++)
			if(game.player.isOnline(game.player.list[i]))
				game.player.list[i].online=true;
			else
				game.player.list[i].online=false;
	}
	game.realtime.setMe = function(){
		var colab = game.realtime.doc.getCollaborators();
		for(var i=0; i<colab.length; i++)
			if(colab[i].isMe)
				game.player.me=colab[i];

		for(var i=0; i<game.player.list.length; i++){
			if(game.player.me.sessionId && game.player.me.sessionId==game.player.list[i].sessionId){
				game.player.me=game.player.list[i];
				game.player.me.index=i;
				//console.log('set i to '+i);
			}
		}
		if(game.player.me.index==game.details.current && game.turn.end){
			game.turn.init();
		}
	}
	game.realtime.start = function() {
		var realtimeLoader = new rtclient.RealtimeLoader(game.realtime.options);
		realtimeLoader.start();
		game.realtime.status=true;
	}
	game.realtime.initData = function(){
		$scope.safeApply(function(){
			game.tile.list 		= angular.fromJson(angular.toJson(game.realtime.tiles.asArray()));
			game.corp.list 		= angular.fromJson(angular.toJson(game.realtime.corp.asArray()));
			game.player.list 	= angular.fromJson(angular.toJson(game.realtime.player.asArray()));
			game.details.current= game.realtime.details.get('current');
			game.details.last 	= game.realtime.details.get('last');
			game.details.lastTile = angular.fromJson(angular.toJson(game.realtime.details.get('lastTile')));
			game.player.add(game.player.me);
			var myIndex = game.player.list.length-1;
			game.player.me=game.player.list[myIndex];
			game.player.me.index = myIndex;
		});
	}
	game.realtime.linkListeners = function(){
		game.realtime.doc.addEventListener(gapi.drive.realtime.EventType.COLLABORATOR_LEFT,function(left){
			var playerIndex = game.player.getIndex(left.collaborator);
			$scope.safeApply(function(){
				game.player.list[playerIndex].auto = true;
				game.player.list[playerIndex].sessionId = false;
				game.realtime.setPlayers();
			});
			//console.log('left',left);
			it.left=left;
		});

		game.realtime.corp.addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED, 
			function(change){
				var i = change.index;
				$scope.safeApply(function(){
					game.corp.list = angular.fromJson(angular.toJson(game.realtime.corp.asArray()));
				});
				//game.notify('Corp Changed');
			}
		);
		game.realtime.player.addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED, 
			function(change){
				var i = change.index;
				$scope.safeApply(function(){
					game.player.list = angular.fromJson(angular.toJson(game.realtime.player.asArray()));
					game.realtime.setMe();
					game.realtime.setPlayers();
				});
				//game.notify('Player Changed');
			}
		);
		game.realtime.tiles.addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED, 
			function(change){
				var i = change.index;
				$scope.safeApply(function(){
					game.tile.list = angular.fromJson(angular.toJson(game.realtime.tiles.asArray()));
					game.tile.clean(game.player.me.index);
				});
				//game.notify('Board Tiles Changed');
			}
		);
		game.realtime.notify.addEventListener(gapi.drive.realtime.EventType.VALUES_ADDED, 
			function(change){
				//console.log('change',change);
				it.change=change;
				var i = change.index;
				notify('<img class="tny" src="'+game.player.getObj(change.sessionId).photoUrl+'"> '+game.player.getObj(change.sessionId).name+
						'<br>'+game.realtime.notify.get(i))
			}
		);
		game.realtime.details.addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED, 
			function(change){
				var i = change.index;
				$('#players').modal('hide');
				$scope.safeApply(function(){
					game.details.current	= game.realtime.details.get('current');
					game.details.last 		= game.realtime.details.get('last');
					game.details.lastTile 	= game.realtime.details.get('lastTile');
				});
				if(game.player.isMe(game.details.current) && game.turn.end){
					game.turn.init();
				}
				//console.log('turn: '+game.details.current);
				//game.notify('Game State Changed.');
			}
		);
	}
	game.notify = function(message, status){
		if(status=='error')
			notify(message,status)
		else
			game.realtime.notify.push(message);
	}

	game.init = function(replay){
		game.tile.init(replay);
		game.corp.init(replay);
		game.player.init(replay);
		game.ai.init();
		game.stats.money_spent 	= 0;
		game.stats.start 		= false;
		game.stats.end 			= false;
		game.stats.round 		= 0;
		game.stats.stock 		= [];
		game.stats.history 		= [];
		game.stats.history.push(Array('Name', 'Time', 'Money', 'Stock'));
		if(!replay){
			game.details.last 		= 0;
			game.details.current 	= 0;
			game.realtime.start();
		}
	}
	it.game=game;
	$scope.game	= game;
	$scope.safeApply = function(fn) {
		var phase = this.$root.$$phase;
		if(phase == '$apply' || phase == '$digest') {
			if(fn && (typeof(fn) === 'function')) {
				fn();
			}
		} else {
			this.$apply(fn);
		}
	};
});











var BoardCtrl = app.controller('BoardCtrl', function($scope) {
	var game={};
	game.defaults 						= {}
		game.defaults.google 			= {};
		game.defaults.google.key 		= 'AIzaSyCEugXvbob9DFkm5CE7goqYD9uavz07IQM';
		game.defaults.google.clientId 	= '96880613868-ddjmp7d384tfvrihff8ag69mgav2oj8g.apps.googleusercontent.com';
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
	game.tile = {};
		game.tile.list = [];
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
			var tiles = model.createList(game.tile.list);
			model.getRoot().set('tiles', tiles);
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
			game.conrtol.tiles 	= game.conrtol.model.getRoot().get('tiles');

			$scope.$apply(function(){
				game.tile.list 			= angular.fromJson(angular.toJson(game.conrtol.model.getRoot().get('tiles').asArray()));
			})
			game.conrtol.tiles.addEventListener(gapi.drive.realtime.EventType.OBJECT_CHANGED, 
				function(changed){
					$scope.$apply(function(){
						game.tile.list 	= angular.fromJson(angular.toJson(game.conrtol.model.getRoot().get('tiles').asArray()));
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
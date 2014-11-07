angular.module('DataServices', []) 
.factory('DataService', function (){
	var settings = {};
		settings.firebase = 'https://acquire.firebaseIO.com/';
		settings.init = StackMob.init({
			appName: "acquire",
			clientSubdomain: "apex2060gmailcom",
			publicKey: "ff969528-6617-4862-a5ff-5174f5dadc9a",
			apiVersion: 0
		});
		
	var Live={};
		Live.functions={};
		Live.listener={};
		Live.firebase={};
		Live.callback={};
	var Schema={};
	var SchemaCollection={};
	var Local={};
	var Sync={};
	var Moddate={};

	try{
		Local = JSON.parse(localStorage.Local);
	}catch(err){
		Local = {};
		Local.list = {};
		Local.filter = {};
		Local.view = {};
	}
	try{
		Sync = JSON.parse(localStorage.Sync);
	}catch(err){
		Sync = {};
		Sync.toAdd=[];
		Sync.toUpdate=[];
		Sync.toDelete=[];
	}
	try{
		Moddate = JSON.parse(localStorage.Moddate);
	}catch(err){
		Moddate = {};
	}
	if(navigator.onLine){
		settings.init;
	}

	var DataService = {
		add : function add(schema, path, data, callback){
			if(navigator.onLine){
				if(Schema[schema]==undefined){
					Schema[schema] = StackMob.Model.extend( {schemaName:schema} );
					SchemaCollection[schema] = StackMob.Collection.extend( { model: Schema[schema] } );
				}
				var objToSave = new Schema[schema]();
				objToSave.set(data);
				objToSave.save({},{
					success: function(result) {
						DataService.broadcastUpdate(path);
						result.status='success';
						result.message='Saved to data storage.';
						if(callback!=undefined)
							callback(result);
					},
					error: function(obj, error) {
						callback({message: "Error: " + error.message, status: 'error'});
					}
				});
			}else{
				var num 	= Local.list[schema].length;
				var temp_id = schema+'-'+num;
				var temp 	= data;
					temp['createddate'] 	= new Date().getTime();
					temp['lastmoddate'] 	= temp['createddate'];
					temp['temp_id'] 		= temp_id;
				var toSync = {};
					toSync.id=temp_id;
					toSync.schema=schema;
					toSync.path=path;

				Local.list[schema].push(JSON.parse(JSON.stringify(temp)));
				Sync.toAdd.push(toSync);

				localStorage.Local=JSON.stringify(Local);
				localStorage.Sync=JSON.stringify(Sync);

				if(Live && Live.callback && Live.callback && Live.callback[schema] && Live.callback[schema].command)
					DataService[Live.callback[schema].command](schema, Live.callback[schema].data, Live.callback[schema].func);
				if(callback!=undefined){
					var result={};
						result.attributes=temp;
						result.id=temp_id;
						result.status='success';
						result.message='Saved to local storage.';
					callback(result);
				}
			}
		},

		//UPDATE DATA
		update : function update(schema, path, data, callback){
			if(navigator.onLine){
				if(Schema[schema]==undefined){
					Schema[schema] = StackMob.Model.extend( {schemaName:schema} );
					SchemaCollection[schema] = StackMob.Collection.extend( { model: Schema[schema] } );
				}

				delete data.$$hashKey;
				delete data.createddate;
				delete data.lastmoddate;
				delete data.sm_owner;
				delete data.temp_id;

				var toSave = new Schema[schema](data);
				toSave.save({}, {
					success: function(result) {
						DataService.broadcastUpdate(path);
						result.status='success';
						result.message='Saved to data storage.';
						if(callback!=undefined)
							callback(result);
					},
					error: function(model, response) {
						console.debug(response);
					}
				});
			}else{
				var i = _.indexOf(Local.list[schema], data);
				data.lastmoddate = new Date().getTime();
				Local.list[schema][i] = data;
				if(data.temp_id==undefined){
					var temp_id = data[schema+'_id'];
					var toSync = {};
						toSync.id=temp_id;
						toSync.schema=schema;
						toSync.path=path; 
						toSync.data=data;

					Sync.toUpdate.push(toSync);
				}else{
					//It is only local - so we do not need to add a sync to stackmob
					var temp_id = data.temp_id;
				}

				localStorage.Local=JSON.stringify(Local);
				localStorage.Sync=JSON.stringify(Sync);

				DataService[Live.callback[schema].command](schema, Live.callback[schema].data, Live.callback[schema].func);
				if(callback!=undefined){
					var result={};
						result.attributes=data;
						result.id=temp_id;
						result.status='success';
						result.message='Updated in local storage.';
					callback(result);
				}
			}
		},

		//REMOVE DATA
		remove : function remove(schema, path, data, callback){
			if(navigator.onLine){
				var params = {};
					params[schema+'_id']=data[schema+'_id'];
				var TSchema = StackMob.Model.extend({ schemaName: schema });
				var toDelete = new TSchema(data);
				toDelete.destroy({
					success: function(result){
						DataService.broadcastUpdate(path);
						result.status='success';
						result.message='Removed from data storage.';
						if(callback!=undefined)
							callback(result);
					},
					error: function(obj, error) {
						it.errorObj=obj;
						it.error=error;
						callback({message: "Error: " + error.message, status: 'error'});
					}
				});
			}else{
				//Remove item > update view
				Local.list[schema] = _(Local.list[schema]).reject(function(el) { return el.$$hashKey === data.$$hashKey; });
				Sync.toAdd = _(Sync.toAdd).reject(function(el) { return el.id === data.temp_id; });
				if(data[schema+'_id']!=undefined){
					var sync = {};
						sync.schema = schema;
						sync.path = path;
						sync.obj = data;
					Sync.toDelete.push(sync);
				}
				localStorage.Sync=JSON.stringify(Sync);
				DataService[Live.callback[schema].command](schema, Live.callback[schema].data, Live.callback[schema].func);
				if(callback!=undefined){
					var result={};
						result.attributes=data;
						result.id=data[schema+'_id'];
						result.status='success';
						result.message='Removed from local storage.';
					callback(result);
				}
			}
			//one(item_id), many(query), cascade(cascade=true)
		},

		//LIST DATA
		list : function list(schema, data, callback, offline) {
			if(Live.callback[schema]==undefined){
				Live.callback[schema]={};
				Live.callback[schema].command='list';
				Live.callback[schema].data=data;
				Live.callback[schema].func=callback;
			}
			if(navigator.onLine && !offline){
				if(Schema[schema]==undefined){
					Schema[schema] = StackMob.Model.extend( {schemaName:schema} );
					SchemaCollection[schema] = StackMob.Collection.extend( { model: Schema[schema] } );
				}
				var collection = new SchemaCollection[schema];
				var q = new StackMob.Collection.Query();
				collection.query(q, {
					success: function (results) {
						Local.list[schema]=JSON.parse(JSON.stringify(results.models));
						localStorage.Local=JSON.stringify(Local);
						callback(Local.list[schema]);
					},
					error: function (results,error) {
						callback({message: "Collection Error: " + error.message, status: 'error'});
					}
				});
			}else{
				callback(Local.list[schema]);
			}
		},

		//FILTER DATA
		filter : function filter(schema, data, callback, offline) {
			if(Live.callback[schema]==undefined){
				Live.callback[schema]={};
				Live.callback[schema].command='filter';
				Live.callback[schema].data=data;
				Live.callback[schema].func=callback;
			}
			if(navigator.onLine && !offline){
				if(Schema[schema]==undefined){
					Schema[schema] = StackMob.Model.extend( {schemaName:schema} );
					SchemaCollection[schema] = StackMob.Collection.extend( { model: Schema[schema] } );
				}
				var collection = new SchemaCollection[schema];
				var q = new StackMob.Collection.Query();

				// Setup filters according to the filter object
				console.log('-------------------------FILTER-----------------------------------');
				for(var i=0; i<data.length; i++){
					var str = 'q.'+data[i]['filter']+'("'+data[i]['field']+'",'+data[i]['values'].join(',')+');';
					console.log(str);
					eval(str);
				}

				collection.query(q, {
					success: function (results) {
						Local.filter[schema]=JSON.parse(JSON.stringify(results.models));
						localStorage.Local=JSON.stringify(Local);
						callback(Local.filter[schema]);
					},
					error: function (results,error) {
						callback({message: "Collection Error: " + error.message, status: 'error'});
					}
				});
			}else{
				callback(Local.filter[schema]);
			}
		},

		//VIEW ITEM
		view : function view(schema, data, callback, offline) {
			if(Live.callback[schema]==undefined){
				Live.callback[schema]={};
				Live.callback[schema].command='view';
				Live.callback[schema].data=data;
				Live.callback[schema].func=callback;
			}
			if(navigator.onLine && !offline){
				if(Schema[schema]==undefined){
					Schema[schema] = StackMob.Model.extend( {schemaName:schema} );
					SchemaCollection[schema] = StackMob.Collection.extend( { model: Schema[schema] } );
				}
				var collection = new SchemaCollection[schema];
				var q = new StackMob.Collection.Query();
				q.equals(schema+'_id', data.id);
				collection.query(q, {
					success: function (results) {
						Local.view[schema]=JSON.parse(JSON.stringify(results.models));
						localStorage.Local=JSON.stringify(Local);
						callback(Local.view[schema]);
					},
					error: function (results,error) {
						callback({message: "Collection Error: " + error.message, status: 'error'});
					}
				});
			}else{
				callback(Local.view[schema]);
			}
		},

		//LIVE LISTENER
		live: function live(command, path, schema, data, callback){
			//DataService[command](schema, data, callback, false);
			if(navigator.onLine){
				var timestamp = Moddate[schema];
				if(Live.firebase[schema]==undefined){
					Live.functions[schema] = function(snapshot){
						var updateData = snapshot.val();
						if(!timestamp || (updateData && updateData.lastmoddate>timestamp)){
							console.log('Getting from stackmob');
							DataService[command](schema, data, callback);
							Moddate[schema] = new Date().getTime();
							localStorage.Moddate=JSON.stringify(Moddate);
						}else{
							console.log('Getting from local storage');
							DataService[command](schema, data, callback, true);
						}
					};
					Live.firebase[schema] = new Firebase(settings.firebase+path);
					Live.listener[schema] = Live.firebase[schema].on('value', Live.functions[schema]);
					window.addEventListener("offline", function(){
						Live.firebase[schema].off('value', Live.functions[schema]);
						Live.functions={};
						Live.listener={};
						Live.firebase={};
					});
					window.addEventListener("online", function(){
						Live.functions[schema] = function(snapshot){
							var updateData = snapshot.val();
							if(updateData.lastmoddate>timestamp){
								timestamp = new Date().getTime();
								DataService[command](schema, data, callback);
							}
						};
						Live.firebase[schema] = new Firebase(settings.firebase+path);
						Live.listener[schema] = Live.firebase[schema].on('value', Live.functions[schema]);
					});
				}else{
					DataService[command](schema, data, callback, true);
				}
			}else{
				//This would only be called when accessed starting from offline mode.
				window.addEventListener("online", function(){
					DataService.live(command, path, schema, data, callback);
				});
				DataService[command](schema, data, callback);
			}
		},
		//BROADCAST UPDATES
		broadcastUpdate : function broadcastUpdate(path){
			console.log(path);
			var userId = StackMob.getLoggedInUser();
			var timestamp = new Date().getTime();
			var fbSchema = new Firebase(settings.firebase+path);
			fbSchema.set({user_id: userId, lastmoddate: timestamp});
		}
	};
	// The factory function returns DataService, which is injected into controllers.
	window.addEventListener("online", function(){
		console.log('Local Machine Back Online!');
		settings.init;
		timestamp = new Date().getTime();
		if(localStorage.Local)
			var local = JSON.parse(localStorage.Local);
		if(localStorage.Sync)
			var toSync = JSON.parse(localStorage.Sync);

		// ADD SYNC TO STACKMOB
		$.each(toSync.toAdd, function(index, sync){
			var data = _.find(local.list[sync.schema], function(obj){ return obj.temp_id == sync.id; });
			if(data!=undefined){
				delete data.temp_id;
				delete data.$$hashKey;
				DataService.add(sync.schema, sync.path, data);
			}
		});
		toSync.toAdd=[];
		// UPDATE SYNC IN STACKMOB
		$.each(toSync.toUpdate, function(index, toUpdate){
			DataService.update(toUpdate.schema, toUpdate.path, toUpdate.data);
		});
		toSync.toUpdate=[];

		// DELETE SYNC FROM STACKMOB
		$.each(toSync.toDelete, function(index, toDelete){
			DataService.remove(toDelete.schema, toDelete.path, toDelete.obj);
		});
		toSync.toDelete=[];

		localStorage.Sync=JSON.stringify(toSync);
	});

	return DataService;
});
















//Changes made 4/27/14
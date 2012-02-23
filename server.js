//Lettershowdown server proto v.0.1
//2012, Lorenzo Buosi

//Node.js requires
var path     = require('path');
var app      = require('http').createServer( handleHttpReq );
var io       = require('socket.io').listen(app);

//Heroku socket workaround. (long polling mode)
io.configure(function () 
{ 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

var fs       = require('fs');
var paperboy = require('paperboy');
var express  = require('express');

// Constants
var PORT = process.env.PORT || 3000;

//items list (server copy). Every client has an identical copy.
var items  = [];

//word chains
var wordChains = [];

//disable io.socket logs
io.disable('log');

//set paperboy webroot (public/)
var WEBROOT  = path.join( path.dirname( __filename ), 'public');

//listen to port number
app.listen( PORT );

//handle client http requests here with paperboy
function handleHttpReq (req, res) 
{
	var ip = req.connection.remoteAddress;
	
	paperboy
    .deliver(WEBROOT, req, res)
    .addHeader('Expires', 300)
    .addHeader('X-PaperRoute', 'Node')
    .before(function() {
      console.log('Received Request');
    })
    .after(function(statCode) {
      console.log(statCode, req.url, ip);
    })
    .error(function(statCode, msg) {
      res.writeHead(statCode, {'Content-Type': 'text/plain'});
      res.end("Error " + statCode);
      console.log(statCode, req.url, ip, msg);
    })
    .otherwise(function(err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end("Error 404: File not found");
      console.log(404, req.url, ip, err);
    });
}

//socket connection
io.sockets.on('connection', function (socket) 
{
	
	//connect
	//-------------------------------------------------------------------------
	console.log( "-----> client socket connected. ID: " + socket.id );
    
	//pick a random color for this user
	var myColor = generateRandomColor();
	
	//notify your client that you are connected, 
	//and send a list of already connected users, already created items, already created word chains.
	socket.emit('message', { sEvent:"connection", mySID:socket.id, items:items, color:myColor, chains:wordChains });
	
	//notify all the other users that a user has joined the game. ALL VIEWPORT RELATED INFO ARE SENT BY USER_SPAWN.
	socket.broadcast.emit('message', { sEvent:"user_connect", sID:socket.id });
	
	//create an item place holder waiting to get the spawn point
	items.push( { id:socket.id, type:"player" } );
	
	
	//messages
	//-------------------------------------------------------------------------
	socket.on('message', function (data) 
    {
		//this user has the viewport ready to go and the avatar pos rendered.
		if ( data.sEvent == "client_spawn" )
		{
			
			console.log("--------------------------------");
			console.log("User id: " + socket.id + " spawn");
			console.log("--------------------------------");
			
			//update this user information into the items list
			var usern    = findItemByID( socket.id );
			items[usern] = data.Item;
			
			//lets modify the event to look like a "user_spawn" socket event
			//this is just a semantic thing since i dont want to merge 
			//the client_spawn and user_spawn events.
			data.sEvent = "user_spawn";
			
			//broadcast to all the users this client position.
			socket.broadcast.emit( 'message', data );
		}
		
		//a user gain / lose points
		else if ( data.sEvent == "client_points_update" )
		{
			//update server item array
			var usern = findItemByID( socket.id );
			items[usern].score = data.score;
				
			//broadcast to all the users this client position.
			data.sEvent = "user_points_update";
			socket.broadcast.emit( 'message', data );
		}
		
		//this user is interacting with the game viewport
		else if ( data.sEvent == "client_avatar_interaction" )
		{
			if ( data.interaction == "move_player" )
			{
				//update server item array
				var usern = findItemByID( socket.id );
				items[usern].xpos  = data.xpos;
				items[usern].ypos  = data.ypos;
				items[usern].tiles = data.tiles;
			}
			else if ( data.interaction == "drop_block" )
			{
				console.log("--------------------------------");
				console.log("drop new block.");
				console.log("--------------------------------");
				console.log("color: " + data.color );
				console.log("id:    " + data.id );
				console.log("xpos:  " + data.xpos );
				console.log("ypos:  " + data.ypos );
				console.log("tiles: " + data.tiles.length );
				console.log("txt:   " + data.txt );
				
				//push block item
				items.push( { id:data.id,
							  type:"block", 
							  xpos:data.xpos,
							  ypos:data.ypos,
							  tiles:data.tiles,
							  color:data.color,
							  txt:data.txt } );
				
			}
			else if ( data.interaction == "add_chain" )
			{
				console.log("--------------------------------");
				console.log("add new word chain.");
				console.log("--------------------------------");
				console.log("chain id: " + data.id );
				console.log("length:   " + data.wordChain.length );
				
				//push block item
				wordChains.push( { id:data.id,
							       wordChain:data.wordChain } );
				
			}
			
			//broadcast to all the users this client position.
			data.sEvent = "user_avatar_interaction";
			socket.broadcast.emit( 'message', data );
		}
		
		//actions from client to control certain server behaviours.
		else if ( data.sEvent == "client_server_action" )
		{
			if ( data.interaction == "destroy_item" )
			{
				var itemn = findItemByID( data.id );
				
				if ( itemn != - 1 )
				{
					items.splice( itemn, 1 );
				}
				else
				{
					console.log("*Warning* item id " + data.id + " not found.");
				}
			}
			
			else if ( data.interaction == "remove_chain" )
			{
				var chainN = findChainByID( data.id );
				
				if ( chainN != - 1 )
				{
					wordChains.splice( chainN, 1 );
				}
				else
				{
					console.log("*Warning* chain id " + data.id + " not found.");
				}
			}
			
			//if broadcast is true, broadcast to all connected clients. if not, its a private call by a certain user.
			if ( data.broadcast )
			{
				data.sEvent = "user_server_action";
				socket.broadcast.emit( 'message', data );
			}
		}
	});
	
  	
	//disconnect
	//-------------------------------------------------------------------------
    socket.on('disconnect', function () 
    {
		console.log("--------------------------------");
		console.log( "Removing client id: " + socket.id );
		console.log("--------------------------------");
		
		var usern = findItemByID( socket.id );
		
		//remove this user
		if ( usern != -1 )
		{
			//remove from users array
			items.splice( usern, 1 );
		}
		else
		{
			console.log("*Warning* user id " + socket.id + " not found.");
		}
		
		//remove all blocks related to this user.
		var blockIDS = getBlockIDSByOwner( socket.id );
		for ( var j = (blockIDS.length - 1); j >= 0; j-- )
		{
			console.log("removing related block id: " + items[ blockIDS[j] ].id );
			items.splice( blockIDS[j], 1 );
		}
		
		//remove all wordChains related to this user.
		var chainIDS = getWordChainIDSByOwner( socket.id );
		for ( var j = (chainIDS.length - 1); j >= 0; j-- )
		{
			console.log("removing related wordChain #" + chainIDS[j] );
			wordChains.splice( chainIDS[j], 1 );
		}
		
		//notify all the other users that this user left the game.
		socket.broadcast.emit('message', { sEvent:"user_disconnect", id:socket.id });
		
    });
  
});

//utils
//-------------------------------------------------------------------------
	
//find users by id (return array #)
function findItemByID( id )
{
	var itemn = -1;
	for ( var i = 0; i < items.length; i++ )
	{
		if ( id == items[i].id )
		{
			itemn = i;
			break;
		}
	}
	return itemn;
}
//find chain by id (return array #)
function findChainByID( id )
{
	var chainN = -1;
	for ( var i = 0; i < wordChains.length; i++ )
	{
		if ( id == wordChains[i].id )
		{
			chainN = i;
			break;
		}
	}
	return chainN;
}

//generate a random distinctice color for every user
function generateRandomColor()
{
    var rint = Math.round(0xffffff * Math.random());
	return ('#0' + rint.toString(16)).replace(/^#0([0-9a-f]{6})$/i, '#$1');
}

function getWordChainIDSByOwner( ownerID )
{
	var chainIDS = [];
	for ( var i = 0; i < wordChains.length; i++ )
	{
		if ( ownerID == getChainOwnerID( wordChains[i].id ) )
		{
			//owner match.
			chainIDS.push( i );
		}
	}
	return chainIDS;
}

function getBlockIDSByOwner( ownerID )
{
	var blockIDS = [];
	
	for ( var i = 0; i < items.length; i++ )
	{
		if ( items[i].type == "block" )
		{
			if ( ownerID == getBlockOwnerID( items[i].id ) )
			{
				//owner match.
				blockIDS.push( i );
			}
		}
	}
	return blockIDS;
}

function getBlockOwnerID( blockID )
{
	var ownerID = blockID.toString().split( "_" )[2];
	return ownerID;
}
function getChainOwnerID( chainID )
{
	var ownerID = chainID.toString().split( "_" )[2];
	return ownerID;
}

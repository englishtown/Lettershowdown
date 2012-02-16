var frameCounter;

function initGameViewPort()
{
	
	//init interval to check for frame by frame animations 
	//N.B - (these animations are not refreshed server side.)
	frameCounter = setInterval( tick, 33 ) ;
	
	
	//Socket Listeners
	//------------------------------------------------------------------------------------------
	
	//when the viewport is ready, index is sending me the list of users already online, and a reference to my user color.
	$('#eventDispatcher').bind('socket_connection', function( event, params ) 
	{
		//update client color.
		clientColor = params.color;
		
		console.log("Building pre-existing game situation...");
		console.log("---------------------------------------");
		
		//render already connected users and blocks.
		for ( var i = 0; i < params.items.length; i++ )
		{
			console.log( "item type: " + params.items[i].type );
			
			if ( params.items[i].type == "player" )
			{
				buildPlayer( params.items[i].id, 
				             getTileX( params.items[i].xpos ), 
							 getTileY( params.items[i].ypos ),
							 params.items[i].color );
			}
			else if ( params.items[i].type == "block" )
			{
				//create a barricade block
				buildBlock( getTileX( params.items[i].xpos ), 
				            getTileY( params.items[i].ypos ), 
				            getBlockOwnerID( params.items[i].id ), 
				            params.items[i].id );
			}
		}
		
		//create my client
		clientID = params.mySID;
		var mySpawnPoint = generateTileSpawnPoint();
		var myClient     = buildClient( clientID, mySpawnPoint[0], mySpawnPoint[1] );
		
		//tell socket to spawn my client ( strips item ref to keep the socket comunication lighter )
		socket_client_spawn( { Item:duplicateItem4Socket( clientID) } );
		
	});
	
	//a new user spawn, lets add him to items array
	$('#eventDispatcher').bind('socket_user_spawn', function( event, params ) 
	{
		buildPlayer( params.Item.id, 
			         getTileX( params.Item.xpos ), 
				     getTileY( params.Item.ypos ),
				     params.Item.color );
	});
	
	//on user x avatar interaction
	$('#eventDispatcher').bind('socket_user_avatar_interaction', function( event, params ) 
	{
		switch( params.interaction )
		{
			case "move_player":
				//get this user array N
				var thisUserID = getItemNById(params.id);
				
				//update items array
				items[ thisUserID ].xpos  = params.xpos;
				items[ thisUserID ].ypos  = params.ypos;
				items[ thisUserID ].tiles = params.tiles;
				
				//animate avatar
				items[ thisUserID ].ref.move( params.xpos, params.ypos );
			break;
			
			case "shoot":
				//shoot the block bullet
				console.log(params.id + " shoot.");
				buildBullet( params.id, params.degrees );
			break;
			
			case "drop_block":
				//create a barricade block
				buildBlock( getTileX( params.xpos ), 
				            getTileY( params.ypos ), 
				            getBlockOwnerID( params.id ), 
				            params.id );
			break;
		}
	});
	
	//a user left the game. lets remove him from the viewport
	$('#eventDispatcher').bind('socket_user_disconnect', function( event, params ) 
	{
		//remove player from viewport
		removePlayer( params.id );
		
		//remove all blocks related to this player.
		destroyAllPlayerBlocks( params.id );
	});

}

function tick()
{
	
	
	if ( mouseDown.action == "dragAmmo" )
	{
		//dragging ammo functions here. 
	}
		
	else if ( mouseDown.action == "moveClient" )
	{
		//if our client is already processing an animation, let's ignore further animation requests.
		if ( ! movingClient )
		{
			var viewportTop    = $('#viewport').offset().top;
			var viewportLeft   = $('#viewport').offset().left;
	
			
			var mousex = temp.mousex - viewportLeft;
			var mousey = temp.mousey - viewportTop;
		
			var relx = mousex - mouseDown.startx;
			var rely = mousey - mouseDown.starty;
			
			var theta = Math.atan2(-rely, relx);
			
			//get client
			var clientN = getItemNById( clientID );
			
			//redraw drag line
			clearDragLine();
			dragLine = svg.line( items[clientN].xpos + ( PLAYER_W / 2 ), 
								 items[clientN].ypos + ( PLAYER_H / 2 ), 
								 mousex, 
								 mousey,
								 {fill: 'none', stroke: '#000000', strokeWidth:1 });
			
			if (theta < 0)
			{
				theta += 2 * Math.PI;
			}
			
			var degrees = theta * ( 180 / Math.PI );
			
			var direction = "";
			
			//0 - 44.9 -> right
			if ( degrees >= 0 && degrees < 45 )
			{
				direction = "right";	
			}
			//45 - 134.9 -> top
			else if ( degrees >= 45 && degrees < 135 )
			{
				direction = "top";	
			}
			//135 - 224.9 -> left
			else if ( degrees >= 135 && degrees < 225 )
			{
				direction = "left";	
			}
			//225 - 314.9 -> bottom
			else if ( degrees >= 225 && degrees < 315 )
			{
				direction = "bottom";	
			}
			//315 - 359.9 -> right
			if ( degrees >= 315 && degrees < 360 )
			{
				direction = "right";	
			}
			
			//is distance enough to trigger a movement?
			var relx = Math.abs( relx );
			var rely = Math.abs( rely );
			//console.log("relx: " + relx);
			
			if ( relx >= DISTANCE_2_MOVE_X || rely >= DISTANCE_2_MOVE_Y )
			{	
				var deltaX = 0;
				var deltaY = 0;
				
				var currXPos = items[clientN].xpos;
				var currYPos = items[clientN].ypos;
				var currStartTileX = getTileX( currXPos );
				var currStartTileY = getTileY( currYPos );
				
				var nextXPos;
				var nextYPos;
				var nextStartTileX;
				var nextStartTileY;
				
				if( direction  == "top")
				{
					deltaY = -1 * TILE_W;
				}
				else if( direction  == "right")
				{
					deltaX = TILE_W;
				}
				else if( direction  == "bottom")
				{
					deltaY = TILE_H;
				}
				else if( direction  == "left")
				{
					deltaX = -1 * TILE_W;
				}
				
				//update next positions
				nextXPos       = currXPos + deltaX;
				nextYPos       = currYPos + deltaY;
				nextStartTileX = getTileX( nextXPos );
				nextStartTileY = getTileY( nextYPos );
				
				//collision detection
				
				//check if the next move creates a possible collision.
				var isCollision = tileCollisionByTypeDirection( "player", 
																direction, 
																currStartTileX, 
																currStartTileY ).collision;
				
				
				if ( ! isCollision )
				{
					//ok, move client
					movingClient = true;
					
					console.log( "moving to the " + direction );
					
					//register current mouse x and y, we need to replace 
					//mouseDown startx / starty after every avatar animation is complete
					temp.mousexBeforeAnimate = mousex;
					temp.mouseyBeforeAnimate = mousey;
					
					//update array pos
					items[clientN].xpos = nextXPos;
					items[clientN].ypos = nextYPos;
					
					//update filled tiles array
					var filledTiles      = getFilledTiles( nextStartTileX, nextStartTileY, "player" );
					items[clientN].tiles = filledTiles;
					//console.log( "new pos x: " + items[clientN].xpos );
					//console.log( "new pos y: " + items[clientN].ypos );
					//console.log( "new tile x: " + nextStartTileX );
					//console.log( "new tile y: " + nextStartTileY );
					
					//if multiplayer lets broadcast movement
					if ( MODE == "mp" )
					{
						socket_client_avatar_interaction( { id:clientID,
						                                    interaction:"move_player",
															xpos:nextXPos,
															ypos:nextYPos,
															tiles:filledTiles
														    });
					}
					
					//move player
					items[clientN].ref.move( items[clientN].xpos, items[clientN].ypos );
				}
				else
				{
					console.log( "Can't move, object collision." );
				}
				
			}

			//-----------------------------------
			//moving client condition ends here.
			//-----------------------------------
		}
	}
}
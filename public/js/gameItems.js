// JavaScript Document

//items (blocks)
var items = [];

function buildBullet( playerid, degrees )
{
	var b = new bullet( playerid, degrees );
}

function computeBulletDamage( bulletOwnerID, dmgTargetId )
{
	var itemN = getItemNById( dmgTargetId );
	
	switch ( items[itemN].type )
	{
		case "block":
			
			//let check if this block is chained to one ore multiple wordChains
			var chainChk = chains.isBlockChained( getTileX( items[itemN].xpos ), getTileY( items[itemN].ypos ) );
			if ( chainChk.isChained )
			{
				//for now, lets just remove all the related chains.
				//in future, chains should absorb bullet damage.
				for ( var i = 0; i < chainChk.chains.length; i++ )
				{
					chains.remove( chainChk.chains[i].id );
					
					//if multiplayer, lets remove this chain from the server item list for users who will possibly connect later.
					//all the already connected users will see this chain destroyed runtime without server interactions.
					if ( MODE == "mp" )
					{
						socket_client_server_action( { interaction:"remove_chain",
													   broadcast:false,
													   id:chainChk.chains[i].id } );
					}
				
				}
			}
			
			//destroy this letter block.
			destroyBlock( dmgTargetId );
			
			//if this client is the owner of the bullet, lets assign points and trigger the socket behavior.
			if ( ME.sid == bulletOwnerID )
			{				
				//assign points
				gamePoints.assignPoints( 'bullet_hit_block', {} );
	
				
				//if multiplayer, lets remove this block from the server item list for users who will possibly connect later.
				//all the already connected users will see this block destroyed runtime without server interactions.
				if ( MODE == "mp" )
				{
					socket_client_server_action( { interaction:"destroy_item",
					                               broadcast:false,
					                               id:dmgTargetId } );
				}
			}
			
		break;
		
		case "player":
			
			//you hit another player
			if ( ME.sid == bulletOwnerID )
			{
				//assign points
				gamePoints.assignPoints( 'client_hit_player', { dmgTargetId:dmgTargetId } );
			}
			
			
			//you got hit by a player
			else if ( ME.sid == dmgTargetId )
			{
				//assign points
				gamePoints.assignPoints( 'client_got_hit', { bulletOwnerID:bulletOwnerID } );
			}
			
			
			console.log( "Animation TBI. bullet hit player: " + dmgTargetId );
			
		break;
	}
	
}

function destroyBlock( id )
{
	//remove gfx
	var itemN = getItemNById( id );	
	svg.remove( items[ itemN ].ref.block );
	svg.remove( items[ itemN ].ref.letter );
	
	//remove this item from items list
	items.splice( itemN, 1 );
}

function destroyAllPlayerBlocks( playerID )
{	
	//remove all blocks related to this user
	var blockIDS = getBlockIDSByOwner( playerID );
	
	//splice blocks from items array, ids top to bottom
	for ( var j = (blockIDS.length - 1); j >= 0; j-- )
	{
		//remove gfx
		svg.remove( items[ blockIDS[j] ].ref.block );
		svg.remove( items[ blockIDS[j] ].ref.letter );

		items.splice( blockIDS[j], 1 );
	}
}

function getSelectorBlockIDSByOwner( ownerID )
{
	var blockIDS = [];
	
	for ( var i = 0; i < chainSelector.length; i++ )
	{
		if ( ownerID == getBlockOwnerID( chainSelector[i].id ) )
		{
			//owner match.
			blockIDS.push( i );
		}
	}
	return blockIDS;
}

function destroyAllPlayerSelectorBlocks( playerID )
{	
	//remove all blocks related to this user
	var blockIDS = getSelectorBlockIDSByOwner( playerID );
	
	//splice blocks from items array, ids top to bottom
	for ( var j = (blockIDS.length - 1); j >= 0; j-- )
	{
		//remove gfx
		svg.remove( chainSelector[ blockIDS[j] ].ref.block );
		chainSelector.splice( blockIDS[j], 1 );
	}
}

function buildSelectorBlock( xtile, ytile, ownerID, mpBuiltItemID )
{
	//x | y starting pos
	var xpos = xtile * TILE_W;
	var ypos = ytile * TILE_H;
	
	//how many tiles a block takes?
	var blockXTiles = BLOCK_W / TILE_W;
	var blockYTiles = BLOCK_W / TILE_W;
	
	//fill tiles array
	var blockTiles = getFilledTiles( xtile, ytile, "block" );
	
	//colour block accoring to the owner.
	var blockFillColor   = "#FF0000";
	var blockStrokeColor = "#FF0000";
	
	//draw block
	var block = svg.rect( xpos, 
						  ypos, 
						  BLOCK_W, 
						  BLOCK_H, { fill:blockFillColor, stroke:blockStrokeColor, strokeWidth:1, 'fill-opacity': 0.5 });
	
	
	// is it a block created by this client or a block created by another user?
	var itemID = "";
	if ( mpBuiltItemID != undefined && mpBuiltItemID != null )
	{
		//block created by another user
		itemID = mpBuiltItemID;
	}
	else
	{
		//create a random ID 
		var rID = rIDBuilder.create();
		itemID  = "block_" + rID + "_" + ownerID;
			  
	}
	
	
						  
	//push into items array as type block 
	chainSelector.push( {   id:itemID, 
				  			xpos:xpos, 
				  			ypos:ypos, 
							xtile:xtile, 
				  			ytile:ytile,
							tiles:blockTiles, 
				  			ref:{ block:block },
				  			} );
				  
	//if multiplayer lets broadcast the new block creation
	/*
	if ( MODE == "mp" )
	{
		if ( mpBuiltItemID != undefined && mpBuiltItemID != null )
		{
			//this block has been created by another user. no need to broadcast again!
		}
		else
		{
			//broadcast this new built.
			socket_client_avatar_interaction( { id:"block_" + rID + "_" + ownerID,
			                                    interaction:"drop_block",
												xpos:xpos,
												ypos:ypos,
												tiles:blockTiles,
												color:blockColor,
												txt:txt
											    });
		}
	}
	*/
	
}

function buildBlock( xtile, ytile, txt, ownerID, mpBuiltItemID )
{
	//x | y starting pos
	var xpos = xtile * TILE_W;
	var ypos = ytile * TILE_H;
	
	//how many tiles a block takes?
	var blockXTiles = BLOCK_W / TILE_W;
	var blockYTiles = BLOCK_W / TILE_W;
	
	//fill tiles array
	var blockTiles = getFilledTiles( xtile, ytile, "block" );
	
	//colour block accoring to the owner.
	var blockColor = items[getItemNById( ownerID )].color;
	
	//draw block
	var block = svg.rect( xpos, 
						  ypos, 
						  BLOCK_W, 
						  BLOCK_H, { fill:blockColor, stroke: "#999999", strokeWidth: 0, 'fill-opacity': 1 });
	
						  
	var letter = svg.text( xpos + ( BLOCK_W / 2 ), 
							   ypos + ( BLOCK_H / 2 ) + 10, 
							   txt, 
							   { 'font-family':"DIN1451StdEngschrift", 
							     'font-size':30, 
								 'text-anchor':"middle", 
								 'fill':"#000000",
								 'opacity':".5"
								 }); 
	
	// is it a block created by this client or a block created by another user?
	var itemID = "";
	if ( mpBuiltItemID != undefined && mpBuiltItemID != null )
	{
		//block created by another user
		itemID = mpBuiltItemID;
	}
	else
	{
		//create a random ID 
		var rID = rIDBuilder.create();
		itemID  = "block_" + rID + "_" + ownerID;
			  
	}
	
	
						  
	//push into items array as type block 
	items.push( { type:"block", 
				  id:itemID, 
				  xpos:xpos, 
				  ypos:ypos, 
				  ref:{block:block,letter:letter},
				  tiles:blockTiles,
				  color:blockColor,
				  txt:txt } );
				  
	//if multiplayer lets broadcast the new block creation
	if ( MODE == "mp" )
	{
		if ( mpBuiltItemID != undefined && mpBuiltItemID != null )
		{
			//this block has been created by another user. no need to broadcast again!
		}
		else
		{
			//broadcast this new built.
			socket_client_avatar_interaction( { id:"block_" + rID + "_" + ownerID,
			                                    interaction:"drop_block",
												xpos:xpos,
												ypos:ypos,
												tiles:blockTiles,
												color:blockColor,
												txt:txt
											    });
		}
	}
	
}

function generateTileSpawnPoint()
{
	var myXtile = Math.round( Math.random() * TILES_X );
	var myYtile = Math.round( Math.random() * TILES_Y );
	
	return [ myXtile, myYtile ];
}

//create a duplicate of an item, stripped of the ref, to keep socket comunication light.
function duplicateItem4Socket( clientID )
{
	var itemN = getItemNById( clientID );
	
	var ItemDuplicate   = {};
	ItemDuplicate.id    = items[itemN].id;
	ItemDuplicate.type  = items[itemN].type;
	ItemDuplicate.xpos  = items[itemN].xpos;
	ItemDuplicate.ypos  = items[itemN].ypos;
	ItemDuplicate.tiles = items[itemN].tiles;
	ItemDuplicate.color = items[itemN].color;
	ItemDuplicate.name  = items[itemN].name;
	ItemDuplicate.score = items[itemN].score;
	
	return ItemDuplicate;
}

function buildPlayer( id, xtile, ytile, color, name, score )
{
	var player = {};
	
	var xpos = xtile * TILE_W;
	var ypos = ytile * TILE_H;
	
	//fill tiles array
	var blockTiles = getFilledTiles( xtile, ytile, "player" );
	
	//create avatar
	var pAvatar = svg.rect( xpos, 
					        ypos, 
					        PLAYER_W, 
					        PLAYER_H, 
					        {fill:color, stroke: "navy", strokeWidth: 0});
	
	pAvatar.move = function( x, y )
	{				 
		$(this).animate( { svgX:x, svgY:y }, 
						   100 );	
	}
	
	player.id    = id;
	player.type  = "player";
	player.ref   = pAvatar;
	player.xpos  = xpos;
	player.ypos  = ypos;
	player.tiles = blockTiles;
	player.color = color;
	player.name  = name;
	player.score = score;
	
	items.push( player );
	
	//add a tooltip for this player
	var t = gameTooltips.add( id );
	
	//initial positioning
	t.position( xpos, ypos );
	
	return player;
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

function removePlayer( id )
{
	//get array N
	var playerArrN = getItemNById( id );
		
	//remove gfx
	svg.remove( items[ playerArrN ].ref );
	
	//remove from array
	items.splice( playerArrN, 1 );
}

function buildClient( id, xtile, ytile, color, name, score )
{
	var client = {};
	
	var xpos = xtile * TILE_W;
	var ypos = ytile * TILE_H;
	
	//fill tiles array
	var blockTiles = getFilledTiles( xtile, ytile, "player" );
	
	avatar = svg.rect( xpos, 
					   ypos, 
					   PLAYER_W, 
					   PLAYER_H, 
					   {fill:color, stroke: "#ffe400", strokeWidth: 1});
	
	avatar.move = function( x, y )
	{					 
		$(this).animate( { svgX:x, svgY:y }, 
						  100,
						  onAvatarMove );	
	}
	
	function onAvatarMove()
	{
		mouseDown.startx = temp.mousexBeforeAnimate;
		mouseDown.starty = temp.mouseyBeforeAnimate;
	
		//ready for the next move.
		movingClient = false;	
	}
	
	client.id    = id;
	client.type  = "player";
	client.ref   = avatar;
	client.xpos  = xpos;
	client.ypos  = ypos;
	client.tiles = blockTiles;
	client.color = color;
	client.name  = name;
	client.score = score;
	
	items.push( client );
	
	//add a tooltip for my client
	var t = gameTooltips.add( id );
	
	//initial positioning
	t.position( xpos, ypos );
	
	return client;
}

//type -> player / block (return an array # array)
function getItemsByType( type )
{
	var myItemsId = [];
	
	for ( var i = 0; i < items.length; i++ )
	{
		if ( items[i].type == type )
		{
			myItemsId.push( i );
		}
	}
	return myItemsId;
}

function getItemNById( id )
{
	var myItemN = -1;
	
	for ( var i = 0; i < items.length; i++ )
	{
		if ( items[i].id == id )
		{
			myItemN = i;
			break;
		}
	}
	return myItemN;
}

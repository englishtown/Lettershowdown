function onDropAmmo( e, ui )
{
	var txt = $(e.target).html().toUpperCase();
	
	//get currently dragging box top x top y pos
	var dropxPos = parseInt( ui.offset.left ) + (TILE_W / 2);
	var dropyPos = parseInt( ui.offset.top ) + (TILE_H / 2);
	
	var dropData = computeDropAmmo( dropxPos, dropyPos );
	if ( dropData.buildOK )
	{
		//build barricade block.
		buildBlock( dropData.xtile, dropData.ytile, txt, clientID );
		
		//remove ammo block from dock
		removeDockAmmoByID( temp.draggingAmmoId );
	}

	resetMouseDown();
}
function onDragAmmo(e)
{
	//console.log("start dragging ammo.")
	mouseDown.action = "dragAmmo";
}
function isViewportHit( xmouse, ymouse )
{
	var hit = false;
	
	var viewportTop    = $('#viewport').offset().top;
	var viewportLeft   = $('#viewport').offset().left;
	var viewportRight  = viewportLeft + $('#viewport').width();
	var viewportBottom = viewportTop + $('#viewport').height();
	
	//check if mouse hits viewport area
	if ( xmouse >= viewportLeft &&
		 xmouse <= viewportRight && 
		 ymouse >= viewportTop &&
		 ymouse <= viewportBottom
	   )
	{
		hit = true;
	}
	return hit;
}
function computeDropAmmo( xmouse, ymouse )
{
	var info         = {};
	info.hit         = false;
	info.buildOK     = true;
	info.xtile       = -1;
	info.ytile       = -1;
	info.tiles       = [];

	var viewportHit = isViewportHit( xmouse, ymouse );
	
	//check if mouse hits viewport area
	if ( viewportHit )
	{
		//we are hitting viewport area.
		info.hit = true;
		
		//translate mouse x y pos to xtile ytile pos
		info.xtile = getTileX( xmouse );
		info.ytile = getTileY( ymouse );
		
		//get potentially filled tiles set
		info.tiles = getFilledTiles( info.xtile, info.ytile, "block" );
		
		//check if any of the potentially filled tiles are already taken.
		for ( var i = 0; i < info.tiles.length; i++ )
		{
			if ( ! checkTileIfEmpty( info.tiles[i].xtile, info.tiles[i].ytile ).empty )
			{
				info.buildOK = false;	
				break;
			}
		}
	}
	else
	{
		info.hit     = false;
		info.buildOK = false;
	}
	
	return info;	
}

function resetMouseDown()
{
	mouseDown = { action:"none", 
	              startx:0, 
				  starty:0, 
				  interval:{}, 
				  msPassed:0, 
				  intervalMs:100,
				  computeInterval:function() { mouseDown.msPassed += mouseDown.intervalMs; },
				  wordChain:[]
				  };
}

function linkBlock2SelectorChain( tilex, tiley, id, txt )
{
	console.log( "chaining block id: " + id + ", tilex: " + tilex + ", tiley: " + tiley + ", letter: " + txt );
	mouseDown.wordChain.push( [ tilex, tiley, id, txt ] );
	
	//build selector block
	buildSelectorBlock( tilex, tiley, ME.sid );	
}

function initMouseInteractions() 
{
	resetMouseDown();
	
	//drag and drop ammo functions
	//---------------------------------------------
	$('.ammo').draggable( 
	{
    	cursor: 'move',
    	helper: cloneAmmoBlock,
    	start: onDragAmmo,
    	stop: onDropAmmo
  	});
  	
	
	//viewport functions
	//---------------------------------------------
	$(document).mousedown(function(e)
	{
		if ( ! isViewportHit( e.pageX, e.pageY ) )
		{
			return;
		}
		
		var viewportTop    = $('#viewport').offset().top;
	    var viewportLeft   = $('#viewport').offset().left;
		
		var mousex = e.pageX - viewportLeft;
		var mousey = e.pageY - viewportTop;
		
		//tile check for this click
		var blockTouch         = false;
		var mouseTileX         = getTileX( mousex );
		var mouseTileY 		   = getTileY( mousey );
		var tileInfo   		   = checkTileIfEmpty( mouseTileX, mouseTileY );
		
		if ( ! tileInfo.empty )
		{
			if ( items[  getItemNById( tileInfo.ownerID ) ].type == "block" )
			{
				blockTouch = true;
			}
		}
		
		//get client array #
		var clientN = getItemNById( clientID );
		
		//get client 4 points coords
		var poly = [];
		//top left
		poly.push([ items[clientN].xpos, items[clientN].ypos ]);
		//top right
		poly.push([ (items[clientN].xpos + PLAYER_W), items[clientN].ypos ]);
		//bottom right
		poly.push([ (items[clientN].xpos + PLAYER_W), (items[clientN].ypos + PLAYER_H) ]);
		//bottom left
		poly.push([ items[clientN].xpos, (items[clientN].ypos + PLAYER_H) ]);
		
		//we are clicking over our avatar
		if ( pointInPoly(poly, mousex, mousey) )
		{
			mouseDown.action = "moveClient";
			mouseDown.startx = mousex;
			mouseDown.starty = mousey;
		}
		
		//we are clicking over a block
		else if ( blockTouch )
		{
			mouseDown.action = "wordChain_or_shoot";
			mouseDown.startx = mousex;
			mouseDown.starty = mousey;
			
			//start timer.
			mouseDown.interval = setInterval( mouseDown.computeInterval, mouseDown.intervalMs );
		}
		
		//we are clicking on empty space
		else
		{
			//shoot the first available tile.
			mouseDown.action = "shoot";
		}
		
		//prevent default
		return false;
	});
	
	
	//mouse up
	$('#viewport').mouseup(function(e) 
	{
		//first of all, if action is "wordBuild_or_shoot", we need to decide 
		//wich action to take. lets look at the mousedown timer to decide.
		if ( mouseDown.action == "wordChain_or_shoot" )
		{
			clearInterval( mouseDown.interval );
			
			//<= 1.5 second, lets take this action as "shoot"
			if ( mouseDown.msPassed <= 1000 && mouseDown.wordChain.length == 0 )
			{
				mouseDown.action = "shoot";
			}
			else
			{
				mouseDown.action = "wordChain";
			}
		}
	
	
		//switch by mouseDownAction:
		if ( mouseDown.action == "moveClient" )
		{
			clearDragLine();
		}
		
		else if ( mouseDown.action == "shoot" )
		{
			var ammoLetter = loadAmmo();
			if ( ammoLetter !== "" )
			{
				//get target x / y ( = current mouse x / y )
				var mousex = e.pageX - this.offsetLeft;
				var mousey = e.pageY - this.offsetTop;
				
				var clientN = getItemNById( clientID );
				var clientX = items[clientN].xpos + PLAYER_W / 2;
				var clientY = items[clientN].ypos + PLAYER_H / 2;
				
				//get angle avatar center / mouse
				var degrees = getP1P2degrees( [clientX,clientY], [mousex,mousey], "360" );
				
				//shoot the block bullet
				buildBullet( clientID, degrees );
				
				//remove this ammo from dock. we are always removing the first from left (1, not 0)
				removeDockAmmoByN( 1 );
				
				//if multiplayer lets broadcast this shooting action
				if ( MODE == "mp" )
				{
					socket_client_avatar_interaction( { id:clientID,
					                                    interaction:"shoot",
														degrees:degrees });
				}
			}
			
		}
		
		else if ( mouseDown.action == "wordChain" )
		{
			//register into temp for later reference.
			temp.wordChain = mouseDown.wordChain;
			
			//clear chain selector
			destroyAllPlayerSelectorBlocks( ME.sid );
			
			//attempt to build word. at least 2 letter words.
			if ( mouseDown.wordChain.length >= 2 )
			{
				var wordAttempt = "";
				for ( var i = 0; i < mouseDown.wordChain.length; i++ )
				{
					wordAttempt += mouseDown.wordChain[i][3];
				}
				
				myDictionary.check( wordAttempt );
			}
			else
			{
				console.log("Cant build words with less than 2 letters!");
			}
	
		}
		
		//mouseDownAction back to none 
		resetMouseDown();
	});
	
	
	$(document).mousemove(function(e) 
	{
		temp.mousex = e.pageX;
		temp.mousey = e.pageY;
		
		//if we are trying to build a word chain.
		if ( mouseDown.action == "wordChain_or_shoot" )
		{
			
			//tile check for this click
			var mouseTileX         = getTileX( e.pageX );
			var mouseTileY 		   = getTileY( e.pageY );
			var tileInfo   		   = checkTileIfEmpty( mouseTileX, mouseTileY );
			var tileObj            = {};
			var blockTouch         = false;
			
			
			if ( ! tileInfo.empty )
			{
				tileObj = items[  getItemNById( tileInfo.ownerID ) ];
				
				if ( tileObj.type == "block" )
				{ 
					blockTouch = true;
					
					//block tile x,y might be slighty different from mouse tile x,y. 
					//when we build the selector block, we need letter block starting 
					//x and y just to be sure to create selectors that aligns to the blocks underneat.
					mouseTileX = getTileX( tileObj.xpos );
					mouseTileY = getTileY( tileObj.ypos );
				}
			}
			
			//if we are over a block, lets check:
			//1. is this block already into my wordChain?
			var isInMyWordChain = false;
			
			for ( var i = 0; i < mouseDown.wordChain.length; i++ )
			{
				if ( mouseTileX == mouseDown.wordChain[i][0] && mouseTileY == mouseDown.wordChain[i][1]  )
				{
					isInMyWordChain = true;
					break;
				}
			}
			
			//2. if so, is this block adjoining to the last block into my wordChain, or is it the first block of the chain?
			//if so, this block is finally available to be added to the chain.
			var blockIsChainable = false;
			
			if ( ! isInMyWordChain )
			{
				if ( mouseDown.wordChain.length == 0 )
				{
					blockIsChainable =  true;
				}
				else
				{
					var pchk = blockProximityCheck( { tilex:mouseTileX, 
												      tiley:mouseTileY }, 
												    { tilex:mouseDown.wordChain[mouseDown.wordChain.length - 1][0], 
												      tiley:mouseDown.wordChain[mouseDown.wordChain.length - 1][1] } );
													  
					if ( pchk.proximity )
					{
						blockIsChainable =  true;
					}
				}
			}
			
			//3. if block is elegible, lets push it into the array.
			if ( blockIsChainable )
			{
				linkBlock2SelectorChain( mouseTileX, mouseTileY, tileObj.id, tileObj.txt );
			}
			
		}
		
	});
}
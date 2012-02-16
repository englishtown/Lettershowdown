function onDropAmmo( e, ui )
{
	//get currently dragging box top x top y pos
	var dropxPos = parseInt( ui.offset.left );
	var dropyPos = parseInt( ui.offset.top );
	
	var dropData = computeDropAmmo( dropxPos, dropyPos );
	if ( dropData.buildOK )
	{
		//build barricade block.
		buildBlock( dropData.xtile, dropData.ytile, clientID );
		
		//remove ammo block from dock
		removeDockAmmoByID( temp.draggingAmmoId );
	}

	resetMouseDown();
}
function onDragAmmo(e)
{
	console.log("start dragging ammo.")
	
	mouseDown.action = "dragAmmo";
}
function computeDropAmmo( xmouse, ymouse )
{
	var info         = {};
	info.hit         = false;
	info.buildOK     = true;
	info.xtile       = -1;
	info.ytile       = -1;
	info.tiles       = [];
	
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
	mouseDown = { action:"none", startx:0, starty:0 };
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
	$('#viewport').mousedown(function(e) 
	{
		var mousex = e.pageX - this.offsetLeft;
		var mousey = e.pageY - this.offsetTop;
		
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
		else
		{
			//shoot the first available tile.
			mouseDown.action = "shoot";
		}
		
		console.log("set mouseDownAction to: " + mouseDown.action );
	});
	
	
	//mouse up
	$('#viewport').mouseup(function(e) 
	{
		//action depending on mouseDownAction here
		if ( mouseDown.action == "moveClient" )
		{
			//bug, looks like its not clearing or clearing very late
			clearDragLine();
			
			//alert(dragLine);
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
		
		//mouseDownAction back to none 
		resetMouseDown();
	});
	
	
	$(document).mousemove(function(e) 
	{
		temp.mousex = e.pageX;
		temp.mousey = e.pageY;		
	});
}
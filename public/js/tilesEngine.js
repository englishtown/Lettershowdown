function getBlockOwnerID( blockID )
{
	var ownerID = blockID.toString().split( "_" )[2];
	return ownerID;
}

function getTileX( xpos )
{
	return Math.floor( xpos / TILE_W );
}

function getTileY( ypos )
{
	return Math.floor( ypos / TILE_H );
}

function blockProximityCheck( blockA, blockB )
{
	var proxInfo       = {};
	proxInfo.proximity = false;
	
	var blockXTiles = BLOCK_W / TILE_W;
	var	blockYTiles = BLOCK_W / TILE_W;
	
	
	if ( blockA.tilex ==  blockB.tilex - blockXTiles || blockA.tilex ==  blockB.tilex + blockXTiles || blockA.tilex ==  blockB.tilex )
	{
		if ( blockA.tiley ==  blockB.tiley - blockYTiles || blockA.tiley ==  blockB.tiley + blockYTiles || blockA.tiley ==  blockB.tiley )
		{
			//of course we cannot accept to check the same tile!
			if ( blockA.tilex ==  blockB.tilex && blockA.tiley ==  blockB.tiley)
			{
				proxInfo.proximity = false;
			}
			else
			{
				proxInfo.proximity = true;
			}
		}
	}
	return proxInfo;
}

//check if tile [x,y] is empty or not
function checkTileIfEmpty( xtile, ytile )
{
	var tileInfo     = {};
	tileInfo.empty   = true;
	tileInfo.ownerID = "";
	
	for ( var i = 0; i < items.length; i++ )
	{
		
		//console.log( "scanning id: " + items[i].id );
		
		//loop into tiles taken by this item
		for ( var j = 0; j < items[i].tiles.length; j++ )
		{
			//console.log( "x: " + items[i].tiles[j].x );
			//console.log( "y: " + items[i].tiles[j].y );
			if ( xtile == items[i].tiles[j].xtile && 
				 ytile == items[i].tiles[j].ytile )
			{
				tileInfo.ownerID = items[i].id;
				tileInfo.empty   = false;
				break;
			}
			//console.log( "--------------------------" );
		}
	}
	
	return tileInfo;
}

function getFilledTiles( tileStartX, tileStartY, type )
{
	var blockTiles = [];
	
	var blockXTiles;
	var blockYTiles;
	
	switch ( type )
	{
		case "block":
			blockXTiles = BLOCK_W / TILE_W;
			blockYTiles = BLOCK_W / TILE_W;
		break;
		
		case "player":
			blockXTiles = PLAYER_W / TILE_W;
			blockYTiles = PLAYER_W / TILE_W;
		break;
	}
	
	var z = 0;
	for ( var j = 0; j < blockYTiles; j++ )
	{
		for ( var i = 0; i < blockXTiles; i++ )
		{
			var myCoords = {};
			myCoords.xtile = tileStartX + ( i );
			myCoords.ytile = tileStartY + ( j );
			//console.log("add tile x: " + myCoords.xtile + " y: " + myCoords.ytile );
			blockTiles[z] = myCoords;
			z++;
		}
	}
	
	return blockTiles;
}


function tileCollisionByTypeDirection( type, direction, currTileStartX, currTileStartY, ignoreIds )
{
	if ( ignoreIds == undefined || ignoreIds == null )
	{
		ignoreIds = [];
	}
	
	var myTile       = {};
	myTile.collision = false;
	myTile.ownerID   = "";
	
	//var currTiles = getFilledTiles( currTileStartX, currTileStartY, type );
	var xTilesSurface;
	var yTilesSurface;
	
	if ( type == "player" )
	{
		xTilesSurface = PLAYER_W / TILE_W;
		yTilesSurface = PLAYER_H / TILE_H;
	}
	else if ( type == "block" )
	{
		xTilesSurface = BLOCK_W / TILE_W;
		yTilesSurface = BLOCK_H / TILE_H;
	}
	
	var tile2checkX;
	var tile2checkY;
	
	var tileChk        = {};
	var id2ignoreFound = false;
	
	if( direction  == "top")
	{
		for ( var i = 0; i < xTilesSurface; i++ )
		{
			
			tile2checkX = currTileStartX + i;
			tile2checkY = currTileStartY - 1;
			
			tileChk = checkTileIfEmpty( tile2checkX, tile2checkY );
			
			if ( ! tileChk.empty )
			{
				for ( var j = 0; j < ignoreIds.length; j++ )
				{
					if ( ignoreIds[j] ==  tileChk.ownerID )
					{
						id2ignoreFound = true;
						break;
					}
				}
				if ( ! id2ignoreFound )
				{
					//no ids that i need to ignore. set as collision
					myTile.ownerID   = tileChk.ownerID;
					myTile.collision = true;
					break;
				}
				else
				{
					//i found an item to ignore, so keep on looping.
					id2ignoreFound = false;
				}
			}
		}
	}
	else if( direction  == "right")
	{
		for ( var i = 0; i < yTilesSurface; i++ )
		{
			
			tile2checkY = currTileStartY + i;
			tile2checkX = ( currTileStartX + xTilesSurface );
			
			tileChk = checkTileIfEmpty( tile2checkX, tile2checkY );
			
			if ( ! tileChk.empty )
			{
				for ( var j = 0; j < ignoreIds.length; j++ )
				{
					if ( ignoreIds[j] ==  tileChk.ownerID )
					{
						id2ignoreFound = true;
						break;
					}
				}
				if ( ! id2ignoreFound )
				{
					//no ids that i need to ignore. set as collision
					myTile.ownerID   = tileChk.ownerID;
					myTile.collision = true;
					break;
				}
				else
				{
					//i found an item to ignore, so keep on looping.
					id2ignoreFound = false;
				}
			}
		}
	}
	else if( direction  == "bottom")
	{
		for ( var i = 0; i < xTilesSurface; i++ )
		{
			
			tile2checkX = currTileStartX + i;
			tile2checkY = ( currTileStartY + yTilesSurface );
			
			tileChk = checkTileIfEmpty( tile2checkX, tile2checkY );
			
			if ( ! tileChk.empty )
			{
				for ( var j = 0; j < ignoreIds.length; j++ )
				{
					if ( ignoreIds[j] ==  tileChk.ownerID )
					{
						id2ignoreFound = true;
						break;
					}
				}
				if ( ! id2ignoreFound )
				{
					//no ids that i need to ignore. set as collision
					myTile.ownerID   = tileChk.ownerID;
					myTile.collision = true;
					break;
				}
				else
				{
					//i found an item to ignore, so keep on looping.
					id2ignoreFound = false;
				}
			}
		}
	}
	else if( direction  == "left")
	{
		for ( var i = 0; i < yTilesSurface; i++ )
		{
			
			tile2checkY = currTileStartY + i;
			tile2checkX = currTileStartX - 1;
			
			tileChk = checkTileIfEmpty( tile2checkX, tile2checkY );
			
			if ( ! tileChk.empty )
			{
				for ( var j = 0; j < ignoreIds.length; j++ )
				{
					if ( ignoreIds[j] ==  tileChk.ownerID )
					{
						id2ignoreFound = true;
						break;
					}
				}
				if ( ! id2ignoreFound )
				{
					//no ids that i need to ignore. set as collision
					myTile.ownerID   = tileChk.ownerID;
					myTile.collision = true;
					break;
				}
				else
				{
					//i found an item to ignore, so keep on looping.
					id2ignoreFound = false;
				}
			}
		}
	}
	
	return myTile;
}
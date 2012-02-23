// JavaScript Document
function wordChains()
{
	var _chains = [];
	
	this.isBlockChained = function( tilex, tiley )
	{
		var info       = {};
		info.isChained = false;
		info.chains    = [];
		
		for ( var i = 0; i < _chains.length; i++ )
		{
			
			for ( var k = 0; k < _chains[i].elements.length; k++ )
			{
				if ( tilex == _chains[i].elements[k].startTileX && tiley == _chains[i].elements[k].startTileY ||
				     tilex == ( _chains[i].elements[k].endTileX - Math.floor( BLOCK_W / TILE_W ) ) && tiley == ( _chains[i].elements[k].endTileY - Math.floor( BLOCK_H / TILE_H ) ) )
				{
					//this chain includes the block we are looking for.
					//( keep on looping into i loop, in case other chains need to be included. )
					info.isChained = true;
					info.chains.push( { id:_chains[i].id } );
					break;
				}
			}
		}
		
		return info;
	}
	
	this.removeAllPlayerChains = function( playerID )
	{
		var removeIDS = [];
		for ( var i = 0; i < _chains.length; i++ )
		{
			if ( playerID == this.getChainOwner( _chains[i].id ) )
			{
				removeIDS.push( _chains[i].id );
			}
		}
		
		for ( var k = 0; k < removeIDS.length; k++ )
		{
			this.remove( removeIDS[k] );
		}
	}
	
	this.remove = function( id )
	{
		var chainN = this.getChainNbyID( id );
		console.log( "removing chain #" + chainN  );
		
		if ( chainN != -1 )
		{
			//remove graphics
			for ( var i = 0; i < _chains[chainN].elements.length; i++ )
			{
				svg.remove( _chains[chainN].elements[i].ref );
			}
			
			//splice from array.
			_chains.splice( chainN, 1 );
		}
		else
		{
			console.log("wordChains.remove() error. id not found: " + id );
		}
	}
	
	this.add = function( wordChain, mpBuiltItemID )
	{
		var chain          = {};
		chain.id           = "";
		chain.elements     = [];
		chain.selectorData = wordChain;
		
		//create unique chain ID if needed.
		if ( mpBuiltItemID != undefined && mpBuiltItemID != null && mpBuiltItemID != "" )
		{
			//block created by another user
			chain.id = mpBuiltItemID;
		}
		else
		{
			//create a random ID 
			var rID   = rIDBuilder.create();
			chain.id  = "chain_" + rID + "_" + ME.sid;  
		}
		
		console.log( "adding chain id: " + chain.id );
		
		for ( var i = 0; i < ( wordChain.length - 1); i++ )
		{
			/*
			console.log("tilex: " + wordChain[i][0]);
			console.log("tiley: " + wordChain[i][1]);
			console.log("id:    " + wordChain[i][2]);
			console.log("txt:   " + wordChain[i][3]);
			*/
			var startTileX  = wordChain[i][0];
			var startTileY  = wordChain[i][1];
			var endTileX    = wordChain[i + 1][0] + Math.floor( BLOCK_W / TILE_W );
			var endTileY    = wordChain[i + 1][1] + Math.floor( BLOCK_H / TILE_H );
			var tilesWidth  = endTileX - startTileX;
			var tilesHeight = endTileY - startTileY;
			var padding     = BLOCK_W / 6;
			var roundCorners = 8;
			
			var startx = ( startTileX * TILE_W ) + ( padding );
			var starty = ( startTileY * TILE_H ) + ( padding );
			var width  = ( tilesWidth * TILE_W ) - ( padding * 2 );
			var height = ( tilesHeight * TILE_H ) - ( padding * 2 );
			
			/*
			console.log("tilesWidth: " + tilesWidth);
			console.log("tilesHeight: " + tilesHeight);
			console.log("--------------");
			*/
			
			var element = svg.rect( startx, 
						            starty, 
						            width, 
						            height, 
									roundCorners, 
									roundCorners, 
									{ fill:"#FFFFFF", stroke:"#FFFFFF", strokeWidth:1, 'fill-opacity': 0, 'stroke-opacity': 0.85 });
									
			chain.elements.push( { startTileX:startTileX, startTileY:startTileY, endTileX:endTileX, endTileY:endTileY, ref:element });
		}
		
		//add to _chains list
		_chains.push( chain );
		
		//if multiplayer lets broadcast the new block creation
		if ( MODE == "mp" )
		{
			if ( mpBuiltItemID != undefined && mpBuiltItemID != null && mpBuiltItemID != "" )
			{
				//this block has been created by another user. no need to broadcast again!
			}
			else
			{
				//broadcast this new built.
				socket_interaction( "client_avatar_interaction", 
				                    { interaction:"add_chain",
									  wordChain:wordChain,
									  id:chain.id } );
			}
		}
		
		this.getChainNbyID = function( id )
		{
			var n = -1;
			for ( var i = 0; i < _chains.length; i++ )
			{
				if ( _chains[i].id == id )
				{
					n = i;
					break;
				}
			}
			return n;
		}
		
		this.getChainOwner = function ( id )
		{
			var ownerID = id.toString().split( "_" )[2];
			return ownerID;
		}
		
		
	}
}
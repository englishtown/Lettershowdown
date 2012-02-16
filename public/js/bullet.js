function bullet( playerid, degrees )
{
	var _this     = this;
	
	this.playerid = playerid;
	this.degrees  = degrees;
	this.playern  = getItemNById( this.playerid );			
	this.myx      = items[this.playern].xpos + ( PLAYER_W / 4 );
	this.myy      = items[this.playern].ypos + ( PLAYER_H / 4 );
	this.gfx      = svg.rect( this.myx, 
						      this.myy, 
						      BLOCK_W, 
						      BLOCK_H, { fill:items[this.playern].color, stroke: "#000000", strokeWidth: 1, 'fill-opacity': 1 });
	
	
	this.destroy = function()
	{
		$(this.gfx).stop();
		
		svg.remove( this.gfx );
	}
	
	this.onStep = function()
	{
		this.step( this.computeNextStep() );
	}
						      
	
	this.step = function( info )
	{
		if ( info.hit )
		{
			console.log( "Bullet hit: " + info.hitTargets[0] )
			
			this.destroy();
			
			computeBulletDamage( info.hitTargets[0] );
		}
		else
		{
			//already update to the next pos
			this.myx  = info.nextXPos;
			this.myy  = info.nextYPos;
			
			//are we hitting world borders?
			if ( this.myx > ( VIEWPORT_W + BLOCK_W ) || 
			     this.myy > ( VIEWPORT_H + BLOCK_H ) ||
			     this.myx < ( 0 - BLOCK_W ) ||
			     this.myy < ( 0 - BLOCK_H ) )
			{
				//if so, destroy bullet
				this.destroy();
			}
			else
			{
				//if not, keep on running bullet
				$(this.gfx).animate( { svgX:info.nextXPos, 
							       	   svgY:info.nextYPos }, 25, 'linear', function(){ _this.onStep(); } );
			}
					
		}
	}
	
	
	this.computeNextStep = function()
	{
		var info            = {};
		info.hit            = false;
		info.hitTargets     = [];
		info.deltax         = 0;
		info.deltay         = 0;
		info.nextXPos       = 0;
		info.nextYPos       = 0;
		info.currStartTileX = 0;
		info.currStartTileY = 0;
		info.nextStartTileX = 0;
		info.nextStartTileY = 0;
		
		var direction = "";
		
		//0 - 44.9 -> right
		if ( this.degrees >= 0 && this.degrees < 45 )
		{
			direction = "right";
			info.deltax = TILE_W;	
		}
		//45 - 134.9 -> top
		else if ( this.degrees >= 45 && this.degrees < 135 )
		{
			direction = "top";
			info.deltay = -1 * TILE_W;	
		}
		//135 - 224.9 -> left
		else if ( this.degrees >= 135 && this.degrees < 225 )
		{
			direction = "left";
			info.deltax = -1 * TILE_W;	
		}
		//225 - 314.9 -> bottom
		else if ( this.degrees >= 225 && this.degrees < 315 )
		{
			direction = "bottom";
			info.deltay = TILE_H;	
		}
		//315 - 359.9 -> right
		if ( this.degrees >= 315 && this.degrees < 360 )
		{
			direction = "right";
			info.deltax = TILE_W;
		}
		
		//collision check
		info.currStartTileX = getTileX( this.myx );
		info.currStartTileY = getTileY( this.myy );
		info.nextXPos       = this.myx + info.deltax;
		info.nextYPos       = this.myy + info.deltay;
		info.nextStartTileX = getTileX( info.nextXPos );
		info.nextStartTileY = getTileX( info.nextYPos );
		
		//tile collision check. i am adding the player who shoot this bullet to the ignoreIds 
		//optional field of tileCollisionByTypeDirection()
		var tileCheck      = tileCollisionByTypeDirection( "block", 
														   direction, 
														   info.currStartTileX, 
														   info.currStartTileY,
														   [this.playerid] );
														   
		info.hit           = tileCheck.collision;
		if ( info.hit )
		{
			//add objects collided (working with tiles for now so its only 1)
			info.hitTargets[0] = tileCheck.ownerID;
		}
		else
		{
			//no collisions, carry on		
		}
		
		return info;
	}
	
	//attempt first step
	this.step( this.computeNextStep() );
	
		
}
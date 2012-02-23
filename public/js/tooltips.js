function tooltip( playerID )
{
	this.playerID = playerID;
	this.ID = "tooltip_" + this.playerID.toString();
	
	var playerN = getItemNById( playerID );
		
	//append html
	$("#viewport").append("<div id=\"" + this.ID + "\" class=\"tooltip\">" + items[playerN].name + "<br />score: " + items[playerN].score + "</div>");
	
	//PUBLIC
	//----------------------------------------------------------------------
	
	this.position = function( xpos, ypos )
	{
		$( "#" + this.ID ).css( "top", ypos );
		$( "#" + this.ID ).css( "left", xpos );
	}
	
	this.updateScore = function( score )
	{
		var playerN = getItemNById( this.playerID );
		$("#" + this.ID).html( items[playerN].name + "<br />score: " + score );
	}
}

function tooltips() 
{
	var _tooltips = [];
	
	//PUBLIC
	//----------------------------------------------------------------------
	
	this.get = function( playerID )
	{
		var myTooltip = this.getByPlayerID(playerID).ref;
		return myTooltip;
	}
	
	this.add = function( playerID )
	{
		var t = new tooltip( playerID );
		_tooltips.push({ ref:t, playerID:playerID } )
		return t;
	}
	
	this.remove = function( playerID )
	{
		//get correct tooltip from the array
		var myTooltip = this.getByPlayerID(playerID);
		
		//remove div
		$("#" + myTooltip.ref.ID).remove();
		
		//garbage collection
		_tooltips.ref = {};
		
		//remove tooltip entry from the array
		_tooltips.splice( myTooltip.n, 1 );
		
	}
	
	this.getByPlayerID = function( playerID )
	{
		var myTooltip   = {};
		myTooltip.found = false;
		myTooltip.n     = -1;
		for ( var i = 0; i < _tooltips.length; i++ )
		{
			if ( playerID == _tooltips[i].playerID )
			{
				myTooltip.ref        = _tooltips[i].ref;
				myTooltip.playerID   = _tooltips[i].playerID;
				myTooltip.found      = true;
				myTooltip.n          = i;
				break;
			}
		}
		return myTooltip;
	}		
	
	
	//PUBLIC
	//----------------------------------------------------------------------
	
	//return an available random number
	this.update = function()
	{
		console.log("updating...");
	}
	/*
	//PRIVATE
	//----------------------------------------------------------------------
	
	function something()
	{
	}	
	*/
}


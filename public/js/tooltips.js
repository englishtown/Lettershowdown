function tooltip( playerID )
{
	this.playerID = playerID;
	this.ID = "tooltip_" + this.playerID.toString();
	
	var playerN = getItemNById( playerID );
		
	//append html
	$("#viewport").append("<div id=\"" + this.ID + "\" class=\"tooltip\">" + items[playerN].name + "</div>");
	
	//PUBLIC
	//----------------------------------------------------------------------
	
	this.position = function( xpos, ypos )
	{
		$( "#" + this.ID ).css( "top", ypos );
		$( "#" + this.ID ).css( "left", xpos );
	}
}

function tooltips() 
{
	var _tooltips = [];
	
	//PUBLIC
	//----------------------------------------------------------------------
	
	this.add = function( playerID )
	{
		var t = new tooltip( playerID );
		_tooltips.push({ ref:t, playerID:playerID } )
		return t;
	}
	
	this.getByPlayerID = function( playerID )
	{
		var myTooltip   = {};
		myTooltip.found = false;
		for ( var i = 0; i < _tooltips.length; i++ )
		{
			if ( playerID == _tooltips[i].playerID )
			{
				myTooltip.ref        = _tooltips[i].ref;
				myTooltip.playerID   = _tooltips[i].playerID;
				myTooltip.found      = true;
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


//randomBox.js
//2011, Lorenzo Buosi, www.chrometaphore.com

function randomBox ( nTotal ) 
{
    //register used numbers here
	this.slots = [];
	
	//populate array
	for ( var i = 0; i < nTotal; i++ ) 
	{
		this.slots.push( { taken:false } );
	}
	
	//PUBLIC
	//----------------------------------------------------------------------
	
	//return an available random number
	this.pickRandom = function()
	{
		var rn = -1;
		
		//search for a random position into the array
		var myRn = Math.round ( Math.random() * ( this.slots.length - 1 ) );
		
		if ( ! this.slots[myRn].taken )
		{
			//pick the random number
			rn                    = myRn;
			this.slots[rn].taken = true;
		}
		else
		{
			//pick first available number.
			rn = this.pickAvailable( myRn );
			if ( rn != -1 )
			{
				this.slots[rn].taken = true;
			}
			else
			{
				alert( "randomBox.js: all numbers have been already taken!");
			}
		}
		
		return rn;
	}
	
	//PRIVATE
	//----------------------------------------------------------------------
	
	this.pickAvailable = function ( wrongRn )
	{
		var myNewRn = -1;
		var found   = false;
		
		//scanning slots to the end of the array for an available number
		for ( var i = wrongRn; i < this.slots.length; i++ )
		{
			if ( ! this.slots[i].taken )
			{
				myNewRn = i;
				found   = true;
				break;
			}
		}
		
		//scanning slots from the beginning of the array for an available number
		if ( ! found )
		{
			for ( var i = 0; i < wrongRn; i++ )
			{
				if ( ! this.slots[i].taken )
				{
					myNewRn = i;
					break;
				}
			}
		}
		

		return myNewRn;
	}
}


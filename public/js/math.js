function getP1P2degrees( p1, p2, mode )
{
	var degs;
	var relx  = p2[0] - p1[0];
	var rely  = p2[1] - p1[1];
	var theta = Math.atan2(-rely, relx);
	
	switch( mode )
	{
		case "180":
			//...
		break;
		
		case "360":
			if (theta < 0)
			{
				theta += 2 * Math.PI;
			}
		break;
	}
	
	degs = theta * ( 180 / Math.PI );
	
	return degs;
}
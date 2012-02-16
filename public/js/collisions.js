function pointInPoly(polyCords, pointX, pointY)
{
	var i, j, c = false;
	
	for (i = 0, j = polyCords.length - 1; i < polyCords.length; j = i++)
	{
		
		if (((polyCords[i][1] > pointY) != (polyCords[j][1] > pointY))
		&& (pointX < (polyCords[j][0] - polyCords[i][0]) *
		(pointY - polyCords[i][1]) / (polyCords[j][1] - polyCords[i][1]) + polyCords[i][0]))
		{
			c = !c;
		}
		
	}
	
	return c;
}
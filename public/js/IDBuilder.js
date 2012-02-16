function IDBuilder()
{
	this.date;
	
	this.create = function create()
	{
		date = new Date();
		var uID      = "";
		var yearN    = date.getUTCFullYear();
		var monthN   = date.getUTCMonth() + 1;
		var dayN     = date.getUTCDate();
		
		var year     = yearN.toString();
		var month    = "";
		var day      = "";
		
		if (monthN < 10) 
		{
			month = "0" + monthN.toString();
			
		}
		else 
		{
			month = monthN.toString();
		}
		
		if (dayN < 10) 
		{
			day = "0" + dayN.toString();
			
		}
		else 
		{
			day = dayN.toString();
		}
		
		var hour    = date.getUTCHours().toString();
		var min     = date.getUTCMinutes().toString();
		var sec     = date.getUTCSeconds().toString();
		var mil     = date.getUTCMilliseconds().toString();
		
		//add random value
		var r       = Math.round(Math.random() * 10000);
		uID = year + month + day + hour + min + sec + mil + r.toString();
		
		return uID;
		
	} 
	
	/*
	public function decryption(uID:String):String 
	{
		var year:String  = uID.slice(0,4);
		var month:String = uID.slice(4,6);
		var day:String   = uID.slice(6,8);
		return day +"/"+month+"/"+year;
	}
	*/
}

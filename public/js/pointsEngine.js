function pointsEngine()
{
	this.assignPoints = function( gameEvent, params )
	{
		var points = 0;
		
		switch( gameEvent )
		{
			case "wordIsCorrect":
				
				//assign points into this client
				points      = params.word.length * 10;
				var myUserN = getItemNById(ME.sid);
				
				ME.score             += points;
				items[myUserN].score += points;
				
				//update this client tooltip
				var myTooltip = gameTooltips.get( ME.sid );
				myTooltip.updateScore( ME.score );
				
				if ( MODE == "mp" )
				{
					//send points to the server
					socket_interaction( "client_points_update", { id:ME.sid, score:ME.score } );
				}
				
				//notification
				$.jGrowl( "Correct word! <br />+" + points + " points" );
				
			break;
			
			case "wordChain":
				
				//assign points into this client
				points      = params.word.length * 10;
				var myUserN = getItemNById(ME.sid);
				
				ME.score             += points;
				items[myUserN].score += points;
				
				//update this client tooltip
				var myTooltip = gameTooltips.get( ME.sid );
				myTooltip.updateScore( ME.score );
				
				if ( MODE == "mp" )
				{
					//send points to the server
					socket_interaction( "client_points_update", { id:ME.sid, score:ME.score } );
				}
				
				//notification
				$.jGrowl( "You built a WordChain! <br />" + params.word.length + " letters, +" + points + " points" );
				
			break;
			
			case "bullet_hit_block":
				
				//assign points into this client
				points      = 20;
				var myUserN = getItemNById(ME.sid);
				
				ME.score             += points;
				items[myUserN].score += points;
				
				//update this client tooltip
				var myTooltip = gameTooltips.get( ME.sid );
				myTooltip.updateScore( ME.score );
				
				if ( MODE == "mp" )
				{
					//send points to the server
					socket_interaction( "client_points_update", { id:ME.sid, score:ME.score } );
				}
				
				//notification
				$.jGrowl( "Barricade destroyed! <br />+" + points + " points" );
				
			break;
			
			case "client_hit_player":
				
				//assign points into this client
				points      = 20;
				var myUserN = getItemNById(ME.sid);
				
				ME.score             += points;
				items[myUserN].score += points;
				
				//update this client tooltip
				var myTooltip = gameTooltips.get( ME.sid );
				myTooltip.updateScore( ME.score );
				
				if ( MODE == "mp" )
				{
					//send points to the server
					socket_interaction( "client_points_update", { id:ME.sid, score:ME.score } );
				}
				
				//notification
				var playerN = getItemNById(params.dmgTargetId);
				$.jGrowl( "You catched " + items[playerN].name + "! <br />+" + points + " points" );
				
			break;
			
			case "client_got_hit":
				
				//assign points into this client
				points      = 20;
				var myUserN = getItemNById(ME.sid);
				
				ME.score             -= points;
				items[myUserN].score -= points;
				
				//update this client tooltip
				var myTooltip = gameTooltips.get( ME.sid );
				myTooltip.updateScore( ME.score );
				
				if ( MODE == "mp" )
				{
					//send points to the server
					socket_interaction( "client_points_update", { id:ME.sid, score:ME.score } );
				}
				
				//notification
				var playerN = getItemNById(params.bulletOwnerID);
				$.jGrowl( "You got hit by " + items[playerN].name + "! <br />-" + points + " points" );
				
			break;
		}
	}
}
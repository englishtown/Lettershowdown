var socket;
var mySID;

function socket_connect() 
{
	//local test
	socket = io.connect('http://localhost');
	
	//local ws test (working)
	//socket = io.connect( 'http://localhost', {port:14584, rememberTransport: false} );
	
	//nodester (working)
	//socket = io.connect( null, {port:80, rememberTransport: false} );
	
	//heroku (working)
	//socket = io.connect( null, {port:80} );
	
	//nodester ws test. (working)
	//socket = io.connect( 'http://lettershowdown.nodester.com/', {port:80, rememberTransport: false} );
	
	
	//handle socket message event
	socket.on( 'message', function ( data ) 
	{
		console.log( "socket message: " + data.sEvent );
		
		//triggered on client connection
		if ( data.sEvent == "connection" )
		{
			mySID = data.mySID;
			console.log( "Socket connected. My sID: " + mySID );
			$('#eventDispatcher').trigger( 'socket_connection', data );
		}
		
		//triggered on other user connection
		else if ( data.sEvent == "user_connect" )
		{
			console.log( "New user connected. User sID: " + data.sID );
			$('#eventDispatcher').trigger( 'socket_user_connect', data );
		}
		
		//triggered on other user spawn
		else if ( data.sEvent == "user_spawn" )
		{
			$('#eventDispatcher').trigger( 'socket_user_spawn', data );
		}
		
		//triggered on other user game viewport interaction
		else if ( data.sEvent == "user_avatar_interaction" )
		{
			$('#eventDispatcher').trigger( 'socket_user_avatar_interaction', data );
		}
		
		//triggered on other user game viewport interaction
		else if ( data.sEvent == "user_server_action" )
		{
			$('#eventDispatcher').trigger( 'socket_user_server_action', data );
		}
		
		//triggered on other user disconnect
		else if ( data.sEvent == "user_disconnect" )
		{
			$('#eventDispatcher').trigger( 'socket_user_disconnect', data );
		}
	});
}

function socket_client_spawn( data ) 
{
	data.sEvent = "client_spawn";
	socket.emit( 'message', data );
}

function socket_client_avatar_interaction( data ) 
{
	data.sEvent = "client_avatar_interaction";
	socket.emit( 'message', data );
}

function socket_client_server_action( data ) 
{
	data.sEvent = "client_server_action";
	socket.emit( 'message', data );
}







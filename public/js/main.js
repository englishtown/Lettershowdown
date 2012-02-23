//sp - mp
var MODE = "mp";

//socket will update this value
var clientID    = "client";

var clientColor = "#00c0ff";

//jquery svg
var svg;

//temp data storage
var temp = {};

//viewport width and height
var VIEWPORT_W = 1020;
var VIEWPORT_H = 440;

//tile width and height 
var TILE_W = 20;
var TILE_H = 20;

var TILES_X = Math.floor( VIEWPORT_W / TILE_W );
var TILES_Y = Math.floor( VIEWPORT_H / TILE_H );

//blocks width and height
var BLOCK_W = 40;
var BLOCK_H = 40;

//players width and height
var PLAYER_W = 80;
var PLAYER_H = 80;

//distance in pixels before moving your client
var DISTANCE_2_MOVE_X = 20;
var DISTANCE_2_MOVE_Y = 20;

//create mouseDown object.
var mouseDown      = {};

//flag (client moving / not moving)
var movingClient = false;

//gfx ref here
var dragLine = {};

//word chain selector blocks array
var chainSelector = [];

//me --> player()
var ME;

//quick reference to my svg avatar
var avatar;

//tooltips
var gameTooltips = new tooltips();

//points engine
var gamePoints = new pointsEngine();

//dictionary (call Wordreference API to check words)
var myDictionary = new dictionary();

//word chains
var chains = new wordChains();


function clearDragLine()
{
	if ( dragLine != undefined && dragLine != null )
	{
		svg.change( dragLine, { x1: 0, 
			                    y1: 0,
			                    x2: 0,
			                    y2: 0 } );
		
	} 
}

function gameOver()
{
	if ( MODE == "mp" )
	{
		socket_disconnect();
	}
	
	window.location = "gameover.html";
}

var rIDBuilder = new IDBuilder();

$(function() 
{
	//listeners
	$('#eventDispatcher').bind('quizOver', function() 
	{
		gameOver();
	});
	
	$('#eventDispatcher').bind('questionTimeUp', function() 
	{
		//set next word
		setDockQuestion();
	});
	
	$('#eventDispatcher').bind('dictionary_api_ondata', function( event, params ) 
	{
		console.log( params.word + ": " + params.isWord );
		
		if ( params.isWord )
		{
			//add and render chain
			chains.add( temp.wordChain, "" );
			
			//assign points
			gamePoints.assignPoints( 'wordChain', { word:params.word } );
		}
		else
		{
			console.log( params.word + " is not a word." );
		}
	});
	
	$('#eventDispatcher').bind('wordIsCorrect', function() 
	{	
		//push ammo into the upper dock.
		pushAmmo( lib[currentLibID].label.toUpperCase() );
		
		//assign points
		gamePoints.assignPoints( 'wordIsCorrect', { word:lib[currentLibID].label } );
		
		//clear dock
		clearDockWord();
	});
	
	//init and start letters dock
	function startDock()
	{
		console.log("init and start dock.");

		//init random box with all the words contained into the XML file.
		libRandomBox = new randomBox( lib.length );
		
		//set initial word
		setDockQuestion();
		
		//init dragSort module
		$("#letterDock").dragsort( { dragSelector: "li", 
									 dragBetween: false, 
									 dragEnd: checkDockWord, 
									 scrollSpeed:0,
									 placeHolderTemplate: "<li style='border:1px dashed #000000'></li>" } );
									 
		//init quiz game
		startQuiz();
	}

	//multiplayer start
	//---------------------------------
	function mpStart()
	{
		//init ME object
		ME = new player( temp.name, temp.mySid, temp.myColor );
		
		//start dock
		startDock();
		
		$.jGrowl("Welcome online, " + temp.name + " !" );
	}
	//register event listener. Once we got our client connected
	//we will call mpStart() function
	$('#eventDispatcher').bind('socket_connection', function( event, params ) 
	{
		temp.myColor = params.color;
		temp.mySid   = params.mySID;
		
		mpStart();
	});
			
	//singleplayer start
	//---------------------------------
	function spStart()
	{
		ME = new player( temp.name, clientID, clientColor );
		
		//local single player testing here
		var client = buildClient( clientID, 5, 5, ME.color, ME.name, ME.score );
		
		//start dock
		startDock();
	}		
	
	//start function. Everything kicks off here.
	function start()
	{
		//first of all, lets get client nickname.
		temp.name = prompt("What's your name?", "");		

		//assign svg area
		svg = $('#viewport').svg('get');
		
		//define drag line
		dragLine = svg.line( null, 0, 0, 0, 0, {fill: 'none', stroke: '#AAAAAA', strokeWidth:1 } );
		
		//single player / multiplayer switch
		if ( MODE == "mp" )
		{
			//connect
			socket_connect();
		}
		else
		{
			//directly call the start function
			spStart();
		}
	}
	
	//init game viewport
	initGameViewPort();
	
	//init mouse interactions
	initMouseInteractions();
	
	//on svg load let's start
	$('#viewport').svg({onLoad: start});

});
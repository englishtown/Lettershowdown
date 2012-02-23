var letterDockID  = "#letterDock";
var ammoDockID    = "#ammoDock";
var pictureAreaID = "#lInfoBox";

//currently library item ID we are guessing (picture, word)
var currentLibID = -1;

//keeps reference of randomly generated numbers for our questions library
var libRandomBox;

//ammo counter to have unique ammo ids
var ammoIdCounter = 0;
function pushAmmo( word )
{	
	for ( var i = 0; i < word.length; i++ )
	{
		$(ammoDockID).append( buildAmmoBlock( word.substr( i, 1 ), ammoIdCounter ) );
		
		ammoIdCounter++;
	}
	
	$('.ammo').css("background-color", ME.color);
	
	$('.ammo').draggable( 
	{
    	cursor: 'move',
    	helper: cloneAmmoBlock,
    	start: onDragAmmo,
    	stop: onDropAmmo
  	});
}

//load ammo. return the ammo to be shoot (first available), and remove the ammo from the dock.
//returns empty string if no ammo available.
function loadAmmo()
{
	var myAmmoLetter = "";
	
	if ( $( ammoDockID ).children().length > 0 )
	{
		myAmmoLetter = $( ammoDockID + " li:nth-child(1)").text();
	}
	
	return myAmmoLetter;
}

function cloneAmmoBlock( event ) 
{
	//register id of the ammo we are dragging. 
	//in case of succesfull drop into the viewport 
	//we will delete this block from the ammo dock.
	temp.draggingAmmoId = $(event.target).parent().attr("id");
	
	var letter = $(event.target).html().toString();
	return "<li class=\"ddBlock\"><p>" + letter + "</p></li>";
}

function removeDockAmmoByN( ammoN )
{
	$( ammoDockID + " li:nth-child(" + ammoN + ")").remove();
}

function removeDockAmmoByID( AmmoID )
{
	$('#' + AmmoID).remove();
}

function buildAmmoBlock( letter, ammoID )
{
	var ammoBlock = "<li id=\"ammo_" + ammoID + "\" class=\"ammo\"><p>" + letter + "</p></li>";
	return ammoBlock;
}

function setDockQuestion()
{
	//clear dock from previous word (if exists)
	clearDockWord();
	
	//get a random word ID
	currentLibID = libRandomBox.pickRandom();
	
	//render picture
	renderPicture( lib[currentLibID].url );
	
	//build dock letters
	buildDockWord(lib[currentLibID].label);
	
	//letter sequence check						
	checkDockWord();
}

function buildDockWord( wordToBuild )
{
	var rbox = new randomBox( wordToBuild.length );
	
	var shuffledWord = "";
	
	for ( var i = 0; i < wordToBuild.length; i++ )
	{
		shuffledWord += wordToBuild.substr(rbox.pickRandom(),1).toUpperCase();
		
		//$(letterDockID).append( "<li><p class=\"l\">" + wordToBuild.substr(rbox.pickRandom(),1).toUpperCase() + "</p></li>" );
	}
	
	//rare, but possible.
	if ( shuffledWord == wordToBuild.toUpperCase() )
	{
		//put the first letter to the end.
		var shuffledWord = shuffledWord.substr( 1 );
		shuffledWord    += wordToBuild.substr( 0 , 1 ).toUpperCase();
	}
	
	//build <ul>
	for ( var j = 0; j < wordToBuild.length; j++ )
	{
		$(letterDockID).append( "<li><p class=\"l\">" + shuffledWord.substr( j, 1 ).toUpperCase() + "</p></li>" );
	}
	
}

function renderPicture( url )
{
	$( pictureAreaID ).html( "<img src=\"" + url + "\" />" );
}

function clearDockWord()
{
	$(letterDockID).html("");
}

/**
  * Extract the complete word
  */
function extractDockWord()
{
	var dockWord = "";
	
	$( letterDockID + ' li' ).each(function(index) 
	{
		dockWord += $(this).children('p').html().toLowerCase();
	});
	
	return dockWord;
}

function updateDockWordResult( wordResult )
{
	//alert( wordResult.length );
	
	$( letterDockID + ' li' ).each(function(index) 
	{
		//alert( $(this).parent().html() );
		
		if ( wordResult[index] )
		{
			
			$(this).addClass( "correct" );
			$(this).removeClass( "uncorrect" );
		}
		else
		{
			$(this).addClass( "uncorrect" );
			$(this).removeClass( "correct" );
		}
	});
}

/**
  * Evaluate dock word with the correct word and 
  * return an array with letter -> true / false
  */
function evalDockWord( dockWord, correctWord )
{
	var wordResult = [];
	
	for ( var i = 0; i < correctWord.length; i++ )
	{
		if ( dockWord.substr( i, 1 ).toLowerCase() == correctWord.substr( i, 1 ).toLowerCase() )
		{
			wordResult.push(true);
		}
		else
		{
			wordResult.push(false);
		}
	}
	return wordResult;
}

function checkDockWord()
{	
	var myWord = extractDockWord();
	
	var myWordResult = [];
	myWordResult     = evalDockWord( myWord, lib[currentLibID].label );
	
	updateDockWordResult( myWordResult );
	
	var correctCounter = 0;
	for ( var i = 0; i < myWordResult.length; i++ )
	{
		if ( myWordResult[i])
		{
			correctCounter++;
		}
	}
	if ( correctCounter == myWordResult.length )
	{
		$('#eventDispatcher').trigger('wordIsCorrect');
	}
}

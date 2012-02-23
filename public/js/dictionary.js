function dictionary() 
{
	//PUBLIC
	//----------------------------------------------------------------------
	this.check = function( word )
	{
		var isWord = false;
		
		console.log( "validating word: '" + word + "' through wordreference.com API..");
		
		$.ajax(
		{
			url: 'http://api.wordreference.com/0.8/47a05/json/enit/' + word,
			dataType: 'jsonp',
			success: function(data)
			{
				if ( data.term0 == null || data.term0 == undefined )
				{
					isWord = false;
				}
				else
				{
					isWord = true;
				}
				
				$('#eventDispatcher').trigger( 'dictionary_api_ondata', { word:word, isWord:isWord } );
			}
		});
		
	}
}


//aswer time limit (milliseconds)
var quizSingleAnswerTime = 30000;

//quiz total questions
var quizTotalQuestions = lib.length;

//quiz total answers count
var quizAnswerCount  = 0;

//quiz clock timer
var quizClockTimer;

//question seconds passed
var quizQuestionTimePassed = 0;

//start quiz
function startQuiz()
{
	quizClockTimer = setInterval( quizTimeCheck, 1000 );
	updatequizClock();
}

function quizTimeCheck()
{
	quizQuestionTimePassed += 1000;
	
	//go to the next anwer
	if ( quizQuestionTimePassed >= quizSingleAnswerTime )
	{
		if ( quizAnswerCount >= ( quizTotalQuestions - 1 ) )
		{
			clearInterval ( quizClockTimer );
			
			$('#eventDispatcher').trigger('GAME OVER! Refresh this page to play again.');
		}
		else
		{
			$('#eventDispatcher').trigger('questionTimeUp');
			
			quizQuestionTimePassed = 0;
		}
		
		//update answer counter
		quizAnswerCount++;
	}
	
	//or keep on going with the clock
	else
	{
	    //...	
	}
	
	updatequizClock();
}

function updatequizClock()
{
	var remainingAnswerTime = ( quizSingleAnswerTime - quizQuestionTimePassed ) / 1000;
	$("#clock").html( "0:" + ( remainingAnswerTime < 10 ? "0" : "" ) + remainingAnswerTime );
}
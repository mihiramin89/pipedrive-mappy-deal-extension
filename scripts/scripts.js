var timer = [];
var inlineframeTimer = [];
var messageFrameCounter = -1;
var replyClickEventSet = false;
var messageBoxClickEventSet = false;

$(document).ready(function() {   // Load the function after DOM ready
	pipeDriveHeader.init();
	pipeToolbar.initModalWindow();

	var composeMessageClassName = ".T-I.J-J5-Ji.T-I-KE.L3";
	//click on compose and inject icon.
	$(composeMessageClassName).click(function(e) {
	  timer.push(setInterval(inlineIcon, 500));
	  console.log("timer value: " + timer);
	});

	inlineframeTimer = setInterval(addListener,500);

});


function addListener(){
	var replyButton = document.getElementsByClassName("gH acX")[0];
	var messageBox = document.getElementsByClassName("amn")[0];

	replyClickEventSet = addListenerToElement(replyButton, replyClickEventSet);
	messageBoxClickEventSet = addListenerToElement(messageBox, messageBoxClickEventSet);
}

function addListenerToElement(elem, isClickEventSet){
	if(elem !== null & elem !== undefined){
		if(!isClickEventSet){
			elem.addEventListener('click',function(e){
				console.log(elem+ " clicked");
				timer.push(setInterval(inlineIcon,500));
			});
			return true;
		}
	}
	return false;
}

function inlineIcon() {
	//reply/reply all / forward to message check class: gB acO
	var newMessageCounter = 0;
	var threadMessageCounter = 0;
	messageFrameCounter = (document.getElementsByClassName(MessageFrameClassName).length) + (document.getElementsByClassName(InlineMessageFrameClassName).length);//zero based array, so last element is one smaller than the length

	if(messageFrameCounter > 0) {
		newMessageCounter = document.getElementsByClassName(MessageFrameClassName).length;
		for(i=0; i < newMessageCounter; i++){
			var newFrames = document.getElementsByClassName(MessageFrameClassName)[i];
			var toField = document.getElementsByClassName("aDj");

			if((newFrames.className).indexOf(" pipeFrame"+i) === -1){
				newFrames.className += " pipeFrame"+ i;
				pipeToolbar.init(i, toField[i]);
			}
		}

		threadMessageCounter = document.getElementsByClassName("gB acO").length;
		for(j=0; j< threadMessageCounter; j++){
			var newFrames = document.getElementsByClassName(InlineMessageFrameClassName)[j];
			var toField = document.getElementsByClassName("aDj");

			if((newFrames.className).indexOf(" inline-pipeFrame"+j) === -1){
				newFrames.className += " inline-pipeFrame"+ j;
				pipeToolbar.init(j, toField[j]);
			}
		}

		clearTimer(timer);	

	}else {
		console.log("still timing");
	}
}

function clearTimer(intervalTimer) {
	for(i=0; i< intervalTimer.length; i++){
		console.log("clearing timer: "+ intervalTimer[i]);
		clearInterval(intervalTimer[i]);	
		intervalTimer[i]=null;
	}

	for(j=0; j<= intervalTimer.length; j++){
		intervalTimer.pop();
	}
}
var PipedriveAPI_Token;
var timer;
var icon=chrome.extension.getURL("img/pipeEmail.png");
var close_icon=chrome.extension.getURL("img/close.png");

$(document).ready(function() {   // Load the function after DOM ready
	var t1='<tr><td><div id="pop"><a href=""><img id="mgt" src="'+icon+'"width="25" height="24"></a></div></td></tr>'    //now set the src to absolute path.
	$(".gb_ic.gb_vf.gb_R").prepend(t1);     //Insert extension icon into top-right corner of Gmail home.
	

	var keyHTML = '<div class="dropdown"></div><div class="modal"><img class="close" id="logo" src="'+close_icon+'"/><div class="modal-content" id="pop_inner"><h3>Enter Pipedrive API token</h3><hr /><input type="text" id="key" placeholder="key"/><br /><input type="button" id="keyInput" value="Save"/></div></div>'
	$("body").append(keyHTML);

	var listViewHTML = '<div class="inline-dropdown"><div class="inline-modal"><img class="inline-close" id="logo" src="'+close_icon+'"/><div class="inline-modal-content" id="pop_inner"><h4>Which deal is this email for?</h4><div class="searchField"><input type="text" name="search" placeholder="Search.."></div><hr /><div id="listForm"></div></div></div>';
	$("body").append(listViewHTML);

	$("#keyInput").click(function() {
		PipedriveAPI_Token = document.getElementById("key").value;

		chrome.runtime.sendMessage({fn:"setToken", token:PipedriveAPI_Token}, function(response){
			console.log(response.success);
			$(".modal").css("display", "none");
			$(".dropdown").css("display", "none");
		});
	});
	//display the popup for entering the API key.
	$("#pop").click(function(e) {
		e.preventDefault();//first stop default behaviour of anchor.
		$(".modal").css("display","block");
		$(".modal").css("left",e.clientX - (($(document).width()) - e.clientX));
		$(".modal").css("top",e.clientY + 20);

		$(".dropdown").css("display","block");
		$(".dropdown").css("left",e.clientX-5);
		$(".dropdown").css("top",e.clientY + 13);

	});

	//hide the popup
	$(".close").click(function() {
		closeModalWindow(null);
	});

	$(".inline-close").click(function() {
		closeModalWindow(true);
	});

	//click on compose and inject icon.
	$(".T-I.J-J5-Ji.T-I-KE.L3").click(function(e) {
	  e.preventDefault();//first stop default behaviour of anchor.
	  timer = setInterval(inlineIcon, 500);
	});
});

function closeModalWindow(inline) {
	if(inline === null)
	{
		$(".modal").css("display", "none");
		$(".dropdown").css("display","none");
	}else {
		$(".inline-modal").css("display", "none");
		$(".inline-dropdown").css("display","none");
	}
}

function getPipeDriveData(event){
	event.preventDefault();
	var em = grabEmail();
	chrome.runtime.sendMessage({fn:"grabData", email: em, token: PipedriveAPI_Token}, function(response) {
		console.log("grabbed response and parsing data to display HTML");

		generateDealList(response.data);
	});

	$(".inline-modal").css("display","block");
	$(".inline-modal").css("left",event.clientX - (($(document).width()) - event.clientX));
	$(".inline-modal").css("top",event.clientY + 20);

	$(".inline-dropdown").css("display","block");
	$(".inline-dropdown").css("left",event.clientX-5);
	$(".inline-dropdown").css("top",event.clientY + 13);
}

function grabEmail(){
	var toField = document.getElementsByName("to");
	console.log("elements found: " + toField.length);
	if(toField !== undefined && toField !== null) {
		//loop over all the ones list until you find one with of type input
		for(i=0; i< toField.length; i++) {
			if(toField[i].nodeName == "INPUT") {
				console.log("grab email: " + toField[i].value);
				return toField[i].value;
			}
		}
	}else {
		console.log("Could not find to field.");
	}


}

function inlineIcon() {
	var toField = document.getElementsByName("to");
	console.log("elements found: " + toField.length);
	if(toField !== undefined && toField !== null) {
		clearInterval(timer);
		console.log("timer cleared");

		var divTag = document.createElement("div");
		divTag.className = "inline-popup";
		var iconTag = '<a href=""><img id="mgt" src="'+icon+'"width="25" height="24"></a>';

		divTag.innerHTML = iconTag;

		var toField = document.getElementsByName("to");
		console.log("to elements found " + toField.length);
		var parentNode = toField[0].parentNode;
		parentNode.appendChild(divTag);
		document.getElementsByClassName('inline-popup')[0].addEventListener('click', function(e){getPipeDriveData(e);});
	}else {
		console.log("still timing");
	}
}

function populateBCCField(event) {
	console.log("place value in BCC of email");
	var email = event.target.value;//grabs the email address for the deal.
	var bccHTML = document.createElement("div");
	bccHTML.className = "vR";
	bccHTML.innerHTML = "<span class=\"vN bfK\" email="+email+ "><div class=\"vT\">"+ email + "</div><div class=\"vM\"></div></span><input name=\"bcc\" type=\"hidden\" value="+ email +"></div>";
	//var bccHTML =//"<div class=\"vR\">
	var fields = document.getElementsByName("bcc");
	console.log("elements found: " + fields.length);
	var parentNode = fields[0].parentNode;
	parentNode.appendChild(bccHTML);
}

function generateDealList(list) {
	var listDiv = document.getElementById("listForm");
	var html ="";
	for(i=0; i < list.length; i++) {
		html = html + "<input type=\"radio\" class=\"Items\" name=\"listItem\" value="+list[i].email+" >" + list[i].name +"</input><br />";
	}
	listDiv.innerHTML = html;
	for(j=0; j < document.getElementsByClassName('Items').length; j++) {
		document.getElementsByClassName('Items')[j].addEventListener('click', function(e){populateBCCField(e);});
	}
}
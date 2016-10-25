var PipedriveAPI_Token;
var timer;
var logo=chrome.extension.getURL("img/pipeEmail.png");
var close_icon=chrome.extension.getURL("img/close.png");
var deal_icon = chrome.extension.getURL("img/deal.png");
var org_icon = chrome.extension.getURL("img/organization.png");
var person_icon = chrome.extension.getURL("img/person.png");

$(document).ready(function() {   // Load the function after DOM ready
	var t1='<tr><td><div id="pop"><a href=""><img id="mgt" src="'+logo+'"width="25" height="24"></a></div></td></tr>'    //now set the src to absolute path.
	$(".gb_ic.gb_vf.gb_R").prepend(t1);     //Insert extension icon into top-right corner of Gmail home.
	

	var keyHTML = '<div class="dropdown"></div><div class="dropdown-internal"></div><div class="modal"><img class="close" id="logo" src="'+close_icon+'"/><div class="modal-content" id="pop_inner"><h3>Enter Pipedrive API token</h3><hr /><input type="text" id="key" placeholder="key"/><br /><input type="button" id="keyInput" value="Save"/></div></div>'
	$("body").append(keyHTML);

	var errorDiv = '<div class="error"><h5>Failed to grab data for following reasons:</h5><ol><li>invalid email address</li><li>no deals associated with email address</li>invalid user api token<li></li></ol></div>';
	var listViewHTML = '<div class="inline-modal"><img class="inline-close" id="logo" src="'+close_icon+'"/><div class="inline-modal-content" id="pop_inner"><h4>Which deal is this email for?</h4><div ></div><div id="result-section"><hr />'+ errorDiv + '<div id="listForm"></div></div></div></div><div class="invert-dropdown"></div><div class="invert-dropdown-internal"></div>';
	$("body").append(listViewHTML);

	$("#keyInput").click(function() {
		saveToken();
	});

	$("#key").keydown(function(event) {
		if(event.keyCode === 13) {
			saveToken();
		}
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

		$(".dropdown-internal").css("display","block");
		$(".dropdown-internal").css("left",e.clientX);
		$(".dropdown-internal").css("top",e.clientY + 14);
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
	  timer = setInterval(inlineIcon, 500);
	});
});

function searchPipeDrive(event) {
	if (event.keyCode === 13) {
            var term = event.target.value;
            if((term!== null || term !== undefined) && term.length > 0) {
            	console.log("search term: " + term);
            	chrome.runtime.sendMessage({fn:"searchData", searchTerm: term, token: PipedriveAPI_Token}, function(response) {
            		console.log("return from search term: " + response.data);
            		generateSearchList(response.data.people, response.data.organizations, response.data.deals);
            		
            	});
            }
         }
}

function saveToken() {
	PipedriveAPI_Token = document.getElementById("key").value;

	chrome.runtime.sendMessage({fn:"setToken", token:PipedriveAPI_Token}, function(response){
		console.log(response.success);
		$(".modal").css("display", "none");
		$(".dropdown").css("display", "none");
		$(".dropdown-internal").css("display","none");
	});
}

function closeModalWindow(inline) {
	if(inline === null)
	{
		$(".modal").css("display", "none");
		$(".dropdown").css("display","none");
		$(".dropdown-internal").css("display","none");
	}else {
		$(".inline-modal").css("display", "none");
		$(".invert-dropdown").css("display","none");
		$(".invert-dropdown-internal").css("display","none");
		$(".error").css("display","none");
	}
}

function getPipeDriveData(event, address){
	event.preventDefault();
	var em = address || grabEmail();

	//only ping server if we have an email. stop unecessary server call.
	if(em !== null && em !== undefined) {
		chrome.runtime.sendMessage({fn:"grabData", email: em, token: PipedriveAPI_Token}, function(response) {
			
			if(response.success === true) {
				console.log("grabbed response and parsing data to display HTML");
				generateDealList(response.data);
				$("#result-section").css("display","block");	
			} else {
				console.log("failed to grab data from pipedrive for 3 reasons. 1. invalid email address, 2. no data for user, 3. invalid api token");
				$(".error").css("display","block");
				$("#listForm").css("display","none");
			}
			
		});	
	}	
}

function grabEmail(){
	var toField = document.getElementsByName("to");
	console.log("elements found: " + toField.length);
	if(toField !== undefined && toField !== null) {
		//loop over all the ones list until you find one with of type input
		for(i=0; i< toField.length; i++) {
			if(toField[i].nodeName == "INPUT") {
				console.log("grab email: " + toField[i].value);
				//var searchField = document.getElementsByClassName("searchField");
				//searchField.value = toField[i];
				return toField[i].value;
			}
		}
	}else {
		console.log("Could not find to field.");
	}
}

function inlineIcon() {
	var toField = document.getElementsByClassName("aDj");
	console.log("elements found: " + toField.length);
	if(toField !== undefined && toField !== null) {
		clearInterval(timer);
		console.log("timer cleared");

		var divTag = document.createElement("div");
		divTag.className = "inline-popup";
		var iconTag = '<table style="width:100%;"><tbody><tr><td class="pipe-button"><a href=""><img id="mgt" src="'+logo+'"width="25" height="24"></a></td><td><input id="search-pipedrive" class="searchField" type="text" name="search" placeholder="Search Pipedrive.."></td></td></td></tr></tbody></table>';

		divTag.innerHTML = iconTag;

		console.log("to elements found " + toField.length);
		var firstchild = toField[0].childNodes[0];
		toField[0].insertBefore(divTag, toField[0].childNodes[0]);
		document.getElementsByClassName('pipe-button')[0].addEventListener('click', function(e) {
			getPipeDriveData(e, undefined);
			displayInlineModal(e, e.clientX, e.clientY);

		});
		document.getElementsByClassName('searchField')[0].addEventListener('keydown',function(e) {
			if(e.keyCode === 13) {
				var div = document.getElementById("search-pipedrive");
				var rect = div.getBoundingClientRect();
				var listForm = document.getElementById("listForm");
				listForm.innerHTML = "";
				searchPipeDrive(e);
				displayInlineModal(e,rect.left, rect.top);
			}
		});
	}else {
		console.log("still timing");
	}
}

function displayInlineModal(e, left, top){

	$(".inline-modal").css("display","block");
	$(".inline-modal").css("left",left);
	$(".inline-modal").css("top",top-230);
	$(".inline-modal").css("height",200);

	$(".invert-dropdown").css("display","block");
	$(".invert-dropdown").css("left",left);
	$(".invert-dropdown").css("top",top-28);

	$(".invert-dropdown-internal").css("display","block");
	$(".invert-dropdown-internal").css("left",left+5);
	$(".invert-dropdown-internal").css("top",top-29);
}

function populateBCCField(event) {
	console.log("place value in BCC of email");
	var email = event.target.value;//grabs the email address for the deal.
	var bccHTML = document.createElement("div");
	bccHTML.className = "vR";
	bccHTML.innerHTML = '<span class="vN bfK" email='+email+ '><div class="vT">'+ email + '</div><div class="vM pipe-close" email='+email+'></div></span><input name="bcc" type="hidden" value='+ email +'></div>';
	//var bccHTML =//"<div class=\"vR\">
	var fields = document.getElementsByName("bcc");
	console.log("elements found: " + fields.length);
	for(i=0; i< fields.length; i++) {
		if(fields[i].nodeName === "TEXTAREA"){
			var parentNode = fields[i].parentNode;
			parentNode.appendChild(bccHTML);
			bccHTML.childNodes[0].childNodes[1].addEventListener('click', function(e){
				//goto parentNode > parentNode and delete node
				var pNode = e.target.parentNode.parentNode;
				(pNode.parentNode).removeChild(pNode);
			})
		}
	}	
}

function generateDealList(list) {
	var listDiv = document.getElementById("listForm");
	var html ="";
	for(i=0; i < list.length; i++) {
		html = html + "<a><input type=\"radio\" class=\"Items\" name=\"listItem\" value="+list[i].email+" >" + list[i].name +"</input><br /></a>";
	}
	listDiv.innerHTML = html;
	for(j=0; j < document.getElementsByClassName('Items').length; j++) {
		document.getElementsByClassName('Items')[j].addEventListener('click', function(e){populateBCCField(e);});
	}
}

function generateSearchList(people, orgs, deals){
	var listDiv = document.getElementById("listForm");
	listDiv.innerHTML = "";
	var unorderedList = document.createElement("ul");
	generateSearchItem(people,"icon-person",person_icon,unorderedList);
	generateSearchItem(orgs,"icon-org",org_icon,unorderedList);
	generateSearchItem(deals,"icon-deal",deal_icon,unorderedList);
	
	listDiv.innerHTML = unorderedList.outerHTML;

	var items = document.getElementsByClassName("searchListItem")
	for(e=0; e < items.length; e++) {
		items[e].addEventListener('click', function(e) {
			e.target.value = e.target.getAttribute('email');
			populateBCCField(e);
			closeModalWindow(true);
		}, true);
	}
}

function generateSearchItem(items, iconClass, imageSrc,uList) {

	for(i=0; i < items.length; i++){
		var link = document.createElement("li");
		var linkHTML = '<a class="searchListItem" email='+ items[i].email +'><span email='+ items[i].email +' class="icon '+iconClass+'"><img  email='+ items[i].email +' id="mgt" src="'+imageSrc+'"width="25" height="24"></span><strong email='+ items[i].email +'>' + items[i].name + '</strong><br /><small email='+ items[i].email +'>' + items[i].email + '</small><br /></a>';
		link.innerHTML = linkHTML;
		uList.appendChild(link);
	}
}

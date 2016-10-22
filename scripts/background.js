var background = {

	token: "",
	init: function() {
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

			if(request.fn in background) {
				background[request.fn](request, sender, sendResponse);
				return true;
			}
		});
	},
	setToken: function(request, sender, sendResponse) {
		this.token = request.token;
		sendResponse({success: "token saved"});
	},
	grabData: function(req, sender, sendResponse) {
		var email = req.email;
		var token = req.token;
		var request = "https://api.pipedrive.com/v1/persons/find?term="+email+"&start=0&search_by_email=1&api_token="+token;
		var xhr = new XMLHttpRequest();
		var id;
		var result;

		xhr.open("GET", request, true);
		xhr.onreadystatechange = (function() {
			if(xhr.readyState == 4) {
				var resp = JSON.parse(xhr.responseText);
				grabDeals(resp.data[0].id,token, sendResponse);
			}
		});
		xhr.send();
	}
};

function grabDeals(id, token, sendResponse) {
	var deals;
	var d_email;
	var d_name;
	var request = "https://api.pipedrive.com/v1/persons/1/deals?start=0&status=open&api_token="+token;
	var xhr = new XMLHttpRequest();

	
	xhr.open("GET", request, true);
	xhr.onreadystatechange = (function() {
		if(xhr.readyState == 4) {
			var resp = JSON.parse(xhr.responseText);
			generateListJSON(resp.data, sendResponse); //resp.data;
		}
	});
	xhr.send();
}


function generateListJSON(data, sendResponse) {
	var resultJSON=[];
	
	//create a list for the details we need. "Deal Title | deal specific email"
	for(var i = 0; i < data.length; i++) {
		resultJSON[i] = {name: data[i].title, email: data[i].cc_email};
	}
	sendResponse({data: resultJSON, success:true});
}

background.init();
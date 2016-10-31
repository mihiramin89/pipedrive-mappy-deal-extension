var HttpRequest = {
	sendRequest:function(request, IsASynchronous, responseFunction){
		var xhr = new XMLHttpRequest();
		xhr.open("GET",request,IsASynchronous);
		xhr.onreadystatechange = (function(){
			if(xhr.readyState == 4) {
				var resp = JSON.parse(xhr.responseText);
				responseFunction(resp);
			}
		});
		xhr.send();
	}
};

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

		chrome.storage.local.set({'pipedriveToken': this.token});
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
	},
	searchData: function(req, sender, sendResponse) {
		var result = [];

		findPersonByName(req.searchTerm, req.token, sendResponse);
	}
};

function grabDeals(id, token, sendResponse) {
	var deals;
	var d_email;
	var d_name;
	var request = "https://api.pipedrive.com/v1/persons/"+id+"/deals?start=0&status=open&api_token="+token;
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
	if(resultJSON.length > 0 ) {
		sendResponse({data: resultJSON, success:true});	
	} else {
		sendResponse({success:false});
	}
}

function findPersonByName(searchTerm, token, sendResponse) {
	var request = "https://api.pipedrive.com/v1/persons/find?term="+searchTerm+"&start=0&api_token="+token;
	var results = {};
	var people = [];	
	HttpRequest.sendRequest(request,true,function(resp){
		if(resp.data !== null){
			for(i=0; i<resp.data.length; i++) {
				if(resp.data[i].email !== null){
					var item = {};
					item["name"] = resp.data[i].name;
					item["email"] = resp.data[i].email;
					people.push(item);
				}
			}
		}
		results["people"] = people;
		findDealsByName(searchTerm, token, sendResponse, results);
	});
}

//get details of an organization (cc_email): 
function findDealsByName(searchTerm, token, sendResponse, results) {
	var request = "https://api.pipedrive.com/v1/deals/find?term="+searchTerm+"&api_token="+token;
	var deals = [];	
	HttpRequest.sendRequest(request,true,function(resp){
		if(resp.data != null){
			for(i=0; i<resp.data.length; i++) {
				if(resp.data[i].email !== null) {
					var item = {};
					item["name"] = resp.data[i].title;
					item["email"] = resp.data[i].cc_email;
					deals.push(item);	
				}
			}
		}
		results["deals"]=deals;
		findOrganizationsByName(searchTerm, token, sendResponse, results);
	});
}

function findOrganizationsByName(searchTerm, token, sendResponse, results) {
	var request = "https://api.pipedrive.com/v1/organizations/find?term="+searchTerm+"&start=0&api_token="+token;
	var orgs_ids = [];
	HttpRequest.sendRequest(request,true,function(resp){
		if(resp.data != null){
			for(i=0; i<resp.data.length; i++) {
				if(resp.data[i].name !== null) {
					item = {};
					item["id"] = resp.data[i].id;
					item["name"] = resp.data[i].name;
					orgs_ids.push(item);
				}
			
			}
		}
		getOrgDetails(orgs_ids,token,sendResponse, results);
	});
}

function getOrgDetails(ids, token, sendResponse, results) {
	var xhr = [];
	var orgs = [];

	for(i=0;i< ids.length; i++) {
		var request = 'https://api.pipedrive.com/v1/organizations/'+ids[i].id+':(cc_email)?api_token='+token;

		HttpRequest.sendRequest(request,false,function(resp){
			orgs[i] = {name: ids[i].name, email: resp.data.cc_email };
		});
	}
	results["organizations"]=orgs;
	sendResponse({data: results, success:true});	
}

background.init();
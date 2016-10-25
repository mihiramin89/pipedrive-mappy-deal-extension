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
	},
	searchData: function(req, sender, sendResponse) {
		var result = [];

		findPersonByName(req.searchTerm, req.token, sendResponse);
		//data["organizations"] = findOrganizationByName(req.searchTerm, req.token);
		//data["deals"] = findDealsByName(req.searchTerm, req.token);
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
	alert("result" + resultJSON);
	if(resultJSON.length > 0 ) {
		sendResponse({data: resultJSON, success:true});	
	} else {
		sendResponse({success:false});
	}
}

function findPersonByName(searchTerm, token, sendResponse) {
	var request = "https://api.pipedrive.com/v1/persons/find?term="+searchTerm+"&start=0&api_token="+token;
	var xhr = new XMLHttpRequest();
	var results = {};
	var people = [];
	//alert(request);
	xhr.open("GET", request, true);
	xhr.onreadystatechange = (function() {
		if(xhr.readyState == 4) {
			var resp = JSON.parse(xhr.responseText);
			for(i=0; i<resp.data.length; i++) {
				if(resp.data[i].email !== null){
					var item = {};
					item["name"] = resp.data[i].name;
					item["email"] = resp.data[i].email;
					people.push(item);
				}
			}
			results["people"] = people;
			findDealsByName(searchTerm, token, sendResponse, results);
		}
	});
	xhr.send();

}

function findOrganizationsByName(searchTerm, token, sendResponse, results) {
	var request = "https://api.pipedrive.com/v1/organizations/find?term="+searchTerm+"&start=0&api_token="+token;
	var xhr = new XMLHttpRequest();
	var orgs_ids = [];
	xhr.open("GET", request, true);
	xhr.onreadystatechange = (function() {
		if(xhr.readyState == 4) {
			var resp = JSON.parse(xhr.responseText);
			for(i=0; i<resp.data.length; i++) {
				if(resp.data[i].name !== null) {
					item = {};
					item["id"] = resp.data[i].id;
					item["name"] = resp.data[i].name;
					orgs_ids.push(item);
				}
				
			}
			getOrgDetails(orgs_ids,token,sendResponse, results);
		}
	});
	xhr.send();
}

function getOrgDetails(ids, token, sendResponse, results) {
	
	var xhr = [];
	var orgs = [];

	for(i=0;i< ids.length; i++) {
		var request = 'https://api.pipedrive.com/v1/organizations/'+ids[i].id+':(cc_email)?api_token='+token;

		xhr[i] = new XMLHttpRequest();
		xhr[i].open("GET", request, true);
		xhr[i].onreadystatechange = (function() {
			if(xhr[i].readyState == 4){
				var resp = JSON.parse(xhr[i].responseText);
				orgs[i] = {name: ids[i].name, email: resp.data.cc_email };
			}
		});
		xhr[i].send();
	}
    results["organizations"]=orgs;
	sendResponse({data: results, success:true});
	
}
//get details of an organization (cc_email): 
function findDealsByName(searchTerm, token, sendResponse, results) {
	var request = "https://api.pipedrive.com/v1/deals/find?term="+searchTerm+"&api_token="+token;
	var xhr = new XMLHttpRequest();
	var deals = [];
	xhr.open("GET", request, true);
	xhr.onreadystatechange = (function() {
		if(xhr.readyState == 4) {
			var resp = JSON.parse(xhr.responseText);
			for(i=0; i<resp.data.length; i++) {
				if(resp.data[i].email !== null) {
					var item = {};
					item["name"] = resp.data[i].title;
					item["email"] = resp.data[i].cc_email;
					deals.push(item);	
				}
			}
			results["deals"]=deals;
			findOrganizationsByName(searchTerm, token, sendResponse, results);
		}
	});
	xhr.send();
}

background.init();
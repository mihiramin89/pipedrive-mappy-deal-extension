var pipeList = {
	html: '',
	init: function(){

		 var listViewHTML = '<hr /> <div id="listForm"></div>';

		this.html = listViewHTML;
	},
	toHTML: function(){
		return this.html;
	},
	searchPipeDrive: function(event){
		if (event.keyCode === 13) {
		    var term = event.target.value;
		    if((term!== null || term !== undefined) && term.length > 0) {
		    	console.log("search term: " + term);
		    	chrome.runtime.sendMessage({fn:"searchData", searchTerm: term, token: PipedriveAPI_Token}, function(response) {
		    		console.log("return from search term: " + response.data);
		    		var index = event.target.getAttribute("count");
		    		if(response.data.people.length === 0 && response.data.organizations.length === 0 && response.data.deals.length ===0){
						var title = document.getElementsByClassName("inline-title")[0];
						title.innerHTML = '<div class="error">Failed to grab data for the following reasons:</div>';
						var errorHTML = '<div class="error">'+
							    '<ol><li>invalid email address</li><li>no deals associated with email address</li><li>invalid user api token</li></ol>'+
							'</div>';
						document.getElementById("inline-result-section").innerHTML = errorHTML;
		    		}else {
		    			var title = document.getElementsByClassName("inline-title")[0];
						title.innerHTML = "Which deal is this email for?";
		    			generateSearchList(response.data.people, response.data.organizations, response.data.deals, index);
		    		}
		    		
		    	});
		    }
		}
	}
};

function generateSearchList(people, orgs, deals, index){
	var listDiv = document.getElementById("listForm");
	listDiv.innerHTML = "";
	var unorderedList = document.createElement("ul");
	generateSearchItem(people,"icon-person",person_icon,unorderedList);
	generateSearchItem(orgs,"icon-org",org_icon,unorderedList);
	generateSearchItem(deals,"icon-deal",deal_icon,unorderedList);

	listDiv.innerHTML = unorderedList.outerHTML;

	var items = document.getElementsByClassName("searchListItem");
	for(e=0; e < items.length; e++) {
		items[e].addEventListener('click', function(e) {
			e.target.value = e.target.getAttribute('email');
			populateBCCField(e, index);
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

function populateBCCField(event, index) {
	console.log("place value in BCC of email");
	var email = event.target.value;//grabs the email address for the deal.
	var bccHTML = document.createElement("div");
	bccHTML.className = "vR";
	bccHTML.innerHTML = '<span class="vN bfK" email='+email+ '><div class="vT">'+ email + '</div><div class="vM pipe-close" email='+email+'></div></span><input name="bcc" type="hidden" value='+ email +'></div>';


	var newFrames = document.getElementsByClassName("nH Hd b4g-narrow");
	var bccField = newFrames[index].getElementsByClassName("vO")[2];//get the bcc field count.

	var parentNode = bccField.parentNode;
	parentNode.appendChild(bccHTML);
	bccHTML.childNodes[0].childNodes[1].addEventListener('click', function(e){
		//goto parentNode > parentNode and delete node
		var pNode = e.target.parentNode.parentNode;
		(pNode.parentNode).removeChild(pNode);
	});	
}
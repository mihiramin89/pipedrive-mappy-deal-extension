var pipeToolbar = {
	id: '',
	initModalWindow: function()
	{
		pipeList.init();
		modalWindow.init("Which deal is this email for?","inline-", true);
	},
	init: function(id, fieldDiv){
		this.id = id;

		var divTag = document.createElement("div");
		divTag.className = "inline-popup";
		var iconTag = '<table style="width:100%;"><tbody><tr><td class="pipe-button"><a href=""><img id="mgt" src="'+logo+'"width="25" height="24"></a></td><td><input id="search-pipedrive" count='+this.id+' class="searchField" type="text" name="search" placeholder="Search Pipedrive.."></td></td></td></tr></tbody></table>';
		divTag.innerHTML = iconTag;

		var firstchild = fieldDiv.childNodes[0];
		fieldDiv.insertBefore(divTag, firstchild);

		document.getElementsByClassName('pipe-button')[this.id].addEventListener('click', function(e) {
			getPipeDriveData(e, undefined);
			displayInlineModal(e, e.clientX, e.clientY);

		});
		document.getElementsByClassName('searchField')[this.id].addEventListener('keydown',function(e) {
			if(e.keyCode === 13) {
				var rect = e.target.getBoundingClientRect();
				var listHTML = pipeList.toHTML();
				modalWindow.updateResults(listHTML);
				var success = pipeList.searchPipeDrive(e);
				modalWindow.show(e,rect.left, rect.top,0,-230,0,-29,true,200);
			}
		});
	}
};
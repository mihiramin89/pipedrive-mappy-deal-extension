var pipeToolbar = {
	id: '',
	modal: null,
	initModalWindow: function()
	{
		pipeList.init();
		this.modal = modalWindow.init("Which deal is this email for?","inline-", true);
	},
	init: function(id, fieldDiv){
		this.id = id;

		var divTag = document.createElement("div");
		divTag.className = "inline-popup";
		var iconTag = '<table style="width:100%;"><tbody><tr><td><img id="mgt" src="'+logo+'"width="25" height="24"></td><td><input id="search-pipedrive" count='+this.id+' class="searchField" type="text" name="search" placeholder="Search Pipedrive.."></td></td></td></tr></tbody></table>';
		divTag.innerHTML = iconTag;

		var firstchild = fieldDiv.childNodes[0];
		fieldDiv.insertBefore(divTag, firstchild);
		var self = this;

		document.getElementsByClassName('searchField')[this.id].addEventListener('keydown',function(e) {
			if(e.keyCode === 13) {
				var rect = e.target.getBoundingClientRect();
				var listHTML = pipeList.toHTML();
				self.modal.updateResults(listHTML);
				var success = pipeList.searchPipeDrive(e);
				self.modal.show("inline-",e,rect.left, rect.top,0,-230,0,-29,true,200);
			}
		});
	}
};
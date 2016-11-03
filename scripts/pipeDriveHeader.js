var pipeDriveHeader = {
	modal: null,
	init: function(){
		var headerIcons = document.getElementsByClassName("gb_tc");
		var headerIconToolbar = headerIcons[0].parentElement.parentElement;

		var toolbarIconDiv = document.createElement("div");
		toolbarIconDiv.className = "gb_ea gb_Ic gb_R";
		toolbarIconDiv.id = "pop";
		toolbarIconDiv.innerHTML = '<div class="gb_tc"><a href=""><img id="mgt" src="'+logo+'"width="25" height="24"></a></div>';
		headerIconToolbar.insertAdjacentElement('afterbegin',toolbarIconDiv);

		this.modal = modalWindow.init("Enter Pipedrive API token","", false);
		this.onclick(this.modal);
	},
	onclick: function(modalWindow){
		document.getElementById("pop").addEventListener('click',function(event){
			var xoffset = (($(document).width()) - event.clientX);
			var left = event.clientX;
			var yoffset = 20;
			var top = event.clientY;
			modalWindow.show("",event,left , top, xoffset, yoffset,-5, 13);
		});
	}
};
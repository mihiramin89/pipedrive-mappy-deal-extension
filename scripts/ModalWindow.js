var modalWindow = {
	title: '',
	html: '',
	prependclass: '',
	isInline: false,
	init: function(title, prependClass, isInline){
		this.title = title;
		this.isInline = isInline;
		this.prependclass = prependClass;
		this.html = '<div class="'+this.prependclass+'dropdown"></div><div class="'+this.prependclass+'dropdown-internal"></div>'+
				  '<div class="'+this.prependclass+'modal"><img class="'+ this.prependclass+'close" id="logo" src="'+close_icon+'"/>'+
					'<div class="'+this.prependclass+'modal-content" id="pop_inner"><h3 class="'+this.prependclass+'title" >'+this.title+'</h3>'+
						'<div class="result-section" id="'+this.prependclass+'result-section"><hr /><input type="text" id="key" placeholder="key"/><br /><input type="button" id="keyInput" value="Save"/></div>'+
					'</div>'+
				  '</div>';
		$('body').append(this.html);


		var self = this;

		document.getElementById("keyInput").addEventListener('click',function(e){self.save();});
		document.getElementById("key").addEventListener('keydown', function(e){
			if(e.keyCode === 13){
				self.save();
			}
		});
		document.getElementsByClassName(this.prependclass+"close")[0].addEventListener('click',function(e){self.hide();});

		chrome.storage.local.get("pipedriveToken", function(result){
			PipedriveAPI_Token = result.pipedriveToken;
			var tokenField= document.getElementById("key");
			tokenField.value = result.pipedriveToken;
		});

	},
	displayError: function(){
		var errorHTML = '<div class="error">'+
				 '<h5>Failed to grab data for following reasons:</h5>'+
				    '<ol><li>invalid email address</li><li>no deals associated with email address</li><li>invalid user api token<li></li></ol>'+
				'</div>';
		document.getElementById(this.prependclass+"result-section").innerHTML = errorHTML;
	},
	show: function(e, left, top, xoffset, yoffset,txoffset, tyoffset,isinvertedTriangle, height){
		e.preventDefault();
		var invertedvalue = 1;
		if(isinvertedTriangle){
			invertedvalue=-1;
		}
		$("."+this.prependclass+"modal").css("display","block");
		$("."+this.prependclass+"modal").css("left",left-xoffset);
		$("."+this.prependclass+"modal").css("top",top+yoffset);
		if(height !== null || height !== undefined){
			$("."+this.prependclass+"modal").css("height",height);	
		}
		
		$("."+this.prependclass+"dropdown").css("display","block");
		$("."+this.prependclass+"dropdown").css("left",left+txoffset);
		$("."+this.prependclass+"dropdown").css("top",top+tyoffset);

		$("."+this.prependclass+"dropdown-internal").css("display","block");
		$("."+this.prependclass+"dropdown-internal").css("left",left+txoffset+5);
		$("."+this.prependclass+"dropdown-internal").css("top",top+tyoffset+(1*invertedvalue));

	},
	updateResults: function(newHTML){
		var resultSection = document.getElementById(this.prependclass+"result-section");
		resultSection.innerHTML = "";
		resultSection.innerHTML = newHTML;
	},
	hide: function() {
		$("."+this.prependclass+"modal").css("display", "none");
		$("."+this.prependclass+"dropdown").css("display","none");
		$("."+this.prependclass+"dropdown-internal").css("display","none");
	},
	save: function() {
		PipedriveAPI_Token = document.getElementById("key").value;
		var self = this;
		chrome.runtime.sendMessage({fn:"setToken", token:PipedriveAPI_Token}, function(response){
			console.log(response.success);
			self.hide();
		});
	}
};
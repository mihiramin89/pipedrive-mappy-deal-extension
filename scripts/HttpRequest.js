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
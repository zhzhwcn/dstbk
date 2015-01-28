chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch(request.method){
    	case 'getSettings':
    		var settings = new Object();
    		for(var a in localStorage){
    			temp = localStorage.getItem(a);
    			if(temp.length > 1 && temp[0] === '{' && temp[temp.length - 1] === '}'){
					settings[a] = JSON.parse(temp);
				} else if(temp === 'false') {
					settings[a] = false;
				} else if(temp === 'true'){
					settings[a] = true;
				} else {
					settings[a] = temp;
				}
    		}
    		sendResponse(settings);
    		break;
    	case 'setSettings':
    		for(var a in request.data){
    			value = request.data[a];
    			if(typeof value === 'object'){
					value = JSON.stringify(value);
				}
    			localStorage.setItem(a, value);
    		}
    		sendResponse({});
    		break;
    	default:
    		sendResponse({});
    }
});
function initGlobal(){
    debug('Initing Globals');
    window.dstbk = new Object();
    for(var a in localStorage) {
        var temp = localStorage.getItem(a);
        if(temp.length > 1 && temp[0] === '{' && temp[temp.length - 1] === '}'){
            window.dstbk[a] = JSON.parse(temp);
        } else if(temp === 'true') {
            window.dstbk[a] = true;
        } else if (temp === 'false'){
            window.dstbk[a] = false;
        } else {
            window.dstbk[a] = temp;
        }
    }
    getQuery();
    debug('Getting Ext Settings')
    chrome.runtime.sendMessage({method: "getSettings"}, function(response) {
        for(var a in response){
            addToGlobal(a, response[a]);
        }
        debug(response);
        if(window.dstbk.cache === undefined){
            var cache = new Object();
            addToGlobal('cache', cache);
        }
        if(window.dstbk.process === undefined){
            addToGlobal('process', '');
        }
        if(window.dstbk.finished === undefined){
            addToGlobal('finished', '');
        }
        if(window.dstbk.login === undefined){
            window.dstbk.login = false;
        }
        debug('Done Init Globals');
        debug(window.dstbk);
        if(isItemURL(window.location.href)){
            MSG.onMsg('GlobalsInitDone',initButton);
        }
        MSG.broadCast('GlobalsInitDone');
        //initButton();
        if(window.dstbk.process !== undefined && window.dstbk.process !== ''){
            process();
        }
    });
    
}

function initButton(){
    if(!isItemURL(window.location.href)){
        return ;
    }
    var btn = document.createElement('button'),
        span = document.createElement('span'),
        div = document.createElement('div'),
        cached = getCached();
    btn.innerHTML = '开启淘宝客佣金';
    btn.addEventListener('click',function(){process();});
    if(cached !== false){
        span.innerHTML = '可能的佣金为: ' + cached;
    }
    if(window.dstbk.finished === 'finished'){
        span.innerHTML = '已开启的佣金为: ' + window.dstbk.result;
        btn.style.display = 'none';
    }
    addToGlobal('finished', '');
    addToGlobal('process', '');
    div.appendChild(btn);
    div.appendChild(span);
    document.getElementById('J_isku').appendChild(div);
    MSG.broadCast('ButtonInitDone');
}

function process(){
    if(window.dstbk.finished === 'finished'){
        return ;
    }

    addToGlobal('finished', '');
    addToGlobal('process', 'processing');

    if(isItemURL(window.location.href)){
        MSG.onMsgOnce('addToGlobalDone',loginToAlimamaByTaobao);
        addToGlobal('itemURL', window.location.href);
        //loginToAlimamaByTaobao();
    }
    if(isAlimamaHomePage(window.location.href)){
        MSG.onMsg('checkAlimamaLoginDone',function(){
            var url = window.location.href;
            if(window.dstbk.login){
                getURL();
            } else {
                getTaobaologinURL();
            }
        });
        checkAlimamaLogin();
    }
    if(isTaobaoLoginURL(window.location.href)){
        doLogin();
    }
}

function setDebug(debug){
    window.isDebug = debug;
}

function debug(msg){
    if(window.isDebug){
        if(typeof msg === 'string'){
            console.log(msg);
        } else {
            console.dir(msg);
        }
    }
}

function addToGlobal(name, value){
    if(typeof window.dstbk !== 'object'){
        window.dstbk = new Object();
    }
    window.dstbk[name] = value;
    if(typeof value === 'object'){
        value = JSON.stringify(value);
    }
    localStorage.setItem(name, value);
    debug('Setting To Ext Settings')
    chrome.runtime.sendMessage({'method': "setSettings",'data': window.dstbk}, function(response) {
        MSG.broadCast('addToGlobalDone');
    });
}

function getQuery(){
    var query = localStorage.getItem('query');
    var queryObject = new Object();
    if(query !== null){
        queryObject = JSON.parse(query);
    }
    var queryString = window.location.search.substr(1).split('&');
    for(var i in queryString){
        var temp = queryString[i].split('=');
        queryObject[temp[0]] = temp[1];
    }
    debug('Getting Query Params');
    debug(queryObject);
    addToGlobal('queryObject', queryObject);
}

function getSettings(){
    
}

function getCached(){
    if(window.dstbk.cache === undefined || window.dstbk.queryObject === undefined){
        return false;
    }
    if(window.dstbk.cache[window.dstbk.queryObject.id] === undefined){
        return false;
    }
    return window.dstbk.cache[window.dstbk.queryObject.id];
}

function isItemURL(url){
    return url.indexOf('item.taobao.com/item') !== -1
         || url.indexOf('detail.tmall.com/item') !== -1;
}

function isAlimamaHomePage(url){
    return url.indexOf('http://www.alimama.com/index.htm') !== -1 
         || url.indexOf('https://www.alimama.com/index.htm') !== -1;
}

function isTaobaoLoginURL(url){
    return url.indexOf('login.taobao.com/member/login.jhtml') !== -1;
}

function checkAlimamaLogin(){
    debug('checking login status');
    $.ajax({
        url:'http://www.alimama.com/getLogInfo.htm',
        jsonp:'callback',
        dataType: "jsonp",
        success: function(result){
            debug('get login result');
            if(result.success){
                addToGlobal('login', true);
                //getURL();
                MSG.broadCast('checkAlimamaLoginDone');
            } else {
                addToGlobal('login', false);
                //getTaobaologinURL();
                MSG.broadCast('checkAlimamaLoginDone');
            }
        }
    });
}

function loginToAlimamaByTaobao(){
    debug('Going to alimama home page');
    window.location.href = 'http://www.alimama.com/index.htm';
}

function getTaobaologinURL () {
    // document.getElementById('J_menu_login').click();
    window.location.href = 'https://login.taobao.com/member/login.jhtml?style=minisimple&from=alimama&redirectURL=http%3A%2F%2Flogin.taobao.com%2Fmember%2Ftaobaoke%2Flogin.htm%3Fis_login%3d1&full_redirect=true&disableQuickLogin=true';
}

function getURL () {
    debug('reday to get the url');
    $.get('http://pub.alimama.com/pubauc/searchAuctionList.json?q=' + encodeURIComponent(window.dstbk.itemURL),function(data){
        if(data.data.paginator.items == 0){
            gotURL(window.dstbk.itemURL,0,0);
            window.location.href = window.dstbk.itemURL;
        } else {

        }
        MSG.broadCast('getURLDone');
    },'json');
}

function doLogin(){
    if(!document.getElementById('TPL_username_1')){
        // redirecting ...
        return ;
    }
    
    document.getElementById('TPL_username_1').value = window.dstbk.username;
    document.getElementById('TPL_password_1').value = window.dstbk.password;
    // UA is FAKE
    $.post('https://login.taobao.com/member/request_nick_check.do?_input_charset=utf-8',{
        username:window.dstbk.username,
        ua:'092UW5TcyMNYQwiAiwZTXFIdUh1SHJOe0BuOG4=|Um5Ockt0QXhFeEN5THhDey0=|U2xMHDJ7G2AHYg8hAS8WKgQkClY3UT1aJF5wJnA=|VGhXd1llXGNWb1JvVG5bb1RsW2ZEcEhwT3RIdUtyS3RMckt+UAY=|VWldfS0RMQQ6ACAcJgYoRClvEnQsQSBEL0JpSXBQbElnMWc=|VmNDbUMV|V2NDbUMV|WGRYeCgGZhtmH2VScVI2UT5fORtmD2gCawwuRSJHZAFsCWMOdVYyVTpbPR99HWAFYVMpVCRALR14GX8eZAVgGX0QOlQvSC0ddBBxFH0YcVsgTSFAO1Y9QB5HATFRLFEoAT4GOHNaZV1iLgc4AD9zF3Affhg6Ry5JI0otD2QDZk9wSHc7XjNWPFEqAzwEO3cKYwRuB2ADbkd4QH8zVzBfPlh6GmcCKxQsEl4/RRF1En0celNsVGoGOhB+AmYCVi1ALE02WzBNfQB7B2pALE03XjRQPWcbehFyNFM8XTsLdg1xHDISPBJEEg==|WWdHFyoKNxcrEisWNg81DS0RKBEsDDgFOBgkHSQZOQw3ClwK|WmZYeCgGWjtdMVYoUn5LaVV7W3Upai4CPgQkGTkEJBgmHzFnMQ==|W2daelQEPQU7G0xiXmdYbVRpVG9UaVZsUSQZOwQ9BjIIMgw0CzYMMAgwDjcNWnRUaD4QRg==|XGVYZUV4WGdHe0J+XmBYYkJ6Tm5UbExwTHVVaUl1TnNTZ1oM'
    },function(data){
        if(data.needcode){
            alert('请手动输入验证码');
            return false;
        } else {
            //document.getElementById('J_StaticForm').submit();
        }
    },'json');
}

function gotURL(url,rate,money){
    addToGlobal('finished', 'finished');
    addToGlobal('process', '');
    addToGlobal('clickurl', url);
    addToGlobal('rate', rate);
    addToGlobal('money', money);
}
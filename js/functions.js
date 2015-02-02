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
    div.appendChild(btn);
    div.appendChild(span);
    document.getElementById('J_isku').appendChild(div);
}

function process(){
    if(window.dstbk.finished === 'finished'){
        return ;
    }
    
    addToGlobal('finished', '');
    addToGlobal('process', 'processing');
    var url = window.location.href;
    if(isItemURL(url)){
        addToGlobal('itemURL', url);
        if(!window.dstbk.login){
            loginToAlimamaByTaobao();
        } else {
            getURL();
        }
    }
    if(isAlimamaHomePage(url)){
        checkAlimamaLogin();
    }
    if(isTaobaoLoginURL(url)){
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
                getURL();
            } else {
                addToGlobal('login', false);
                getTaobaologinURL();
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
}

function doLogin(){
    if(!document.getElementById('TPL_username_1')){
        // redirecting ...
        return ;
    }
    document.getElementById('TPL_username_1').value = window.dstbk.username;
    document.getElementById('TPL_password_1').value = window.dstbk.password;
    if($('#J_CodeInput_i').is('visible')){
        alert('需要手动输入验证码');
        return false;
    }
    document.getElementById('J_StaticForm').submit();
}
Message = {}

Message.msgToCallback = new Array();
Message.msgToCallbackOnce = new Array();

Message.broadCast = function (msg){
    debug('broadcasting this msg : ' + msg);
    debug('msgToCallbackOnce:');
    debug(this.msgToCallbackOnce);
    debug('msgToCallback:');
    debug(this.msgToCallback);
    if(this.msgToCallbackOnce[msg] && this.msgToCallbackOnce[msg].length){
        for(var i = 0; i < this.msgToCallbackOnce[msg].length; i++){
            if(typeof this.msgToCallbackOnce[msg][i] === 'function'){
                this.msgToCallbackOnce[msg][i]();
                delete this.msgToCallbackOnce[msg][i];
            }
        }
    }
    if(this.msgToCallback[msg] && this.msgToCallback[msg].length){
        for(var i = 0; i < this.msgToCallback[msg].length; i++){
            if(typeof this.msgToCallback[msg][i] === 'function'){
                this.msgToCallback[msg][i]();
            }
        }
    }
}

Message.onMsg = function(msg,callback){
    if(this.msgToCallback[msg] === undefined){
        this.msgToCallback[msg] = new Array();
    }
    this.msgToCallback[msg].push(callback);
}

Message.onMsgOnce = function(msg, callback){
    if(this.msgToCallbackOnce[msg] === undefined){
        this.msgToCallbackOnce[msg] = new Array();
    }
    this.msgToCallbackOnce[msg].push(callback);
}

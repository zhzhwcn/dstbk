document.addEventListener('DOMContentLoaded', function(){
    var username = localStorage.getItem('username'),
    	password = localStorage.getItem('password'),
    	use_remote = localStorage.getItem('use_remote');
    var input_username = document.getElementById('username'),
    	input_password = document.getElementById('password'),
    	input_use_remote = document.getElementById('use_remote');
    if(username){
    	input_username.value = username;
    }
    if(password){
    	input_password.value = password;
    }
    if(parseInt(use_remote) === 1){
    	input_use_remote.checked = true;
    }
    document.getElementById('submit').addEventListener('click',function(){
    	var input_username = document.getElementById('username'),
	    	input_password = document.getElementById('password'),
	    	input_use_remote = document.getElementById('use_remote');
	    if(!input_username.value){
	    	alert('用户名是必填!');
	    	return false;
	    }
	    if(!input_password){
	    	alert('密码是必填!');
	    	return false;
	    }
	    localStorage.setItem('username',input_username.value);
	    localStorage.setItem('password',input_password.value);
	    localStorage.setItem('use_remote',input_use_remote.checked?1:0);
	    alert('保存成功');
    });
});

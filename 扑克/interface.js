var login = function(student_id, password, callback) {//登录接口
    xml = new XMLHttpRequest();//定义XMLHttpRequest对象
    var url = "http://172.17.173.97:8080/api/user/login";//把接口的url赋值
    xml.open('post', url, true);//使用open方法
    xml.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");//使用setRequestHeader方法
    xml.send('&student_id=' + student_id + '&password=' + password);//使用send方法发送参数
    xml.onreadystatechange = function () {//获取返回值
        var obj = JSON.parse(xml.response);
        callback(obj.data.token);
    };
};
var createGame =function(flag,callback) {//创建新的对局接口
    var xml = new XMLHttpRequest();
    var url = 'http://172.17.173.97:9000/api/game';
    xml.open("post", url);
    xml.setRequestHeader('Authorization', your_token);
    xml.send({ "private": flag });
    xml.onreadystatechange = function () {
        var obj = JSON.parse(xml.response);
        callback(obj.data.uuid);
    };
    
};
var enterGame = function() {//加入新的对局接口
    var xml = new XMLHttpRequest();
    var url = 'http://172.17.173.97:9000/api/game/'+ uuid;
    console.log(uuid);
    xml.open('post', url);
    xml.setRequestHeader('Authorization', your_token);
    xml.send(null);
    xml.onreadystatechange = function () {
    };
};
var execute = function(type, card, callback){//执行玩家操作接口
    var xml = new XMLHttpRequest();
    var url = 'http://172.17.173.97:9000/api/game/' + uuid;
    xml.open("put", url);
    xml.setRequestHeader('Authorization', your_token);
    if(type==0)
    xml.send('{"type": 0}');
    else
    xml.send('{"type": 1,"card": "' + card + '"}');
    xml.onreadystatechange = function () {
        var obj = JSON.parse(xml.response);
        callback(obj);
    };
}
var getLastOperation = function(callback){//获取上一步的操作
    var xml = new XMLHttpRequest();
    var url = 'http://172.17.173.97:9000/api/game/' + uuid + '/last';
    xml.open("get", url);
    xml.setRequestHeader('Authorization', your_token);
    xml.send(null);
    xml.onreadystatechange = function () {
        var obj = JSON.parse(xml.response);
        callback(obj);
    };
}
var getGame = function(callback){//获取某局信息
    var xml = new XMLHttpRequest();
    var url = 'http://172.17.173.97:9000/api/game/' + uuid;
    xml.open("get", url);
    xml.setRequestHeader('Authorization', your_token);
    xml.send(null);
    xml.onreadystatechange = function () {
        var obj = JSON.parse(xml.response);
        callback(obj);
    };
}
var getPlayingGame = function(page_size, page_num, callback) {//获取所有对局的信息
    var xml = new XMLHttpRequest();
    var url = 'http://172.17.173.97:9000/api/game/index?page_size=' + page_size + '&page_num=' + page_num;
    xml.open("get", url);
    xml.setRequestHeader('Authorization', your_token);
    xml.send(null);
    xml.onreadystatechange = function () {
        var obj = JSON.parse(xml.response);
        callback(obj);
    };
}

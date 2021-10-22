
//  系统信息
var your_token, //接入系统时的信息
uuid,   // 房间uid
information,    
playing_interval_id, //对局进行时的 定时器
return_msg, //上一步操作信息
flag = true,
execute_return;

function my_main(){
    var game_container = document.getElementsByClassName('game_container')[0], // 游戏界面
        poker = document.getElementsByClassName('poker')[0].cloneNode(true), //一张扑克牌 用于后面卡组产生
        position = {
            //  卡组 与 放牌区 的位置信息
            lay : [313,112],
            card_group : [613,112],
            user1 : [
                [72,421],
                [162,421],
                [252,421],
                [342,421]
            ],
            user2 : [
                [592,421],
                [682,421],
                [772,421],
                [862,421]
            ]
        },
        button = document.getElementsByClassName('button'),  //游戏中的全部按钮
        card_group, //卡组
        lay,   //放牌区
        play = false,  //游戏是否开始
        who= 0, // 用于标注改谁出牌 -1：user1出牌 1：user2出牌 0：都不能出牌
        user1,
        user2, //用户1 2 
        type, //游戏类型
        user1_container = document.getElementsByClassName('user1')[0], //用户1区域
        user2_container = document.getElementsByClassName('user2')[0],  //用户二区域
        tuoguan = document.getElementsByClassName('icon-tuoguan'); //托管按键数组
        


        poker.className = 'poker'; // 去除disapear
        var color = poker.getElementsByClassName('color_size')[0]; 

    
    
    function User(operations,my_who,name,is_robot){
        // operations:操作按键 my_who ：who为多少时 是我的回合 name:用户变量名 is_robot：这个用户是机器人吗
        this.cards = [[],[],[],[]]; //手卡
        this.color_number = [0,0,0,0]; // 花色 0：黑桃 1：红桃 ：2梅花 3：方块
        this.is_robot = is_robot||false;
        this.my_who = my_who;
        this.sum_number = 0;
        this.name = name;
        this.operations = [];
        // 操作键位接收
        for(var i =0 ;i<5;i++)
            this.operations[i] = operations[i];

        this.tips = [];
        this.head_zIndex = [0,0,0,0];
        this.tip_init = function(){
            // 获取他的 tip结点
            this.tips = document.getElementsByClassName(this.name)[0].getElementsByClassName('sum');
        }
        this.tip_update = function(){
            for(var i=0;i<4;i++){
                this.tips[i].innerText = this.color_number[i]+'';
            }
        }
        this.pop_card = function(color){
            // color 0-3
            if(this.color_number[color]==0){
                // 那种花色的牌没有了 就返回
                return false;
            }
            var card = this.cards[color].pop();
            this.color_number[color]--;
            this.sum_number --;

            // 移动设置
            var left = position.lay[0] - position.card_group[0];
            var right = position.lay[1] - position.card_group[1];
            card.style.transform = 'translate('+left+'px,'+right+'px)'; //移动

            // zIndex 设置
            if(lay.sum_number)
            card.style.zIndex = Math.max(parseInt(card.style.zIndex), parseInt(lay.cards[lay.sum_number-1].style.zIndex)+1) +'';
            lay.push_card(card);

            // tip设置
            this.tip_update();
            if(this.color_number[color]!=0)
            this.head_zIndex[color] = parseInt(this.cards[color][this.color_number[color]-1].style.zIndex); //更新zIndex
            else
            this.head_zIndex[color] = 0;

            return card;
        }
        this.push_card =function(card){
            var color = parseInt(card.getAttribute('index_color'));
            this.cards[color].push(card);
            this.color_number[color] ++;
            this.sum_number++;
            this.tip_update();
            this.head_zIndex[color] = parseInt(card.style.zIndex); //更新zIndex
        }
        this.user_robot_swap = function(){
            if(this.is_robot)
            this.is_robot = false;
            else
            this.is_robot = true;
            var i=0;
            this.name=='user1'||(i=1);
            if(this.is_robot)
            tuoguan[i].className += ' active';            
            else
            tuoguan[i].className = "iconfont icon-tuoguan";

            who_changed(); //用于消除bug  当自己的回合时 自己托管了 但机器没有操作user
        }
        this.tip_init();
        this.tip_update();
        
    }
    function Card_group(name){
        this.name = name;
        this.cards = []; // 牌堆
        this.color_number = [0,0,0,0]; //各花色几张牌
        this.sum_number = 0; //还有几张牌
        
        this.tip_init = function(){
            // 获取他的 tip结点
            this.tips = document.getElementsByClassName(this.name)[0].getElementsByClassName('sum');
        }
        this.tip_update = function(){
            for(var i=0;i<4;i++){
                this.tips[i].innerText = this.color_number[i]+'';
            }
        }
        
        this.init_cards = function(){ 
            // 兼容本地对局 与在线对局
            // 生成卡组
            this.color_number = [13,13,13,13];
            this.sum_number = 52;
            // 生成牌堆
            this.colors = "0123"; // 0123分别代表 黑桃 红桃 梅花 方块
            this.number = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
            this.color_str=["heitao","hongtao","meihua","fangkuai"];
            // colors 于 number 是 生成牌堆使用的
            
            
            var a = [];
            
            
            for(var i=0;i<52;i++){
                a[i] = i+'';
            }
            //  生成牌的乱序
            if(!this.accurate){
                a.sort(function(){
                    return Math.random() -0.5;
                })
            }
                
            
            var one_poker ;
            for(var j=0;j<4;j++){
                color.className = 'color_size';
                color.className += ' ' + this.color_str[j];
                for(var i=0;i<13;i++){
                    one_poker = poker.cloneNode(true);
                    one_poker.setAttribute('index_number',i+1+''); //给每张牌设置 数字提示
                    one_poker.setAttribute('index_color',this.colors[j]); // 花色提示
                    one_poker.getElementsByClassName('number')[0].innerText =  this.number[i]; //数字
                    if(!this.accurate)
                    one_poker.style.zIndex = a[j*13+i]; // 乱序排序 给每张牌设置 z-index 从卡组底端依次增加
                    else
                    one_poker.style.zIndex = 0; // 顺序排序 每张 z-index 都是0 等到 系统给我们要翻那张排时再给他设置zindex
                    this.cards[a[j*13+i]] = one_poker; // 插入牌组
                    game_container.appendChild(one_poker); // 插入dom结点树
                }
            }
            this.tip_update(); 
        }
        this.pop_card = function(){
            // 本地对局使用 取最顶部牌
            // 取牌 翻牌 加入lay 这个放置牌区中
            

            var head_poker = this.cards.pop();
            this.sum_number --;
            this.color_number[parseInt(head_poker.getAttribute('index_color'))]--;
            head_poker.className += ' rotate';
            
            
            // 设置他的zIndex 大于lay牌顶的牌
            if(lay.sum_number!=0)
            head_poker.style.zIndex = Math.max(parseInt(head_poker.style.zIndex),parseInt(lay.cards[lay.sum_number-1].style.zIndex)+1)+'';
            head_poker.style.transform = 'translate(-300px,0px)';
            lay.push_card(head_poker);
            
            // head_poker.style.transform = 'translate'+position.lay;
            
            this.tip_update();
        }
        this.pop_card_accurate = function(msg){
            // 在线对局使用 弹出 msg对应的卡牌
            var numbers = ['1','2','3','4','5','6','7','8','9','10','J','Q','K'];
            var colors = "SHCD";
            // msg 是卡牌信息 花色加数字 例如H10
            var color = msg[0];
            var card;
            var number = msg.slice(1);
            var i,j;
            for(i =0;i<4;i++){
                if(colors[i]==color){
                    break;
                }
            }
            for(j=0;j<13;j++){
                if(numbers[j]==number){
                    break;
                }
            }
            console.log(msg );
            console.log('i:'+i);
            console.log("j"+j)
            card = this.cards[i*13+j];
            // 卡组设置
            this.sum_number--;
            this.color_number[i]--;
            // 卡牌设置
            card.style.zIndex = 1;
            card.className += ' rotate';

            // 设置他的zIndex 大于lay牌顶的牌
            if(lay.sum_number!=0)
            card.style.zIndex = Math.max(parseInt(card.style.zIndex),parseInt(lay.cards[lay.sum_number-1].style.zIndex)+1)+'';
            card.style.transform = 'translate(-300px,0px)';
            lay.push_card(card);
            this.tip_update();

        }
        this.push_card = function(one_poker){
            // 兼容 本地对战 与在线对战

            // 插入牌
            this.cards.push(one_poker);
            this.sum_number ++;
            this.color_number[parseInt(one_poker.getAttribute('index_color'))] ++;

            // 判断 插入的牌是不是 和牌顶 一个花色
            if(this.sum_number>1&&one_poker.getAttribute('index_color') == this.cards[this.sum_number-2].getAttribute('index_color')){
                // 同花色 全部牌 飞入who 的卡组中
                
                
                setTimeout(function(){
                var ps;
                var target;
                if(who ==-1){
                    ps =position.user1;
                    target = user1;
                }else{
                    ps = position.user2;
                    target = user2;
                }
                    
                // 飞牌
                for(var i = lay.sum_number-1 ;i >=0  ;i--){
                    // 更改Zindex
                    var the_poker = lay.cards[i];
                    var color = parseInt(the_poker.getAttribute('index_color')); //此牌的花色

                    // 设置此牌的 zIndex 大于 要去的牌堆顶部Zindex
                    the_poker.style.zIndex = Math.max(parseInt(the_poker.style.zIndex),target.head_zIndex[color]+1)+'';
                    
                    the_poker.style
                    var left = ps[parseInt(the_poker.getAttribute('index_color'))][0]-position['card_group'][0];
                    var right = ps[parseInt(the_poker.getAttribute('index_color'))][1]-position['card_group'][1];
                    the_poker.style.transform = 'translate('+left+'px,'+right+'px)';
                    target.push_card(the_poker);
                }
                lay.sum_number = 0;
                lay.color_number=[0,0,0,0];
                lay.cards = [];
                lay.tip_update();
                who*=-1; //轮换人
                if(card_group.sum_number==0)
                    game_over();
                who_changed();
                },600);
                
            }
            else{
                this.tip_update();
                who*=-1; //轮换人
                if(card_group.sum_number==0)
                game_over();
                who_changed();
            }
            
        }
        this.tip_init();
        this.tip_update();
    }

    var robot_do = function(user){
        // 机器操作user 
        
        var customEvent = new CustomEvent('keydown',{key: ''});
        customEvent.robot = true;
        var color_number = [{},{},{},{}];
        var head_color = 4; //放置堆的顶端花色 首先设置成一个四花色所代表的的数字之外的数
        var opp; //对手
        var color_p = [0,0,0,0,0]; // 多设置一个 用于 兼容 放置区中无牌 
        if(user ==user2)
            opp = user1;
        else opp = user2;

        if(lay.sum_number)
            head_color = parseInt(lay.cards[lay.sum_number-1].getAttribute('index_color'));

        if(user.sum_number==0){
            //无牌就抓 
            customEvent.key = user.operations[4];
        }else{
            if(user.sum_number + lay.sum_number + card_group.sum_number*2 < opp.sum_number - card_group.sum_number){
                // 我直接一直翻牌就能赢的话 我就一直翻牌
                customEvent.key = user.operations[4];
            }else{
                // 看看卡组里还有几种花色
                for(var i=0;i<4;i++){
                    color_p = card_group.color_number[i]/card_group.sum_number;
                }
                // 如果我的牌 加上卡组里的牌 比对方少 且我有超过百分之50概率 不翻到堆顶的花色牌 我就翻牌
                if(user.sum_number+card_group.sum_number<opp.sum_number&&color_p[head_color]<0.5){
                    customEvent.key = user.operations[4];
                }else{
                        //有牌就打：打得是牌组中花色最多的且手牌有的且不是放置区的最顶端花色 否则就抓牌
                        for(var i=0;i<4;i++){
                            color_number[i].number = card_group.color_number[i];
                            color_number[i].color = i; 
                        }
            
                        color_number.sort(function(a,b){
                            return b.number-a.number;
                        });
            
                        for(var i=0;i<4;i++){
                            if(user.color_number[color_number[i].color]!=0&&color_number[i].color!=head_color){
                                customEvent.key = user.operations[color_number[i].color];
                                break;
                            }    
                        }
                        if(i==4){
                            // 没有找到合适的牌打出去 就抓牌
                            customEvent.key = user.operations[4];
                        }
                }
            
            }
        }

        
        document.dispatchEvent(customEvent);
    }
    var who_changed = function(){
        // 用于调佣人机操作 与系统操作user2 
        // 兼容 本地对战，在线对战
        if(who==-1){
            user2_container.className = 'user2';
            user1_container.className = 'user1 active';
        }else if(who ==1){
            user1_container.className = 'user1';
            user2_container.className = 'user2 active';
        }
        if(type==0||type==1){
            // 在线对战 人机操纵用户
            if(who == -1 && user1.is_robot){
                setTimeout(function(){
                    robot_do(user1);
                },600);
                
            }
            else if(who==1&&user2.is_robot){
                setTimeout(function(){
                    robot_do(user2);
                },700);
            }
        }else{
            // 在线对战 人机操纵用户1或人操纵用户1 系统操作用户2
            // 判断user1是不是人机 是就让人机操作
            setTimeout(function(){
                if(who==-1&&user1.is_robot){
                    // 人机操纵用户1
                    setTimeout(function(){
                        robot_do(user1);
                    },1800);
                }
                else{
                    if(who == 1){
                        // 检测系统里  user2的操作
                        var user2_interval = setInterval(function(){
                            // 系统操纵用户2
                            if(return_msg&&return_msg.data.your_turn&&return_msg.msg =="操作成功"){
                                clearInterval(user2_interval);
                                console.log("系统操纵user2");
                                var card_msg = return_msg.data.last_code.split(' ');
                                console.log("操作类型"+ card_msg);
                                if(card_msg[1]=='0'){
                                    // user2 翻卡组牌
                                    card_group.pop_card_accurate(card_msg[2]);
                                }
                                else{
                                    // user2 出牌
                                    var colors = "SHCD";
                                    for(var i =0;i<4;i++){
                                        if(colors[i]==card_msg[2][0]){
                                            user2.pop_card(i);
                                            break;
                                        }
                                    }
                                    
                                }
                            }
                        },200)
                    }   
                    
                }
            },500);
            
        }
        
    }
    var game_over = function(){
        // 游戏结束 跳出游戏结束的按钮
        console.log("结束");
        play = false;
        var end = document.getElementsByClassName('end')[0];
        end.className = "mengceng end";
        var text = '';
        if(user1.sum_number<user2.sum_number){
            text = 'Winner : 大司马(user1)';
        }
        else if(user1.sum_number>user2.sum_number){
            text = 'Winner : PDD(user2)';
        }
        else {
            text = '玩啥呢 小伙子';
        }
        end.children[0].innerText = text;
        
    }
    var clear_poker =function(){
        //  清除界面上所有的牌
        //  主要是为了 重开游戏设置的
        
        var pokers = document.getElementsByClassName('poker');
        
        for(var i=pokers.length-1 ;i>=1;i--){
            pokers[i].remove();
        }
    }
    var game_init = function(){

        // 设置游戏的模式 0：双人对战 1：人机对战 3：在线对战
        // 设置按钮事件
        var start = document.getElementsByClassName('start')[0];
        var end = document.getElementsByClassName('end')[0];

        // 双人玩家对战
        button[0].addEventListener('click',function(){
            type =0;
            start.className+= ' disappear';
            game_start_local(type);
        },false);

        // 人机对战 玩家1 是人 玩家二2机器
        button[1].addEventListener('click',function(){
            type =1;
            start.className+= ' disappear';
            game_start_local(type);
        },false);

        // 在线对战
        button[2].addEventListener('click',function(){
            // 当在线对战的时候 type 里面含两个值  第一个是模式2, 第二个是 在线对战还是人机对战
            type =[2];
            start.className+= ' disappear';
            var online = document.getElementsByClassName('online-type')[0];
            online.className = "mengceng online-type"; //显示 在线对战模式选择

            button[3].addEventListener('click',function(){
                // 在线玩家对战
                type.push(0);
                online.className += ' disappear';
                game_start_online(type);
            },false);

            button[4].addEventListener('click',function(){
                // 在线人机对战
                type.push(1);
                online.className += ' disappear';
                game_start_online(type);
            },false);

        },false);

        // 在线对战模式选择



        // 继续游戏 保存原来的模式
        button[5].addEventListener('click',function(){
            end.className += ' disappear';
            if(type==0||type==1)
            game_start_local(type);
            else
            game_start_online(type);
        },false);
        // 退出游戏
        button[6].addEventListener('click',function(){
                start.className = 'mengceng start';
                end.className += ' disappear';
        },false);

        // 切换 托管
        tuoguan[0].addEventListener('click',function(){
            user1.user_robot_swap();

        },false);
        tuoguan[1].addEventListener('click',function(){
            user2.user_robot_swap();
        },false);

        var group_color_tip = document.getElementsByClassName('group_color_tip')[0];
        group_color_tip.addEventListener('click',function(){
            var group_tips = document.getElementsByClassName('card_group')[0].getElementsByClassName('tip');
            if(group_tips[0].className=='tip iconfont icon-heitao icon-cheng')
                for(var i=0;i<4;i++){
                    group_tips[i].className+= ' disappear';
                    group_color_tip.className = "group_color_tip iconfont icon-dadantoushi";
                }
            else{
                group_tips[0].className = 'tip iconfont icon-heitao icon-cheng';
                group_tips[1].className = 'tip iconfont icon-hongtao icon-cheng';
                group_tips[2].className = 'tip iconfont icon-meihua icon-cheng';
                group_tips[3].className = 'tip iconfont icon-fangkuai icon-cheng';
                group_color_tip.className += ' active';
            } 
        },false);
        var tip_button = document.getElementsByClassName('tip_button')[0];
        tip_button.addEventListener('click',function(){
            if(tip_button.className=='tip_button iconfont icon-tishi')
            tip_button.className += ' active';
            else
            tip_button.className ='tip_button iconfont icon-tishi';
        },false);


    }
    var game_start_local = function(type){
        // 本地对战
        clear_poker();

        play = true;
        card_group = new Card_group('card_group');
        card_group.init_cards();
        
        
        lay = new Card_group('lay');
        var is_robot = [false,false]; // 用于标注玩家1 2 是不是机器
        switch(type){
            case 0 : break;
            case 1 : is_robot[1] = true;break;
        }
        user1 = new User(['a','s','d','f','g'],-1,'user1',false);
        user2 = new User(['1','2','3','4','5'],1,'user2',false);
        if(type==1)
        user2.user_robot_swap();
        
        // document.addEventListener('click',function(){
        //     card_group.pop_card();
        // },false);
        document.addEventListener('keydown',function(e){
            // 判断是不是我的回合

                if((play&&who==user1.my_who&&!user1.is_robot) ||play&&who==user1.my_who&&e.robot){
                    switch(e.key){
                        case user1.operations[0] :user1.pop_card(0);break; //出黑桃
                        case user1.operations[1] :user1.pop_card(1);break; //出红桃
                        case user1.operations[2] :user1.pop_card(2);break; //出梅花
                        case user1.operations[3] :user1.pop_card(3);break; //出方块
                        case user1.operations[4] :card_group.pop_card();break; // 翻卡组
                    }
                }
            
            },false);
        document.addEventListener('keydown',function(e){
            // 判断是不是我的回合
                if(play && who==user2.my_who&&!user2.is_robot||play&&who==user2.my_who&&e.robot){
                    switch(e.key){
                        case user2.operations[0] :;user2.pop_card(0);break; //出黑桃
                        case user2.operations[1] :user2.pop_card(1);break; //出红桃
                        case user2.operations[2] :user2.pop_card(2);break; //出梅花
                        case user2.operations[3] :user2.pop_card(3);break; //出方块
                        case user2.operations[4] :card_group.pop_card();break; // 翻卡组
                    }
                }
            
            },false);
        
        who = -1;
        who_changed();
    }

    var game_start_online = function(type){
        // 把选择创建房间 还是加入房间 的按键显示出来
        var create_or_join = document.getElementsByClassName('create_or_join')[0];
        create_or_join.className = "mengceng create_or_join";
        // 在线对战
        clear_poker(); 
        play = true;
        who = 0;
        card_group = new Card_group('card_group');
        card_group.accurate = true; // 告诉卡组 生成的牌是否是精确地 而不是乱序生成的
        card_group.init_cards();
        lay = new Card_group('lay');
        user1 = new User(['a','s','d','f','g'],-1,'user1',false); // 我
        user2 = new User(['1','2','3','4','5'],1,'user2',false);    // 对手
        if(type[1]==1){
            user1.user_robot_swap();
        }


        

        document.addEventListener('keydown',function(e){
            // 判断是不是我的回合 并进行操作 出牌还是抓牌
            var card =0; // 操作的卡牌 
            var my_op = 5; // 我的操作是啥
            var numbers = ['1','2','3','4','5','6','7','8','9','10','J','Q','K'];
            var colors = "SHCD";
            var number,color;
            if(play&&who==user1.my_who&&!user1.is_robot||play&&who==user1.my_who&&e.robot){
                switch(e.key){
                    case user1.operations[0] :my_op = 0 ;card = user1.pop_card(0);break; //出黑桃
                    case user1.operations[1] :my_op = 1 ;card = user1.pop_card(1);break; //出红桃
                    case user1.operations[2] :my_op = 2 ;card = user1.pop_card(2);break; //出梅花
                    case user1.operations[3] :my_op = 3 ;card = user1.pop_card(3);break; //出方块
                    case user1.operations[4] :my_op = 4 ;
                        execute(0,0,function(a){
                            execute_return = a;
                        });
                        // 告诉系统我要翻牌
                        // 等待接收数据

                        setTimeout(function(){
                            // if(execute_return.data.your_turn){
                            //     clearInterval(pop_interval_id);
                                card_msg = execute_return.data.last_code.split(' ')[2];
                                // 接收数据 花色加数字
                                card_group.pop_card_accurate(card_msg); // 翻开那张牌
                                
                            // }
                        },500);
                                           
                }
                if(my_op<4 &&card){
                    color = colors[my_op];
                    number = numbers[parseInt(card.getAttribute('index_number'))-1]
                    execute(1,color+number,function(){});
                }
            }
            
        },false);

        var in_room = function(){
                // 进入房间后
                console.log("进房成功");
            var game_start_interval = setInterval(function(){
                console.log(return_msg);
                getLastOperation(function(a){
                    return_msg = a;
                })
                play =true;/////asdasdasdasdasd
                if(return_msg&&return_msg.data.last_msg =="对局刚开始"){
                    console.log("开始游戏");
                    if(return_msg.data.your_turn) who=-1;
                    else who = 1;
                    play =true;
                    who_changed();
                    clearInterval(game_start_interval);
                    playing_interval_id = setInterval(function(){
                        console.log(return_msg);
                        getLastOperation(function(a){
                            return_msg = a;
                        })
                    },500); // 每隔0.5秒 询问一次上次操作
                    
                }
            },500);
        }
        
        // 1. button 创建对局按下去后触发的事件 
        var click_create = function(){
            create_or_join.className = "mengceng create_or_join disappear";
            // 2. button 所在那个蒙层消失 
            createGame(true,function(xml_uuid){//flag是boolean类型，为true仅能通过uuid加入，为false可供查询
                uuid = xml_uuid;
            });
            // 每20毫秒查看是否创建成功
            var create_interval = setInterval(function(){
                if(uuid){
                    clearInterval(create_interval);
                    console.log(uuid);
                    console.log("进房");
                    in_room(); //进入房间
                }
                else{
                    console.log("创建中");
                }
            },200);
        }

        
        var show_match = function(){
            console.log("showing");
            
            // 让前一个蒙层消失
            create_or_join.className = "mengceng create_or_join disappear";
            // create_or_join.className = "mengceng create_or_join disappear";
            // 显示现在的输入蒙层
            var input_uuid = document.getElementsByClassName('input_uuid')[0];
            input_uuid.className = "mengceng input_uuid";
            
            var show = document.getElementsByClassName('show')[0];
            var one_page_modle = document.getElementsByClassName('one_page')[0].cloneNode(true); //一页
            var one_match_modle = document.getElementsByClassName('one_match')[0].cloneNode(true); // 一个信息
            var one_page,
                one_match;
            
            // 当有对局时才创建  对局信息创建 1.也有可能是我没收到
            if(information){
                console.log(information);
                for(var i=0;i<=parseInt(information.data.total)/10-1;i++){
                    one_page = one_page_modle.cloneNode(false);
                    
                    for(var j=0;j<10;j++){
                        one_match = one_match_modle.cloneNode(true);
                        one_match.children[0].innerText += information.data.games[i*10+j].uuid;
                        one_match.children[1].innerText += information.data.games[i*10+j].host_id;
                        one_match.children[2].innerText += information.data.games[i*10+j].client_id;
                        one_match.children[3].innerText += information.data.games[i*10+j].created_at;
                        one_page.appendChild(one_match);
                    }
                    show.appendChild(one_page);
                }
            }
            
            // 对局信息显示
            // 默认先显示第一张
            var matchs = show.getElementsByClassName('one_page');
            matchs[1].className = 'one_page';
            var page_number = show.getElementsByClassName('page_number')[0];
            page_number.innerText = '1';
            page_number.setAttribute('sum_page',''+parseInt(information.data.total)/10);
            
            // 给左翻页 右翻页 添加点击时间
            var left_button = document.getElementsByClassName('icon-zuofanye-xue')[0]; 
            var right_button = document.getElementsByClassName('icon-youfanye')[0];

            left_button.addEventListener('click',function(){
                // 如果不是第一页 就亮出上一页
                if(parseInt(page_number.innerHTML)>1){
                    matchs[parseInt(page_number.innerHTML)].className += ' disappear';
                    matchs[parseInt(page_number.innerHTML)-1].className = 'one_page';
                    page_number.innerHTML = parseInt(page_number.innerHTML)-1+'';
                }
            },false);

            right_button.addEventListener('click',function(){
                // 如果不是最后一页 就亮出下一页
                if(parseInt(page_number.innerHTML) <= parseInt(page_number.getAttribute('sum_page')-1)){
                    matchs[parseInt(page_number.innerHTML)].className += ' disappear';
                    matchs[parseInt(page_number.innerHTML)+1].className = 'one_page';
                    page_number.innerHTML = parseInt(page_number.innerHTML)+1+'';
                }
            },false);  

            // 设置键盘按下 enter 事件 来判断 输入的uuid 是否存在 存在就加入房间
            document.addEventListener('keydown',function(e){
                if(e.keyCode == 13){
                    var input_uuid = document.getElementsByTagName('input')[0];
                    uuid = input_uuid.value;
                    console.log("your uuid:"+uuid);
                    var total = parseInt(information.data.total);
                    console.log(total);
                    for(var i=0;i<total;i++){
                        console.log(i);
                        if(uuid == information.data.games[i].uuid ){
                            // 让蒙层消失
                            document.getElementsByClassName('input_uuid')[0].className+= ' disappear';
                            
                            enterGame();
                            who = 1;
                            in_room(); //进入房间
                            break;
                        }
                    }
                }
            })


           
        }
        // 1. 当点击在线对局   就加入系统
        login('031902505', '147258369k', function (token) {//学号和密码
            your_token = token;
            console.log(your_token);
        });

        // login('031902501', 'zxc15960795279cc@', function (token) {//学号和密码
        //     your_token = token;
        //     console.log(your_token);
        // });


        setTimeout(function(){
            getPlayingGame(20000, 1, function(a){//page_size是分页大小,page_num是页码
                information = a;
                console.log(information);
            });
        },500);
        


        create_or_join.children[0].addEventListener('click',click_create,false);
        create_or_join.children[1].addEventListener('click',function(){
            setTimeout(show_match,5000);
        },false)
       
    }

    game_init();
}

window.onload = my_main;




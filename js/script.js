//マップの幅と深さ
var map_width = 23
var map_depth = 23

//画像サイズ
size = 32

// canvasの設定
var canvas = document.getElementById('canvas');
canvas.width = map_width*size;
canvas.height = map_depth*size;

//ボタンを取得
var button = document.getElementById('button');
var button_left = document.getElementById('left');
var button_up = document.getElementById('up');
var button_right = document.getElementById('right');
var button_down = document.getElementById('down');

// コンテキストを取得
var ctx = canvas.getContext('2d');

//開始地点
var start = new Object();
start.x = 0;
start.y = 1;

//終了地点
var goal = new Object();
goal.x = map_width-1;
goal.y = map_depth-2;

// CASTONオブジェクトを作成する
var caston = new Object();
caston.img = new Image();
caston.img.src = 'img/caston.png'
caston.x = start.x*32;
caston.y = start.y*32;
caston.move = 0;

// マップチップのオブジェクトを生成
var mapchip = new Image();
mapchip.src = 'img/map.png';

// 旗のオブジェクトを作成
var flagImg = new Image();
flagImg.src = 'img/ico_flag1a_1.gif'

// キーボードのオブジェクトを生成
var key = new Object();
key.up = false;
key.down = false;
key.right = false;
key.left = false;
key.push = '';

//穴掘り法のためのマップ配列（全部壁）
let map = new Array(map_depth);
for (var y=0; y<map_depth; y++){
    map[y] = new Array(map_width).fill(1)
}

//2マス先まで壁なら1,道があれば0.[0]=left,[1]=up,[2]=right,[3]=down
var checkWall_2_flag = [0,0,0,0];
//1マス先、２マス先が壁かチェックする
function checkWall_2(x,y){
    //flagの初期化
    checkWall_2_flag = [0,0,0,0]
    //left
    if (x>1){
        if (map[y][x-1] === 1 && map[y][x-2] === 1)checkWall_2_flag[0] = 1
    }
    //up
    if (y>1){
        if (map[y-1][x] === 1 && map[y-2][x] === 1)checkWall_2_flag[1] = 1
    }
    //right
    if (x<map_width-2){
        if (map[y][x+1] === 1 && map[y][x+2] === 1)checkWall_2_flag[2] = 1
    }
    //down
    if (y<map_depth-2){
        if (map[y+1][x] === 1 && map[y+2][x] === 1)checkWall_2_flag[3] = 1
    }
}

//マップ配列の生成アルゴリズム
function mapGenerate(){
    //map生成のスタート地点
    var mapStart = new Object();
    //ランダムにすることで生成のバリエーションを広げる
    mapStart.x = Math.floor(Math.floor(Math.random()*(map_width-2)/2)*2)+1;
    mapStart.y = Math.floor(Math.floor(Math.random()*(map_depth-2)/2)*2)+1;

    //map生成のための現在地
    var mapGen = new Object();
    mapGen.x = mapStart.x;
    mapGen.y = mapStart.y;

    //mapの初期化
    for (var y=0; y<map_depth; y++){
        map[y] = new Array(map_width).fill(1)
    }
    map[start.y][start.x] = 0;
    map[goal.y][goal.x] = 0;

    //穴掘り法アルゴリズム
    //stackで今まで通ってきたポイントを管理
    var stack = [];
    stack.push([mapGen.x,mapGen.y]);
    dig : while (true){
        //2マス先まで壁で埋まっているかチェック
        //埋まっていなかった場合はstackから一個前のpointを取り出し、もう一度チェック
        while (true){
            checkWall_2(mapGen.x,mapGen.y);
            var sum = 0;
            for (var i=0;i<4;i++){
                sum += checkWall_2_flag[i]
            }
            if (sum === 0){
                if (stack.length === 0){
                    //stackの長さが0のときは全て掘り終えたことになる。
                    break dig;
                }
                var p = stack.pop();
                mapGen.x = p[0];
                mapGen.y = p[1];
            }
            else{
                break;
            }
        }

        //進む方向を決めて、mapを2マス掘る。
        while (true){
            var r = Math.floor(Math.random()*4)
            if (checkWall_2_flag[r] === 1){
                //left
                if (r === 0){
                    stack.push([mapGen.x,mapGen.y]);
                    map[mapGen.y][mapGen.x-1] = 0;
                    map[mapGen.y][mapGen.x-2] = 0;
                    mapGen.x -= 2
                    break;
                }
                //up
                if (r === 1){
                    stack.push([mapGen.x,mapGen.y]);
                    map[mapGen.y-1][mapGen.x] = 0;
                    map[mapGen.y-2][mapGen.x] = 0;
                    mapGen.y -= 2
                    break;
                }
                //right
                if (r === 2){
                    stack.push([mapGen.x,mapGen.y]);
                    map[mapGen.y][mapGen.x+1] = 0;
                    map[mapGen.y][mapGen.x+2] = 0;
                    mapGen.x += 2
                    break;
                }
                //down
                if (r === 3){
                    stack.push([mapGen.x,mapGen.y]);
                    map[mapGen.y+1][mapGen.x] = 0;
                    map[mapGen.y+2][mapGen.x] = 0;
                    mapGen.y += 2
                    break;
                }
            }
        }
    }
}

//暗闇=0,全画面=1
var mapDisplay = 0;

//全画面表示切り替え
function mapDisplay_all(){
    mapDisplay = 1;
}

//暗闇表示切り替え
function mapDisplay_dark(){
    mapDisplay = 0;
}

function main(){
    // 黒塗りする
    ctx.fillStyle = "rgb(0,0,0)";
    ctx.fillRect(0,0,map_width*size,map_depth*size);

    // マップを表示する（周囲3*3）
    if (mapDisplay === 0){
        for (var y=Math.floor(caston.y/32)-1; y<Math.floor(caston.y/32)+2; y++){
            for (var x=Math.floor(caston.x/32)-1; x<Math.floor(caston.x/32)+2; x++){
                if (map[y][x] === 0)ctx.drawImage(mapchip,0,0,32,32,32*x,32*y,32,32);
                if (map[y][x] === 1)ctx.drawImage(mapchip,32,0,32,32,32*x,32*y,32,32);
                if (y === goal.y && x === goal.x)ctx.drawImage(flagImg,0,0,10,10,32*goal.x+11,32*goal.y+11,10,10);
            }
        }
    }

    //マップの表示（全表示/デバッグ用）
    if (mapDisplay === 1){
        for (var y=0; y<map_depth; y++){
            for (var x=0; x<map_width; x++){
                if (map[y][x] === 0)ctx.drawImage(mapchip,0,0,32,32,32*x,32*y,32,32);
                if (map[y][x] === 1)ctx.drawImage(mapchip,32,0,32,32,32*x,32*y,32,32);
                if (y === goal.y && x === goal.x)ctx.drawImage(flagImg,0,0,10,10,32*goal.x+11,32*goal.y+11,10,10);
            }
        }
    }

    // CASTONを表示する
    ctx.drawImage(caston.img,caston.x,caston.y);

    addEventListener("keydown",keydownfunc,false);
    addEventListener("keyup",keyupfunc,false);
    button_left.addEventListener("mousedown",mousedownfunc_left,false);
    button_left.addEventListener("mouseup",mouseupfunc_left,false);
    button_left.addEventListener("touchstart",mousedownfunc_left,false);
    button_left.addEventListener("touchdown",mouseupfunc_left,false);
    button_up.addEventListener("mousedown",mousedownfunc_up,false);
    button_up.addEventListener("mouseup",mouseupfunc_up,false);
    button_up.addEventListener("touchstart",mousedownfunc_up,false);
    button_up.addEventListener("touchdown",mouseupfunc_up,false);
    button_right.addEventListener("mousedown",mousedownfunc_right,false);
    button_right.addEventListener("mouseup",mouseupfunc_right,false);
    button_right.addEventListener("touchstart",mousedownfunc_right,false);
    button_right.addEventListener("touchdown",mouseupfunc_right,false);
    button_down.addEventListener("mousedown",mousedownfunc_down,false);
    button_down.addEventListener("mouseup",mouseupfunc_down,false);
    button_down.addEventListener("touchstart",mousedownfunc_down,false);
    button_down.addEventListener("touchdown",mouseupfunc_down,false);

    // 方向キーが押されている場合にCASTONを移動させる
    if (caston.move === 0){
        if (key.left === true){
            var x = caston.x/32;
            var y = caston.y/32;
            x--;
            if (map[y][x] === 0){
                caston.move = 32;
                key.push = 'left';
            }
        }
        if (key.up === true){
            var x = caston.x/32;
            var y = caston.y/32;
            if (y>0){
                y--;
                if (map[y][x] === 0){
                    caston.move = 32;
                    key.push = 'up';
                }
            }
        }
        if (key.right === true){
            var x = caston.x/32;
            var y = caston.y/32;
            x++;
            if (map[y][x] === 0){
                caston.move = 32;
                key.push = 'right';
            }
        }
        if (key.down === true){
            var x = caston.x/32;
            var y = caston.y/32;
            if (y<map_depth-1){
                y++;
                if (map[y][x] === 0){
                    caston.move = 32;
                    key.push = 'down';
                }
            }
        }
    }
    // caston.moveが0より大きい時は4pxずつ移動を続ける
    if (caston.move > 0){
        caston.move -= 4;
        if (key.push === 'left') caston.x -= 4;
        if (key.push === 'up') caston.y -= 4;
        if (key.push === 'right') caston.x += 4;
        if (key.push === 'down') caston.y += 4;
    }

    requestAnimationFrame(main);
}

// ページと依存している全てのデータが読み込まれたらメイン関数を開始する
addEventListener('load',main(),false);

// キーボードが押された時に呼び出される関数
function keydownfunc(event){
    var key_code = event.keyCode;
    if (key_code === 37) key.left = true;
    if (key_code === 38) key.up = true;
    if (key_code === 39) key.right = true;
    if (key_code === 40) key.down = true;
    event.preventDefault(); //方向キーでブラウザがスクロールしないようにする
}

// キーボードが離された時に呼び出される関数
function keyupfunc(event){
    var key_code = event.keyCode;
    if (key_code === 37) key.left = false;
    if (key_code === 38) key.up = false;
    if (key_code === 39) key.right = false;
    if (key_code === 40) key.down = false;
}

// ボタンがマウスに押された時に呼び出される関数
function mousedownfunc_left(){
    key.left = true;
}
function mousedownfunc_up(){
    key.up = true;
    console.log("up");
}
function mousedownfunc_right(){
    key.right = true;
    console.log("right");
}
function mousedownfunc_down(){
    key.down = true;
    console.log("down");
}

// ボタンからマウスが離れた時に呼び出される関数
function mouseupfunc_left(){
    key.left = false;
    console.log("left");
}
function mouseupfunc_up(){
    key.up = false;
}
function mouseupfunc_right(){
    key.right = false;
}
function mouseupfunc_down(){
    key.down = false;
}

//sleep関数
function sleep(waitTime){
    var startTime = new Date();
    while (new Date() - startTime < waitTime){
    }
}

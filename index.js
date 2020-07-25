var CAMERA = null;
var CANVAS = null;
const WSIZE = window.innerWidth;
const HSIZE = window.innerHeight;
//const WSIZE = 600;
//const HSIZE = 800;
const INTERVAL = 42;
const POSENUM = 17;
var COLOR = [4, 104, 39];
var x_old = Array(POSENUM);
var y_old = Array(POSENUM);
var r2_old = 0;

async function main() {
    const net = await posenet.load();
    CAMERA = document.getElementById('camera');
    CAMERA.width = WSIZE;
    CAMERA.height = HSIZE;
    CANVAS = document.getElementById('canvas');
    CANVAS.width = WSIZE;
    CANVAS.height = HSIZE;
    var element_cp  = document.getElementsByClassName('ctr_panel');

    //ctr_panelへの設定
    for(var i=0, l=element_cp.length; i<l; i++){
        element_cp[i].style.top   =  String(HSIZE)  + "px";
    }

    for(var i=0; i<POSENUM; i++){
        x_old[i]=0;
        y_old[i]=0;
    }

    /** カメラ設定 */
    const constraints = {
        audio: false,
        video: {
            width: WSIZE,
            height: HSIZE,
            facingMode: "user"   // フロントカメラを利用する
        //facingMode: { exact: "environment" }  // リアカメラを利用する場合
        }
    };
    /**
     * カメラを<video>と同期
     */
    const permission = navigator.mediaDevices.getUserMedia(constraints);
    
    permission.then(
        function(stream) {
            const video  = document.querySelector("#camera");
            //const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            setInterval(updateImage, INTERVAL, video, net);
    })
    .catch( 
        function(err) {
        alert(err.name + ": " + err.message);
    });
}

async function updateImage(video, net){
    const context = CANVAS.getContext('2d');
    const pose = await net.estimateSinglePose(CAMERA, {
        flipHorizontal: false
    });
    context.clearRect(0, 0, WSIZE, HSIZE);
    context.drawImage(video,0 , 0, WSIZE, HSIZE, 0,0,WSIZE, HSIZE);
    var cnt = 0;
    var r2 = 0;
    for(var i=0; i<POSENUM; i++){
        if(pose.keypoints[i].score > 0.5){
            context.fillStyle = "rgb(255, 0, 0)";
            context.fillRect(pose.keypoints[i].position.x, pose.keypoints[i].position.y, 10, 10);
            r2 = Math.sqrt((pose.keypoints[i].position.x - x_old[i])^2 + (pose.keypoints[i].position.y - y_old[i])^2 );
            x_old[i] = pose.keypoints[i].position.x;
            y_old[i] = pose.keypoints[i].position.y;
            cnt = cnt + 1;
        }
    }
    if(isNaN(r2/cnt)){
        r2 = r2_old;
    }
    else{
        r2 = r2 / cnt;
        r2_old = r2;
    }
    getPose(r2);       
}

//function getDuration() {
    //動画の長さ（秒）を表示
    //document.getElementById("nagasa").innerHTML = CAMERA.duration;
//}
function getPose(r2) {
    //動画の長さ（秒）を表示
     document.getElementById("nagasa").innerHTML = r2;
}
function playVideo() {
    //再生完了の表示をクリア
    document.getElementById("kanryou").innerHTML = "";
    //動画を再生
    CAMERA.play();
    //現在の再生位置（秒）を表示
    CAMERA.addEventListener("timeupdate", function(){
        document.getElementById("ichi").innerHTML = CAMERA.currentTime;
    }, false);
    //再生完了を知らせる
    CAMERA.addEventListener("ended", function(){
        document.getElementById("kanryou").innerHTML = "動画の再生が完了しました。";
    }, false);
}

function pauseVideo() {
    //動画を一時停止
    CAMERA.pause();
}

function upVolume() {
    //音量を上げる
    CAMERA.volume = CAMERA.volume + 0.25;
}

function downVolume() {
    //音量を下げる
    CAMERA.volume = CAMERA.volume - 0.25;
}

main();
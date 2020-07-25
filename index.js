(function(win, doc) {

    var CAMERA = null;
    var CANVAS = null;
    var WSIZE = null;
    var HSIZE = null;
    const INTERVAL = 42;
    const POSENUM = 17;
    var x_old = Array(POSENUM);
    var y_old = Array(POSENUM);
    var r2_old = 0;

    main();

    async function main() {
        const net = await posenet.load();
        CAMERA = doc.getElementById('camera');
        CANVAS = doc.getElementById('canvas');

        for(var i=0; i<POSENUM; i++){
            x_old[i]=0;
            y_old[i]=0;
        }

        /** カメラ設定 */
        const constraints = {
            audio: false,
            video: {
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
                const video  = doc.querySelector("#camera");
                //const video = doc.createElement('video');
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
        WSIZE  = video.videoWidth;
        HSIZE = video.videoHeight;
        video.width = WSIZE;
        video.height = HSIZE;
        CANVAS.width = WSIZE;
        CANVAS.height = HSIZE;
        const pose = await net.estimateSinglePose(video, {
            flipHorizontal: false
        });

        //context.clearRect(0, 0, WSIZE, HSIZE);
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
        //文字のスタイルを指定
        context.font = '32px serif';
        context.fillStyle = '#FF0000';
        //文字の配置を指定（左上基準にしたければtop/leftだが、文字の中心座標を指定するのでcenter
        context.textBaseline = 'bottom';
        context.textAlign = 'center';

        //座標を指定して文字を描く（座標は画像の中心に）
        context.fillText("現在の活性度 " + String(r2), 0, HSIZE-50);

    }

    //function getDuration() {
        //動画の長さ（秒）を表示
        //doc.getElementById("nagasa").innerHTML = CAMERA.duration;
    //}
    //function getPose(r2) {
        //動画の長さ（秒）を表示
        //doc.getElementById("nagasa").innerHTML = r2;
    //}
    //function playVideo() {
        //再生完了の表示をクリア
        //doc.getElementById("kanryou").innerHTML = "";
        //動画を再生
        //CAMERA.play();
        //現在の再生位置（秒）を表示
        //CAMERA.addEventListener("timeupdate", function(){
        //    doc.getElementById("ichi").innerHTML = CAMERA.currentTime;
        //}, false);
        //再生完了を知らせる
        //CAMERA.addEventListener("ended", function(){
        //    doc.getElementById("kanryou").innerHTML = "動画の再生が完了しました。";
        //}, false);
    //}

    //function pauseVideo() {
        //動画を一時停止
    //    CAMERA.pause();
    //}

    //function upVolume() {
        //音量を上げる
    //    CAMERA.volume = CAMERA.volume + 0.25;
    //}

    //function downVolume() {
        //音量を下げる
    //    CAMERA.volume = CAMERA.volume - 0.25;
    //}


})(this, document);
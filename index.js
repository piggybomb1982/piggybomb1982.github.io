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
    var totalTime = 0;
    var totalR = 0;
    var dTime = null; // 前フレームとの差分時間
    var endTime = null; // 前フレームの終了時間
    var eflag = false; 

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

        doc.addEventListener("click", () => {
            if(eflag){

            }
            else{
                eflag = true;
            }
          }, false);
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

        if(eflag){
            if(!endTime){
                dTime=performance.now() - endTime;
            }
            else{
                dTime = 0;
            }
            endTime = performance.now();
            
            var cnt = 0;
            var r2 = 0;
            for(var i=0; i<POSENUM; i++){
                if(pose.keypoints[i].score > 0.5){
                    context.fillStyle = "rgb(255, 0, 0)";
                    context.fillRect(pose.keypoints[i].position.x, pose.keypoints[i].position.y, 10, 10);
                    r2 = Math.sqrt(Math.pow(pose.keypoints[i].position.x - x_old[i],2) + Math.pow(pose.keypoints[i].position.y - y_old[i],2) );
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
            r2 = r2 * dTime;
            totalTime = totalTime + dTime;
            totalR = totalR + r2;
            //文字のスタイルを指定
            context.font = '32px serif';
            context.fillStyle = '#FF0000';
            //文字の配置を指定（左上基準にしたければtop/leftだが、文字の中心座標を指定するのでcenter
            context.textBaseline = 'bottom';
            context.textAlign = 'center';

            //座標を指定して文字を描く（座標は画像の中心に）
            context.fillText("現在の活性度 " + String(r2), 0, HSIZE-150);
            context.fillText("トータル活性度 " + String(totalR), 0, HSIZE-100);
            context.fillText("荊軻時間 " + String(totalTime), 0, HSIZE-50);
        }

    }


})(this, document);
const stats = new Stats();
stats.showPanel(0);
document.body.prepend(stats.domElement);

let model, ctx, videoWidth, videoHeight, video, canvas, destinationCanvas; 
let stopEstimate = false;

async function setupCamera() {
  video = document.getElementById('video');

  const stream = await navigator.mediaDevices.getUserMedia({
    'audio': false,
    'video': { facingMode: 'user' },
  });
  video.srcObject = stream;

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

var count = 0

const renderPrediction = async () => {
  stats.begin();
    
  count < 1000 ? count++ : count = 0

  const returnTensors = false;
  const flipHorizontal = true;
  const annotateBoxes = true;
  const predictions = await model.estimateFaces(
    video, returnTensors, flipHorizontal, annotateBoxes);

  if (predictions.length > 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < predictions.length; i++) {
      if (returnTensors) {
        predictions[i].topLeft = predictions[i].topLeft.arraySync();
        predictions[i].bottomRight = predictions[i].bottomRight.arraySync();
        if (annotateBoxes) {
          predictions[i].landmarks = predictions[i].landmarks.arraySync();
        }
      }

      const start = predictions[i].topLeft;
      const end = predictions[i].bottomRight;
      const size = [end[0] - start[0], end[1] - start[1]];
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 3;
      let lineHeight = 20
      // ctx.strokeRect(start[0], start[1], size[0], size[1]);
      ctx.beginPath();
      ctx.moveTo(start[0], start[1]);
      ctx.lineTo(start[0] - lineHeight, start[1]);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(start[0], start[1]);
      ctx.lineTo(start[0], start[1] + lineHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(start[0], end[1]);
      ctx.lineTo(start[0] - lineHeight, end[1]);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(start[0], end[1]);
      ctx.lineTo(start[0], end[1] - lineHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(end[0], end[1]);
      ctx.lineTo(end[0] + lineHeight, end[1]);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(end[0], end[1]);
      ctx.lineTo(end[0], end[1] - lineHeight);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(end[0], start[1]);
      ctx.lineTo(end[0] + lineHeight, start[1]);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(end[0], start[1]);
      ctx.lineTo(end[0], start[1] + lineHeight);
      ctx.stroke();
        
      if (count % 50 == 0) {
          var destCtx = destinationCanvas.getContext('2d');
          destCtx.drawImage(video, 0, 0);
          fetch('./facerec', {method: 'POST', headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          }, body: JSON.stringify({
            'img': destinationCanvas.toDataURL(),
            'secret_key': secret_key
          })}).then(res => res.json()).then(res => {
              console.log(res)
            // ctx.fillStyle = "red";
            // ctx.font = "30px Arial";
            // ctx.fillText(res.result, end[0], start[1]);
          })
          // video.pause()
          // stopEstimate = true
      }
    }
  }

  stats.end();
  if(!stopEstimate)
    requestAnimationFrame(renderPrediction);
};

const setupPage = async () => {
  await tf.setBackend('webgl');
  await setupCamera();
  video.play();

  videoWidth = video.videoWidth;
  videoHeight = video.videoHeight;
  video.width = videoWidth;
  video.height = videoHeight;

  canvas = document.getElementById('output');
  destinationCanvas = document.getElementById('face_c');
  canvas.width = videoWidth;
  canvas.height = videoHeight;
  destinationCanvas.width = videoWidth;
  destinationCanvas.height = videoHeight;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = "rgba(255, 0, 0, 0.5)";

  model = await blazeface.load();

  renderPrediction();
};

setupPage();
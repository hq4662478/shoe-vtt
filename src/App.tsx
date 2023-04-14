import React from 'react';
import logo from './logo.svg';
import './App.css';
import './styles.css';
import {BOX_CONNECTIONS,  Objectron, ObjectronConfig , ResultsListener, ObjectronInterface, Results, Point2D, LandmarkConnectionArray} from '@mediapipe/objectron';
import { Camera } from '@mediapipe/camera_utils';
import DeviceDetector from "device-detector-js";
// import { drawingUtils} from '@mediapipe/drawing_utils'
import {drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

// import {FpsView} from "react-fps";
// Usage: testSupport({client?: string, os?: string}[])
// Client and os are regular expressions.
// See: https://cdn.jsdelivr.net/npm/device-detector-js@2.2.10/README.md for
// legal values for client and os
testSupport([
  {client: 'Chrome'},
]);
// navigator.getWebcam = (navigator.getUserMedia || navigator.webKitGetUserMedia || navigator.moxGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
function testSupport(supportedDevices:{client?: string; os?: string;}[]) {
  const deviceDetector = new DeviceDetector();
  const detectedDevice = deviceDetector.parse(navigator.userAgent);
  
  let isSupported = false;
  for (const device of supportedDevices) {
    if (device.client !== undefined) {
      const re = new RegExp(`^${device.client}$`);
      if (!re.test(detectedDevice.client.name)) {
        continue;
      }
    }
    if (device.os !== undefined) {
      const re = new RegExp(`^${device.os}$`);
      if (!re.test(detectedDevice.os.name)) {
        continue;
      }
    }
    isSupported = true;
    break;
  }
  if (!isSupported) {
    console.log("Bypass device not support");
    // alert(`This demo, running on ${detectedDevice.client.name}/${detectedDevice.os.name}, ` +
    //       `is not well supported at this time, continue at your own risk.`);
  }
}


// const fpsControl = new controls.FPS();

const controls = window;
const drawingUtils = window;
const mpObjectron = window;

const videoElement =
  document.getElementsByClassName('input_video')[0] as HTMLVideoElement;
const canvasElement =
  document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement;
const controlsElement =
  document.getElementsByClassName('control-panel')[0] as HTMLDivElement;
const canvasCtx = canvasElement.getContext('2d')!;

videoElement.setAttribute('autoplay', '');
videoElement.setAttribute('muted', '');
videoElement.setAttribute('playsinline', '')


function App() {
  
  // const videoElement =
  //   document.getElementsByClassName('input_video')[0] as HTMLVideoElement;
  // const canvasElement =
  //   document.getElementsByClassName('output_canvas')[0] as HTMLCanvasElement;
  // const controlsElement =
  //   document.getElementsByClassName('control-panel')[0] as HTMLDivElement;
  // const canvasCtx = canvasElement.getContext('2d')!;

 
  // Fix for iOS Safari from https://leemartin.dev/hello-webrtc-on-safari-11-e8bcb5335295


    const objectron = new Objectron({locateFile: (file) => {
      console.log("!!!!!!", file);
      // return `./assets/objectron/${file}`;
      // return `./bjectron/${file}`;
      return `https://cdn.jsdelivr.net/npm/@mediapipe/objectron/${file}`;
    }});

    objectron.setOptions({
      modelName: 'Shoe',
      maxNumObjects: 3,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.99,
    });

    function onResults(results: Results) {
      // console.log("run result", results);
      canvasCtx.save();
      canvasCtx.drawImage(
          results.image, 0, 0, canvasElement.width, canvasElement.height);
      if (!!results.objectDetections) {
        for (const detectedObject of results.objectDetections) {
          console.log(detectedObject.keypoints);
          // Reformat keypoint information as landmarks, for easy drawing.
          const landmarks: Point2D[] = detectedObject.keypoints.map(x => x.point2d);
          // // Draw bounding box.
          drawConnectors(canvasCtx, landmarks, BOX_CONNECTIONS, {color: '#FF0000'});

          drawLandmarks(canvasCtx, [landmarks[0]], {color: '#FFFFFF'});
        }
      }
      canvasCtx.restore();
    }

    objectron.onResults(onResults);

    const camera = new Camera(videoElement, {
      onFrame: async () => {
        
        await objectron.send({image: videoElement});
      },
      width: 1280,
      height: 720
    });
    camera.start();
// ###############################################################




// ###############################################################
  return (
    
    <div className="App">
      {/* <FpsView/> */}
      {/* <div className="container">
        <video className="input_video"></video>
        <canvas className="output_canvas" width="1280px" height="720px"></canvas>
      </div> */}
    </div>
  );
}

export default App;

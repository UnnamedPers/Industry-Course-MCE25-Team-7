// frame-controller.js

// Configuration variables
let sensitivityThreshold = 20; // Sensitivity threshold for sound detection
let peakCountThreshold = 50; // Minimum number of peaks to trigger frame change
let frameChangeDelay = 50; // Delay in milliseconds for frame change responsiveness

// Define the total number of frames
const totalFrames = 59;
let currentFrame = 1; // Start from the first frame

// Function to update the frame image
function updateFrame() {
    const frameElement = document.getElementById('frame');
    frameElement.src = `frames/Industry-${currentFrame.toString().padStart(2, '0')}.png`; // Updated to .png
}

// Function to handle microphone input
async function handleMicrophoneInput() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 2048;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let lastFrameChangeTime = 0; // Timestamp for last frame change

        function checkAudioInput() {
            analyser.getByteFrequencyData(dataArray);
            const peakCount = dataArray.filter(value => value > sensitivityThreshold).length;

            // Check if a significant sound is detected
            const currentTime = performance.now();
            if (peakCount > peakCountThreshold) {
                // Frame change to the right if sound is detected
                if (currentFrame < totalFrames && currentTime - lastFrameChangeTime > frameChangeDelay) {
                    currentFrame++;
                    updateFrame();
                    lastFrameChangeTime = currentTime; // Update the last frame change time
                }
            } else {
                // Frame change to the left if no significant sound is detected
                if (currentFrame > 1 && currentTime - lastFrameChangeTime > frameChangeDelay) {
                    currentFrame--;
                    updateFrame();
                    lastFrameChangeTime = currentTime; // Update the last frame change time
                }
            }

            requestAnimationFrame(checkAudioInput);
        }

        checkAudioInput();
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
}

// Initialize the first frame on page load and start audio input
updateFrame();
handleMicrophoneInput();

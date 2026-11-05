// 1. Your Teachable Machine model URL

const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_ID/";

// 2. Get HTML elements

const video = document.getElementById("camera");

const result = document.getElementById("result");

const predictionsContainer =
    document.getElementById("predictions");

const startBtn = document.getElementById("startBtn");

const stopBtn = document.getElementById("stopBtn");

// 3. Variables

let model;

let cameraStream;

let isRunning = false;

// 4. Load AI model

async function loadModel() {

    result.textContent = "Loading AI model...";

    try {

        model = await tmImage.load(
            MODEL_URL + "model.json",
            MODEL_URL + "metadata.json"
        );

        result.textContent = "AI model loaded successfully!";

    } catch (error) {

        console.error(error);

        result.textContent = "Failed to load AI model.";

        throw error;
    }
}

// 5. Start camera

async function startCamera() {

    try {

        if (!model) {
            await loadModel();
        }

        cameraStream = await navigator.mediaDevices
            .getUserMedia({
                video: true,
                audio: false
            });

        video.srcObject = cameraStream;

        await video.play();

        isRunning = true;

        predict();

    } catch (error) {

        console.error(error);

        result.textContent =
            "Camera or model error. Check permissions.";

    }
}

// 6. Recognize objects using AI

async function predict() {

    if (!isRunning) return;

    const predictions = await model.predict(video);

    // Find highest prediction

    const bestPrediction = predictions.reduce(
        (best, current) =>
            current.probability > best.probability
                ? current
                : best
    );

    // Display result

    result.textContent =
        bestPrediction.className +
        " - " +
        (bestPrediction.probability * 100).toFixed(2) +
        "%";

    // Display all predictions

    predictionsContainer.innerHTML = "";

    predictions.forEach(item => {

        const percentage =
            (item.probability * 100).toFixed(2);

        const div = document.createElement("div");

        div.className = "prediction";

        div.textContent =
            item.className + ": " + percentage + "%";

        predictionsContainer.appendChild(div);

    });

    // Continue recognition

    if (isRunning) {
        requestAnimationFrame(predict);
    }
}

// 7. Stop camera

function stopCamera() {

    isRunning = false;

    if (cameraStream) {

        cameraStream.getTracks().forEach(track => {
            track.stop();
        });

        cameraStream = null;
    }

    video.srcObject = null;

    result.textContent = "Camera stopped.";

}

// 8. Button events

startBtn.addEventListener("click", startCamera);

stopBtn.addEventListener("click", stopCamera);
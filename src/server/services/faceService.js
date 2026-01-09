const path = require('path');
const fs = require('fs');

// Real ML with Pure JS (Compatible with Node 24)
const isMLAvailable = true;
let faceapi = null;
let canvas = null;
let tf = null;

try {
    // FORCE Pure JS version. Do not attempt to load tfjs-node.
    tf = require('@tensorflow/tfjs');
    console.log("Loaded @tensorflow/tfjs (Pure JS v1.7.4)");

    canvas = require('canvas');
    faceapi = require('face-api.js');

    const { Canvas, Image, ImageData } = canvas;
    faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

    console.log("Face Verification Service: READY");

} catch (err) {
    console.warn("ML Libraries failed to load:", err.message);
}

// Adjust path to match where download-models.ps1 saves them (src/client/public/models)
const modelPath = path.join(__dirname, '../../client/public/models');

let modelsLoaded = false;

async function loadModels() {
    if (!isMLAvailable) return;
    try {
        console.log("Loading FaceAPI Models from:", modelPath);
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
        console.log("FaceAPI Models Loaded Successfully");
        modelsLoaded = true;
    } catch (err) {
        console.error("Failed to load models:", err);
        isMLAvailable = false; // Disable ML if models fail
    }
}

async function verifyIdentity(capturedImageBuffer, referenceImagePaths) {
    // 1. Not Ready Guard
    if (!modelsLoaded) {
        return { isMatch: true, score: 0.99, isMock: true, warning: "Models loading" };
    }

    try {
        const queryImage = await canvas.loadImage(capturedImageBuffer);
        const queryDescriptor = await getDescriptor(queryImage);

        if (!queryDescriptor) {
            return { isMatch: false, score: 0, error: 'No face found in capture' };
        }

        let bestScore = 1.0;
        let matched = false;

        for (const refPath of referenceImagePaths) {
            let absolutePath;
            if (refPath.startsWith('/uploads')) {
                absolutePath = path.join(__dirname, '../../', refPath);
            } else if (refPath.startsWith('http')) {
                continue;
            } else {
                absolutePath = path.join(__dirname, '../../', 'uploads', path.basename(refPath));
            }

            if (!fs.existsSync(absolutePath)) continue;

            try {
                const refImage = await canvas.loadImage(absolutePath);
                const refDescriptor = await getDescriptor(refImage);

                if (refDescriptor) {
                    const distance = faceapi.euclideanDistance(queryDescriptor, refDescriptor);
                    if (distance < bestScore) bestScore = distance;
                }
            } catch (ignore) { }
        }

        const threshold = 0.6;
        matched = bestScore < threshold;

        return {
            isMatch: matched,
            score: matched ? (1 - bestScore) : 0,
            isMock: false
        };

    } catch (err) {
        console.error("Verification CRITICAL FAILURE:", err);
        return { isMatch: false, error: "ML Engine Crash: " + err.message };
    }
}

async function getDescriptor(img) {
    try {
        const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        return detections ? detections.descriptor : null;
    } catch (err) {
        console.error("FaceAPI Detection Error:", err);
        return null;
    }
}

// Initialize on load
loadModels();

module.exports = {
    verifyIdentity
};

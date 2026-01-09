const faceService = require('./services/faceService');
const canvas = require('canvas');
const { Canvas } = canvas;

async function testML() {
    console.log("--- ML STANDALONE TEST (Inside src/server) ---");

    // 1. Create a dummy black image (100x100)
    const cv = new Canvas(100, 100);
    const ctx = cv.getContext('2d');
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 100, 100);
    const buffer = cv.toBuffer('image/jpeg');
    console.log("Created valid image buffer.");

    try {
        // 2. Run Verification
        console.log("Calling faceService.verifyIdentity...");
        // Pass empty array for reference photos
        const result = await faceService.verifyIdentity(buffer, []);

        console.log("Result:", result);
        console.log("SUCCESS: ML Engine did not crash.");

    } catch (err) {
        console.error("CRASH: ML Engine Failed.", err);
    }
}

testML();

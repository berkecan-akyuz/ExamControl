$modelsUrl = "https://github.com/justadudewhohacks/face-api.js/raw/master/weights"
$dest = "src/client/public/models"

New-Item -ItemType Directory -Force -Path $dest

$files = @(
    "ssd_mobilenetv1_model-weights_manifest.json",
    "ssd_mobilenetv1_model-shard1",
    "ssd_mobilenetv1_model-shard2",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_recognition_model-weights_manifest.json",
    "face_recognition_model-shard1",
    "face_recognition_model-shard2"
)

foreach ($file in $files) {
    echo "Downloading $file..."
    Invoke-WebRequest -Uri "$modelsUrl/$file" -OutFile "$dest/$file"
}

echo "Models downloaded successfully!"

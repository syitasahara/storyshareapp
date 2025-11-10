let stream = null;
let cameraActive = false;

export async function startCamera(videoElement) {
    try {
        if (stream) {
            stopCamera();
        }

        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });
        
        videoElement.srcObject = stream;
        await videoElement.play();
        
        cameraActive = true;
        console.log('Camera started successfully');
        return true;
    } catch (error) {
        console.error('Error accessing camera:', error);
        
        let errorMessage = 'Tidak dapat mengakses kamera. ';
        if (error.name === 'NotAllowedError') {
            errorMessage += 'Izin akses kamera ditolak.';
        } else if (error.name === 'NotFoundError') {
            errorMessage += 'Tidak ada kamera yang ditemukan.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage += 'Browser tidak mendukung akses kamera.';
        } else {
            errorMessage += 'Pastikan Anda memberikan izin akses kamera.';
        }
        
        throw new Error(errorMessage);
    }
}

export function stopCamera() {
    if (stream) {
        console.log('Stopping camera...');
        stream.getTracks().forEach(track => {
            track.stop();
            console.log('Camera track stopped:', track.kind);
        });
        stream = null;
    }
    cameraActive = false;
}

export function capturePhoto(videoElement, canvasElement) {
    if (!cameraActive) {
        throw new Error('Kamera tidak aktif');
    }

    const context = canvasElement.getContext('2d');

    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
    
    console.log('Photo captured successfully');
    return canvasElement.toDataURL('image/jpeg', 0.8); // 80% quality
}

export function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    const file = new File([u8arr], filename, { type: mime });
    console.log('File created from data URL:', file.name, file.size, 'bytes');
    return file;
}

export function isCameraSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

export function getCameraStatus() {
    return cameraActive;
}
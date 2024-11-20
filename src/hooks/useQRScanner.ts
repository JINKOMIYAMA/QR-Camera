import { useState, useRef, useEffect } from "react";
import jsQR from "jsqr";
import { toast } from "sonner";

export const useQRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [qrDetected, setQrDetected] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const startCamera = async () => {
    try {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("カメラへのアクセスが拒否されました");
    }
  };

  const captureQRArea = (
    canvas: HTMLCanvasElement,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    const captureCanvas = document.createElement('canvas');
    // Add 2px padding to top and bottom of capture area
    const captureHeight = height + 4;
    captureCanvas.width = width;
    captureCanvas.height = captureHeight;
    const captureCtx = captureCanvas.getContext('2d');
    
    if (captureCtx) {
      captureCtx.drawImage(
        canvas, 
        x, y - 2, width, captureHeight, // Subtract 2px from y to expand upward
        0, 0, width, captureHeight
      );
      setCapturedImage(captureCanvas.toDataURL("image/png"));
      setScanning(false);
    }
  };

  useEffect(() => {
    if (scanning) {
      startCamera();
      setQrDetected(false);
      setCountdown(3);
    }

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [scanning]);

  useEffect(() => {
    let animationFrame: number;
    let countdownTimer: NodeJS.Timeout;

    const scan = () => {
      if (!scanning || qrDetected) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video?.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const scanAreaWidth = Math.min(video.videoWidth * 0.8, 800);
        const scanAreaHeight = scanAreaWidth / 3;
        const x = (video.videoWidth - scanAreaWidth) / 2;
        const y = (video.videoHeight - scanAreaHeight) / 2;

        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const imageData = ctx.getImageData(x, y, scanAreaWidth, scanAreaHeight);

        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && !qrDetected) {
            setQrDetected(true);
            toast.success("QRコードを検出しました。3秒後に撮影します", {
              position: "top-center"
            });

            countdownTimer = setInterval(() => {
              setCountdown((prev) => {
                if (prev <= 1) {
                  clearInterval(countdownTimer);
                  captureQRArea(canvas, x, y, scanAreaWidth, scanAreaHeight);
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        } catch (error) {
          console.error("QRコードの検出中にエラーが発生しました:", error);
        }
      }

      if (!qrDetected) {
        animationFrame = requestAnimationFrame(scan);
      }
    };

    scan();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (countdownTimer) {
        clearInterval(countdownTimer);
      }
    };
  }, [scanning, qrDetected]);

  return {
    videoRef,
    canvasRef,
    scanning,
    setScanning,
    capturedImage,
    qrDetected,
    countdown,
    startCamera
  };
};
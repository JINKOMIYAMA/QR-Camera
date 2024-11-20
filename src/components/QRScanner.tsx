import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ScanOverlay from "./ScanOverlay";

const QRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

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

  useEffect(() => {
    if (scanning) {
      startCamera();
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
    let captureTimeout: NodeJS.Timeout;

    const scan = () => {
      if (!scanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video?.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const scanAreaWidth = Math.min(video.videoWidth * 0.8, 800);
        const scanAreaHeight = scanAreaWidth / 2;
        const x = (video.videoWidth - scanAreaWidth) / 2;
        const y = (video.videoHeight - scanAreaHeight) / 2;

        const imageData = ctx.getImageData(x, y, scanAreaWidth, scanAreaHeight);

        try {
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code) {
            // QRコードを検出したら、3秒待ってからキャプチャを実行
            setScanning(false);
            toast.success("QRコードを検出しました", {
              position: "top-center"
            });

            captureTimeout = setTimeout(() => {
              if (canvas) {
                const captureCanvas = document.createElement('canvas');
                captureCanvas.width = scanAreaWidth;
                captureCanvas.height = scanAreaHeight;
                const captureCtx = captureCanvas.getContext('2d');
                
                if (captureCtx) {
                  captureCtx.drawImage(
                    canvas, 
                    x, y, scanAreaWidth, scanAreaHeight,
                    0, 0, scanAreaWidth, scanAreaHeight
                  );
                  setCapturedImage(captureCanvas.toDataURL("image/png"));
                }
              }
            }, 3000); // 3秒に変更
          }
        } catch (error) {
          console.error("QRコードの検出中にエラーが発生しました:", error);
        }
      }

      animationFrame = requestAnimationFrame(scan);
    };

    scan();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (captureTimeout) {
        clearTimeout(captureTimeout);
      }
    };
  }, [scanning]);

  const handleDownload = () => {
    if (capturedImage) {
      const link = document.createElement("a");
      link.href = capturedImage;
      link.download = "qr-scan.png";
      link.click();
      toast.success("画像を保存しました");
    }
  };

  const handleRetry = async () => {
    setCapturedImage(null);
    setScanning(true);
    await startCamera();
  };

  return (
    <div className="fixed inset-0 bg-black/50">
      {scanning ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <ScanOverlay scanning={scanning} />
        </>
      ) : (
        <div className="relative h-full flex flex-col items-center justify-center bg-black/90">
          {capturedImage && (
            <img 
              src={capturedImage} 
              alt="Captured QR" 
              className="max-w-[80%] h-auto rounded-lg shadow-lg animate-fade-in"
            />
          )}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-50">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="bg-white/10 text-white hover:bg-white/20"
            >
              撮り直す
            </Button>
            <Button
              onClick={handleDownload}
              className="bg-scanner-highlight hover:bg-blue-700"
            >
              ダウンロード
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
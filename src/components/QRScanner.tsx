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

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        toast.error("カメラへのアクセスが拒否されました");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    let animationFrame: number;

    const scan = () => {
      if (!scanning) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video?.readyState === video.HAVE_ENOUGH_DATA && canvas) {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);

        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          setScanning(false);
          setCapturedImage(canvas.toDataURL("image/png"));
          toast.success("QRコードを検出しました");
        } else {
          animationFrame = requestAnimationFrame(scan);
        }
      } else {
        animationFrame = requestAnimationFrame(scan);
      }
    };

    scan();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
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

  return (
    <div className="relative min-h-screen w-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover"
      />
      <canvas ref={canvasRef} className="hidden" />
      <ScanOverlay scanning={scanning} />
      
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        {capturedImage && (
          <Button
            onClick={handleDownload}
            className="animate-fade-in bg-scanner-highlight px-8 py-4 text-white hover:bg-blue-700"
          >
            写真をダウンロード
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
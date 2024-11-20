import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ScanOverlay from "./ScanOverlay";
import { useQRScanner } from "@/hooks/useQRScanner";

const QRScanner = () => {
  const {
    videoRef,
    canvasRef,
    scanning,
    setScanning,
    capturedImage,
    qrDetected,
    countdown
  } = useQRScanner();

  const handleDownload = () => {
    if (capturedImage) {
      const link = document.createElement("a");
      link.href = capturedImage;
      link.download = "qr-scan.png";
      link.click();
      toast.success("画像を保存しました");
    }
  };

  const handleRetry = () => {
    setScanning(true);
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
          <ScanOverlay scanning={!qrDetected} />
          {qrDetected && (
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-white/90 px-6 py-3 rounded-lg text-xl font-bold">
              {countdown}秒後に撮影します
            </div>
          )}
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
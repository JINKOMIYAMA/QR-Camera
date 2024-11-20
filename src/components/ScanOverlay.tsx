import React from "react";

interface ScanOverlayProps {
  scanning: boolean;
}

const ScanOverlay: React.FC<ScanOverlayProps> = ({ scanning }) => {
  return (
    <div className="absolute inset-0 z-10">
      <div className="absolute inset-0 bg-scanner-overlay">
        {/* Transparent scanning window */}
        <div className="absolute left-1/2 top-1/2 h-48 w-72 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border-2 border-scanner-highlight bg-transparent">
          {scanning && (
            <div className="absolute left-0 right-0 h-0.5 w-full animate-scan-line bg-scanner-highlight" />
          )}
          {/* Corner markers */}
          <div className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-scanner-highlight" />
          <div className="absolute right-0 top-0 h-4 w-4 border-r-2 border-t-2 border-scanner-highlight" />
          <div className="absolute bottom-0 left-0 h-4 w-4 border-b-2 border-l-2 border-scanner-highlight" />
          <div className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-scanner-highlight" />
        </div>
      </div>
    </div>
  );
};

export default ScanOverlay;
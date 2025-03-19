import { JSX, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { BARCODE_FORMATS } from "@/lib/constants";

interface BarcodeScannerProps {
  onScan: (data: string) => void;
}

export default function BarcodeScanner({
  onScan,
}: BarcodeScannerProps): JSX.Element {
  const [pause, setPause] = useState(false);

  return (
    <div>
      <Scanner
        formats={BARCODE_FORMATS}
        onScan={(detectedCodes) => {
          if (detectedCodes.length > 0) {
            const scannedData = detectedCodes[0].rawValue;
            setPause(true);
            onScan(scannedData);
          }
        }}
        onError={(error) => {
          console.log(`onError: ${error}'`);
        }}
        styles={{ container: { height: "400px", width: "350px" } }}
        components={{
          audio: true,
          onOff: true,
          torch: true,
          zoom: true,
          finder: true,
        }}
        allowMultiple={true}
        scanDelay={2000}
        paused={pause}
      />
    </div>
  );
}

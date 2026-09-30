import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function TestQrScanPage() {
  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScanSuccess = async (decodedText) => {
    setScanResult(decodedText);
    console.log("QR scanned:", decodedText);

    // TODO: Fetch product by QR id if needed
    // const res = await fetch(`/api/products/by-qr?id=${decodedText}`);
    // const product = await res.json();
    // setProduct(product);
  };

  const startScanner = () => {
    if (scanner) return;

    const newScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: 250 },
      false
    );

    newScanner.render(handleScanSuccess);
    setScanner(newScanner);
    setScanning(true);
  };

  const stopScanner = () => {
    if (!scanner) return;

    scanner.clear().catch(() => {});
    setScanner(null);
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scanner) scanner.clear().catch(() => {});
    };
  }, [scanner]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem",
      padding: "2rem"
    }}>
      <h1>QR Code Product Test Scanner</h1>

      {!scanning && (
        <button
          onClick={startScanner}
          style={{ padding: "10px 16px", borderRadius: 8 }}
        >
          Start Scanner
        </button>
      )}

      {scanning && (
        <button
          onClick={stopScanner}
          style={{ padding: "10px 16px", borderRadius: 8 }}
        >
          Stop Scanner
        </button>
      )}

      <div
        id="qr-reader"
        style={{
          marginTop: "1rem",
          width: 300,
          maxWidth: "100%"
        }}
      />

      {scanResult && (
        <div style={{
          marginTop: "1rem",
          padding: "1rem",
          borderRadius: 12,
          border: "1px solid #ddd",
          maxWidth: 320
        }}>
          <strong>Scanned QR:</strong>
          <div>{scanResult}</div>

          {/* Placeholder for product preview */}
          {/* Show product info here later */}
        </div>
      )}
    </div>
  );
}

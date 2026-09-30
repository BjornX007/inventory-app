import { useState } from "react";

export default function GenerateQrPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [qrImage, setQrImage] = useState(null);
  const [selected, setSelected] = useState(null);

  const searchProducts = async () => {
    const res = await fetch(`/api/products/search?q=${query}`);
    const data = await res.json();
    setResults(data.products || []);
  };

  const assignQr = async (productId) => {
    const res = await fetch("/api/products/assign-qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId })
    });

    const data = await res.json();

    setSelected(data.product);
    setQrImage(data.qrImage);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Assign QR to Product</h2>

      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search name or code"
        style={{ padding: 8, width: 260 }}
      />

      <button onClick={searchProducts} style={{ marginLeft: 8 }}>
        Search
      </button>

      <ul>
        {results.map(p => (
          <li key={p._id}>
            {p.product_name} ({p.code})
            <button onClick={() => assignQr(p._id)} style={{ marginLeft: 8 }}>
              Generate QR
            </button>
          </li>
        ))}
      </ul>

      {qrImage && (
        <div style={{ marginTop: 24 }}>
          <h3>QR Assigned</h3>

          <img src={qrImage} width={180} />
          <br />
          <button onClick={() => window.print()}>
            Print QR
          </button>
        </div>
      )}
    </div>
  );
}

export default function Snackbar({ open, message, type }) {
  if (!open) return null;

  return (
    <div className={`
      fixed top-6 left-1/2 -translate-x-1/2 z-50
      px-5 py-3 rounded-xl shadow-lg text-sm
      ${type === "success" ? "bg-green-600" : "bg-red-600"} text-white
    `}>
      {message}
    </div>
  );
}

export default function MetaSection({ person, setPerson, note, setNote }) {
  return (
    <div
      className="
        grid grid-cols-1 md:grid-cols-2 gap-3
       
         border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-900
      
      "
    >
      {/* Responsible person */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
          Responsible person
        </label>
        <input
          value={person}
          onChange={(e) => setPerson(e.target.value)}
          placeholder="John Doe"
          className="
            w-full
            rounded-md
            border border-gray-300 dark:border-gray-600
            bg-gray-50 dark:bg-gray-800
            px-2 py-1.5
            text-[13px]
            focus:outline-none focus:ring-1 focus:ring-blue-500
          "
        />
      </div>

      {/* Note */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
          Message / Note
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note…"
          className="
            w-full
            rounded-md
            border border-gray-300 dark:border-gray-600
            bg-gray-50 dark:bg-gray-800
            px-2 py-1.5
            text-[13px]
            focus:outline-none focus:ring-1 focus:ring-blue-500
          "
        />
      </div>
    </div>
  );
}

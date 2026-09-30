export default function WarehouseSection(props) {

  const {
    movementType,
    warehouses,
    sourceMode, setSourceMode,
    destMode, setDestMode,
    sourceWarehouse, setSourceWarehouse,
    destWarehouse, setDestWarehouse,
    sourceText, setSourceText,
    destText, setDestText,
  } = props;

  const renderOptions = () =>
    warehouses.map(w => (
      <option key={w._id} value={w._id}>{w.name}</option>
    ));

  return (
    <div
      className="
        grid grid-cols-1 md:grid-cols-2 gap-3
        rounded-lg
         dark:border-gray-700
        bg-white dark:bg-gray-900
        
      "
    >

      {/* FROM */}
      <div>
        <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
          From
        </label>

        <div className="mt-1 flex gap-2">
          {movementType === "OUT" ? (
            <select
              value={sourceWarehouse}
              onChange={e=>setSourceWarehouse(e.target.value)}
              className="
                w-full
                rounded-md border border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800
                px-2 py-1.5 text-[13px]
              "
            >
              <option value="">Select warehouse…</option>
              {renderOptions()}
            </select>
          ) : (
            <>
              <select
                value={sourceMode}
                onChange={e=>setSourceMode(e.target.value)}
                className="
                  w-32
                  rounded-md border border-gray-300 dark:border-gray-600
                  bg-gray-50 dark:bg-gray-800
                  px-2 py-1.5 text-[13px]
                "
              >
                <option value="warehouse">Warehouse</option>
                <option value="client">External</option>
              </select>

              {sourceMode === "warehouse" ? (
                <select
                  value={sourceWarehouse}
                  onChange={e=>setSourceWarehouse(e.target.value)}
                  className="
                    flex-1 rounded-md border
                    border-gray-300 dark:border-gray-600
                    bg-gray-50 dark:bg-gray-800
                    px-2 py-1.5 text-[13px]
                  "
                >
                  <option value="">Select warehouse…</option>
                  {renderOptions()}
                </select>
              ) : (
                <input
                  value={sourceText}
                  onChange={e=>setSourceText(e.target.value)}
                  className="
                    flex-1 rounded-md border
                    border-gray-300 dark:border-gray-600
                    bg-gray-50 dark:bg-gray-800
                    px-2 py-1.5 text-[13px]
                  "
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* TO */}
      <div>
        <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
          To
        </label>

        <div className="mt-1 flex gap-2">
          {movementType === "IN" ? (
            <select
              value={destWarehouse}
              onChange={e=>setDestWarehouse(e.target.value)}
              className="
                w-full
                rounded-md border border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800
                px-2 py-1.5 text-[13px]
              "
            >
              <option value="">Select warehouse…</option>
              {renderOptions()}
            </select>
          ) : (
            <>
              <select
                value={destMode}
                onChange={e=>setDestMode(e.target.value)}
                className="
                  w-32
                  rounded-md border border-gray-300 dark:border-gray-600
                  bg-gray-50 dark:bg-gray-800
                  px-2 py-1.5 text-[13px]
                "
              >
                <option value="warehouse">Warehouse</option>
                <option value="client">External</option>
              </select>

              {destMode === "warehouse" ? (
                <select
                  value={destWarehouse}
                  onChange={e=>setDestWarehouse(e.target.value)}
                  className="
                    flex-1 rounded-md border
                    border-gray-300 dark:border-gray-600
                    bg-gray-50 dark:bg-gray-800
                    px-2 py-1.5 text-[13px]
                  "
                >
                  <option value="">Select warehouse…</option>
                  {renderOptions()}
                </select>
              ) : (
                <input
                  value={destText}
                  onChange={e=>setDestText(e.target.value)}
                  className="
                    flex-1 rounded-md border
                    border-gray-300 dark:border-gray-600
                    bg-gray-50 dark:bg-gray-800
                    px-2 py-1.5 text-[13px]
                  "
                />
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}

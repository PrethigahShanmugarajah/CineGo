const PersonGrid = ({ list = [], roleLabel = "" }) => {
  if (!list || list.length === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
        <div className="font-bold text-white text-lg">{roleLabel}</div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {list.map((p, i) => (
          <div key={i} className="shrink-0 text-center group cursor-pointer">
            <div className="relative">
              <img
                src={p.preview || p.file || p.image || p.url || ""}
                alt={p.name || `${roleLabel}-${i}`}
                className="w-20 h-20 object-cover rounded-2xl mb-3 mx-auto border-2 border-gray-600 group-hover:border-purple-500 transition-all duration-300 group-hover:scale-105"
              />
            </div>

            <div className="font-semibold text-sm text-white truncate max-w-25 mx-auto">
              {p.name || "-"}
            </div>

            {p.role && p.role !== roleLabel && (
              <div className="text-gray-400 text-xs mt-1 px-2 py-1 bg-gray-700/50 rounded-full">
                {p.role}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonGrid;

import { X } from "lucide-react";

const Uploader = ({ title, onFiles, items, remove, icon, updateMeta }) => {
  return (
    <div className="border border-dashed border-purple-700 rounded-lg p-3 bg-black/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}

          <h4 className="font-semibold">{title}</h4>
        </div>

        <label className="text-xs px-3 py-1 bg-purple-700 rounded-full cursor-pointer">
          + Add
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onFiles}
            className="hidden"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {items && items.length ? (
          items.map((it, idx) => (
            <div key={idx} className="relative bg-black/30 p-2 rounded-md">
              <img
                src={it.preview}
                alt="Preview"
                className="w-full h-36 sm:h-40 md:h-28 object-contain rounded-md"
              />

              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute -top-1 -right-2 bg-purple-700 p-1 rounded-full"
              >
                <X className="absolute -top-1 -right-2 bg-purple-700 p-1 rounded-full" />
              </button>

              {typeof it.name !== "undefined" && (
                <div className="mt-2">
                  <input
                    value={it.name}
                    onChange={(e) =>
                      updateMeta && updateMeta(idx, "name", e.target.value)
                    }
                    placeholder="Name"
                    className="w-full rounded-md p-1 text-sm bg-black/10 border border-gray-700"
                  />
                </div>
              )}

              {typeof it.name !== "undefined" && (
                <div className="mt-2">
                  <input
                    value={it.role || ""}
                    onChange={(e) =>
                      updateMeta && updateMeta(idx, "role", e.target.value)
                    }
                    placeholder="Role"
                    className="w-full rounded-md p-1 text-sm bg-black/10 border border-gray-700"
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-1 sm:col-span-2 md:col-span-3 text-sm opacity-80">
            No Images Added
          </div>
        )}
      </div>
    </div>
  );
};

export default Uploader;

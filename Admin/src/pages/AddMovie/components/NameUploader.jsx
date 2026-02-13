import { X } from "lucide-react";

const NameUploader = ({ title, onFiles, items, remove, updateName, icon }) => {
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

      <div className="grid grid-cols-1 gap-3">
        {items && items.length ? (
          items.map((it, idx) => (
            <div
              key={idx}
              className="relative flex gap-2 items-center bg-black/30 p-2 rounded-md"
            >
              <img
                src={it.preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-md"
              />

              <div className="flex-1">
                <input
                  value={it.name}
                  onChange={(e) => updateName(idx, e.target.value)}
                  placeholder="Name"
                  className="w-full rounded-lg p-2 bg-black/20 border border-gray-700 mb-2"
                />

                <div className="text-xs opacity-80 break-all max-w-full">
                  File: {it?.file?.name}
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute top-0 -right-1 bg-purple-700 p-1 rounded-full"
              >
                <X className="size-4" />
              </button>
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

export default NameUploader;

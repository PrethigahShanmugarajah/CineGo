import { X } from "lucide-react";
import { ClipLoader } from "react-spinners";

const DeletePopup = ({ onClose, onDelete, loading }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-96 relative shadow-lg text-white">
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="text-center mt-4">
          <h4 className="mb-2 text-lg font-semibold text-purple-600">
            Are you sure?
          </h4>
          <p className="text-gray-200 text-sm">
            Do you really want to delete this movie? <br />
            This action cannot be undone.
          </p>

          <div className="flex justify-center mt-5 gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={onDelete}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition cursor-pointer flex items-center justify-center min-w-22.5"
            >
              {loading ? <ClipLoader size={18} color="#FFFFFF" /> : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeletePopup;

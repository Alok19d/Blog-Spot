import { useState } from "react";
import { useDispatch } from "react-redux";
import { signoutSuccess } from "../redux/features/userSlice";
import { Info } from "lucide-react";
import axios from "axios";
import { toast } from 'react-toastify';

interface DeleteAccountPopupProps {
  toast: typeof toast;
  onClose: () => void;
}

export default function DeleteAccountPopup({toast, onClose}: DeleteAccountPopupProps) {
  
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  async function handleDeleteAccount(){
    setLoading(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/user/delete`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log(response.data.message);
      localStorage.removeItem('token');
      dispatch(signoutSuccess());
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while deleting the account."
      );
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-[rgba(230,228,228,0.15)] backdrop-blur-[3px] flex items-center justify-center z-20">
      <div className="p-6 bg-white flex flex-col items-center text-center border rounded shadow-lg w-full max-w-sm">
        <Info className="text-muted-foreground mb-6" size={40} />
        <p className="mb-4 text-muted-foreground">Are you sure you want to delete your account?</p>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded bg-red-600 hover:opacity-70 text-white font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleDeleteAccount}
            disabled={loading}
            type="button"
          >
            {loading ? "Deleting..." : "Yes, I'm sure"}
          </button>
          <button
            className="px-4 py-2 rounded border text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            disabled={loading}
            type="button"
          >
            No, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

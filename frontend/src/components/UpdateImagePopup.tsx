import { useState } from "react";
import { useDispatch } from "react-redux";
import { Info } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { toast } from 'react-toastify';
import { updateSuccess } from "../redux/features/userSlice";

interface UpdateImagePopupProps {
  toast: typeof toast;
  onClose: () => void;
}

export default function UpdateImagePopup({ toast, onClose }: UpdateImagePopupProps) {

  const dispatch = useDispatch();

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageURL, setProfileImageURL] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>){
    const files = e.target.files;
    if (files && files.length > 0) {
      setError('');
      setProfileImage(files[0]);

      const url = URL.createObjectURL(files[0]);
      setProfileImageURL(url);
    }
  }

  function handleImageDrop(e: React.DragEvent<HTMLDivElement>){
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setError('');
      setProfileImage(files[0]);

      const url = URL.createObjectURL(files[0]);
      setProfileImageURL(url);
    }
  }

  async function handleImageUpload(){
    if(!profileImage){
      setError('Profile Image is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('profileImg', profileImage);
  
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/user/update-avatar`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      console.log(response.data.message);
      toast.success(response.data.message);
      dispatch(updateSuccess(response.data.data.user));
      onClose();
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while updating profile image."
      );
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-[rgba(230,228,228,0.15)] backdrop-blur-[3px]  flex items-center justify-center z-20">
      <div className="p-6 bg-white  border rounded">
        <h1 className="text-xl font-bold">Profile Image</h1>
        <div className="w-100 my-3 text-center ">
          {
            profileImageURL ?
            <div>
              <img className="object-cover aspect-square" src={profileImageURL}/>
            </div>
            :
            <div 
              className="w-full h-full aspect-3/2 flex flex-col items-center justify-center  text-muted-foreground border-2 border-dashed rounded-md"
              onClick={() => document.getElementById('cover-image-input')?.click()}
              onDrop={handleImageDrop}
              onDragOver={e => e.preventDefault()}
            >
              <FontAwesomeIcon className="text-5xl" icon={faImage} />
              <p className="text-sm">
                <u>Click to upload</u> or drag and drop
              </p>
              <p className="text-sm">Maximum file size 2MB.</p>
              <input
                id="cover-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
            </div>
            
          }
        </div>

        {
          error &&
          <p className="flex items-center gap-1 text-xs text-red-600">
            <Info size={12}/>
            {error}
          </p>
        }

        <div className="pt-4 space-y-2">
          <button 
            className="w-full py-1 btn-1 rounded-md hover:opacity-70 disabled:opacity-70 disabled:cursor-not-allowed" 
            onClick={handleImageUpload}
            disabled={loading}
          >
            Upload Image
          </button>
          <button className="w-full py-1 bg-red-700 text-white font-medium rounded-md hover:opacity-70" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

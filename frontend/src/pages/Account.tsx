import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import { Camera, Eye, EyeOff, Info, Lock, Save, Trash2 } from "lucide-react";
import { updateSuccess } from "../redux/features/userSlice";
import UpdateImagePopup from "../components/UpdateImagePopup";
import DeleteAccountPopup from "../components/DeleteAccountPopup"; 

interface IUpdateProfile {
  firstname?: string;
  lastname?: string;
  email?: string;
  bio?: string;
  website?: string;
  twitter?: string;
  github?: string;
  location?: string;
}

interface IPassword {
  current: string;
  new: string;
  confirm: string;
}

interface IShowPassword {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface ILoading {
  profileUpdate?: boolean;
  passwordUpdate?: boolean;
}

interface IError {
  profileUpdate?: string;
  passwordUpdate?: string;
}

export default function Account() {

  const dispatch = useDispatch();
  const { profile } = useSelector(state => state.user);
  
  const [showUpdateImagePopup, setShowUpdateImagePopup] = useState(false); 
  const [profileData, setProfileData] = useState<IUpdateProfile>({});
  const [passwordData, setPasswordData] = useState<IPassword>({
    current: "",
    new: "",
    confirm: ""
  });
  const [showPassword, setShowPassword] = useState<IShowPassword>({
    current: false,
    new: false,
    confirm: false,
  });
  const [showDeleteAccountPopup, setShowDeleteAccountPopup] = useState(false);
  const [loading, setLoading] = useState<ILoading>({});
  const [error, setError] = useState<IError>({});

  async function handleUpdateProfile(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();

    if (Object.keys(profileData).length === 0) {
      return;
    }
    
    if(profileData?.firstname && profileData.firstname.length < 3){
      setError((curr) => ({ ...curr, profileUpdate: 'First Name must be atleast 3 characters long' }));
      return;
    }

    setError((curr) => ({ ...curr, profileUpdate: '' }));
    setLoading((curr) => ({ ...curr, profileUpdate: true }));
    
    /* Making API Call */
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/user/update-profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setProfileData({});
      toast.success(response.data.message);
      dispatch(updateSuccess(response.data.data.user));
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while updating the profile."
      );
    }
    setLoading((curr) => ({ ...curr, profileUpdate: false }));
  }

  async function handleUpdatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if(passwordData.current.length < 6){
      setError((curr) => ({ ...curr, passwordUpdate: 'Current Password must be atleast 6 characters long' }));
      return;
    }

    if(passwordData.new.length < 6){
      setError((curr) => ({ ...curr, passwordUpdate: 'New Password must be atleast 6 characters long' }));
      return;
    }

    if(passwordData.new !== passwordData.confirm){
      setError((curr) => ({ ...curr, passwordUpdate: 'New Password and Confirm Password must be same' }));
      return;
    }

    setError((curr) => ({ ...curr, passwordUpdate: '' }));
    setLoading((curr) => ({ ...curr, passwordUpdate: true }));

    /* Making API Call */
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BASE_URL}/user/update-password`,
        {
          password: passwordData.current,
          newPassword: passwordData.new
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      setPasswordData({
        current: "",
        new: "",
        confirm: "",
      });
      toast.success(response.data.message);
    } catch (error) {
      console.log(error);
      toast.error(
        (axios.isAxiosError(error) && error.response?.data?.message) ||
        "An error occurred while updating the password."
      );
    }
    setLoading((curr) => ({ ...curr, passwordUpdate: false }));
  }

  return (
    <main>
      <section className="mb-20">
        <div className="py-8 px-4 container">
          <div className="p-6 mb-8 flex flex-col md:flex-row items-center text-center md:text-left space-y-4 md:space-y-0 md:space-x-6 border rounded">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full">
                {
                  profile.profileImg 
                  ?
                  <img className="w-full h-full object-cover rounded-full" src={profile.profileImg}/>
                  :
                  <span className="w-full aspect-square flex items-center justify-center text-white text-5xl font-bold capitalize bg-gray-600">
                    {profile.fullname.firstname[0]}
                  </span>
                }
              </div>
              <label 
                className="h-8 w-8 absolute -bottom-2 -right-2 inline-flex items-center justify-center border rounded-full hover:bg-muted"
                onClick={() => {setShowUpdateImagePopup(true)}}
              >
                <Camera size={18} />
              </label>
            </div>
            <div className="flex-1">
              <h1 className="capitalize text-2xl font-bold">{profile?.fullname?.firstname} {profile?.fullname?.lastname}</h1>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
            <div className="md:text-right">
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">
                {
                  new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long'}).format(new Date(profile.createdAt))
                }
              </p>
            </div>
          </div>

          <div className="space-y-6">
            
            {/* Personal Information */}
            <div className="p-6 border rounded">
              <h2 className="text-2xl font-semibold">Personal Information</h2>
              <p className="text-muted-foreground">Update your personal details and public profile information.</p>

              <form className="mt-6 space-y-6" onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">First Name</label>
                    <input 
                      name="firstname"
                      className="w-full py-2 px-3 text-sm border rounded-md"
                      type="text" 
                      value={profileData.firstname ?? profile?.fullname?.firstname ?? ""}
                      onChange={(e) => setProfileData({ ...profileData, firstname: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Last Name</label>
                    <input 
                      name="lastname"
                      className="w-full py-2 px-3 text-sm border rounded-md"
                      type="text"
                      value={profileData.lastname ?? profile?.fullname?.lastname ?? ""} 
                      onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input 
                    name="email"
                    className="w-full py-2 px-3 text-sm border rounded-md"
                    type="email"
                    value={profileData.email ?? profile.email ?? ""}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea 
                    name="bio"
                    className="w-full py-2 px-3 text-sm border rounded-md"
                    value={profileData.bio ?? profile.bio ?? ""}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <input 
                      name="website"
                      className="w-full py-2 px-3 text-sm border rounded-md"
                      type="text" 
                      value={profileData.website ?? profile.website ?? ""}
                      onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <input 
                      name="location"
                      className="w-full py-2 px-3 text-sm border rounded-md"
                      type="text" 
                      value={profileData.location ?? profile.location ?? ""}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Twitter</label>
                    <input 
                      name="twitter"
                      className="w-full py-2 px-3 text-sm border rounded-md"
                      type="text" 
                      value={profileData.twitter ?? profile.twitter ?? ""}
                      onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">GitHub</label>
                    <input 
                      name="github"
                      className="w-full py-2 px-3 text-sm border rounded-md"
                      type="text"
                      value={profileData.github ?? profile.github ?? ""} 
                      onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                    />
                  </div>
                </div>

                {
                  error.profileUpdate &&
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <Info size={12}/>
                    {error.profileUpdate}
                  </p>
                }

                <button type="submit" className="px-3 py-1 btn-1 flex items-center gap-2 rounded disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading.profileUpdate}>
                  <Save size={18} />
                  <span>Save Changes</span>
                </button>
              </form>
            </div>
            
            {/* Change Password */}
            <div className="p-6 border rounded">
              <h2 className="text-2xl font-semibold">Change Password</h2>
              <p className="text-muted-foreground">Update your password to keep your account secure.</p>

              <form onSubmit={handleUpdatePassword} className="mt-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <div className="relative">
                    <input 
                      name="password"
                      value={passwordData.current}
                      className="w-full py-2 px-3 text-sm border rounded-md"
                      type={showPassword.current ?"text" : "password"} 
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                      autoComplete="false"
                      required
                    />
                    <span 
                      className="absolute right-3 bottom-2 text-sm"
                      onClick={() => {setShowPassword((curr) => ({ ...curr, current: !showPassword.current}))}}
                    >
                      {showPassword.current ? <Eye size={18} /> : <EyeOff size={18} />}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <input 
                      name="newpassword"
                      value={passwordData.new}
                      className="w-full py-2 px-3 text-sm border rounded-md"
                      type={showPassword.new ?"text" : "password"} 
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                      autoComplete="false"
                      required
                    />
                    <span 
                      className="absolute right-3 bottom-2 text-sm"
                      onClick={() => {setShowPassword((curr) => ({ ...curr, new: !showPassword.new}))}}
                    >
                      
                      {showPassword.new ? <Eye size={18} /> : <EyeOff size={18} />}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <div className="relative">
                    <input 
                      name="comfirmpassword"
                      value={passwordData.confirm}
                      className="w-full py-2 px-3 text-sm border rounded-md"
                      type={showPassword.confirm ?"text" : "password"} 
                      onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                      autoComplete="false"
                      required
                    />
                    <span 
                      className="absolute right-3 bottom-2 text-sm"
                      onClick={() => {setShowPassword((curr) => ({ ...curr, confirm: !showPassword.confirm}))}}
                    >
                      {showPassword.confirm ? <Eye size={18} /> : <EyeOff size={18} />}
                    </span>
                  </div>
                </div>
                
                {
                  error.passwordUpdate &&
                  <p className="flex items-center gap-1 text-xs text-red-600">
                    <Info size={12}/>
                    {error.passwordUpdate}
                  </p>
                }

                <button type="submit" className="px-3 py-1 btn-1 flex items-center gap-2 rounded disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading.passwordUpdate}>
                  
                  <Lock size={18} />
                  <span>Update Password</span>
                </button>
              </form>
            </div>

            {/* Delete Account */}
            <div className="p-6 border rounded">
              <h2 className="text-2xl font-semibold text-red-600">Danger Zone</h2>
              <p className="text-muted-foreground">Irreversible actions that affect your account</p>
              
              <div className="mt-6 flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-600">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permenantely delete your account and all associated data</p>
                </div>
                <div>
                  <button 
                    className="px-3 py-1 bg-red-600 text-white flex items-center gap-2 rounded" 
                    onClick={() => {setShowDeleteAccountPopup(true)}} 
                  >
                    <Trash2 size={18} />
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {
        showUpdateImagePopup &&
        <UpdateImagePopup toast={toast} onClose={() => setShowUpdateImagePopup(false)} />
      }
      {
        showDeleteAccountPopup &&
        <DeleteAccountPopup toast={toast} onClose={() => setShowDeleteAccountPopup(false)} />
      }
      <ToastContainer />
    </main>
  )
}

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from 'axios'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons"
import { useSelector, useDispatch } from "react-redux"
import { signInStart, signInSuccess, signInFailure } from "../redux/features/userSlice"
import OAuth from "../components/OAuth"

export default function Signin(){

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: undefined,
    password: undefined
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { loading, errorMessage } = useSelector(state => state.user);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>){
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();
    if(!formData.email){
      dispatch(signInFailure('Email Address is required'))
      return;
    }

    if(!formData.password){
      dispatch(signInFailure('Password is required'));
      return;
    }

    const pL = formData.password?.length;
    if(pL < 6 || pL > 50){
      dispatch(signInFailure('Password must be between 6 and 50 characters long'))
      return;
    }

    const validPassword = (/^[^\s]{6,50}$/).test(formData.password);
    
    if(!validPassword){
      dispatch(signInFailure('Password must not contain spaces'))
      return;
    }

    dispatch(signInStart());

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/signin`,
        {
          email: formData.email,
          password: formData.password
        }
      );
      localStorage.setItem('token',response.data.data.token);
      dispatch(signInSuccess(response.data.data.user));
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.response.data.message));
      console.log(error.response.data.message);
    }
  }

  return (
    <main>
      <div className="min-h-screen flex justify-center">
        <div className="w-full max-w-md h-fit px-8 py-8 mt-12 border rounded-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input 
                name="email"
                type="email" 
                className="w-full py-2 px-3 text-sm border rounded-md"
                placeholder="Enter your email"
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input 
                  name="password"
                  type={isPasswordVisible ?"text" : "password"} 
                  className="w-full py-2 px-3 text-sm border rounded-md"
                  placeholder="Enter your password"
                  onChange={handleInputChange}
                  autoComplete="true"
                  required
                />
                <span 
                  className="absolute right-3 bottom-2 text-sm"
                  onClick={() => {setIsPasswordVisible(curr => !curr)}}
                >
                  <FontAwesomeIcon icon={isPasswordVisible ? faEye : faEyeSlash} />
                </span>
              </div>
            </div>

            <p className="text-right text-sm cursor-pointer">
              Forgot Password?
            </p>

            <p className="text-xs text-red-500">{errorMessage}</p>

            <button 
              type="submit" 
              className={`btn btn-1 w-full mb-3 space-x-2 rounded ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={loading}
            >
              {
                loading &&
                <FontAwesomeIcon icon={faSpinner} spin />
              }
              <span>Sign In</span>
            </button>
          </form>
          <OAuth />
          <p className="mt-2 text-center text-muted-foreground text-sm">
            Don't have an account? <Link className="cursor-pointer" to='/signup'>Sign Up</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

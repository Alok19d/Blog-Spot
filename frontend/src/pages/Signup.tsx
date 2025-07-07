import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from 'axios'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSpinner } from "@fortawesome/free-solid-svg-icons"
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons"
import OAuth from "../components/OAuth"

export default function Signup(){
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstname: undefined,
    lastname: undefined,
    email: undefined,
    password: undefined
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>){
    setFormData({...formData, [e.target.name]: e.target.value});
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>){
    e.preventDefault();

    if(!formData.firstname){
      setError('First Name is required')
      return;
    }

    if(!formData.email){
      setError('Email Address is required')
      return;
    }

    if(!formData.password){
      setError('Password is required');
      return;
    }

    const pL = formData.password?.length;
    if(pL < 6 || pL > 50){
      setError('Password must be between 6 and 50 characters long')
      return;
    }

    const validPassword = (/^[^\s]{6,50}$/).test(formData.password);
    
    if(!validPassword){
      setError('Password must not contain spaces');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/signup`,
        {
          firstname: formData.firstname,
          lastname: formData?.lastname,
          email: formData.email,
          password: formData.password
        }
      );
      console.log(response.data.message);
      navigate('/signin');
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  return (
    <main>
      <div className="min-h-screen flex justify-center">
        <div className="w-full max-w-md h-fit px-8 py-8 mt-12 border shadow-md rounded-md">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="text-muted-foreground mt-2">Join our community of writers and readers</p>
          </div>
          <form onSubmit={handleSubmit} className="py-4 space-y-4">
            <div className="flex gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input 
                  name="firstname"
                  type="text" 
                  className="w-full py-2 px-3 text-sm border rounded-md"
                  placeholder="First Name"
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input 
                  name="lastname"
                  type="text" 
                  className="w-full py-2 px-3 text-sm border rounded-md"
                  placeholder="Last Name"
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
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
                  autoComplete="false"
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
            
            <p className="text-xs text-red-500">{error}</p>

            <button 
              type="submit" 
              className={`btn btn-1 w-full mb-3 space-x-2 rounded ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={loading}
            >
              {
                loading &&
                <FontAwesomeIcon icon={faSpinner} spin />
              }
              <span>Sign Up</span>
            </button>
          </form>
          <OAuth />
          <p className="mt-2 text-center text-muted-foreground text-sm">
            Already have an account? <Link to='/signin' className="cursor-pointer">Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

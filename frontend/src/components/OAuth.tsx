import { app } from '../firebase'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { signInStart, signInSuccess, signInFailure } from '../redux/features/userSlice'

export default function OAuth() {
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const auth = getAuth(app);

  async function handleGoogleAuth(){
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({prompt: 'select_account'});

    try{
      dispatch(signInStart());

      const responseFromGoogle = await signInWithPopup(auth, provider);
      
      let fullname:any = responseFromGoogle.user.displayName;

      if(!fullname){
        return;
      }

      fullname = fullname.split(' ');
      const lastname = fullname.pop();
      const firstname = fullname.join(' ');

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/user/google`,
        {
          firstname,
          lastname,
          email: responseFromGoogle.user.email,
          profileImg: responseFromGoogle.user.photoURL,
        }
      );
      localStorage.setItem('token',response.data.data.token);
      dispatch(signInSuccess(response.data.data.user));
      navigate('/');
    } catch(error) {
      console.log(error);
    }
  }

  return (
    <button 
      className="w-full btn btn-2 space-x-2 cursor-pointer rounded"
      onClick={handleGoogleAuth}
    >
      <FontAwesomeIcon icon={faGoogle} />
      <span>Continue with google</span>
    </button>
  )
}

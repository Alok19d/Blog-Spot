import { useState } from "react";
import { Link } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux";
import { LayoutDashboard, LogOut, Menu, Search, UserRound } from "lucide-react";
import { signoutSuccess } from "../redux/features/userSlice";

export default function Navbar (){
  
  const dispatch = useDispatch();

  const [menuOpen,setMenuOpen] = useState(false);
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const {profile} = useSelector(state => state.user);

  async function handleSearchBarOpen(){
    if(!searchBarOpen){
      setSearchBarOpen(curr => !curr);
      return;
    }

    if(searchInput !== ''){
      // Do Something
    }
    setSearchInput('');
    setSearchBarOpen(false);
  }

  async function handleLogout(){
    localStorage.removeItem('token');
    dispatch(signoutSuccess());
  }

  return (
    <nav className="shadow-sm">
      <div className="container relative py-3 flex items-center justify-between">
        <div>
          <Link to='/' className="text-xl font-bold">
            BlogSpot
          </Link>
        </div>

        <div className="hidden sm:flex gap-8 ">
          <Link to="/" className="text-foreground hover:text-black">Technology</Link>
          <Link to="/" className="text-foreground hover:text-black">Design</Link>
          <Link to="/" className="text-foreground hover:text-black">Business</Link>
          <Link to="/" className="text-foreground hover:text-black">Culture</Link>
        </div>
        
        <div className="flex items-center">
          <div className="relative mr-4 flex items-center gap-2">
            <button 
              className={`px-2 py-1 ${searchBarOpen ? 'absolute right-0 border-l' : ''} hover:bg-gray-100`}
              onClick={handleSearchBarOpen}
            >
              <Search size={18} />
            </button>
            {
              searchBarOpen &&
              <input 
                type="text"
                className="py-1 px-3 border rounded" 
                value={searchInput}
                onChange={(e) => {setSearchInput(e.target.value)}}
              />
            }
          </div>
          <div className="hidden sm:flex items-center">
            {
              profile ?
                <button 
                  className="h-6 w-6 ml-2 relative group"
                >
                  {
                    profile.profileImg 
                    ?
                    <img className="w-full h-full object-cover rounded-full" src={profile.profileImg} alt='profile-img' />
                    :
                    <span className="w-full aspect-square flex items-center justify-center text-sm text-white font-bold capitalize bg-gray-700 rounded-full">{profile.fullname.firstname[0]}</span>
                  }
                  <div className="mt-2 absolute top-full right-0 bg-white border border-black rounded hidden group-focus:block">
                    <Link 
                      to='/account' 
                      className="py-1 px-3 space-x-2 flex items-center border-b"
                      onMouseDown={(e) => {e.preventDefault()}}
                    >
                      <UserRound size={18} />
                      <span>Account</span>
                    </Link>
                    <Link 
                      to='/dashboard' 
                      className="py-1 px-3 space-x-2 flex items-center border-b"
                      onMouseDown={(e) => {e.preventDefault()}}
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>
                    <p 
                      className="py-1 px-3 space-x-2 flex items-center border-b"
                      onClick={handleLogout}
                      onMouseDown={(e) => {e.preventDefault()}}  
                    >
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </p>
                  </div>
                </button>
              :
              <Link to='/signup' className="px-3 py-1 btn-1 rounded">
                Get Started
              </Link>
            }
          </div>
          <div className="sm:hidden">
            <div
              className="px-2 py-1"
              onClick={() => {setMenuOpen(curr => !curr)}}  
            >
              <Menu />
            </div>
            {
              menuOpen &&
              <div className="w-full p-6 absolute top-full left-0 bg-white border">
                <p>Technology</p>
                <p>Design</p>
                <p>Business</p>
                <p>Culture</p>

                {
                  profile ?
                  <div className="mt-4">
                    <p>Account</p>
                    <p>Dashboard</p>
                    <p>Logout</p>
                  </div>
                  :
                  <div>
                    Get Started
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </nav>
  )
}

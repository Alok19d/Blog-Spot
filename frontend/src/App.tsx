import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Signin from './pages/Signin';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Account from './pages/Account';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import Blog from './pages/Blog';
import UpdatePost from './pages/UpdatePost';
import Preview from './pages/Preview';
import Search from './pages/Search';
import Room from './pages/Room';

export default function App(){
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route element={<ProtectedRoute />}>
          <Route path='/account' element={<Account />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/new-post' element={<CreatePost />} />
          <Route path='/update-post/:postId' element={<UpdatePost />} />
        </Route>
        <Route path='/preview/:postId' element={<Preview />} />
        <Route path='/blog/:postSlug' element={<Blog />} />
        <Route path='/search' element={<Search />} />
        <Route path='/room/:roomId' element={<Room />} />
      </Routes>
      <Footer />
    </>
  )
}
import './App.css'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import Layout from './pages/Layout'
import ShowPosts from './pages/ShowPosts'
import ProfilePage from './pages/ProfilePage'
import ExplorePage from './pages/ExplorePage'
import SavedPage from './pages/SavedPage'
import FriendsPage from './pages/FriendsPage'
import PostPost from './pages/PostPost'

function App() {

  return (
    <>
      <div className = ' bg-black text-white'>
          <Routes>
            <Route index path = '/' element = {<LoginPage />} />
            <Route path = '/' element = {<Layout />} >               
              <Route path = 'home' element = {<ShowPosts />} />  
              <Route path = 'profile' element = {<ProfilePage />} />
              <Route path = 'explore' element = {<ExplorePage />} />
              <Route path = 'saved' element = {<SavedPage />} />
              <Route path = 'friends' element = {<FriendsPage />} />
              <Route path = 'post/:id' element = {<PostPost />} />
            </Route>
          </Routes>
      </div>
    </>
  )
}

export default App
import React, { useEffect, useState } from 'react'
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom'


// Backend URL
const backendURL = 'http://localhost:4000'

const Layout = () => {
    // flag for logout and navigate to the login page 
    const [ logout, setLogout ] = useState(false);
    // flag for check user is login if not navigate to the login page
    const [ checkLogin, setCheckLogin ] = useState(false);
    // hover display card for showing profile card
    const [ displayProfile, setDisplayProfile ] = useState(false);
    // set profile image
    const [ profileImage, setProfileImage ] = useState('');
    // set suggestFriends
    const [ suggestFriends, setSuggestFriends ] = useState('');

    useEffect(() => {        
        // checking user is login and getting profileimage and suggestfriends
        const CheckLogin = async() => {
            try {
                const data = await fetch('http://localhost:4000/check-login', {
                    method : "POST",
                    credentials : 'include'
                })                
                if(!data.ok) {               
                    setCheckLogin(true)
                }
                else {
                    let result = await data.json()
                    setCheckLogin(false); 
                    setProfileImage(result.result[0])
                    setSuggestFriends(result.friendsResult)                    
                }
            }
            catch(e) {
                console.log(e)
            }
        }
        CheckLogin();
    }, [])

    // Handle Logout it will clear jwt token from the cookie
    const HandleLogout = async() => {
        try {
            const data = await fetch('http://localhost:4000/logout', {
                method : "POST",
                credentials : "include"
            })            
            if(data.ok) {
                setLogout(true)
            }
            else {                
                setLogout(true);                
            }
        }
        catch(e) {
            console.log(e);
        }
    }

    if(checkLogin) return <Navigate to={'/'} />
    if(logout) return <Navigate to = {'/'}/>


  return (
    <div>
        <Link to={'/home'}>        
            <header className = 'w-full bg-neutral-950 py-4 px-6 sticky top-0 z-10'>    
                <img src="/thunder(2)edited.png" alt="" width = "150px" style={{ }}/>
            </header>
        </Link>
        <div className = 'flex justify-between '>
            <div className = 'h-[88vh] bg-neutral-950 sticky top-18 left-1'>
            <div>
                <div className = { displayProfile ? "bg-neutral-900 w-86 absolute z-50 top-2 left-46 rounded-md" : "hidden"} >
                <div className = 'flex gap-10 py-8 px-5 items-center'>
                        <div className ='w-20'>
                            <div className = 'w-20'>
                                { displayProfile ? <img src = {`${backendURL}/${profileImage.profileimage}`} className = 'w-20 rounded-full h-20' alt="" /> : "" }
                            </div>
                        </div>
                        <div className = 'w-full'>
                            <h2 className = 'font-bold space-x-6 text-xl'>{profileImage.username}</h2>
                            <p className = 'font-light text-[14px] text-neutral-400'>{profileImage.fullname}</p>
                            <div className = 'flex mt-4'>
                                <div className = 'mr-10'>
                                    <span>{profileImage.postsCount}</span>
                                    <span className = 'ml-1.5 text-neutral-300'>Posts</span>
                                </div>
                                <div className = 'mr-10'>
                                    <span>{profileImage.friendsCount}</span>
                                    <span className = 'ml-1.5 text-neutral-300'>friends</span>
                                </div>
                            </div>
                            <div className = 'mt-3 w-50'>
                                <p className = 'font-light'>{profileImage.bio}</p>
                            </div>
                        </div>
                    </div>
                    </div>
                    <aside>
                        <nav className = 'flex flex-col gap-8 w-42 py-5 px-4 justify-between h-[85vh]'>
                        <div className='flex flex-col gap-8'>
                            <div className = 'hover:bg-indigo-500 transition-colors cursor-pointer py-2 rounded-md'>
                                    <NavLink to="/profile" className = 'flex items-center justify-center'  onMouseEnter={() => setDisplayProfile(true)} onMouseLeave={() => setDisplayProfile(false)} onClick={() => setDisplayProfile(false)}>
                                        { profileImage && <img className = 'rounded-full h-11 w-11' src={`${backendURL}/${profileImage.profileimage}`} alt="" /> }
                                        <div className = 'rounded-full ml-2.5'>
                                            Profile
                                        </div>
                                    </NavLink>
                            </div>

                            <div className = 'hover:bg-indigo-500 transition-colors cursor-pointer py-2 rounded-md'>
                                <NavLink className = "text-neutral-50 flex justify-center" to="/home" >                                                               
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                    </svg>
                                <span className = 'ml-2.5'>Home</span>                 
                                </NavLink>
                            </div>                            
                            <div className = 'hover:bg-indigo-500 transition-colors cursor-pointer py-2 rounded-md'>
                                <NavLink className = "flex justify-center" to="/explore">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                                    </svg>                               
                                <span className = 'ml-2.5'>Explore</span>
                                </NavLink>
                            </div>
                            <div className = 'hover:bg-indigo-500 transition-colors cursor-pointer py-2 rounded-md'>
                                <NavLink className = "flex justify-center" to="/saved">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                    </svg>                                
                                    <span className = 'ml-2.5'>Saved</span>
                                </NavLink>
                            </div>
                                {/* <div className = 'hover:bg-indigo-500 transition-colors cursor-pointer py-2 rounded-md'>
                                    <NavLink className = "flex justify-center" to="/friends">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                        </svg>
                                        <span className = 'ml-2.5'>Friends</span>
                                    
                                    </NavLink>
                                </div> */}
                        </div>
                        <div>                            
                            <div className = 'hover:bg-indigo-500 transition-colors cursor-pointer py-2 rounded-md'>
                                <NavLink className = "text-neutral-50 flex justify-center" onClick={HandleLogout}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                                    </svg>
                                    <span className = 'ml-2.5'>Logout</span>
                                </NavLink>
                            </div>
                            </div>                   
                        </nav>
                    </aside>
            </div>
        </div>

        <div>
            <Outlet />
        </div>

        <div className = 'h-100 w-72 bg-neutral-950 sticky top-18 right-2 px-5 py-5'>
            <p className = 'font-medium '>Suggest friends</p>
            {suggestFriends && suggestFriends.map((item) => (                
                <div key = {item.userId} className = 'flex mt-3 mb-5 gap-3 cursor-pointer' >
                    <div>
                        <img src={`${backendURL}/${item.profileimage}`} alt="" className='w-12 h-12 rounded-full' />
                    </div>
                    <div>
                        <h2 className = 'font-medium '>{item.fullname}</h2>
                        <p className = 'text-neutral-500 -mt-1'>@{item.username}</p>
                    </div>
                    <div>

                    </div>
                </div>
            ))}
        </div>
    </div>
    </div>
  )
}

export default Layout
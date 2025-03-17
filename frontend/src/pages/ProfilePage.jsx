import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input';
import { Navigate, Link } from 'react-router-dom';

const BackendURL = 'http://localhost:4000'
const ProfilePage = () => {
    // store profile detail
    const [ profileData, setProfileData ] = useState();
    // display edit profile and delete profile
    const [ displayEdit, setDisplayEdit ] = useState(false);
    const [ displayDelete, setDisplayDelete ] = useState(false);
    // store profile post detail
    const [ postsDetails, setPostDetails ] = useState();

    // storing the edit profile detail
    const [ editProfile, setEditProfile ] = useState({
        username : '',
        fullname : '',
        bio : '',
    })
    
    // if profile delete navigate to the login page
    const [ successDeleted, setSuccessDeleted ] = useState(false);

    useEffect(() => {
        const fetchProfile = async() => {
            try {
                const data = await fetch('http://localhost:4000/profile', {
                    credentials : 'include'
                })
                if(data.ok) {
                    const result = await data.json()
                    setProfileData(result.result[0])
                    setPostDetails(result.posts)
                    setEditProfile({
                        username : result.result[0].username,
                        fullname : result.result[0].fullname,
                        bio : result.result[0].bio,
                    })
                }
            } catch(e) {
                console.log(e);
            }
        }
        fetchProfile();
    }, [])
    // storing profile edit detail
    // this method of storing multiple value in the one state learned from youtube.
    const HandleEditInput = (e) => {
        setEditProfile((prev) => ({
            ...prev,
            [e.target.name] : e.target.value
        }))
    }
    // upload edit profile detail
    const HandleUpdateProfile = async (e) => {
        e.preventDefault();    
        if(editProfile.username && editProfile.fullname && editProfile.bio) {
          try {
            const uploadProfile = await fetch(`${BackendURL}/update-profile`, {
              method : "POST",
              "credentials" : 'include',    
              headers : {
                "Content-Type" : "application/json"
              },
              body : JSON.stringify(editProfile)
            })
            if(uploadProfile.ok) {
                setProfileData((prev) => ({
                    ...prev,
                    fullname: editProfile.fullname,
                    username : editProfile.username,
                    bio : editProfile.bio
                }))
                setEditProfile({
                    fullname: '',
                    username : '',
                    bio : ''
                })
            }
          } 
          catch(e) {    
            console.log(e);
          }          
        }    
    }
    // delete profile
    const HandleDeleteProfile = async (e) => {
        e.preventDefault();    
          try {
            const deleteProfile = await fetch(`${BackendURL}/delete-profile`, {
              method : "POST",
              "credentials" : 'include',    
            })
            if(deleteProfile.ok) {
                setSuccessDeleted(true)
            }
            else {
              setSuccessDeleted(true)
            }
          } 
          catch(e) {    
            console.log(e);
          }          
      }
      // if profile deleted navigate to login page
      if(successDeleted) {
        return <Navigate to = {'/'} />
      } 

  return (
    <div>
        { !profileData &&
            <div className = 'w-2xl bg-neutral-950 mt-3'>
                <div className = 'flex gap-10 py-8 px-10 items-center'>
                    <div className ='w-45 space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center'>
                        <div className = 'w-45 rounded-full h-45 sm:w-96 bg-neutral-800 dark:bg-gray-400 flex items-center justify-center '>
                            <svg class="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
                            </svg>                            
                        </div>
                    </div>
                    <div className = 'w-full'>
                        <h2 className = 'font-bold space-x-6 text-xl'> </h2>
                        <p className = 'font-light text-[14px] text-neutral-400'> </p>
                        <div className = 'flex mt-4'>
                            <div className = 'mr-10'>
                                <span> </span>
                                <span className = 'ml-1.5 text-neutral-300'> </span>
                            </div>
                            <div className = 'mr-10'>
                                <span> </span>
                                <span className = 'ml-1.5 text-neutral-300'> </span>
                            </div>
                        </div>
                        <div className = 'mt-3'>
                            <p className = 'font-light text-justify'> </p>
                        </div>
                    </div>
                </div>
            </div>
        }
        { profileData && 
            <div className = 'w-2xl bg-neutral-950 mt-3 rounded-xl'>
                <div className = 'flex gap-10 py-8 px-10 items-center'>
                    <div className ='w-45'>
                        <div className = 'w-45'>
                            <img src = {`${BackendURL}/${profileData.profileimage}`} className = 'w-45 rounded-full h-45' alt="" />
                        </div>
                    </div>
                    <div className = 'w-full'>
                        <div className = 'flex justify-end gap-2'>
                            <button onClick={() => { setDisplayEdit(!displayEdit); setDisplayDelete(false)}} className = 'bg-neutral-700 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all '>Edit profile</button>
                            <button onClick={() => { setDisplayDelete(!displayDelete); setDisplayEdit(false)}} className = 'bg-red-800 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all '>Delete profile</button>
                        </div>
                        <h2 className = 'font-bold space-x-6 text-xl'>{profileData.username}</h2>
                        <p className = 'font-light text-[14px] text-neutral-400'>{profileData.fullname}</p>
                        <div className = 'flex mt-4'>
                            <div className = 'mr-10'>
                                <span>{profileData.postsId.length}</span>
                                <span className = 'ml-1.5 text-neutral-300'>Posts</span>
                            </div>
                            <div className = 'mr-10'>
                                <span>{profileData.friendsId.length}</span>
                                <span className = 'ml-1.5 text-neutral-300'>friends</span>
                            </div>
                        </div>
                        <div className = 'mt-3'>
                            <p className = 'font-light text-justify'>{profileData.bio}</p>
                        </div>
                    </div>
                    <div className = { displayEdit ? 'absolute right-40 top-30 z-10 bg-neutral-900 w-68 p-5 rounded-md transition-all' : 'hidden'} >
                        <form action="" onSubmit={HandleUpdateProfile}>
                            <label htmlFor="" className = 'text-neutral-300'>Username :</label>
                            <Input className = 'mt-2 mb-3 border-[1px] border-neutral-600' type = 'text' value = {editProfile.username} onChange = {HandleEditInput} name = 'username' />
                            <label htmlFor="" className = 'text-neutral-300'>Fullname :</label>
                            <Input className = 'mt-2 mb-3 border-[1px] border-neutral-600' type = 'text' value = {editProfile.fullname} onChange = {HandleEditInput} name = 'fullname' />
                            <label htmlFor="" className = 'text-neutral-300'>Bio :</label>
                            <Input className = 'mt-2 mb-3 border-[1px] border-neutral-600' type = 'text' value = {editProfile.bio} onChange = {HandleEditInput} name = 'bio' />
                            { editProfile && <p className = "text-end mb-2 text-xs text-neutral-500">{editProfile.bio?.length}/200</p> }

                            { editProfile && <button disabled = { editProfile.bio?.length > 200 } type = 'submit'  className = { editProfile.bio?.length > 200 ? "bg-indigo-800 text-indigo-200 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full" : 'bg-indigo-500 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full' } >Update</button> }
                        </form>
                        <button onClick={() => setDisplayEdit(false)} className = 'bg-indigo-500 mt-3 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full' >Cancel</button>
                    </div>
                    <div className = { displayDelete ? 'absolute right-40 top-30 z-10 bg-neutral-900 w-68 p-5 rounded-md transition-all' : 'hidden'}>
                        <form action="" onSubmit={HandleDeleteProfile}>
                                <label htmlFor="" className = 'text-neutral-300 font-medium'>Are you sure to Delete your Account ?</label>
                                <button className = 'bg-red-800 mt-3 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full' >Delete</button>
                        </form>
                                <button onClick={() => setDisplayDelete(false)} type = 'submit' className = 'bg-indigo-500 mt-3 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full' >Cancel</button>
                    </div>
                </div>

                <div className = 'border-t-[1px] pt-2 border-neutral-600'>
                    <h2 className = 'pl-5 text-neutral-300 font-light'>Post's</h2>
                    <div className = 'mt-3 grid grid-cols-3 gap-2'>

                    { postsDetails && postsDetails?.map((item) => (
                        <div className = 'hover:opacity-60 transition-all' key={item.postId}>
                            <Link to = {`/post/${item.postId}`}>
                                <img src={`${BackendURL}/${item.postImg}`} alt="" />
                            </Link>
                        </div>
                    )) }
                    </div>

                    { postsDetails && postsDetails?.length == 0 ? (
        
                        <div className = 'text-center h-[75vh]'>
                            <h2 className = 'font-bold text-xl'>No Post's is Posted.</h2>  
                        </div>
                    ) : ''}
                </div>
            </div>
        }
    </div>
  )
}

export default ProfilePage
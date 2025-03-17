import React, { useState } from 'react'
import CreatePost from './CreatePost'
import { Link } from 'react-router-dom'


const bookmarkURL = 'http://localhost:4000'
const BackendURL = 'http://localhost:4000'

const Posts = ({postId, description, postImg, postLikes, postComment, username, fullName, userId, profileimage, createdAt, ProfileUserId, thisprofileliked, thispostsaved}) => {
    
    // check if the post is already saved in profile
    const [ bookmark, setBookmark ] = useState(thispostsaved);
    // check if the post is already like by user
    const [ likePost, setLikePost ] = useState(thisprofileliked);
    // set like or unlike
    const [ likeStored, setLikeStored ] = useState(false);
    
    // Handle Saved post in the profile
    const HandleSaved = async(postId) => {
        try {
            const data = await fetch(`${BackendURL}/post-saved`, {
                credentials : 'include',
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({ postId : postId })
            });            
            if(data.ok) {
                setBookmark(true);    
            }
            else {
                setBookmark(false);
            }
        }
        catch(e) {
            console.log(e)
        }        
    }
    // Handle UnSaved post in the profile
    const HandleUnSaved = async(e) => {        
        try {
            const data = await fetch(`${BackendURL}/post-unsaved`,{
                credentials : 'include',
                method : "POST",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({ postId : postId })
            });            
            if(data.ok) {
                setBookmark(false);    
            }
            else {
                setBookmark(true);
            }
        }
        catch(e) {
            console.log(e)
        }        
    }
    // Handle like post by the user
    const HandleLikePost = async(postId) => {
        try {            
            const data = await fetch(`${bookmarkURL}/post-like`, {
                'credentials' : 'include',                
                method : "POST", headers :  {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    postId : postId,
                    userId : ProfileUserId
                })
            });
            if(data.ok) {                   
                setLikePost(true);
                setLikeStored(true)    
            }
            else {                
                setLikePost(false);
                setLikeStored(false);
            }
        }        
        catch(e) {
            console.log(e);
        }
    }
    // Handle like post by the user
    const HandleUnLikePost = async(postId) => {
        try {            
            const data = await fetch(`${bookmarkURL}/post-unlike`, {
                'credentials' : 'include',                
                method : "POST", headers :  {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({
                    postId : postId,
                    userId : ProfileUserId
                })
            });
            if(data.ok) {                   
                setLikePost(false);
                setLikeStored(false);    
            }
            else {
                setLikePost(true);
                setLikeStored(true);
            }
        }        
        catch(e) {
            console.log(e);
        }        
    }
  return (
    <div key = {postId}>
        <div className='w-xl my-3 bg-neutral-950 rounded-xl pt-5 px-5 pb-2'>
            <div>
                <div className='flex justify-between items-center'>
                    
                    <div className='flex gap-3 items-center'>
                        <img src={`${BackendURL}/${profileimage}`}  className="w-12 h-12 rounded-full" alt="" />
                        <div>
                            <h2 className = 'font-bold -mb-1.5'>{fullName}</h2>
                            <h2 className = 'font-light -mb-1.5 text-neutral-400'>@{username}</h2>
                            <span className = 'text-neutral-500 text-[12px]'>{createdAt}</span>
                        </div>
                    </div>
                    <div>                        
                        {/* <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                        </svg> */}
                    </div>
                </div>
                <div className = 'my-2'>
                    <p>{description}</p>
                </div>
                <div className = 'my-4'>
                    <img src={`${BackendURL}/${postImg}`} alt=""  />
                </div>
                <div className = 'border-t-[1px] border-neutral-900 flex justify-between py-2.5'>
                    <div className='flex'>
                    
                        <div className='flex'>
                            { likePost && 
                                <svg style = {{ fill : '#615fff', border : '0px'}} value = {postId} onClick = {() => HandleUnLikePost(postId)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 cursor-pointer">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg> 
                            }
                            { !likePost && 
                                <svg  value = {postId} onClick = {() => HandleLikePost(postId)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 cursor-pointer">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                </svg> 
                            }
                            <span className = 'ml-1.5 mr-4'>{likeStored ? postLikes.length + 1 : postLikes.length}</span>
                        </div>
                        <div className='flex'>        
                            <Link to = {`/post/${postId}`}>              
                                <svg value = {postId} onClick = {() => HandleCommentPost(postId)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 cursor-pointer">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                                </svg>
                            </Link>  
                            <span className = 'ml-1.5 mr-4'>{postComment.length}</span>
                        </div>

                        <div className='flex items-center'>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6 h-5 cursor-pointer">    
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                            </svg>
                        </div>
                    </div>
                        <div className = 'cursor-pointer'>
                            { bookmark && 
                                <svg onClick = {() => HandleUnSaved(postId)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ">
                                    <path style = {{ fill : 'white' }} strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                                </svg> 
                            }
                            { !bookmark && 
                                <svg onClick = {() => HandleSaved(postId)} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6 ">
                                    <path  strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />

                            </svg> 
                            }
                        </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Posts
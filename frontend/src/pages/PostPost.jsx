import { Input } from '@/components/ui/input';
import React, { useEffect, useState } from 'react'
import { Navigate, useParams, useNavigate } from 'react-router-dom';


const BackendURL = 'http://localhost:4000'

const PostPost = () => {
    // back to the navigated page
    const navigate = useNavigate();
    // getting post Id
    const { id } = useParams();
    // store post all the comment
    const [ postComment, setPostComment ] = useState('');
    // store the post detail
    const [ post, setPost ] = useState('');
    // store the userId
    const [ userId, setUserId ] = useState('');
    // store the user uploading comment
    const [ comment, setComment ] = useState('')
    // 
    const [ commentsProfile, setCommentProfile ] = useState('');
    // display edit post and delete post
    const [ displayEdit, setDisplayEdit ] = useState(false);
    const [ displayDelete, setDisplayDelete ] = useState(false);
    // store the post description
    const [ editPost, setEditPost ] = useState('')
    // if post deleted navigate to home
    const [ successDeleted, setSuccessDeleted ] = useState(false);

    useEffect(() => {
        const fetchData = async () => {    
            try {
                const data = await fetch(`${BackendURL}/post/${id}`, {
                    credentials : 'include'
                })
                if(data.ok) {        
                    let res = await data.json()
                    setPost(res.result);
                    setPostComment(res.result.postComment)
                    setUserId(res.userId)
                    setEditPost(res.result.description)
                    setCommentProfile(res.commentsProfile)
                }
            }
            catch(e) {
                console.log(e)
            }
        }
        fetchData();
    }, [])
    
    // upload comment
    const HandleComment = async(e) => {
        e.preventDefault();
        if(comment) { 
            try {
                const data = await fetch(`${BackendURL}/comment/${id}`, {
                    method : 'POST',
                    credentials : 'include', 
                    headers : {
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify({comment : comment})
                })
                if(data.ok) {        
                    let res = await data.json()
                    let obj = {
                        profileimage : post.profileimage,
                    }
                    setComment('');
                    setPostComment([{ userId : userId, comment : comment }, ...postComment])
                    setCommentProfile([res, ...commentsProfile]);
                }
            }
            catch(e) {
                console.log(e)
            }
        }
    }
    // update post
    const HandleUpdatePost = async(e) => {
        e.preventDefault();
        if(editPost) { 
            try {
                const data = await fetch(`${BackendURL}/update-post`, {
                    method : 'POST',
                    credentials : 'include', 
                    headers : {
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify({editPost : editPost})
                })
                if(data.ok) {        
                    let res = await data.json()
                    setPost((prev) => ({
                        ...prev,
                        description : editPost
                    }))
                }
            }
            catch(e) {
                console.log(e)
            }            
        }        
    }
    // delete post
    const HandleDeletePost = async(e) => {
        e.preventDefault();
        if(id) { 
            try {
                const data = await fetch(`${BackendURL}/delete-post`, {
                    method : 'POST',
                    credentials : 'include', 
                    headers : {
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify({id : id})
                })
                if(data.ok) {        
                    let res = await data.json()
                    setSuccessDeleted(true)
                }
                else {
                    setSuccessDeleted(false)
                }
            }
            catch(e) {
                console.log(e)
            }            
        }        
        
    }

    // post deleted navigate to home
    if(successDeleted) return <Navigate to = {'/home'} />

    return (
    <div>
        <div>
        <div className = 'w-3xl bg-neutral-900 py-2 mt-2 rounded-md'>
            <h2 className = 'font-light mt-3 mb-6 ml-6 flex items-center gap-2 cursor-pointer hover:text-indigo-400 transition-colors' onClick = {() => navigate(-1)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                </svg>
                Back to Post
            </h2>
            <div className = 'flex flex-col gap-x-5'>
                <div className = 'flex justify-between px-5'>
                    <div className='w-72 items-center rounded-full flex gap-4'>
                        <img src={`${BackendURL}/${post.profileimage}`} className='w-15 h-15 rounded-full' alt="" />
                        <div className = 'w-full'>
                            <h2 className = 'font-medium space-x-6 text-xl -mb-1'>{post.fullName}</h2>
                            <p className = 'font-light text-[14px] text-neutral-400'>{post.username}</p>
                            <p className = 'font-light text-[14px] text-neutral-400'>{post.updatedAt}</p>
                        </div>
                    </div>
                    { userId === post.userId &&
                        <div className='flex flex-col gap-3'>
                            <button onClick={() => { setDisplayEdit(true); setDisplayDelete(false) }} className = 'bg-neutral-700 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all '>Edit Post</button>
                            <button onClick={() => { setDisplayDelete(true); setDisplayEdit(false) }} className = 'bg-red-800 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all '>Delete Post</button>
                            <div className = { displayEdit ? 'absolute right-22 top-32 z-10 bg-neutral-900 w-68 p-5 rounded-md transition-all' : 'hidden'} >
                                <form action="" onSubmit={HandleUpdatePost}>
                                    <label htmlFor="" className = 'text-neutral-300'>Description :</label>
                                    <Input className = 'mt-2 mb-3 border-[1px] border-neutral-600' type = 'text' value = {editPost} onChange = {(e) => setEditPost(e.target.value)} name = 'description' />
                                    { editPost && <p className = "text-end mb-2 text-xs text-neutral-500">{editPost?.length}/200</p> }                                
                                    { editPost && <button disabled = { editPost.bio?.length > 200 } type = 'submit'  className = { editPost.bio?.length > 200 ? "bg-indigo-800 text-indigo-200 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full" : 'bg-indigo-500 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full' } >Update</button> }
                                </form>
                                    <button onClick={() => setDisplayEdit(false)} className = 'bg-indigo-500 mt-3 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full' >Cancel</button>
                            </div>
                            <div className = { displayDelete ? 'absolute right-22 top-32 z-10 bg-neutral-900 w-68 p-5 rounded-md transition-all' : 'hidden'}>
                                <form action="" onSubmit={HandleDeletePost}>
                                    <label htmlFor="" className = 'text-neutral-300 font-medium'>Are you sure to Delete your Account ?</label>
                                    <button className = 'bg-red-800 mt-3 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full' >Delete</button>
                                </form>
                                <button onClick={() => setDisplayDelete(false)} type = 'submit' className = 'bg-indigo-500 mt-3 text-indigo-50 rounded-md py-1 px-2 cursor-pointer font-light text-[14px] hover:opacity-60 transition-all w-full' >Cancel</button>
                            </div>                        
                        </div>                        
                    }
                </div>
                    <div className = 'px-5 my-4'>
                        <p>{post.description}</p>
                    </div>
                { post &&
                    <div className = ''>
                        <img src={`${BackendURL}/${post.postImg}`} alt="" />
                    </div>
                }
                <div className = ''>                    
                    <div>
                        <h2 className = 'font-medium text-xl pl-4 mt-4'>Comments</h2>
                    </div>
                    <div className='px-4 my-3'>
                        <form action="" onSubmit={HandleComment} className='flex gap-2'>
                            <Input className = 'border-[1px] border-neutral-500' type = 'text' value = {comment} onChange = {(e) => setComment(e.target.value)} placeholder = "Share your Thought..." />
                            <button type = 'submit' className="bg-indigo-500 text-indigo-50 rounded-xl py-1.5 px-3 cursor-pointer font-medium hover:opacity-65 transition-all">Comment</button>
                        </form>
                    </div>                    
                    { postComment && postComment?.length ? postComment?.map((item) => (                        
                    <div className = 'flex mt-5 px-5'>
                        { commentsProfile.map((i) => i.userId === item.userId ?
                            <>
                            <div className = 'mr-3 rounded-full'>
                                <img src={`${BackendURL}/${i.profileimage}`} className = 'w-12 h-12 rounded-full' alt="" />
                            </div>
                            <div className = ''>
                                <div>
                                    <h2 className = 'font-medium space-x-6 text-xl -mb-1'>{i.fullname}</h2>
                                    <p className = 'font-light text-[14px] text-neutral-400'>{i.username}</p>
                                </div>
                                <div>
                                    <p className = 'font-light'>{item.comment}</p>
                                </div>
                            </div>
                            </>
                            : ''
                        ) }
                    </div>
                    )) : ''}

                    { postComment && !postComment.length ? (
                        <div>
                            <h2 className = 'font-normal text-xl mt-8 text-center'>No Comment's.</h2>
                        </div>
                    ) : ''}
                </div>
            </div>
        </div>
    </div>
    </div>
  )
}

export default PostPost
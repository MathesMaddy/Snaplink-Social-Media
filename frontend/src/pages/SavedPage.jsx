import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

const BackendURL = 'http://localhost:4000'

const SavedPage = () => {
    // store save post detail
    const [ savedPosts, setSavedPosts ] = useState('');
    // check zero post save
    const [ zeroPosts, setZeroPosts ] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {    
            try {
                const data = await fetch(`${BackendURL}/saved-posts`, {
                    credentials : 'include'
                })
                if(data.ok) {        
                    let res = await data.json()
                    setSavedPosts(res);
                    setZeroPosts(false);
                }
                else {
                    setZeroPosts(true);        
                }
            }
            catch(e) {
                console.log(e)
            }
        }
        fetchData();
    }, [])

  return (
    <div>
        <div>
            <div className = 'w-3xl bg-neutral-900 py-2 mt-3 rounded-md'>
                <h2 className = 'font-bold text-2xl mt-3 mb-6 mx-3'>Saved Feed</h2>                
                <div className = 'grid grid-cols-3 gap-x-1 gap-y-1'>
                    { savedPosts && savedPosts.map((item) => (
                        <div className = 'hover:opacity-60 transition-all' key = {item.postId}>
                            <Link to = {`/post/${item.postId}`}>
                                <img src={`${BackendURL}/${item.postImg}`} className='w-full h-full object-cover' alt="" />
                            </Link>
                        </div>
                    ))  }
                </div>
                { zeroPosts && 
                    <div className = 'text-center h-[75vh]'>
                        <h2 className = 'font-bold text-xl'>No Post's is Saved.</h2>        
                    </div> 
                }
            </div>
        </div>
    </div>
  )
}

export default SavedPage
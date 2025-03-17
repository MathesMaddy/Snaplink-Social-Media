import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';

// Backend URL
const BackendURL = 'http://localhost:4000'
const ExplorePage = () => {

    // store explore post's
    const [ posts, setPosts ] = useState('');
    
    useEffect(() => {
        // fetch explore post's
        const fetchData = async () => {
            try{
                const data = await fetch(`${BackendURL}/explore`, {
                    credentials : 'include'
                })
                if(data.ok) {
                    let res = await data.json()
                    setPosts(res);
                }
                else {
                    setPosts('');
                }
            }
            catch(e) {
                console.log(e)
            }
        }
        fetchData();
    }, []);

  return (
    <div>
        <div className = 'w-3xl bg-neutral-950 py-2 mt-3 rounded-md'>
            <h2 className = 'font-bold text-2xl mt-3 mb-6 mx-3'>Explore Feed</h2>
            <div className = 'grid grid-cols-3 gap-x-1 gap-y-1'>            
                { posts && posts.map((item) => (                    
                    <Link to = {`/post/${item.postId}`}>
                        <div className = 'hover:opacity-60 transition-all w-full h-full object-cover' key = {item.postId}>
                            <img src={`${BackendURL}/${item.postImg}`} className='w-full h-full object-cover' alt="" />
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    </div>
  )
}

export default ExplorePage
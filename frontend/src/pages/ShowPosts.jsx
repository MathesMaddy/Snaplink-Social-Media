import React, { useEffect, useState } from 'react'
import Posts from '../components/Posts'
import CreatePost from '../components/CreatePost'

import InfiniteScroll from 'react-infinite-scroll-component'
const ShowPosts = () => {
  // store post detail
  const [ posts, setPosts ] = useState('');
  // store profile image
  const [ profileImage, setProfileImage ] = useState('');
  // page for lazy loading
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect( () => {
    const fetchProfile = async() => {
      try {          
          const data = await fetch(`http://localhost:4000/posts?page=${page}&limit=5`, { method : "GET",
              credentials : 'include'
          })
          if(data.ok) {
              const result = await data.json()
              setPosts([...posts, ...result.result])
              setHasMore(result.hasMore)
              setProfileImage(result.profileimage)
          }
      } 
      catch(e) {
          console.log(e);
      }      
    }
    fetchProfile();
  }, [page])

  return (    
    <div>
        <CreatePost profileImage = { profileImage }/>
        <InfiniteScroll dataLength={5} next={() => setPage(page + 1)} hasMore={hasMore} loader={<p></p>} endMessage = {<p></p>}>
            { posts && posts?.map((item) => (    
                <Posts {...item} key = {item.postId} ProfileUserId = { profileImage.userId } />
            )) }
        </InfiniteScroll>
    </div>
  )
}

export default ShowPosts
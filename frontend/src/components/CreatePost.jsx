import { Input } from "@/components/ui/input";
import { useState, useRef } from "react";

// Backend URL
const uploadURL = 'http://localhost:4000'
const CreatePost = ({profileImage}) => {

  // store the Post Description with max-length of 200 character
  const [ postDescription, setPostDescription ] = useState('');
  // store the Image of the post
  const [ postImage, setPostImage ] = useState('');
  // To clear the input file tag after successfully uploaded
  const postImageRef = useRef(null);

  // Create new Post
  const HandleCreatePost = async (e) => {
    e.preventDefault();
    // checking Post Description and Post Image
    if(postDescription && postImage) {
      const formData = new FormData();

      formData.append('description', postDescription);
      formData.append('postimage', postImage);
      try {
        const uploadPost = await fetch(`${uploadURL}/create-post`, {
          method : "POST",

          "credentials" : 'include',
          body : formData
        })
        if(uploadPost.ok) {
          setPostDescription('')
          setPostImage('')
          postImageRef.current.value = '';
        }
      } 
      catch(e) {
        console.log(e);
      }
    }
  }
  return (
    <div className = "w-xl my-3 bg-neutral-950 rounded-xl p-5">
      <div className = "mb-4">
        Post Something
      </div>

      <form action="" onSubmit = {HandleCreatePost}>
        <div className = "flex gap-3  items-center">
            <div className="w-15 h-12">
              { profileImage && <img src = {`${uploadURL}/${profileImage}`} className = "w-12 h-12 rounded-full" alt="" width = "100%" height = "100%"/> }
            </div>
            <div className = "w-full"> 
              <Input className = "border-[1px] border-neutral-600 h-[42px]" type = "text" placeholder = "What's on your mind ?" value = {postDescription} onChange = {(e) => setPostDescription(e.target.value)}/>
            </div>
        </div>
        <p className = "text-end mb-2 text-xs text-neutral-500">{postDescription.length}/200</p>        
        <div className = "flex justify-between">
            <Input className = "w-50 cursor-pointer border-[1px] border-neutral-600" id = "picture" type = "file" onChange = {(e) => setPostImage(e.target.files[0])} ref = {postImageRef} />
            <div>              
              <button type="submit" className = { postDescription.length > 200 ? "bg-indigo-800 text-indigo-200 rounded-xl py-1.5 px-3 font-medium" : "bg-indigo-500 text-indigo-50 rounded-xl py-1.5 px-3 cursor-pointer font-medium" } disabled = { postDescription.length > 200 } >Submit</button>
            </div>
        </div>
      </form>
    </div>
  )
}

export default CreatePost
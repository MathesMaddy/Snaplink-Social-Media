import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input';
import { Navigate } from 'react-router-dom';

// Backend URL
const signupURL = 'http://localhost:4000'
const loginURL = 'http://localhost:4000'

const LoginPage = () => {
  // toggle between Signup and Login 
  const [ isSignup, setIsSignup ] = useState(true);
  // Check Login if not it will return to the login page
  const [ checkLogin, setCheckLogin ] = useState(false);
  // store Signup value 
  // this method of storing all value in one state learned from youtube and stackoverflow
  const [ signup, setSignup ] = useState({
    fullname : '',
    username : '',
    password : '',
    confirmPassword : '',
    bio : '',
  });
  // store profileimage
  const [ profileImg, setProfileImg ] = useState();
  // Login value store 
  // this method of storing all value in one state learned from youtube and stackoverflow
  const [ login, setLogin ] = useState({
    userName : '',
    password : ''
  })

  useEffect( () => {
    const CheckLogin = async() => {
      try {
        const data = await fetch('http://localhost:4000/check-login', {
          method : "POST",
          credentials: "include"
        })
        if(data.ok) {
          setCheckLogin(true);
        }
        else {
          setCheckLogin(false);
        }
      }
      catch(e) {
        console.log(e)
      }
    }
    CheckLogin();
  }, [])

  // display about input validation or not.
  const [ checkDetail, setCheckDetail ] = useState(false);
  // show input is invalidate with message.
  const [ showCheckDetail, setShowCheckDetail ] = useState('');
  // display about input validation or not in login page.
  const [ checkDetailLogin, setCheckDetailLogin ] = useState(false);
  // show input is invalidate with message not in login page.
  const [ showCheckDetailLogin, setShowCheckDetailLogin ] = useState('');
  // if login success navigate to home
  const [ loginSuccess, setLoginSuccess ] = useState(false);

  // login detail store.
  // this method of storing multiple value in the one state learned from youtube.
  const HandleLoginDetail = (e) => {
    setLogin(prev => ({
      ...prev,
      [e.target.name] : e.target.value
    }))
  }
  
  // upload signup details
  const HandleSignup = async(e) => {
    e.preventDefault();
    if(signup.fullname && signup.username && signup.password && signup.confirmPassword && signup.bio && profileImg) {
      if(signup.fullname.length >= 6 && signup.username.length >= 6) {
        if(signup.password.length >= 8 && signup.confirmPassword.length >= 8) {          
          if(signup.password === signup.confirmPassword) {
            try {
              const formData = new FormData();
              formData.append('fullName',signup.fullname);
              formData.append('userName',signup.username);
              formData.append('password',signup.password);
              formData.append('bio',signup.bio);
              formData.append('profile',profileImg);
              const data = await fetch(`${signupURL}/create-user`, {
                method : "POST",
                body : formData
              })
              if(data.ok) {
                setIsSignup(false);
                setSignup({
                  fullname : '',
                  username : '',
                  password : '',
                  confirmPassword : '',
                  bio : '',
                })
              }
              else {
                setCheckDetail(true);
                setShowCheckDetail(data.json());
              }
            }
            catch(e) {
              console.log(e)
            }
          }
          else {
            setCheckDetail(true);
            setShowCheckDetail('Password and Confirm password is not matching.');
          }
        }
        else {
          setCheckDetail(true);
          setShowCheckDetail('Password and Confirm password minimum 8 character.');
        }
      }
      else {
        setCheckDetail(true);
        setShowCheckDetail('Fullname or Username should be minimum 6 character.');
      }
    }
    else {
      setCheckDetail(true);
      setShowCheckDetail('Fill required detail and upload profile image to Signup.');
    }
  }

  // upload and check login user
  const HandleLogin = async(e) => {
    e.preventDefault();
    if(login.userName && login.password) {
      try {
        const data = await fetch(`${loginURL}/user-login`, {  
          method : "POST",
          credentials: "include",           
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify(login)
        })
        if(data.ok) {
          setCheckDetailLogin(false);
          setLoginSuccess(true);
        }
        else {
          setCheckDetailLogin(true);
          setShowCheckDetailLogin(data.json())
        }
      }
      catch(e) {
        console.log(e);
      }
    }
    else {
      setCheckDetailLogin(true);
      setShowCheckDetailLogin('Username and Password is required.');
    }
  }

  // signup detail store.
  // this method of storing multiple value in the one state learned from youtube.
  const HandleSignupDetail = (e) => {
    setSignup(prev => ({
      ...prev,
      [e.target.name] : e.target.value
    }))
  }
  // if login success navigate to home
  if(loginSuccess) return <Navigate to={'/home'} />
  // if already login navigate to home
  if(checkLogin) return <Navigate to={'/home'} />
  
  return (
    <div className = 'h-screen flex justify-end items-center bg-gradient-to-b from-[#625fff93]  to-[#0a0a0a] backdrop-blur-lg'>
      <div className = 'w-5/10 bg-neutral-950 h-full p-5 flex justify-center items-center'>
      <div className = 'w-80'>      
          <div className = 'flex justify-center'>
            <img src="/thunder(2)edited.png" alt="" className = 'h-10'/>
          </div>
          { isSignup && (
            <div>
              <h2 className = 'text-center'>Signup your account</h2>
            <p className = 'font-light text-[14px] text-center my-3'>Sign up to see photos and videos from your friends.</p>
            { checkDetail && <p className = 'rounded-md border-[1px] border-red-400 py-4 px-3 mb-2'>{showCheckDetail}</p> }
            <form action="" className = 'flex flex-col gap-5' onSubmit = {HandleSignup}>
              <div>
                <Input className = "border-[1px] border-neutral-600 h-[42px]" type="text" placeholder="Full Name" name = 'fullname' onChange = {HandleSignupDetail} value = {signup.fullname}/>
              </div>
              <div>
                <Input className = "border-[1px] border-neutral-600 h-[42px]" type="text" placeholder="Username" name = 'username' onChange = {HandleSignupDetail} value = {signup.username}/>
              </div>
              <div>
                <Input className = "border-[1px] border-neutral-600 h-[42px]" type="password" placeholder="Password" name = 'password' onChange = {HandleSignupDetail} value = {signup.password}/>
              </div>
              <div>
                <Input className = "border-[1px] border-neutral-600 h-[42px]" type="password" placeholder="Confirm Password" name = 'confirmPassword' onChange = {HandleSignupDetail} value = {signup.confirmPassword}/>
              </div>
              <div>
                <Input className = "border-[1px] border-neutral-600 h-[42px]" type="text" placeholder="Bio or Description about profile" name = 'bio' onChange = {HandleSignupDetail} value = {signup.bio}/>
              </div>
              <div>
                <Input className = "border-[1px] border-neutral-600 h-[42px] cursor-pointer" type="file" placeholder="Bio or Description about profile" name = 'profileImg' onChange = {(e) => setProfileImg(e.target.files[0])} />
              </div>
              <div>
                <p className = 'font-light text-xs text-center -my-1'>By signing up, you agree to our <span className = 'font-bold text-indigo-500 cursor-pointer'>Terms</span>, <span className = 'font-bold text-indigo-500 cursor-pointer'>Privacy Policy</span> and <span className = 'font-bold text-indigo-500 cursor-pointer'>Cookies Policy</span>.</p>
              </div>
              <div>
                <button className = 'w-full bg-indigo-500 rounded-sm h-8 cursor-pointer hover:bg-indigo-600 transition-colors font-medium'>Sign up</button>
              </div>
            </form>
            <div className = 'text-center'>              
              <p className = 'my-3'>Have an account ? <span className = 'w-full text-indigo-500 rounded-sm h-8 cursor-pointer hover:text-indigo-600 transition-colors font-medium' onClick = {() => setIsSignup(!isSignup)}>Login</span></p>
            </div>
          </div> 
          )}
          { !isSignup && (
            <>
              <h2 className='text-center font-medium my-3 text-xl'>Login to your account</h2>
              <p className = 'mt-2 mb-4 text-center font-light text-neutral-100'>Welcome back! Please enter your details.</p>
            { checkDetailLogin && <p className = 'rounded-md border-[1px] border-red-400 py-4 px-3 mb-2'>{showCheckDetailLogin}</p> }
              <form action="" className = 'flex flex-col gap-5' onSubmit={HandleLogin}>
                <div>
                  <Input className = "border-[1px] border-neutral-600 h-[42px]" type="text" placeholder="Username" onChange = {HandleLoginDetail} name = 'userName' value = {login.userName}/>
                </div>
                <div>
                  <Input className = "border-[1px] border-neutral-600 h-[42px]" type="password" placeholder="Password" onChange = {HandleLoginDetail} name = 'password' value = {login.password}/>
                </div>
                <div>
                  <p className = 'font-light text-xs text-center -my-1'>By signing up, you agree to our <span className = 'font-bold text-indigo-500 cursor-pointer'>Terms</span>, <span className = 'font-bold text-indigo-500 cursor-pointer'>Privacy Policy</span> and <span className = 'font-bold text-indigo-500 cursor-pointer'>Cookies Policy</span>.</p>
                </div>
                <div>
                  <button className = 'w-full bg-indigo-500 rounded-sm h-8 cursor-pointer hover:bg-indigo-600 transition-colors font-medium'>Login</button>
                </div>
              </form>
              <div className = 'text-center'>              
                <p className = 'my-3'>Don't have an account ? <span className = 'w-full text-indigo-500 rounded-sm h-8 cursor-pointer hover:text-indigo-600 transition-colors font-medium' onClick = {() => setIsSignup(!isSignup)}>Signup</span></p>
              </div>
            </>
            )}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
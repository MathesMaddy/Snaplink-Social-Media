const express = require('express');
const app = express();
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cookieParser = require('cookie-parser');
const mongodb = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const genSalt = bcrypt.genSaltSync(10)
const secret = 'asdasfkjowietrk345464mlsfajkm@kjsdakjfk';
const fs = require('fs').promises;
const path = require('path');

const PORT = process.env.PORT || 4000;

const DBClient = () => {
    const uri = 'mongodb://localhost:27017';
    return new mongodb.MongoClient(uri);
}
// allow to access for origin credentials for parse cookie
app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// create new user 
app.post('/create-user', upload.single('profile') , async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { fullName, userName, password, bio } = req.body;
        const file = req.file;
        // checking all the input is given.
        if(fullName && userName && password && bio && file) {
            if(fullName !== 'null' && userName !== 'null' && password !== 'null' && bio !== 'null') {
                await client.connect();
                let dbName = 'snaplink'
                const db = client.db(dbName);
                let collectionName = 'UserProfiles';
                const collection = db.collection(collectionName);
                let hashPassword = bcrypt.hashSync(password, genSalt);
                const userId = `userId${Date.now()}`
                // store the extension of the uploaded file.
                const extName = path.extname(file.originalname);                
                // finding the destination of uploaded file.
                const destination = file.destination;
                const filename = file.filename;
                const oldPath = path.join(__dirname, 'uploads', filename);                
                const newPath = path.join(__dirname, 'uploads', filename + extName)
                // adding the file extension to uploaded file.
                await fs.rename(oldPath, newPath);
                let username = userName.toLowerCase();
                // checking username already created or not.
                let findUsername = await collection.find({ username : username }).toArray();
                if( findUsername.length ) {                    
                    await client.close();
                    return res.status(400).json('Username already created try different Username.');
                }
                else {
                    const result = await collection.insertOne({        
                        userId : userId,            
                        fullname : fullName,
                        username : username,
                        password : hashPassword,
                        bio: bio,
                        profileimage : destination + filename + extName,
                        postsId : [],
                        friendsId : [],
                        postsaved : []         
                    })
                    if(result.acknowledged) {
                        await client.close();
                        return res.status(201).json('user-created');
                    }
                    else {
                        await client.close();
                        return res.status(400).json('user-not-created');
                    }           
                }
            }
            else {                
                await client.close();
                return res.status(400).json('invalid input.');
            }
        }
        else {
            await client.close();
            return res.status(400).json('input is not given.');
        }
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})

// user login
app.post('/user-login', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { userName, password } = req.body;
        if(userName && password) {
            if(userName !== 'null' && password !== 'null') {
                await client.connect();
                let dbName = 'snaplink'
                const db = client.db(dbName);
                let collectionName = 'UserProfiles';
                const collection = db.collection(collectionName);
                const result = await collection.find({ username : userName }).toArray();
                if(result.length) {
                    // changing password is matching or not.
                    let hashPassword = bcrypt.compareSync(password, result[0].password);
                    if(hashPassword) {
                        await client.close();
                        let userId = result[0].userId;                        
                        let fullname = result[0].fullname
                        // creating token payload with userName userId and fullname 
                        jwt.sign({ userName, userId, fullname }, secret, { expiresIn : '1d' }, (err,token) => {
                        if(err) throw err
                        return res.cookie('token', token, { httpOnly: true, sameSite: 'None', secure : 'true' })
                        .json({ userName }).status(200)
                        })
                    }
                    else {
                        await client.close();
                        return res.status(400).json('User not authenticate');
                    }
                }
                else {
                    await client.close();
                    return res.status(400).json('User is not exists.');
                }                
            }
            else {                
                await client.close();
                return res.status(400).json('invalid input.');
            }
        }
        else {
            await client.close();
            return res.status(400).json('input is not given.');
        }
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})
// checking user is authenticated
app.post('/check-login', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        if(token) {
            jwt.verify( token, secret, { expiresIn : '1d' }, async(err,info) => {
                if(err) throw err
                if(info) {
                    const { userName, userId, fullname } = info;                        
                    await client.connect();
                    let dbName = 'snaplink'
                    const db = client.db(dbName);
                    let collectionName = 'UserProfiles';
                    const collection = db.collection(collectionName);
                    // getting username, fullname, profileimage, bio, postsCount and friendsCount.
                    // when user hover the profile option it will show the data.
                    const result = await collection.aggregate([
                        { $match : { userId : userId }},
                        {
                            $project: {
                                _id: 0, username : 1, fullname : 1, profileimage : 1, bio : 1,
                                postsCount: { $size: "$postsId" },
                                friendsCount: { $size: "$friendsId" }
                            }
                        }
                    ]).toArray();
                    // suggestion friends without the same userId
                    const friendsResult = await collection.find({ userId : { $ne : userId }} , {
                        projection : {
                            _id : 0,
                            userId : 1,
                            fullname : 1,
                            username : 1,
                            profileimage : 1
                        }
                    }).limit(5).toArray();
    
                    if(result.length) {
                        await client.close();
                        return res.status(200).json({result : result, friendsResult : friendsResult});
                    }
                    else {
                        await client.close();
                        return res.status(200).json('profile image not found.');
                    }
                }
                else {
                    await client.close();
                    return res.clearCookie('token').json(401);
                }
            })
        }
        else {
            await client.close();
            return res.status(400).json('User not Login');
        }
    }
    catch(e) {
        await client.close();
        return res.status(400).json('Error');
    }
})
// logout
app.post('/logout', async(req, res) => {
    try {
        const { token } = req.cookies;
        if(token) {
            jwt.verify( token, secret, { expiresIn : '1d' }, (err,info) => {
                if(err) throw err
                if(info) {
                    return res.clearCookie('token').status(200).json('ok');
                }
                else {
                    return res.clearCookie('token').json(401);
                }
            })
        }
        else {
            return res.status(400).clearCookie('token');
        }
    }
    catch(e) {
        return res.status(400).json('Error');
    }
})
// create new post
app.post('/create-post', upload.single('postimage'), async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        jwt.verify(token, secret, {}, async(err, info) => {
            if(info) {
                const { userName, userId, fullname } = info;
                if(userName && userId && fullname) {
                    const { description } = req.body;
                    const file = req.file;
                    if(description && file) {
                        // store the extension of the uploaded file. 
                        const extName = path.extname(file.originalname);
                        // finding the destination of uploaded file.
                        const destination = file.destination;                
                        const filename = file.filename;
                        const oldPath = path.join(__dirname, 'uploads', filename);                        
                        const newPath = path.join(__dirname, 'uploads', filename + extName)
                        // adding the file extension to uploaded file.
                        await fs.rename(oldPath, newPath);                                       
                        const postId = `postId${Date.now()}`
                        const createdDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
                        await client.connect();
                        let dbName = 'snaplink'
                        const db = client.db(dbName);
                        // finding profileimage path and store in the post for easy access.
                        let profileCollectionName = 'UserProfiles'
                        const profileCollection = db.collection(profileCollectionName);
                        const profileimage = await profileCollection.find({ userId }, {
                            projection : {
                                _id : 0,
                                profileimage : 1,
                            }
                        }).toArray();
                        // update the user profile postId
                        const profile = await profileCollection.updateOne({ userId }, { $push : { postsId : postId }})
                        // create new post
                        let collectionName = 'Posts';
                        const collection = db.collection(collectionName);
                        const result = await collection.insertOne({ 
                            postId : postId,
                            username : userName,
                            fullName : fullname,
                            profileimage : profileimage[0].profileimage,
                            userId : userId,
                            description : description,
                            postImg : destination + filename + extName,
                            postLikes : [],
                            postComment : [],
                            thisprofileliked : '',
                            thispostsaved : '',
                            createdAt : createdDate,
                            updatedAt : createdDate
                        });
                        if(result.acknowledged) {
                            await client.close();
                            return res.status(200).json('ok')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('user-not-created');
                        }     
                    }        
                    else {
                        await client.close();
                        return res.status(400).json('input is not given')
                    }   
                } 
                else {
                    await client.close();
                    return res.status(400).json('input is not given.');        
                }
            }
        })
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})
// upload comment in post
app.post('/comment/:id', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const { id } = req.params
        const { comment } = req.body
        //
        if(!token) return res.status(400).json('user not login.');
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userName, userId, fullname } = info;
                if(userName && userId && fullname) {                        
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        let collectionName = 'Posts';                        
                        const collection = db.collection(collectionName);
                        // upload the comment with userId and comment for access the profileimage of the comment user.
                        const obj = { 
                            userId : userId, 
                            comment : comment 
                        }
                        // push comment to the postComment
                        const result = await collection.updateOne({ postId : id }, {
                            $push : { postComment : obj }
                        });
                        const collectionProfile = db.collection('UserProfiles')
                        const profileName = await collectionProfile.findOne({ userId : userId }, {
                            projection : {
                                _id : 0,
                                profileimage : 1,
                                fullname : 1,
                                userName : 1
                            }
                        })
                        if(result.acknowledged) {
                            await client.close();
                            return res.status(200).json({ commentsProfile : profileName })
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting Posts.');
                        }     
                    }
                else {
                    await client.close();
                    return res.status(400).json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {
        await client.close();
        return res.status(400).json('Error');
    }
})

// explore page 
app.get('/explore', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        if(!token) return res.status(400).json('user not login.');
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userName, userId, fullname } = info;
                if(userName && userId && fullname) {
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        let collectionName = 'Posts';
                        const collection = db.collection(collectionName);
                        const result = await collection.find({ }, {
                            projection : {
                                _id: 0,
                                updatedAt : 0
                            }
                        }).toArray();
                        if(result.length) {
                            await client.close();
                            return res.status(200).json(result)
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting Posts.');
                        }     
                }  
                else {
                    await client.close();
                    return res.status(400).json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})

// getting all posts in home with lazy loading
app.get('/posts', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const pageNo = req.query.page
        const pageLimit = req.query.limit
        if(!token) return res.status(400).json('user not login.');
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userName, userId, fullname } = info;
                if(userName && userId && fullname) {                        
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        let collectionName = 'Posts';
                        const collection = db.collection(collectionName);
                        // lazy loading in home page
                        const page = parseInt(pageNo) || 1;
                        const limit = parseInt(pageLimit) || 5;
                        const skip = (page - 1) * limit;
                        // sort using created Date
                        const result = await collection.find({ }, {
                            projection : {
                                _id: 0,
                                updatedAt : 0
                            }
                        }).sort({ createdAt : -1 }).skip(skip).limit(limit).toArray();
                        // checking user is already like the post. user can like only one time not infinite time like and same for post save.
                        // if already like the post it show post liked same for post save.
                        // if not doesn't show the already liked same for post save. 
                        const postRes = result.map((item) => ({
                            ...item,
                            thisprofileliked : item.postLikes?.includes(userId) || ''
                        })).map((item) => ({
                            ...item,
                            thispostsaved : item.postsaved?.includes(userId) || ''
                        }))

                        const profileCollectionName = 'UserProfiles';
                        const profileCollection = db.collection(profileCollectionName);
                        const image = await profileCollection.findOne({ userId : userId }, {
                            projection : {
                                _id : 0,
                                profileimage : 1                                
                            }
                        })
                        if(result.length) {
                            await client.close();
                            return res.status(200).json({
                                result : postRes, 
                                profileimage : image.profileimage, 
                                hasMore: result.length === limit 
                            })
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting Posts.');
                        }     
                    }
                else {
                    await client.close();
                    return res.status(400).json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {
        await client.close();
        return res.status(400).json('Error');
    }
})
// specific clicked post
app.get('/post/:id', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const { id } = req.params;
        if(!token) return res.status(400).json('user not login.');
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userName, userId, fullname } = info;
                if(userName && userId && fullname) {                        
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        let collectionName = 'Posts';                        
                        const collection = db.collection(collectionName); // finding clicked post
                        const result = await collection.findOne({ postId : id }, {
                            projection : {
                                _id: 0,
                                thisprofileliked : 0,
                                thispostsaved : 0
                            }
                        });
                        const profileCollectionName = 'UserProfiles';
                        const profileCollection = db.collection(profileCollectionName);
                        const image = await profileCollection.findOne({ userId : userId }, {
                            projection : {
                                _id : 0,
                                profileimage : 1
                            }
                        })
                        // finding every post comment profile show the profileimage, fullname, username.
                        let findUser = result.postComment.map((item) => item.userId)
                        const commentsProfile = await profileCollection.find({ userId : { $in : findUser }}, {
                            projection : {
                                _id : 0,
                                userId : 1,
                                profileimage : 1,
                                fullname : 1,
                                username : 1
                            }
                        }).toArray();
                        if(result) {
                            await client.close();
                            return res.status(200).json({
                                result : result, 
                                userId : userId, 
                                profileimage : image.profileimage, 
                                commentsProfile : commentsProfile 
                            })
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting Posts.');
                        }     
                }         
                else {
                    await client.close();
                    return res.status(400).json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})
// finding save post
app.get('/saved-posts', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        if(!token) return res.status(400).json('user not login.');
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userName, userId, fullname } = info;
                if(userName && userId && fullname) {                        
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        let collectionName = 'UserProfiles';                        
                        const collection = db.collection(collectionName); // finding the saved post array for profile
                        const result = await collection.find({ userId : userId }, {
                            projection : {
                                _id: 0,
                                postsaved : 1
                            }
                        }).toArray();
                        // finding the saved post list
                        const postsCollectionName = 'Posts';
                        const postsCollection = db.collection(postsCollectionName);
                        const posts = await postsCollection.find({ postId : { $in : result[0].postsaved }}, {
                            projection : {
                                _id : 0, 
                                postId : 1,
                                postImg : 1                                
                            }
                        }).toArray();                        
                        if(posts.length) {
                            await client.close();
                            return res.status(200).json(posts)
                        }
                        else {
                            await client.close();
                            return res.status(400).json('No Posts.');
                        }     
                    }      
                else {
                    await client.close();
                    return res.status(400).json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {
        await client.close();
        return res.status(400).json('Error');
    }
})
// update profile
app.post('/update-profile', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const { fullname, bio } = req.body
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userId } = info;
                if(userId) {                        
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        let collectionName = 'UserProfiles';                        
                        const collection = db.collection(collectionName);
                        // update profile
                        const result = await collection.updateOne({ userId : userId }, { $set : {
                            fullname : fullname,
                            bio : bio
                        }})
                        // update profile fullname in the post's 
                        const postCollectionName = 'Posts';
                        const postCollection = db.collection(postCollectionName);
                        const updatedResult = await postCollection.updateOne({ userId : userId }, { $set : {
                            fullname : fullname
                        }})                        
                        if(result.acknowledged) {
                            await client.close();
                            return res.status(200).json('updated')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting profile.');
                        }     
                } 
                else {
                    await client.close();
                    return res.status(400).json('user is not authenticated.');        
                }
            }
            else {
                await client.close();
                return res.status(400).json('user is not authenticated.');
            }
        })
    }
    catch(e) {
        await client.close();
        return res.status(400).json('Error');
    }
})
// update post
app.post('/update-post', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const { editPost } = req.body
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userId } = info;
                if(userId) {                        
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        // update the post
                        let collectionName = 'Posts';                        
                        const collection = db.collection(collectionName);
                        const result = await collection.updateOne({ userId : userId }, { $set : {
                            description : editPost
                        }})
                        if(result.acknowledged) {
                            await client.close();
                            return res.status(200).json('updated')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting profile.');
                        }     
                } 
                else {
                    await client.close();
                    return res.status(400).json('user is not authenticated.');        
                }
            }
            else {
                await client.close();
                return res.status(400).json('user is not authenticated.');
            }
        })
    }
    catch(e) {
        await client.close();
        return res.status(400).json('Error');
    }
})
// delete post
app.post('/delete-post', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const { id } = req.body
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userId } = info;
                if(userId) {                        
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        // delete post
                        let collectionName = 'Posts';                        
                        const collection = db.collection(collectionName);
                        const result = await collection.deleteOne({ postId : id })
                        // delete postId from the user profile
                        const postCollectionName = 'UserProfiles';
                        const postCollection = db.collection(postCollectionName);
                        const updatedResult = await postCollection.updateOne({ userId : userId }, { $pull : {
                            postsId : id
                        }})
                        if(result.acknowledged) {
                            await client.close();
                            return res.status(200).json('deleted.')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting profile.');
                        }     
                } 
                else {
                    await client.close();
                    return res.status(400).json('user is not authenticated.');        
                }
            }
            else {
                await client.close();
                return res.status(400).json('user is not authenticated.');
            }
        })
    }
    catch(e) {
        await client.close();
        return res.status(400).json('Error');
    }
})
// delete profile
app.post('/delete-profile', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userName, userId, fullname } = info;
                if(userId) {                        
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        // delete profile
                        let collectionName = 'UserProfiles';                        
                        const collection = db.collection(collectionName);
                        const result = await collection.deleteOne({ userId : userId })
                        // delete post's uploaded by user
                        const postCollectionName = 'Posts';
                        const postCollection = db.collection(postCollectionName);
                        const deletedResult = await postCollection.deleteOne({ userId : userId })
                        if(result.acknowledged) {
                            await client.close();
                            return res.status(200).clearCookie('token').json('deleted')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting profile.');
                        }     
                } 
                else {
                    await client.close();
                    return res.status(400).clearCookie('token').json('user is not authenticated.');        
                }
            }
            else {
                await client.close();
                return res.status(400).clearCookie('token').json('user is not authenticated.');
            }
        })
    }
    catch(e) {
        await client.close();
        return res.status(400).json('Error');
    }
})
// profile page
app.get('/profile', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        jwt.verify(token, secret, {}, async(err, info) => {
            if(info) { 
                const { userName, userId, fullname } = info;
                if(userName && userId && fullname) {
                        await client.connect();
                        let dbName = 'snaplink'
                        const db = client.db(dbName);
                        // getting profile data
                        let collectionName = 'UserProfiles';
                        const collection = db.collection(collectionName);
                        const result = await collection.find({ userId : userId }, {
                            projection : {
                                _id : 0,
                                password : 0,
                            }
                        }).toArray();
                        // getting user uploaded post 
                        const postsCollection = db.collection('Posts');                        
                        const posts = await postsCollection.find({ postId : { $in : result[0].postsId  }}, {
                            projection : {
                                _id : 0,
                                postId : 1,
                                postImg : 1
                            }
                        }).toArray();
                        if(result.length) {
                            await client.close();
                            return res.status(200).json({ result : result, posts : posts });
                        }
                        else {
                            await client.close();
                            return res.status(400).json('user-not-created');
                        }     
                    }                           
                else {
                    await client.close();
                    return res.status(400).json('input is not given.');        
                }
            }
        })
    }
    catch(e) {
        await client.close();
        return res.status(400).json('Error');
    }
})

// store post like userId
app.post('/post-like', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const { postId, userId } = req.body
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userId } = info;
                if(userId) {
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        // update post like
                        let collectionName = 'Posts';
                        const collection = db.collection(collectionName);
                        const result = await collection.updateOne({ postId : postId }, { $push : { postLikes : userId } })
                        if(result.acknowledged) {
                            await client.close();
                            return res.status(200).json('like')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting Posts.');
                        }     
                }           
                else {
                    await client.close();
                    return res.status(400).clearCookie('token').json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})
// remove post like
app.post('/post-unlike', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const { postId } = req.body
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userId } = info;
                if(userId) {                        
                        await client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        // remove post like 
                        let collectionName = 'Posts';
                        const collection = db.collection(collectionName);
                        const result = await collection.updateOne({ postId : postId }, { $pull : { postLikes : userId } })
                        if(result.acknowledged) {
                            await client.close();
                            return res.status(200).json('like')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting Posts.');
                        }     
                    }           
                else {
                    await client.close();
                    return res.status(400).clearCookie('token').json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})
// upload post comment
app.get('/post-comments', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userId } = info;
                if(userId) {
                        client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        // upload post comment
                        let collectionName = 'Posts';
                        const collection = db.collection(collectionName);
                        const result = await collection.updateOne({ postId : postId }, { $push : { postComment : userId } })
                        if(result.acknowledged) {
                            await client.close();
                            return res.status(200).json('like')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting Posts.');
                        }     
                    }           
                else {
                    await client.close();
                    return res.status(400).clearCookie('token').json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})
// update post save
app.post('/post-saved', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const { postId } = req.body
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userId } = info;
                if(userId) {
                        client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        // update save post in post
                        let collectionName = 'Posts';
                        const collection = db.collection(collectionName);
                        const result = await collection.updateOne({ postId : postId }, { $push : { postsaved : userId } })
                        // update save post in user profile
                        const profileCollectionName = 'UserProfiles';
                        const profileCollection = db.collection(profileCollectionName);
                        const saved = await profileCollection.updateOne({ userId : userId }, { $push : { postsaved : postId } })
                        if(result.acknowledged && saved.acknowledged) {
                            await client.close();
                            return res.status(200).json('saved')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting Posts.');
                        }     
                }           
                else {
                    await client.close();
                    return res.status(400).clearCookie('token').json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})
// remove post save
app.post('/post-unsaved', async(req, res) => {
    // call the DBClient Function outside of the try because of catch block could not find name 'client'.
    const client = DBClient();
    try {
        const { token } = req.cookies;
        const { postId } = req.body
        jwt.verify(token, secret, {}, async(err, info) => {
            if(err) throw err
            if(info) {
                const { userId } = info;
                if(userId) {
                        client.connect();
                        let dbName = 'snaplink';
                        const db = client.db(dbName);
                        // remove post save from post
                        let collectionName = 'Posts';
                        const collection = db.collection(collectionName);
                        const result = await collection.updateOne({ postId : postId }, { $pull : { postsaved : userId } })
                        // remove post save from user profile
                        const profileCollectionName = 'UserProfiles';
                        const profileCollection = db.collection(profileCollectionName);
                        const saved = await profileCollection.updateOne({ userId : userId }, { $pull : { postsaved : postId } })
                        if(result.acknowledged && saved.acknowledged) {
                            await client.close();
                            return res.status(200).json('unsaved')
                        }
                        else {
                            await client.close();
                            return res.status(400).json('Error getting Posts.');
                        }     
                }           
                else {
                    await client.close();
                    return res.status(400).clearCookie('token').json('user is not authenticated.');        
                }
            }
        })
    }
    catch(e) {        
        await client.close();
        return res.status(400).json('Error');
    }
})

app.listen(PORT, console.log(`Server is listening ${PORT}`));
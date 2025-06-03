import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens= async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken =user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}


    } catch (error) {
        throw new apiError(500,"Something went wrong while genrating refresh and access token")
    }
}

const registerUser= asyncHandler( async(req ,res)=>{
    //get user detail from frontend
    //validation - not empty
    //check if user already exists: username. email
    //check for images,check for avatar
    //upload them to cloudinary,avatar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return res

    const {fullName,email,username,password,phone,store}=req.body
    
    

    if ([fullName, email, username, password, phone, store].some((field) => typeof field === 'string' && field.trim() === "")) {
    throw new apiError(400, "all fields are required");
}


    const existedUser=await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new apiError(409,"user with email and username esisit")
    }
    
    const user =await User.create({
        fullName,
        email,
        password,
        username,
        phone,
        store
    })


    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!createdUser) throw new apiError(500,"something Went wrong while regstering user")

    return res.status(201).json(

        new apiResponse(200,createdUser,"user registered successfully")
    )
    
    

})

const loginUser =asyncHandler(async(req,res)=>{
    //req body -data
    //cehck if user exist
    //check if all credentials are same
    //give error if not same
    //generate access and refresh token
    //send cookie
    //login the user
    //if user doesn't exist ask them to register

    const {email,username,password}=req.body
    

    if(!username && !email){
        throw new apiError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or: [{username},{email}]
    })

    
    
    if(!user){
        throw new apiError(404,"user does not exist")
    }

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new apiError(401,"invalid user credentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    const LoggedInUser=await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200).cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new apiResponse(200,{user:LoggedInUser,accessToken,refreshToken},
            "User Logged in user"
        )
    )

})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken= asyncHandler(async(req,res)=>{

    const incomingRefreshToken =req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new apiError(401,"unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET
        )
    
        const user =  await User.findById(decodedToken?._id)
    
        if(!user){
            throw new apiError(401,"invalid refresh token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new apiError(401,"refresh token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
    
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new apiResponse(
                200,
                {accessToken,refreshToken:newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new apiError(401,error?.message || "invalid refresh Token")
    }
})

const changeCurrentPassword= asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body
    

    const user = await User.findById(req.user?._id)

    
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new apiError(400,"Old password is invalid")
    }

    user.password=newPassword
    
    await user.save({validateBeforeSave:false})

    return res.status(200).json(new apiResponse(200, {},"password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200)
    .json(200,req.user,"current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName,email,phone,username} =req.body

    if(!fullName || !email || !phone || !username){
        throw new apiError(400,"Fields are required")
    }

    const user=User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email,
                phone:phone,
                username:username
            }
        },
        {new:true}

    ).select("-password ")

    return res.status(200).json(
        new apiResponse(200,user,"Account details updated successfully")
    )
})


export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails}
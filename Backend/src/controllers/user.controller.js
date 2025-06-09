import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(500, "Error generating tokens");
  }
};

// REGISTER
const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password, phone, store } = req.body;

  if (
    !fullName || !email || !username || !password || !phone ||
    !store?.name || !store?.address || !store?.gstin
  ) {
    throw new apiError(400, "All fields including store details are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "User with email or username already exists");
  }

  const user = await User.create({ fullName, email, password, username, phone, store });

  const createdUser = await User.findById(user._id).select("-password -refreshToken");
  if (!createdUser) throw new apiError(500, "User registration failed");

  return res.status(201).json(new apiResponse(200, createdUser, "User registered successfully"));
});

// LOGIN
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new apiError(400, "Username or Email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new apiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
  const LoggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new apiResponse(200, { user: LoggedInUser, accessToken, refreshToken }, "User logged in successfully"));
});

// LOGOUT
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(200)
    .json(new apiResponse(200, {}, "User logged out successfully"));
});

// REFRESH TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);

    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new apiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .status(200)
      .json(new apiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed successfully"));
  } catch (error) {
    throw new apiError(401, "Invalid refresh token");
  }
});

// GET CURRENT USER
const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new apiResponse(200, { user: req.user }, "Current user fetched successfully"));
});

// UPDATE ACCOUNT DETAILS
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, phone, username } = req.body;

  if (!fullName || !email || !phone || !username) {
    throw new apiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { fullName, email, phone, username } },
    { new: true }
  ).select("-password -refreshToken");

  return res.status(200).json(new apiResponse(200, user, "Account updated successfully"));
});

// CHANGE PASSWORD
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new apiError(400, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new apiResponse(200, {}, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetails,
  changeCurrentPassword,
};

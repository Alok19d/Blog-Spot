import { z } from 'zod';
import UserModel from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'

export const signup = async (req, res) => {
  try {
    const registerSchema = z.object({
      firstname: z.string().min(3, {message: "First name must be atleast 3 characters long"}),
      lastname: z.string().optional(),
      email: z.string().email({message: "Invalid email format"}),
      password: z.string().min(6, {message: "Password must be at least 6 characters long"}),
    });

    const { firstname, lastname, email, password } = req.body;

    /* Input Validation */
    const validateUser = registerSchema.parse({
      firstname,
      lastname,
      email,
      password
    });

    /* Check if User Already Exists */
    const userExists = await UserModel.findOne({ email });
    if (userExists){
      res
      .status(409)
      .json({
        success: false,
        message: "User Already Exists. Please Login!"
      });
      return;
    }

    /* Registering New User */
    await UserModel.create({
      fullname: {
        firstname,
        lastname
      },
      email,
      password
    });

    res
    .status(201)
    .json({
      success: true,
      message: "Registration successful! You can now log in."
    });
  } catch (error) {
    console.log(error);
    if(error instanceof z.ZodError){
      res
      .status(400)
      .json({
        success: false,
        message: error.errors[0]?.message || "Input Validation Error",
        error: error
      });
      return;
    }
    
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to register user at this time.",
      error: error
    });
  }
}

export const signin = async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().email({message: "Invalid email format"}),
      password: z.string().min(6, {message: "Password must be at least 6 characters long"}),
    });

    const { email, password } = req.body;

    /* Input Validation */
    const validateUser = loginSchema.parse({
      email,
      password
    });

    /* Check if User Already Exists */
    const user = await UserModel.findOne({ email }).select('+password');

    if (!user) {
      res
      .status(401)
      .json({
        success: false,
        message: "Invalid Credentials"
      });
      return;
    }

    /* Validating User Password */
    const isPasswordValid = await user.comparePassword(password);
    if(!isPasswordValid){
      res
      .status(401)
      .json({
        success: false,
        message: "Invalid Credentials"
      });
      return;
    }
    
    /* Generating JWT Token */
    const token = await user.generateJWT();
    const loggedUser = await UserModel.findById(user._id);

    if(!loggedUser){
      res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong while logging User",
      });
      return;
    }

    res
    .status(200)
    .json({
      success: true,
      data: {
        user: loggedUser,
        token
      },
      message: "Login Successful.",
    });
  } catch (error) {
    console.log(error);
    if(error instanceof z.ZodError){
      res
      .status(400)
      .json({
        success: false,
        message: error.errors[0]?.message || "Input Validation Error",
        error: error
      });
      return;
    }
    
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to log in at this time.",
      error: error
    });
  }
}

export const google = async (req, res) => {
  try {
    const googleUserSchema = z.object({
      firstname: z.string().min(3, {message: "First name is required"}),
      lastname: z.string().optional(),
      email: z.string().email({message: "Invalid email format"}),
      profileImg: z.string()
    });

    const { firstname, lastname, email, profileImg } = req.body;

    /* Input Validation */
    const validateUser = googleUserSchema.parse({
      firstname,
      lastname,
      email,
      profileImg
    });

    /* Check if User Already Exists */
    const user = await UserModel.findOne({ email });

    if(user){
      const token = await user.generateJWT();

      res
      .status(200)
      .json({
        success: true,
        data: {
          user,
          token
        },
        message: "Login Successful."
      });
      return;
    }

    /* Registering New User */
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

    const newUser = await UserModel.create({
      fullname: {
        firstname,
        lastname
      },
      email,
      password: generatedPassword,
      profileImg
    });

    const token = await newUser.generateJWT();
    const loggedUser = await UserModel.findById(newUser._id);

    res
    .status(200)
    .json({
      success: true,
      data: {
        user: loggedUser,
        token
      },
      message: "Login Successful.",
    });
  } catch (error) {
    console.log(error);
    if(error instanceof z.ZodError){
      res
      .status(400)
      .json({
        success: false,
        message: error.errors[0]?.message || "Input Validation Error",
        error: error
      });
      return;
    }
    
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to login user using google at this time.",
      error: error
    });
  }
}

export const profile = async (req, res) => {
  const user = await UserModel.findById(req.userId);
  
  res
  .status(200)
  .json({
    success: true,
    data: {
      user
    },
    message: "User profile fetched successfully.",
  });
}

export const updateProfile = async (req, res) => {
  try {
    const updateUserSchema = z.object({
      firstname: z.string().min(3, {message: "First name must be atleast 3 characters long"}).optional(),
      lastname: z.string().optional(),
      email: z.string().email({message: "Invalid email format"}).optional(),
      bio: z.string().optional(),
      website: z.string().optional(),
      location: z.string().optional(),
      twitter: z.string().optional(),
      github: z.string().optional()
    });

    const { firstname, lastname, email, bio, website, location, twitter, github } = req.body;

    /* Input Validation */
    const validateUser = updateUserSchema.parse({
      firstname,
      lastname,
      email,
      bio,
      website,
      location,
      twitter,
      github
    });

    /* Updating User Profile */
    const updatedUser = await UserModel.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          ...(firstname || lastname) && {
            fullname: {
              ...(firstname) && { firstname },
              ...(lastname) && { lastname },
            }
          },
          ...(email) && { email },
          ...(bio) && { bio },
          ...(website) && { website },
          ...(location) && { location },
          ...(twitter) && { twitter },
          ...(github) && { github },
          ...(location) && { location }
        }
      },
      { 
        new: true 
      }
    );

    res
    .status(200)
    .json({
      success: true,
      data: {
        user: updatedUser
      },
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.log(error);
    if(error instanceof z.ZodError){
      res
      .status(400)
      .json({
        success: false,
        message: error.errors[0]?.message || "Input Validation Error",
        error: error
      });
      return;
    }
    
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to update profile.",
      error: error
    });
  }
}

export const updatePassword = async(req, res) => {
  try {
    const changePasswordSchema = z.object({
      password: z.string().min(6, {message: "Password must be at least 6 characters long"}),
      newPassword: z.string().min(6, {message: "Password must be at least 6 characters long"}),
    });
    
    const {password, newPassword} = req.body;

    /* Input Validation */
    const validateUser = changePasswordSchema.parse({
      password,
      newPassword
    });

    /* Fetching User from Database */
    const user = await UserModel.findById(req.userId).select('+password');

    /* Validating User Password */
    const isPasswordValid = await user.comparePassword(password);

    if(!isPasswordValid){
      res
      .status(403)
      .json({
        success: false,
        message: "Invalid Credentials"
      });
      return;
    }

    /* Updating User Password */
    user.password = newPassword;
    await user.save();

    res
    .status(200)
    .json({
      success: true,
      message: "Password Changed Successfully"
    });
  } catch (error) {
    console.log(error);
    if(error instanceof z.ZodError){
      res
      .status(400)
      .json({
        success: false,
        message: error.errors[0]?.message || "Input Validation Error",
        error: error
      });
      return;
    }
    
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to change password.",
      error: error
    });
  }
}

export const updateAvatar = async (req, res) => {
  try {
    const profileImageLocalPath = req.file?.path;

    if(!profileImageLocalPath){
      res
      .status(400)
      .json({
        success: false,
        message: "Profile image is required."
      });
      return;
    }

    let profileImg = await uploadOnCloudinary(profileImageLocalPath);

    if(!profileImg || !profileImg.url){
      res
      .status(500)
      .json({
        success: false,
        message: "Failed to upload profile image. Please try again."
      });
      return;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      req.userId,
      {
        profileImg: profileImg.url
      },
      {
        new: true
      }
    );

    res
    .status(200)
    .json({
      success: true,
      data: {
        user: updatedUser
      },
      message: "Profile image updated successfully.",
    });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({
      success: false,
      message: "Server error: Unable to update profile image.",
      error: error
    });
  }
}

export const deleteUser = async (req, res) => {
  await UserModel.findByIdAndDelete(req.userId);
  
  res
  .status(200)
  .json({
    success: true,
    message: "User account deleted successfully.",
  });
}
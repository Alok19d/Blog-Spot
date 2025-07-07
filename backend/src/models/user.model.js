import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        required: true
      },
      lastname: {
        type: String
      }
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    profileImg: {
      type: String,
      default: ''
    },
    bio: {
      type: String
    },
    active: {
      type: Boolean,
      default: false
    },
    website: {
      type: String
    },
    location: {
      type: String
    },
    twitter: {
      type: String
    },
    github: {
      type: String
    }
  },
  {
    timestamps:true
  }
);

userSchema.pre('save', async function(next){
  if(!this.isModified('password')) return;

  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password){
  return await bcryptjs.compare(password, this.password);
}

userSchema.methods.generateJWT = function(){

  return jwt.sign(
    {
      id: this._id,
      email: this.email
    },
    process.env.JWT_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_TOKEN_EXPIRY 
    }
  )
}

const UserModel = mongoose.model('User',userSchema)
export default UserModel;
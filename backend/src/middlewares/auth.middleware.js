import jwt from 'jsonwebtoken'
import UserModel from "../models/user.model.js";

export async function authUser(req, res, next){
  try {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')){
      res
      .status(401)
      .json({
        statusCode: 401,
        success: false,
        message: "Unauthorized Request",
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    /* Check if token is Blacklisted */

    const decodedToken = jwt.verify(token, process.env.JWT_TOKEN_SECRET);

    const user = await UserModel.findById(decodedToken?.id);

    if(!user){
      res
      .status(401)
      .json({
        statusCode: 401,
        success: false,
        message: "Invalid Access Token",
      })
      return;
    }

    req.userId = user._id;
    next();
  } catch (error) {
    console.log(error);
    res
    .status(401)
    .json({
      statusCode: 401,
      success: false,
      message: "Invalid Access Token",
      error: error
    });
    return;
  }
}
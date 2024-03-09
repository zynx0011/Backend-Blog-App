// import { User } from "../models/user.model.js";
// import { ApiError } from "../utils/ApiError.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// import Jwt from "jsonwebtoken";

// export const verifyjwt = asyncHandler(async (req, _, next) => {
//   try {
//     const Token =
//       req.cookies?.accessToken ||
//       req.cookies.refreshToken ||
//       req.header("Authorization")?.replace("Bearer ", "");
//     console.log(Token);
//     if (!Token) {
//       throw new ApiError(404, "Invalid token");
//     }

//     const decoded = Jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);

//     const user = await User.findById(decoded?._id).select(
//       "-password -refreshToken"
//     );

//     if (!user) {
//       throw new ApiError(402, "User not found");
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     throw new ApiError(401, "invalid token error");
//   }
// });

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // Extract token from cookies or header
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.cookies && req.cookies.refreshToken) {
      token = req.cookies.refreshToken;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(404, "Token not found");
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Find user by decoded user id
    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(402, "User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    // Handle errors
    if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Invalid token");
    } else if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Token expired");
    } else {
      throw new ApiError(500, "Internal server error");
    }
  }
});

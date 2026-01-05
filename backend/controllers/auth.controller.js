import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js"

export const signUp = async (req, res, next) => {
  // Log the entire request for debugging
  console.log("=== SIGN-UP REQUEST DEBUG ===")
  console.log("Method:", req.method)
  console.log("URL:", req.url)
  console.log("Headers:", req.headers)
  console.log("Body:", req.body) // This should show your JSON object
  console.log("============================")

  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      const error = new Error("User already exists with this email")
      error.status = 400
      throw error
    }

    // Create new user
    // Hash password before saving
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUsers = await User.create(
      [{ name, email, password: hashedPassword }],
      { session }
    )

    const token = jwt.sign({ userId: newUsers[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: newUsers[0],
      },
    })
  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    next(error)
  }
}
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      const error = new Error("User not found")
      error.status = 404
      throw error
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      const error = new Error("Invalid credentials")
      error.status = 401
      throw error
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    })
    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: { token, user },
    })
  } catch (error) {
    next(error)
  }
}
export const signOut = (req, res, next) => {
  try {
    // Invalidate token logic can be implemented here (e.g., token blacklist)
    res
      .status(200)
      .json({ success: true, message: "User signed out successfully" })
  } catch (error) {
    next(error)
  }
}

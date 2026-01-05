import { SERVER_URL } from "../config/env.js"
import { workflowClient } from "../config/upstash.js"
import Subscription from "../models/subscription.model.js"

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id,
    })

    // Only trigger workflow if Upstash is configured
    let workflowRunId = null
    if (workflowClient) {
      try {
        const result = await workflowClient.trigger({
          url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
          body: {
            subscriptionId: subscription.id,
          },
          headers: {
            "content-type": "application/json",
          },
          retries: 0,
        })
        workflowRunId = result.workflowRunId
      } catch (workflowError) {
        // Log workflow error but don't fail the subscription creation
        console.error("Failed to trigger workflow:", workflowError.message)

        // Handle connection errors
        if (workflowError.cause?.code === "ECONNREFUSED") {
          console.error(
            "❌ Cannot connect to QStash. Please check your QSTASH_URL environment variable."
          )
          console.error("   Expected: https://qstash.upstash.io/v2")
          console.error(`   Current: ${process.env.QSTASH_URL || "not set"}`)
        }

        // Handle token/URL mismatch errors
        // Check error message, error object, or stringified error
        const errorMessage =
          workflowError.message ||
          workflowError.error?.error ||
          workflowError.error ||
          JSON.stringify(workflowError)
        const errorStr =
          typeof errorMessage === "string"
            ? errorMessage
            : JSON.stringify(errorMessage)

        // Handle loopback/localhost URL errors
        if (
          errorStr.includes("loopback address") ||
          errorStr.includes("loopback") ||
          errorStr.includes("localhost") ||
          errorStr.includes("127.0.0.1") ||
          errorStr.includes("::1")
        ) {
          console.error("")
          console.error("❌ QStash Cannot Call Localhost URLs!")
          console.error("")
          console.error(
            "QStash is a cloud service and cannot call back to localhost addresses."
          )
          console.error("")
          console.error("Your SERVER_URL is set to:", process.env.SERVER_URL)
          console.error("")
          console.error("Solutions:")
          console.error("")
          console.error(
            "Option 1: Use ngrok (Recommended for Local Development)"
          )
          console.error("   1. Install ngrok: https://ngrok.com/download")
          console.error("   2. Start your server on port 3000")
          console.error("   3. Run: ngrok http 3000")
          console.error(
            "   4. Copy the https URL (e.g., https://abc123.ngrok.io)"
          )
          console.error("   5. Set in .env.development.local:")
          console.error("      SERVER_URL=https://abc123.ngrok.io")
          console.error("")
          console.error("Option 2: Deploy Your Server")
          console.error(
            "   Deploy your backend to a public URL (Heroku, Railway, etc.)"
          )
          console.error("   and set SERVER_URL to that public URL")
          console.error("")
          console.error("Option 3: Skip Workflows in Development")
          console.error(
            "   Workflows will be skipped if QStash is not properly configured."
          )
          console.error("   Subscription creation will still work.")
          console.error("")
        } else if (
          errorStr.includes("development server token") ||
          errorStr.includes("development server") ||
          errorStr.includes("development server token with QStash")
        ) {
          console.error("")
          console.error("❌ QStash Token/URL Mismatch Detected!")
          console.error("")
          console.error(
            "You're using a development token with production URL (or vice versa)."
          )
          console.error("")
          console.error("To fix this, choose ONE of the following options:")
          console.error("")
          console.error("Option 1: Use Production QStash (Recommended)")
          console.error("   1. Go to https://console.upstash.com/")
          console.error("   2. Navigate to QStash section")
          console.error("   3. Copy your production QSTASH_TOKEN")
          console.error("   4. Set in .env.development.local:")
          console.error("      QSTASH_URL=https://qstash.upstash.io/v2")
          console.error("      QSTASH_TOKEN=your-production-token-here")
          console.error("")
          console.error("Option 2: Use Local Development Server")
          console.error("   1. Start local QStash dev server (if you have one)")
          console.error("   2. Set in .env.development.local:")
          console.error("      QSTASH_URL=http://127.0.0.1:8080")
          console.error("      QSTASH_TOKEN=your-dev-token-here")
          console.error("")
          console.error(
            `Current config: QSTASH_URL=${process.env.QSTASH_URL || "not set"}`
          )
        }
      }
    }

    res.status(201).json({
      success: true,
      data: subscription,
      ...(workflowRunId && { workflowRunId }),
    })
  } catch (error) {
    next(error)
  }
}

export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      const error = new Error("You are not the owner of this account")
      error.status = 401
      throw error
    }
    const subscriptions = await Subscription.find({ user: req.params.id })
    res.status(200).json({
      success: true,
      data: subscriptions,
    })
  } catch (error) {
    next(error)
  }
}

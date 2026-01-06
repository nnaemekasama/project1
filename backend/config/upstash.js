import { Client as WorkflowClient } from "@upstash/workflow"
import { QSTASH_TOKEN, QSTASH_URL } from "./env.js"

// Only create workflow client if QStash is properly configured
let workflowClient = null

if (QSTASH_URL && QSTASH_TOKEN) {
  // Validate that QSTASH_URL is not pointing to localhost (unless intentionally configured)
  if (QSTASH_URL.includes("127.0.0.1") || QSTASH_URL.includes("localhost")) {
    console.warn(
      "⚠️  Warning: QSTASH_URL is set to a local address. Make sure you have a local QStash server running, or set QSTASH_URL to https://qstash.upstash.io/v2"
    )
  }

  // Validate that production URL includes /v2
  // if (
  //   QSTASH_URL.includes("qstash.upstash.io") &&
  //   !QSTASH_URL.endsWith("/v2") &&
  //   !QSTASH_URL.endsWith("/v2/")
  // ) {
  //   console.warn(
  //     "⚠️  Warning: QSTASH_URL should end with /v2. Expected: https://qstash.upstash.io/v2"
  //   )
  //   console.warn(`   Current: ${QSTASH_URL}`)
  // }

  try {
    workflowClient = new WorkflowClient({
      baseUrl: QSTASH_URL,
      token: QSTASH_TOKEN,
    })
    console.log("✅ Upstash Workflow client initialized successfully")
    console.log(`   QSTASH_URL: ${QSTASH_URL}`)
  } catch (error) {
    console.error(
      "❌ Failed to initialize Upstash Workflow client:",
      error.message
    )
    console.error("   Error details:", error)
  }
} else {
  console.warn(
    "⚠️  Upstash QStash is not configured. Workflow features will be disabled."
  )
  console.warn(`   QSTASH_URL: ${QSTASH_URL ? "SET" : "NOT SET"}`)
  console.warn(`   QSTASH_TOKEN: ${QSTASH_TOKEN ? "SET" : "NOT SET"}`)
  console.warn(
    "   Set QSTASH_URL and QSTASH_TOKEN in your environment variables to enable workflows."
  )
}

export { workflowClient }

import dayjs from "dayjs"
import { createRequire } from "module"
const require = createRequire(import.meta.url)
const { serve } = require("@upstash/workflow/express")
import Subscription from "../models/subscription.model.js"
import { sendReminderEmail } from "../utils/send-email.js"

const REMINDERS = [7, 5, 2, 1]

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload
  console.log(`Workflow triggered for subscription: ${subscriptionId}`)
  
  const subscription = await fetchSubscription(context, subscriptionId)

  if (!subscription) {
    console.log(`Subscription ${subscriptionId} not found`)
    return
  }

  if (subscription.status !== "active") {
    console.log(`Subscription ${subscriptionId} is not active (status: ${subscription.status})`)
    return
  }

  const renewalDate = dayjs(subscription.renewalDate)
  const now = dayjs()

  console.log(`Renewal date: ${renewalDate.format("YYYY-MM-DD")}, Today: ${now.format("YYYY-MM-DD")}`)

  if (renewalDate.isBefore(now)) {
    console.log(
      `Renewal date has passed for subscription ${subscriptionId}. Stopping workflow.`
    )
    return
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day")
    const reminderDateStr = reminderDate.format("YYYY-MM-DD")
    const todayStr = now.format("YYYY-MM-DD")

    console.log(`Checking reminder ${daysBefore} days before (${reminderDateStr})`)

    // If reminder date is in the past or today, send immediately
    if (reminderDate.isBefore(now) || reminderDate.isSame(now, "day")) {
      console.log(`Reminder ${daysBefore} days before is due now (${reminderDateStr} <= ${todayStr}), sending immediately`)
      await triggerReminder(
        context,
        `${daysBefore} days before reminder`,
        subscription
      )
    } 
    // If reminder date is in the future, schedule it
    else if (reminderDate.isAfter(now)) {
      console.log(`Scheduling reminder ${daysBefore} days before for ${reminderDateStr}`)
      await sleepUntilReminder(
        context,
        `Reminder ${daysBefore} days before`,
        reminderDate
      )
      // After sleeping, check if we should send the reminder
      const currentDate = dayjs()
      if (currentDate.isSame(reminderDate, "day") || currentDate.isAfter(reminderDate)) {
        await triggerReminder(
          context,
          `${daysBefore} days before reminder`,
          subscription
        )
      }
    }
  }
  
  console.log(`Workflow completed for subscription ${subscriptionId}`)
})

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email")
  })
}

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${label} reminder at ${date}`)
  await context.sleepUntil(label, date.toDate())
}

const triggerReminder = async (context, label, subscription) => {
  return await context.run(label, async () => {
    console.log(`Triggering ${label} reminder`)

    await sendReminderEmail({
      to: subscription.user.email,
      type: label,
      subscription,
    })
  })
}

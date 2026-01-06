import { emailTemplates } from "./email-template.js"
import dayjs from "dayjs"
import transporter, { accountEmail } from "../config/nodemailer.js"

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type) {
    throw new Error("Missing required parameters: to and type are required")
  }

  if (!subscription) {
    throw new Error("Subscription is required")
  }

  const template = emailTemplates.find((t) => t.label === type)

  if (!template) {
    throw new Error(`Invalid email type: ${type}. Available types: ${emailTemplates.map(t => t.label).join(", ")}`)
  }

  // Calculate days left until renewal
  const renewalDate = dayjs(subscription.renewalDate)
  const daysLeft = Math.max(0, renewalDate.diff(dayjs(), "day"))

  // Format price (subscription model doesn't have currency, default to $)
  const currency = subscription.currency || "$"
  const price = `${currency}${subscription.price} (${subscription.frequency})`

  const mailInfo = {
    userName: subscription.user?.name || "User",
    subscriptionName: subscription.name,
    renewalDate: renewalDate.format("MMM D, YYYY"),
    planName: subscription.name,
    price: price,
    paymentMethod: subscription.paymentMethod,
    accountSettingsLink: "#", // TODO: Add actual link
    supportLink: "#", // TODO: Add actual link
    daysLeft: daysLeft,
  }

  const message = template.generateBody(mailInfo)
  const subject = template.generateSubject(mailInfo)

  const mailOptions = {
    from: accountEmail,
    to: to,
    subject: subject,
    html: message,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log("Email sent successfully:", info.response)
    return info
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

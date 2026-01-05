import { Router } from "express"
import { sendReminders } from "../controllers/workflow.controller.js"

const workflowRouter = Router()

workflowRouter.post("/subscription/reminder", sendReminders)
workflowRouter.get("/", (req, res) => {
  res.send({ title: "GET workflow status" })
})

export default workflowRouter

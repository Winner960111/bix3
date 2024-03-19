const { userRoutes } = require("../services/users");
const { jobopeningRoutes } = require("../services/jobopening");
const { rolesRoutes } = require("../services/roles");
const { companyRoutes } = require("../services/company");
const { bdmRoutes } = require("../services/bdm");
const { recruiterRoutes } = require("../services/recruiter");
const { candidateRoutes } = require("../services/candidate");
const { adminRoutes } = require("../services/admin");
const { jobapplyingRoutes } = require("../services/jobapplying");
const { contactRoutes } = require("../services/contact");
const { jobsaveRoutes } = require("../services/jobsaved");
const { planRoutes } = require("../services/plan");
const { planAssignRoutes } = require("../services/planassign");
const { smtpRoutes } = require("../services/smtp");
const { freelancerecruiterRoutes } = require("../services/freelancerecruiter");
const { emailTemplateRoutes } = require("../services/emailtemplate");
const { emailActivityRoutes } = require("../services/emailactivity");
const { messageRoutes } = require("../services/message");
const { aiRoutes } = require("../services/airecruiter");

const initialize = (app) => {
  app.use("/api/v1/admin", adminRoutes);
  app.use("/api/v1/company", companyRoutes);
  app.use("/api/v1/bdm", bdmRoutes);
  app.use("/api/v1/recruiter", recruiterRoutes);
  app.use("/api/v1/candidate", candidateRoutes);
  app.use("/api/v1/job", jobopeningRoutes);
  app.use("/api/v1/job-applying", jobapplyingRoutes)
  app.use("/api/v1/role", rolesRoutes)
  app.use("/api/v1/user", userRoutes)
  app.use("/api/v1/contact", contactRoutes)
  app.use("/api/v1/job-save", jobsaveRoutes)
  app.use("/api/v1/plan", planRoutes)
  app.use("/api/v1/plan-assign", planAssignRoutes)
  app.use("/api/v1/smtp", smtpRoutes)
  app.use("/api/v1/freelance", freelancerecruiterRoutes)
  app.use("/api/v1/email", emailTemplateRoutes)
  app.use("/api/v1/emailactivity", emailActivityRoutes)
  app.use("/api/v1/message", messageRoutes);
  app.use("/api/v1/recruiters", aiRoutes);
  // app.use("/authError", (req, res, next) => {
  //   return next(new Error("DEFAULT_AUTH"));
  // });

  app.get("/ping", (req, res) => {
    res.status(200).send({
      success: true,
      statusCode: 200,
    });
  });
};

module.exports = { initialize };

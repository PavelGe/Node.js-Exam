const { body, validationResult } = require("express-validator");

module.exports = async (req, res, next) => {
  body("email").isEmail().withMessage("Email must be a valid email");

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors });
  } else {
    next();
    console.log("validator working");
  }
};

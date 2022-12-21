const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const userController = require("../controllers/Login&SignUp");
const ticketController = require("../controllers/tickets");
const validator = require("../middleware/validator");

// USER ROUTES
router.post("/signUp", userController.CREATE_USER);
router.post("/login", userController.USER_LOGIN);
router.get("/getNewJwtToken", userController.GET_TOKEN);
router.get("/getAllUsers", auth, userController.GET_ALL_USERS);
router.get("/getUserById/:id", auth, userController.GET_USER_BYID);

// TICKET ROUTES
router.post("/createTicket", ticketController.CREATE_TICKET);
router.post("/buyTicket", auth, ticketController.BUY_TICKET);
router.get(
  "/getAllUsersWithTickets",
  auth,
  ticketController.GET_USERS_WITH_TICKETS
);
router.get(
  "/getUserByIdWithTickets/:id",
  auth,
  ticketController.GET_USER_BY_ID_WITH_TICKETS
);

module.exports = router;

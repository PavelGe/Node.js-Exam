const jwt = require("jsonwebtoken");
const ticketSchema = require("../models/tickets");
const UserSchema = require("../models/users");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports.CREATE_TICKET = async (req, res) => {
  const ticket = new ticketSchema({
    title: req.body.title,
    ticket_price: req.body.ticket_price,
    from_location: req.body.from_location,
    to_location: req.body.to_location,
    to_location_photo_url: req.body.to_location_photo_url,
  });

  ticket.save().then((result) => {
    ticketSchema.updateOne({ _id: result._id }, { id: result._id }).exec();
    return res.status(200).json({
      statusMessage: "New Ticket Created!",
      result: result,
    });
  });
};

module.exports.BUY_TICKET = async (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) {
      ticketSchema.findOne({ _id: req.body.ticket_id }).then((ticket) => {
        console.log(ticket.ticket_price);
        const ticketPrice = ticket.ticket_price;

        UserSchema.findOne({ _id: req.body.user_id }).then((user) => {
          const userBalance = user.money_balance;
          console.log(userBalance);

          const moneyOperation = () => {
            if (userBalance >= ticketPrice) {
              return userBalance - ticketPrice;
            } else {
              return res
                .status(400)
                .json({ statusMessage: "Insufficient Account Balance" });
            }
          };

          UserSchema.updateOne(
            { _id: req.body.user_id },
            { money_balance: moneyOperation() }
          ).exec();
          UserSchema.updateOne(
            { _id: req.body.user_id },
            { $push: { bought_tickets: req.body.ticket_id } }
          ).exec();

          return res
            .status(200)
            .json({ statusMessage: "Ticket Purchased Successfully" });
        });
      });
    } else {
      return res.status(404).json({
        statusMessage: "User is not authorized to purchase the ticket",
      });
    }
  });
};

module.exports.GET_USERS_WITH_TICKETS = async function (req, res) {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (!err) {
      const data = await ticketSchema.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "id",
            foreignField: "bought_tickets",
            as: "users_with_tickets",
          },
        },
      ]);
      return res.status(200).json({ user: data });
    } else {
      return res.status(404).json({ response: "User not found" });
    }
  });
};

module.exports.GET_USER_BY_ID_WITH_TICKETS = async function (req, res) {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (!err) {
      const data = await UserSchema.aggregate([
        {
          $lookup: {
            from: "tickets",
            localField: "bought_tickets",
            foreignField: "id",
            as: "tickets",
          },
        },
        { $match: { _id: ObjectId(req.params.id) } },
      ]).exec();
      return res.status(200).json({ data: data });
    } else {
      return res.status(404).json({ response: "User not found" });
    }
  });
};

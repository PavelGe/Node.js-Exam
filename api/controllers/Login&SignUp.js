const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserSchema = require("../models/users");

module.exports.CREATE_USER = async (req, res) => {
  
  // const passwordCheck = () => {
  //   const userPassword = req.body.password;
  //   if (userPassword.length < 6 || !/\d/.test(userPassword)) {
  //     return res.status(401).json({
  //       status: " Password has to be 6 characters long and include 1 number",
  //     });
  //   }
  //   return userPassword;
  // };

  const capitalizeName = () => {
    const userName = req.body.name;
    return userName.charAt(0).toUpperCase() + userName.slice(1);
  };

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const user = new UserSchema({
    name: capitalizeName(),
    email: req.body.email,
    password: hashedPassword,
    bought_tickets: [],
    money_balance: req.body.money_balance,
  });

  const token = jwt.sign(
    {
      email: user.email,
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "2h" },
    { algorythm: "RS256" }
  );

  const refreshToken = jwt.sign(
    {
      email: user.email,
      userId: user._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
    { algorythm: "RS256" }
  );

  user
    .save()
    .then((result) => {
      return res.status(200).json({
        response: "User was created successfully",
        user: result,
        jwt_token: token,
        jwt_refresh_token: refreshToken,
      });
    })
    .catch((err) => {
      console.log("err", err);
      res.status(500).json({ response: "Failed" });
    });
};

module.exports.USER_LOGIN = async (req, res) => {
  try {
    const user = await UserSchema.findOne({ email: req.body.email });

    const isPasswordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );

    console.log(user);

    if (isPasswordMatch) {
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" },
        { algorythm: "RS256" }
      );

      const refreshToken = jwt.sign(
        {
          email: user.email,
          userId: user._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" },
        { algorythm: "RS256" }
      );

      return res.status(200).json({
        status: "login successfull",
        user: user,
        jwt_token: token,
        jwt_refresh_token: refreshToken,
      });
    }
    return res.status(401).json({ status: "login failed" });
  } catch (err) {
    console.log("req.body", req.body);

    console.log("err", err);
    return res.status(401).json({ status: "login failed" });
  }
};

module.exports.GET_TOKEN = async (req, res) => {
  const refresh_token = req.headers.jwt_refresh_token;

  jwt.verify(refresh_token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) {
      const token = jwt.sign(
        {
          email: decoded.email,
          userId: decoded._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" },
        { algorythm: "RS256" }
      );

      return res
        .status(200)
        .json({ token: token, refresh_token: refresh_token, user: decoded });
    } else {
      return res.status(401).json({ response: "RefreshToken is invalid" });
    }
  });
};

module.exports.GET_ALL_USERS = async function (req, res) {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) {
      UserSchema.find()
        .sort({ name: 1 })
        .then((results) => {
          return res.status(200).json({ users: results });
        });
    } else {
      return res.status(401).json({ response: "Unauthorized" });
    }
  });
};

module.exports.GET_USER_BYID = async function (req, res) {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (!err) {
      UserSchema.find({ _id: req.params.id }).then((results) => {
        return res.status(200).json({ users: results });
      });
    } else {
      return res.status(404).json({ response: "User not found" });
    }
  });
};

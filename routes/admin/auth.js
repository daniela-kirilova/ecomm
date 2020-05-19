const express = require("express");

const { check, validationResult, body } = require("express-validator");
const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const router = express.Router();

router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  [
    check("email")
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage("Must be valid email")
      .custom(async (email) => {
        const existingUser = await usersRepo.getOneBy({ email });
        if (existingUser) {
          throw new Error("Email is use");
        }
      }),

    check("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),

    check("passwordConfirmation")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters")
      .custom((passwordConfirmation, { req }) => {
        if (passwordConfirmation !== req.body.password) {
          throw new Error("Passwords must match");
        }
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    const { email, password, passwordConfirmation } = req.body;

    if (password !== passwordConfirmation) {
      return res.send("Passwords must match");
    }
    const user = await usersRepo.create({ email, password });
    // store the id of the user inside the users cookie
    req.session.idOfUser = user.id;
    res.send("Account created!!");
  }
);

router.get("/signin", (req, res) => {
  res.send(signinTemplate({ req }));
});

router.get("/signout", (req, res) => {
  req.session = null;
  res.send("You are logged out");
});
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await usersRepo.getOneBy({ email });
  if (!user) {
    return res.send("Email not found");
  }
  const validPassword = await usersRepo.comparePasswords(
    user.password,
    password
  );
  if (!validPassword) {
    return res.send("Invalid password");
  }
  req.session.idOfUser = user.id;
  res.send("You are signed in");
});
module.exports = router;

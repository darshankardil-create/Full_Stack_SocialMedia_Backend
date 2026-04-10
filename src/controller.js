import { UserSchema, generatetoken, UsersPostSchema } from "./Schema.js";
import jwt from "jsonwebtoken";

export async function Userinfodoc(req, res) {
  try {
    const find = await UserSchema.findById(req.params.id).select("-Password"); //remove credential befor sending to user

    console.log(find);

    if (!find) {
      return res
        .status(404)
        .json({ message: "Id not found in Userinfo collection" });
    }

    res.status(200).json({
      message: "Successfully found doc in Userinfo collection",
      doc: find,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to return doc by findById query",
      error: error.message,
    });

    console.log(error);
  }
}

export async function getallpost(req, res) {
  try {
    const docsfromUsersPost = await UsersPostSchema.find()
      .sort({
        createdAt: -1, // new to old
      })
      .skip(Number(req.params.offset)) //scroll based pagination
      .limit(Number(req.params.limit));

    res.status(200).json({
      message: "Successfull",
      docsfromUsersPost: docsfromUsersPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed", error: error.message });
  }
}

// the token payload contains the userinfo collection's doc id
// this id is used to identify the user and track their all post

export async function verifytoken(req, res) {
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      const token = req.headers.authorization.split(" ")[1];

      const payload = jwt.verify(token, process.env.JWT_SECRET);

      if (!payload) {
        return res
          .status(401)
          .json({ message: "Invalid token please signup again" });
      }

      res.status(200).json({
        message: "Successfully verified token and send payload as res",
        payload: payload,
      });
    } else {
      res.status(404).send("token not found in header");
    }
  } catch (error) {
    res.status(500).json({ message: "Failed", error: error.message });
    console.log(error);
  }
}

// the token payload contains the userinfo collection's doc id
// this id is used to identify the user and track their all post
// during login if the user exists and the password matches using bcrypt compare
// the doc id is added to the token

// in sign up the id is obtained after save() and in login it comes from findOne query

export async function login(req, res) {
  try {
    const { UserName, Password } = req.body;

    const find = await UserSchema.findOne({ UserName });

    if (find) {
      const verifypass = await find.Matchpass(Password);

      if (verifypass) {
        //if password is correct
        const token = generatetoken({ id: find._id });

        return res.status(200).json({ message: "Successfully", token: token }); //send token
      }

      return res
        .status(401)
        .json({ message: "Not authorized wrong credential" });
    }

    return res
      .status(404)
      .json({ message: "Failed,userName does not exist in db" });
  } catch (error) {
    res.status(500).json({ message: "Failed to log-in", error: error.message });
    console.log(error);
  }
}

export async function sendtokenforsignup(req, res) {
  try {
    const { UserName, Password, Name } = req.body;

    const create = new UserSchema({ UserName, Password, Name });

    const made = await create.save();

    // console.log(made);

    const token = generatetoken({ id: made._id }); //doc id from user collection

    // console.log(token);

    res.status(201).json({
      message: "Successfull token generated and send as res",
      token: token,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({
        message: "UserName already exist please try another one",
        error: error.message,
      });
    }
    console.log(error);
    res.status(500).json({ message: "Failed", error: error.message });
  }
}

export async function getonlymypost(req, res) {
  try {
    const myposts = await UsersPostSchema.find({ UserName: req.params.userid });

    if (!myposts) {
      res.status(404).send(`No post found for userid:${req.params.userid}`);
    }

    res.status(200).json({
      message: "Successfully find all post from route getonlymypost",
      myposts: myposts,
    });
  } catch (error) {
    console.log(error);
    res
      .status(404)
      .json({ message: "something went wrong", error: error.message });
  }
}

export async function deleteac(req, res) {
  try {
    const findtodele = await UserSchema.findByIdAndDelete(req.params.userid);

    if (!findtodele) {
      return res
        .status(404)
        .json({ message: `Failed ${req.params.userid} id not found in db` });
    }

    res
      .status(200)
      .json({ message: `${findtodele.UserName} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error });

    console.log(error);
  }
}

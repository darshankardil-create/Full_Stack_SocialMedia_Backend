import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const schemaforuser = mongoose.Schema(
  {
    Name: {
      type: String,
    },
    Password: {
      type: String,
    },
    UserName: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true },
);

schemaforuser.pre("save", async function () {
  if (this.isModified("Password")) {
    const salt = await bcrypt.genSalt(10);

    this.Password = await bcrypt.hash(this.Password, salt);
  }
});

schemaforuser.methods.Matchpass = async function (livepass) {
  return await bcrypt.compare(livepass, this.Password);
};

export function generatetoken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
}

export const UserSchema = mongoose.model("Userinfo", schemaforuser);

const schemaforuserposts = mongoose.Schema(
  {
    Name: {
      type: String,
    },
    UserName: {
      type: String,
    },
    Imgurl: {
      type: Array,
    },
    TextPost: {
      type: String,
    },
    CommentsonPost: [
      //like and comment
      {
        comment: String,
        name: String,
        username: String,
        time: Date,
        like: Boolean,
      },
    ],
  },
  { timestamps: true },
);

export const UsersPostSchema = mongoose.model("UsersPost", schemaforuserposts);

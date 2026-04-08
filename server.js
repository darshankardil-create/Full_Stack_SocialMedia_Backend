import http from "http";
import { Server } from "socket.io";
import express from "express";
import { connectDB } from "./src/config/mongodb_config.js";
import dotenv from "dotenv";
import router from "./src/routes.js";
import cors from "cors";
import { UsersPostSchema } from "./src/Schema.js";
import { ratelim } from "./src/middleware/ratelimit.js";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

app.use((req, res, next) => {
  console.log(
    `Got ${req.method} req for ${req.url} from ${req.headers.origin}`,
  );
  next();
});

app.set("trust proxy", 1);
app.use("/express", ratelim, router);

const httpserver = http.createServer(app);

const PORT = process.env.PORT || 3000;

async function handleasync() {
  await connectDB();

  httpserver.listen(PORT, () => {
    console.log("Server is live on port:", PORT);
  });
}

handleasync();

const io = new Server(httpserver, {
  cors: "*",
});

io.on("connection", (socket) => {
  console.log(`User with id ${socket.id} connected successfully via socket-io`);

  // post listener

  socket.on("post message", async (data) => {
    // user get access to this data only after verfying token by api call to /verifytoken
    const { messageforpost, imgurl, Username, name } = data;

    try {
      const createDoc = new UsersPostSchema({
        TextPost: messageforpost,
        Imgurl: imgurl,
        UserName: Username,
        Name: name,
      });

      await createDoc.save();

      socket.emit("Status", {
        status: "successfull",
        message: " Post created successfully and data updated to database",
      });

      console.log("message successfully posted");
    } catch (error) {
      socket.emit("Status", { status: "failed", message: error.message });
      console.log(error);
    }
  });

  // comment lisner

  socket.on("comment", async (data) => {
    const { commentobj, postid } = data;

    console.log(commentobj);

    try {
      const findbypostid = await UsersPostSchema.findByIdAndUpdate(postid, {
        $push: {
          CommentsonPost: {
            $each: [commentobj], //push
            $position: 0,
          },
        },
      });

      if (!findbypostid) {
        socket.emit("commentStatus", {
          status: "failed",
          message: "Doc id not found for uploading comment",
        });
        return;
      }

      console.log("commentobj posted successfully");

      if (commentobj.like) {
        socket.emit("commentStatus", {
          status: "successfull",
          message: "Successfully liked the post",
        });
      } else {
        socket.emit("commentStatus", {
          status: "successfull",
          message: "Successfully comment send",
        });
      }
    } catch (error) {
      socket.emit("commentStatus", {
        status: "failed",
        message: error.message,
      });

      console.log(error);
    }
  });

  //unlike

  socket.on("unlike", async (data) => {
    const { commentobj, postid } = data;

    try {
      const findbypostid = await UsersPostSchema.findByIdAndUpdate(postid, {
        $pull: {
          CommentsonPost: {
            username: commentobj.username, //pull
            like: commentobj.like,
          },
        },
      });

      if (!findbypostid) {
        socket.emit("unlikeStatus", {
          status: "failed",
          message: "Doc id not found to unlike ",
        });
        return;
      }

      console.log("commentobj posted successfully");

      socket.emit("unlikeStatus", {
        status: "successfull",
        message: "Successfully unlike",
      });
    } catch (error) {
      socket.emit("unlikeStatus", {
        status: "failed",
        message: error.message,
      });

      console.log(error);
    }
  });
});

const http = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { headers } = require("./headers");
const errHandle = require("./errHandle");
const Post = require("./models/post");

dotenv.config({ path: "./config.env" });
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("資料庫連線成功");
  })
  .catch((err) => {
    console.log(err);
  });

const requestListener = async (req, res) => {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  if (req.url === "/posts" && req.method === "GET") {
    const posts = await Post.find();
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        posts,
      })
    );
    res.end();
  } else if (req.url === "/posts" && req.method === "POST") {
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const newPost = await Post.create({
          content: data.content,
          name: data.name,
        });
        res.writeHead(200, headers);
        res.write(
          JSON.stringify({
            status: "success",
            data: newPost,
          })
        );
        res.end();
      } catch (error) {
        errHandle(res, error);
      }
    });
  } else if (req.url.startsWith("/posts/") && req.method === "PATCH") {
    req.on("end", async () => {
      try {
        const id = req.url.split("/").pop();
        const data = JSON.parse(body);
        if (data.content !== undefined && data.name !== undefined) {
          const updatePost = await Post.findByIdAndUpdate(
            id,
            {
              name: data.name,
              content: data.content,
            },
            { new: true }
          );
          if (updatePost !== null) {
            res.writeHead(200, headers);
            res.write(
              JSON.stringify({
                status: "success",
                data: updatePost,
              })
            );
            res.end();
          } else {
            errHandle(res, "查無ID");
          }
        } else {
          errHandle(res, "欄位錯誤");
        }
      } catch (error) {
        errHandle(res, error);
      }
    });
  } else if (req.url === "/posts" && req.method === "DELETE") {
    await Post.deleteMany({});
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: [],
      })
    );
    res.end();
  } else if (req.url.startsWith("/posts/") && req.method === "DELETE") {
    const id = req.url.split("/").pop();
    const delPost = await Post.findByIdAndDelete(id);
    if (delPost !== null) {
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "success",
          data: delPost,
        })
      );
      res.end();
    } else {
      errHandle(res, "");
    }
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers);
    res.end();
  } else {
    res.writeHead(404, headers);
    res.write(
      JSON.stringify({
        status: "false",
        message: "無此路由",
      })
    );
    res.end();
  }
};
const server = http.createServer(requestListener);
server.listen(process.env.PORT);

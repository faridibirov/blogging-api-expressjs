import express from "express";
import userRouter from "./routes/user.routes.js";
import postRouter from "./routes/post.routes.js";
import commentRouter from "./routes/comment.routes.js";

const PORT = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use("/api", userRouter);
app.use("/api", postRouter);
app.use("/api", commentRouter);

app.listen(PORT, () => console.log(`server started on port ${PORT}`));

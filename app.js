require("dotenv").config()

const express = require("express")
const path = require("path")
const mongoose = require("mongoose")

const Blog = require("./models/blog")

const cookieParser = require("cookie-parser")

const userRoute = require("./routes/user")
const blogRoute = require("./routes/blog")
const { checkForAuthenticationCookie } = require("./middlewares/authentication")


const app = express()
const PORT = process.env.PORT || 7000

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connnected"))
    .catch((err) => console.log("MongoDB Connection Error: ", err))

// mongoose.connect("mongodb://127.0.0.1:27017/blogify")
//         .then(() => console.log("MongoDB Connnected"))  
//         .catch((err) => console.log("MongoDB Connection Error: ", err))



app.set("view engine", "ejs")
app.set("views", path.resolve("./views"))



//MIDDLEWARES
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve("./public")))



app.get("/", async (req, res) => {
    // console.log("USER:", req.user)
    const allblogs = await Blog.find({})
    res.render("home", {
        user: req.user,
        blogs: allblogs
    })
})


app.use("/user", userRoute)
app.use("/blog", blogRoute)

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`))
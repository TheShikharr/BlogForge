const { Router } = require("express")
const router = Router()


const Blog = require("../models/blog")
const Comment = require("../models/comments")
const cloudinary = require("../config/cloudinary")


// Image Storing using Multer

const multer = require("multer")

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage })

// ----------------------------------


router.get('/add-new', (req, res) => {
    return res.render('addBlog', {
        user: req.user
    })
})

router.get('/:id', async (req, res) => {
    const blog = await Blog.findById(req.params.id).populate('createdBy')
    const comment = await Comment.find({ blogId: req.params.id }).populate('createdBy')
    return res.render("blog", {
        user: req.user,
        blog,
        comment
    })
})


router.post('/comment/:blogId', async (req, res) => {
    await Comment.create({
        content: req.body.content,
        blogId: req.params.blogId,
        createdBy: req.user._id
    })
    return res.redirect(`/blog/${req.params.blogId}`)
})


// Image Uploads
router.post('/', upload.single('CoverImage'), async (req, res) => {
    const { title, body } = req.body

    if (!req.file) {
        return res.status(400).json({
            message: "Image file is required"
        })
    }

    // const blogs = await Blog.create({
    //     title,
    //     body,
    //     createdBy: req.user._id,
    //     coverImageURL: req.file.path 
    //     // coverImageURL: `/uploads/${req.file.filename}`
    // })
    // return res.redirect(`/blog/${blogs._id}`)

    try {
        // Upload buffer to Cloudinary
        const uploadToCloudinary = () => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "blog_images" },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve(result)
                    }
                )
                stream.end(req.file.buffer)
            })
        }

        const result = await uploadToCloudinary()

        const blogs = await Blog.create({
            title,
            body,
            createdBy: req.user._id,
            coverImageURL: result.secure_url
        })

        return res.redirect(`/blog/${blogs._id}`)

    } catch (err) {
        console.log(err)
        return res.status(500).json({ error: "Upload failed" })
    }

})


module.exports = router
exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{
            _id: '345',
            title: 'First Post',
            content: 'This is the first post',
            imageUrl: 'images/screenshot.png',
            creator: {
                name: 'Etane'
            },
            createAt: new Date()

        }]
    });
}

exports.createPosts = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    // create post in db
    res.status(201).json({
        message: 'Post Created successfully',
        posts: [{
            _id: new Date(),
            title: title,
            content: content,
            creator: { name: 'etane' },
            createAt: new Date()
        }]
    });
}
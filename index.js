import express from 'express';
import bodyparser from 'body-parser';
import multer from 'multer';
import path from 'path';
import imagemin from 'imagemin';
import imageminJpegtran from "imagemin-jpegtran";
import imageminPngquant from "imagemin-pngquant";

// __dirname alternative
const __dirname = path.resolve();

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
});

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', upload.single('image'), (req, res, next) => {

    const file = req.file;
    let ext;

    if (!file) {
        const error = new Error("Please Upload a file");
        error.httpStatusCode = 404;
        return next(error);
    }

    if(file.mimetype == "image/jpeg"){
        ext = 'jpg';
    }
    if(file.mimetype == "image/png"){
        ext = 'png';
    }

    res.render('image.ejs', {url: file.path, name: file.filename, ext: ext});
});

app.post('/compress/uploads/:name/:ext', async (req, res) => {
    const files = await imagemin(["uploads/" + req.params.name], {
        destination: "output",
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.6, 0.8]
            })
        ]
    });

    // download the image 
    res.download(files[0].destinationPath);
});

app.listen(5000, function () {
    console.log("server is listening on port 5000");
});

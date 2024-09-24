import 'dotenv/config'

const port = process.env.PORT || 8080;

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import documents from "./docs.mjs";

const app = express();

app.disable('x-powered-by');

app.set("view engine", "ejs");

app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
    const result = await documents.addOne(req.body);

    return res.redirect(`/${result.lastID}`);
});

app.post("/update", async (req, res) => {
    const { id, title, content } = req.body;

    console.log("id", id);
    console.log("title", title);
    console.log("content", content);
    
    if (!id || !title || !content) {
        return res.status(404).send("ID, title, and content are required.");
    }

    documents.updateOne(id, { title, content });

    return res.redirect(`/${id}`);

});

app.get('/:id', async (req, res) => {
    const doc = await documents.getOne(req.params.id);
    if (!doc) {
        return res.status(404).send("Document not found.");
    }
    return res.render("doc", { doc });
});

app.get('/', async (req, res) => {
    return res.render("index", { docs: await documents.getAll() });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});

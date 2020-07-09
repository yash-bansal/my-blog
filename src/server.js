import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';
import path from 'path';

/////////////// Used with static data
// const articlesInfo = {
//     'learn-react':{
//         upvotes: 0,
//         comments: []
//     },
//     'learn-node':{
//         upvotes: 0,
//         comments: []
//     },
//     'my-thoughts-on-resumes':{
//         upvotes: 0,
//         comments: []
//     }
// }
/////////////// Used with static data

const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/build')))

/////////////// Used with static data
// app.post('/api/articles/:name/upvote',(req, res) => {
//     const articleName = req.params.name;
//     articlesInfo[articleName].upvotes +=1;
//     res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes`);
// });
// app.post('/api/articles/:name/add-comment',(req, res) => {
//     const {username, text} = req.body;
//     const articleName = req.params.name;
//     articlesInfo[articleName].comments.push({username, text});
//     res.status(200).send(`${articleName} now has ${JSON.stringify(articlesInfo[articleName].comments)} comments`);
// });
/////////////// Used with static data

const withDB = async(operation, res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser:true});
        const db = client.db('my-blog');
        
        await operation(db);

        client.close();
    } catch (error) {
        res.status(500).json({message: "Error connecting to db", error});
    }
}

app.get('/api/articles/:name',async (req,res) => {
    // try {
    //     const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser:true});
    //     const db = client.db('my-blog');
        
    //     const articleName = req.params.name;
    //     const articleInfo = await db.collection('articles').findOne({name: articleName});
    //     res.status(200).json(articleInfo);
        
    //     client.close();
    // } catch (error) {
    //     res.status(500).json({message: "Error connecting to db", error});
    // }

    withDB(async(db)=>{
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(articleInfo);
    }, res);
})

app.post('/api/articles/:name/upvote',async (req, res) => {
    // try {
    //     const client = await MongoClient.connect('mongodb://localhost:27017', {useNewUrlParser:true});
    //     const db = client.db('my-blog');
        
    //     const articleName = req.params.name;
    //     const articleInfo = await db.collection('articles').findOne({name: articleName});
    //     db.collection('articles').updateOne({name: articleName},{
    //         "$set":{
    //             upvotes: articleInfo.upvotes + 1
    //         }
    //     })
    //     const updatedArticleInfo = await db.collection('articles').findOne({name: articleName});
    //     res.status(200).json(updatedArticleInfo);
        
    //     client.close();
    // } catch (error) {
    //     res.status(500).json({message: "Error connecting to db", error});
    // }
    withDB(async(db)=>{
        const articleName = req.params.name;
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        await db.collection('articles').updateOne({name: articleName},{
            "$set":{
                upvotes: articleInfo.upvotes + 1
            }
        });
        const updatedArticleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(updatedArticleInfo);
    }, res);
});
app.post('/api/articles/:name/add-comment',async (req, res) => {
    withDB(async(db)=>{
        const articleName = req.params.name;
        const {username, text} = req.body;
        const articleInfo = await db.collection('articles').findOne({name: articleName});
        await db.collection('articles').updateOne({name: articleName},{
            "$set":{
                comments: articleInfo.comments.concat({username, text})
            }
        });
        const updatedArticleInfo = await db.collection('articles').findOne({name: articleName});
        res.status(200).json(updatedArticleInfo);
    }, res);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => console.log('Listening on port 8000'))

import * as http from 'http';
import * as url from 'url';
import * as querystring from 'querystring';
import * as mongodb from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';
import * as settings from './settings';

const hostname = '127.0.0.1';
const port = 3218;
const imageCollectionName = 'AppImage';

const errors = {
    searchCanntNull: () => new Error('Search can not be null.'),
    parameterRequired: (name) => new Error(`Parameter '${name}' is required.`),
    objectNotExists: (typeName, name) => new Error(`Object ${typeName} '${name}' is not exists.`),
    dataFormatError: () => new Error('Data format error.'),
    pathNotSupport: (path: string) => new Error(`Path '${path}' is not supported.`),
    actionResultIsNull: () => new Error("Action result can not be null."),

}

type Action = (req: http.IncomingMessage, res: http.ServerResponse, db: mongodb.Db) => Promise<ActionResult>;
type ActionResult = { data: any, contentType?: string, statusCode?: number }

const contentTypes = {
    application_json: 'application/json',
    text_plain: 'text/plain',
    image_jpeg: 'image/jpeg'
}

// let options = {} as http.ServerOptions;
const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {


    let db: mongodb.Db;

    try {
        let urlInfo = url.parse(req.url);
        let path = urlInfo.pathname;
        console.assert(path && path.length > 0);
        // path = path.substr(1);
        if (path.endsWith('/')) {
            path = path.substr(0, path.length - 1);
        }

        db = await mongodb.MongoClient.connect(settings.mongodb_conn);

        let action: Action;

        switch (path) {
            case "/get":
                action = get;
                break;
            case '/upload':
                action = upload;
                break;
            default:
                if (path.startsWith('/Images') || path.startsWith('/ueditor/net/upload/image')) {
                    action = imageFile;
                    break;
                }
                else if (/[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}_\d+_\d+/i.test(path)) {
                    action = imageByName;
                    break;
                }
                throw errors.pathNotSupport(path);
        }


        let result = await action(req, res, db);
        if (!result)
            throw errors.actionResultIsNull();

        res.setHeader("Content-Type", result.contentType || contentTypes.text_plain);
        res.statusCode = result.statusCode || 200;

        res.end(result.data);
    }
    catch (err) {
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 600;
        res.end(err.message);
    }
    finally {
        if (db != null) {
            db.close();
        }
    }
});


async function get(req: http.IncomingMessage, res: http.ServerResponse, db: mongodb.Db)
    : Promise<ActionResult> {


    let urlInfo = url.parse(req.url);
    let { search } = urlInfo;
    if (!search) {
        throw errors.searchCanntNull();
    }

    let query = querystring.parse(search.substr(1));
    if (!query.id) {
        throw errors.parameterRequired('id');
    }

    let id = new mongodb.ObjectID(query.id);


    let collection = await db.collection(imageCollectionName);
    let item = await collection.findOne({ _id: id });
    if (!item) {
        throw errors.objectNotExists(imageCollectionName, id);
    }

    let arr = (item.data || '').split(',');
    if (arr.length != 2)
        throw errors.dataFormatError();

    let buffer = new Buffer(arr[1], 'base64');
    return { data: buffer, contentType: contentTypes.image_jpeg };
}

async function upload(req: http.IncomingMessage, res: http.ServerResponse, db: mongodb.Db)
    : Promise<ActionResult> {

    return { data: { _id: 'abcd' }, contentType: contentTypes.image_jpeg };
}

async function imageFile(req: http.IncomingMessage, res: http.ServerResponse, db: mongodb.Db)
    : Promise<ActionResult> {

    let urlInfo = url.parse(req.url);
    let pathname = __dirname + urlInfo.pathname;

    if (!fs.existsSync(pathname)) {
        return { data: 'file not exists.', statusCode: 404 };
    }

    let actionResult = { data: null, contentType: contentTypes.text_plain, statusCode: 404 };
    var buffers = new Array<Buffer>();
    return new Promise<ActionResult>((resolve, reject) => {
        let stream = fs.createReadStream(pathname)
            .on('data', (d: Buffer) => {
                buffers.push(d);
            })
            .on('end', () => {

                let buffer = Buffer.concat(buffers);
                actionResult.data = buffer;
                resolve(actionResult);
            })
            .on('error', (err) => {
                reject(err);
            });
    })
}

async function imageByName(req: http.IncomingMessage, res: http.ServerResponse, db: mongodb.Db) {
    let urlInfo = url.parse(req.url);
    let collection = db.collection(imageCollectionName);
    var name = urlInfo.pathname.substr(1);
    let item = await collection.findOne({ name });
    if (!item) {
        throw errors.objectNotExists(imageCollectionName, name);
    }

    let arr = (item.data || '').split(',');
    if (arr.length != 2)
        throw errors.dataFormatError();

    let buffer = new Buffer(arr[1], 'base64');
    return { data: buffer, contentType: contentTypes.image_jpeg };
}

server.listen(port, hostname, () => {
    console.log(`server running at http://${hostname}:${port}`);

});


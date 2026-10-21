import {health} from '../forest-server/handler.mjs';
export default function handler(req,res){res.writeHead(200,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(health()))}

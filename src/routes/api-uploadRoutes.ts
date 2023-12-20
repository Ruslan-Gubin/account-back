import * as express from 'express';
import { strimService } from '../service/strim-service.js';


const router: express.Router =  express.Router();

router.get("/uploads/avatar/:href",  async(req, res) => {
  try {
    return await strimService.getFoto(req, res)
  } catch (error) {
    res.statusCode = 500
    res.end('Failed server')
  }
}); 


export const uploadRouter = router;
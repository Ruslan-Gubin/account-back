import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as routes from './routes/index.js';
import { logger } from './utils/index.js';
const app = express();
dotenv.config();
app.use(cors({}));
app.use(express.json({ limit: '50mb' }));
(async () => {
    if (process.env['MONGO_URL']) {
        try {
            await mongoose.connect(process.env['MONGO_URL']);
            logger.connectSuccess('DB Product ok');
        }
        catch (error) {
            logger.errrorDB(`DB error, ${error}`);
        }
    }
})();
app.use(routes.authRouter);
app.get('/about', (req, res) => res.send(`
<h1>Account back</h1>
<div>Hello World</div>
<ul class='ul'>
<li>one</li>
<li>two</li>
<li>three</li>
</ul>
<script>
const elem = document.querySelector('.ul')
elem.addEventListener('click', () => {
  console.log('Hello')
})
</script>
`));
app.listen(process.env['PORT'] || 4444, () => {
    logger.connectSuccess(`Listening port ${process.env['PORT'] || 4444}`);
});
export { app };

import express from 'express';
import cors from 'cors';
import tankRoutes from './routes/tank.routes.js';

const app = express();

app.use(cors());
app.use(express.json()); // Для парсингу JSON

// Підключаємо роути
app.use('/api/tanks', tankRoutes);

// Глобальний обробник помилок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Щось пішло не так на сервері' });
});

export default app;
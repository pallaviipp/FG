"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Accept',
            'X-Requested-With',
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Headers',
            'Access-Control-Allow-Methods'
        ],
        exposedHeaders: ['Content-Disposition'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204
    });
    app.use((req, res, next) => {
        if (req.method === 'OPTIONS') {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.sendStatus(200);
        }
        else {
            next();
        }
    });
    await app.listen(4000);
    console.log('=================================');
    console.log(' Backend server running on http://localhost:4000');
    console.log(' Health check: http://localhost:4000/');
    console.log(' Clients API: http://localhost:4000/clients');
    console.log(' Transactions API: http://localhost:4000/transactions');
    console.log(' Invoices API: http://localhost:4000/invoices');
    console.log(' CORS enabled for all origins');
    console.log('=================================');
}
bootstrap();
//# sourceMappingURL=main.js.map
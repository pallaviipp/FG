import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Fusion Global Accounting API is running!';
  }

  @Get('health')
  getHealth(): object {
    return { 
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'fusion-global-accounting',
      version: '1.0.0'
    };
  }
}

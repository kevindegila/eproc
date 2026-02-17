import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@eproc/shared-utils';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  check() {
    return {
      service: 'ms-recours',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CurrentUser } from '@eproc/shared-utils';
import { AttachmentsService } from './attachments.service';

@ApiTags('Pieces Jointes')
@ApiBearerAuth()
@Controller()
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Post('executions/:executionId/attachments')
  @ApiOperation({ summary: 'Telecharger une piece jointe pour une execution' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'Fichier a telecharger' },
        category: { type: 'string', description: 'Categorie du document (DECOMPTE, PV, RAPPORT, AUTRE)' },
      },
    },
  })
  @ApiQuery({ name: 'category', required: false, type: String })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/attachments',
        filename: (_req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 Mo max
    }),
  )
  upload(
    @Param('executionId') executionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('category') category: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.attachmentsService.upload(executionId, file, category, userId);
  }

  @Get('executions/:executionId/attachments')
  @ApiOperation({ summary: 'Liste des pieces jointes d\'une execution' })
  findByExecution(@Param('executionId') executionId: string) {
    return this.attachmentsService.findByExecution(executionId);
  }

  @Delete('attachments/:id')
  @ApiOperation({ summary: 'Supprimer une piece jointe' })
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}

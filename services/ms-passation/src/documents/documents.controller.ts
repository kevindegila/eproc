import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CurrentUser } from '@eproc/shared-utils';
import { IJwtPayload } from '@eproc/shared-types';
import { DocumentsService } from './documents.service';

const storage = diskStorage({
  destination: './uploads/dacs',
  filename: (_req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${uniqueSuffix}${ext}`);
  },
});

@ApiTags('Documents DAC')
@ApiBearerAuth()
@Controller()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('dacs/:dacId/documents')
  @ApiOperation({ summary: 'Telecharger un document pour un DAC' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
      fileFilter: (_req, file, callback) => {
        const allowedMimes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'image/jpeg',
          'image/png',
        ];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new Error(
              'Type de fichier non autorise. Types acceptes : PDF, Word, Excel, JPEG, PNG',
            ),
            false,
          );
        }
      },
    }),
  )
  upload(
    @Param('dacId') dacId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: string,
    @CurrentUser() user: IJwtPayload,
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }
    return this.documentsService.upload(dacId, file, user.sub, category);
  }

  @Get('dacs/:dacId/documents')
  @ApiOperation({ summary: 'Liste des documents d\'un DAC' })
  findByDac(@Param('dacId') dacId: string) {
    return this.documentsService.findByDac(dacId);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Supprimer un document (statut BROUILLON uniquement)' })
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}

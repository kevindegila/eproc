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
import { FilesService } from './files.service';

@ApiTags('Fichiers de soumission')
@ApiBearerAuth()
@Controller()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('submissions/:submissionId/files')
  @ApiOperation({ summary: 'Telecharger un fichier pour une soumission' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        category: { type: 'string', enum: ['TECHNIQUE', 'FINANCIERE', 'ADMINISTRATIVE'] },
      },
    },
  })
  @ApiQuery({ name: 'category', required: false, type: String })
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Param('submissionId') submissionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('category') category?: string,
  ) {
    return this.filesService.upload(submissionId, file, category);
  }

  @Get('submissions/:submissionId/files')
  @ApiOperation({ summary: 'Liste des fichiers d\'une soumission' })
  findBySubmission(@Param('submissionId') submissionId: string) {
    return this.filesService.findBySubmission(submissionId);
  }

  @Delete('files/:id')
  @ApiOperation({ summary: 'Supprimer un fichier' })
  remove(@Param('id') id: string) {
    return this.filesService.remove(id);
  }
}

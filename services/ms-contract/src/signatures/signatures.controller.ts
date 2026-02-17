import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SignaturesService } from './signatures.service';
import { CreateSignatureDto } from './dto/create-signature.dto';

@ApiTags('Signatures')
@ApiBearerAuth()
@Controller('signatures')
export class SignaturesController {
  constructor(private readonly signaturesService: SignaturesService) {}

  @Post()
  @ApiOperation({ summary: 'Ajouter une signature a un contrat' })
  create(@Body() dto: CreateSignatureDto) {
    return this.signaturesService.create(dto);
  }

  @Get('contracts/:contractId')
  @ApiOperation({ summary: 'Liste des signatures d\'un contrat' })
  findByContract(@Param('contractId') contractId: string) {
    return this.signaturesService.findByContract(contractId);
  }
}

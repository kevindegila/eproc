import { Module } from '@nestjs/common';
import { DefinitionsController } from './definitions.controller';
import { DefinitionsService } from './definitions.service';
import { YamlParserService } from './yaml-parser.service';
import { TemplateResolverService } from './template-resolver.service';

@Module({
  controllers: [DefinitionsController],
  providers: [DefinitionsService, YamlParserService, TemplateResolverService],
  exports: [DefinitionsService, YamlParserService, TemplateResolverService],
})
export class DefinitionsModule {}

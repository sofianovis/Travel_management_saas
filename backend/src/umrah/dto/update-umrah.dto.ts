import { PartialType } from '@nestjs/mapped-types';
import { CreateUmrahDto } from './create-umrah.dto.js';

export class UpdateUmrahDto extends PartialType(CreateUmrahDto) {}

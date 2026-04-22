import { MigrationInterface } from 'typeorm';

export class EmptySchemaBaseline1776880283000 implements MigrationInterface {
  name = 'EmptySchemaBaseline1776880283000';

  public async up(): Promise<void> {}

  public async down(): Promise<void> {}
}

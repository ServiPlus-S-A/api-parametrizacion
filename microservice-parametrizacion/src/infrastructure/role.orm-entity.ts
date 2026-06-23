import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('roles')
export class RoleOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  status: string;

  @Column('jsonb')
  permissions: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}

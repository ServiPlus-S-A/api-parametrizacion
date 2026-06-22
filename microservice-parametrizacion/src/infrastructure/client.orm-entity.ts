import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity';

@Entity('clients')
export class ClientOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 15, unique: true, name: 'tax_id' })
  taxId: string;

  @Column({ type: 'varchar', length: 50, name: 'client_type' })
  clientType: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @ManyToOne(() => UserOrmEntity)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: UserOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}

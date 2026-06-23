import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { RoleOrmEntity } from './role.orm-entity';

@Entity('users')
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120, name: 'full_name', nullable: true })
  fullName: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'varchar', length: 20, default: 'Active' })
  status: string;

  @Column({ type: 'int', default: 0, name: 'failed_attempts' })
  failedAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  blockedUntil: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_access_at' })
  lastAccessAt: Date | null;

  @ManyToOne(() => RoleOrmEntity, { nullable: true })
  @JoinColumn({ name: 'role_id' })
  role: RoleOrmEntity;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('client_status_history')
export class ClientStatusHistoryOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', name: 'client_id' })
  clientId: string;

  @Column({ type: 'varchar', length: 20, name: 'previous_status' })
  previousStatus: 'Active' | 'Inactive';

  @Column({ type: 'varchar', length: 20, name: 'new_status' })
  newStatus: 'Active' | 'Inactive';

  @Column({ type: 'text' })
  motivo: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'changed_by' })
  changedBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}

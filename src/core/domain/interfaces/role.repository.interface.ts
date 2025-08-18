import { Role } from '../entities/role.entity';

export interface IRoleRepository {
  findAll(): Promise<Role[]>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  create(role: Partial<Role>): Promise<Role>;
  update(id: string, role: Partial<Role>): Promise<Role | null>;
  delete(id: string): Promise<boolean>;
}

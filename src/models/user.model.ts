import { UserRole } from "./user-role.model";

export interface UserDTO {
  id: string; // UUID as string
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string; // Only for write operations
  role: UserRole;
  imageUrl?: string;
  phoneNumber: string;
}

import { UserRole } from "./user-role.model";

export interface UserDTO {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  role: UserRole;
  imageUrl?: string;
  phoneNumber: string;
}

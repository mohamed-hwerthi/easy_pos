import { Media } from "../media";

/**
 * Represents category data exposed to clients (storefront).
 * Corresponds to ClientCategoryDTO in the backend.
 *
 * Éditeur de code: Mohamed Hwerthi
 */

export interface ClientCategory {
  id: string;
  name: string;
  description: string;
  mediasUrls: string[];
}

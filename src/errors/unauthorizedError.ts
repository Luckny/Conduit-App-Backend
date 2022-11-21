import AbstractError from "./abstractError";

/**
 * @see Applying UML and Patterns, Chapter A35/F30
 */
export class UnauthorizedError extends AbstractError {
   public readonly code = 401;
}

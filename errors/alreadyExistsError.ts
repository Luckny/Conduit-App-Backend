import AbstractError from "./abstractError";
import { StatusCodes } from "http-status-codes";

/**
 * @see Applying UML and Patterns, Chapter A35/F30
 */
export class AlreadyExistsError extends AbstractError {
   public readonly code = StatusCodes.FORBIDDEN;
}

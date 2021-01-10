export abstract class CustomError extends Error {
    abstract statusCode: number;

    protected constructor(errMsg: string) {
        super(errMsg);
        Object.setPrototypeOf(this, CustomError.prototype);
    }

    abstract serializeErrors(): { message: String; field?: string }[]
}

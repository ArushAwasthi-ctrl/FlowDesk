class APIError extends Error{
    constructor(status , message="Something went wrong",errors =[] , stack=""){
        super(message);
        this.status = status;
        this.message = message;
        this.success = false;
        this.errors = errors;
        if(stack)
        {
            this.stack = stack;
        }
        else{
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
module.exports = APIError;
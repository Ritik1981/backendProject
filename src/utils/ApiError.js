// Here we are customising and Standarising AppError so that if anywhere AppiError occurs the error must be in the same format everywhere as defined by us


class ApiError extends Error { // Error is predefined class in node whereas ApiError is made by us 
    // ApiError class is being inherited from Error class
    constructor(
        // like __int__(self) in python
        // it accepts args from object whenever they created from ApiError class
        statusCode,
        message= "Something went Wrong", // : throws error. Also, if user doesn't give msg then it's a by default msg
        errors=[],
        stack="" //Empty statck

    ){
        // Overiding Error class using ApiError class
        super(message)
        this.statusCode = statusCode // overiding statuscodeof Error class from my statuscode since Apierror class is inheriting from Error class
        this.data = null    //usually null
        this.message = message,
        this.success= false,
        this.errors=errors
        if(stack){
            this.stack=stack
        }
        else{
            Error.captureStackTrace(this, this.constructor)
        }
    }


} 

export default ApiError;
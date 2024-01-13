class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statuscode=statusCode,
        this.data=data,
        this.message=message,
        this.success=statusCode < 400
    }
    
}

export default ApiResponse;

// servers statusCode must be less than 400
// informational responses: 100-199
// successful responses: 200-299
// redirection messages: 300-399
// client error responses: 400-499
// server error responses: 500-599
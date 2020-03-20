class SuccessHolder {
    constructor(results, message, statusCode) {
        if (message != null) {
            this.statusCode = statusCode;
            this.message = message;
            this.results = results;
        } else {
            this.statusCode = 200;
            this.message = "success";
            this.results = results;
        }
    }
    getJson() {
        const dir = {
            status: "success",
            statusCode: this.statusCode,
            message: this.message,
            results: this.results
        }
        return dir;
    }
}
class ErrorHolder extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}
class DefaultError extends ErrorHolder {
    constructor(message) {
        super(500, message);
    }
}
const errorHandler = (err, res) => {
    const {statusCode, message} = err;
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message
    });
}
const responseHandler = (success, res) => {
    console.log("inside responseHandler");
    const {statusCode, message, results} = success.getJson();
    console.log()
    res.status(statusCode).json({
        status: "success",
        statusCode,
        message,
        results
    });
}

module.exports = {
    responseHandler,
    errorHandler,
    ErrorHolder,
    DefaultError,
    SuccessHolder
}
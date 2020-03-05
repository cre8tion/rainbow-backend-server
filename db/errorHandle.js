
class ErrorHandler extends Error {
    constructor(statusCode, message) {
        super();
        this.statusCode = statusCode;
        this.message = message;
    }
}
class DefaultError extends ErrorHandler {
    constructor() {
        super(500, "Connection to SQl Database might be broken.");
    }
}
const handler = (err, res) => {
    const {statusCode, message} = err;
    res.status(statusCode).json({
        status: "error",
        statusCode,
        message
    })
}

/* WORK IN PROGRESS */
// const responseHandler = (err, res) => {
//     const { statusCode, message } = err;
//     console.log(statusCode);
//     if (statusCode != null) {
//         console.log("entered into error handler");
//         res.status(statusCode).json({
//             status:"error",
//             statusCode,
//             message,
//         });
//     } else {
//         console.log("entered this");
//         console.log((res.locals));
//         res.status(200).json({
//             status:"success",
//             statusCode,
//             message,
//             results: res.locals.r
//         });
//     }
// };


module.exports = {
    handler,
    ErrorHandler,
    DefaultError
}
class DefaultError extends Error {
    constructor(message) {
        super();
        if (!message) {
            this.message = "internal error";
        } else if (message.hasOwnProperty('sqlMessage')){
            this.message = message.sqlMessage;
        } else {
            this.message = message;
        }
    }
}

const errorHandler = (err, res) => {
    const {message} = err;
    res.status(400).json({
        success: false,
        message,
        data: {}
    });
}
const successHandler = (res, data, message) => {
    
    res.status(200).json({
        success: true,
        message: message || "success",
        data: data || {}
    });
}

module.exports = {
    successHandler,
    errorHandler,
    DefaultError
}
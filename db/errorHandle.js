class SuccessHolder {
    constructor(data, message) {
        if (message != null) {
            this.message = message;
            this.data = data;
        } else {
            this.message = "success";
            this.data = data;
        }
    }
    getJson() {
        const dir = {
            success: true,
            message: this.message,
            data: this.data
        }
        return dir;
    }
}
class DefaultError extends Error {
    constructor(message) {
        super();
        this.message = message;
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
const responseHandler = (success, res) => {
    // console.log("inside responseHandler");
    const {message, data} = success.getJson();
    console.log()
    res.status(200).json({
        success: true,
        message,
        data
    });
}

module.exports = {
    responseHandler,
    errorHandler,
    DefaultError,
    SuccessHolder
}
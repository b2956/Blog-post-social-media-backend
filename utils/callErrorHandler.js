exports.asynchronous = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}

exports.synchronous = (message, statusCode, errorData = undefined) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if(errorData !== undefined) {
        error.data = errorData;
    }
    throw error;
}
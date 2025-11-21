const sendSuccess = (res, data, statusCode = 200, message = 'Success') => {
    res.status(statusCode).json({
        status: 'success',
        message,
        data,
    });
};

const sendError = (res, error) => {
    const statusCode = error.statusCode || 500;
    const status = error.status || 'error';
    const message = error.message || 'Internal Server Error';

    if (process.env.NODE_ENV === 'development') {
        res.status(statusCode).json({
            status,
            message,
            stack: error.stack,
            error,
        });
    } else {
        // Production: don't leak stack traces
        res.status(statusCode).json({
            status,
            message: error.isOperational ? message : 'Something went wrong',
        });
    }
};

module.exports = {
    sendSuccess,
    sendError,
};

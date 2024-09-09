const errorMiddleware = (err, req, res, next) => {
    res.status(500).json(err.message);
    next();
};

export default errorMiddleware;

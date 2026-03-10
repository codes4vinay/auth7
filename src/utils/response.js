export const success = (res, message, data = null, status = 200) => {

    return res.status(status).json({
        success: true,
        message: `Auth7 :: ${message}`,
        ...(data && { data })
    });
};


export const error = (res, message, status = 400) => {

    return res.status(status).json({
        success: false,
        message: `Auth7 :: ${message}`
    });
};
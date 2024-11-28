import { NextFunction, Request, Response } from "express";

const catchAsync = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch((error) => {
            res.status(500).json({ error: 'Internal Server Error', err: error });
        });
    };
};

export default catchAsync;


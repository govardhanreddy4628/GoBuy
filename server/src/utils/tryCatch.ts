import { Request, Response, NextFunction, RequestHandler } from "express";

export const TryCatch = (passedFunc: RequestHandler): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await passedFunc(req, res, next);
    } catch (error) {
      next(error);
    }
  };





// advanced version
// import { Request, Response, NextFunction } from "express";

// export const TryCatch =
//   <T = any>(
//     passedFunc: (
//       req: Request,
//       res: Response,
//       next: NextFunction
//     ) => Promise<T>
//   ) =>
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       await passedFunc(req, res, next);
//     } catch (error) {
//       next(error);
//     }
//   };
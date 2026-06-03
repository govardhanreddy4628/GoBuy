// //it is global type declaration file for express request object so that we can access userId and userRole in req object throughout the project.

import { IUserDocument } from "../models/userModel";

declare global {
  namespace Express {
    interface Request {              // Extend Express Request interface to include 'userId' and 'userRole'
      user?: IUserDocument;
    }
  }
}

export {};    // TypeScript requires the file to be treated as a module for global type augmentations to work reliably. it requires atleast one import or export to treate file as module. else TypeScript treats the file as a script, not a module. im there is no any import in file uncomment export{}

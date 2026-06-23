import {Apiresponse} from "../utils/Apiresponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

// Controller to simply verify if the backend is running properly
const healthcheck = asyncHandler(async (req, res) => {
    // Return a simple JSON indicating server status is OK
    return res.status(200).json(new Apiresponse(200, {status: "OK"}, "Server is healthy"));
})

export {
    healthcheck
}

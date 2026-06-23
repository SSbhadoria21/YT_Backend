class apiError extends Error{
    constructor(stauscode,
        message= "something went wrong",
        errors = [],
        stack = ""){
            super(message)
            this.stauscode = stauscode
            this.errors = errors
            this.data = null
            this.message = message
            this.success = false

            if(stack){
                this.stack = stack
            }else{
                Error.captureStackTrace(this, this.constructor)
            }

    }
}



export {apiError}
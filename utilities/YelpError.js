// defining our own error class to use for the app
class YelpError extends Error{
    constructor(message,status){
        super();
        this.message = message
        this.status = status
    }

}

module.exports = YelpError
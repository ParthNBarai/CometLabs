const mongoose = require("mongoose");
require("dotenv/config")


const ConnectionDB = async () => {
    try {
        mongoose.set("strictQuery", false);

        mongoose.connect(process.env.MONGO_URL)
            .then(() => console.log("Connected Successfully"))
            .catch((err) => console.error(err))
    } catch (error) {
        console.log(error)
        exit(0);
    }
}

module.exports = ConnectionDB;

const checkMillionDollarIdea = (req, res, next) => {
    const data = req.body;
    const checkIf = data.numWeeks * data.weeklyRevenue >= 1000000;
    // If the idea worths a million dollar
    if (checkIf) {
        next();
    } else {
        // Send 400 status code otherwise
        res.status(400).send()
    }
};

// Leave this exports assignment so that the function can be used elsewhere
module.exports = checkMillionDollarIdea;

const {getAllFromDatabase, addToDatabase, updateInstanceInDatabase, 
    deleteFromDatabasebyId, deleteAllFromDatabase, createMeeting} = require('./db');

const getDbNameFromUrl = (url) => {
    const re = /minions|ideas|meetings|ideas|work/g;
    let matched = [...url.matchAll(re)];
    if (matched.length > 0) {
        return matched.length > 1 ? matched[1][0] : matched[0][0]
    }
}

// A middleware function to handle all get requests to the paths
// --> [/minions, /ideas, /meetings]
const handleGets = (req, res, next) => {
    const databaseToCheck = getDbNameFromUrl(req.originalUrl);
    const arrayFromDb = getAllFromDatabase(databaseToCheck);
    if (arrayFromDb) {
        res.send(arrayFromDb)
    } else {
        let getAllError = new Error(`There aren't any ${databaseToCheck}s in database`)
        getAllError.status = 204;
        next(getAllError);
    }
}

// A middleware function to handle all post requests to the following routes
// [/minions, /ideas, /meetings]
const handlePosts = (req, res, next) => {
    let dbToCheck = getDbNameFromUrl(req.originalUrl);
    try {
        if (dbToCheck === 'meetings') {
            const newMeeting = createMeeting();
            const checkAdd = addToDatabase(dbToCheck, newMeeting);
            res.status(201).send(checkAdd);
        } else {
            const checkAdd = addToDatabase(dbToCheck, req.body);
            res.status(201).send(checkAdd);
        }
    } catch (funcErr) {
        funcErr.status = 404;
        return next(funcErr);
    }
}

const handlePuts = (req, res, next) => {
    const dbToCheck = getDbNameFromUrl(req.originalUrl);
    try {
        const currentData = req.data;
        const requestBody = req.body;
        const newData = updateInstanceInDatabase(dbToCheck, Object.assign(currentData, requestBody));
        // if the update process was successfully done
        if (newData) {
            res.send(newData);
        } else {
            const updateError = new Error(
                `${dbToCheck.replace(dbToCheck[0], dbToCheck[0].toUpperCase())} data update failed`);
            updateError.ststus = 404;
            next(updateError);
        }
    } catch (error) {
        next(error);
    }
}

const handleDeletes = (req, res, next) => {
    const dbToCheck = getDbNameFromUrl(req.originalUrl);
    try {
        if (dbToCheck === 'meetings') {
            const deleteMeetings = deleteAllFromDatabase(dbToCheck);
            if(deleteMeetings.length === 0) {
                res.status(204).send(`${dbToCheck} deleted successfully`)
            }
        } else {
            const dataToUse = req.data;
            const tryDelete = deleteFromDatabasebyId(dbToCheck, dataToUse.id);
            if (tryDelete) {
                // this removes the 's at the end of values like minions, ideas
                const forOutput = dbToCheck.slice(0, dbToCheck.length - 1)
                res.status(204).send(`${forOutput} deleted successfully`)
            }
        }
    } catch (error) {
        next(error)
    }
}

const handleGetsById = (req, res) => {
    res.send(req.data);
}

module.exports = {
    handleGets,
    handlePosts,
    handleDeletes,
    handlePuts,
    handleGetsById,
    getDbNameFromUrl,
}
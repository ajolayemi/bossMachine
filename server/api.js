const express = require('express');
const app = require('../server');
const checkMillionDollarIdea = require('./checkMillionDollarIdea');
const apiRouter = express.Router();

// Router for paths /minions 
const minionBaseRouter = express.Router({mergeParams: true});
// Router for path /minions/:minionId
const minionIdRouter = express.Router({mergeParams: true});
apiRouter.use('/minions', minionBaseRouter);
apiRouter.use('/minions/:minionId', minionIdRouter);


// Router for path /ideas
const ideaBaseRouter = express.Router({mergeParams: true});
// Router for path /ideas/:ideaId
const ideaIdRouter = express.Router({mergeParams: true});
apiRouter.use('/ideas/:ideaId', ideaIdRouter)


// Router for meetings
const meetingBaseRouter = express.Router({mergeParams: true});
apiRouter.use('/ideas', ideaBaseRouter);
apiRouter.use('/meetings', meetingBaseRouter);

// Router for Work
const workBaseRouter = express.Router({mergeParams: true});
const workIdRouter = express.Router({mergeParams: true});
apiRouter.use('/minions/:minionId/work', workBaseRouter);
apiRouter.use('/minions/:minionId/work/:workId', workIdRouter);


// Importing necessary Modules
const {getFromDatabaseById} = require('./db');
const {handleGets, handlePosts, handlePuts, handleDeletes,
     handleGetsById,
     getDbNameFromUrl} = require('./handlers');


// Parameters
apiRouter.param('minionId', (req, res, next, id) => {
    try {
        if (isNaN(Number(id))) {
            let invalidArg = new Error('Id must be a Number');
            invalidArg.status = 404;
            next(invalidArg);
        }
        const dbToCheck = getDbNameFromUrl(req.originalUrl);
        const dataInDb = getFromDatabaseById(dbToCheck, id);
        if (dataInDb) {
            req.data = dataInDb;
            req.providedId = id;
            next();
        } else {
            let minionNotFoundErr = new Error(`Minion with id - ${id} - not found in database!`)
            minionNotFoundErr.status = 404;
            next(minionNotFoundErr);
        }

    } catch (err) {
        err.status = 404;
        next(err);
    }
})

apiRouter.param('ideaId', (req, res, next, id) => {
    try {
        const dataInDb = getFromDatabaseById('ideas', id);
        if (dataInDb) {
            req.data = dataInDb;
            next()
        } else {
            let ideaNotFoundErr = new Error(`Idea with id - ${id} - not found in database!`)
            ideaNotFoundErr.status = 404;
            next(ideaNotFoundErr);
        }

    } catch (err) {
        next(err);
    }
})

apiRouter.param('workId', (req, res, next, id) => {
    try {
        const dataInDb = getFromDatabaseById('work', id);
        if (dataInDb) {
            const checkValidMinionId = dataInDb[0].minionId === req.providedId;
            if (checkValidMinionId) {
                req.data = dataInDb[0];
                next()
            } else {
                let invalidMilionId = new Error('Invalid id provided for minion')
                invalidMilionId.status = 400;
                next(invalidMilionId);
            }
        } else {
            let workNotFoundErr = new Error(`Work with id - ${id} - not found in database!`)
            workNotFoundErr.status = 404;
            next(workNotFoundErr);
        }

    } catch (err) {
        next(err);
    }
})

// Minions Routes
minionBaseRouter.get('/', handleGets)
minionBaseRouter.post('/', handlePosts)
minionIdRouter.get('/', handleGetsById);
minionIdRouter.put('/', handlePuts);
minionIdRouter.delete('/', handleDeletes);

// Ideas routes
ideaBaseRouter.get('/', handleGets);
ideaBaseRouter.post('/', checkMillionDollarIdea, handlePosts);
ideaIdRouter.get('/', handleGetsById);
ideaIdRouter.put('/', checkMillionDollarIdea, handlePuts);
ideaIdRouter.delete('/', handleDeletes);

// Meetings routes
meetingBaseRouter.get('/', handleGets);
meetingBaseRouter.post('/', handlePosts);
meetingBaseRouter.delete('/', handleDeletes);

// Work routes
workBaseRouter.get('/', handleGetsById);
workBaseRouter.post('/', handlePosts);
workIdRouter.put('/', handlePuts);
workIdRouter.delete('/', handleDeletes);

module.exports = apiRouter;

module.exports = (router, app) => {
    require('../routes/auth')(router, app);
    require('../routes/school_vehicle')(router, app);
};
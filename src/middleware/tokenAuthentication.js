const TokenService = require('../auth/TokenService');
const tokenAuthentication = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.substring(7);
    try {
      const user = await TokenService.verify(token);
      req.authenicatedUser = user;
    // eslint-disable-next-line no-empty
    } catch (err) {}
  }
  next();
};

module.exports = tokenAuthentication;
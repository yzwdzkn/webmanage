'use strict';
const Service = require('egg').Service;
const jwt = require('jsonwebtoken');

class AuthService extends Service {

  /**
     * 生成token
     * @param {*} username 用户名
     */
  async generateToken(username) {
    const secretKey = this.app.config.security.secretKey;
    const expiresIn = this.app.config.security.expiresIn; // token过期时间暂设为24小时,但实际应用中会根据心跳时间重新颁发令牌
    const token = jwt.sign({
      username,
    }, secretKey, {
      expiresIn,
    });
    const user = await this.ctx.service.user.findByusername(username);
    await this.app.redis.hset('Token', token, JSON.stringify(user));
    return token;
  }

  /**
   * token认证,只有客户端发来的请求才需要
   */
  async authentication() {
    try {
      const token = this._getToken(this.ctx.request);
      console.log('token is : ', token);
      let errMsg = '无效的token';
      if (!token) {
        errMsg = '需要携带token值';
        throw new Error(errMsg);
      }
      if (this.app.config.env === 'local') {
        let user = JSON.parse(await this.app.redis.hget('Token', token));
        if (!user) {
          user = {
            id: 204,
            username: 121412,
          };
        }
        return user;
      }
      const decode = jwt.verify(token, this.config.security.secretKey);
      console.log('decode: ', decode);

      const user = JSON.parse(await this.app.redis.hget('Token', token));
      console.log(user);
      return user;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  _getToken() {
    const token = this.ctx.request.query.token ? this.ctx.request.query.token : this.ctx.request.body.token;
    return token;
  }

  /**
   * 保活信息,当token过期时间少于xxx时间时。颁发新的token给客户端
   */
  async keepAlive() {
    const token = this._getToken(this.ctx.request);
    const decode = jwt.verify(token, this.config.security.secretKey);
    const user = JSON.parse(await this.app.redis.hget('Token', token));

    console.log('decode: ', decode);
    if (decode.exp - new Date().getTime() <= 60 * 60) { // 当时间小于1h时,重新颁发令牌
      console.log(token);
      const result = await this.app.redis.hdel('Token', token);
      console.log('del result: ', result);
      const newToken = await this.generateToken(user.username);
      await this.app.redis.hset('Token', newToken, JSON.stringify(user));
      return newToken;
    }
  }
}

module.exports = AuthService;

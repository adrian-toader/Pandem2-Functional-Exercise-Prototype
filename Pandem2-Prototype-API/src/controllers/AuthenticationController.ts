/*
  Copyright Clarisoft, a Modus Create Company, 20/07/2023, licensed under the
  EUPL-1.2 or later. This open-source code is licensed following the Attribution
  4.0 International (CC BY 4.0) - Creative Commons — Attribution 4.0 International
  — CC BY 4.0.

  Following this, you are accessible to:

  Share - copy and redistribute the material in any medium or format.
  Adapt - remix, transform, and build upon the material commercially.

  Remark: The licensor cannot revoke these freedoms if you follow the license
  terms.

  Under the following terms:

  Attribution - You must give appropriate credit, provide a link to the license,
  and indicate if changes were made. You may do so reasonably but not in any way
  that suggests the licensor endorses you or your use.
  No additional restrictions - You may not apply legal terms or technological
  measures that legally restrict others from doing anything the license permits.
*/
import { FastifyReply, FastifyRequest } from 'fastify';
import { IUser, UserModel } from '../models/user';
import { SessionModel } from '../models/session';
import { CustomError } from './../server/helpers/errors';
import { App } from '../app';
import { Bcrypt } from '../server/helpers/bcrypt';
import * as _ from 'lodash';
import * as JWT from 'jsonwebtoken';
import { Authentication, AuthorizationHeader } from '../server/helpers/authentication';
import { IRole, RoleModel } from '../models/role';
import { IToken } from '../components/auth';

/**
 * Authenticate user using email and password
 * @param request
 * @param reply
 */
export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const {email, password} = request.body as { email: string, password: string };

    // retrieve to make sure that is actually exists
    const user: IUser | null = await UserModel.findOne(
      {email: email},
      '+password',
      {lean: true}
    );

    if (user === null) {
      throw new CustomError('User not found');
    }

    // validate password
    const bcrypt = new Bcrypt(_.get(App, 'serviceConfig.bcrypt.saltRounds')!);
    const passwordsMatch: boolean = await bcrypt.compareHash(password, user.password);
    if (!passwordsMatch) {
      throw new CustomError('Invalid password');
    }

    // retrieve the role to get permissions
    const role: IRole | null = await RoleModel.findOne(
      {_id: user.roleId},
      null,
      {lean: true}
    );

    if (role === null) {
      throw new CustomError('Role not found');
    }

    // set expiration date for the JWT
    const expirationTime = Math.floor(Date.now() / 1000) + _.get(App, 'serviceConfig.jwt.expirationTime')!;

    // add token content
    const tokenContent: IToken = {
      exp: expirationTime,
      userId: user._id,
      roleId: user.roleId,
      user: user,
      role: role,
      permissions: role.permissions
    };

    delete tokenContent.user.password;

    // sign a token
    const token = JWT.sign(tokenContent, _.get(App, 'serviceConfig.jwt.secret')!);

    // save token and other details in a Session Instance
    const newSession = await SessionModel.create(
      {
        userId: user._id,
        token: token
      }
    );

    // return the session data to the user
    return reply.send(newSession);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
    }, 'Authentication error');

    throw App.errorsHelper.getError('AUTHENTICATION_ERROR');
  }
};

/**
 * Logout from the application
 * @param request
 * @param reply
 */
export const logout = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authHeader: AuthorizationHeader | CustomError = Authentication.parseAuthorizationHeader(request);
    if (authHeader instanceof CustomError) {
      throw authHeader;
    }

    // delete session with associated token
    await SessionModel.findOneAndRemove({token: authHeader.token});
    return reply.code(204).send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
    }, 'Logout error');

    throw err;
  }
};

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
import { App } from '../app';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IUser, UserModel } from '../models/user';
import { IListQueryParams } from '../server/interfaces/route';
import { Bcrypt } from '../server/helpers/bcrypt';
import * as _ from 'lodash';
import { IRole, RoleModel } from '../models/role';

/**
 * Retrieve User list
 * @param request
 * @param reply
 */
export const retrieveUserList = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const responseData: {
      data?: IUser[],
      metadata?: any
    } = {
      metadata: {}
    };

    const queryParams = request.query as IListQueryParams;
    const users: IUser[] = await UserModel.find(
      queryParams.filter || {},
      queryParams.projection || null,
      {
        sort: queryParams.sort || {},
        skip: queryParams.skip || undefined,
        limit: queryParams.limit || undefined,
        lean: true
      }
    );

    responseData.data = users;

    const rolesToRetrieve = new Set();
    users.forEach((user) => rolesToRetrieve.add(user.roleId));

    const roles: IRole[] = await RoleModel.find(
      {
        _id: {
          '$in': [...rolesToRetrieve]
        }
      },
      null,
      {
        lean: true
      });

    responseData.metadata.roles = roles;

    return reply.send(responseData);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve User list');

    throw err;
  }
};

/**
 * Create User instance
 * @param request
 * @param reply
 */
export const createUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const bcrypt = new Bcrypt(_.get(App, 'serviceConfig.bcrypt.saltRounds')!);
    const payload: IUser = request.body as IUser;

    // check if email is already used
    const userDuplicate = await UserModel.findOne({email: payload.email});
    if (userDuplicate !== null) {
      throw App.errorsHelper.getError('USER_ALREADY_EXISTS', {
        model: 'User',
        email: payload.email
      });
    }

    // make sure that the role actually exists
    const role: IRole | null = await RoleModel.findOne({_id: payload.roleId});
    if (role === null) {
      throw App.errorsHelper.getError('NOT_FOUND', {
        model: 'Role',
        id: payload.roleId
      });
    }

    // encrypt password
    payload.password = await bcrypt.generateHash(payload.password);

    // create a new user
    const createdUser = await UserModel.create(payload);
    return reply.send(createdUser);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to create User');

    throw err;
  }
};

/**
 * Retrieve one user from DB
 * @param request
 * @param reply
 */
export const retrieveUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const responseData: {
      data?: IUser,
      metadata?: any
    } = {
      metadata: {}
    };
    const {userId} = request.params as { userId: string };
    const user: IUser | null = await UserModel.findOne(
      {_id: userId},
      null,
      {lean: true}
    );

    if (user === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    responseData.data = user;

    // retrieve the user's role
    const role: IRole | null = await RoleModel.findOne(
      {_id: user.roleId},
      null,
      {lean: true}
    );

    if (role) {
      responseData.metadata.role = role;
    }

    return reply.send(responseData);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to retrieve User');

    throw err;
  }
};

/**
 * Update User instance
 * @param request
 * @param reply
 */
export const updateUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as IUser;
    const {userId} = request.params as { userId: string };

    // make sure that the role actually exists
    if (payload.roleId) {
      const role: IRole | null = await RoleModel.findOne({_id: payload.roleId});
      if (role === null) {
        throw App.errorsHelper.getError('NOT_FOUND', {
          model: 'Role',
          id: payload.roleId
        });
      }
    }

    // check if email is already used
    if (payload.email) {
      const userDuplicate = await UserModel.findOne({email: payload.email});
      if (userDuplicate !== null && userDuplicate._id.toString() !== userId) {
        throw App.errorsHelper.getError('USER_ALREADY_EXISTS', {
          model: 'User',
          email: payload.email
        });
      }
    }

    // update the user
    const updatedUser: IUser | null = await UserModel.findOneAndUpdate(
      {_id: userId},
      payload,
      {
        new: true,
        lean: true
      }
    );

    if (updatedUser === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // return the newly updated user
    return reply.send(updatedUser);
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to update User');

    throw err;
  }
};

/**
 * Delete User Instance
 * @param request
 * @param reply
 */
export const deleteUser = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const {userId} = request.params as { userId: string };
    const deletedUser = await UserModel.findOneAndRemove(
      {_id: userId}
    );

    if (deletedUser === null) {
      throw App.errorsHelper.getError('NOT_FOUND');
    }

    // user deleted successfully
    reply.code(204);
    return reply.send();
  } catch (err: any) {
    request.log.error({
      err: err.toString() || JSON.stringify(err),
      stack: err.stack,
      params: request.params
    }, 'Failed to delete User');

    throw err;
  }
};

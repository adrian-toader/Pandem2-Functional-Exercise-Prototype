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
import yargs from 'yargs';
import { readJSONSync } from 'fs-extra';
import { getConnection } from '../server/core/database/mongodbConnection';
import { Bcrypt } from '../server/helpers/bcrypt';
import * as Path from 'path';
import { RoleModel } from '../models/role';
import { UserModel } from '../models/user';

const permissions = readJSONSync(Path.resolve(__dirname, './../config/permissions.json'));
const config = readJSONSync(Path.resolve(__dirname, './../config/config.json'));

// cache mongodb connection
let connection: any;

/**
 * Creates/Updates the admin user
 */

const initAdminUserRole = async () => {
  try {
    if (!connection) {
      connection = await getConnection(config.mongodb);
    }

    return await RoleModel.findOneAndUpdate(
      {
        name: 'admin'
      },
      {
        permissions: permissions
      },
      {
        upsert: true,
        new: true
      }
    );
  } catch (err) {
    console.error('Error creating admin role: ' + err);
  }

};

const initAdminUser = async (adminRoleId: string, email: string, password: string) => {
  try {
    const bcrypt = new Bcrypt(config.bcrypt.saltRounds!);
    const hashedPassword = await bcrypt.generateHash(password);

    if (!connection) {
      connection = await getConnection(config.bcrypt.mongodb);
    }

    return await UserModel
      .findOneAndUpdate(
        {
          email: email
        },
        {
          first_name: 'admin',
          last_name: 'admin',
          roleId: adminRoleId,
          password: hashedPassword
        },
        {
          upsert: true,
          new: true
        }
      );

  } catch (err) {
    console.error('Error creating admin user: ' + err);
  }
};

/**
 * Execute script functionality
 * @returns {Promise<any | void>}
 */
const run = async () => {
  // get options passed with script
  const options = yargs
    .usage('$0 command')
    .help('h')
    .alias('h', 'help')
    .argv as {
    email?: string,
    password?: string
  };

  // check for given email in script params
  let email = options.email;
  if (!email) {
    // check for email in environment variables
    email = process.env.ADMIN_EMAIL;
  }
  if (!email) {
    console.error('Email not provided. Use --email option or set the ADMIN_EMAIL environment variable to provide the email'); // eslint-disable-line no-console
    process.exit(1);
  }

  // check for given password in script params
  let password = options.password;
  if (!password) {
    // check for password in environment variables
    password = process.env.ADMIN_PASSWORD;
  }
  if (!password) {
    console.error('Password not provided. Use --password option or set the ADMIN_PASSWORD environment variable to provide the password'); // eslint-disable-line no-console
    process.exit(1);
  }

  const saltRounds = config.bcrypt?.saltRounds;
  if (!saltRounds) {
    console.error('Config validation error. bcrypt.saltRounds is required');
    process.exit(1);
  }

  try {
    const adminRole = await initAdminUserRole();
    if (adminRole) {
      const adminUser = await initAdminUser(adminRole._id, email, password);
      if (adminUser) {
        console.log('Admin user created / updated successfully');
        process.exit();
      }
    }
  } catch (err) {
    console.error('Error creating / updating admin user');
    console.error(err);
    process.exit(1);
  }
};

run();

const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/authenticate9');

const RegisteredUser = sequelize.define(
    'RegisteredUser',
    {
        user_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    { 
        tableName: 'registeredUsers', 
        timestamps: false 
    }
)

const Contact = sequelize.define(
    'Contact',
    {
        is_contact_of: {
            type: DataTypes.INTEGER,
            primaryKey: false,
            references: {
                model: RegisteredUser, // This is a reference to another model
                key: 'user_id', // This is the column name of the referenced model
            }
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false
        },
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            primaryKey: false
        }
    }, 
    {
        tableName: 'contacts',
        timestamps: false,
        id: false,
        indexes: [
            {
                unique: true,
                fields: ['is_contact_of', 'phone_number']
            }
        ]
    }
);
Contact.removeAttribute('id');
const SpamNumber = sequelize.define(
    'SpamNumber', 
    {
        added_by: {
            type: DataTypes.INTEGER,
            primaryKey: false,
            references: {
                model: RegisteredUser, // This is a reference to another model
                key: 'user_id', // This is the column name of the referenced model
            }
        },
        phone_number: {
            type: DataTypes.STRING,
            primaryKey: false,
            allowNull: false
        }
    }, 
    {
        tableName: 'spamNumbers',
        timestamps: false,
        id: false
    }
);
SpamNumber.removeAttribute('id');
module.exports = {
    sequelize,
    RegisteredUser,
    Contact,
    SpamNumber
  };

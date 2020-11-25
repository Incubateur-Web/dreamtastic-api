import { Document, Model, Mongoose, Schema} from 'mongoose';
import ServiceContainer from '../services/service-container';
import { DreamInstance } from './dream-model';
import Attributes from './model';

/**
 * User attributes interface.
 */
export interface UserAttributes extends Attributes {
    name: string;
    password: string;
    description: string;
    lastConnection: Date;
    avatar: string;
    dreams:DreamInstance;
}

/**
 * User instance interface.
 */
export interface UserInstance extends UserAttributes, Document {}

/**
 * Creates the user model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<UserInstance> {
    return mongoose.model('User', createUserSchema(container), 'users');
}

/**
 * Creates the user schema.
 * 
 * @param container Services container
 * @returns User schema
 */
function createUserSchema(container: ServiceContainer) {
    const schema = new Schema({
        name: {
            type: Schema.Types.String,
            required: [true, 'Name is required'],
            unique: [true, 'Name already exists']
        },
        password: {
            type: Schema.Types.String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password is too small'],
            select: false
        },
        description: {
            type: Schema.Types.String
        },
        lastConnection: {
            type: Schema.Types.Date,
            required:[true, 'lastConnection is required']
        },
        avatar: {
            type: Schema.Types.String
        },
        dreams:[{
            type:Schema.Types.ObjectId,
            required:true,
            trim:true
        }]
    }, {
        timestamps: true,
        versionKey: false,
        toJSON:   { virtuals: true },
        toObject: { virtuals: true }
    });

    // Password hash validation
    schema.pre('save', async function(this: UserInstance, next) {
        if (this.password != null) { // Validates the password only if filled
            try {
                this.password = await container.crypto.hash(this.password, parseInt(process.env.HASH_SALT, 10));
                return next();
            } catch (err) {
                return next(err);
            }
        }
    });

    return schema;
}

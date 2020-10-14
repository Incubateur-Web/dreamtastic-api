import mongooseToJson from '@meanie/mongoose-to-json';
import { Document, Model, Mongoose, Schema } from 'mongoose';
import Attributes from './model';
import ServiceContainer from '../services/service-container';

/**
 * User attributes interface.
 */
export interface TypeAttributes extends Attributes {
    name: string;
    color: string;
}

/**
 * User instance interface.
 */
export interface TypeInstance extends TypeAttributes, Document {}

/**
 * Creates the type model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<TypeInstance> {
    return mongoose.model('Type', createSchema(container), 'types');
}

/**
 * Creates the type schema.
 * 
 * @param container Services container
 * @returns Type schema
 */
function createSchema(container: ServiceContainer) {
    const schema = new Schema({
        name: {
            type: Schema.Types.String,
            required: [true, 'Type name is required']
        },
        color: {
            type: Schema.Types.String,
            required: [true, 'Type color is required'],
            validate: {
                validator: (value: string) => /^#([0-9a-f]{3}){1,2}$/i.test(value),
                    message: 'Invalid color'
            }
        }
    }, {
        timestamps: true,
        versionKey: false
    });
    schema.plugin(mongooseToJson)
    return schema;
}

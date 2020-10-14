import { Document, Model, Mongoose, Schema } from 'mongoose';
import Attributes from './model';
import ServiceContainer from '../services/service-container';
import mongooseToJson from '@meanie/mongoose-to-json';



/**
 * Topic attributes interface.
 */
export interface TopicAttributes extends Attributes {
    name: string;
    color: string;
}
/**
 * User instance interface.
 */
export interface TopicInstance extends TopicAttributes, Document {}
/**
 * Creates the type model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<TopicInstance> {
    return mongoose.model('Topic', createSchema(container), 'topics');
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
            required: [true, 'Topic name is required']
        },
        color: {
            type: Schema.Types.String,
            required: [true, 'Topic color is required'],
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


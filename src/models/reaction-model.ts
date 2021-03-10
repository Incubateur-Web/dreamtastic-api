import { Document, Model, Mongoose, Schema } from 'mongoose';
import Attributes from './model';
import ServiceContainer from '../services/service-container';
import mongooseToJson from '@meanie/mongoose-to-json';


/**
 * Reaction attributes interface.
 */
export interface ReactionAttributes extends Attributes {
    name: string;
    icon: string;
}

/**
 * Reaction instance interface.
 */
export interface ReactionInstance extends ReactionAttributes, Document { }

/**
 * Creates the reaction model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<ReactionInstance> {
    return mongoose.model('Reaction', createSchema(container), 'reactions');
}

/**
 * Creates the reaction schema.
 * 
 * @param container Services container
 * @returns Reaction schema
 */
function createSchema(container: ServiceContainer) {
    const schema = new Schema({
        name: {
            type: Schema.Types.String,
            required: [true, 'Reaction  is required']
        },
        icon: {
            type: Schema.Types.String,
            required: [true, 'icon is required'],

        }
    }, {
        timestamps: true,
        versionKey: false
    });
    schema.plugin(mongooseToJson);
    return schema;
}



import { Document, Model, Mongoose, Schema } from 'mongoose';
import Attributes from './model';
import ServiceContainer from '../services/service-container';
import mongooseToJson from '@meanie/mongoose-to-json';
import { UserInstance } from './user-model';
import { TopicInstance } from './topic-model';
import { TypeInstance } from './type-model';
import { CommentInstance } from './comment-model';

/**
 * Dream attributes interface.
 */
export interface DreamAttributes extends Attributes {
    author: UserInstance;
    anonym: boolean;
    content: string;
    topics: TopicInstance;
    type: TypeInstance;
    published: boolean;
    comments: CommentInstance;
    title: string;
}

/**
 * Dream instance interface.
 */
export interface DreamInstance extends DreamAttributes, Document {}

/**
 * Creates the dream model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<DreamInstance> {
    return mongoose.model('Dream', createSchema(container), 'dreams');
}

/**
 * Creates the dream schema.
 * 
 * @param container Services container
 * @returns Dream schema
 */
function createSchema(container: ServiceContainer) {
    const schema = new Schema({
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Dream author is required']
        },
        anonym:  {
            type: Schema.Types.Boolean,
            default: false
        },
        content: {
            type: Schema.Types.String,
            required: [true, 'Dream content is required']
        },
        topics:  {
            type: Schema.Types.ObjectId,
            ref: 'Topic',
            required: [true, 'Dream topic is required']
        },
        type: {
            type: Schema.Types.ObjectId,
            ref: 'Type',
            required: [true, 'Dream type is required']
        },
        published: {
            type: Schema.Types.Boolean,
            default: false
        },
        comments:  {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
            required: [true, 'Dream comment is required']
        },
        title: {
            type: Schema.Types.String,
            required: [true, 'Dream title is required']
        }
    }, {
        timestamps: true,
        versionKey: false
    });
    schema.plugin(mongooseToJson);
    return schema;
}

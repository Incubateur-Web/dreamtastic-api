import mongooseToJson from '@meanie/mongoose-to-json';
import { Document, Model, Mongoose, Schema } from 'mongoose';
import Attributes from './model';
import ServiceContainer from '../services/service-container';
import { UserInstance } from './user-model';
import { DreamInstance } from './dream-model';

/**
 * Comment attributes interface.
 */
export interface CommentAttributes extends Attributes {
    content: string;
    author : UserInstance;
    parent : CommentInstance;
    dream: DreamInstance;
}

/**
 * Comment instance interface.
 */
export interface CommentInstance extends CommentAttributes, Document {}

/**
 * Creates the comment model.
 * 
 * @param container Services container
 * @param mongoose Mongoose instance
 */
export default function createModel(container: ServiceContainer, mongoose: Mongoose): Model<CommentInstance> {
    return mongoose.model('Comment', createSchema(container), 'comments');
}

/**
 * Creates the comment schema.
 * 
 * @param container Services container
 * @returns Comment schema
 */
function createSchema(container: ServiceContainer) {
    const schema = new Schema({
        content: {
            type: Schema.Types.String,
            required: [true, 'Content is required']
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Author is required'],
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref:'Comment'
        },
        dream:{
            type:Schema.Types.ObjectId,
            ref:'Dream'
        }
    }, {
        timestamps: true,
        versionKey: false
    });
    schema.plugin(mongooseToJson);
    return schema;
}

import { Request, Response } from 'express';
import Controller, { Link } from './controller';
import ServiceContainer from '../services/service-container';

/**
 * Users controller class.
 * 
 * Root path : `/dreams`
 */
export default class DreamController extends Controller {

    /**
     * Creates a new dreams controller.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container, '/dreams');
        this.registerEndpoint({ method: 'GET', uri: '/', handlers: this.dreamlistHandler });
        this.registerEndpoint({ method: 'GET', uri: '/:id', handlers: this.getDreamHandler });
        this.registerEndpoint({ method: 'GET', uri: '/:id/comments', handlers: this.getCommentDreamHandler });
        this.registerEndpoint({ method: 'GET', uri: '/:id/comments/:commentId', handlers: this.getSpecificCommentDreamHandler });
        this.registerEndpoint({ method: 'POST', uri: '/:id/comments', handlers: this.createCommentDreamHandler });
        this.registerEndpoint({ method: 'POST', uri: '/:id/comments/:commentId/reply', handlers: this.replyCommentDreamHandler });
        this.registerEndpoint({ method: 'POST', uri: '/', handlers: this.createDreamHandler });
        this.registerEndpoint({ method: 'PATCH', uri: '/:id', handlers: this.updateDreamHandler });
        this.registerEndpoint({ method: 'PATCH', uri: '/:id/comments/:commentId', handlers: this.updateCommentDreamHandler });
        this.registerEndpoint({ method: 'DELETE', uri: '/:id', handlers: this.deleteDreamHandler });
        this.registerEndpoint({ method: 'DELETE', uri: '/:id/comments/:commentId', handlers: this.deleteCommentDreamHandler });
    }

    /**
     * Lists all dreams.
     * 
     * Path : `GET /dreams`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async dreamlistHandler(req: Request, res: Response): Promise<Response> {
        const { offset, limit, ...query } = req.query;
        try {
            return res.status(200).send({ dreams: await this.db.dreams.find(query).skip(parseInt(offset)).limit(parseInt(limit)) });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Get a specific dream.
     * 
     * Path : `GET /dreams`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async getDreamHandler(req:Request, res:Response): Promise<Response>{
        try {
            const dream = await this.db.dreams.findById(req.params.id);
            if (dream == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Dream not found'
                }));
            }
            return res.status(200).send({ dream });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }
    /**
     * Get all comments in a specific dream.
     * 
     * Path : `GET /dreams/:id/comments`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async getCommentDreamHandler(req:Request, res:Response): Promise<Response>{
        try{
            const dream = await this.db.dreams.findById(req.params.id).populate('comments');
            if (dream == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Dream not found'
                }));
            }   return res.status(200).send({comments: dream.comments})
        }catch(err){
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }
     /**
     * Get a specific comment in a specific dream.
     * 
     * Path : `GET /dreams/:id/comments/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async getSpecificCommentDreamHandler(req:Request, res:Response): Promise<Response>{
        try{
            const dream = await this.db.dreams.findById(req.params.id).populate('comments');
            if (dream == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Dream not found'
                }));
            }
            const comment = dream.comments.find(comment => comment.id === req.params.commentId);
            if(comment == null){
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Comment not found'
                }));
            }
                return res.status(200).send({comment})
        }catch(err){
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

     /**
     * Creates a new comment.
     * 
     * Path : `POST /dreams/:id/comments`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async createCommentDreamHandler(req: Request, res: Response): Promise<Response> {
        try {
            const dream = await this.db.dreams.findById(req.params.id)
            if (dream == null){
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Dream not found'
                }));
            }
            const comment = await this.db.comments.create({
                content:   req.body.content,
                author:    req.body.author,
                parent:    null,
                dream
            });
            return res.status(201).send({
                id: comment.id,
                links: [{
                    rel: 'Gets the created comment',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${req.body.id}/${comment.id}`
                }] as Link[]
            });
        } catch (err) {
            if (err.id === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

     /**
     * Creates a new reply comment.
     * 
     * Path : `POST /dreams/:id/comments/:commentId/reply`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async replyCommentDreamHandler(req: Request, res: Response): Promise<Response> {
        try {
            const dream = await this.db.dreams.findById(req.params.id).populate('comments');
            if (dream == null){
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Dream not found'
                }));
            }
            const parent = await this.db.comments.findById(req.params.commentId);
            if (parent == null){
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Parent comment not found'
                }));
            }
            const comment = await this.db.comments.create({
                content:   req.body.content,
                author:    req.body.author,
                parent,
                dream
            });
            return res.status(201).send({
                id: comment.id,
                links: [{
                    rel: 'Gets the created comment',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${req.body.id}/${comment.id}`
                }] as Link[]
            });
        } catch (err) {
            if (err.id === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Update a comment.
     * 
     * Path : `POST /dreams/:id/comments`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */

    public async updateCommentDreamHandler(req:Request, res:Response): Promise<Response>{
        try {
            const dream = await this.db.dreams.findById(req.params.id).populate('comments');
            if (dream == null){
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Dream not found'
                }));
            }
            const comment = dream.comments.find(comment => comment.id === req.params.commentId)
            if(comment == null){
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Comment not found'
                }));
            }
            if (req.body.content != null) {
                comment.content = req.body.content;
            }
            await comment.save();
            return res.status(200).send({
                id: dream.id,
                links: [{
                    rel: 'Gets the updated comment',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${dream.id}/comments/${comment.id}`
                }] as Link[]
            });
        } catch (err) {
            if (err.id === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }
    /**
     * Delete a comment.
     * 
     * Path : `DeLETE /dreams/:id/comments/:commentId`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async deleteCommentDreamHandler(req: Request, res: Response): Promise<Response>{
        try {
            const dream = await this.db.dreams.findById(req.params.id)
            if (dream == null){
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Dream not found'
                }));
            }
            const comment = await this.db.comments.findByIdAndDelete(req.params.commentId)
            if(comment == null){
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Comment not found'
                }));
            }
            return res.status(204).send()
        } catch (err) {
            if (err.id === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }
    /**
     * Creates a new dream.
     * 
     * Path : `POST /dreams`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async createDreamHandler(req: Request, res: Response): Promise<Response> {
        try {
            const dream = await this.db.dreams.create({
                content:   req.body.content,
                title:     req.body.title,
                topics:    req.body.topics,
                type:      req.body.type,
                anonym:    req.body.anonym,
                author:    req.body.author
            });
            return res.status(201).send({
                id: dream.id,
                links: [{
                    rel: 'Gets the created dream',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${dream.id}`
                }] as Link[]
            });
        } catch (err) {
            if (err.id === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

  /**
     * Updates an user.
     * 
     * Path : `PATCH /users/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async updateDreamHandler(req: Request, res: Response): Promise<Response> {
        try {
            const dream = await this.db.dreams.findById(req.params.id);
            if (dream == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Dream not found'
                }));
            }
            if (req.body.title != null) {
                dream.title = req.body.title;
            }
            if (req.body.content != null) {
                dream.content = req.body.content;
            }
            if (req.body.topics != null){
                dream.topics = req.body.topics;
            }
            if (req.body.type != null){
                dream.type = req.body.type;
            }
            if (req.body.anonym != null){
                dream.anonym = req.body.anonym;
            }
            await dream.save();
            return res.status(200).send({
                id: dream.id,
                links: [{
                    rel: 'Gets the updated dream',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${dream.id}`
                }] as Link[]
            });
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Deletes a Dream.
     * 
     * Path : `DELETE /dreams/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async deleteDreamHandler(req: Request, res: Response): Promise<Response> {
        try {
            const dream = await this.db.dreams.findByIdAndDelete(req.params.id);
            if (dream == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Dream not found'
                }));
            }
            return res.status(204).send();
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }
}

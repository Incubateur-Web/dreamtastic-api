import { Request, Response } from 'express';
import Controller, { Link } from './controller';
import ServiceContainer from '../services/service-container';

/**
 * Reaction controller class.
 * 
 * Root path : `/reactions`
 */
export default class TopicController extends Controller {

    /**
     * Creates a new reaction controller.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container, '/reactions');
        this.registerEndpoint({ method: 'GET', uri: '/', handlers: this.listHandler });
        this.registerEndpoint({ method: 'POST', uri: '/', handlers: this.createHandler });
        this.registerEndpoint({ method: 'DELETE', uri: '/:id', handlers: this.deleteHandler });
        this.registerEndpoint({ method: 'PATCH', uri: '/:id', handlers: this.updateHandler });

    }

    /**
    * Lists all reactions.
    * 
    * Path : `GET /reactions`
    * 
    * @param req Express request
    * @param res Express response
    * @async
    */
    public async listHandler(req: Request, res: Response): Promise<Response> {
        try {
            return res.status(200).send({ reactions: await this.db.reactions.find() });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Creates a new reaction.
     * 
     * Path : `POST /reactions`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async createHandler(req: Request, res: Response): Promise<Response> {
        try {
            const reaction = await this.db.reactions.create({
                name: req.body.name,
                icon: req.body.icon
            });
            return res.status(201).send({
                id: reaction.id,
                links: [{
                    rel: 'Gets the created reaction',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${reaction.name}`
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
     * Deletes a reaction.
     * 
     * Path : `DELETE /reactions/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async deleteHandler(req: Request, res: Response): Promise<Response> {
        try {
            const reaction = await this.db.reactions.findByIdAndDelete(req.params.id);
            if (reaction == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'reaction not found'
                }));
            }
            return res.status(204).send();
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
    * Gets a specific reaction.
    * 
    * Path : `GET /reactions/:id`
    * 
    * @param req Express request
    * @param res Express response
    * @async
    */
    public async getHandler(req: Request, res: Response): Promise<Response> {
        try {
            const reaction = await this.db.reactions.findById(req.params.id);
            if (reaction == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'reaction not found'
                }));
            }
            return res.status(200).send({ reaction });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
    * Updates a reaction.
    * 
    * Path : `PATCH /reactions/:id`
    * 
    * @param req Express request
    * @param res Express response
    * @async
    */
    public async updateHandler(req: Request, res: Response): Promise<Response> {
        try {
            const reaction = await this.db.reactions.findById(req.params.id);
            if (reaction == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'reaction not found'
                }));
            }
            if (req.body.name != null) {
                reaction.name = req.body.name;
            }
            if (req.body.icon != null) {
                reaction.icon = req.body.icon;
            }

            await reaction.save();
            return res.status(200).send({
                id: reaction.id,
                links: [{
                    rel: 'Gets the updated reaction',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${reaction.id}`
                }] as Link[]
            });
        } catch (err) {
            if (err.name === 'ValidationError') {
                return res.status(400).send(this.container.errors.formatErrors(...this.container.errors.translateMongooseValidationError(err)));
            }
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

}

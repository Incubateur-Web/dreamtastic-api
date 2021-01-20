import { Request, Response } from 'express';
import Controller, { Link } from './controller';
import ServiceContainer from '../services/service-container';

/**
 * Topic controller class.
 * 
 * Root path : `/topics`
 */
export default class TopicController extends Controller {

    /**
     * Creates a new topic controller.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container, '/topics');
        this.registerEndpoint({ method: 'GET', uri: '/', handlers: this.listHandler });
        this.registerEndpoint({ method: 'POST', uri: '/', handlers: this.createHandler });
        this.registerEndpoint({ method: 'DELETE', uri: '/:id', handlers: this.deleteHandler });
        this.registerEndpoint({ method: 'GET', uri: '/:id', handlers: this.getHandler });
        this.registerEndpoint({ method: 'PUT', uri: '/:id', handlers: this.modifyHandler });
    }

    /**
    * Lists all topics.
    * 
    * Path : `GET /topics`
    * 
    * @param req Express request
    * @param res Express response
    * @async
    */
   public async listHandler(req: Request, res: Response): Promise<Response> {
        try {
            return res.status(200).send({ topics: await this.db.topics.find() });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
   }

    /**
     * Creates a new topic.
     * 
     * Path : `POST /topics`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async createHandler(req: Request, res: Response): Promise<Response> {
        try {
            const topic = await this.db.topics.create({
                name: req.body.name,
                color: req.body.color
            });
            return res.status(201).send({
                id: topic.id,
                links: [{
                    rel: 'Gets the created topic',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${topic.name}`
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
     * Deletes a topic.
     * 
     * Path : `DELETE /topics/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async deleteHandler(req: Request, res: Response): Promise<Response> {
        try {
            const topic = await this.db.topics.findByIdAndDelete(req.params.id);
            if (topic == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'topic not found'
                }));
            }
            return res.status(204).send();
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

     /**
     * Gets a specific topic.
     * 
     * Path : `GET /topics/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async getHandler(req: Request, res: Response): Promise<Response> {
        try {
            const topic = await this.db.topics.findById(req.params.id);
            if (topic == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'topic not found'
                }));
            }
            return res.status(200).send({ topic });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Modifies a topic.
     * 
     * Path : `PUT /topics/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async modifyHandler(req: Request, res: Response): Promise<Response> {
        try {
            const topic = await this.db.topics.findById(req.params.id);
            if (topic == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Topic not found'
                }));
            }
            topic.name = req.body.name;
            topic.color = req.body.color;
            await topic.save();
            return res.status(200).send({
                id: topic.id,
                links: [{
                    rel: 'Gets the modified topic',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${topic.id}`
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

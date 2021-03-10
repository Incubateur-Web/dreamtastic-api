import { Request, Response } from 'express';
import Controller, { Link } from './controller';
import ServiceContainer from '../services/service-container';

/**
 * Type controller class.
 * 
 * Root path : `/Type`
 */
export default class TypeController extends Controller {

    /**
     * Creates a new type controller.
     * 
     * @param container Services container
     */
    public constructor(container: ServiceContainer) {
        super(container, '/types');
        this.registerEndpoint({ method: 'POST', uri: '/', handlers: this.createHandler });
        this.registerEndpoint({ method: 'DELETE', uri: '/:id', handlers: this.deleteHandler });
        this.registerEndpoint({ method: 'GET', uri: '/', handlers: this.listHandler });
        this.registerEndpoint({ method: 'GET', uri: '/:id', handlers: this.getHandler });
        this.registerEndpoint({ method: 'PUT', uri: '/:id', handlers: this.modifyHandler });

    }

    /**
     * Creates a new type.
     * 
     * Path : `POST /types`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async createHandler(req: Request, res: Response): Promise<Response> {
        try {
            const type = await this.db.types.create({
                name: req.body.name,
                color: req.body.color
            });
            return res.status(201).send({
                id: type.id,
                links: [{
                    rel: 'Gets the created type',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${type.name}`
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
    * Gets all types.
    * 
    * Path : `GET /types/:id`
    * 
    * @param req Express request
    * @param res Express response
    * @async
    */
    public async listHandler(req: Request, res: Response): Promise<Response> {
        try {
            return res.status(200).send({ types: await this.db.types.find(req.query) });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Deletes a type.
     * 
     * Path : `DELETE /types/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async deleteHandler(req: Request, res: Response): Promise<Response> {
        try {
            const type = await this.db.types.findByIdAndDelete(req.params.id);
            if (type == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'type not found'
                }));
            }
            return res.status(204).send();
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
    * Gets a specific type.
    * 
    * Path : `GET /types/:id`
    * 
    * @param req Express request
    * @param res Express response
    * @async
    */
    public async getHandler(req: Request, res: Response): Promise<Response> {
        try {
            const type = await this.db.types.findById(req.params.id);
            if (type == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'type not found'
                }));
            }
            return res.status(200).send({ type });
        } catch (err) {
            return res.status(500).send(this.container.errors.formatServerError());
        }
    }

    /**
     * Modifies a type.
     * 
     * Path : `PUT /types/:id`
     * 
     * @param req Express request
     * @param res Express response
     * @async
     */
    public async modifyHandler(req: Request, res: Response): Promise<Response> {
        try {
            const type = await this.db.types.findById(req.params.id);
            if (type == null) {
                return res.status(404).send(this.container.errors.formatErrors({
                    error: 'not_found',
                    error_description: 'Type not found'
                }));
            }
            type.name = req.body.name;
            type.color = req.body.color;
            await type.save();
            return res.status(200).send({
                id: type.id,
                links: [{
                    rel: 'Gets the modified type',
                    action: 'GET',
                    href: `${req.protocol}://${req.get('host')}${this.rootUri}/${type.id}`
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

import { json, Request, Response } from 'express'
import { getRepository } from 'typeorm'
import Orphanage from '../models/Orphanage'
import orphanageview from '../views/orphanages_view'
import * as yup from 'yup'
export default{

    async index(request: Request, response: Response) {
        const orphanagesRepository = getRepository(Orphanage);

        const orphanages = await orphanagesRepository.find({
            relations: ['images']
        });

        return response.json(orphanageview.renderMany(orphanages))
    },
    async show(request: Request, response: Response) {
        const { id } = request.params;

        const orphanagesRepository = getRepository(Orphanage);

        const orphanage = await orphanagesRepository.findOneOrFail(id, {
            relations: ['images']
        }
        )

        return response.json(orphanageview.render(orphanage))
    },

    async create(request: Request, response: Response) {
        console.log("chegou no create");
        const { 
            name,
            latitude,
            longitude,
            about,
            instruction,
            opening_hours,
            open_on_weekends,
         } = request.body;
         
         console.log("vai buscar no banco");
         const orphanagesRepository = getRepository(Orphanage);
         console.log("buscou");
         const requestImages = request.files as Express.Multer.File[];

         const images = requestImages.map(image => {
             return{ path:image.filename }
         })


         const data = {
            name,
            latitude,
            longitude,
            about,
            instruction,
            opening_hours,
            open_on_weekends,
            images,
        }

        const schema = yup.object().shape({
          name: yup.string().required(),
          latitude: yup.number().required(),
          longitude: yup.number().required(),
          about: yup.string().required().max(300),
         // instruction: yup.string().required(),
          opening_hours: yup.string().required(),
          open_on_weekends: yup.boolean().required(),
          images: yup.array(yup.object().shape({
            path: yup.string().required()
        }))
      });

      console.log("vai validar");

      //console.log(JSON.stringify(data));

        await schema.validate(data,{
            abortEarly: false,
        })
        console.log("validou");
         data.open_on_weekends = data.open_on_weekends == "true" ? true : false;
         console.log("vai criar");
         const orphanage = orphanagesRepository.create(data);
         console.log("criou");
           await orphanagesRepository.save(orphanage);
           console.log("salvou");
            return response.status(201).json(orphanage)

    }
}
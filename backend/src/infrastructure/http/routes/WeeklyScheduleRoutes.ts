import { Router } from 'express';
import { WeeklyScheduleController } from '../controllers/WeeklyScheduleController.js';
import { GetWeeklySchedule } from '../../../application/useCases/GetWeeklySchedule.js';
import { JsonWeeklyScheduleRepository } from '../../database/JsonWeeklyScheduleRepository.js';

const router = Router();

const repository = new JsonWeeklyScheduleRepository();
const getWeeklySchedule = new GetWeeklySchedule(repository);
const controller = new WeeklyScheduleController(getWeeklySchedule);

router.get('/', (req, res) => controller.getSchedule(req, res));

export default router;
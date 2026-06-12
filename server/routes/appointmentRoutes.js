import express from 'express';
import { 
  createAppointment, 
  getMyAppointments, 
  cancelAppointment, 
  rescheduleAppointment,
  updateAppointmentStatus,
  getMasterAppointments
} from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/', createAppointment);
router.get('/me', getMyAppointments);
router.get('/master', authorize('master', 'admin'), getMasterAppointments);
router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', rescheduleAppointment);
router.put('/:id/status', authorize('admin'), updateAppointmentStatus);

export default router;
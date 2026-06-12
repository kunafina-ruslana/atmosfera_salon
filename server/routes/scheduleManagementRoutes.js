import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getMasterScheduleWithRequests,
  createScheduleRequest,
  createDayOffRequest,
  getPendingScheduleRequests,
  getPendingDayOffRequests,
  approveScheduleRequest,
  rejectScheduleRequest,
  approveDayOffRequest,
  rejectDayOffRequest,
  updateMasterScheduleDirect,
  getMyScheduleRequests,
  getMyOwnSchedule
} from '../controllers/scheduleManagementController.js';

const router = express.Router();

router.use(authenticate);

router.get('/me/schedule', authorize('master', 'admin'), getMyOwnSchedule);
router.post('/me/request-schedule', authorize('master'), createScheduleRequest);
router.post('/me/request-dayoff', authorize('master'), createDayOffRequest);
router.get('/my-requests', authorize('master'), getMyScheduleRequests);

router.get('/master/:masterId/schedule', authorize('admin'), getMasterScheduleWithRequests);

router.get('/pending-schedule-requests', authorize('admin'), getPendingScheduleRequests);
router.get('/pending-dayoff-requests', authorize('admin'), getPendingDayOffRequests);
router.post('/approve-schedule/:id', authorize('admin'), approveScheduleRequest);
router.post('/reject-schedule/:id', authorize('admin'), rejectScheduleRequest);
router.post('/approve-dayoff/:id', authorize('admin'), approveDayOffRequest);
router.post('/reject-dayoff/:id', authorize('admin'), rejectDayOffRequest);
router.put('/master/:masterId/schedule-direct', authorize('admin'), updateMasterScheduleDirect);

export default router;
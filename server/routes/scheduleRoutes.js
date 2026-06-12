import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  generateSlots,
  getMasterWeekSchedule,
  updateWeekSchedule,
  requestScheduleChange,
  createOverride,
  deleteOverride,
  bulkCreateOverrides,
  getPendingRequests,
  approveScheduleChange,
  rejectScheduleChange,
  assignCategoryToMaster,
  removeCategoryFromMaster,
  getMasterCategories,
  getAllMastersWithSchedule,
  getAllMasterCategories,
  initializeMasterSchedule
} from '../controllers/scheduleController.js';

const router = express.Router();

// Публичные маршруты
router.get('/slots', generateSlots);
router.get('/masters/:id/schedule', getMasterWeekSchedule);

// Маршруты для авторизованных пользователей
router.use(authenticate);

// Для мастеров
router.post('/masters/:id/request-change', requestScheduleChange);
router.post('/masters/:id/overrides', createOverride);
router.delete('/overrides/:id', deleteOverride);

// Для администраторов
router.use(authorize('admin'));

router.put('/masters/:id/schedule', updateWeekSchedule);
router.post('/masters/:id/initialize-schedule', initializeMasterSchedule);
router.post('/masters/:id/bulk-overrides', bulkCreateOverrides);
router.get('/pending-requests', getPendingRequests);
router.post('/masters/:id/approve-change', approveScheduleChange);
router.post('/masters/:id/reject-change', rejectScheduleChange);

// Управление категориями мастеров
router.post('/masters/:masterId/categories/:categoryId', assignCategoryToMaster);
router.delete('/masters/:masterId/categories/:categoryId', removeCategoryFromMaster);
router.get('/masters/:masterId/categories', getMasterCategories);
router.get('/masters-categories', getAllMasterCategories);

// Таймлайн всех мастеров
router.get('/masters-timeline', getAllMastersWithSchedule);

export default router;
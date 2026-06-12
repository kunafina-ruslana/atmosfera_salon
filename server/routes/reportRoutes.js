import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getCompletedOrdersReport,
  getMasterServicesReport,
  getRevenueReport,
  getMasterWorkloadReport,
  getPopularServicesReport
} from '../controllers/reportController.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/completed-orders', getCompletedOrdersReport);
router.get('/master-services', getMasterServicesReport);
router.get('/revenue', getRevenueReport);
router.get('/master-workload', getMasterWorkloadReport);
router.get('/popular-services', getPopularServicesReport);

export default router;
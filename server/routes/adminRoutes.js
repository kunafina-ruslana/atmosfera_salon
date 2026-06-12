import express from 'express';
import { 
  getUsers, updateUserRole, blockUser,
  createService, updateService, deleteService,
  createCategory, updateCategory, deleteCategory, getCategories,
  getMasters, createMaster, updateMaster, deleteMaster,
  getMasterSchedule, updateMasterSchedule, createScheduleOverride,
  assignServiceToMaster, removeServiceFromMaster,
  getAllAppointments,
  getWorkPhotos, createWorkPhoto, updateWorkPhoto, deleteWorkPhoto,
  getPromotions, createPromotion, updatePromotion, deletePromotion
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { 
  uploadMasterPhoto, 
  uploadCategoryPhoto, 
  uploadWorkPhoto, 
  uploadPromotion,
  uploadServicePhoto,
  handleUploadError 
} from '../middleware/upload.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', blockUser);

router.get('/categories', getCategories);
router.post('/categories', uploadCategoryPhoto.single('photo'), handleUploadError, createCategory);
router.put('/categories/:id', uploadCategoryPhoto.single('photo'), handleUploadError, updateCategory);
router.delete('/categories/:id', deleteCategory);

router.post('/services', uploadServicePhoto.single('photo'), handleUploadError, createService);
router.put('/services/:id', uploadServicePhoto.single('photo'), handleUploadError, updateService);
router.delete('/services/:id', deleteService);

router.get('/masters', getMasters);
router.post('/masters', createMaster);
router.put('/masters/:id', uploadMasterPhoto.single('photo'), handleUploadError, updateMaster);
router.delete('/masters/:id', deleteMaster);

router.get('/masters/:id/schedule', getMasterSchedule);
router.put('/masters/:id/schedule', updateMasterSchedule);
router.post('/masters/:id/schedule-overrides', createScheduleOverride);

router.post('/masters/:masterId/services/:serviceId', assignServiceToMaster);
router.delete('/masters/:masterId/services/:serviceId', removeServiceFromMaster);

router.get('/appointments', getAllAppointments);

router.get('/work-photos', getWorkPhotos);
router.post('/work-photos', uploadWorkPhoto.single('image'), handleUploadError, createWorkPhoto);
router.put('/work-photos/:id', uploadWorkPhoto.single('image'), handleUploadError, updateWorkPhoto);
router.delete('/work-photos/:id', deleteWorkPhoto);

router.get('/promotions', getPromotions);
router.post('/promotions', uploadPromotion.single('image'), handleUploadError, createPromotion);
router.put('/promotions/:id', uploadPromotion.single('image'), handleUploadError, updatePromotion);
router.delete('/promotions/:id', deletePromotion);

export default router;
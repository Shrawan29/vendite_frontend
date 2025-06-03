import { Router } from 'express';
import {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill
} from '../controllers/bill.controller.js';

const router = Router();

// POST: Create a new bill
router.post('/create-bill', createBill);

// GET: Get all bills
router.get('/bills', getAllBills);

// GET: Get a bill by ID
router.get('/bill/:id', getBillById);

// PUT: Update a bill by ID
router.put('/bill/:id', updateBill);

// DELETE: Delete a bill by ID
router.delete('/bill/:id', deleteBill);

export default router;

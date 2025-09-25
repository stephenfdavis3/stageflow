// StageFlow - Service Management Routes
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireTenant } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Apply authentication and tenant middleware to all routes
router.use(authenticateToken);
router.use(requireTenant);

// Validation schemas
const createServiceSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  dayOfWeek: z.number().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]\s?(AM|PM)$/i, 'Invalid time format (e.g., "10:00 AM")'),
  isActive: z.boolean().optional().default(true)
});

const updateServiceSchema = createServiceSchema.partial();

// GET /api/services - Get all services for the tenant
router.get('/', async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      where: {
        tenantId: req.user!.tenantId
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
      message: 'An error occurred while retrieving services'
    });
  }
});

// GET /api/services/:id - Get a specific service
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      },
      include: {
        schedules: {
          orderBy: { serviceDate: 'desc' },
          take: 5 // Latest 5 schedules
        }
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        message: 'Service does not exist or you do not have access to it'
      });
    }

    res.json({
      success: true,
      data: { service }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service',
      message: 'An error occurred while retrieving the service'
    });
  }
});

// POST /api/services - Create a new service
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createServiceSchema.parse(req.body);

    // Check if service with same name already exists for this tenant
    const existingService = await prisma.service.findFirst({
      where: {
        name: validatedData.name,
        tenantId: req.user!.tenantId
      }
    });

    if (existingService) {
      return res.status(400).json({
        success: false,
        error: 'Service already exists',
        message: 'A service with this name already exists'
      });
    }

    const service = await prisma.service.create({
      data: {
        ...validatedData,
        tenantId: req.user!.tenantId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });
  } catch (error: any) {
    console.error('Create service error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create service',
      message: 'An error occurred while creating the service'
    });
  }
});

// PUT /api/services/:id - Update a service
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateServiceSchema.parse(req.body);

    // Check if service exists and belongs to tenant
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        message: 'Service does not exist or you do not have access to it'
      });
    }

    // If updating name, check for duplicates
    if (validatedData.name && validatedData.name !== existingService.name) {
      const duplicateService = await prisma.service.findFirst({
        where: {
          name: validatedData.name,
          tenantId: req.user!.tenantId,
          id: { not: id }
        }
      });

      if (duplicateService) {
        return res.status(400).json({
          success: false,
          error: 'Service name already exists',
          message: 'A service with this name already exists'
        });
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: validatedData
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service: updatedService }
    });
  } catch (error: any) {
    console.error('Update service error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update service',
      message: 'An error occurred while updating the service'
    });
  }
});

// DELETE /api/services/:id - Delete a service
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if service exists and belongs to tenant
    const existingService = await prisma.service.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!existingService) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        message: 'Service does not exist or you do not have access to it'
      });
    }

    // Check if service has associated schedules
    const scheduleCount = await prisma.schedule.count({
      where: { serviceId: id }
    });

    if (scheduleCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete service',
        message: `This service has ${scheduleCount} associated schedule(s). Please delete or reassign them first.`
      });
    }

    await prisma.service.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete service',
      message: 'An error occurred while deleting the service'
    });
  }
});

// POST /api/services/:id/toggle - Toggle service active status
router.post('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findFirst({
      where: {
        id,
        tenantId: req.user!.tenantId
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Service not found',
        message: 'Service does not exist or you do not have access to it'
      });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: { isActive: !service.isActive }
    });

    res.json({
      success: true,
      message: `Service ${updatedService.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { service: updatedService }
    });
  } catch (error) {
    console.error('Toggle service error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle service',
      message: 'An error occurred while updating the service'
    });
  }
});

export default router;
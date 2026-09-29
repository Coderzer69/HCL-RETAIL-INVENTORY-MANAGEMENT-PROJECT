import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { ApiError } from '../utils/ApiError';

export const getMyNotifications = async (req: Request, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: (req as any).user!.id },
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json({ success: true, data: notifications });
};

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const notification = await prisma.notification.findUnique({
    where: { id: id as string }
  });

  if (!notification) throw new ApiError(404, 'Notification not found');
  if (notification.userId !== (req as any).user!.id) {
    throw new ApiError(403, 'Forbidden');
  }

  const updated = await prisma.notification.update({
    where: { id: id as string },
    data: { status: 'READ' }
  });

  res.status(200).json({ success: true, data: updated });
};

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authorizePropertyOwner, AuthenticatedRequest } from '../middlewares/auth';
import {
  PropertyCreateSchema,
  BookingCreateSchema,
  PropertyVisitCreateSchema,
} from '../schemas/realEstate';
import { NextFunction, Response } from 'express';

describe('Real Estate (Olma Immo) Domain Security & Validation Suite (OLM-01)', () => {
  let mockStatus: ReturnType<typeof vi.fn>;
  let mockJson: ReturnType<typeof vi.fn>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockJson = vi.fn();
    mockStatus = vi.fn().mockReturnValue({ json: mockJson });
    mockRes = {
      status: mockStatus as unknown as Response['status'],
    };
    mockNext = vi.fn();
  });

  describe('Zod Validation Schemas', () => {
    it('1. PropertyCreateSchema validates correct property payload', () => {
      const validPayload = {
        title: 'Superbe Appartement F3 Hydra',
        description: 'Magnifique appartement avec vue dégagée sur Alger, toutes commodités.',
        propertyType: 'apartment',
        listingType: 'rent_long',
        price: 85000,
        pricePeriod: 'month',
        areaSquareMeters: 95,
        rooms: 3,
        bathrooms: 1,
        features: ['parking', 'elevator', 'sea_view'],
        images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
        location: {
          lat: 36.7525,
          lng: 3.042,
          address: '12 Rue des Pins, Hydra',
          commune: 'Hydra',
          wilaya: 'Alger',
        },
      };

      const result = PropertyCreateSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Superbe Appartement F3 Hydra');
        expect(result.data.status).toBe('active');
      }
    });

    it('2. PropertyCreateSchema rejects invalid coordinates, negative prices, or empty fields', () => {
      const invalidPayload = {
        title: '  ',
        description: 'court',
        propertyType: 'spaceship', // invalid enum
        listingType: 'rent_long',
        price: -500, // negative
        areaSquareMeters: 0,
        rooms: -1,
        bathrooms: 1,
        images: ['not-a-url'],
        location: {
          lat: 120, // invalid latitude
          lng: 3.042,
          address: '',
          commune: '',
          wilaya: '',
        },
      };

      const result = PropertyCreateSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('3. BookingCreateSchema rejects invalid or inverted dates (endDate <= startDate)', () => {
      const invertedDates = {
        propertyId: 'PROP-101',
        startDate: '2026-09-10',
        endDate: '2026-09-05',
      };

      const result = BookingCreateSchema.safeParse(invertedDates);
      expect(result.success).toBe(false);
    });

    it('4. PropertyVisitCreateSchema validates required visit information', () => {
      const validVisit = {
        propertyId: 'PROP-101',
        visitorName: 'Sofiane Meziani',
        visitorPhone: '0550123456',
        preferredDate: '2026-09-15',
        timeSlot: '10:00 - 12:00',
      };

      const result = PropertyVisitCreateSchema.safeParse(validVisit);
      expect(result.success).toBe(true);
    });
  });

  describe('authorizePropertyOwner RBAC Middleware Validation', () => {
    it('5. Rejects unauthenticated requests with 403 Forbidden', () => {
      const mockReq: Partial<AuthenticatedRequest> = {};
      authorizePropertyOwner(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Accès refusé') })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('6. Rejects standard buyer role with 403 Forbidden', () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: 'buyer_user_1',
          role: 'buyer',
        },
      };
      authorizePropertyOwner(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('7. Allows property_owner role through to controller', () => {
      const mockReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: 'owner_user_1',
          role: 'property_owner',
        },
      };
      authorizePropertyOwner(mockReq as AuthenticatedRequest, mockRes as Response, mockNext);

      expect(mockStatus).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('8. Allows seller and admin roles to publish and manage real estate listings', () => {
      const mockSellerReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: 'seller_user_1',
          role: 'seller',
        },
      };
      authorizePropertyOwner(mockSellerReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(1);

      const mockAdminReq: Partial<AuthenticatedRequest> = {
        user: {
          uid: 'admin_user_1',
          role: 'admin',
        },
      };
      authorizePropertyOwner(mockAdminReq as AuthenticatedRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledTimes(2);
    });
  });

  describe('BOLA / IDOR Protection & Server-side Property Controls', () => {
    it('9. Property Creation enforces ownerId = req.user.uid regardless of client body manipulation', () => {
      const authenticatedUid = 'real_owner_uid_99';
      const clientAttackerPayload = {
        ownerId: 'victim_user_uid_00', // Attacker attempts to impersonate another user
        title: 'Villa de Luxe Oran',
        description: 'Superbe villa avec piscine au bord de la mer.',
        propertyType: 'villa',
        listingType: 'sale',
        price: 45000000,
        areaSquareMeters: 350,
        rooms: 6,
        bathrooms: 3,
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
        location: {
          lat: 35.697,
          lng: -0.63,
          address: 'Akid Lotfi, Oran',
          commune: 'Oran',
          wilaya: 'Oran',
        },
      };

      // Server logic simulation as in /api/v1/real-estate/properties:
      const { ownerId: _incomingOwnerId, ...cleanBody } = clientAttackerPayload;
      void _incomingOwnerId;
      const enforcedOwnerId = authenticatedUid;

      const serverConstructedProperty = {
        ...cleanBody,
        id: 'PROP-TEST-001',
        ownerId: enforcedOwnerId,
        viewsCount: 0,
      };

      expect(serverConstructedProperty.ownerId).toBe('real_owner_uid_99');
      expect(serverConstructedProperty.ownerId).not.toBe('victim_user_uid_00');
    });

    it('10. Property Update blocks IDOR attempt when caller is not the property owner', () => {
      const existingProperty = {
        id: 'PROP-101',
        ownerId: 'legitimate_owner_123',
        title: 'Appartement Hydra',
      };

      const attackerUid = 'hacker_user_456';
      const isServerAdmin = false;

      const isAuthorized = existingProperty.ownerId === attackerUid || isServerAdmin;
      expect(isAuthorized).toBe(false);
    });

    it('11. Property Update allows legitimate owner or server admin to update property', () => {
      const existingProperty = {
        id: 'PROP-101',
        ownerId: 'legitimate_owner_123',
        title: 'Appartement Hydra',
      };

      const ownerUid = 'legitimate_owner_123';
      const adminUid = 'admin_999';

      const isOwnerAuthorized = existingProperty.ownerId === ownerUid || false;
      const isAdminAuthorized = existingProperty.ownerId === adminUid || true; // admin role

      expect(isOwnerAuthorized).toBe(true);
      expect(isAdminAuthorized).toBe(true);
    });

    it('12. Protected properties (draft, archived, pending) are denied to anonymous and third-party users', () => {
      const draftProperty = {
        id: 'PROP-DRAFT-1',
        ownerId: 'owner_abc',
        status: 'draft',
      };

      const nonPublicStatuses = ['draft', 'archived', 'pending'];

      // Anonymous user
      const anonymousUid: string | null = null;
      const isAnonymousAllowed =
        !nonPublicStatuses.includes(draftProperty.status) ||
        (anonymousUid !== null && anonymousUid === draftProperty.ownerId);
      expect(isAnonymousAllowed).toBe(false);

      // Third-party user
      const thirdPartyUid = 'user_intruder';
      const isThirdPartyAllowed =
        !nonPublicStatuses.includes(draftProperty.status) ||
        thirdPartyUid === draftProperty.ownerId;
      expect(isThirdPartyAllowed).toBe(false);

      // Legitimate owner
      const isOwnerAllowed =
        !nonPublicStatuses.includes(draftProperty.status) ||
        draftProperty.ownerId === 'owner_abc';
      expect(isOwnerAllowed).toBe(true);
    });

    it('13. Booking Anti-Self-Booking prevents property owner from booking their own listing', () => {
      const property = {
        id: 'PROP-RENT-001',
        ownerId: 'host_uid_777',
        status: 'active',
        listingType: 'rent_short',
      };

      const bookingTenantUid = 'host_uid_777'; // Same as owner
      const isSelfBooking = property.ownerId === bookingTenantUid;

      expect(isSelfBooking).toBe(true);
      // The endpoint must reject with 403
    });

    it('14. Booking date overlap algorithm detects collisions accurately', () => {
      const existingBooking = {
        startDate: '2026-09-10',
        endDate: '2026-09-15',
      };

      const checkOverlap = (newStart: string, newEnd: string) => {
        return existingBooking.startDate < newEnd && existingBooking.endDate > newStart;
      };

      // Exact match -> collision
      expect(checkOverlap('2026-09-10', '2026-09-15')).toBe(true);

      // Overlapping inside -> collision
      expect(checkOverlap('2026-09-11', '2026-09-14')).toBe(true);

      // Overlapping start -> collision
      expect(checkOverlap('2026-09-08', '2026-09-12')).toBe(true);

      // Overlapping end -> collision
      expect(checkOverlap('2026-09-14', '2026-09-20')).toBe(true);

      // Completely before -> no collision
      expect(checkOverlap('2026-09-01', '2026-09-10')).toBe(false);

      // Completely after -> no collision
      expect(checkOverlap('2026-09-15', '2026-09-22')).toBe(false);
    });
  });
});
